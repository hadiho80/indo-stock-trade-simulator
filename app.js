const LEVEL_COUNT = 10;
const SHARE_PER_LOT = 100;
const BUY_FEE = 0.0015;
const SELL_FEE = 0.0025;

const sampleBook = [
  { bidPrice: 3070, bidLot: 120, offerPrice: 3080, offerLot: 80 },
  { bidPrice: 3060, bidLot: 260, offerPrice: 3090, offerLot: 130 },
  { bidPrice: 3050, bidLot: 310, offerPrice: 3100, offerLot: 180 },
  { bidPrice: 3040, bidLot: 420, offerPrice: 3110, offerLot: 210 },
  { bidPrice: 3030, bidLot: 550, offerPrice: 3120, offerLot: 250 },
  { bidPrice: 3020, bidLot: 300, offerPrice: 3130, offerLot: 320 },
  { bidPrice: 3010, bidLot: 450, offerPrice: 3140, offerLot: 360 },
  { bidPrice: 3000, bidLot: 680, offerPrice: 3150, offerLot: 420 },
  { bidPrice: 2990, bidLot: 380, offerPrice: 3160, offerLot: 500 },
  { bidPrice: 2980, bidLot: 520, offerPrice: 3170, offerLot: 620 },
];

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
  ohlcText: document.querySelector("#ohlcText"),
  canvas: document.querySelector("#priceChart"),
  normalModeBtn: document.querySelector("#normalModeBtn"),
  araModeBtn: document.querySelector("#araModeBtn"),
  initialCash: document.querySelector("#initialCash"),
  portfolioMetrics: document.querySelector("#portfolioMetrics"),
  tradeLots: document.querySelector("#tradeLots"),
  limitPrice: document.querySelector("#limitPrice"),
  marketBuyBtn: document.querySelector("#marketBuyBtn"),
  marketSellBtn: document.querySelector("#marketSellBtn"),
  sweepOfferBtn: document.querySelector("#sweepOfferBtn"),
  dumpBidBtn: document.querySelector("#dumpBidBtn"),
  limitBuyBtn: document.querySelector("#limitBuyBtn"),
  limitSellBtn: document.querySelector("#limitSellBtn"),
  nextTickBtn: document.querySelector("#nextTickBtn"),
  autoSimBtn: document.querySelector("#autoSimBtn"),
  sampleBtn: document.querySelector("#sampleBtn"),
  resetBookBtn: document.querySelector("#resetBookBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  resetSimBtn: document.querySelector("#resetSimBtn"),
  marketCap: document.querySelector("#marketCap"),
  freeFloat: document.querySelector("#freeFloat"),
  customLastPrice: document.querySelector("#customLastPrice"),
  customOpenPrice: document.querySelector("#customOpenPrice"),
  customPrevPrice: document.querySelector("#customPrevPrice"),
  customHighPrice: document.querySelector("#customHighPrice"),
  customLowPrice: document.querySelector("#customLowPrice"),
  applyPriceBtn: document.querySelector("#applyPriceBtn"),
  capPresets: document.querySelectorAll("[data-cap]"),
  retailAiBtn: document.querySelector("#retailAiBtn"),
  bandarAiBtn: document.querySelector("#bandarAiBtn"),
  aiScenario: document.querySelector("#aiScenario"),
  pendingOrders: document.querySelector("#pendingOrders"),
  tradeLog: document.querySelector("#tradeLog"),
  fillSummary: document.querySelector("#fillSummary"),
  pendingOrdersDesktop: document.querySelector("#pendingOrdersDesktop"),
  tradeLogDesktop: document.querySelector("#tradeLogDesktop"),
  fillSummaryDesktop: document.querySelector("#fillSummaryDesktop"),
  marketStatus: document.querySelector("#marketStatus"),
  viewButtons: document.querySelectorAll(".view-btn"),
  appViews: document.querySelectorAll(".app-view"),
  timeframeButtons: document.querySelectorAll(".tf-btn"),
  holderTable: document.querySelector("#holderTable"),
  actorSettings: document.querySelector("#actorSettings"),
  autoSeedBtn: document.querySelector("#autoSeedBtn"),
};

let portfolio = { cash: 1_000_000_000, lots: 0, avgPrice: 0, realized: 0 };
let candles = [];
let pendingOrders = [];
let logs = [];
let autoTimer = null;
let shockMode = "normal";
let retailAiOn = true;
let bandarAiOn = false;
let timeframe = "S";
let tickCounter = 0;
let pendingCandle = null;
let negotiationBias = 0;
let lastPrice = 3070;
let prevPrice = 3070;
let openPrice = 3070;
let manualHigh = null;
let manualLow = null;
let actors = [];

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

function timeframeSize() {
  return { S: 1, M: 5, H: 18, D: 48 }[timeframe] || 1;
}

function timeframeRangeBoost() {
  return { S: 1, M: 1.4, H: 2.2, D: 3.4 }[timeframe] || 1;
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
  return normalizeBook(rows);
}

function normalizeBook(book) {
  const bids = book
    .filter((row) => row.bidPrice > 0 && row.bidLot > 0)
    .map((row) => ({ price: row.bidPrice, lot: row.bidLot }))
    .sort((a, b) => b.price - a.price);
  const offers = book
    .filter((row) => row.offerPrice > 0 && row.offerLot > 0)
    .map((row) => ({ price: row.offerPrice, lot: row.offerLot }))
    .sort((a, b) => a.price - b.price);

  return Array.from({ length: LEVEL_COUNT }, (_, i) => ({
    bidPrice: bids[i]?.price || 0,
    bidLot: bids[i]?.lot || 0,
    offerPrice: offers[i]?.price || 0,
    offerLot: offers[i]?.lot || 0,
  }));
}

function writeBook(book) {
  const normalized = normalizeBook(book);
  document.querySelectorAll("[data-field]").forEach((input) => {
    const row = normalized[Number(input.dataset.index)];
    input.value = row[input.dataset.field] ? formatNumber(row[input.dataset.field]) : "";
  });
  render();
}

function addLevel(book, side, price, lot) {
  const priceKey = `${side}Price`;
  const lotKey = `${side}Lot`;
  const existing = book.find((row) => row[priceKey] === price);
  if (existing) {
    existing[lotKey] += lot;
    return;
  }
  book.push({
    bidPrice: side === "bid" ? price : 0,
    bidLot: side === "bid" ? lot : 0,
    offerPrice: side === "offer" ? price : 0,
    offerLot: side === "offer" ? lot : 0,
  });
}

function setBook(book) {
  writeBook(book);
}

function seedCandles(price = 3070, custom = {}) {
  candles = [];
  let current = price;
  for (let i = 0; i < 34; i += 1) {
    const drift = Math.round((Math.random() - 0.48) * tickSize(current) * 4);
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
  const previous = candles.at(-1)?.close || lastPrice || close;
  const tick = tickSize(previous);
  const bucket = timeframeSize();
  const boost = timeframeRangeBoost();

  if (bucket > 1) {
    tickCounter += 1;
    if (!pendingCandle) {
      pendingCandle = { open: previous, high: previous, low: previous, close: previous, volume: 0, force };
    }
    pendingCandle.high = Math.max(pendingCandle.high, close + tick * boost);
    pendingCandle.low = Math.max(tick, Math.min(pendingCandle.low, close - tick * boost));
    pendingCandle.close = close;
    pendingCandle.volume += volume;
    pendingCandle.force = force;
    if (tickCounter % bucket !== 0) {
      lastPrice = close;
      return;
    }
    candles.push(pendingCandle);
    pendingCandle = null;
    candles = candles.slice(-80);
    lastPrice = close;
    return;
  }

  const open = previous;
  const high = Math.max(open, close) + (force === "up" ? tick * 2 * boost : tick * boost);
  const low = Math.min(open, close) - (force === "down" ? tick * 2 * boost : tick * boost);
  candles.push({ open, high: Math.max(high, close), low: Math.max(tick, Math.min(low, close)), close, volume });
  candles = candles.slice(-80);
  lastPrice = close;
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
  const outstandingLots = (cap / Math.max(lastPrice, 1)) / SHARE_PER_LOT;
  const floatLots = Math.max(50_000, Math.round(outstandingLots * (freeFloat / 100)));
  const templates = [
    ["Bandar A", "bandar", "akumulasi", 0.22, 0.18],
    ["Bandar B", "bandar", "distribusi", 0.18, 0.16],
    ["Bandar C", "bandar", "random", 0.14, 0.14],
    ["Retail Pool", "retail", "random", 0.46, 0.52],
  ];

  actors = templates.map(([name, type, scenario, lotPart, cashPart]) => ({
    name,
    type,
    scenario,
    lots: auto ? Math.round(floatLots * lotPart) : 0,
    avgPrice: lastPrice,
    cash: auto ? Math.round(cap * 0.00002 * cashPart) : 0,
    net: 0,
  }));
}

function actorByName(name) {
  return actors.find((actor) => actor.name === name);
}

function updateActorTrade(actor, side, lots, price) {
  if (!actor || !lots) return;
  const gross = lots * price * SHARE_PER_LOT;
  if (side === "buy") {
    const oldValue = actor.avgPrice * actor.lots;
    actor.avgPrice = actor.lots + lots ? (oldValue + price * lots) / (actor.lots + lots) : price;
    actor.lots += lots;
    actor.cash -= gross;
    actor.net += lots;
  } else {
    const sellLots = Math.min(lots, actor.lots);
    actor.lots -= sellLots;
    actor.cash += sellLots * price * SHARE_PER_LOT;
    actor.net -= sellLots;
    if (actor.lots === 0) actor.avgPrice = 0;
  }
}

function randomRetailActor() {
  return actorByName("Retail Pool");
}

function log(message) {
  const stamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  logs.unshift(`<strong>${stamp}</strong> ${message}`);
  logs = logs.slice(0, 16);
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

function executeMarket(side, requestedLots, label) {
  const originalRequest = Math.max(0, Math.floor(requestedLots));
  let executableRequest = originalRequest;
  const book = readBook();
  const takeSide = side === "buy" ? "offer" : "bid";
  const priceKey = `${takeSide}Price`;
  const lotKey = `${takeSide}Lot`;

  if (side === "sell") executableRequest = Math.min(executableRequest, portfolio.lots);
  if (side === "buy") executableRequest = affordableLotsFromOffers(book, executableRequest);

  let remaining = executableRequest;
  let gross = 0;
  let filled = 0;
  let last = 0;

  for (const row of book) {
    if (remaining <= 0) break;
    if (!row[priceKey] || !row[lotKey]) continue;
    const take = Math.min(remaining, row[lotKey]);
    row[lotKey] -= take;
    gross += take * row[priceKey] * SHARE_PER_LOT;
    filled += take;
    remaining -= take;
    last = row[priceKey];
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
    refillBookAfterTrade(book, side, last, false);
    writeBook(book);
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
  log(`${label}: filled ${formatNumber(filled)}/${formatNumber(originalRequest)} lot.`);
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
  const book = readBook();
  const requested = totalSide(book, "offer");
  const beforeCash = portfolio.cash;
  const result = executeMarket("buy", requested, "Hajar Semua Offer");
  if (!result.filled) return;

  const target = shockTarget("buy", result.last || lastPrice);
  lastPrice = target;
  addCandle(target, result.filled * 2, "up");
  refillShockBook("buy", target);
  setSummary({
    ...result,
    label: shockMode === "ara" ? "Hajar Semua Offer - ARA Shock" : "Hajar Semua Offer",
    last: target,
    reason: beforeCash <= 0 ? "Cash kosong." : "",
  });
  log(`Harga terdorong ke ${formatRp(target)} setelah offer tersapu.`);
  render();
}

function dumpBid() {
  const requested = portfolio.lots;
  const result = executeMarket("sell", requested, "Buang Semua Bid");
  if (!result.filled) return;

  const target = shockTarget("sell", result.last || lastPrice);
  lastPrice = target;
  addCandle(target, result.filled * 2, "down");
  refillShockBook("sell", target);
  setSummary({
    ...result,
    label: shockMode === "ara" ? "Buang Semua Bid - ARB Shock" : "Buang Semua Bid",
    last: target,
  });
  log(`Harga jatuh ke ${formatRp(target)} setelah bid dibuang.`);
  render();
}

function refillBookAfterTrade(book, side, price, heavy) {
  const tick = tickSize(price);
  if (side === "buy") {
    for (let i = 1; i <= LEVEL_COUNT; i += 1) {
      addLevel(book, "offer", price + tick * i, Math.round((heavy ? 420 : 120) + Math.random() * 520));
    }
  } else {
    for (let i = 1; i <= LEVEL_COUNT; i += 1) {
      addLevel(book, "bid", Math.max(tick, price - tick * i), Math.round((heavy ? 420 : 120) + Math.random() * 520));
    }
  }
}

function refillShockBook(side, price) {
  const tick = tickSize(price);
  const book = [];
  if (side === "buy") {
    for (let i = 1; i <= LEVEL_COUNT; i += 1) {
      book.push({
        bidPrice: price - tick * i,
        bidLot: Math.round(400 + Math.random() * 1200),
        offerPrice: price + tick * i,
        offerLot: shockMode === "ara" ? 0 : Math.round(80 + Math.random() * 260),
      });
    }
  } else {
    for (let i = 1; i <= LEVEL_COUNT; i += 1) {
      book.push({
        bidPrice: Math.max(tick, price - tick * i),
        bidLot: shockMode === "ara" ? 0 : Math.round(80 + Math.random() * 260),
        offerPrice: price + tick * i,
        offerLot: Math.round(400 + Math.random() * 1200),
      });
    }
  }
  writeBook(book);
}

function placeLimit(side) {
  const lots = Math.max(0, Math.floor(parseInput(els.tradeLots.value)));
  const price = Math.max(0, Math.floor(parseInput(els.limitPrice.value)));
  if (!lots || !price) return;
  const book = readBook();
  if (side === "buy" && bestOffer(book) && price >= bestOffer(book)) {
    executeMarket("buy", lots, "Limit Buy marketable");
    return;
  }
  if (side === "sell" && bestBid(book) && price <= bestBid(book)) {
    executeMarket("sell", lots, "Limit Sell marketable");
    return;
  }
  pendingOrders.push({ id: Date.now() + Math.random(), side, price, lots });
  addLevel(book, side === "buy" ? "bid" : "offer", price, lots);
  writeBook(book);
  log(`Limit ${side} ${formatNumber(lots)} lot @ ${formatRp(price)} dipasang.`);
}

function processPending() {
  for (const order of pendingOrders) {
    if (order.side === "buy" && lastPrice <= order.price) {
      const affordable = Math.min(order.lots, Math.floor(portfolio.cash / (order.price * SHARE_PER_LOT * (1 + BUY_FEE))));
      if (affordable > 0) {
        const oldValue = portfolio.avgPrice * portfolio.lots;
        portfolio.avgPrice = (oldValue + order.price * affordable) / (portfolio.lots + affordable);
        portfolio.lots += affordable;
        portfolio.cash -= affordable * order.price * SHARE_PER_LOT * (1 + BUY_FEE);
        log(`Limit buy fill ${formatNumber(affordable)} lot @ ${formatRp(order.price)}.`);
      }
      order.lots = 0;
    }
    if (order.side === "sell" && lastPrice >= order.price) {
      const filled = Math.min(order.lots, portfolio.lots);
      if (filled > 0) {
        portfolio.realized += (order.price - portfolio.avgPrice) * filled * SHARE_PER_LOT;
        portfolio.cash += filled * order.price * SHARE_PER_LOT * (1 - SELL_FEE);
        portfolio.lots -= filled;
        if (portfolio.lots === 0) portfolio.avgPrice = 0;
        log(`Limit sell fill ${formatNumber(filled)} lot @ ${formatRp(order.price)}.`);
      }
      order.lots = 0;
    }
  }
  pendingOrders = pendingOrders.filter((order) => order.lots > 0);
}

function aiLimit(book, side, lot, distance = 1) {
  const tick = tickSize(lastPrice);
  const anchor = side === "bid" ? bestBid(book) || lastPrice - tick : bestOffer(book) || lastPrice + tick;
  const price = side === "bid" ? Math.max(tick, anchor - tick * distance) : anchor + tick * distance;
  addLevel(book, side, price, Math.max(1, Math.round(lot)));
  return price;
}

function consumeBookSide(book, side, lots, label) {
  const row =
    side === "buy"
      ? book.find((x) => x.offerPrice && x.offerLot)
      : book.find((x) => x.bidPrice && x.bidLot);
  if (!row) return 0;

  const priceKey = side === "buy" ? "offerPrice" : "bidPrice";
  const lotKey = side === "buy" ? "offerLot" : "bidLot";
  const take = Math.min(Math.max(1, Math.round(lots)), row[lotKey]);
  row[lotKey] -= take;
  lastPrice = row[priceKey];
  addCandle(lastPrice, take, side === "buy" ? "up" : "down");
  log(`${label}: ${side === "buy" ? "angkat offer" : "pukul bid"} ${formatNumber(take)} lot.`);
  return take;
}

function runRetailAi(book) {
  if (!retailAiOn) return;
  const actor = randomRetailActor();
  const impact = marketCapImpact();
  const lot = Math.max(1, Math.round((4 + Math.random() * 42) * impact));
  const action = Math.random();

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

function runBandarAi(book) {
  if (!bandarAiOn) return;
  const impact = marketCapImpact();
  const baseLot = Math.round((220 + Math.random() * 780) * impact);
  const bandarActors = actors.filter((actor) => actor.type === "bandar");
  const actor = bandarActors[Math.floor(Math.random() * bandarActors.length)] || actorByName("Bandar A");
  const scenario = actor?.scenario || "random";
  let intent = scenario;
  if (scenario === "random") intent = Math.random() > 0.5 ? "akumulasi" : "distribusi";

  if (intent === "akumulasi") {
    const price = aiLimit(book, "bid", baseLot * (1.5 + Math.random()), Math.ceil(Math.random() * 2));
    if (Math.random() < 0.48) {
      const filled = consumeBookSide(book, "buy", baseLot * 0.55, `${actor.name} akumulasi`);
      updateActorTrade(actor, "buy", filled, lastPrice);
    }
    log(`${actor.name} tebalin bid @ ${formatRp(price)} (${marketCapLabel()}).`);
  }

  if (intent === "distribusi") {
    const price = aiLimit(book, "offer", baseLot * (1.5 + Math.random()), Math.ceil(Math.random() * 2));
    if (Math.random() < 0.48) {
      const filled = consumeBookSide(book, "sell", Math.min(baseLot * 0.55, actor.lots), `${actor.name} distribusi`);
      updateActorTrade(actor, "sell", filled, lastPrice);
    }
    log(`${actor.name} tebalin offer @ ${formatRp(price)} (${marketCapLabel()}).`);
  }
}

function runNegoMarket() {
  if (!bandarAiOn || Math.random() > 0.2) return;
  const buyers = actors.filter((actor) => actor.scenario === "akumulasi" || actor.type === "retail");
  const sellers = actors.filter((actor) => actor.scenario === "distribusi" && actor.lots > 0);
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
  const book = readBook();
  runNegoMarket();
  runRetailAi(book);
  runBandarAi(book);
  const bidLots = totalSide(book, "bid");
  const offerLots = totalSide(book, "offer");
  const pressure = bidLots - offerLots;
  const side = pressure + negotiationBias * 1000 >= 0 ? "buy" : "sell";
  negotiationBias *= 0.82;
  const depth = Math.round((20 + Math.random() * 120) * marketCapImpact());
  const row = side === "buy" ? book.find((x) => x.offerPrice && x.offerLot) : book.find((x) => x.bidPrice && x.bidLot);
  if (!row) return;

  if (side === "buy") {
    const take = Math.min(depth, row.offerLot);
    row.offerLot -= take;
    lastPrice = row.offerPrice;
    addCandle(lastPrice, take, "up");
    log(`Tick buy menyerap ${formatNumber(take)} lot offer.`);
  } else {
    const take = Math.min(depth, row.bidLot);
    row.bidLot -= take;
    lastPrice = row.bidPrice;
    addCandle(lastPrice, take, "down");
    log(`Tick sell memukul ${formatNumber(take)} lot bid.`);
  }

  refillBookAfterTrade(book, side, lastPrice, false);
  writeBook(book);
  processPending();
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

function renderQuote() {
  const ar = autoReject(prevPrice);
  const ara = prevPrice * (1 + ar.up / 100);
  const arb = prevPrice * (1 - ar.down / 100);
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
  els.ohlcText.textContent = `O ${formatRp(lastCandle.open)} H ${formatRp(lastCandle.high)} L ${formatRp(lastCandle.low)} C ${formatRp(lastCandle.close)}`;
}

function renderOrders() {
  const pendingHtml = pendingOrders.length
    ? pendingOrders
        .map((order) => `<div class="order-item"><strong>${order.side.toUpperCase()}</strong> ${formatNumber(order.lots)} lot @ ${formatRp(order.price)}</div>`)
        .join("")
    : `<div class="order-item">Tidak ada pending limit.</div>`;
  const logHtml = logs.length
    ? logs.map((item) => `<div class="log-item">${item}</div>`).join("")
    : `<div class="log-item">Belum ada reaksi.</div>`;
  els.pendingOrders.innerHTML = pendingHtml;
  els.pendingOrdersDesktop.innerHTML = pendingHtml;
  els.tradeLog.innerHTML = logHtml;
  els.tradeLogDesktop.innerHTML = logHtml;
}

function renderHolders() {
  els.holderTable.innerHTML = actors
    .map((actor) => {
      const status = actor.type === "retail" ? "10 retail" : actor.scenario;
      const netClass = actor.net >= 0 ? "positive" : "negative";
      return `
        <div class="holder-row">
          <strong>${actor.name}</strong>
          <span>${formatNumber(actor.lots)} lot<br>avg ${actor.avgPrice ? formatRp(actor.avgPrice) : "-"}</span>
          <span class="${netClass}">net ${formatNumber(actor.net)}<br>${status}</span>
        </div>
      `;
    })
    .join("");
}

function renderActorSettings() {
  els.actorSettings.innerHTML = `
    <div class="actor-row actor-head">
      <strong>Pelaku</strong>
      <span>Barang</span>
      <span>Modal</span>
      <span>Skenario</span>
    </div>
  ` + actors
    .map(
      (actor, index) => `
        <div class="actor-row" data-actor-index="${index}">
          <strong>${actor.name}</strong>
          <input class="number-input lot-input actor-lots" type="text" value="${formatNumber(actor.lots)} lot" inputmode="numeric" aria-label="${actor.name} lots" />
          <input class="number-input currency-input actor-cash" type="text" value="${formatMoney(actor.cash)}" inputmode="numeric" aria-label="${actor.name} cash" />
          <select class="actor-scenario" aria-label="${actor.name} scenario">
            <option value="akumulasi" ${actor.scenario === "akumulasi" ? "selected" : ""}>Akum</option>
            <option value="distribusi" ${actor.scenario === "distribusi" ? "selected" : ""}>Distri</option>
            <option value="random" ${actor.scenario === "random" ? "selected" : ""}>Random</option>
            <option value="netral" ${actor.scenario === "netral" ? "selected" : ""}>Netral</option>
          </select>
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
  renderOrders();
  renderHolders();
  drawChart();
}

function syncActorSettings() {
  document.querySelectorAll(".actor-row").forEach((row) => {
    const actor = actors[Number(row.dataset.actorIndex)];
    if (!actor) return;
    actor.lots = Math.max(0, Math.round(parseInput(row.querySelector(".actor-lots").value)));
    actor.cash = Math.round(parseInput(row.querySelector(".actor-cash").value));
    actor.scenario = row.querySelector(".actor-scenario").value;
  });
  renderHolders();
}

function applyCustomPrice() {
  const close = parseInput(els.customLastPrice.value) || lastPrice;
  const customOpen = parseInput(els.customOpenPrice.value) || close;
  const customPrev = parseInput(els.customPrevPrice.value) || close;
  const customHigh = parseInput(els.customHighPrice.value) || Math.max(customOpen, close);
  const customLow = parseInput(els.customLowPrice.value) || Math.min(customOpen, close);
  lastPrice = close;
  openPrice = customOpen;
  prevPrice = customPrev;
  seedCandles(close, {
    open: customOpen,
    high: Math.max(customHigh, customOpen, close),
    low: Math.min(customLow, customOpen, close),
    close,
  });
  createActors(true);
  renderActorSettings();
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
    clearInterval(autoTimer);
    autoTimer = null;
    els.autoSimBtn.classList.remove("active");
    els.autoSimBtn.textContent = "Auto";
  }
  portfolio = { cash: parseInput(els.initialCash.value) || 1_000_000_000, lots: 0, avgPrice: 0, realized: 0 };
  pendingOrders = [];
  logs = [];
  negotiationBias = 0;
  prevPrice = 3070;
  openPrice = 3070;
  seedCandles(3070);
  createActors(true);
  renderActorSettings();
  setBook(sampleBook);
  els.limitPrice.value = "3,070";
  els.fillSummary.textContent = "Belum ada order.";
  els.fillSummaryDesktop.textContent = "Belum ada order.";
  log("Simulator reset.");
  render();
}

createRows();
seedCandles(3070);
createActors(true);
renderActorSettings();
setBook(sampleBook);
render();

document.addEventListener("input", (event) => {
  if (event.target.matches(".number-input:not([data-field])")) {
    event.target.value = sanitizeNumberText(event.target.value);
  }
  if (event.target === els.symbol) renderQuote();
  if (event.target === els.initialCash && portfolio.lots === 0) {
    portfolio.cash = parseInput(els.initialCash.value);
    renderPortfolio();
  }
  if (event.target === els.marketCap) {
    els.marketStatus.textContent = `Market cap impact: ${marketCapLabel()}`;
  }
  if (event.target === els.freeFloat) {
    els.marketStatus.textContent = `Free float ${parseInput(els.freeFloat.value) || 0}%`;
  }
  if (event.target.matches(".actor-lots, .actor-cash, .actor-scenario")) {
    syncActorSettings();
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
  },
  true,
);

els.marketBuyBtn.addEventListener("click", () => executeMarket("buy", parseInput(els.tradeLots.value), "Buy Market"));
els.marketSellBtn.addEventListener("click", () => executeMarket("sell", parseInput(els.tradeLots.value), "Sell Market"));
els.sweepOfferBtn.addEventListener("click", sweepOffer);
els.dumpBidBtn.addEventListener("click", dumpBid);
els.limitBuyBtn.addEventListener("click", () => placeLimit("buy"));
els.limitSellBtn.addEventListener("click", () => placeLimit("sell"));
els.applyPriceBtn.addEventListener("click", applyCustomPrice);
els.nextTickBtn.addEventListener("click", simulateTick);
els.sampleBtn.addEventListener("click", () => setBook(sampleBook));
els.clearBtn.addEventListener("click", () => setBook([]));
els.resetBookBtn.addEventListener("click", () => {
  setBook(sampleBook);
  log("Bid offer dikembalikan ke contoh awal.");
  render();
});
els.resetSimBtn.addEventListener("click", resetAll);
els.retailAiBtn.addEventListener("click", () => {
  retailAiOn = !retailAiOn;
  els.retailAiBtn.classList.toggle("active", retailAiOn);
  els.retailAiBtn.textContent = retailAiOn ? "On" : "Off";
  els.marketStatus.textContent = `Retail AI ${retailAiOn ? "on" : "off"}`;
});
els.bandarAiBtn.addEventListener("click", () => {
  bandarAiOn = !bandarAiOn;
  els.bandarAiBtn.classList.toggle("active", bandarAiOn);
  els.bandarAiBtn.textContent = bandarAiOn ? "On" : "Off";
  els.marketStatus.textContent = `Bandar AI ${bandarAiOn ? "on" : "off"}`;
});
els.capPresets.forEach((button) => {
  button.addEventListener("click", () => {
    els.marketCap.value = formatMoney(Number(button.dataset.cap));
    els.capPresets.forEach((preset) => preset.classList.remove("active"));
    button.classList.add("active");
    els.marketStatus.textContent = `Preset ${button.textContent}: ${marketCapLabel()}`;
    render();
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
els.timeframeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    timeframe = button.dataset.tf;
    pendingCandle = null;
    tickCounter = 0;
    els.timeframeButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    els.marketStatus.textContent = `Timeframe ${timeframe}`;
    render();
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
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
    els.autoSimBtn.classList.remove("active");
    els.autoSimBtn.textContent = "Auto";
  } else {
    autoTimer = setInterval(simulateTick, 1200);
    els.autoSimBtn.classList.add("active");
    els.autoSimBtn.textContent = "Stop";
  }
});

window.addEventListener("resize", drawChart);
