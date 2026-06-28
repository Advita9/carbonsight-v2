import math

# ---------- MODEL ENERGY PROFILES (fictional but realistic for prototype) ----------

MODEL_PROFILES = {
    "amazon.nova-micro-v1:0":   {"tokens_per_kwh": 1_200_000, "co2_per_kwh": 0.35},
    "amazon.nova-2-lite-v1:0":  {"tokens_per_kwh": 900_000,  "co2_per_kwh": 0.35},
    "amazon.nova-lite-v1:0":    {"tokens_per_kwh": 600_000,  "co2_per_kwh": 0.35},
    "amazon.nova-pro-v1:0":     {"tokens_per_kwh": 250_000,  "co2_per_kwh": 0.35},
}

CARBON_MULTIPLIER = 1.0  # scaling factor if needed
DEFAULT_KWH_PER_TOKEN = 1 / 900_000


# -------------------------------------------------------------------
# 1. Predict energy cost BEFORE calling the model
# -------------------------------------------------------------------
def predict_energy_cost(model_id: str, predicted_tokens: int):
    
    profile = MODEL_PROFILES.get(model_id)

    if not profile:
        # fallback for safety
        kwh = predicted_tokens * DEFAULT_KWH_PER_TOKEN
        return {
            "predicted_kwh": kwh,
            "predicted_co2": kwh * 0.35,
            "efficiency_score": 1000 / predicted_tokens
        }

    tokens_per_kwh = profile["tokens_per_kwh"]

    kwh_used = predicted_tokens / tokens_per_kwh
    co2_emitted = kwh_used * profile["co2_per_kwh"]

    # lower kWh = better score
    efficiency_score = 1 / (kwh_used + 1e-9)

    return {
        "predicted_kwh": kwh_used,
        "predicted_co2": co2_emitted,
        "efficiency_score": efficiency_score
    }


# -------------------------------------------------------------------
# 2. Actual energy cost AFTER inference
# -------------------------------------------------------------------
def compute_actual_energy(model_id: str, output_tokens: int):
    return predict_energy_cost(model_id, output_tokens)


# -------------------------------------------------------------------
# 3. Should we downscale model choice?
# -------------------------------------------------------------------
def should_downgrade(predicted_kwh: float, threshold_kwh=0.0008):
    """
    Returns True if energy usage is too high → route to a smaller model.
    """
    return predicted_kwh > threshold_kwh