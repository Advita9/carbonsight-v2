from agents.embedding_agent import embedding_agent
from cache.vector_cache import save_to_cache
from services.embedding_service import generate_embedding

prompt = "What is Python?"

save_to_cache(
    prompt,
    generate_embedding(prompt),
    "Python is a programming language.",
    "micro"
)

result = embedding_agent(
    "Explain what Python programming language is"
)

print(result)