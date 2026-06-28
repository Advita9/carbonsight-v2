from services.llm_service import generate_response
from services.embedding_service import generate_embedding

print(
    generate_response(
        "micro",
        "What is Python?"
    )
)

emb = generate_embedding("hello")

print(len(emb))