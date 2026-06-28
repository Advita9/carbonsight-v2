from dataclasses import dataclass


@dataclass
class RoutingDecision:
    model_tier: str
    model_id: str
    token_budget: int
    complexity_score: float


def classify_complexity(prompt: str):

    words = len(prompt.split())

    score = 0

    if words < 10:
        score += 0.15
    elif words < 40:
        score += 0.40
    else:
        score += 0.75

    lower = prompt.lower()

    complex_keywords = [
        "design",
        "architecture",
        "analyze",
        "compare",
        "debug",
        "research",
        "strategy",
        "implementation",
        "system"
    ]

    if any(k in lower for k in complex_keywords):
        score += 0.20

    return min(score, 1.0)


def route(prompt: str):

    score = classify_complexity(prompt)

    if score <= 0.22:
        return RoutingDecision(
            "micro",
            "gpt-4.1-nano",
            512,
            score
        )

    if score <= 0.50:
        return RoutingDecision(
            "lite",
            "gpt-4.1-mini",
            1536,
            score
        )

    return RoutingDecision(
        "pro",
        "gpt-5",
        4096,
        score
    )