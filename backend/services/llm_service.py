import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

MODEL_MAP = {
    "micro": "gpt-4.1-nano",
    "lite": "gpt-4.1-mini",
    "pro": "gpt-5"
}

def get_model_name(tier: str):
    return MODEL_MAP.get(tier, "gpt-4.1-mini")

def generate_response(
    tier: str,
    prompt: str,
    max_tokens: int = 300
):

    model = MODEL_MAP[tier]

    response = client.responses.create(
        model=model,
        input=prompt,
        max_output_tokens=max_tokens
    )

    return response.output_text