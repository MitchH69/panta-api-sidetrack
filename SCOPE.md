# Panta API Sidetrack — Scope for Sol (crypto accumulation agent)

**Listing:** [Colosseum Crypto World's Fair | Panta API Sidetrack](https://superteam.fun/earn/listing/panta-api-side-track)  
**Sponsor:** Panta (pantahq) · POC Telegram: https://t.me/toria_dickson  
**Status (researched 2026-09-22 ~23:30 MDT):** OPEN · type `hackathon` · region Global  
**Build status:** MVP-ready (2026-09-22 ~23:45 MDT) — local read-only demo with live Panta data; see BUILD-REPORT.md. Earn/Colosseum submit still HUMAN_ONLY.  
**Deadline (Earn):** 2026-10-13 00:59 MDT (`2026-10-13T06:59:00.000Z`)  
**Colosseum official due:** 2026-10-12 23:59 PT (= 2026-10-13 00:59 MDT)  
**Winner announce (Earn UI):** by 2026-10-27  
**Prize pool:** 5,000 USDG fixed — 1st 2,000 · 2nd 1,000 · 3rd 1,000 · 4th 1,000  
**Listing ID:** `4c3b4256-ea0c-4b52-8433-12618e4f66c9`  
**agentAccess:** `HUMAN_ONLY` (Earn Agent API cannot submit)

**Research only.** No signup, submit, spend, or crypto send was performed for this scope.

---

## 1. What the listing asks for

### Product intent
Build a **working demo / compelling prototype** that **meaningfully integrates the Panta API** so prediction markets power a product *beyond* a plain Panta UI clone. Explicitly encouraged verticals:

- Trading & analytics (terminals, dashboards, discovery)
- Sports / events / social prediction
- **AI + prediction markets** (market data in an agent UX) ← natural fit for Sol
- Creator/community tools, existing-product integration, novel experiences

### Panta API surface (docs)
- Docs: https://docs.panta.market/  
- Playground: https://github.com/Kaito-HQ/panta-api-playground · live demo https://panta-api-playground.vercel.app  
- Base: `https://live-api.panta.market/api/v1` (trailing slashes required)  
- Auth: free email register → JWT → mint `pk_test_…` / `pk_live_…` (`X-Api-Key`)  
- Custody model: API returns **unsigned** Solana txs; user wallet signs; app broadcasts; then report to Panta  
- **Read paths (no USDC):** list/get markets, categories, market/wallet trades, positions by wallet  
- **Write paths (need USDC + wallet):** create market ($20–50 creation fee on product side), primary buy YES/NO, claim winnings / creator fees  

Listing text explicitly lists discovery, prices/data, create, buy, positions, claims — so **read-only analytics/AI is in-scope** as “Trading & Analytics” / “AI + Prediction Markets,” provided Panta is clearly integrated and demoed.

### Eligibility (must all be true)
1. Register for official **Colosseum Crypto World's Fair**  
2. Submit project on **Colosseum** platform  
3. Meet Colosseum eligibility (every team member registers individually before deadline)  
4. Submit **same** project to this Earn sidetrack  
5. Meaningfully integrate Panta API  
6. Provide a **working demonstration**  
7. English  

Sidetrack submit does **not** replace Colosseum submit.

### Earn submission form fields
| Field | Required |
| --- | --- |
| Project Name | yes (text) |
| Project Description | yes (text) |
| Project Github Link | **yes (link)** |
| Project Website | optional |
| Project X Link | optional |
| Pitch deck or Loom/video | **yes (link)** |
| Submitted to official Colosseum? (Yes/No) | **yes** |
| Link to Colosseum project | **yes (link)** |
| Link to Colosseum profile | optional |

### Judging
1. Panta API integration depth  
2. Technical execution  
3. Product & UX  
4. Originality  
5. Impact potential  
6. Traction (users/usage)  

### Resources / support
- Discord #dev-chat: https://discord.gg/M76nH6fUwc  
- X: https://x.com/pantahq  
- Must display **“Powered by Panta”** where Panta-powered features appear (API Terms / playground CONTRIBUTING)

### Wallet / GitHub / login
- **GitHub:** required on Earn form  
- **Wallets on Earn form:** not listed as eligibility questions; payouts typically use the wallet on the **human Earn talent profile**. Keep ready: Solana `5fRbgjZWDa5CaY7BPXqtbB88nHQDxnhaEZ9LZhiu1DmF`, EVM `0x2c32D167A9D769D55AD243d863380A643dA3Df22`  
- **Earn login/profile:** required — listing is `HUMAN_ONLY`  
- **Panta API account:** free email signup for keys (no crypto); separate from Earn  
- **Colosseum Arena account:** required for dual submit  

---

## 2. Read-only vs trading bot

| Path | Cost | Fits listing? | Notes |
| --- | --- | --- | --- |
| **A. Read-only AI / analytics prototype** | **$0** (API key free; public catalog) | **Yes** if demo shows live Panta data + clear integration | Markets list/detail, optional positions lookup, agent briefs on crypto markets |
| B. Trading bot (buy/sell) | Needs Solana USDC + fees + signing | Yes, stronger “trading” story | Conflicts with dust-tier $0-first preference |
| C. Market creation | $20–50 USDC creation fee | Yes | Not $0 |
| D. Fork playground only | $0 | Weak | Risk of low originality / shallow integration score |

**Recommendation for Sol:** Path A as MVP; Path B optional later if funded.

---

## 3. Minimum viable $0 submission (MVP)

**Working title idea:** *Sol × Panta — Crypto prediction market intelligence agent*  
(Agent that pulls live Panta crypto-category markets, summarizes prices/volume/phase, and answers “what is the market saying?” — dashboard + chat/CLI. No trades.)

### Deliverables
1. Public GitHub repo (README: problem, architecture, Panta endpoints used, setup, **Powered by Panta**)  
2. Runnable demo: local or free-hosted URL (Website field optional but helpful)  
3. Loom (~3–5 min): walkthrough of live API calls + UX  
4. Colosseum project page + Earn form filled with both links  
5. Attribution badge in UI  

### Technical sketch
- Register Panta API account → `pk_test_` key in `.env` (never commit)  
- Client: `GET /markets/?category=crypto…`, `GET /markets/{id}/`, optional `GET /positions/?wallet=`  
- Thin agent layer: summarize top markets, flag high volume / phase changes  
- Optional: reuse patterns from [panta-api-playground](https://github.com/Kaito-HQ/panta-api-playground) as reference only — do not submit a bare fork  

### Explicitly out of MVP
- Any buy/create/claim txs  
- Funding wallets with USDC  
- Earn Agent API submit (blocked: HUMAN_ONLY)  

### Effort estimate
| Work | Estimate |
| --- | --- |
| Unblock Earn profile + Colosseum register | 0.5–2 h (or blocked) |
| Panta key + smoke read APIs | 1–2 h |
| MVP agent/dashboard + README | 1–2 days |
| Loom + Colosseum + Earn submit packaging | 0.5 day |
| **Total if unblocked** | **~2–4 person-days** before Oct 12/13 |

Buffer: ~3 weeks calendar until deadline (from 2026-09-22).

---

## 4. Blockers

| Blocker | Severity | Detail |
| --- | --- | --- |
| **Earn talent profile (Mitcx)** | **CRITICAL** | Recent username-availability failures. Listing is `HUMAN_ONLY` → human must log in and submit. Without a working profile, **cannot submit**. |
| **Colosseum dual registration/submit** | **CRITICAL** | Earn form requires Yes + Colosseum project link. Every team member must register on colosseum.com before 2026-10-12 23:59 PT. |
| **GitHub + Loom** | High | Both required on form; need public (or judge-accessible) repo. |
| **Panta API key** | Medium | Free email register; not done in this research pass (per no-signup rule). Needed before build. |
| **Depth vs competitors** | Medium | Shallow “list markets” UIs may lose on integration/originality/traction. Agent narrative helps. |
| **Traction judging** | Low–Med | Hard for dust MVP; mitigate with polished demo + clear use case. |
| **USDC trading** | N/A for MVP | Only if upgrading to Path B later. |

Non-blockers for MVP: Solana/EVM wallets (payout later); paid RPC (public RPC fine for prototype); Agent Earn API.

---

## 5. GO / NO-GO

### **CONDITIONAL GO**

**GO if** decision-owner can, within ~48h:
1. Fix or recreate Superteam Earn profile (Mitcx / alternate username) and confirm login works  
2. Register on Colosseum Arena for Crypto World's Fair  
3. Accept MVP = read-only Panta-powered AI/analytics demo (no trading spend)

**NO-GO / DEFER if:**
- Earn profile remains broken past ~2026-10-01 (too late to risk dual-platform submit)  
- Unwilling to do Colosseum registration + project page  
- Only interested in funded trading bot and refuse $0 read-only path  

Expected prize competitiveness: plausible for top-4 if integration + agent UX is crisp; not a slam dunk vs full trading terminals. Upside ~$1k–$2k USDG if placed; cost of MVP mostly time.

---

## 6. Next concrete step (decision-owner)

**MVP scaffold complete (2026-09-22):** run `cd /workspace/panta-api && npm run dev` — live read-only demo. Remaining: Earn login + Colosseum register + public GitHub + Loom + HUMAN_ONLY dual submit.


**Do this next (human, ~15–30 min):**  
1. Open https://superteam.fun/earn → create/fix talent profile until Mitcx (or new username) can log in and open the listing’s Submit UI.  
2. In parallel, register at https://colosseum.com/worldsfair (Crypto World's Fair).  
3. Reply GO with “Earn login OK + Colosseum registered” → then Sol starts Path A: Panta API key + read-only prototype scaffold under `/workspace/panta-api/`.

If Earn profile still fails username checks: try alternate slug, different email, or Earn support / POC `@toria_dickson` on Telegram — **do not** attempt Earn Agent registration as a workaround (listing is HUMAN_ONLY; payout still needs a human claim/profile).

---

## Appendix — time / payouts cheat sheet

- Earn deadline: **2026-10-13 00:59 MDT**  
- Colosseum deadline: **2026-10-12 23:59 PT** (= same MDT instant)  
- Announce target: **by 2026-10-27**  
- Payout wallets on file: Solana `5fRbgjZWDa5CaY7BPXqtbB88nHQDxnhaEZ9LZhiu1DmF` · EVM `0x2c32D167A9D769D55AD243d863380A643dA3Df22`  
- No signup/submit/spend performed in this scoping pass.
