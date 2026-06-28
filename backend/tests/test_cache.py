from services.embedding_service import generate_embedding
from cache.vector_cache import (
    save_to_cache,
    find_similar_prompt
)

prompt = "What is Python?"

embedding = generate_embedding(prompt)

save_to_cache(
    prompt,
    embedding,
    "Python is a programming language.",
    "micro"
)

result = find_similar_prompt(
    generate_embedding(
        "Explain what Python programming language is"
    )
)

print(result)