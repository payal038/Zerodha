require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { HoldingsModel } = require("./models/HoldingsModel");
const { PositionsModel } = require("./models/PositionsModel");
const { OrdersModel } = require("./models/OrdersModel");
const { UserModel } = require("./models/UserModel");

const { verifyToken, JWT_SECRET } = require("./middleware/auth");
const { analysePortfolio } = require("./agents/portfolioAdvisor");
const { checkOrderRisk } = require("./agents/orderRiskAgent");
const { queryOrders } = require("./agents/orderQueryAgent");
const { getMarketSentiment } = require("./agents/sentimentAgent");

const PORT = process.env.PORT || 3002;
const url = process.env.MONGO_URL;

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://zerodha-frontend-xfv6.onrender.com",
      "https://zerodha-silk.vercel.app",
      "https://zerodha-ldpm.onrender.com",
      "https://zerodha-cwjw-git-main-zerodhas-projects-ba18fd7a.vercel.app",
      "https://zerodha-cwjw-74oejmy1n-zerodhas-projects-ba18fd7a.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "Zerodha API running" }));

// ─── Auth Routes ─────────────────────────────────────────────────────────────

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Holdings (with live prices merged) ──────────────────────────────────────
app.get("/allHoldings", async (req, res) => {
  try {
    const allHoldings = await HoldingsModel.find({});
    if (!allHoldings.length) return res.json([]);
    const liveResults = await Promise.allSettled(
      allHoldings.map(h => yf.quote(`${h.name}.NS`))
    );
    const merged = allHoldings.map((h, i) => {
      const live = liveResults[i];
      if (live.status === "fulfilled" && live.value.regularMarketPrice) {
        const lp = live.value.regularMarketPrice;
        const chg = live.value.regularMarketChangePercent;
        const net = (((lp - h.avg) / h.avg) * 100).toFixed(2);
        return { ...h.toObject(), price: lp, day: `${chg >= 0 ? "+" : ""}${chg?.toFixed(2)}%`, net: `${net >= 0 ? "+" : ""}${net}%`, isLoss: lp < h.avg };
      }
      return h.toObject();
    });
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Positions (with live prices) ────────────────────────────────────────────
app.get("/allPositions", async (req, res) => {
  try {
    const all = await PositionsModel.find({});
    if (!all.length) return res.json([]);
    const liveResults = await Promise.allSettled(all.map(p => yf.quote(`${p.name}.NS`)));
    const merged = all.map((p, i) => {
      const live = liveResults[i];
      if (live.status === "fulfilled" && live.value.regularMarketPrice) {
        const lp = live.value.regularMarketPrice;
        const chg = live.value.regularMarketChangePercent;
        return { ...p.toObject(), price: lp, day: `${chg >= 0 ? "+" : ""}${chg?.toFixed(2)}%`, isLoss: lp < p.avg };
      }
      return p.toObject();
    });
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Orders ───────────────────────────────────────────────────────────────────
app.get("/allOrders", async (req, res) => {
  try {
    const allOrders = await OrdersModel.find({}).sort({ createdAt: -1 });
    res.json(allOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/newOrder", async (req, res) => {
  const { name, qty, price, mode } = req.body;
  if (!name || !qty || !price || !mode)
    return res.status(400).json({ message: "All order fields are required" });

  try {
    const newOrder = new OrdersModel({ name, qty, price, mode });
    await newOrder.save();
    res.json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Agent 1: Portfolio Advisor ───────────────────────────────────────────────
app.post("/api/analyse-portfolio", verifyToken, async (req, res) => {
  try {
    const holdings = await HoldingsModel.find({});
    if (holdings.length === 0)
      return res.status(400).json({ message: "No holdings found to analyse" });

    const analysis = await analysePortfolio(holdings);
    res.json(analysis);
  } catch (err) {
    console.error("Portfolio analysis error:", err.message);
    res.status(500).json({ error: "AI analysis failed. Please try again." });
  }
});

// ─── Agent 2: Order Risk Check ────────────────────────────────────────────────
app.post("/api/order-risk", async (req, res) => {
  const { name, qty, price } = req.body;
  if (!name || !qty || !price)
    return res.status(400).json({ message: "name, qty, and price are required" });

  try {
    const holdings = await HoldingsModel.find({});
    const riskResult = await checkOrderRisk({ name, qty: Number(qty), price: Number(price) }, holdings);
    res.json(riskResult);
  } catch (err) {
    console.error("Order risk error:", err.message);
    res.status(500).json({ error: "Risk check failed. Please try again." });
  }
});

// ─── Agent 3: Natural Language Order Query ────────────────────────────────────
app.post("/api/query-orders", async (req, res) => {
  const { query } = req.body;
  if (!query || query.trim() === "")
    return res.status(400).json({ message: "Query is required" });

  try {
    const allOrders = await OrdersModel.find({}).sort({ createdAt: -1 });
    const result = await queryOrders(query, allOrders);
    res.json(result);
  } catch (err) {
    console.error("Order query error:", err.message);
    res.status(500).json({ error: "Query failed. Please try again." });
  }
});

// ─── Agent 4: Market Sentiment ────────────────────────────────────────────────
app.post("/api/market-sentiment", async (req, res) => {
  const { stocks } = req.body;
  if (!stocks || !Array.isArray(stocks) || stocks.length === 0)
    return res.status(400).json({ message: "stocks array is required" });

  try {
    const sentiments = await getMarketSentiment(stocks);
    res.json({ sentiments });
  } catch (err) {
    console.error("Sentiment error:", err.message);
    res.status(500).json({ error: "Sentiment analysis failed. Please try again." });
  }
});

// ─── Real-time Prices (Yahoo Finance) ────────────────────────────────────────
const YahooFinance = require("yahoo-finance2").default;
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
app.get("/api/prices", async (req, res) => {
  const symbols = (req.query.symbols || "").split(",").filter(Boolean);
  if (!symbols.length) return res.status(400).json({ message: "symbols required" });
  try {
    const results = await Promise.allSettled(
      symbols.map(s => yf.quote(`${s}.NS`))
    );
    const prices = {};
    results.forEach((r, i) => {
      prices[symbols[i]] = r.status === "fulfilled"
        ? { price: r.value.regularMarketPrice, change: r.value.regularMarketChangePercent?.toFixed(2) }
        : { price: null, change: null };
    });
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Agent 5: MCP-powered AI Chat ────────────────────────────────────────────
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MCP_TOOLS = [
  { type:"function", function:{ name:"get_holdings", description:"Get all stock holdings with live prices", parameters:{ type:"object", properties:{} } } },
  { type:"function", function:{ name:"get_orders",   description:"Get recent order history", parameters:{ type:"object", properties:{ limit:{ type:"number" } } } } },
  { type:"function", function:{ name:"place_order",  description:"Place a BUY or SELL order", parameters:{ type:"object", required:["name","qty","price","mode"], properties:{ name:{type:"string"}, qty:{type:"number"}, price:{type:"number"}, mode:{type:"string",enum:["BUY","SELL"]} } } } },
  { type:"function", function:{ name:"get_price",    description:"Get live price for a stock symbol", parameters:{ type:"object", required:["symbol"], properties:{ symbol:{type:"string"} } } } },
  { type:"function", function:{ name:"analyse_portfolio", description:"Run AI analysis on portfolio", parameters:{ type:"object", properties:{} } } },
];

async function runMCPTool(name, args) {
  switch(name) {
    case "get_holdings": {
      const h = await HoldingsModel.find({});
      const live = await Promise.allSettled(h.map(x => yf.quote(`${x.name}.NS`)));
      return h.map((x,i) => {
        const lp = live[i].status==="fulfilled" ? live[i].value.regularMarketPrice : x.price;
        return { name:x.name, qty:x.qty, avgCost:x.avg, livePrice:lp, pnl:((lp-x.avg)*x.qty).toFixed(2) };
      });
    }
    case "get_orders":
      return await OrdersModel.find({}).sort({createdAt:-1}).limit(args.limit||20);
    case "place_order": {
      const order = new OrdersModel(args);
      await order.save();
      return { success:true, message:`${args.mode} order placed: ${args.qty} × ${args.name} @ ₹${args.price}` };
    }
    case "get_price": {
      const q = await yf.quote(`${args.symbol}.NS`);
      return { symbol:args.symbol, price:q.regularMarketPrice, change:`${q.regularMarketChangePercent?.toFixed(2)}%` };
    }
    case "analyse_portfolio": {
      const h = await HoldingsModel.find({});
      if (!h.length) return { error:"No holdings" };
      return await analysePortfolio(h);
    }
    default: return { error:"Unknown tool" };
  }
}

app.post("/api/chat", verifyToken, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error:"message required" });
  try {
    const messages = [
      { role:"system", content:`You are a smart Indian stock market trading assistant with access to the user's real portfolio, live prices, and order history. You can place orders, check prices, and analyse portfolios. Always use tools to get real data before answering. Be concise and helpful. Today: ${new Date().toDateString()}` },
      { role:"user", content: message }
    ];
    let response = await openai.chat.completions.create({ model:"gpt-4o-mini", messages, tools:MCP_TOOLS, tool_choice:"auto" });
    let msg = response.choices[0].message;
    // Agentic loop — keep calling tools until done
    while (msg.tool_calls?.length) {
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments || "{}");
        const result = await runMCPTool(tc.function.name, args);
        messages.push({ role:"tool", tool_call_id:tc.id, content:JSON.stringify(result) });
      }
      response = await openai.chat.completions.create({ model:"gpt-4o-mini", messages, tools:MCP_TOOLS, tool_choice:"auto" });
      msg = response.choices[0].message;
    }
    res.json({ reply: msg.content });
  } catch(err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DB + Server ──────────────────────────────────────────────────────────────
mongoose
  .connect(url)
  .then(() => {
    console.log("✅ DB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
