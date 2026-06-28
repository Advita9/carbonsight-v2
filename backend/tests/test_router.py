from agents.routing_agent import route

tests = [
    "What is Python?",
    "Explain transformers",
    "Explain transformers step by step",
    "Debug this Python function",
    "Compare REST and GraphQL",
    "Write a full research paper on LLM routing",
    "Design a distributed payments architecture",
    "Create a complete microservice architecture for a fintech platform",
]

for t in tests:

    d = route(t)

    print(
        "\nPrompt:",
        t
    )

    print(
        "Tier:",
        d.model_tier.value
    )

    print(
        "Score:",
        round(d.complexity_score, 3)
    )

    print(
        "CO2:",
        d.energy.co2_kg
    )

    print(
        d.signals.linguistic_score,
        d.signals.structure_score,
        d.signals.pro_boost,
        d.signals.token_count
    )