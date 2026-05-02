const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Agent 3 — Order Query Agent
 * Converts a natural language question into a MongoDB-compatible filter,
 * runs it against the orders collection, and returns a plain-English answer.
 */
const queryOrders = async (naturalLanguageQuery, orders) => {
  const tools = [
    {
      type: "function",
      function: {
        name: "filter_orders",
        description:
          "Filters the orders array based on criteria derived from the user query",
        parameters: {
          type: "object",
          properties: {
            mode: {
              type: "string",
              enum: ["BUY", "SELL", "ALL"],
              description: "Filter by order mode",
            },
            stock_name: {
              type: "string",
              description: "Filter by specific stock name (uppercase), or empty for all",
            },
            date_range: {
              type: "string",
              enum: ["today", "this_week", "this_month", "all"],
              description: "Filter by date range",
            },
            sort_by: {
              type: "string",
              enum: ["date_desc", "date_asc", "value_desc", "value_asc"],
              description: "How to sort the results",
            },
            limit: {
              type: "number",
              description: "Max number of results to return",
            },
          },
          required: ["mode", "date_range"],
        },
      },
    },
  ];

  const messages = [
    {
      role: "system",
      content: `You are an order history assistant for a stock trading app.
The user will ask a natural language question about their order history.
Use the filter_orders tool to extract the right filter parameters, then
after receiving the filtered results, provide a concise plain-English answer.
Always respond with JSON in this format:
{
  "answer": "Plain English summary of the result",
  "filteredOrders": [...array of matching orders...],
  "count": number
}`,
    },
    {
      role: "user",
      content: `My order history: ${JSON.stringify(orders)}

Question: ${naturalLanguageQuery}

Use the tool to filter, then answer.`,
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
    const filters = JSON.parse(toolCall.function.arguments);

    // Apply filters in JavaScript
    let filtered = [...orders];

    if (filters.mode && filters.mode !== "ALL") {
      filtered = filtered.filter((o) => o.mode === filters.mode);
    }

    if (filters.stock_name && filters.stock_name.trim() !== "") {
      filtered = filtered.filter((o) =>
        o.name.toUpperCase().includes(filters.stock_name.toUpperCase())
      );
    }

    if (filters.date_range && filters.date_range !== "all") {
      const now = new Date();
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.createdAt);
        if (filters.date_range === "today") {
          return orderDate.toDateString() === now.toDateString();
        }
        if (filters.date_range === "this_week") {
          const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        }
        if (filters.date_range === "this_month") {
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        }
        return true;
      });
    }

    if (filters.sort_by) {
      filtered.sort((a, b) => {
        if (filters.sort_by === "date_desc") return new Date(b.createdAt) - new Date(a.createdAt);
        if (filters.sort_by === "date_asc") return new Date(a.createdAt) - new Date(b.createdAt);
        if (filters.sort_by === "value_desc") return b.price * b.qty - a.price * a.qty;
        if (filters.sort_by === "value_asc") return a.price * a.qty - b.price * b.qty;
        return 0;
      });
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    const toolResult = JSON.stringify({ filteredOrders: filtered, count: filtered.length });

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
    return { answer: firstMessage.content, filteredOrders: orders, count: orders.length };
  }
};

module.exports = { queryOrders };
