# Sol × Panta — Market Intelligence (read-only MVP)

Lean local dashboard that pulls **live** Panta prediction-market data and adds a thin rule-based analytics brief.

**Powered by Panta** — attribution shown in the UI wherever Panta data appears.

## Guardrails

- **Read-only only:** markets, prices, positions, analytics brief
- **No** create market, buy/trade, claim, or USDC spend paths
- API key stays on the server (never shipped to the browser)

## Prerequisites

- Node.js 18+
- A Panta API key (`pk_live_…` recommended for real catalog; `pk_test_…` is sandbox fixtures)

## Setup

```bash
cd panta-api
cp .env.example .env
# Put your key in .env as PANTA_API_KEY=pk_live_…
# On this box, the server also auto-loads /home/box/agent-data/secrets/panta-api-key.json
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Env vars

| Var | Meaning |
| --- | --- |
| `PANTA_API_KEY` | `X-Api-Key` for `https://live-api.panta.market/api/v1` |
| `PANTA_API_BASE` | Default `https://live-api.panta.market/api/v1` |
| `DEFAULT_WALLET` | Prefills positions lookup |
| `PORT` | Default `5173` |

## What it does

1. **Live markets** — `GET /markets/` (category + phase filters, pagination)
2. **Market detail / prices** — `GET /markets/{id}/` (titles often only appear on detail)
3. **Positions** — `GET /positions/?wallet=` (default Solana wallet editable)
4. **AI/analytics brief** — rule-based category mix, top volume, price-skew movers, natural-language pulse (no paid LLM)

Local routes (proxy; key never exposed):

- `GET /api/health`
- `GET /api/categories`
- `GET /api/markets`
- `GET /api/markets/:id`
- `GET /api/positions?wallet=`
- `GET /api/brief`

## Scripts

```bash
npm run dev     # start server + static UI
npm start       # same (production-ish)
npm run smoke   # health / markets / brief / positions against localhost
```

## Demo

See [DEMO.md](./DEMO.md) for a click-path suitable for Loom.

## Docs / attribution

- Panta docs: https://docs.panta.market/
- Playground reference: https://github.com/Kaito-HQ/panta-api-playground
- Must display **Powered by Panta** (API Terms)

## Out of scope (intentionally)

Create market, primary buy, claims, trade reporting, wallet signing, USDC funding.
