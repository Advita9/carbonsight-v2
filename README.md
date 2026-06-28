# CarbonSight v2

**Carbon-aware AI orchestration platform.** CarbonSight makes every LLM request measurable, optimizable, and sustainable — routing prompts to the most energy-efficient model, caching semantically similar responses, and tracking avoided CO₂ in real time.

Built for the enterprise. No greenwashing — every figure is grounded in per-request energy coefficients and regional emission factors.

---

## What it does

Every prompt sent through CarbonSight passes through a five-stage lifecycle:

```
User input
  → (optional) Prompt Coach      — clarity + redundancy analysis, energy estimate
  → (optional) R-EcoWrite        — rewrites prompt to minimum tokens, same meaning
  → (optional) Eco-Plan          — generates step-by-step execution plan
  → Semantic cache check         — serves cached response if similarity ≥ 0.45 (zero energy)
  → Deterministic routing        — selects micro / lite / pro model, no LLM call needed
  → LLM inference                — only if cache misses
  → Carbon ledger write          — CO₂ used, CO₂ saved, baseline delta recorded
```

---

## Features

| Feature | Description |
|---|---|
| **Deterministic routing** | Classifies prompt complexity via token length, linguistic signals, structure cues, and pro-domain boost patterns. Zero LLM calls on the routing path. |
| **Semantic cache** | ChromaDB vector cache. Cache hits cost zero energy and zero CO₂. 70–80% hit rate in practice. |
| **R-EcoWrite** | Rewrites verbose prompts to their minimal semantic equivalent before sending to the model. Shows token savings and CO₂ delta in UI. |
| **Prompt Coach** | Pre-send analysis of clarity, redundancy, and estimated energy cost. Advisory only — no inference triggered. |
| **Eco-Plan** | Generates a structured execution plan for complex queries. Improves output quality and caps token usage. |
| **Carbon ledger** | Every request logged with CO₂ used, CO₂ saved, Pro-counterfactual baseline, tier, complexity score, and timestamps. |
| **ESG reporting** | Admin dashboard shows Scope 2 proxy breakdown (baseline vs actual vs avoided). One-click CSV export dated and audit-ready. |
| **Analytics dashboards** | User, Team, and Admin views. Real data from SQLite — cache hit rate, tier distribution, daily CO₂ trend, efficiency score, badges. |
| **Cache-hit avoidance tracking** | Cache hits log full Pro-baseline CO₂ as avoided emissions — not zero — giving accurate total avoidance figures. |

---

## Tech stack

### Backend
- **FastAPI** + Uvicorn (Python 3.14)
- **SQLite** — analytics ledger (`carbonsight.db`)
- **ChromaDB** — local persistent vector cache

### LLM layer
| Tier | Model | Use case |
|---|---|---|
| micro | `gpt-4.1-nano` | Simple factual, short responses |
| lite | `gpt-4.1-mini` | Explanation, reasoning, moderate complexity |
| pro | `gpt-5` | Architecture, research, multi-step tasks |

### Embeddings
- `text-embedding-3-small` (OpenAI) via `embedding_service.py`

### Frontend
- **React** + Vite + TailwindCSS
- **Recharts** — model usage pie
- **Chart.js** — CO₂ trend line
- React Router — `/`, `/dashboard`, `/team`, `/admin`

---

## Architecture

```
carbonsight-v2/
├── backend/
│   ├── agents/
│   │   ├── routing_agent.py       # deterministic classifier + energy estimator
│   │   ├── coach_agent.py         # prompt quality analysis
│   │   ├── eco_plan_agent.py      # execution plan generator
│   │   ├── eco_rewrite_agent.py   # R-EcoWrite prompt optimizer
│   │   ├── embedding_agent.py     # embedding + cache lookup
│   │   └── carbon_agent.py        # CO₂ coefficients + emission factors
│   ├── services/
│   │   ├── llm_service.py         # model dispatch (nano/mini/gpt-5)
│   │   └── embedding_service.py   # OpenAI embeddings
│   ├── cache/
│   │   └── vector_cache.py        # ChromaDB read/write
│   ├── analytics/
│   │   ├── db.py                  # SQLite connection
│   │   ├── logger.py              # per-request event writer
│   │   └── metrics.py             # aggregation queries + daily trend
│   └── main.py                    # FastAPI routes
└── frontend-v2/
    ├── src/
    │   ├── App.jsx                # chat UI
    │   ├── components/            # Navbar, Sidebar, CarbonTooltip, etc.
    │   ├── dashboards/            # UserDashboard, TeamDashboard, AdminDashboard
    │   └── charts/                # CarbonTrendChart, ModelUsagePie, EfficiencyGauge
```

---

## Carbon accounting methodology

- **Energy coefficients**: Wh per 1k input/output tokens per model tier (output ≈ 4× input cost)
- **Emission factor**: 0.475 gCO₂/Wh (default); regional AWS factors available
- **Baseline**: All-Pro counterfactual — what the request would have cost with no routing or caching
- **Avoided emissions** = baseline CO₂ − actual CO₂ (routing savings + full cache avoidance)
- **ESG framing**: Scope 2 proxy (purchased compute energy × emission factor)

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/ask` | Main chat — routes, caches, infers, logs |
| POST | `/coach` | Prompt quality analysis |
| POST | `/optimize` | R-EcoWrite prompt rewrite |
| POST | `/plan` | Eco-Plan step generator |
| GET | `/analytics` | Full summary — totals, tier breakdown, daily trend |
| GET | `/health` | Service health check |

---

## Roadmap

- [ ] Navbar dashboard links
- [ ] Burst detector — sliding window peak interval detection + swap nudge
- [ ] Model leaderboard — energy efficiency benchmarks across tiers
- [ ] Org auth layer — Cognito / JWT, multi-tenant attribution
- [ ] GreenAI incentive layer — on-chain attestations, swap rewards, ESG certificate NFT

---

## Built with

Original prototype built at an AWS-sponsored Generative AI hackathon using Amazon Bedrock, Lambda, and DynamoDB. v2 migrated to a fully local, provider-agnostic stack with OpenAI models and FastAPI.