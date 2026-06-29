from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from agents.coach_agent import analyze_prompt
from agents.eco_plan_agent import generate_plan
from agents.eco_rewrite_agent import optimize_prompt

from services.llm_service import generate_response
from services.embedding_service import generate_embedding

from agents.embedding_agent import embedding_agent
from agents.routing_agent import route

from cache.vector_cache import save_to_cache

# adding logging to /ask
from analytics.logger import log_routing_event
# adding an analyticcs endpoint
from analytics.metrics import get_summary


from collections import deque
from datetime import datetime, timedelta
import threading

from fastapi import Query

# In-memory sliding window per user
# Structure: { user_id: deque([timestamp, ...]) }
_burst_windows: dict[str, deque] = {}
_burst_lock = threading.Lock()

BURST_WINDOW_SECONDS = 300        # 5-minute window
BURST_THRESHOLD_MULTIPLIER = 1.5  # fire if current rate > 2.5× baseline
BURST_BASELINE_MIN_CALLS = 3      # need at least this many calls to have a baseline

# def _check_burst(user_id: str, model_tier: str) -> dict:
#     """
#     Sliding window burst detector.
#     Returns {"burst": bool, "swap_suggestion": str | None, "burst_score": float}
#     """
#     if not user_id:
#         return {"burst": False, "swap_suggestion": None, "burst_score": 0.0}

#     now = datetime.utcnow()
#     cutoff = now - timedelta(seconds=BURST_WINDOW_SECONDS)

#     with _burst_lock:
#         if user_id not in _burst_windows:
#             _burst_windows[user_id] = deque()

#         window = _burst_windows[user_id]

#         # Add current timestamp
#         window.append(now)

#         # Evict entries older than the window
#         while window and window[0] < cutoff:
#             window.popleft()

#         calls_in_window = len(window)

#     # Need enough history to establish a baseline
#     if calls_in_window < BURST_BASELINE_MIN_CALLS:
#         return {"burst": False, "swap_suggestion": None, "burst_score": 0.0, "calls_in_window": calls_in_window}

#     # Calls per minute in this window
#     current_rate = calls_in_window / (BURST_WINDOW_SECONDS / 60)

#     # Baseline = p75 approximation from window history
#     # Simple proxy: first half of window as "normal", second half as "now"
#     half = max(1, calls_in_window // 2)
#     baseline_rate = half / (BURST_WINDOW_SECONDS / 60 / 2)

#     burst_score = current_rate / baseline_rate if baseline_rate > 0 else 1.0

#     is_burst = burst_score >= BURST_THRESHOLD_MULTIPLIER and model_tier in ("lite", "pro")

#     suggestion = None
#     if is_burst:
#         if model_tier == "pro":
#             suggestion = f"High activity detected ({calls_in_window} calls in 5 min). Switch to Lite to save ~75% energy this session and earn swap rewards."
#         elif model_tier == "lite":
#             suggestion = f"High activity detected ({calls_in_window} calls in 5 min). Switch to Micro for simple queries to save ~70% energy and earn swap rewards."

#     return {
#         "burst": is_burst,
#         "swap_suggestion": suggestion,
#         "burst_score": round(burst_score, 2),
#         "calls_in_window": calls_in_window,
#     }

# Absolute thresholds — fire if user exceeds these rates within the window
BURST_CALLS_MICRO = 4    # 8+ calls in 5 min on micro → suggest staying on micro but be aware
BURST_CALLS_LITE  = 3   # 6+ calls in 5 min on lite  → suggest downgrade to micro
BURST_CALLS_PRO   = 2    # 4+ calls in 5 min on pro   → suggest downgrade to lite

def _check_burst(user_id: str, model_tier: str) -> dict:
    if not user_id:
        return {"burst": False, "swap_suggestion": None, "burst_score": 0.0, "calls_in_window": 0}

    now = datetime.utcnow()
    cutoff = now - timedelta(seconds=BURST_WINDOW_SECONDS)

    with _burst_lock:
        if user_id not in _burst_windows:
            _burst_windows[user_id] = deque()

        window = _burst_windows[user_id]
        window.append(now)

        while window and window[0] < cutoff:
            window.popleft()

        calls_in_window = len(window)

    # Threshold per tier
    thresholds = {
        "micro": BURST_CALLS_MICRO,
        "lite":  BURST_CALLS_LITE,
        "pro":   BURST_CALLS_PRO,
        "cache": BURST_CALLS_MICRO,
    }
    threshold = thresholds.get(model_tier, BURST_CALLS_MICRO)
    burst_score = round(calls_in_window / threshold, 2)
    is_burst = calls_in_window >= threshold

    suggestion = None
    if is_burst:
        if model_tier == "pro":
            suggestion = (
                f"High activity detected ({calls_in_window} Pro calls in 5 min). "
                f"Switch to Lite to save ~75% energy this session and earn swap rewards."
            )
        elif model_tier == "lite":
            suggestion = (
                f"High activity detected ({calls_in_window} Lite calls in 5 min). "
                f"Switch to Micro for simple queries to save ~70% energy and earn swap rewards."
            )
        else:
            suggestion = (
                f"High activity detected ({calls_in_window} calls in 5 min). "
                f"Consider batching queries or using the semantic cache to reduce energy usage."
            )

    return {
        "burst": is_burst,
        "swap_suggestion": suggestion,
        "burst_score": burst_score,
        "calls_in_window": calls_in_window,
    }


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# class AskRequest(BaseModel):
#     prompt: str
#     plan: list | None = None

class AskRequest(BaseModel):
    prompt: str
    plan: list | None = None
    org_id: str = ""
    team_id: str = ""
    user_id: str = ""
    session_id: str = ""


class PromptRequest(BaseModel):
    prompt: str

# @app.post("/ask")
# def ask(req: AskRequest):

#     prompt = req.prompt

#     if req.plan:
#         prompt = (
#             "Follow this execution plan:\n\n"
#             + "\n".join(req.plan)
#             + "\n\nUser Request:\n"
#             + prompt
#         )

#     emb_result = embedding_agent(prompt)

#     decision = route(prompt)

#     if emb_result["cached"]:
#         saved_kwh = decision.energy.wh_used / 1000
#         saved_co2 = decision.energy.co2_kg

#         log_routing_event({
#             "cached": True,
#             # new cache tier added 
#             "tier": "cache",
#             "complexity": decision.complexity_score,
#             "input_tokens": decision.signals.token_count,
#             "token_budget": decision.token_budget,
#             "co2_kg": 0,
#             "co2_saved_kg": saved_co2
#         })


#         return {
#             "response": emb_result["response"],
#             "modelUsed": emb_result["modelUsed"],
#             "cached": True,
#             "carbon": {
#                 "predicted_kwh": saved_kwh,
#                 "actual_kwh": 0,
#                 "predicted_co2": saved_co2,
#                 "actual_co2": 0,

#             }
#         }

#     # Route
#     decision = route(prompt)


#     response = generate_response(
#         tier=decision.model_tier.value,
#         prompt=prompt,
#         max_tokens=decision.token_budget
#     )

#     log_routing_event({
#         "cached": False,
#         "tier": decision.model_tier.value,
#         "complexity": decision.complexity_score,
#         "input_tokens": decision.signals.token_count,
#         "token_budget": decision.token_budget,
#         "co2_kg": decision.energy.co2_kg,
#         "co2_saved_kg": decision.energy.co2_saved_kg
#     })

#     save_to_cache(
#         prompt,
#         emb_result["embedding"],
#         response,
#         decision.model_tier.value
#     )
#     # redundant 
#     # words = len(response.split())
#     # carbon_estimate = words * 0.00000002
#     # co2_estimate = carbon_estimate * 0.475

#     return {
#         "response": response,
#         "modelUsed": decision.model_tier.value,
#         "cached": False,
#         "complexity": decision.complexity_score,
#         "carbon": {
#             "predicted_kwh": decision.energy.wh_used / 1000,
#             "actual_kwh": decision.energy.wh_used / 1000,
#             "predicted_co2": decision.energy.co2_kg,
#             "actual_co2": decision.energy.co2_kg
#         },
#         "routing": {
#             "tier": decision.model_tier.value,
#             "score": decision.complexity_score,
#             "token_budget": decision.token_budget,
#             "signals": {
#                 "tokens": decision.signals.token_count,
#                 "linguistic": decision.signals.linguistic_score,
#                 "structure": decision.signals.structure_score,
#                 "pro_boost": decision.signals.pro_boost
#             }
#         }
#     }

@app.post("/ask")
def ask(req: AskRequest):
    prompt = req.prompt

    if req.plan:
        prompt = (
            "Follow this execution plan:\n\n"
            + "\n".join(req.plan)
            + "\n\nUser Request:\n"
            + prompt
        )

    # Run both once, upfront
    emb_result = embedding_agent(prompt)
    decision = route(prompt)
    # Burst detection
    burst_info = _check_burst(req.user_id, decision.model_tier.value)

    if emb_result["cached"]:
        log_routing_event({
            "cached": True,
            "tier": "cache",
            "complexity": decision.complexity_score,
            "input_tokens": decision.signals.token_count,
            "token_budget": decision.token_budget,
            "co2_kg": 0.0,
            "co2_saved_kg": decision.energy.co2_baseline_kg,  # true avoidance
            "baseline_co2_kg": decision.energy.co2_baseline_kg,
            "org_id": req.org_id,
            "team_id": req.team_id,
            "user_id": req.user_id,
            "session_id": req.session_id,
        })
        return {
            "response": emb_result["response"],
            "modelUsed": emb_result["modelUsed"],
            "cached": True,
            "carbon": {
                "predicted_kwh": decision.energy.wh_baseline / 1000,
                "actual_kwh": 0,
                "predicted_co2": decision.energy.co2_baseline_kg,
                "actual_co2": 0,
            },
            "burst": burst_info,
        }

    response = generate_response(
        tier=decision.model_tier.value,
        prompt=prompt,
        max_tokens=decision.token_budget
    )

    log_routing_event({
        "cached": False,
        "tier": decision.model_tier.value,
        "complexity": decision.complexity_score,
        "input_tokens": decision.signals.token_count,
        "token_budget": decision.token_budget,
        "co2_kg": decision.energy.co2_kg,
        "co2_saved_kg": decision.energy.co2_saved_kg,
        "baseline_co2_kg": decision.energy.co2_baseline_kg,
        "org_id": req.org_id,
        "team_id": req.team_id,
        "user_id": req.user_id,
        "session_id": req.session_id,
    })

    save_to_cache(prompt, emb_result["embedding"], response, decision.model_tier.value)
    

    return {
        "response": response,
        "modelUsed": decision.model_tier.value,
        "cached": False,
        "complexity": decision.complexity_score,
        "carbon": {
            "predicted_kwh": decision.energy.wh_used / 1000,
            "actual_kwh": decision.energy.wh_used / 1000,
            "predicted_co2": decision.energy.co2_kg,
            "actual_co2": decision.energy.co2_kg,
        },
        "routing": {
            "tier": decision.model_tier.value,
            "score": decision.complexity_score,
            "token_budget": decision.token_budget,
            "signals": {
                "tokens": decision.signals.token_count,
                "linguistic": decision.signals.linguistic_score,
                "structure": decision.signals.structure_score,
                "pro_boost": decision.signals.pro_boost,
            }
        },
        "burst": burst_info,
    }
@app.post("/burst/reset")
def burst_reset(user_id: str = Query(default="demo-user")):
    with _burst_lock:
        if user_id in _burst_windows:
            del _burst_windows[user_id]
    return {"reset": True, "user_id": user_id}

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/coach")
def coach(req: PromptRequest):
    return analyze_prompt(req.prompt)


@app.post("/plan")
def plan(req: PromptRequest):

    steps = generate_plan(req.prompt)

    return {
        "plan": steps,
        "steps": len(steps)
    }


@app.post("/optimize")
def optimize(req: PromptRequest):

    optimized, savings_kwh, savings_co2 = optimize_prompt(req.prompt)

    return {
        "original": req.prompt,
        "optimized": optimized,
        "energy_savings_kwh": savings_kwh,
        "co2_savings_kg": savings_co2
    }

@app.get("/analytics")
def analytics():

    return get_summary()


