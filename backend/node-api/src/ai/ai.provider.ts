const httpClient = require("../lib/httpClient");

const TOOLS = [
  {
    type: "function",
    function: {
      name: "create_support_ticket",
      description:
        "Create a support ticket when the customer has a serious issue or asks for human support.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Short ticket title",
          },
          description: {
            type: "string",
            description: "Detailed support issue description",
          },
          priority: {
            type: "string",
            enum: ["low", "normal", "high", "urgent"],
          },
        },
        required: ["title", "description"],
      },
    },
  },
];

const COMPANY_CONTEXT = `
Company Name: AI Support Company

Support Email: support@aisupport.com

Support Phone: +1-800-555-1000

Company Description:
We provide AI-powered customer support solutions and technical assistance.
`;

const generateAIResponse = async (
  message,
  history = [],
  retrievedContext = []
) => {
  try {
    const formattedContext = retrievedContext
      .map(
        (item) =>
          `
Source: ${item.source}
Page: ${item.page}
Content: ${item.text}
        `.trim()
      )
      .join("\n\n");

    const response = await httpClient.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "system",
            content: `
You are a professional AI customer support assistant.

Rules:
1. Use uploaded document context when relevant.
2. Cite sources exactly like:
[Source: filename page X]
3. If information is missing, say it clearly.
4. If issue requires human support, use the create_support_ticket tool.
5. Be concise and professional.

${COMPANY_CONTEXT}

Knowledge Base Context:
${formattedContext}
            `,
          },

          ...history,

          {
            role: "user",
            content: message,
          },
        ],

        tools: TOOLS,
        tool_choice: "auto",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY?.trim()}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message;
  } catch (error) {
    console.error(
      "AI provider error:",
      error.response?.data || error.message
    );

    return {
      role: "assistant",
      content:
        "Sorry, I could not generate a response right now.",
    };
  }
};

module.exports = {
  generateAIResponse,
};