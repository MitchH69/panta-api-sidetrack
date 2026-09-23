# Panta API MVP — Build report

**Date:** 2026-09-22 (America/Edmonton)  
**Decision:** Mitchell GO — scaffold now; $0 read-only  
**Status:** MVP-ready (local demo with live Panta data)

## What was built

Self-contained app under `/workspace/panta-api/`:

| Piece | Path |
| --- | --- |
| Express read-only proxy + static UI | `server/index.js`, `public/` |
| Markets list / detail / positions / brief | `/api/markets`, `/api/markets/:id`, `/api/positions`, `/api/brief` |
| Attribution | “Powered by Panta” in header, panels, detail, footer |
| Docs | `README.md`, `DEMO.md`, this report |
| Scope tracker | `SCOPE.md` build status → MVP-ready |

**Not built (by design):** create market, primary buy, claims, trade report, wallet signing, USDC paths.

## How to run

```bash
cd /workspace/panta-api
npm install && npm run dev
```

→ http://localhost:5173  

Smoke: `npm run smoke` (expects server already running).

## Auth / keys (no secrets in this file)

1. Unauthenticated catalog → `401` (key required).
2. Registered team email account on Panta (`POST /auth/register/`) — **no OTP**.
3. Minted `pk_test_…` (sandbox fixtures only) then `pk_live_…` (real catalog).
4. Key stored mode `600` at `/home/box/agent-data/secrets/panta-api-key.json` and mirrored in local `.env` (gitignored). Server prefers secrets file.

## Live data verification

- `GET /markets/?limit=…` with live key returns paginated real catalog (sports/crypto/politics/…).
- List rows often have **empty `title`**; detail `GET /markets/{id}/` fills `title` / `question` and prices — UI + `/api/brief` enrich accordingly.
- Categories + positions endpoints succeed (default wallet currently `0` positions — lookup still works).
- Local smoke: health OK, markets > 0, brief summary generated, positions JSON OK.

## Blockers

| Item | Severity | Notes |
| --- | --- | --- |
| Earn `HUMAN_ONLY` submit | Critical for prize | Human must submit on Earn + Colosseum; Agent API cannot. |
| Colosseum registration + project page | Critical for eligibility | Still required before dual submit. |
| Public GitHub + Loom | High for form | Not published in this pass — next human packaging step. |
| OTP | None | Register returned JWTs immediately. |

## Next step (HUMAN_ONLY)

1. Confirm Earn talent login (Mitcx / alternate) + Colosseum World's Fair registration.
2. Push this tree to a **public GitHub** repo (exclude `.env`; keep README / DEMO).
3. Record Loom using `DEMO.md`.
4. Create Colosseum project page → fill Earn sidetrack form with GitHub + Loom + Colosseum links.
5. Optional polish: host on Vercel/Fly with server-side key; deepen agent Q&A; still no trading unless funded later.

## Effort note

Scaffold + live key + demable UI completed in one session per Mitchell GO; dust rails remain higher priority for parent capacity.
