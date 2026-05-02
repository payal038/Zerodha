require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const mongoose = require("mongoose");

const { HoldingsModel } = require("../models/HoldingsModel");
const { OrdersModel }   = require("../models/OrdersModel");
const { analysePortfolio } = require("../agents/portfolioAdvisor");

const YahooFinance = require("yahoo-finance2").default;
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const server = new McpServer({ name: "zerodha-trading", version: "1.0.0" });

// ── Tool 1: Get Holdings ──────────────────────────────────────────────────────
server.tool("get_holdings", "Get all current stock holdings with live prices", {}, async () => {
  await ensureDB();
  const holdings = await HoldingsModel.find({});
  const liveResults = await Promise.allSettled(holdings.map(h => yf.quote(`${h.name}.NS`)));
  const merged = holdings.map((h, i) => {
    const live = liveResults[i];
    if (live.status === "fulfilled" && live.value.regularMarketPrice) {
      const lp = live.value.regularMarketPrice;
      const pnl = ((lp - h.avg) / h.avg * 100).toFixed(2);
      return { name: h.name, qty: h.qty, avgCost: h.avg, livePrice: lp, pnlPct: `${pnl}%`, value: (lp * h.qty).toFixed(2) };
    }
    return { name: h.name, qty: h.qty, avgCost: h.avg, livePrice: h.price, pnlPct: h.net, value: (h.price * h.qty).toFixed(2) };
  });
  return { content: [{ type: "text", text: JSON.stringify(merged, null, 2) }] };
});

// ── Tool 2: Get Orders ────────────────────────────────────────────────────────
server.tool("get_orders", "Get recent order history", { limit: z.number().optional() }, async ({ limit = 20 }) => {
  await ensureDB();
  const orders = await OrdersModel.find({}).sort({ createdAt: -1 }).limit(limit);
  return { content: [{ type: "text", text: JSON.stringify(orders, null, 2) }] };
});

// ── Tool 3: Place Order ───────────────────────────────────────────────────────
server.tool("place_order", "Place a BUY or SELL order",
  { name: z.string(), qty: z.number(), price: z.number(), mode: z.enum(["BUY", "SELL"]) },
  async ({ name, qty, price, mode }) => {
    await ensureDB();
    const order = new OrdersModel({ name, qty, price, mode });
    await order.save();
    return { content: [{ type: "text", text: `✅ ${mode} order placed: ${qty} shares of ${name} @ ₹${price}` }] };
  }
);

// ── Tool 4: Get Live Price ────────────────────────────────────────────────────
server.tool("get_price", "Get real-time price for a stock", { symbol: z.string() }, async ({ symbol }) => {
  const quote = await yf.quote(`${symbol}.NS`);
  return {
    content: [{
      type: "text",
      text: `${symbol}: ₹${quote.regularMarketPrice} (${quote.regularMarketChangePercent?.toFixed(2)}% today)`
    }]
  };
});

// ── Tool 5: Analyse Portfolio ─────────────────────────────────────────────────
server.tool("analyse_portfolio", "Run AI analysis on the portfolio", {}, async () => {
  await ensureDB();
  const holdings = await HoldingsModel.find({});
  if (!holdings.length) return { content: [{ type: "text", text: "No holdings found to analyse." }] };
  const result = await analysePortfolio(holdings);
  const text = [
    result.summary,
    result.recommendations?.length ? "\nRecommendations:\n" + result.recommendations.map((r,i) => `${i+1}. [${r.type}] ${r.stock} — ${r.reason}`).join("\n") : "",
    result.riskLevel ? `\nRisk: ${result.riskLevel} · Diversification: ${result.diversificationScore}/10` : ""
  ].join("");
  return { content: [{ type: "text", text }] };
});

// ── DB helper ─────────────────────────────────────────────────────────────────
let dbConnected = false;
async function ensureDB() {
  if (!dbConnected) {
    await mongoose.connect(process.env.MONGO_URL);
    dbConnected = true;
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  process.stderr.write("🚀 Zerodha MCP server running\n");
});
