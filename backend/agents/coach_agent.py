import json
from services.llm_service import generate_response

def analyze_prompt(prompt: str):
    """
    Analyze the user's prompt for clarity, redundancy, and predicted carbon cost.
    Uses nova-micro for cheap inference.
    """

    system_prompt = (
        "You are a prompt-quality evaluator. "
        "Analyze the user's prompt and return STRICT JSON ONLY in this format:\n"
        "{"
        "\"clarity\": number 0-100, "
        "\"advice\": string"
        "}\n"
        "Rules:\n"
        "- Clarity reflects how easy it is for an AI to understand.\n"
        "- Advice must be a single short sentence.\n"
        "- NO explanation outside the JSON."
    )

    llm_input = f"{system_prompt}\n\nUser Prompt:\n{prompt}"

    try:
        raw = generate_response(
            tier="micro",
            prompt=llm_input,
            max_tokens=100
        )
        parsed = json.loads(raw)
    except:
        parsed = {
            "clarity": 55,
            "advice": "Try simplifying your wording."
        }

    # Additional lightweight heuristics
    words = prompt.split()
    tokens = len(words)
    redundancy = sum(prompt.lower().count(w) for w in ["very", "extremely", "really"])

    # Estimate carbon
    estimated_kwh = tokens * 0.00000002  # tiny factor
    estimated_co2 = estimated_kwh * 0.475

    return {
        "clarity": parsed["clarity"],
        "advice": parsed["advice"],
        "redundancy": redundancy,
        "estimated_tokens": tokens,
        "estimated_energy_kwh": estimated_kwh,
        "estimated_co2_kg": estimated_co2
    }