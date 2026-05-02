const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Agent 1 — Portfolio Advisor
 * Reads all holdings, computes P&L, calls OpenAI with tool use to
 * analyse the portfolio and return 3 actionable rebalancing suggestions.
 */
const analysePortfolio = async (holdings) => {
  const portfolioSummary = holdings.map((h) => ({
    stock: h.name,
    qty: h.qty,
    avgCost: h.avg,
    currentPrice: h.price,
    currentValue: +(h.price * h.qty).toFixed(2),
    pnl: +(h.price * h.qty - h.avg * h.qty).toFixed(2),
    netChange: h.net,
    dayChange: h.day,
    isLoss: h.isLoss || false,
  }));

  const totalInvested = portfolioSummary.reduce((s, h) => s + h.avgCost * h.qty, 0);
  const totalCurrent = portfolioSummary.reduce((s, h) => s + h.currentValue, 0);
  const totalPnL = +(totalCurrent - totalInvested).toFixed(2);
  const pnlPercent = +((totalPnL / totalInvested) * 100).toFixed(2);

  const tools = [
    {
      type: "function",
      function: {
        name: "get_portfolio_data",
        description: "Returns the structured portfolio data for analysis",
        parameters: {
          type: "object",
          properties: {
            include_losers: {
              type: "boolean",
              description: "Whether to include losing positions in the analysis",
            },
          },
          required: ["include_losers"],
        },
      },
    },
  ];

  const messages = [
    {
      role: "system",
      content: `You are an expert Indian stock market portfolio advisor.
Analyse the given portfolio and provide exactly 3 concise, actionable recommendations.
Each recommendation must be practical and specific to the stocks in the portfolio.
Format your response as JSON with this structure:
{
  "summary": "One sentence overall portfolio health summary",
  "totalPnL": number,
  "pnlPercent": number,
  "recommendations": [
    { "type": "BUY|SELL|HOLD|REBALANCE", "stock": "STOCKNAME", "reason": "concise reason under 20 words" },
    { "type": "BUY|SELL|HOLD|REBALANCE", "stock": "STOCKNAME", "reason": "concise reason under 20 words" },
    { "type": "BUY|SELL|HOLD|REBALANCE", "stock": "STOCKNAME", "reason": "concise reason under 20 words" }
  ],
  "riskLevel": "LOW|MEDIUM|HIGH",
  "diversificationScore": number between 1-10
}`,
    },
    {
      role: "user",
      content: `Analyse my portfolio:
Total Invested: ₹${totalInvested.toFixed(2)}
Current Value: ₹${totalCurrent.toFixed(2)}
Overall P&L: ₹${totalPnL} (${pnlPercent}%)

Holdings:
${JSON.stringify(portfolioSummary, null, 2)}

Use the tool to get portfolio data then provide your analysis.`,
    },
  ];

  // First call — model may call the tool
  const firstResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools,
    tool_choice: "auto",
  });

  const firstMessage = firstResponse.choices[0].message;

  // Handle tool call if model chose to use it
  if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
    const toolCall = firstMessage.tool_calls[0];
    const toolResult = JSON.stringify({
      holdings: portfolioSummary,
      totalInvested,
      totalCurrent,
      totalPnL,
      pnlPercent,
    });

    messages.push(firstMessage);
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: toolResult,
    });

    const secondResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
    });

    const content = secondResponse.choices[0].message.content;
    return JSON.parse(content);
  }

  // Model answered directly
  const content = firstMessage.content;
  try {
    return JSON.parse(content);
  } catch {
    return { summary: content, recommendations: [], totalPnL, pnlPercent };
  }
};

module.exports = { analysePortfolio };
