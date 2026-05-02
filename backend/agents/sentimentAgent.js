const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory cache — resets when server restarts (good enough for interview)
const sentimentCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Agent 4 — Market Sentiment Agent
 * Takes a list of stock names and returns Bullish/Bearish/Neutral sentiment
 * for each, with a one-line reason. Results are cached per session.
 */
const getMarketSentiment = async (stockNames) => {
  const now = Date.now();
  const uncached = stockNames.filter((name) => {
    const entry = sentimentCache.get(name);
    return !entry || now - entry.timestamp > CACHE_TTL_MS;
  });

  if (uncached.length > 0) {
    const tools = [
      {
        type: "function",
        function: {
          name: "analyse_market_sentiment",
          description: "Analyses market sentiment for a list of Indian stocks",
          parameters: {
            type: "object",
            properties: {
              stocks: {
                type: "array",
                items: { type: "string" },
                description: "List of stock ticker symbols to analyse",
              },
            },
            required: ["stocks"],
          },
        },
      },
    ];

    const messages = [
      {
        role: "system",
        content: `You are a market sentiment analyst for Indian stocks (NSE/BSE).
Based on your training knowledge about these companies' fundamentals, sector trends,
and general market position, classify each stock's sentiment.
Return ONLY valid JSON in this exact format:
{
  "sentiments": [
    { "stock": "TICKER", "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL", "reason": "under 10 words" },
    ...
  ]
}
Be realistic — not every stock is bullish. Base on fundamentals and sector outlook.`,
      },
      {
        role: "user",
        content: `Analyse sentiment for these Indian stocks: ${uncached.join(", ")}
Use the tool then provide your sentiment analysis.`,
      },
    ];

    const firstResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
    });

    const firstMessage = firstResponse.choices[0].message;
    let sentiments = [];

    if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
      const toolCall = firstMessage.tool_calls[0];

      messages.push(firstMessage);
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify({ stocks: uncached, acknowledged: true }),
      });

      const secondResponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(secondResponse.choices[0].message.content);
      sentiments = parsed.sentiments || [];
    } else {
      try {
        const parsed = JSON.parse(firstMessage.content);
        sentiments = parsed.sentiments || [];
      } catch {
        // Fallback: neutral for all
        sentiments = uncached.map((s) => ({
          stock: s,
          sentiment: "NEUTRAL",
          reason: "Analysis unavailable",
        }));
      }
    }

    // Store in cache
    sentiments.forEach((s) => {
      sentimentCache.set(s.stock, { ...s, timestamp: now });
    });
  }

  // Return all requested stocks from cache
  return stockNames.map((name) => {
    const cached = sentimentCache.get(name);
    if (cached) {
      const { timestamp, ...data } = cached;
      return data;
    }
    return { stock: name, sentiment: "NEUTRAL", reason: "Data unavailable" };
  });
};

module.exports = { getMarketSentiment };
