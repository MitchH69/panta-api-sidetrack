const DEFAULT_WALLET = "5fRbgjZWDa5CaY7BPXqtbB88nHQDxnhaEZ9LZhiu1DmF";

const els = {
  category: document.getElementById("category"),
  phase: document.getElementById("phase"),
  btnRefresh: document.getElementById("btnRefresh"),
  btnBrief: document.getElementById("btnBrief"),
  btnMore: document.getElementById("btnMore"),
  status: document.getElementById("status"),
  marketList: document.getElementById("marketList"),
  marketDetail: document.getElementById("marketDetail"),
  briefSummary: document.getElementById("briefSummary"),
  catMix: document.getElementById("catMix"),
  topVol: document.getElementById("topVol"),
  skewList: document.getElementById("skewList"),
  wallet: document.getElementById("wallet"),
  posForm: document.getElementById("posForm"),
  posResult: document.getElementById("posResult"),
};

let cursor = null;
let selectedId = null;
let rows = [];

function setStatus(msg) {
  els.status.textContent = msg || "";
}

async function api(path) {
  const r = await fetch(path);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || j.message || `HTTP ${r.status}`);
  return j;
}

function fmtPx(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  if (n > 1.5) return (n / 1e9).toFixed(3);
  return n.toFixed(3);
}

function fmtVol(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function shortId(id) {
  return id ? `${id.slice(0, 6)}…${id.slice(-4)}` : "—";
}

function titleOf(m) {
  return (m.title || m.question || "").trim() || `Market ${shortId(m.marketId)}`;
}

async function loadCategories() {
  const data = await api("/api/categories");
  const cats = data.categories || [];
  for (const c of cats) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    els.category.appendChild(opt);
  }
}

async function loadMarkets({ append = false } = {}) {
  setStatus("Loading markets…");
  els.btnRefresh.disabled = true;
  try {
    const params = new URLSearchParams();
    params.set("limit", "25");
    if (els.category.value) params.set("category", els.category.value);
    if (els.phase.value) params.set("status", els.phase.value);
    if (append && cursor) params.set("cursor", cursor);
    const data = await api(`/api/markets?${params}`);
    const items = data.items || [];
    cursor = data.nextCursor || null;
    els.btnMore.hidden = !cursor;
    rows = append ? rows.concat(items) : items;
    renderList();
    setStatus(`${rows.length} markets · live Panta catalog`);
    if (!append && rows[0]) selectMarket(rows[0].marketId);
  } catch (e) {
    setStatus(`Error: ${e.message}`);
  } finally {
    els.btnRefresh.disabled = false;
  }
}

function renderList() {
  els.marketList.innerHTML = "";
  if (!rows.length) {
    els.marketList.innerHTML = `<div class="empty">No markets for this filter.</div>`;
    return;
  }
  for (const m of rows) {
    const div = document.createElement("div");
    div.className = "row" + (m.marketId === selectedId ? " active" : "");
    div.dataset.id = m.marketId;
    div.innerHTML = `
      <div class="title">${escapeHtml(titleOf(m))}</div>
      <div class="meta chips">
        <span class="chip">${escapeHtml(m.category || "?")}</span>
        <span class="chip">${escapeHtml(m.phase || "?")}</span>
        <span class="chip yes">YES ${fmtPx(m.yesPrice)}</span>
        <span class="chip no">NO ${fmtPx(m.noPrice)}</span>
        <span class="chip vol">${fmtVol(m.volumeUsdc || m.totalVolumeUsdc)}</span>
      </div>`;
    div.addEventListener("click", () => selectMarket(m.marketId));
    els.marketList.appendChild(div);
  }
}

async function selectMarket(id) {
  selectedId = id;
  renderList();
  els.marketDetail.innerHTML = `<div class="empty">Loading detail…</div>`;
  try {
    const m = await api(`/api/markets/${encodeURIComponent(id)}`);
    // patch title into list row cache
    const idx = rows.findIndex((r) => r.marketId === id);
    if (idx >= 0) {
      rows[idx] = {
        ...rows[idx],
        title: m.title || m.question || rows[idx].title,
        yesPrice: m.yesPrice ?? rows[idx].yesPrice,
        noPrice: m.noPrice ?? rows[idx].noPrice,
      };
      renderList();
    }
    els.marketDetail.innerHTML = `
      <div class="detail-block">
        <h3>${escapeHtml(titleOf(m))}</h3>
        <div class="chips" style="margin-bottom:0.75rem">
          <span class="chip">${escapeHtml(m.category || "")}</span>
          <span class="chip">${escapeHtml(m.phase || "")}</span>
          <span class="chip">${escapeHtml(m.status || "")}</span>
          <span class="chip vol">${fmtVol(m.volumeUsdc || m.totalVolumeUsdc)}</span>
        </div>
        <dl class="kv">
          <dt>YES</dt><dd class="chip yes" style="display:inline-block">${fmtPx(m.yesPrice)}</dd>
          <dt>NO</dt><dd class="chip no" style="display:inline-block">${fmtPx(m.noPrice)}</dd>
          <dt>Primary YES/NO</dt><dd>${fmtPx(m.primaryYesPrice)} / ${fmtPx(m.primaryNoPrice)}</dd>
          <dt>Secondary YES/NO</dt><dd>${fmtPx(m.secondaryYesPrice)} / ${fmtPx(m.secondaryNoPrice)}</dd>
          <dt>Trades</dt><dd>${escapeHtml(String(m.totalTrades ?? "—"))}</dd>
          <dt>Region</dt><dd>${escapeHtml(m.region || "—")}</dd>
          <dt>Market ID</dt><dd><code>${escapeHtml(m.marketId)}</code></dd>
          <dt>Question</dt><dd>${escapeHtml(m.question || m.title || "—")}</dd>
          <dt>Resolution</dt><dd>${escapeHtml((m.resolutionRule || "").slice(0, 280) || "—")}</dd>
        </dl>
        <p class="powered" style="margin-top:1rem">Powered by Panta</p>
      </div>`;
  } catch (e) {
    els.marketDetail.innerHTML = `<div class="empty">Failed: ${escapeHtml(e.message)}</div>`;
  }
}

async function runBrief() {
  setStatus("Building brief…");
  els.btnBrief.disabled = true;
  try {
    const params = new URLSearchParams({ limit: "40" });
    if (els.category.value) params.set("category", els.category.value);
    const b = await api(`/api/brief?${params}`);
    els.briefSummary.textContent = b.summary || "";
    els.catMix.innerHTML = Object.entries(b.counts?.byCategory || {})
      .sort((a, c) => c[1] - a[1])
      .map(([k, v]) => `<li><strong>${escapeHtml(k)}</strong> — ${v}</li>`)
      .join("") || "<li class='empty'>n/a</li>";
    els.topVol.innerHTML = (b.topVolume || [])
      .map(
        (m) =>
          `<li><strong>${escapeHtml(m.title)}</strong><br/><span class="chip vol">${fmtVol(m.volumeUsdc)}</span> <span class="chip">${escapeHtml(m.phase || "")}</span></li>`
      )
      .join("") || "<li class='empty'>n/a</li>";
    els.skewList.innerHTML = (b.priceSkewMovers || [])
      .map(
        (m) =>
          `<li><strong>${escapeHtml(m.title)}</strong><br/><span class="chip yes">YES ${fmtPx(m.yesPrice)}</span> <span class="chip no">NO ${fmtPx(m.noPrice)}</span></li>`
      )
      .join("") || "<li class='empty'>n/a</li>";

    // Prefer enriched markets for the list when brief ran
    if (b.markets?.length) {
      rows = b.markets;
      cursor = b.nextCursor || null;
      els.btnMore.hidden = !cursor;
      renderList();
      if (rows[0]) selectMarket(rows[0].marketId);
    }
    setStatus(`Brief ready · ${b.counts?.markets || 0} markets · Powered by Panta`);
  } catch (e) {
    setStatus(`Brief error: ${e.message}`);
  } finally {
    els.btnBrief.disabled = false;
  }
}

async function lookupPositions(ev) {
  ev?.preventDefault();
  const wallet = (els.wallet.value || "").trim();
  if (!wallet) return;
  els.posResult.innerHTML = `<div class="empty">Looking up…</div>`;
  try {
    const data = await api(`/api/positions?wallet=${encodeURIComponent(wallet)}`);
    const pos = data.positions || [];
    const summary = data.summary || {};
    if (!pos.length) {
      els.posResult.innerHTML = `<p>No positions for <code>${escapeHtml(wallet)}</code>.</p>
        <p class="empty">Summary value: $${escapeHtml(String(summary.currentValueUsdc ?? "0.00"))} USDC</p>
        <p class="powered">Powered by Panta</p>`;
      return;
    }
    const rowsHtml = pos
      .map(
        (p) => `<tr>
          <td><code>${escapeHtml(shortId(p.marketId))}</code></td>
          <td>${escapeHtml(p.category || "—")}</td>
          <td>${escapeHtml(p.side)}</td>
          <td>${escapeHtml(p.shares)}</td>
          <td>${escapeHtml(p.phase)}</td>
          <td>${p.claimable ? "yes" : "no"}</td>
          <td>${escapeHtml(p.outcome ?? "—")}</td>
        </tr>`
      )
      .join("");
    els.posResult.innerHTML = `
      <p>${pos.length} position row(s) · est. value $${escapeHtml(String(summary.currentValueUsdc ?? "—"))} USDC</p>
      <table>
        <thead><tr><th>Market</th><th>Cat</th><th>Side</th><th>Shares</th><th>Phase</th><th>Claimable</th><th>Outcome</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p class="powered" style="margin-top:0.75rem">Powered by Panta</p>`;
  } catch (e) {
    els.posResult.innerHTML = `<div class="empty">Failed: ${escapeHtml(e.message)}</div>`;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

els.btnRefresh.addEventListener("click", () => {
  cursor = null;
  loadMarkets({ append: false });
});
els.btnMore.addEventListener("click", () => loadMarkets({ append: true }));
els.btnBrief.addEventListener("click", runBrief);
els.posForm.addEventListener("submit", lookupPositions);
els.category.addEventListener("change", () => {
  cursor = null;
  loadMarkets({ append: false });
});
els.phase.addEventListener("change", () => {
  cursor = null;
  loadMarkets({ append: false });
});

els.wallet.value = DEFAULT_WALLET;

(async function init() {
  try {
    const health = await api("/api/health");
    if (health.defaultWallet) els.wallet.value = health.defaultWallet;
  } catch {
    /* ignore */
  }
  await loadCategories().catch((e) => setStatus(e.message));
  await loadMarkets();
  await runBrief();
  await lookupPositions();
})();
