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


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    prompt: str
    plan: list | None = None


class PromptRequest(BaseModel):
    prompt: str

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

    emb_result = embedding_agent(prompt)

    decision = route(prompt)

    if emb_result["cached"]:

        log_routing_event({
            "cached": True,
            # new cache tier added 
            "tier": "cache",
            "complexity": decision.complexity_score,
            "input_tokens": decision.signals.token_count,
            "token_budget": decision.token_budget,
            "co2_kg": 0,
            "co2_saved_kg": decision.energy.co2_kg
        })



        return {
            "response": emb_result["response"],
            "modelUsed": emb_result["modelUsed"],
            "cached": True,
            "carbon": {
                "predicted_kwh": 0,
                "actual_kwh": 0,
                "predicted_co2": 0,
                "actual_co2": 0,
                "saved_kwh": decision.energy.wh_used / 1000,
                "saved_co2": decision.energy.co2_kg
            }
        }

    # Route
    decision = route(prompt)


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
        "co2_saved_kg": decision.energy.co2_saved_kg
    })

    save_to_cache(
        prompt,
        emb_result["embedding"],
        response,
        decision.model_tier.value
    )
    # redundant 
    # words = len(response.split())
    # carbon_estimate = words * 0.00000002
    # co2_estimate = carbon_estimate * 0.475

    return {
        "response": response,
        "modelUsed": decision.model_tier.value,
        "cached": False,
        "complexity": decision.complexity_score,
        "carbon": {
            "predicted_kwh": decision.energy.wh_used / 1000,
            "actual_kwh": decision.energy.wh_used / 1000,
            "predicted_co2": decision.energy.co2_kg,
            "actual_co2": decision.energy.co2_kg
        },
        "routing": {
            "tier": decision.model_tier.value,
            "score": decision.complexity_score,
            "token_budget": decision.token_budget,
            "signals": {
                "tokens": decision.signals.token_count,
                "linguistic": decision.signals.linguistic_score,
                "structure": decision.signals.structure_score,
                "pro_boost": decision.signals.pro_boost
            }
        }
    }


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