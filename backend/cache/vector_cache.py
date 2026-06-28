import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="prompt_cache"
)


SIMILARITY_THRESHOLD = 0.45


def save_to_cache(
    prompt,
    embedding,
    response,
    model
):

    collection.add(
        documents=[prompt],
        embeddings=[embedding],
        metadatas=[{
            "response": response,
            "model": model
        }],
        ids=[str(abs(hash(prompt)))]
    )


def find_similar_prompt(query_embedding):

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=1
    )

    if not results["ids"][0]:
        return None

    distance = results["distances"][0][0]

    similarity = 1 - distance

    print("Distance:", distance)
    print("Similarity:", similarity)
    print(results)

    if similarity < SIMILARITY_THRESHOLD:
        return None

    metadata = results["metadatas"][0][0]

    return {
        "response": metadata["response"],
        "model": metadata["model"]
    }