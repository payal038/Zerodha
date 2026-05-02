const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Agent 2 — Order Risk Agent
 * Before a buy order is placed, checks portfolio concentration and
 * returns a risk verdict: SAFE / CAUTION / BLOCKED with reasoning.
 */
const checkOrderRisk = async (orderDetails, holdings) => {
  const { name, qty, price } = orderDetails;
  const orderValue = qty * price;

  const totalPortfolioValue = holdings.reduce(
    (sum, h) => sum + h.price * h.qty,
    0
  );

  // Check if stock already exists in holdings
  const existingHolding = holdings.find(
    (h) => h.name.toUpperCase() === name.toUpperCase()
  );
  const existingValue = existingHolding
    ? existingHolding.price * existingHolding.qty
    : 0;

  const newTotalForStock = existingValue + orderValue;
  const newPortfolioTotal = totalPortfolioValue + orderValue;
  const concentrationPercent = +((newTotalForStock / newPortfolioTotal) * 100).toFixed(2);

  const tools = [
    {
      type: "function",
      function: {
        name: "calculate_risk_metrics",
        description: "Calculates portfolio risk metrics for the proposed order",
        parameters: {
          type: "object",
          properties: {
            stock_name: { type: "string" },
            order_value: { type: "number" },
            concentration_percent: { type: "number" },
          },
          required: ["stock_name", "order_value", "concentration_percent"],
        },
      },
    },
  ];

  const messages = [
    {
      role: "system",
      content: `You are a risk management system for a stock trading platform.
Evaluate the risk of a proposed buy order based on portfolio concentration.
Return ONLY valid JSON in this exact format:
{
  "verdict": "SAFE" | "CAUTION" | "BLOCKED",
  "concentrationPercent": number,
  "reason": "One sentence explanation under 15 words",
  "suggestion": "One sentence alternative action under 15 words"
}

Rules:
- SAFE: concentration < 20%
- CAUTION: concentration 20–35%
- BLOCKED: concentration > 35%`,
    },
    {
      role: "user",
      content: `Evaluate this order:
Stock: ${name}
Order Qty: ${qty}
Order Price: ₹${price}
Order Value: ₹${orderValue.toFixed(2)}
Current Portfolio Value: ₹${totalPortfolioValue.toFixed(2)}
Existing position in ${name}: ₹${existingValue.toFixed(2)}
New concentration if order placed: ${concentrationPercent}%

Portfolio holdings: ${JSON.stringify(
        holdings.map((h) => ({ name: h.name, value: +(h.price * h.qty).toFixed(2) }))
      )}`,
    },
  ];

  const firstResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools,
    tool_choice: "auto",
  });

  const firstMessage = firstResponse.choices[0].message;

  if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
    const toolCall = firstMessage.tool_calls[0];
    const toolResult = JSON.stringify({
      stock_name: name,
      order_value: orderValue,
      concentration_percent: concentrationPercent,
      existing_value: existingValue,
      portfolio_total: totalPortfolioValue,
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

    return JSON.parse(secondResponse.choices[0].message.content);
  }

  try {
    return JSON.parse(firstMessage.content);
  } catch {
    // Fallback: rule-based verdict if OpenAI fails
    let verdict = "SAFE";
    if (concentrationPercent > 35) verdict = "BLOCKED";
    else if (concentrationPercent > 20) verdict = "CAUTION";

    return {
      verdict,
      concentrationPercent,
      reason: `${name} would be ${concentrationPercent}% of your portfolio`,
      suggestion: verdict === "SAFE" ? "Order looks fine to proceed" : "Consider reducing order quantity",
    };
  }
};

module.exports = { checkOrderRisk };
