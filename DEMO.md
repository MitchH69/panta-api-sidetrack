# Demo script (Loom ~3–5 min)

Goal: show **live Panta data** + read-only intelligence UX. No trading.

## Prep

```bash
cd /workspace/panta-api
npm install && npm run dev
```

Browser: http://localhost:5173

## Click path

1. **Cold open (5s)**  
   Point at header + green **Powered by Panta** badge. Say this is a $0 read-only intelligence layer on the Panta API (not a UI clone of panta.market trading).

2. **Markets list (30–45s)**  
   Scroll the live markets panel. Change **Category** to `crypto`, then `sports`. Change **Phase** to `secondary` / `resolved`. Note volume + YES/NO chips update from live catalog.

3. **Market detail (45s)**  
   Click a row. Show detail pane: title/question, YES/NO + primary/secondary prices, volume, market id, resolution rule snippet. Call out “Powered by Panta” under the detail.

4. **AI brief (45–60s)**  
   Click **Run AI brief** (or show the auto-loaded brief). Read 1–2 sentences of the natural-language pulse. Hover category mix / top volume / price skew. Emphasize rule-based analytics over live Panta fetches — no paid LLM required.

5. **Positions (30s)**  
   Positions form is prefilled with `5fRbgjZWDa5CaY7BPXqtbB88nHQDxnhaEZ9LZhiu1DmF`. Click **Lookup**. Show empty or any rows. Optionally paste another wallet if you have one with holdings.

6. **Guardrails close (20s)**  
   Explicit: no create / buy / claim buttons exist. Architecture = Express proxy holds `X-Api-Key`; browser only hits `/api/*`.

7. **Optional terminal proof (20s)**  
   ```bash
   npm run smoke
   ```
   Show `SMOKE_OK` and market count.

## Talking points

- Earn / Colosseum sidetrack: “AI + prediction markets” / trading & analytics vertical
- Dual submit still HUMAN_ONLY later — this demo is the product slice
- Next: public GitHub + Loom + Colosseum project page (human)

## Don’t show

- Contents of `.env` or `/home/box/agent-data/secrets/panta-api-key.json`
- Any write endpoints from the docs
