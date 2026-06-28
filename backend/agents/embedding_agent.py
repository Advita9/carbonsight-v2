# agents/embedding_agent.py

from services.embedding_service import generate_embedding
from cache.vector_cache import find_similar_prompt


def embedding_agent(prompt: str):
    """
    Generate embedding and check semantic cache.
    Returns the exact same schema the frontend/Lambda expects.
    """

    embedding = generate_embedding(prompt)

    cached = find_similar_prompt(embedding)

    if cached:
        return {
            "cached": True,
            "cachedFrom": "semantic-cache",
            "response": cached["response"],
            "modelUsed": cached["model"]
        }

    return {
        "cached": False,
        "embedding": embedding
    }