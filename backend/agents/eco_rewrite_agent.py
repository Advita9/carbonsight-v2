from services.llm_service import generate_response
from agents.carbon_agent import predict_energy_cost

def optimize_prompt(prompt: str):
    """
    Uses amazon.nova-micro-v1:0 to rewrite a user prompt
    into a more concise + carbon-efficient version.
    Returns: rewritten_prompt, energy_savings_kwh, co2_savings_kg
    """

    system_prompt = (
        "Rewrite the user's prompt so it requires fewer tokens for any LLM to process.\n"
        "Rules:\n"
        "- Preserve meaning EXACTLY.\n"
        "- Make it as short and direct as possible.\n"
        "- Remove filler words.\n"
        "- Do NOT add explanation.\n"
        "- Do NOT expand the request.\n"
        "Return ONLY the rewritten prompt, nothing else.\n"
    )

    rewrite_payload = f"{system_prompt}\n\nUser Prompt:\n{prompt}"

    optimized_prompt = generate_response(
        tier="lite",
        prompt=rewrite_payload,
        max_tokens=150
    )


    # Safety fallback
    if not optimized_prompt:
        return prompt, 0, 0

    # Compute carbon savings
    original_tokens = len(prompt.split())
    optimized_tokens = len(optimized_prompt.split())

    original_cost = predict_energy_cost("amazon.nova-lite-v1:0", original_tokens)
    optimized_cost = predict_energy_cost("amazon.nova-lite-v1:0", optimized_tokens)

    savings_kwh = max(0, original_cost["predicted_kwh"] - optimized_cost["predicted_kwh"])
    savings_co2 = max(0, original_cost["predicted_co2"] - optimized_cost["predicted_co2"])

    return optimized_prompt.strip(), savings_kwh, savings_co2