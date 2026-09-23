import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env") });

function loadApiKey() {
  const secretsPath = "/home/box/agent-data/secrets/panta-api-key.json";
  try {
    if (fs.existsSync(secretsPath)) {
      const j = JSON.parse(fs.readFileSync(secretsPath, "utf8"));
      if (j.api_key) return j.api_key;
    }
  } catch {
    /* fall through */
  }
  return process.env.PANTA_API_KEY || "";
}

const API_KEY = loadApiKey();
const API_BASE = (process.env.PANTA_API_BASE || "https://live-api.panta.market/api/v1").replace(/\/$/, "");
const DEFAULT_WALLET =
  process.env.DEFAULT_WALLET || "5fRbgjZWDa5CaY7BPXqtbB88nHQDxnhaEZ9LZhiu1DmF";
const PORT = Number(process.env.PORT || 5173);
const UA =
  "PantaApiMvp/0.1 (+https://docs.panta.market; read-only; Powered by Panta)";

if (!API_KEY) {
  console.error("Missing PANTA_API_KEY — set .env or secrets/panta-api-key.json");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

async function panta(pathname, query = {}) {
  const basePath = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const u = new URL(`${API_BASE}${basePath}`);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  }
  const res = await fetch(u, {
    headers: {
      "X-Api-Key": API_KEY,
      Accept: "application/json",
      "User-Agent": UA,
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(body?.message || body?.code || `Panta HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    poweredBy: "Panta",
    mode: "read-only",
    base: API_BASE,
    defaultWallet: DEFAULT_WALLET,
  });
});

app.get("/api/categories", async (_req, res) => {
  try {
    const data = await panta("/categories/");
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, detail: e.body });
  }
});

app.get("/api/markets", async (req, res) => {
  try {
    const { category, status, limit, cursor } = req.query;
    const data = await panta("/markets/", {
      category,
      status,
      limit: limit || "30",
      cursor,
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, detail: e.body });
  }
});

app.get("/api/markets/:id", async (req, res) => {
  try {
    const data = await panta(`/markets/${encodeURIComponent(req.params.id)}/`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, detail: e.body });
  }
});

app.get("/api/positions", async (req, res) => {
  try {
    const wallet = (req.query.wallet || DEFAULT_WALLET).trim();
    if (!wallet) return res.status(400).json({ error: "wallet required" });
    const data = await panta("/positions/", { wallet });
    res.json(data);
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, detail: e.body });
  }
});

/** Enrich list rows with titles from detail (list catalog often blanks title). */
async function mapPool(items, concurrency, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return out;
}

async function enrichTitles(items, max = 12) {
  const slice = items.slice(0, max);
  const enriched = await mapPool(slice, 3, async (row) => {
    try {
      const detail = await panta(`/markets/${encodeURIComponent(row.marketId)}/`);
      const vol =
        detail.volumeUsdc ??
        detail.totalVolumeUsdc ??
        row.volumeUsdc ??
        row.totalVolumeUsdc;
      return {
        ...row,
        title: detail.title || detail.question || row.title || "",
        description: detail.description || row.description || "",
        yesPrice: detail.yesPrice ?? row.yesPrice,
        noPrice: detail.noPrice ?? row.noPrice,
        primaryYesPrice: detail.primaryYesPrice ?? row.primaryYesPrice,
        primaryNoPrice: detail.primaryNoPrice ?? row.primaryNoPrice,
        secondaryYesPrice: detail.secondaryYesPrice ?? row.secondaryYesPrice,
        secondaryNoPrice: detail.secondaryNoPrice ?? row.secondaryNoPrice,
        volumeUsdc: vol,
        totalVolumeUsdc: detail.totalVolumeUsdc ?? row.totalVolumeUsdc,
        question: detail.question || null,
        resolutionRule: detail.resolutionRule || null,
        totalTrades: detail.totalTrades || null,
        enriched: true,
      };
    } catch {
      return { ...row, enriched: false };
    }
  });
  return enriched.concat(items.slice(max).map((r) => ({ ...r, enriched: false })));
}

app.get("/api/brief", async (req, res) => {
  try {
    const category = req.query.category || "";
    const limit = Math.min(Number(req.query.limit || 40), 50);
    const catalog = await panta("/markets/", {
      category: category || undefined,
      limit: String(limit),
    });
    const items = catalog.items || [];
    const enriched = await enrichTitles(items, 15);

    const byCat = {};
    const byPhase = {};
    let volSum = 0;
    for (const m of enriched) {
      byCat[m.category || "unknown"] = (byCat[m.category || "unknown"] || 0) + 1;
      byPhase[m.phase || "unknown"] = (byPhase[m.phase || "unknown"] || 0) + 1;
      volSum += Number(m.volumeUsdc || m.totalVolumeUsdc || 0);
    }

    const movers = [...enriched]
      .filter((m) => m.yesPrice != null && m.yesPrice !== "")
      .map((m) => {
        const yes = Number(m.yesPrice);
        return {
          marketId: m.marketId,
          title: m.title || m.question || shortId(m.marketId),
          category: m.category,
          phase: m.phase,
          yesPrice: m.yesPrice,
          noPrice: m.noPrice,
          volumeUsdc: m.volumeUsdc || m.totalVolumeUsdc,
          skew: Math.abs(yes - 0.5),
        };
      })
      .sort((a, b) => b.skew - a.skew || Number(b.volumeUsdc || 0) - Number(a.volumeUsdc || 0))
      .slice(0, 8);

    const topVolume = [...enriched]
      .sort(
        (a, b) =>
          Number(b.volumeUsdc || b.totalVolumeUsdc || 0) -
          Number(a.volumeUsdc || a.totalVolumeUsdc || 0)
      )
      .slice(0, 8)
      .map((m) => ({
        marketId: m.marketId,
        title: m.title || m.question || shortId(m.marketId),
        category: m.category,
        phase: m.phase,
        volumeUsdc: m.volumeUsdc || m.totalVolumeUsdc,
        yesPrice: m.yesPrice,
        noPrice: m.noPrice,
      }));

    const summary = buildSummary({
      count: enriched.length,
      byCat,
      byPhase,
      volSum,
      movers,
      topVolume,
      categoryFilter: category || "all",
    });

    res.json({
      poweredBy: "Panta",
      fetchedAt: new Date().toISOString(),
      categoryFilter: category || null,
      counts: { markets: enriched.length, byCategory: byCat, byPhase },
      volumeUsdcSum: volSum.toFixed(2),
      topVolume,
      priceSkewMovers: movers,
      summary,
      markets: enriched,
      nextCursor: catalog.nextCursor || null,
    });
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message, detail: e.body });
  }
});

function shortId(id) {
  return id ? `${id.slice(0, 6)}…${id.slice(-4)}` : "—";
}

function buildSummary({ count, byCat, byPhase, volSum, movers, topVolume, categoryFilter }) {
  const catBits = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c, n]) => `${c} (${n})`)
    .join(", ");
  const phaseBits = Object.entries(byPhase)
    .map(([p, n]) => `${n} ${p}`)
    .join(", ");
  const top = topVolume[0];
  const skew = movers[0];
  const lines = [
    `Panta catalog pulse (${categoryFilter}): ${count} markets in this page — ${phaseBits || "no phase data"}.`,
    `Category mix: ${catBits || "n/a"}. Combined listed volume ≈ $${volSum.toFixed(2)} USDC.`,
  ];
  if (top) {
    lines.push(
      `Highest volume on page: “${top.title}” (${top.category}, ${top.phase}) at $${Number(top.volumeUsdc || 0).toFixed(2)} USDC.`
    );
  }
  if (skew && skew.yesPrice != null) {
    const lean = Number(skew.yesPrice) >= 0.5 ? "YES" : "NO";
    lines.push(
      `Strongest priced lean: “${skew.title}” — YES ${fmtPx(skew.yesPrice)} / NO ${fmtPx(skew.noPrice)} (crowd leans ${lean}).`
    );
  }
  lines.push("Read-only view — no create / buy / trade paths in this MVP.");
  return lines.join(" ");
}

function fmtPx(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  // some secondary prices arrive as raw base units (e.g. 559161525)
  if (n > 1.5) return (n / 1e9).toFixed(3);
  return n.toFixed(3);
}

app.use(express.static(path.join(root, "public")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(root, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Panta MVP (read-only) http://localhost:${PORT}`);
  console.log(`Powered by Panta · proxy → ${API_BASE}`);
});
