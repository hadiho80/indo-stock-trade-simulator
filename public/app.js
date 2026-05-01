const LEVEL_COUNT = 240;
const SHARE_PER_LOT = 100;
const BUY_FEE = 0.0015;
const SELL_FEE = 0.0025;

const els = {
  levels: document.querySelector("#levels"),
  symbol: document.querySelector("#symbol"),
  quoteSymbol: document.querySelector("#quoteSymbol"),
  lastPrice: document.querySelector("#lastPriceDisplay"),
  quoteLast: document.querySelector("#quoteLast"),
  openPrice: document.querySelector("#openPrice"),
  prevPrice: document.querySelector("#prevPrice"),
  highPrice: document.querySelector("#highPrice"),
  lowPrice: document.querySelector("#lowPrice"),
  araPrice: document.querySelector("#araPrice"),
  arbPrice: document.querySelector("#arbPrice"),
  liveMarketCap: document.querySelector("#liveMarketCap"),
  ohlcText: document.querySelector("#ohlcText"),
  canvas: document.querySelector("#priceChart"),
  normalModeBtn: document.querySelector("#normalModeBtn"),
  araModeBtn: document.querySelector("#araModeBtn"),
  initialCash: document.querySelector("#initialCash"),
  portfolioMetrics: document.querySelector("#portfolioMetrics"),
  tradeLots: document.querySelector("#tradeLots"),
  limitPrice: document.querySelector("#limitPrice"),
  tradeEstimate: document.querySelector("#tradeEstimate"),
  splitToggleBtn: document.querySelector("#splitToggleBtn"),
  splitBody: document.querySelector("#splitBody"),
  splitChunks: document.querySelector("#splitChunks"),
  splitStep: document.querySelector("#splitStep"),
  splitBuyBtn: document.querySelector("#splitBuyBtn"),
  splitSellBtn: document.querySelector("#splitSellBtn"),
  splitEstimate: document.querySelector("#splitEstimate"),
  riskToggleBtn: document.querySelector("#riskToggleBtn"),
  riskBody: document.querySelector("#riskBody"),
  tpPrice: document.querySelector("#tpPrice"),
  tpLots: document.querySelector("#tpLots"),
  slPrice: document.querySelector("#slPrice"),
  slLots: document.querySelector("#slLots"),
  trailingPct: document.querySelector("#trailingPct"),
  trailingLots: document.querySelector("#trailingLots"),
  applyRiskBtn: document.querySelector("#applyRiskBtn"),
  cancelRiskBtn: document.querySelector("#cancelRiskBtn"),
  riskEstimate: document.querySelector("#riskEstimate"),
  marketBuyBtn: document.querySelector("#marketBuyBtn"),
  marketSellBtn: document.querySelector("#marketSellBtn"),
  sweepOfferBtn: document.querySelector("#sweepOfferBtn"),
  dumpBidBtn: document.querySelector("#dumpBidBtn"),
  limitBuyBtn: document.querySelector("#limitBuyBtn"),
  limitSellBtn: document.querySelector("#limitSellBtn"),
  nextTickBtn: document.querySelector("#nextTickBtn"),
  autoSimBtn: document.querySelector("#autoSimBtn"),
  resetBookBtn: document.querySelector("#resetBookBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  resetSimBtn: document.querySelector("#resetSimBtn"),
  marketCap: document.querySelector("#marketCap"),
  freeFloat: document.querySelector("#freeFloat"),
  spreadMode: document.querySelector("#spreadMode"),
  marketMode: document.querySelector("#marketMode"),
  customLastPrice: document.querySelector("#customLastPrice"),
  customOpenPrice: document.querySelector("#customOpenPrice"),
  customPrevPrice: document.querySelector("#customPrevPrice"),
  customHighPrice: document.querySelector("#customHighPrice"),
  customLowPrice: document.querySelector("#customLowPrice"),
  applyPriceBtn: document.querySelector("#applyPriceBtn"),
  capPresets: document.querySelectorAll("[data-cap]"),
  stockTemplates: document.querySelectorAll("[data-template]"),
  haltModeBtn: document.querySelector("#haltModeBtn"),
  fcaModeBtn: document.querySelector("#fcaModeBtn"),
  runAuctionBtn: document.querySelector("#runAuctionBtn"),
  pompomTargetPct: document.querySelector("#pompomTargetPct"),
  pompomPumpTicks: document.querySelector("#pompomPumpTicks"),
  pompomDumpPct: document.querySelector("#pompomDumpPct"),
  pompomFomoBtn: document.querySelector("#pompomFomoBtn"),
  continueHaltBtn: document.querySelector("#continueHaltBtn"),
  modeBadges: document.querySelector("#modeBadges"),
  aiScenario: document.querySelector("#aiScenario"),
  pendingOrders: document.querySelector("#pendingOrders"),
  tradeLog: document.querySelector("#tradeLog"),
  fillSummary: document.querySelector("#fillSummary"),
  pendingOrdersDesktop: document.querySelector("#pendingOrdersDesktop"),
  tradeLogDesktop: document.querySelector("#tradeLogDesktop"),
  fillSummaryDesktop: document.querySelector("#fillSummaryDesktop"),
  runningTrade: document.querySelector("#runningTrade"),
  runningTradeDesktop: document.querySelector("#runningTradeDesktop"),
  tradeSummary: document.querySelector("#tradeSummary"),
  tradeSummaryDesktop: document.querySelector("#tradeSummaryDesktop"),
  marketStatus: document.querySelector("#marketStatus"),
  viewButtons: document.querySelectorAll(".view-btn"),
  appViews: document.querySelectorAll(".app-view"),
  holderTable: document.querySelector("#holderTable"),
  actorSettings: document.querySelector("#actorSettings"),
  autoSeedBtn: document.querySelector("#autoSeedBtn"),
  marketLotInfo: document.querySelector("#marketLotInfo"),
  showMoreBookBtn: document.querySelector("#showMoreBookBtn"),
  corpActionType: document.querySelector("#corpActionType"),
  corpActionPrice: document.querySelector("#corpActionPrice"),
  corpActionLots: document.querySelector("#corpActionLots"),
  corpActionRatio: document.querySelector("#corpActionRatio"),
  rightUserMode: document.querySelector("#rightUserMode"),
  rightUserLots: document.querySelector("#rightUserLots"),
  rightActorMode: document.querySelector("#rightActorMode"),
  applyCorpActionBtn: document.querySelector("#applyCorpActionBtn"),
  corpActionEstimate: document.querySelector("#corpActionEstimate"),
};

let portfolio = { cash: 1_000_000_000, lots: 0, avgPrice: 0, realized: 0 };
let candles = [];
let pendingOrders = [];
let logs = [];
let runningTrades = [];
let tradeStats = {};
let autoTimer = null;
let resumeAutoAfterHalt = false;
let shockMode = "normal";
let haltModeOn = true;
let fcaModeOn = false;
let pompomFomoOn = true;
let isHalted = false;
let negotiationBias = 0;
let lastPrice = 3070;
let prevPrice = 3070;
let openPrice = 3070;
let manualHigh = null;
let manualLow = null;
let actors = [];
let trailingHigh = 3070;
let riskAnchorPrice = 3070;
let riskOrders = [];
let lockedTotalLots = 0;
let showAllBookLevels = false;

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(decimals ? Number(value) || 0 : Math.round(Number.isFinite(value) ? value : 0));
}

function formatRp(value) {
  return formatNumber(value);
}

function formatMoney(value) {
  return `Rp. ${formatNumber(value)}`;
}

function formatPercent(value) {
  return `${formatNumber(value, 2)}%`;
}

function parseInput(value) {
  if (typeof value === "number") return value;
  const cleaned = String(value || "")
    .replace(/Rp\.?/gi, "")
    .replace(/lot|%/gi, "")
    .replace(/,/g, "")
    .trim();
  return Number(cleaned) || 0;
}

function sanitizeNumberText(value) {
  const text = String(value || "")
    .replace(/Rp\.?/gi, "")
    .replace(/lot|%/gi, "")
    .replace(/,/g, "");
  const sign = text.trim().startsWith("-") ? "-" : "";
  const cleaned = text.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  return sign + parts[0] + (parts.length > 1 ? `.${parts.slice(1).join("")}` : "");
}

function formatWhileTyping(input) {
  const raw = sanitizeNumberText(input.value);
  if (raw === "" || raw === "-") {
    input.value = raw;
    return;
  }
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return;
  if (input.classList.contains("currency-input")) input.value = formatMoney(numeric);
  else if (input.classList.contains("lot-input")) input.value = `${formatNumber(numeric)} lot`;
  else if (input.classList.contains("percent-input")) input.value = formatPercent(numeric);
  else input.value = formatNumber(numeric);
}

function formatInputValue(input) {
  const value = parseInput(input.value);
  if (!value) {
    input.value = "";
    return;
  }
  if (input.classList.contains("currency-input")) {
    input.value = formatMoney(value);
    return;
  }
  if (input.classList.contains("lot-input")) {
    input.value = `${formatNumber(value)} lot`;
    return;
  }
  if (input.classList.contains("percent-input")) {
    input.value = formatPercent(value);
    return;
  }
  input.value = formatNumber(value);
}

function stripInputValue(input) {
  input.value = sanitizeNumberText(input.value);
}

function tickSize(price) {
  if (price < 200) return 1;
  if (price < 500) return 2;
  if (price < 2000) return 5;
  if (price < 5000) return 10;
  return 25;
}

function autoReject(referencePrice) {
  if (referencePrice <= 200) return { up: 35, down: 15 };
  if (referencePrice <= 5000) return { up: 25, down: 15 };
  return { up: 20, down: 15 };
}

function priceLimits(reference = prevPrice) {
  const ar = autoReject(reference);
  return {
    ara: Math.round(reference * (1 + ar.up / 100)),
    arb: Math.max(tickSize(reference), Math.round(reference * (1 - ar.down / 100))),
  };
}

function calculateTotalLotsFromInputs(referencePrice = lastPrice) {
  const cap = parseInput(els.marketCap.value) || 75_000_000_000_000;
  return Math.max(1, Math.round((cap / Math.max(referencePrice, 1)) / SHARE_PER_LOT));
}

function lockTotalLots(referencePrice = lastPrice) {
  lockedTotalLots = calculateTotalLotsFromInputs(referencePrice);
  return lockedTotalLots;
}

function totalLotsFromSettings() {
  if (!lockedTotalLots) lockTotalLots(lastPrice);
  return Math.max(1, lockedTotalLots);
}

function liveMarketCapValue(price = lastPrice) {
  return totalLotsFromSettings() * Math.max(1, price) * SHARE_PER_LOT;
}

function maxLotCap() {
  return totalLotsFromSettings();
}

function capLots(value) {
  return Math.max(0, Math.min(maxLotCap(), Math.round(Number(value) || 0)));
}

function freeFloatPct() {
  return Math.max(1, Math.min(100, parseInput(els.freeFloat.value) || 40));
}

function freeFloatLots() {
  return Math.max(1, Math.round(totalLotsFromSettings() * (freeFloatPct() / 100)));
}

function emitenLiquidityActive() {
  const emiten = actors.find((actor) => actor.type === "emiten");
  return !!(emiten?.active && emiten.scenario !== "netral");
}

function visibleBookLots() {
  const emiten = actors.find((actor) => actor.type === "emiten");
  const emitenVisible = emitenLiquidityActive() ? (emiten?.lots || 0) * 0.08 : 0;
  return Math.max(1, Math.round(freeFloatLots() + emitenVisible));
}

function bookSideCap() {
  const market = marketModeProfile();
  const pct = {
    Sepi: 0.015,
    Normal: 0.035,
    Rame: 0.07,
  }[market.label] || 0.035;
  return Math.max(1, Math.round(visibleBookLots() * pct * Math.max(0.85, market.depth)));
}

function bookLevelCap() {
  const market = marketModeProfile();
  const pct = {
    Sepi: 0.001,
    Normal: 0.0025,
    Rame: 0.006,
  }[market.label] || 0.0025;
  return Math.max(1, Math.round(visibleBookLots() * pct * Math.max(0.85, market.depth)));
}

function capBookLot(value, remaining = bookLevelCap()) {
  return Math.max(0, Math.min(bookLevelCap(), Math.round(Number(value) || 0), Math.max(0, remaining)));
}

function randomBetween(min, max) {
  return min + Math.random() * Math.max(0, max - min);
}

function randomBookLot(base, options = {}) {
  const cap = Math.max(1, options.cap || bookLevelCap());
  const bias = options.bias || 1;
  const minPct = options.minPct ?? 0.06;
  const maxPct = options.maxPct ?? 0.95;
  const target = Math.max(1, Number(base) || 1) * bias;
  const softMax = Math.min(cap, Math.max(1, target * randomBetween(0.55, 1.45)));
  const min = Math.max(1, Math.min(softMax, cap * minPct * randomBetween(0.7, 1.45)));
  const max = Math.max(min, Math.min(cap, Math.max(softMax, cap * maxPct * randomBetween(0.35, 1))));
  const curve = Math.pow(Math.random(), options.heavy ? 0.62 : 1.35);
  return capBookLot(min + (max - min) * curve, options.remaining ?? cap);
}

function scaledTradeLot(actor, role = "retail", multiplier = 1) {
  const market = marketModeProfile();
  const visible = visibleBookLots();
  const ranges = {
    retail: [0.00002, 0.00018],
    retailAggressive: [0.00012, 0.0007],
    bandar: [0.00035, 0.0025],
    bandarAggressive: [0.0012, 0.009],
    emiten: [0.0005, 0.0035],
    emitenAggressive: [0.002, 0.014],
  };
  const [minPct, maxPct] = ranges[role] || ranges.retail;
  let lots = visible * randomBetween(minPct, maxPct) * market.activity * multiplier;
  lots = Math.max(1, Math.round(lots));
  if (actor?.type === "retail") lots = Math.min(lots, Math.max(1, Math.round(bookLevelCap() * 0.35)));
  if (actor?.type === "bandar") lots = Math.min(lots, Math.max(1, Math.round(bookSideCap() * 0.35)));
  if (actor?.type === "emiten") lots = Math.min(lots, Math.max(1, Math.round(bookSideCap() * 0.55)));
  return capLots(lots);
}

function tickTradeDepth(bestLot) {
  const market = marketModeProfile();
  const ranges = {
    Sepi: [0.012, 0.055],
    Normal: [0.035, 0.14],
    Rame: [0.075, 0.26],
  };
  const [minPct, maxPct] = ranges[market.label] || ranges.Normal;
  const lots = bestLot * randomBetween(minPct, maxPct) + visibleBookLots() * randomBetween(0.00001, 0.00006) * market.activity;
  return capLots(Math.max(1, Math.round(lots)));
}

function spreadProfile() {
  const market = marketModeProfile();
  return {
    small: { gap: 1, lotMultiplier: 0.75 * market.depth },
    normal: { gap: 1, lotMultiplier: 1 * market.depth },
    wide: { gap: 4, lotMultiplier: 1.25 * market.depth },
  }[els.spreadMode.value] || { gap: 1, lotMultiplier: market.depth };
}

function settingPrices() {
  const close = Math.max(1, parseInput(els.customLastPrice.value) || lastPrice || 1);
  const customOpen = Math.max(1, parseInput(els.customOpenPrice.value) || close);
  const customPrev = Math.max(1, parseInput(els.customPrevPrice.value) || close);
  const customHigh = Math.max(1, parseInput(els.customHighPrice.value) || Math.max(customOpen, close));
  const customLow = Math.max(1, parseInput(els.customLowPrice.value) || Math.min(customOpen, close));
  return {
    close,
    open: customOpen,
    prev: customPrev,
    high: Math.max(customHigh, customOpen, close),
    low: Math.min(customLow, customOpen, close),
  };
}

function syncPriceInputsFromMarket() {
  const pairs = [
    [els.customLastPrice, lastPrice],
    [els.customOpenPrice, openPrice],
    [els.customPrevPrice, prevPrice],
    [els.customHighPrice, Math.max(...candles.map((c) => c.high), lastPrice, manualHigh || 0)],
    [els.customLowPrice, Math.min(...candles.map((c) => c.low), lastPrice, manualLow || lastPrice)],
  ];
  pairs.forEach(([input, value]) => {
    if (document.activeElement !== input) input.value = formatNumber(value);
  });
}

function clampPriceForMarket(price, reference = prevPrice) {
  const numeric = Math.max(1, Math.round(Number(price) || 1));
  if (!haltModeOn) return numeric;
  const { ara, arb } = priceLimits(reference);
  return Math.max(arb, Math.min(ara, numeric));
}

function marketCapImpact() {
  const cap = parseInput(els.marketCap.value);
  const freeFloat = Math.max(5, Math.min(100, parseInput(els.freeFloat.value) || 40));
  const floatMultiplier = Math.max(0.65, Math.min(2.2, 40 / freeFloat));
  let capImpact = 1;
  if (!cap) return 1;
  if (cap < 1_000_000_000_000) capImpact = 2.5;
  else if (cap < 10_000_000_000_000) capImpact = 1.7;
  else if (cap < 50_000_000_000_000) capImpact = 1.15;
  else if (cap < 150_000_000_000_000) capImpact = 0.8;
  else capImpact = 0.55;
  return capImpact * floatMultiplier;
}

function marketCapLabel() {
  const impact = marketCapImpact();
  if (impact >= 2) return "small cap";
  if (impact >= 1.2) return "mid cap";
  if (impact <= 0.7) return "large cap";
  return "normal cap";
}

function activeMarketMode() {
  if (els.marketMode.value !== "random") return els.marketMode.value;
  return ["quiet", "normal", "busy"][Math.floor(Math.random() * 3)];
}

function marketModeProfile() {
  const mode = activeMarketMode();
  return {
    quiet: { label: "Sepi", depth: 0.45, volatility: 0.65, activity: 0.55 },
    normal: { label: "Normal", depth: 1, volatility: 1, activity: 1 },
    busy: { label: "Rame", depth: 1.8, volatility: 1.45, activity: 1.65 },
  }[mode] || { label: "Normal", depth: 1, volatility: 1, activity: 1 };
}

function pompomConfig() {
  return {
    targetPct: Math.max(1, parseInput(els.pompomTargetPct.value) || 12),
    pumpTicks: Math.max(1, Math.round(parseInput(els.pompomPumpTicks.value) || 8)),
    dumpPct: Math.max(1, Math.min(100, parseInput(els.pompomDumpPct.value) || 70)),
    fomo: pompomFomoOn,
  };
}

function createRows() {
  els.levels.innerHTML = "";
  for (let i = 0; i < LEVEL_COUNT; i += 1) {
    const row = document.createElement("div");
    row.className = "level-row";
    row.innerHTML = `
      <input class="bid-input number-input" type="text" inputmode="numeric" data-field="bidLot" data-index="${i}" aria-label="Bid lot ${i + 1}" />
      <input class="bid-input number-input" type="text" inputmode="numeric" data-field="bidPrice" data-index="${i}" aria-label="Bid price ${i + 1}" />
      <input class="offer-input number-input" type="text" inputmode="numeric" data-field="offerPrice" data-index="${i}" aria-label="Offer price ${i + 1}" />
      <input class="offer-input number-input" type="text" inputmode="numeric" data-field="offerLot" data-index="${i}" aria-label="Offer lot ${i + 1}" />
    `;
    els.levels.appendChild(row);
  }
}

function ensureRows(count) {
  if (els.levels.children.length >= count) return;
  const current = els.levels.children.length;
  for (let i = current; i < count; i += 1) {
    const row = document.createElement("div");
    row.className = "level-row";
    row.innerHTML = `
      <input class="bid-input number-input" type="text" inputmode="numeric" data-field="bidLot" data-index="${i}" aria-label="Bid lot ${i + 1}" />
      <input class="bid-input number-input" type="text" inputmode="numeric" data-field="bidPrice" data-index="${i}" aria-label="Bid price ${i + 1}" />
      <input class="offer-input number-input" type="text" inputmode="numeric" data-field="offerPrice" data-index="${i}" aria-label="Offer price ${i + 1}" />
      <input class="offer-input number-input" type="text" inputmode="numeric" data-field="offerLot" data-index="${i}" aria-label="Offer lot ${i + 1}" />
    `;
    els.levels.appendChild(row);
  }
}

function readBook() {
  const rows = Array.from({ length: LEVEL_COUNT }, () => ({
    bidPrice: 0,
    bidLot: 0,
    offerPrice: 0,
    offerLot: 0,
  }));

  document.querySelectorAll("[data-field]").forEach((input) => {
    rows[Number(input.dataset.index)][input.dataset.field] = parseInput(input.value);
  });
  return normalizeBook(rows, { cap: false });
}

function publicBook() {
  return stripPendingOrders(readBook());
}

function normalizeBook(book, options = {}) {
  const shouldCap = options.cap !== false;
  const normalizeSide = (rows) => {
    let remaining = shouldCap ? bookSideCap() : Number.POSITIVE_INFINITY;
    const normalized = [];
    for (const row of rows) {
      if (remaining <= 0) break;
      const lot = shouldCap ? capBookLot(row.lot, remaining) : Math.max(0, Math.round(Number(row.lot) || 0));
      if (lot > 0) {
        normalized.push({ price: row.price, lot });
        remaining -= lot;
      }
    }
    return normalized;
  };
  const bids = normalizeSide(book
    .filter((row) => row.bidPrice > 0 && row.bidLot > 0)
    .map((row) => ({ price: Math.max(1, Math.round(row.bidPrice)), lot: row.bidLot }))
    .filter((row) => row.lot > 0)
    .sort((a, b) => b.price - a.price));
  const offers = normalizeSide(book
    .filter((row) => row.offerPrice > 0 && row.offerLot > 0)
    .map((row) => ({ price: Math.max(1, Math.round(row.offerPrice)), lot: row.offerLot }))
    .filter((row) => row.lot > 0)
    .sort((a, b) => a.price - b.price));

  return Array.from({ length: LEVEL_COUNT }, (_, i) => ({
    bidPrice: bids[i]?.price || 0,
    bidLot: bids[i]?.lot || 0,
    offerPrice: offers[i]?.price || 0,
    offerLot: offers[i]?.lot || 0,
  }));
}

function withPendingOrders(book) {
  const rows = book.map((row) => ({ ...row }));
  pendingOrders.forEach((order) => {
    if (!order.lots || !order.price) return;
    addLevel(rows, order.side === "buy" ? "bid" : "offer", order.price, order.lots, { cap: false });
  });
  return rows;
}

function stripPendingOrders(book) {
  const rows = book.map((row) => ({ ...row }));
  pendingOrders.forEach((order) => {
    removeLevelLots(rows, order.side === "buy" ? "bid" : "offer", order.price, order.lots);
  });
  return rows;
}

function writeBook(book, includePending = true) {
  const baseBook = includePending ? repairSpread(book) : book;
  const cappedBook = normalizeBook(baseBook, { cap: true });
  const normalized = includePending ? normalizeBook(withPendingOrders(cappedBook), { cap: false }) : cappedBook;
  const visibleLimit = showAllBookLevels ? Number.POSITIVE_INFINITY : 12;
  ensureRows(normalized.length);
  document.querySelectorAll("[data-field]").forEach((input) => {
    const row = normalized[Number(input.dataset.index)];
    const value = row[input.dataset.field];
    input.value = value ? formatNumber(value) : "";
    input.style.removeProperty("--heat");
    input.style.removeProperty("--heat-alpha");
    if (input.dataset.field === "bidLot" || input.dataset.field === "offerLot") {
      const heat = Math.min(1, Math.max(0, (Number(value) || 0) / Math.max(1, bookLevelCap())));
      input.style.setProperty("--heat", heat.toFixed(3));
      input.style.setProperty("--heat-alpha", (0.08 + heat * 0.34).toFixed(3));
    }
    const shell = input.closest(".level-row");
    if (shell) {
      const empty = !row.bidPrice && !row.bidLot && !row.offerPrice && !row.offerLot;
      shell.classList.toggle("empty-level", empty);
      shell.classList.toggle("mobile-extra-level", Number(input.dataset.index) >= visibleLimit);
    }
  });
  if (els.showMoreBookBtn) {
    els.showMoreBookBtn.textContent = showAllBookLevels ? "Show Less Bid Offer" : "Show More Bid Offer";
  }
  render();
}

function addLevel(book, side, price, lot, options = {}) {
  const priceKey = `${side}Price`;
  const lotKey = `${side}Lot`;
  const addedLot = options.cap === false ? Math.max(0, Math.round(Number(lot) || 0)) : capBookLot(lot);
  if (!addedLot) return;
  const existing = book.find((row) => row[priceKey] === price);
  if (existing) {
    existing[lotKey] = options.cap === false
      ? Math.max(0, Math.round(Number(existing[lotKey] || 0) + addedLot))
      : capBookLot(existing[lotKey] + addedLot);
    return;
  }
  book.push({
    bidPrice: side === "bid" ? price : 0,
    bidLot: side === "bid" ? addedLot : 0,
    offerPrice: side === "offer" ? price : 0,
    offerLot: side === "offer" ? addedLot : 0,
  });
}

function removeLevelLots(book, side, price, lot) {
  const priceKey = `${side}Price`;
  const lotKey = `${side}Lot`;
  const row = book.find((level) => level[priceKey] === price);
  if (!row) return;
  row[lotKey] = Math.max(0, row[lotKey] - lot);
}

function repairSpread(book) {
  const repaired = stripPendingOrders(book);
  const anchor = clampPriceForMarket(lastPrice);
  const tick = tickSize(anchor);
  const { ara, arb } = priceLimits(prevPrice);
  const lowerLimit = haltModeOn ? arb : tick;
  const upperLimit = haltModeOn ? ara : anchor + tick * LEVEL_COUNT;
  const profile = spreadProfile();
  const gap = profile.gap;
  const baseLot = randomBookLot((260 + Math.random() * 520) * profile.lotMultiplier, { minPct: 0.1 });
  const bid = anchor - tick * gap;
  const offer = anchor + tick * gap;
  if (bid >= lowerLimit) addLevel(repaired, "bid", bid, baseLot);
  if (offer <= upperLimit) addLevel(repaired, "offer", offer, baseLot);
  return repaired;
}

function setBook(book) {
  writeBook(repairSpread(book));
}

function applyActorBookBias(book, anchor, tick) {
  if (!actors.length) return;
  const profile = marketModeProfile();
  actors
    .filter((actor) => actor.active && actor.scenario !== "netral")
    .forEach((actor) => {
      let side = null;
      if (actor.scenario === "akumulasi") side = "bid";
      if (actor.scenario === "distribusi") side = "offer";
      if (actor.scenario === "pompom") side = actor.pompom?.phase === "distribusi" || actor.pompom?.phase === "dump" ? "offer" : "bid";
      if (actor.scenario === "agresif") side = Math.random() > 0.5 ? "bid" : "offer";
      if (actor.scenario === "random") side = Math.random() > 0.5 ? "bid" : "offer";
      if (!side) return;
      const actorWeight = actor.type === "retail" ? 0.75 : actor.type === "emiten" ? 2.2 : 1.55;
      const scenarioWeight = ["akumulasi", "distribusi", "pompom"].includes(actor.scenario) ? 1.45 : 1;
      const levels = actor.type === "retail" ? 1 : 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < levels; i += 1) {
        const level = 1 + i + Math.floor(Math.random() * 2);
        const price = side === "bid" ? Math.max(tick, anchor - tick * level) : anchor + tick * level;
        const baseLot = (600 + Math.random() * 2400) * profile.depth * actorWeight * scenarioWeight;
        addLevel(book, side, price, randomBookLot(baseLot, { heavy: actor.type !== "retail", minPct: 0.16 }));
      }
    });
}

function generateBookAroundPrice(price) {
  const anchor = clampPriceForMarket(price);
  const tick = tickSize(anchor);
  const { ara, arb } = priceLimits(prevPrice);
  const lowerLimit = haltModeOn ? arb : tick;
  const upperLimit = haltModeOn ? ara : anchor + tick * LEVEL_COUNT;
  const profile = spreadProfile();
  const gap = profile.gap;
  const bidSteps = Math.max(1, Math.ceil((anchor - lowerLimit) / tick) - gap + 1);
  const offerSteps = Math.max(1, Math.ceil((upperLimit - anchor) / tick) - gap + 1);
  const count = Math.min(LEVEL_COUNT, Math.max(bidSteps, offerSteps, 10));
  const rows = Array.from({ length: count }, (_, index) => {
    const level = index + gap;
    const base = (180 + Math.random() * 520 + level * 28) * profile.lotMultiplier;
    const bidPrice = anchor - tick * level;
    const offerPrice = anchor + tick * level;
    return {
      bidPrice: bidPrice >= lowerLimit ? bidPrice : 0,
      bidLot: bidPrice >= lowerLimit ? randomBookLot(base, { minPct: 0.05 }) : 0,
      offerPrice: offerPrice <= upperLimit ? offerPrice : 0,
      offerLot: offerPrice <= upperLimit ? randomBookLot(base * randomBetween(0.85, 1.2), { minPct: 0.05 }) : 0,
    };
  });
  applyActorBookBias(rows, anchor, tick);
  return rows;
}

function seedCandles(price = 3070, custom = {}) {
  candles = [];
  let current = price;
  for (let i = 0; i < 34; i += 1) {
    const drift = Math.round((Math.random() - 0.48) * tickSize(current) * 4 * marketModeProfile().volatility);
    const open = current;
    const close = Math.max(tickSize(current), current + drift);
    const high = Math.max(open, close) + tickSize(current) * Math.ceil(Math.random() * 2);
    const low = Math.max(tickSize(current), Math.min(open, close) - tickSize(current) * Math.ceil(Math.random() * 2));
    candles.push({ open, high, low, close, volume: Math.round(100 + Math.random() * 600) });
    current = close;
  }
  if (custom.open || custom.high || custom.low || custom.close) {
    candles.push({
      open: custom.open || price,
      high: Math.max(custom.high || price, custom.open || price, custom.close || price),
      low: Math.min(custom.low || price, custom.open || price, custom.close || price),
      close: custom.close || price,
      volume: Math.round(500 + Math.random() * 900),
    });
  }
  lastPrice = custom.close || candles.at(-1).close;
  openPrice = custom.open || candles[0].open;
  manualHigh = custom.high || null;
  manualLow = custom.low || null;
}

function addCandle(close, volume = 100, force = "flat") {
  close = clampPriceForMarket(close);
  const previous = candles.at(-1)?.close || lastPrice || close;
  const tick = tickSize(previous);
  const boost = 1;

  const open = previous;
  const high = Math.max(open, close) + (force === "up" ? tick * 2 * boost : tick * boost);
  const low = Math.min(open, close) - (force === "down" ? tick * 2 * boost : tick * boost);
  candles.push({ open, high: Math.max(high, close), low: Math.max(tick, Math.min(low, close)), close, volume });
  candles = candles.slice(-80);
  lastPrice = close;
  manualHigh = Math.max(manualHigh || close, high, close);
  manualLow = Math.min(manualLow || close, Math.max(tick, Math.min(low, close)), close);
}

function bestBid(book = readBook()) {
  return book.find((row) => row.bidPrice && row.bidLot)?.bidPrice || 0;
}

function bestOffer(book = readBook()) {
  return book.find((row) => row.offerPrice && row.offerLot)?.offerPrice || 0;
}

function totalSide(book, side) {
  return book.reduce((sum, row) => sum + row[`${side}Lot`], 0);
}

function createActors(auto = true) {
  const cap = parseInput(els.marketCap.value) || 75_000_000_000_000;
  const freeFloat = Math.max(5, Math.min(100, parseInput(els.freeFloat.value) || 40));
  const totalLots = totalLotsFromSettings();
  const emitenPct = Math.max(0, 100 - freeFloat);
  const templates = [
    ["Emiten", "emiten", "netral", emitenPct, 0.02, false],
    ["Bandar A", "bandar", "akumulasi", freeFloat * 0.22, 0.18, true],
    ["Bandar B", "bandar", "distribusi", freeFloat * 0.18, 0.16, true],
    ["Bandar C", "bandar", "random", freeFloat * 0.14, 0.14, true],
    ["Retail Pool", "retail", "random", freeFloat * 0.46, 0.52, true],
  ];

  actors = templates.map(([name, type, scenario, pct, cashPart, active]) => ({
    name,
    type,
    scenario,
    pct,
    active,
    lots: auto ? capLots(totalLots * (pct / 100)) : 0,
    avgPrice: lastPrice,
    cash: auto ? Math.round(cap * 0.00002 * cashPart) : 0,
    net: 0,
    realized: 0,
    pompom: { phase: "akumulasi", tick: 0, startPrice: lastPrice },
  }));
  normalizeActorOwnership();
}

function actorByName(name) {
  return actors.find((actor) => actor.name === name);
}

function normalizeActorOwnership() {
  const freeFloat = Math.max(5, Math.min(100, parseInput(els.freeFloat.value) || 40));
  const totalLots = totalLotsFromSettings();
  const emiten = actorByName("Emiten");
  if (emiten) {
    emiten.pct = Math.max(0, 100 - freeFloat);
    emiten.lots = capLots(totalLots * (emiten.pct / 100));
  }
  const freeActors = actors.filter((actor) => actor.type !== "emiten");
  const sumPct = freeActors.reduce((sum, actor) => sum + (Number(actor.pct) || 0), 0) || 1;
  freeActors.forEach((actor) => {
    actor.pct = (actor.pct / sumPct) * freeFloat;
    actor.lots = capLots(totalLots * (actor.pct / 100));
  });
}

function actorCost(actor) {
  return actor.lots * (actor.avgPrice || lastPrice) * SHARE_PER_LOT;
}

function updateActorTrade(actor, side, lots, price) {
  if (!actor || !lots) return;
  if (side === "buy") {
    lots = Math.min(capLots(lots), Math.max(0, maxLotCap() - actor.lots));
    if (actor.cash > 0) lots = Math.min(lots, Math.floor(actor.cash / Math.max(1, price * SHARE_PER_LOT)));
    if (lots <= 0) return;
    const gross = lots * price * SHARE_PER_LOT;
    const oldValue = actor.avgPrice * actor.lots;
    actor.avgPrice = actor.lots + lots ? (oldValue + price * lots) / (actor.lots + lots) : price;
    actor.lots = capLots(actor.lots + lots);
    actor.cash -= gross;
    actor.net += lots;
    recordTrade(actor.name, "buy", lots, price);
  } else {
    const sellLots = Math.min(capLots(lots), actor.lots);
    if (sellLots <= 0) return;
    actor.realized += (price - (actor.avgPrice || price)) * sellLots * SHARE_PER_LOT;
    actor.lots -= sellLots;
    actor.cash += sellLots * price * SHARE_PER_LOT;
    actor.net -= sellLots;
    if (actor.lots === 0) actor.avgPrice = 0;
    recordTrade(actor.name, "sell", sellLots, price);
  }
}

function randomRetailActor() {
  return actorByName("Retail Pool");
}

function activeActorsByType(type) {
  return actors.filter((actor) => actor.active && actor.type === type);
}

function log(message) {
  const stamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  logs.unshift(`<strong>${stamp}</strong> ${message}`);
  logs = logs.slice(0, 16);
}

function notifyUser(message) {
  log(message);
  els.marketStatus.textContent = message;
  if (typeof window !== "undefined") window.alert(message);
}

function ensureTradeStat(actor) {
  if (!tradeStats[actor]) {
    tradeStats[actor] = { buyLot: 0, buyValue: 0, sellLot: 0, sellValue: 0 };
  }
  return tradeStats[actor];
}

function recordTrade(actor, side, lots, price) {
  const filled = Math.max(0, Math.round(Number(lots) || 0));
  if (!filled || !price) return;
  const name = actor || "Market";
  const stamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  runningTrades.unshift({ stamp, actor: name, side, lots: filled, price });
  runningTrades = runningTrades.slice(0, 60);
  const stat = ensureTradeStat(name);
  if (side === "buy") {
    stat.buyLot += filled;
    stat.buyValue += filled * price;
  } else {
    stat.sellLot += filled;
    stat.sellValue += filled * price;
  }
}

function setSummary(result) {
  const avg = result.filled ? result.gross / (result.filled * SHARE_PER_LOT) : 0;
  const summaryHtml = `
    <strong>${result.label}</strong><br>
    Request ${formatNumber(result.requested)} lot, filled ${formatNumber(result.filled)} lot,
    unfilled ${formatNumber(result.unfilled)} lot.<br>
    ${avg ? `Avg ${formatRp(avg)}, last ${formatRp(result.last || lastPrice)}.` : result.reason}
  `;
  els.fillSummary.innerHTML = summaryHtml;
  els.fillSummaryDesktop.innerHTML = summaryHtml;
}

function setAutoRunning(running) {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  if (running) {
    autoTimer = setInterval(simulateTick, 1200);
    els.autoSimBtn.classList.add("active");
    els.autoSimBtn.textContent = "Stop";
    return;
  }
  els.autoSimBtn.classList.remove("active");
  els.autoSimBtn.textContent = "Auto";
}

function stopAuto() {
  setAutoRunning(false);
}

function checkHalt() {
  if (!haltModeOn || isHalted) return false;
  const { ara, arb } = priceLimits(prevPrice);
  if (lastPrice >= ara || lastPrice <= arb) {
    lastPrice = lastPrice >= ara ? ara : arb;
    isHalted = true;
    resumeAutoAfterHalt = !!autoTimer;
    stopAuto();
    els.continueHaltBtn.classList.remove("hidden");
    setBook(generateBookAroundPrice(lastPrice));
    log(`HALT: harga menyentuh ${lastPrice >= ara ? "ARA" : "ARB"} ${formatRp(lastPrice)}.`);
    return true;
  }
  return false;
}

function continueFromHalt() {
  const shouldResume = resumeAutoAfterHalt;
  stopAuto();
  prevPrice = lastPrice;
  isHalted = false;
  resumeAutoAfterHalt = false;
  els.continueHaltBtn.classList.add("hidden");
  setBook(generateBookAroundPrice(lastPrice));
  log(`Trade dilanjutkan dari reference baru ${formatRp(prevPrice)}.`);
  render();
  if (shouldResume) setAutoRunning(true);
}

function affordableLotsFromOffers(book, requestedLots) {
  let cash = portfolio.cash;
  let affordable = 0;
  for (const row of book) {
    if (!row.offerPrice || !row.offerLot || affordable >= requestedLots) continue;
    const wanted = Math.min(row.offerLot, requestedLots - affordable);
    const costPerLot = row.offerPrice * SHARE_PER_LOT * (1 + BUY_FEE);
    const canTake = Math.min(wanted, Math.floor(cash / costPerLot));
    affordable += canTake;
    cash -= canTake * costPerLot;
    if (canTake < wanted) break;
  }
  return affordable;
}

function executableLotsFromBook(side, requestedLots = maxLotCap(), limitPrice = 0) {
  const book = publicBook();
  const requested = capLots(requestedLots);
  if (!requested) return 0;
  if (side === "buy") {
    const filtered = limitPrice
      ? book.map((row) => ({ ...row, offerLot: row.offerPrice <= limitPrice ? row.offerLot : 0 }))
      : book;
    return Math.min(
      affordableLotsFromOffers(filtered, requested),
      Math.max(0, maxLotCap() - portfolio.lots),
    );
  }
  const availableBid = book.reduce((sum, row) => {
    if (!row.bidPrice || !row.bidLot) return sum;
    if (limitPrice && row.bidPrice < limitPrice) return sum;
    return sum + row.bidLot;
  }, 0);
  return Math.min(requested, capLots(portfolio.lots), availableBid);
}

function maxBuyLotsAtPrice(price) {
  const limit = Math.max(1, Number(price) || lastPrice || 1);
  return capLots(Math.floor(portfolio.cash / (limit * SHARE_PER_LOT * (1 + BUY_FEE))));
}

function maxTradeLots(side, mode = "market") {
  if (side === "sell") return capLots(portfolio.lots);
  if (mode === "limit") return Math.min(maxBuyLotsAtPrice(parseInput(els.limitPrice.value)), Math.max(0, maxLotCap() - portfolio.lots));
  return executableLotsFromBook(side, maxLotCap());
}

function capTradeInput(side, mode = "market", readyLimit = null) {
  const current = capLots(parseInput(els.tradeLots.value));
  const maxLots = readyLimit ?? maxTradeLots(side, mode);
  const capped = Math.min(current, maxLots);
  if (current !== capped) {
    els.tradeLots.value = formatNumber(capped);
    notifyUser(`Lot ${side} dipotong ke ${formatNumber(capped)} lot karena ready lot/cash/posisi tidak cukup.`);
  }
  renderTradeEstimate();
  return capped;
}

function executeMarket(side, requestedLots, label) {
  if (isHalted) {
    log("Trading halt ARA/ARB aktif. Tekan Lanjut Trade untuk membuka sesi baru.");
    render();
    return { label, requested: requestedLots, filled: 0, unfilled: requestedLots, gross: 0, last: lastPrice, reason: "Halted" };
  }
  if (fcaModeOn) {
    const lots = capLots(requestedLots);
    const limit = side === "buy" ? priceLimits(prevPrice).ara : priceLimits(prevPrice).arb;
    pendingOrders.push({ id: Date.now() + Math.random(), side, price: limit, lots });
    log(`FCA: ${label} masuk auction ${formatNumber(lots)} lot @ ${formatRp(limit)}.`);
    render();
    return { label, requested: lots, filled: 0, unfilled: lots, gross: 0, last: lastPrice, reason: "FCA queued" };
  }
  const originalRequest = capLots(requestedLots);
  let executableRequest = originalRequest;
  const book = publicBook();
  const takeSide = side === "buy" ? "offer" : "bid";
  const priceKey = `${takeSide}Price`;
  const lotKey = `${takeSide}Lot`;

  if (side === "sell") executableRequest = Math.min(executableRequest, capLots(portfolio.lots));
  if (side === "buy") executableRequest = Math.min(affordableLotsFromOffers(book, executableRequest), Math.max(0, maxLotCap() - portfolio.lots));

  let remaining = executableRequest;
  let gross = 0;
  let filled = 0;
  let last = 0;
  let lastRemaining = 0;

  for (const row of book) {
    if (remaining <= 0) break;
    if (!row[priceKey] || !row[lotKey]) continue;
    const take = Math.min(remaining, row[lotKey]);
    row[lotKey] -= take;
    gross += take * row[priceKey] * SHARE_PER_LOT;
    filled += take;
    remaining -= take;
    last = row[priceKey];
    lastRemaining = row[lotKey];
    recordTrade("User", side, take, row[priceKey]);
  }

  if (filled > 0 && side === "buy") {
    const avg = gross / (filled * SHARE_PER_LOT);
    const oldValue = portfolio.avgPrice * portfolio.lots;
    portfolio.avgPrice = (oldValue + avg * filled) / (portfolio.lots + filled);
    portfolio.lots += filled;
    portfolio.cash -= gross * (1 + BUY_FEE);
  }

  if (filled > 0 && side === "sell") {
    const avg = gross / (filled * SHARE_PER_LOT);
    portfolio.realized += (avg - portfolio.avgPrice) * filled * SHARE_PER_LOT;
    portfolio.cash += gross * (1 - SELL_FEE);
    portfolio.lots -= filled;
    if (portfolio.lots === 0) portfolio.avgPrice = 0;
  }

  if (filled > 0) {
    lastPrice = last;
    addCandle(last, filled, side === "buy" ? "up" : "down");
    processPending(lastPrice, book);
    const halted = checkHalt();
    if (!halted) {
      refillBookAfterTrade(book, side, lastPrice, false);
      writeBook(book);
    }
  }

  const result = {
    label,
    requested: originalRequest,
    filled,
    unfilled: originalRequest - filled,
    gross,
    last,
    reason: filled ? "" : side === "buy" ? "Cash atau offer tidak cukup." : "Posisi atau bid tidak cukup.",
  };
  setSummary(result);
  log(filled
    ? `${label}: filled ${formatNumber(filled)}/${formatNumber(originalRequest)} lot @ ${formatRp(last)}, sisa level ${formatNumber(lastRemaining)} lot.`
    : `${label}: filled 0/${formatNumber(originalRequest)} lot.`
  );
  render();
  return result;
}

function shockTarget(side, reference) {
  const ar = autoReject(prevPrice);
  if (shockMode === "ara" && side === "buy") return Math.round(prevPrice * (1 + ar.up / 100));
  if (shockMode === "ara" && side === "sell") return Math.round(prevPrice * (1 - ar.down / 100));
  const tick = tickSize(reference);
  const steps = Math.max(3, Math.round(6 * marketCapImpact()));
  return side === "buy" ? reference + tick * steps : Math.max(tick, reference - tick * steps);
}

function sweepOffer() {
  const book = publicBook();
  const requested = totalSide(book, "offer");
  const beforeCash = portfolio.cash;
  const result = executeMarket("buy", requested, "Hajar Semua Offer");
  if (!result.filled) return;
  if (isHalted) {
    setSummary({ ...result, label: "Hajar Semua Offer - Halt ARA", last: lastPrice });
    render();
    return;
  }

  const target = shockTarget("buy", result.last || lastPrice);
  lastPrice = target;
  addCandle(target, result.filled * 2, "up");
  const halted = checkHalt();
  if (!halted) refillShockBook("buy", lastPrice);
  setSummary({
    ...result,
    label: shockMode === "ara" ? "Hajar Semua Offer - ARA Shock" : "Hajar Semua Offer",
    last: lastPrice,
    reason: beforeCash <= 0 ? "Cash kosong." : "",
  });
  log(`Harga terdorong ke ${formatRp(lastPrice)} setelah offer tersapu.`);
  render();
}

function dumpBid() {
  const requested = portfolio.lots;
  const result = executeMarket("sell", requested, "Buang Semua Bid");
  if (!result.filled) return;
  if (isHalted) {
    setSummary({ ...result, label: "Buang Semua Bid - Halt ARB", last: lastPrice });
    render();
    return;
  }

  const target = shockTarget("sell", result.last || lastPrice);
  lastPrice = target;
  addCandle(target, result.filled * 2, "down");
  const halted = checkHalt();
  if (!halted) refillShockBook("sell", lastPrice);
  setSummary({
    ...result,
    label: shockMode === "ara" ? "Buang Semua Bid - ARB Shock" : "Buang Semua Bid",
    last: lastPrice,
  });
  log(`Harga jatuh ke ${formatRp(lastPrice)} setelah bid dibuang.`);
  render();
}

function refillBookAfterTrade(book, side, price, heavy) {
  const anchor = clampPriceForMarket(price);
  const tick = tickSize(anchor);
  const { ara, arb } = priceLimits(prevPrice);
  const lowerLimit = haltModeOn ? arb : tick;
  const upperLimit = haltModeOn ? ara : anchor + tick * LEVEL_COUNT;
  const profile = spreadProfile();
  const gap = profile.gap;
  if (side === "buy") {
    for (let i = 1; i <= LEVEL_COUNT; i += 1) {
      const offer = anchor + tick * (i + gap - 1);
      if (offer <= upperLimit) addLevel(book, "offer", offer, randomBookLot(((heavy ? 520 : 140) + Math.random() * 640) * profile.lotMultiplier, { heavy }));
    }
  } else {
    for (let i = 1; i <= LEVEL_COUNT; i += 1) {
      const bid = anchor - tick * (i + gap - 1);
      if (bid >= lowerLimit) addLevel(book, "bid", bid, randomBookLot(((heavy ? 520 : 140) + Math.random() * 640) * profile.lotMultiplier, { heavy }));
    }
  }
}

function refillShockBook(side, price) {
  const anchor = clampPriceForMarket(price);
  const tick = tickSize(anchor);
  const { ara, arb } = priceLimits(prevPrice);
  const lowerLimit = haltModeOn ? arb : tick;
  const upperLimit = haltModeOn ? ara : anchor + tick * LEVEL_COUNT;
  const profile = spreadProfile();
  const gap = profile.gap;
  const book = [];
  if (side === "buy") {
    for (let i = 1; i <= LEVEL_COUNT; i += 1) {
      const level = i + gap - 1;
      const bid = anchor - tick * level;
      const offer = anchor + tick * level;
      book.push({
        bidPrice: bid >= lowerLimit ? bid : 0,
        bidLot: bid >= lowerLimit ? randomBookLot((400 + Math.random() * 1400) * profile.lotMultiplier, { heavy: true, minPct: 0.12 }) : 0,
        offerPrice: offer <= upperLimit ? offer : 0,
        offerLot: shockMode === "ara" ? 0 : randomBookLot((80 + Math.random() * 300) * profile.lotMultiplier, { minPct: 0.03 }),
      });
    }
  } else {
    for (let i = 1; i <= LEVEL_COUNT; i += 1) {
      const level = i + gap - 1;
      const bid = anchor - tick * level;
      const offer = anchor + tick * level;
      book.push({
        bidPrice: bid >= lowerLimit ? bid : 0,
        bidLot: shockMode === "ara" ? 0 : randomBookLot((80 + Math.random() * 300) * profile.lotMultiplier, { minPct: 0.03 }),
        offerPrice: offer <= upperLimit ? offer : 0,
        offerLot: offer <= upperLimit ? randomBookLot((400 + Math.random() * 1400) * profile.lotMultiplier, { heavy: true, minPct: 0.12 }) : 0,
      });
    }
  }
  writeBook(book);
}

function placeLimit(side) {
  if (isHalted) {
    log("Trading halt ARA/ARB aktif. Limit order tidak diterima.");
    render();
    return;
  }
  const lots = capLots(parseInput(els.tradeLots.value));
  const price = Math.max(0, Math.floor(parseInput(els.limitPrice.value)));
  if (!lots || !price) return;
  const book = publicBook();
  if (side === "buy" && bestOffer(book) && price >= bestOffer(book)) {
    const readyLots = executableLotsFromBook("buy", lots, price);
    const cappedLots = capTradeInput("buy", "market", readyLots);
    if (!cappedLots) return;
    executeMarket("buy", cappedLots, "Limit Buy marketable");
    return;
  }
  if (side === "sell" && bestBid(book) && price <= bestBid(book)) {
    const readyLots = executableLotsFromBook("sell", lots, price);
    const cappedLots = capTradeInput("sell", "market", readyLots);
    if (!cappedLots) return;
    executeMarket("sell", cappedLots, "Limit Sell marketable");
    return;
  }
  const maxLots = side === "buy"
    ? Math.min(maxBuyLotsAtPrice(price), Math.max(0, maxLotCap() - portfolio.lots))
    : capLots(portfolio.lots);
  const cappedLots = capTradeInput(side, "limit", maxLots);
  if (!cappedLots) return;
  pendingOrders.push({ id: Date.now() + Math.random(), side, price, lots: cappedLots });
  writeBook(book);
  log(`Limit ${side} ${formatNumber(cappedLots)} lot @ ${formatRp(price)} dipasang.`);
}

function renderSplitEstimate() {
  if (!els.splitEstimate) return;
  const total = capLots(parseInput(els.tradeLots.value));
  const chunks = Math.max(1, Math.round(parseInput(els.splitChunks.value) || 1));
  const step = Math.max(1, Math.round(parseInput(els.splitStep.value) || 1));
  const basePrice = Math.max(1, Math.round(parseInput(els.limitPrice.value) || lastPrice));
  const tick = tickSize(basePrice);
  const each = Math.floor(total / chunks);
  const remainder = total % chunks;
  const lastBuy = Math.max(tick, basePrice - tick * step * (chunks - 1));
  const lastSell = basePrice + tick * step * (chunks - 1);
  els.splitEstimate.innerHTML = total
    ? `${formatNumber(total)} lot -> ${formatNumber(chunks)} order, sekitar ${formatNumber(each)}-${formatNumber(each + (remainder ? 1 : 0))} lot/order.<br>Buy ladder ${formatRp(basePrice)} sampai ${formatRp(lastBuy)}. Sell ladder ${formatRp(basePrice)} sampai ${formatRp(lastSell)}.`
    : "Isi Lot dan Limit untuk memecah order besar.";
}

function splitLimitOrder(side) {
  if (isHalted) {
    log("Trading halt ARA/ARB aktif. Split order tidak diterima.");
    render();
    return;
  }
  const requested = capLots(parseInput(els.tradeLots.value));
  const basePrice = Math.max(1, Math.round(parseInput(els.limitPrice.value) || lastPrice));
  const chunks = Math.max(1, Math.round(parseInput(els.splitChunks.value) || 1));
  const step = Math.max(1, Math.round(parseInput(els.splitStep.value) || 1));
  const tick = tickSize(basePrice);
  const maxLots = side === "buy"
    ? Math.min(maxBuyLotsAtPrice(basePrice), Math.max(0, maxLotCap() - portfolio.lots))
    : capLots(portfolio.lots);
  const total = Math.min(requested, maxLots);
  if (!total) {
    log(`Split ${side}: lot tidak cukup atau ${side === "buy" ? "cash" : "posisi"} tidak cukup.`);
    render();
    return;
  }
  if (requested !== total) {
    els.tradeLots.value = formatNumber(total);
    log(`Split ${side}: total lot dipotong ke ${formatNumber(total)} lot.`);
  }
  const baseLot = Math.floor(total / chunks);
  let remainder = total % chunks;
  const created = [];
  for (let i = 0; i < chunks; i += 1) {
    const lots = baseLot + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    if (!lots) continue;
    const price = side === "buy" ? Math.max(tick, basePrice - tick * step * i) : basePrice + tick * step * i;
    pendingOrders.push({ id: Date.now() + Math.random() + i, side, price, lots, source: "split" });
    created.push(`${formatNumber(lots)} lot @ ${formatRp(price)}`);
  }
  writeBook(readBook());
  log(`Split ${side}: ${created.length} order dibuat (${created.join(", ")}).`);
}

function processPending(triggerPrice = lastPrice, book = null) {
  const workingBook = book || readBook();
  for (const order of pendingOrders) {
    if (order.side === "buy" && triggerPrice <= order.price) {
      const affordable = Math.min(
        capLots(order.lots),
        Math.max(0, maxLotCap() - portfolio.lots),
        Math.floor(portfolio.cash / (order.price * SHARE_PER_LOT * (1 + BUY_FEE))),
      );
      if (affordable > 0) {
        const oldValue = portfolio.avgPrice * portfolio.lots;
        portfolio.avgPrice = (oldValue + order.price * affordable) / (portfolio.lots + affordable);
        portfolio.lots += affordable;
        portfolio.cash -= affordable * order.price * SHARE_PER_LOT * (1 + BUY_FEE);
        order.lots -= affordable;
        removeLevelLots(workingBook, "bid", order.price, affordable);
        recordTrade("User", "buy", affordable, order.price);
        log(`Limit buy fill ${formatNumber(affordable)} lot @ ${formatRp(order.price)}.`);
      }
    }
    if (order.side === "sell" && triggerPrice >= order.price) {
      const filled = Math.min(capLots(order.lots), portfolio.lots);
      if (filled > 0) {
        portfolio.realized += (order.price - portfolio.avgPrice) * filled * SHARE_PER_LOT;
        portfolio.cash += filled * order.price * SHARE_PER_LOT * (1 - SELL_FEE);
        portfolio.lots -= filled;
        if (portfolio.lots === 0) portfolio.avgPrice = 0;
        order.lots -= filled;
        removeLevelLots(workingBook, "offer", order.price, filled);
        recordTrade("User", "sell", filled, order.price);
        log(`Limit sell fill ${formatNumber(filled)} lot @ ${formatRp(order.price)}.`);
      }
    }
  }
  pendingOrders = pendingOrders.filter((order) => order.lots > 0);
  return workingBook;
}

function runAuction() {
  if (!fcaModeOn) {
    log("Run Auction hanya aktif saat FCA Mode On.");
    render();
    return;
  }
  const buys = pendingOrders.filter((order) => order.side === "buy").sort((a, b) => b.price - a.price);
  const sells = pendingOrders.filter((order) => order.side === "sell").sort((a, b) => a.price - b.price);
  let volume = 0;
  let auctionPrice = lastPrice;
  for (const buy of buys) {
    for (const sell of sells) {
      if (buy.lots <= 0 || sell.lots <= 0 || buy.price < sell.price) continue;
      const take = Math.min(buy.lots, sell.lots);
      auctionPrice = Math.round((buy.price + sell.price) / 2);
      buy.lots -= take;
      sell.lots -= take;
      volume += take;
      recordTrade("FCA Auction", "buy", take, auctionPrice);
      recordTrade("FCA Auction", "sell", take, auctionPrice);
    }
  }
  pendingOrders = pendingOrders.filter((order) => order.lots > 0);
  if (volume > 0) {
    lastPrice = auctionPrice;
    addCandle(lastPrice, volume, auctionPrice >= candles.at(-1)?.close ? "up" : "down");
    const halted = checkHalt();
    if (!halted) setBook(generateBookAroundPrice(lastPrice));
    processRiskStops();
    log(`FCA auction match ${formatNumber(volume)} lot @ ${formatRp(auctionPrice)}.`);
  } else {
    log("FCA auction: belum ada harga temu.");
  }
  render();
}

function aiLimit(book, side, lot, distance = 1) {
  const tick = tickSize(lastPrice);
  const anchor = side === "bid" ? bestBid(book) || lastPrice - tick : bestOffer(book) || lastPrice + tick;
  const price = side === "bid" ? Math.max(tick, anchor - tick * distance) : anchor + tick * distance;
  addLevel(book, side, price, randomBookLot(lot, { heavy: lot > bookLevelCap() * 0.65, minPct: 0.12 }));
  return price;
}

function consumeBookSide(book, side, lots, label) {
  const priceKey = side === "buy" ? "offerPrice" : "bidPrice";
  const lotKey = side === "buy" ? "offerLot" : "bidLot";
  let remaining = capLots(lots);
  let filled = 0;
  let last = 0;
  let lastRemaining = 0;
  for (const row of book) {
    if (remaining <= 0) break;
    if (!row[priceKey] || !row[lotKey]) continue;
    const take = Math.min(remaining, row[lotKey]);
    row[lotKey] -= take;
    remaining -= take;
    filled += take;
    last = row[priceKey];
    lastRemaining = row[lotKey];
  }
  if (!filled) return 0;
  lastPrice = last;
  addCandle(lastPrice, filled, side === "buy" ? "up" : "down");
  processPending(lastPrice, book);
  checkHalt();
  log(`${label}: ${side === "buy" ? "angkat offer" : "pukul bid"} ${formatNumber(filled)} lot @ ${formatRp(last)}, sisa level ${formatNumber(lastRemaining)} lot.`);
  return filled;
}

function runRetailAi(book) {
  const actor = randomRetailActor();
  if (!actor?.active) return;
  const aggressive = actor?.scenario === "agresif";
  const lot = scaledTradeLot(actor, aggressive ? "retailAggressive" : "retail");
  const action = Math.random();

  if (aggressive && action < 0.7) {
    const side = Math.random() > 0.5 ? "buy" : "sell";
    const filled = consumeBookSide(book, side, lot, "Retail agresif");
    updateActorTrade(actor, side, filled, lastPrice);
    if (isHalted) return;
    refillBookAfterTrade(book, side, lastPrice, false);
    return;
  }

  if (action < 0.36) {
    const side = Math.random() > 0.5 ? "buy" : "sell";
    const filled = consumeBookSide(book, side, lot, "Retail AI");
    updateActorTrade(actor, side, filled, lastPrice);
    return;
  }

  const side = Math.random() > 0.5 ? "bid" : "offer";
  const price = aiLimit(book, side, lot, Math.ceil(Math.random() * 3));
  log(`Retail AI pasang ${side} ${formatNumber(lot)} lot @ ${formatRp(price)}.`);
}

function runPompomActor(book, actor, baseLot) {
  if (!actor.pompom) {
    actor.pompom = { phase: "akumulasi", tick: 0, startPrice: lastPrice };
  }
  const cfg = pompomConfig();
  const state = actor.pompom;
  state.tick += 1;
  const targetPrice = state.startPrice * (1 + cfg.targetPct / 100);

  if (state.phase === "akumulasi") {
    const price = aiLimit(book, "bid", baseLot * 1.5, 1);
    if (state.tick >= Math.max(2, Math.floor(cfg.pumpTicks / 3))) {
      state.phase = "pump";
      state.tick = 0;
      log(`${actor.name} pompom mulai pump dari ${formatRp(lastPrice)}.`);
    } else {
      log(`${actor.name} pompom akumulasi: bid ${formatNumber(baseLot)} lot @ ${formatRp(price)}.`);
    }
    return;
  }

  if (state.phase === "pump") {
    const filled = consumeBookSide(book, "buy", baseLot * (1.4 + Math.random() * 1.6), `${actor.name} pompom pump`);
    updateActorTrade(actor, "buy", filled, lastPrice);
    if (cfg.fomo) {
      const retail = randomRetailActor();
      const fomoLot = capLots(baseLot * (0.18 + Math.random() * 0.35));
      const retailFill = consumeBookSide(book, "buy", fomoLot, "Retail FOMO pompom");
      updateActorTrade(retail, "buy", retailFill, lastPrice);
    }
    if (lastPrice >= targetPrice || state.tick >= cfg.pumpTicks) {
      state.phase = "distribusi";
      state.tick = 0;
      log(`${actor.name} pompom masuk distribusi setelah harga ${formatRp(lastPrice)}.`);
    }
    return;
  }

  if (state.phase === "distribusi") {
    aiLimit(book, "offer", baseLot * 2, 1);
    const sellLot = Math.min(actor.lots, baseLot * (0.6 + Math.random() * 1.1));
    const filled = consumeBookSide(book, "sell", sellLot, `${actor.name} pompom distribusi`);
    updateActorTrade(actor, "sell", filled, lastPrice);
    if (state.tick >= Math.max(2, Math.floor(cfg.pumpTicks / 2))) {
      state.phase = "dump";
      state.tick = 0;
      log(`${actor.name} pompom siap banting.`);
    }
    return;
  }

  const dumpLot = Math.min(actor.lots, Math.max(1, Math.round(actor.lots * (cfg.dumpPct / 100))));
  const filled = consumeBookSide(book, "sell", dumpLot, `${actor.name} pompom banting`);
  updateActorTrade(actor, "sell", filled, lastPrice);
  state.phase = "akumulasi";
  state.tick = 0;
  state.startPrice = lastPrice;
  log(`${actor.name} pompom selesai dump ${formatNumber(filled)} lot, siklus reset.`);
}

function runBandarAi(book) {
  const bigActors = actors.filter((actor) => actor.active && (actor.type === "bandar" || actor.type === "emiten"));
  const actor = bigActors[Math.floor(Math.random() * bigActors.length)];
  if (!actor) return;
  const scenario = actor?.scenario || "random";
  const baseRole = actor.type === "emiten" ? "emiten" : "bandar";
  const aggressiveRole = actor.type === "emiten" ? "emitenAggressive" : "bandarAggressive";
  const baseLot = scaledTradeLot(actor, scenario === "agresif" ? aggressiveRole : baseRole);
  if (scenario === "netral") return;
  if (scenario === "pompom") {
    runPompomActor(book, actor, baseLot);
    return;
  }
  let intent = scenario;
  if (scenario === "random") intent = Math.random() > 0.5 ? "akumulasi" : "distribusi";
  if (scenario === "agresif") intent = Math.random() > 0.5 ? "pump" : "dump";

  if (intent === "pump" || intent === "dump") {
    const side = intent === "pump" ? "buy" : "sell";
    const lots = side === "sell" ? Math.min(actor.lots, baseLot * (2.5 + Math.random() * 3)) : baseLot * (2.5 + Math.random() * 3);
    const filled = consumeBookSide(book, side, lots, `${actor.name} agresif ${intent}`);
    updateActorTrade(actor, side, filled, lastPrice);
    if (isHalted) return;
    refillBookAfterTrade(book, side, lastPrice, true);
    log(`${actor.name} mode agresif ${intent}: ${formatNumber(filled)} lot.`);
    return;
  }

  if (intent === "akumulasi") {
    const price = aiLimit(book, "bid", baseLot * (2.2 + Math.random()), Math.ceil(Math.random() * 2));
    if (Math.random() < 0.82) {
      const filled = consumeBookSide(book, "buy", baseLot * (0.9 + Math.random() * 1.4), `${actor.name} akumulasi`);
      updateActorTrade(actor, "buy", filled, lastPrice);
    }
    log(`${actor.name} tebalin bid @ ${formatRp(price)} (${marketCapLabel()}).`);
  }

  if (intent === "distribusi") {
    const price = aiLimit(book, "offer", baseLot * (2.2 + Math.random()), Math.ceil(Math.random() * 2));
    if (Math.random() < 0.82) {
      const filled = consumeBookSide(book, "sell", Math.min(baseLot * (0.9 + Math.random() * 1.4), actor.lots), `${actor.name} distribusi`);
      updateActorTrade(actor, "sell", filled, lastPrice);
    }
    log(`${actor.name} tebalin offer @ ${formatRp(price)} (${marketCapLabel()}).`);
  }
}

function runNegoMarket() {
  if (Math.random() > 0.2) return;
  const buyers = actors.filter((actor) => actor.active && (actor.scenario === "akumulasi" || actor.type === "retail"));
  const sellers = actors.filter((actor) => actor.active && actor.scenario === "distribusi" && actor.lots > 0);
  const buyer = buyers[Math.floor(Math.random() * buyers.length)];
  const seller = sellers[Math.floor(Math.random() * sellers.length)];
  if (!buyer || !seller || buyer === seller) return;

  const lot = Math.min(seller.lots, Math.round(250 + Math.random() * 1600 * marketCapImpact()));
  if (lot <= 0) return;
  const price = lastPrice + tickSize(lastPrice) * (Math.random() > 0.5 ? 1 : -1);
  updateActorTrade(buyer, "buy", lot, price);
  updateActorTrade(seller, "sell", lot, price);
  negotiationBias += buyer.type === "bandar" ? 0.3 : -0.2;
  log(`Nego: ${buyer.name} ambil ${formatNumber(lot)} lot dari ${seller.name} @ ${formatRp(price)}.`);
}

function simulateTick() {
  if (isHalted) {
    log("Trading halt ARA/ARB aktif. Tekan Lanjut Trade untuk membuka sesi baru.");
    render();
    return;
  }
  const book = readBook();
  if (fcaModeOn) {
  runRetailAi(book);
  runBandarAi(book);
  if (isHalted) {
    render();
    return;
  }
  writeBook(book);
    log("FCA mode: order dikumpulkan, tekan Run Auction untuk matching.");
    render();
    return;
  }
  runNegoMarket();
  runRetailAi(book);
  runBandarAi(book);
  if (isHalted) {
    render();
    return;
  }
  const bidLots = totalSide(book, "bid");
  const offerLots = totalSide(book, "offer");
  const pressure = bidLots - offerLots;
  const side = pressure + negotiationBias * 1000 >= 0 ? "buy" : "sell";
  negotiationBias *= 0.82;
  const row = side === "buy" ? book.find((x) => x.offerPrice && x.offerLot) : book.find((x) => x.bidPrice && x.bidLot);
  if (!row) return;
  const depth = tickTradeDepth(side === "buy" ? row.offerLot : row.bidLot);

  if (side === "buy") {
    const take = Math.min(depth, row.offerLot);
    row.offerLot -= take;
    lastPrice = row.offerPrice;
    addCandle(lastPrice, take, "up");
    processPending(lastPrice, book);
    const halted = checkHalt();
    log(`Tick buy menyerap ${formatNumber(take)} lot @ ${formatRp(row.offerPrice)}, offer sisa ${formatNumber(row.offerLot)} lot.`);
    if (halted) {
      processRiskStops();
      render();
      return;
    }
  } else {
    const take = Math.min(depth, row.bidLot);
    row.bidLot -= take;
    lastPrice = row.bidPrice;
    addCandle(lastPrice, take, "down");
    processPending(lastPrice, book);
    const halted = checkHalt();
    log(`Tick sell memukul ${formatNumber(take)} lot @ ${formatRp(row.bidPrice)}, bid sisa ${formatNumber(row.bidLot)} lot.`);
    if (halted) {
      processRiskStops();
      render();
      return;
    }
  }

  refillBookAfterTrade(book, side, lastPrice, false);
  writeBook(book);
  processRiskStops();
  render();
}

function renderMetric(label, value, className = "") {
  return `<span>${label}</span><strong class="${className}">${value}</strong>`;
}

function renderPortfolio() {
  const marketValue = portfolio.lots * lastPrice * SHARE_PER_LOT;
  const unrealized = portfolio.lots * (lastPrice - portfolio.avgPrice) * SHARE_PER_LOT;
  const equity = portfolio.cash + marketValue;
  const positionCost = portfolio.lots * portfolio.avgPrice * SHARE_PER_LOT;
  const unrealizedPct = positionCost ? (unrealized / positionCost) * 100 : 0;
  const initial = parseInput(els.initialCash.value) || 1;
  const totalReturnPct = ((equity - initial) / initial) * 100;
  els.portfolioMetrics.innerHTML = [
    renderMetric("Cash", formatMoney(portfolio.cash)),
    renderMetric("Lot", `${formatNumber(portfolio.lots)}`),
    renderMetric("Avg", portfolio.avgPrice ? formatRp(portfolio.avgPrice) : "-"),
    renderMetric("U/P/L", `${formatMoney(unrealized)} (${unrealizedPct.toFixed(2)}%)`, unrealized >= 0 ? "positive" : "negative"),
    renderMetric("R/P/L", `${formatMoney(portfolio.realized)} (${totalReturnPct.toFixed(2)}%)`, portfolio.realized >= 0 ? "positive" : "negative"),
    renderMetric("Equity", formatMoney(equity)),
  ].join("");
}

function estimatePnlAt(price, lots = portfolio.lots) {
  if (!lots || !portfolio.avgPrice) return 0;
  return (price - portfolio.avgPrice) * lots * SHARE_PER_LOT;
}

function renderTradeEstimate() {
  const lots = capLots(parseInput(els.tradeLots.value));
  const limit = Math.max(1, parseInput(els.limitPrice.value) || lastPrice);
  const book = publicBook();
  const buyPrice = bestOffer(book) || limit || lastPrice;
  const sellPrice = bestBid(book) || limit || lastPrice;
  const buyValue = lots * buyPrice * SHARE_PER_LOT * (1 + BUY_FEE);
  const sellValue = lots * sellPrice * SHARE_PER_LOT * (1 - SELL_FEE);
  const limitValue = lots * limit * SHARE_PER_LOT;
  const maxBuyLimit = maxBuyLotsAtPrice(limit);
  const maxBuyMarket = maxTradeLots("buy", "market");
  const maxSell = maxTradeLots("sell");
  els.tradeEstimate.innerHTML = lots
    ? `Buy mkt +/- <strong>${formatMoney(buyValue)}</strong> | Sell mkt +/- <strong>${formatMoney(sellValue)}</strong><br>Limit ${formatNumber(lots)} lot @ ${formatRp(limit)} = <strong>${formatMoney(limitValue)}</strong><br>Maks buy mkt ${formatNumber(maxBuyMarket)} lot, buy limit ${formatNumber(maxBuyLimit)} lot, sell ${formatNumber(maxSell)} lot.`
    : `Estimasi transaksi: -<br>Maks buy mkt ${formatNumber(maxBuyMarket)} lot, buy limit ${formatNumber(maxBuyLimit)} lot, sell ${formatNumber(maxSell)} lot.`;
}

function riskDrafts() {
  const tpPrice = parseInput(els.tpPrice.value);
  const tpLots = Math.min(capLots(parseInput(els.tpLots.value)), portfolio.lots);
  const slPrice = parseInput(els.slPrice.value);
  const slLots = Math.min(capLots(parseInput(els.slLots.value)), portfolio.lots);
  const trail = parseInput(els.trailingPct.value);
  const trailLots = Math.min(capLots(parseInput(els.trailingLots.value)), portfolio.lots);
  return { tpPrice, tpLots, slPrice, slLots, trail, trailLots };
}

function renderRiskEstimate() {
  const { tpPrice, tpLots, slPrice, slLots, trail, trailLots } = riskDrafts();
  if (!portfolio.lots || (!tpPrice && !slPrice && !trail)) {
    els.riskEstimate.innerHTML = riskOrders.length
      ? riskOrders.map((order) => `<span class="positive">${order.label} aktif @ ${formatRp(order.price)} x ${formatNumber(order.lots)} lot</span>`).join("<br>")
      : "TP/SL belum aktif.";
    return;
  }
  trailingHigh = Math.max(trailingHigh || lastPrice, lastPrice);
  const rows = riskOrders.map((order) => `<span class="positive">${order.label} aktif @ ${formatRp(order.price)} x ${formatNumber(order.lots)} lot</span>`);
  if (tpPrice && tpLots) {
    rows.push(`Draft TP: ${formatRp(tpPrice)} x ${formatNumber(tpLots)} lot | est ${formatMoney(estimatePnlAt(tpPrice, tpLots))}`);
  }
  if (slPrice && slLots) {
    rows.push(`Draft SL: ${formatRp(slPrice)} x ${formatNumber(slLots)} lot | est ${formatMoney(estimatePnlAt(slPrice, slLots))}`);
  }
  if (trail && trailLots) {
    const price = Math.max(1, Math.round(trailingHigh * (1 - trail / 100)));
    rows.push(`Draft Trailing ${formatPercent(trail)}: ${formatRp(price)} x ${formatNumber(trailLots)} lot dari high ${formatRp(trailingHigh)} | est ${formatMoney(estimatePnlAt(price, trailLots))}`);
  }
  els.riskEstimate.innerHTML = rows.length ? rows.join("<br>") : "Isi harga/lot agar TP/SL aktif.";
}

function applyRiskOrders() {
  const { tpPrice, tpLots, slPrice, slLots, trail, trailLots } = riskDrafts();
  riskOrders = [];
  if (tpPrice && tpLots) riskOrders.push({ type: "tp", label: "TP", price: tpPrice, lots: tpLots });
  if (slPrice && slLots) riskOrders.push({ type: "sl", label: "SL", price: slPrice, lots: slLots });
  if (trail && trailLots) {
    trailingHigh = lastPrice;
    const price = Math.max(1, Math.round(trailingHigh * (1 - trail / 100)));
    riskOrders.push({ type: "trail", label: `Trailing ${formatPercent(trail)}`, pct: trail, price, lots: trailLots });
  }
  log(riskOrders.length ? `TP/SL aktif: ${riskOrders.map((order) => `${order.label} ${formatRp(order.price)} x ${formatNumber(order.lots)} lot`).join(", ")}.` : "Tidak ada TP/SL yang di-apply.");
  renderRiskEstimate();
}

function cancelRiskOrders() {
  riskOrders = [];
  renderRiskEstimate();
  log("TP/SL dibatalkan.");
}

function triggerRiskOrder(order) {
  const lots = Math.min(order.lots, portfolio.lots);
  if (!lots) return;
  pendingOrders.push({ id: Date.now() + Math.random(), side: "sell", price: order.price, lots, source: order.type });
  writeBook(readBook());
  log(`${order.label} trigger: limit sell ${formatNumber(lots)} lot @ ${formatRp(order.price)} dipasang.`);
}

function processRiskStops() {
  if (!portfolio.lots || isHalted || !riskOrders.length) return;
  trailingHigh = Math.max(trailingHigh || lastPrice, lastPrice);
  riskOrders.forEach((order) => {
    if (order.type === "trail") order.price = Math.max(1, Math.round(trailingHigh * (1 - order.pct / 100)));
  });
  const triggered = riskOrders.filter((order) => (order.type === "tp" ? lastPrice >= order.price : lastPrice <= order.price));
  if (!triggered.length) {
    renderRiskEstimate();
    return;
  }
  riskOrders = riskOrders.filter((order) => !triggered.includes(order));
  triggered.forEach(triggerRiskOrder);
  renderRiskEstimate();
}

function renderMarketLotInfo() {
  const totalLots = totalLotsFromSettings();
  const initialCap = parseInput(els.marketCap.value) || 75_000_000_000_000;
  const liveCap = liveMarketCapValue();
  const freeFloat = Math.max(5, Math.min(100, parseInput(els.freeFloat.value) || 40));
  const freeLots = Math.round(totalLots * (freeFloat / 100));
  const emitenLots = totalLots - freeLots;
  els.marketLotInfo.innerHTML = `
    <span>Initial market cap: <strong>${formatMoney(initialCap)}</strong></span>
    <span>Live market cap: <strong>${formatMoney(liveCap)}</strong></span>
    <span>Total lot simulasi: <strong>${formatNumber(totalLots)} lot</strong></span>
    <span>Free float: <strong>${formatNumber(freeLots)} lot (${formatPercent(freeFloat)})</strong></span>
    <span>Emiten/non-free float: <strong>${formatNumber(emitenLots)} lot (${formatPercent(100 - freeFloat)})</strong></span>
    <span>Visible book lot: <strong>${formatNumber(visibleBookLots())} lot</strong></span>
  `;
}

function renderModeBadges() {
  const badges = [
    `Market: ${els.marketMode.options[els.marketMode.selectedIndex]?.text || "Normal"}`,
    `Spread: ${els.spreadMode.options[els.spreadMode.selectedIndex]?.text || "Normal"}`,
    `Halt: ${haltModeOn ? "On" : "Off"}`,
    `FCA: ${fcaModeOn ? "On" : "Off"}`,
    `Live MCap: ${formatMoney(liveMarketCapValue())}`,
  ];
  els.modeBadges.innerHTML = badges.map((item) => `<span>${item}</span>`).join("");
}

function renderQuote() {
  const { ara, arb } = priceLimits(prevPrice);
  const high = Math.max(...candles.map((c) => c.high), lastPrice, manualHigh || 0);
  const low = Math.min(...candles.map((c) => c.low), lastPrice, manualLow || lastPrice);
  const lastCandle = candles.at(-1) || { open: lastPrice, high: lastPrice, low: lastPrice, close: lastPrice };
  els.quoteSymbol.textContent = els.symbol.value.toUpperCase();
  els.lastPrice.textContent = formatRp(lastPrice);
  els.quoteLast.textContent = formatRp(lastPrice);
  els.openPrice.textContent = formatRp(openPrice);
  els.prevPrice.textContent = formatRp(prevPrice);
  els.highPrice.textContent = formatRp(high);
  els.lowPrice.textContent = formatRp(low);
  els.araPrice.textContent = formatRp(ara);
  els.arbPrice.textContent = formatRp(arb);
  els.liveMarketCap.textContent = formatMoney(liveMarketCapValue());
  els.ohlcText.textContent = `O ${formatRp(lastCandle.open)} H ${formatRp(lastCandle.high)} L ${formatRp(lastCandle.low)} C ${formatRp(lastCandle.close)}`;
  syncPriceInputsFromMarket();
}

function renderOrders() {
  const pendingHtml = pendingOrders.length
    ? `
      <button type="button" class="cancel-all-btn" data-cancel-all="true">Cancel All</button>
      ${pendingOrders
        .map(
          (order) => `
            <div class="order-item pending-order">
              <span><strong>${order.side.toUpperCase()}</strong> ${formatNumber(order.lots)} lot @ ${formatRp(order.price)}</span>
              <button type="button" class="cancel-order-btn" data-cancel-order="${order.id}">Cancel</button>
            </div>
          `,
        )
        .join("")}
    `
    : `<div class="order-item">Tidak ada pending limit.</div>`;
  const logHtml = logs.length
    ? logs.map((item) => `<div class="log-item">${item}</div>`).join("")
    : `<div class="log-item">Belum ada reaksi.</div>`;
  els.pendingOrders.innerHTML = pendingHtml;
  els.pendingOrdersDesktop.innerHTML = pendingHtml;
  els.tradeLog.innerHTML = logHtml;
  els.tradeLogDesktop.innerHTML = logHtml;
}

function renderRunningTrade() {
  const html = runningTrades.length
    ? runningTrades
        .map(
          (trade) => `
            <div class="running-row ${trade.side === "buy" ? "positive" : "negative"}">
              <span>${trade.stamp}</span>
              <strong>${trade.actor}</strong>
              <span>${trade.side.toUpperCase()}</span>
              <span>${formatRp(trade.price)}</span>
              <span>${formatNumber(trade.lots)} lot</span>
            </div>
          `,
        )
        .join("")
    : `<div class="order-item">Belum ada running trade.</div>`;
  els.runningTrade.innerHTML = html;
  els.runningTradeDesktop.innerHTML = html;
}

function avgFrom(value, lot) {
  return lot ? formatRp(value / lot) : "-";
}

function renderTradeSummary() {
  const names = Object.keys(tradeStats);
  const rowHtml = names.length
    ? names
        .sort((a, b) => {
          const netA = (tradeStats[a].buyLot || 0) - (tradeStats[a].sellLot || 0);
          const netB = (tradeStats[b].buyLot || 0) - (tradeStats[b].sellLot || 0);
          return Math.abs(netB) - Math.abs(netA);
        })
        .map((name) => {
          const stat = tradeStats[name];
          return `
            <div class="summary-row">
              <strong>${name}</strong>
              <span class="positive">Buy ${formatNumber(stat.buyLot)} lot<br>Avg ${avgFrom(stat.buyValue, stat.buyLot)}</span>
              <span class="negative">Sell ${formatNumber(stat.sellLot)} lot<br>Avg ${avgFrom(stat.sellValue, stat.sellLot)}</span>
            </div>
          `;
        })
        .join("")
    : `<div class="order-item">Belum ada summary transaksi.</div>`;
  els.tradeSummary.innerHTML = rowHtml;
  els.tradeSummaryDesktop.innerHTML = rowHtml;
}

function renderHolders() {
  const totalLots = maxLotCap();
  const actorLots = actors.reduce((sum, actor) => sum + capLots(actor.lots), 0);
  const holderDenominator = Math.max(1, totalLots, capLots(portfolio.lots) + actorLots);
  const pctOfHolders = (lots) => Math.min(100, (capLots(lots) / holderDenominator) * 100);
  const userCost = portfolio.lots * portfolio.avgPrice * SHARE_PER_LOT;
  const userUnrealized = portfolio.lots * (lastPrice - portfolio.avgPrice) * SHARE_PER_LOT;
  const userUnrealizedPct = userCost ? (userUnrealized / userCost) * 100 : 0;
  const userEquity = portfolio.cash + portfolio.lots * lastPrice * SHARE_PER_LOT;
  const userRow = `
    <div class="holder-row">
      <strong>User</strong>
      <span>${formatNumber(portfolio.lots)} lot (${formatPercent(pctOfHolders(portfolio.lots))})<br>avg ${portfolio.avgPrice ? formatRp(portfolio.avgPrice) : "-"}</span>
      <span>cash ${formatMoney(portfolio.cash)}<br><span class="${userUnrealized >= 0 ? "positive" : "negative"}">U/P/L ${formatMoney(userUnrealized)} (${userUnrealizedPct.toFixed(2)}%)</span><br><span class="${portfolio.realized >= 0 ? "positive" : "negative"}">R/P/L ${formatMoney(portfolio.realized)}</span><br><span class="positive">net ${formatNumber(portfolio.lots)} lot</span><br>equity ${formatMoney(userEquity)}</span>
    </div>
  `;
  els.holderTable.innerHTML = userRow + actors
    .map((actor) => {
      const status = actor.type === "retail" ? "10 retail" : actor.scenario;
      const netClass = actor.net >= 0 ? "positive" : "negative";
      const unrealized = (lastPrice - (actor.avgPrice || lastPrice)) * actor.lots * SHARE_PER_LOT;
      const unrealizedPct = actorCost(actor) ? (unrealized / actorCost(actor)) * 100 : 0;
      const realizedPct = actorCost(actor) ? (actor.realized / actorCost(actor)) * 100 : 0;
      const livePct = pctOfHolders(actor.lots);
      return `
        <div class="holder-row">
          <strong>${actor.name}</strong>
          <span>${formatNumber(actor.lots)} lot (${formatPercent(livePct)})<br>avg ${actor.avgPrice ? formatRp(actor.avgPrice) : "-"}</span>
          <span>cash ${formatMoney(actor.cash)}<br><span class="${unrealized >= 0 ? "positive" : "negative"}">U/P/L ${formatMoney(unrealized)} (${unrealizedPct.toFixed(2)}%)</span><br><span class="${actor.realized >= 0 ? "positive" : "negative"}">R/P/L ${formatMoney(actor.realized)} (${realizedPct.toFixed(2)}%)</span><br><span class="${netClass}">net ${formatNumber(actor.net)} lot</span><br>${status} ${actor.active ? "on" : "off"}</span>
        </div>
      `;
    })
    .join("");
}

function renderActorSettings() {
  els.actorSettings.innerHTML = `
    <div class="actor-row actor-head">
      <strong>Pelaku</strong>
      <span>%</span>
      <span>Barang</span>
      <span>Modal</span>
      <span>Skenario</span>
      <span>AI</span>
    </div>
  ` + actors
    .map(
      (actor, index) => `
        <div class="actor-row" data-actor-index="${index}">
          <strong>${actor.name}</strong>
          <input class="number-input percent-input actor-percent" type="text" value="${formatPercent(actor.pct || 0)}" inputmode="decimal" aria-label="${actor.name} percent" ${actor.type === "emiten" ? "readonly" : ""} />
          <input class="number-input lot-input actor-lots" type="text" value="${formatNumber(actor.lots)} lot" inputmode="numeric" aria-label="${actor.name} lots" />
          <input class="number-input currency-input actor-cash" type="text" value="${formatMoney(actor.cash)}" inputmode="numeric" aria-label="${actor.name} cash" />
          <select class="actor-scenario" aria-label="${actor.name} scenario">
            <option value="akumulasi" ${actor.scenario === "akumulasi" ? "selected" : ""}>Akum</option>
            <option value="distribusi" ${actor.scenario === "distribusi" ? "selected" : ""}>Distri</option>
            <option value="random" ${actor.scenario === "random" ? "selected" : ""}>Random</option>
            <option value="agresif" ${actor.scenario === "agresif" ? "selected" : ""}>Agresif</option>
            <option value="pompom" ${actor.scenario === "pompom" ? "selected" : ""}>Pompom</option>
            <option value="netral" ${actor.scenario === "netral" ? "selected" : ""}>Netral</option>
          </select>
          <button type="button" class="ghost actor-active ${actor.active ? "active" : ""}" data-actor-active="${index}">${actor.active ? "On" : "Off"}</button>
        </div>
      `,
    )
    .join("");
}

function drawChart() {
  const canvas = els.canvas;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * dpr));
  canvas.height = Math.max(260, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  ctx.clearRect(0, 0, width, height);

  const pad = { left: 24, right: 58, top: 18, bottom: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const visible = candles.slice(-46);
  const max = Math.max(...visible.map((c) => c.high), lastPrice);
  const min = Math.min(...visible.map((c) => c.low), lastPrice);
  const range = Math.max(tickSize(lastPrice) * 8, max - min);
  const y = (price) => pad.top + ((max - price) / range) * plotH;

  ctx.strokeStyle = "#26282d";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const gy = pad.top + (plotH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(width - pad.right, gy);
    ctx.stroke();
  }

  const candleW = Math.max(4, plotW / visible.length - 4);
  visible.forEach((c, i) => {
    const x = pad.left + i * (plotW / visible.length) + candleW / 2;
    const up = c.close >= c.open;
    ctx.strokeStyle = up ? "#00c087" : "#f05252";
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(x, y(c.high));
    ctx.lineTo(x, y(c.low));
    ctx.stroke();
    const top = y(Math.max(c.open, c.close));
    const bottom = y(Math.min(c.open, c.close));
    ctx.fillRect(x - candleW / 2, top, candleW, Math.max(2, bottom - top));
  });

  const lastY = y(lastPrice);
  ctx.strokeStyle = "#00c087";
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(pad.left, lastY);
  ctx.lineTo(width - pad.right, lastY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#00c087";
  ctx.fillRect(width - pad.right + 4, lastY - 11, 52, 22);
  ctx.fillStyle = "#ffffff";
  ctx.font = "12px Inter, sans-serif";
  ctx.fillText(formatRp(lastPrice), width - pad.right + 8, lastY + 4);

  ctx.fillStyle = "#8d96a5";
  ctx.font = "12px Inter, sans-serif";
  for (let i = 0; i <= 4; i += 1) {
    const price = max - (range / 4) * i;
    ctx.fillText(formatRp(price), width - pad.right + 6, y(price) + 4);
  }
}

function render() {
  renderQuote();
  renderPortfolio();
  renderTradeEstimate();
  renderSplitEstimate();
  renderRiskEstimate();
  renderCorpActionEstimate();
  renderMarketLotInfo();
  renderModeBadges();
  renderOrders();
  renderRunningTrade();
  renderTradeSummary();
  renderHolders();
  drawChart();
}

function cancelOrder(orderId) {
  const order = pendingOrders.find((item) => String(item.id) === String(orderId));
  if (!order) return;
  const book = readBook();
  pendingOrders = pendingOrders.filter((item) => String(item.id) !== String(orderId));
  removeLevelLots(book, order.side === "buy" ? "bid" : "offer", order.price, order.lots);
  writeBook(book);
  log(`Cancel ${order.side} ${formatNumber(order.lots)} lot @ ${formatRp(order.price)}.`);
  render();
}

function cancelAllOrders() {
  const book = readBook();
  const orders = [...pendingOrders];
  pendingOrders = [];
  orders.forEach((order) => {
    removeLevelLots(book, order.side === "buy" ? "bid" : "offer", order.price, order.lots);
  });
  const count = orders.length;
  writeBook(book);
  log(`Cancel all pending order (${formatNumber(count)} order).`);
  render();
}

function renderCorpActionEstimate() {
  if (!els.corpActionEstimate) return;
  const type = els.corpActionType.value;
  const price = Math.max(1, parseInput(els.corpActionPrice.value) || lastPrice);
  const lots = Math.max(0, Math.round(parseInput(els.corpActionLots.value) || 0));
  const ratio = Math.max(0, parseInput(els.corpActionRatio.value));
  if (type === "right") {
    const newLots = lots || Math.round(totalLotsFromSettings() * (ratio / 100));
    const proceeds = newLots * price * SHARE_PER_LOT;
    const userRights = Math.round(portfolio.lots * (ratio / 100));
    const userMode = els.rightUserMode.value;
    const userTake = userMode === "proportional" ? userRights : userMode === "custom" ? Math.min(parseInput(els.rightUserLots.value), userRights || newLots) : 0;
    els.corpActionEstimate.innerHTML = `Right Issue: tambah ${formatNumber(newLots)} lot, dana emiten masuk ${formatMoney(proceeds)}. Hak User kira-kira ${formatNumber(userRights)} lot; ikut ${formatNumber(userTake)} lot. Jika tidak ikut, persen kepemilikan terdilusi.`;
    return;
  }
  const buybackLots = Math.min(lots || Math.round(freeFloatLots() * (ratio / 100)), freeFloatLots());
  const cost = buybackLots * price * SHARE_PER_LOT;
  els.corpActionEstimate.innerHTML = `Buyback: emiten beli ${formatNumber(buybackLots)} lot, estimasi dana ${formatMoney(cost)}. Free float turun, likuiditas lebih ketat.`;
}

function applyCorpAction() {
  const type = els.corpActionType.value;
  const price = Math.max(1, parseInput(els.corpActionPrice.value) || lastPrice);
  const ratio = Math.max(0, parseInput(els.corpActionRatio.value));
  const inputLots = Math.max(0, Math.round(parseInput(els.corpActionLots.value) || 0));
  const emiten = actors.find((actor) => actor.type === "emiten");
  if (type === "right") {
    const newLots = Math.max(1, inputLots || Math.round(totalLotsFromSettings() * (ratio / 100)));
    const oldTotal = totalLotsFromSettings();
    const userRights = Math.round(portfolio.lots * (ratio / 100));
    const userMode = els.rightUserMode.value;
    const userRequested = userMode === "proportional" ? userRights : userMode === "custom" ? parseInput(els.rightUserLots.value) : 0;
    const userTake = Math.max(0, Math.min(userRequested, userRights || newLots, Math.floor(portfolio.cash / (price * SHARE_PER_LOT * (1 + BUY_FEE)))));
    lockedTotalLots += newLots;
    if (userTake > 0) {
      const oldValue = portfolio.avgPrice * portfolio.lots;
      portfolio.avgPrice = (oldValue + price * userTake) / Math.max(1, portfolio.lots + userTake);
      portfolio.lots += userTake;
      portfolio.cash -= userTake * price * SHARE_PER_LOT * (1 + BUY_FEE);
      recordTrade("User RI", "buy", userTake, price);
    }
    const actorMode = els.rightActorMode.value;
    const actorTakes = new Map();
    actors.forEach((actor) => {
      if (!actor.lots) return;
      const shouldJoin = actorMode === "all" || (actorMode === "bandar" && (actor.type === "bandar" || actor.type === "emiten"));
      if (!shouldJoin) return;
      const rights = Math.round(actor.lots * (ratio / 100));
      const affordable = actor.cash > 0 ? Math.floor(actor.cash / Math.max(1, price * SHARE_PER_LOT)) : rights;
      const take = Math.max(0, Math.min(rights, affordable));
      if (take) actorTakes.set(actor, take);
    });
    actorTakes.forEach((take, actor) => {
      const oldValue = (actor.avgPrice || price) * actor.lots;
      actor.avgPrice = (oldValue + price * take) / Math.max(1, actor.lots + take);
      actor.lots += take;
      actor.cash -= take * price * SHARE_PER_LOT;
      actor.net += take;
      recordTrade(`${actor.name} RI`, "buy", take, price);
    });
    if (emiten) {
      emiten.cash += newLots * price * SHARE_PER_LOT;
      emiten.pct = (emiten.lots / totalLotsFromSettings()) * 100;
    }
    const nextFreeFloat = Math.min(95, freeFloatPct() + Math.max(0, ratio));
    els.freeFloat.value = formatPercent(nextFreeFloat);
    setBook(generateBookAroundPrice(lastPrice));
    log(`Right Issue: total lot ${formatNumber(oldTotal)} -> ${formatNumber(totalLotsFromSettings())}. User ikut ${formatNumber(userTake)} lot; actor mode ${actorMode}.`);
  } else {
    const buybackLots = Math.min(inputLots || Math.round(freeFloatLots() * (ratio / 100)), freeFloatLots());
    if (!buybackLots) return;
    if (emiten) {
      emiten.active = true;
      emiten.scenario = "akumulasi";
      emiten.lots += buybackLots;
      emiten.cash -= buybackLots * price * SHARE_PER_LOT;
      emiten.net += buybackLots;
    }
    const freeAfter = Math.max(1, ((freeFloatLots() - buybackLots) / totalLotsFromSettings()) * 100);
    els.freeFloat.value = formatPercent(freeAfter);
    setBook(generateBookAroundPrice(lastPrice));
    log(`Buyback: emiten menyerap ${formatNumber(buybackLots)} lot @ ${formatRp(price)}. Free float turun ke ${formatPercent(freeAfter)}.`);
  }
  normalizeActorOwnership();
  renderActorSettings();
  renderCorpActionEstimate();
  render();
}

const stockTemplates = {
  gorengan: {
    symbol: "GORE",
    company: "Saham Gorengan Simulasi",
    price: 50,
    marketCap: 250_000_000_000,
    freeFloat: 35,
    spread: "normal",
    market: "quiet",
  },
  mid500: {
    symbol: "MIDC",
    company: "Saham Mid Cap Simulasi",
    price: 300,
    marketCap: 5_000_000_000_000,
    freeFloat: 45,
    spread: "small",
    market: "normal",
  },
  price1000: {
    symbol: "FREE",
    company: "Saham Harga 1000 Simulasi",
    price: 1000,
    marketCap: 20_000_000_000_000,
    freeFloat: 40,
    spread: "normal",
    market: "normal",
  },
  bbri: {
    symbol: "BBRI",
    company: "Bank Rakyat Indonesia (Persero) Tbk.",
    price: 3070,
    marketCap: 550_000_000_000_000,
    freeFloat: 43,
    spread: "small",
    market: "busy",
  },
};

function applyStockTemplate(key) {
  const tpl = stockTemplates[key];
  if (!tpl) return;
  els.symbol.value = tpl.symbol;
  document.querySelector("#companyName").textContent = tpl.company;
  els.marketCap.value = formatMoney(tpl.marketCap);
  els.freeFloat.value = formatPercent(tpl.freeFloat);
  els.spreadMode.value = tpl.spread;
  els.marketMode.value = tpl.market;
  [els.customLastPrice, els.customOpenPrice, els.customPrevPrice, els.customHighPrice, els.customLowPrice, els.limitPrice, els.corpActionPrice].forEach((input) => {
    input.value = formatNumber(tpl.price);
  });
  lastPrice = tpl.price;
  prevPrice = tpl.price;
  openPrice = tpl.price;
  lockTotalLots(tpl.price);
  seedCandles(tpl.price, { open: tpl.price, high: tpl.price, low: tpl.price, close: tpl.price });
  createActors(true);
  renderActorSettings();
  setBook(generateBookAroundPrice(lastPrice));
  els.marketStatus.textContent = `Template ${tpl.symbol} aktif.`;
  log(`Template ${tpl.symbol}: harga ${formatRp(tpl.price)}, market cap ${formatMoney(tpl.marketCap)}, free float ${formatPercent(tpl.freeFloat)}.`);
  render();
}

function syncActorSettings() {
  const totalLots = totalLotsFromSettings();
  document.querySelectorAll(".actor-row").forEach((row) => {
    const actor = actors[Number(row.dataset.actorIndex)];
    if (!actor) return;
    const pctInput = row.querySelector(".actor-percent");
    const lotInput = row.querySelector(".actor-lots");
    if (document.activeElement === pctInput && actor.type !== "emiten") {
      actor.pct = Math.max(0, parseInput(pctInput.value));
      actor.lots = capLots(totalLots * (actor.pct / 100));
    } else if (document.activeElement === lotInput && actor.type !== "emiten") {
      actor.lots = capLots(parseInput(lotInput.value));
      actor.pct = (actor.lots / totalLots) * 100;
    } else if (actor.type !== "emiten") {
      actor.lots = capLots(parseInput(lotInput.value));
      actor.pct = (actor.lots / totalLots) * 100;
    }
    actor.cash = Math.round(parseInput(row.querySelector(".actor-cash").value));
    const nextScenario = row.querySelector(".actor-scenario").value;
    if (actor.scenario !== nextScenario) {
      actor.pompom = { phase: "akumulasi", tick: 0, startPrice: lastPrice };
    }
    actor.scenario = nextScenario;
  });
  normalizeActorOwnership();
  renderHolders();
  renderMarketLotInfo();
}

function applyCustomPrice() {
  const prices = settingPrices();
  prevPrice = prices.prev;
  const close = clampPriceForMarket(prices.close, prevPrice);
  lockTotalLots(close);
  const customOpen = prices.open;
  const customPrev = prices.prev;
  const customHigh = Math.max(prices.high, close);
  const customLow = Math.min(prices.low, close);
  lastPrice = close;
  openPrice = customOpen;
  prevPrice = customPrev;
  trailingHigh = close;
  riskAnchorPrice = close;
  actors.forEach((actor) => {
    if (actor.lots > 0) actor.avgPrice = close;
  });
  seedCandles(close, {
    open: customOpen,
    high: Math.max(customHigh, customOpen, close),
    low: Math.min(customLow, customOpen, close),
    close,
  });
  setBook(generateBookAroundPrice(lastPrice));
  formatInputValue(els.customLastPrice);
  formatInputValue(els.customOpenPrice);
  formatInputValue(els.customPrevPrice);
  formatInputValue(els.customHighPrice);
  formatInputValue(els.customLowPrice);
  log(`Harga awal diubah: last ${formatRp(close)}, open ${formatRp(customOpen)}, prev ${formatRp(customPrev)}.`);
  render();
}

function resetAll() {
  if (autoTimer) {
    stopAuto();
  }
  const prices = settingPrices();
  lockTotalLots(prices.close);
  portfolio = { cash: parseInput(els.initialCash.value) || 1_000_000_000, lots: 0, avgPrice: 0, realized: 0 };
  pendingOrders = [];
  riskOrders = [];
  runningTrades = [];
  tradeStats = {};
  logs = [];
  negotiationBias = 0;
  isHalted = false;
  resumeAutoAfterHalt = false;
  els.continueHaltBtn.classList.add("hidden");
  prevPrice = prices.prev;
  openPrice = prices.open;
  trailingHigh = prices.close;
  riskAnchorPrice = prices.close;
  seedCandles(prices.close, {
    open: prices.open,
    high: prices.high,
    low: prices.low,
    close: prices.close,
  });
  createActors(true);
  renderActorSettings();
  setBook(generateBookAroundPrice(lastPrice));
  els.limitPrice.value = formatNumber(lastPrice);
  els.fillSummary.textContent = "Belum ada order.";
  els.fillSummaryDesktop.textContent = "Belum ada order.";
  log("Simulator reset.");
  render();
}

createRows();
seedCandles(3070);
lockTotalLots(lastPrice);
createActors(true);
renderActorSettings();
setBook(generateBookAroundPrice(lastPrice));
render();

document.addEventListener("input", (event) => {
  if (event.target.matches(".number-input")) {
    event.target.value = sanitizeNumberText(event.target.value);
  }
  if (event.target === els.symbol) renderQuote();
  if (event.target === els.initialCash && portfolio.lots === 0) {
    portfolio.cash = parseInput(els.initialCash.value);
    renderPortfolio();
  }
  if (event.target === els.marketCap) {
    lockTotalLots(parseInput(els.customLastPrice.value) || lastPrice);
    els.marketStatus.textContent = `Market cap impact: ${marketCapLabel()}`;
    setBook(readBook());
  }
  if (event.target === els.freeFloat) {
    els.marketStatus.textContent = `Free float ${parseInput(els.freeFloat.value) || 0}%`;
    setBook(readBook());
  }
  if (event.target === els.marketMode) {
    els.marketStatus.textContent = `Market ${event.target.options[event.target.selectedIndex].text}`;
    setBook(readBook());
  }
  if (event.target === els.freeFloat || event.target === els.marketCap || event.target === els.customLastPrice) {
    normalizeActorOwnership();
    renderMarketLotInfo();
  }
  if (event.target === els.tradeLots || event.target === els.limitPrice || event.target === els.splitChunks || event.target === els.splitStep) {
    renderTradeEstimate();
    renderSplitEstimate();
  }
  if ([els.tpPrice, els.tpLots, els.slPrice, els.slLots, els.trailingPct, els.trailingLots].includes(event.target)) {
    riskAnchorPrice = lastPrice;
    trailingHigh = lastPrice;
    renderRiskEstimate();
  }
  if ([els.corpActionType, els.corpActionPrice, els.corpActionLots, els.corpActionRatio].includes(event.target)) {
    renderCorpActionEstimate();
  }
  if (event.target.matches(".actor-percent, .actor-lots, .actor-cash, .actor-scenario")) {
    syncActorSettings();
  }
});

document.addEventListener("change", (event) => {
  if (event.target === els.spreadMode) {
    setBook(generateBookAroundPrice(lastPrice));
    els.marketStatus.textContent = `Spread ${event.target.options[event.target.selectedIndex].text}`;
    render();
    return;
  }
  if (event.target === els.marketMode) {
    setBook(readBook());
    els.marketStatus.textContent = `Market ${event.target.options[event.target.selectedIndex].text}`;
    render();
    return;
  }
  if (event.target.matches(".actor-scenario")) {
    syncActorSettings();
    log(`${actors[Number(event.target.closest(".actor-row")?.dataset.actorIndex)]?.name || "Actor"} mode ${event.target.value}.`);
    render();
  }
});

document.addEventListener(
  "focus",
  (event) => {
    if (event.target.matches(".number-input:not([data-field])")) stripInputValue(event.target);
  },
  true,
);

document.addEventListener(
  "blur",
  (event) => {
    if (event.target.matches(".number-input")) formatInputValue(event.target);
    if (event.target.matches(".actor-percent, .actor-lots")) renderActorSettings();
  },
  true,
);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !event.target.matches("input")) return;
  event.preventDefault();
  if (event.target.matches(".number-input")) formatInputValue(event.target);
  if ([els.customLastPrice, els.customOpenPrice, els.customPrevPrice, els.customHighPrice, els.customLowPrice].includes(event.target)) {
    applyCustomPrice();
    return;
  }
  event.target.blur();
});

document.addEventListener("click", (event) => {
  const actorActive = event.target.closest("[data-actor-active]");
  if (actorActive) {
    const actor = actors[Number(actorActive.dataset.actorActive)];
    if (actor) {
      actor.active = !actor.active;
      actorActive.classList.toggle("active", actor.active);
      actorActive.textContent = actor.active ? "On" : "Off";
      renderHolders();
    }
    return;
  }
  if (event.target === els.pompomFomoBtn) {
    pompomFomoOn = !pompomFomoOn;
    els.pompomFomoBtn.classList.toggle("active", pompomFomoOn);
    els.pompomFomoBtn.textContent = pompomFomoOn ? "On" : "Off";
    els.marketStatus.textContent = `Retail FOMO ${pompomFomoOn ? "on" : "off"}`;
    return;
  }
  const cancelButton = event.target.closest("[data-cancel-order]");
  if (cancelButton) {
    cancelOrder(cancelButton.dataset.cancelOrder);
    return;
  }
  if (event.target.closest("[data-cancel-all]")) {
    cancelAllOrders();
  }
});

els.riskToggleBtn.addEventListener("click", () => {
  els.riskBody.classList.toggle("hidden");
  els.riskToggleBtn.classList.toggle("active", !els.riskBody.classList.contains("hidden"));
});
els.applyRiskBtn.addEventListener("click", applyRiskOrders);
els.cancelRiskBtn.addEventListener("click", cancelRiskOrders);

els.marketBuyBtn.addEventListener("click", () => executeMarket("buy", capTradeInput("buy", "market", executableLotsFromBook("buy", capLots(parseInput(els.tradeLots.value)))), "Buy Market"));
els.marketSellBtn.addEventListener("click", () => executeMarket("sell", capTradeInput("sell", "market", executableLotsFromBook("sell", capLots(parseInput(els.tradeLots.value)))), "Sell Market"));
els.sweepOfferBtn.addEventListener("click", () => {
  if (window.confirm("Hajar semua offer yang tampil? Harga bisa loncat kuat.")) sweepOffer();
});
els.dumpBidBtn.addEventListener("click", () => {
  if (window.confirm("Buang semua posisi User ke bid? Harga bisa jatuh kuat.")) dumpBid();
});
els.limitBuyBtn.addEventListener("click", () => {
  placeLimit("buy");
});
els.limitSellBtn.addEventListener("click", () => {
  placeLimit("sell");
});
els.splitToggleBtn.addEventListener("click", () => {
  els.splitBody.classList.toggle("hidden");
  els.splitToggleBtn.classList.toggle("active", !els.splitBody.classList.contains("hidden"));
  renderSplitEstimate();
});
els.splitBuyBtn.addEventListener("click", () => splitLimitOrder("buy"));
els.splitSellBtn.addEventListener("click", () => splitLimitOrder("sell"));
els.applyPriceBtn.addEventListener("click", applyCustomPrice);
els.showMoreBookBtn.addEventListener("click", () => {
  showAllBookLevels = !showAllBookLevels;
  writeBook(readBook());
});
els.applyCorpActionBtn.addEventListener("click", applyCorpAction);
els.runAuctionBtn.addEventListener("click", runAuction);
els.continueHaltBtn.addEventListener("click", continueFromHalt);
els.nextTickBtn.addEventListener("click", simulateTick);
els.clearBtn.addEventListener("click", () => setBook([]));
els.resetBookBtn.addEventListener("click", () => {
  const prices = settingPrices();
  prevPrice = prices.prev;
  lastPrice = clampPriceForMarket(prices.close, prevPrice);
  setBook(generateBookAroundPrice(lastPrice));
  els.limitPrice.value = formatNumber(lastPrice);
  log(`Bid offer di-reset mengikuti harga setting ${formatRp(lastPrice)}.`);
  render();
});
els.resetSimBtn.addEventListener("click", resetAll);
els.haltModeBtn.addEventListener("click", () => {
  haltModeOn = !haltModeOn;
  els.haltModeBtn.classList.toggle("active", haltModeOn);
  els.haltModeBtn.textContent = haltModeOn ? "On" : "Off";
  if (!haltModeOn) {
    isHalted = false;
    els.continueHaltBtn.classList.add("hidden");
  }
  renderModeBadges();
});
els.fcaModeBtn.addEventListener("click", () => {
  fcaModeOn = !fcaModeOn;
  els.fcaModeBtn.classList.toggle("active", fcaModeOn);
  els.fcaModeBtn.textContent = fcaModeOn ? "On" : "Off";
  els.marketStatus.textContent = `FCA Mode ${fcaModeOn ? "on" : "off"}`;
  renderModeBadges();
});
els.capPresets.forEach((button) => {
  button.addEventListener("click", () => {
    els.marketCap.value = formatMoney(Number(button.dataset.cap));
    lockTotalLots(parseInput(els.customLastPrice.value) || lastPrice);
    normalizeActorOwnership();
    els.capPresets.forEach((preset) => preset.classList.remove("active"));
    button.classList.add("active");
    els.marketStatus.textContent = `Preset ${button.textContent}: ${marketCapLabel()}`;
    setBook(generateBookAroundPrice(lastPrice));
    render();
  });
});
els.stockTemplates.forEach((button) => {
  button.addEventListener("click", () => {
    els.stockTemplates.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    applyStockTemplate(button.dataset.template);
  });
});
els.viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    els.viewButtons.forEach((item) => item.classList.remove("active"));
    els.appViews.forEach((view) => view.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`[data-page="${button.dataset.view}"]`)?.classList.add("active");
    window.setTimeout(render, 0);
  });
});
els.autoSeedBtn.addEventListener("click", () => {
  createActors(true);
  renderActorSettings();
  render();
  log("Holder di-auto seed dari market cap simulasi.");
});
els.normalModeBtn.addEventListener("click", () => {
  shockMode = "normal";
  els.normalModeBtn.classList.add("active");
  els.araModeBtn.classList.remove("active");
  els.marketStatus.textContent = "Normal shock";
});
els.araModeBtn.addEventListener("click", () => {
  shockMode = "ara";
  els.araModeBtn.classList.add("active");
  els.normalModeBtn.classList.remove("active");
  els.marketStatus.textContent = "ARA Shock mode";
});
els.autoSimBtn.addEventListener("click", () => {
  setAutoRunning(!autoTimer);
});

window.addEventListener("resize", drawChart);
