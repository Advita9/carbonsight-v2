# v2 router for testing: not deterministic (used model inferencing calls)
# from dataclasses import dataclass


# @dataclass
# class RoutingDecision:
#     model_tier: str
#     model_id: str
#     token_budget: int
#     complexity_score: float


# def classify_complexity(prompt: str):

#     words = len(prompt.split())

#     score = 0

#     if words < 10:
#         score += 0.15
#     elif words < 40:
#         score += 0.40
#     else:
#         score += 0.75

#     lower = prompt.lower()

#     complex_keywords = [
#         "design",
#         "architecture",
#         "analyze",
#         "compare",
#         "debug",
#         "research",
#         "strategy",
#         "implementation",
#         "system"
#     ]

#     if any(k in lower for k in complex_keywords):
#         score += 0.20

#     return min(score, 1.0)


# def route(prompt: str):

#     score = classify_complexity(prompt)

#     if score <= 0.22:
#         return RoutingDecision(
#             "micro",
#             "gpt-4.1-nano",
#             512,
#             score
#         )

#     if score <= 0.50:
#         return RoutingDecision(
#             "lite",
#             "gpt-4.1-mini",
#             1536,
#             score
#         )

#     return RoutingDecision(
#         "pro",
#         "gpt-5",
#         4096,
#         score
#     )


# v2 : deterministic routing agent

from __future__ import annotations

import re
from enum import Enum
from dataclasses import dataclass

# MODEL TIERS

class ModelTier(str, Enum):
    MICRO = "micro"
    LITE = "lite"
    PRO = "pro"


MODEL_IDS = {
    "micro": "gpt-4.1-nano",
    "lite": "gpt-4.1-mini",
    "pro": "gpt-5"
}


# ENERGY COEFFICIENTS
# Relative values only


ENERGY_COEFFICIENTS = {
    "micro": {
        "input_wh_per_1k": 0.001,
        "output_wh_per_1k": 0.004
    },
    "lite": {
        "input_wh_per_1k": 0.004,
        "output_wh_per_1k": 0.016
    },
    "pro": {
        "input_wh_per_1k": 0.018,
        "output_wh_per_1k": 0.072
    }
}

BASELINE_MODEL = "pro"

DEFAULT_EMISSION_FACTOR = 0.475


# DATA MODELS

@dataclass
class ComplexitySignals:
    token_count: int
    linguistic_score: float
    structure_score: float
    pro_boost: float
    weighted_score: float


@dataclass
class EnergyEstimate:
    input_tokens: int
    output_tokens_estimate: int

    wh_used: float
    wh_saved: float

    co2_kg: float
    co2_saved_kg: float


@dataclass
class RoutingDecision:
    model_tier: ModelTier
    model_id: str

    token_budget: int

    complexity_score: float

    signals: ComplexitySignals
    energy: EnergyEstimate


# COMPLEXITY PATTERNS

_HIGH_COMPLEXITY = [
    "analyze",
    "compare",
    "evaluate",
    "debug",
    "design",
    "architect",
    "research",
    "optimize",
    "strategy",
    "implementation",
    "reason",
]

_LOW_COMPLEXITY = [
    "what is",
    "who is",
    "when is",
    "where is",
    "define",
    "list",
    "hello",
    "hi",
    "thanks",
]

_PRO_PATTERNS = [
    r"research paper",
    r"technical report",
    r"migration strategy",
    r"architecture",
    r"microservice",
    r"distributed system",
    r"unit tests",
    r"with code",
    r"enterprise",
]

_PRO_RE = [
    re.compile(p, re.IGNORECASE)
    for p in _PRO_PATTERNS
]


# HELPERS

def estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)


# def linguistic_score(text: str):

#     lower = text.lower().strip()

#     for pattern in _LOW_COMPLEXITY:
#         if lower.startswith(pattern):
#             return 0.0

#     for keyword in _HIGH_COMPLEXITY:
#         if keyword in lower:
#             return 0.55

#     return 0.15

# new version to include reasoning words to trigger lite
def linguistic_score(text: str):

    lower = text.lower().strip()

    for pattern in _LOW_COMPLEXITY:
        if lower.startswith(pattern):
            return 0.0

    reasoning_verbs = [
        "explain",
        "compare",
        "analyze",
        "analyse",
        "debug",
        "design",
        "architect",
        "evaluate",
        "research",
        "optimize",
        "implement"
    ]

    for verb in reasoning_verbs:
        if lower.startswith(verb):
            return 0.70

    return 0.15

def structure_score(text: str):

    score = 0

    if "\n" in text:
        score += 0.1

    if "?" in text:
        score += 0.05

    if "```" in text:
        score += 0.3

    return min(score, 0.4)


def pro_boost(text: str):

    hits = 0

    for pattern in _PRO_RE:
        if pattern.search(text):
            hits += 1

    # return min(hits * 0.15, 0.45)
    return min(hits * 0.25, 0.50)


# COMPLEXITY CLASSIFIER

def classify_complexity(prompt: str):

    tc = estimate_tokens(prompt)

    ling = linguistic_score(prompt)

    struct = structure_score(prompt)

    boost = pro_boost(prompt)

    if tc < 20:
        token_component = 0.0
    elif tc < 60:
        token_component = 0.15
    elif tc < 150:
        token_component = 0.35
    else:
        token_component = 0.60

    weighted = (
        ling * 0.50
        + token_component * 0.22
        + struct * 0.10
        + boost
    )

    weighted = max(0.0, min(weighted, 1.0))
    if ling >= 0.55:
        weighted = max(weighted, 0.30)

    return ComplexitySignals(
        token_count=tc,
        linguistic_score=ling,
        structure_score=struct,
        pro_boost=boost,
        weighted_score=weighted
    )


# TIER SELECTION

def select_tier(score: float):

    if score <= 0.22:
        return ModelTier.MICRO

    if score <= 0.50:
        return ModelTier.LITE

    return ModelTier.PRO


def token_budget(tier: ModelTier):

    return {
        ModelTier.MICRO: 512,
        ModelTier.LITE: 1536,
        ModelTier.PRO: 4096
    }[tier]


# ENERGY ESTIMATION

def estimate_energy(
    input_tokens: int,
    model_tier: str,
    output_tokens_estimate=None
):

    if output_tokens_estimate is None:
        output_tokens_estimate = input_tokens * 2

    coeff = ENERGY_COEFFICIENTS[model_tier]
    baseline = ENERGY_COEFFICIENTS[BASELINE_MODEL]

    def wh(c):

        return (
            c["input_wh_per_1k"] * input_tokens / 1000
            +
            c["output_wh_per_1k"] * output_tokens_estimate / 1000
        )

    wh_used = wh(coeff)

    wh_baseline = wh(baseline)

    wh_saved = max(
        0,
        wh_baseline - wh_used
    )

    co2 = wh_used * DEFAULT_EMISSION_FACTOR / 1000

    co2_saved = (
        wh_saved * DEFAULT_EMISSION_FACTOR / 1000
    )

    return EnergyEstimate(
        input_tokens=input_tokens,
        output_tokens_estimate=output_tokens_estimate,
        wh_used=wh_used,
        wh_saved=wh_saved,
        co2_kg=co2,
        co2_saved_kg=co2_saved
    )


# MAIN ROUTER

def route(prompt: str):

    signals = classify_complexity(prompt)

    tier = select_tier(
        signals.weighted_score
    )

    energy = estimate_energy(
        signals.token_count,
        tier.value
    )

    return RoutingDecision(
        model_tier=tier,
        model_id=MODEL_IDS[tier.value],
        token_budget=token_budget(tier),
        complexity_score=signals.weighted_score,
        signals=signals,
        energy=energy
    )