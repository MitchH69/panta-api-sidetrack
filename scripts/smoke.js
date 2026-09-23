import fs from "fs";

const base = process.env.SMOKE_BASE || "http://127.0.0.1:5173";

async function get(path) {
  const r = await fetch(`${base}${path}`);
  const j = await r.json();
  if (!r.ok) throw new Error(`${path} ${r.status} ${JSON.stringify(j)}`);
  return j;
}

const health = await get("/api/health");
console.log("health", health.ok, health.poweredBy);
const markets = await get("/api/markets?limit=5");
console.log("markets", (markets.items || []).length);
const brief = await get("/api/brief?limit=10");
console.log("brief markets", brief.counts?.markets, "summary:", (brief.summary || "").slice(0, 120));
const pos = await get(`/api/positions?wallet=${encodeURIComponent(health.defaultWallet)}`);
console.log("positions", (pos.positions || []).length);
console.log("SMOKE_OK");
