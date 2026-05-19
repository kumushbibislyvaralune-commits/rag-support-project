const express = require("express");
const httpClient = require("../lib/httpClient");

const { authenticateUser } = require("../middleware/auth.middleware");
const { saveMessage, getChatHistory } = require("../services/chat.db.service");
const { retrieveRelevantChunks } = require("../documents/retrieval.service");
const { createSupportTicket } = require("../services/ticket.service");

const router = express.Router();

const shouldCreateTicketFromMessage = (message) => {
  const lowerMessage = message.toLowerCase();

  const keywords = [
    "refund",
    "payment failed",
    "angry",
    "broken",
    "urgent",
    "human",
    "support ticket",
    "not working",
    "cancel",
    "complaint",
    "escalate",
  ];

  return keywords.some((keyword) => lowerMessage.includes(keyword));
};

router.get("/chat/stream", authenticateUser, async (req, res) => {
  const message = String(req.query.message || "");
  const conversationId = String(req.query.conversationId || "");

  if (!message.trim() || !conversationId.trim()) {
    return res.status(400).json({
      success: false,
      error: "Message and conversationId are required",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    await saveMessage(req.user.id, conversationId, "user", message);

    const history = await getChatHistory(req.user.id, conversationId);
    const retrievedContext = await retrieveRelevantChunks(req.user.id, message);

    const citationContext = (retrievedContext.results || []).map(
      (item, index) => ({
        citationId: index + 1,
        source: item.source || "unknown-source",
        page: item.page || 1,
        text: item.text || "",
      })
    );

    const shouldEscalate = shouldCreateTicketFromMessage(message);

    let createdTicket = null;

    if (shouldEscalate) {
      createdTicket = await createSupportTicket(
        req.user.id,
        conversationId,
        "Escalated Support Request",
        message,
        "high"
      );
    }

    const response = await httpClient.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        stream: true,
        messages: [
          {
            role: "system",
            content: `
You are an AI customer support assistant.

Rules:
1. Answer clearly and professionally.
2. Use uploaded document context when relevant.
3. If you use document context, cite it exactly like this:
[Source: file name, page number]
4. If the answer is not found in uploaded documents, say that clearly.
5. If a support ticket was created, tell the user clearly.
6. Do not invent document sources or page numbers.
            `.trim(),
          },
          {
            role: "system",
            content: `
Company knowledge context:
${JSON.stringify(citationContext)}
            `.trim(),
          },
          {
            role: "system",
            content: createdTicket
              ? `A support ticket has already been created. Ticket ID: ${createdTicket.id}. Priority: ${createdTicket.priority}.`
              : "If the issue cannot be solved from the available context, suggest creating a support ticket.",
          },
          ...history.map((item) => ({
            role: item.role,
            content: item.content,
          })),
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY?.trim()}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    let fullReply = "";

    response.data.on("data", (chunk) => {
      const lines = chunk
        .toString()
        .split("\n")
        .filter((line) => line.trim().startsWith("data:"));

      for (const line of lines) {
        const data = line.replace("data:", "").trim();

        if (data === "[DONE]") {
          res.write("data: [DONE]\n\n");
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || "";

          if (content) {
            fullReply += content;
            res.write(`data: ${JSON.stringify(content)}\n\n`);
          }
        } catch {
          // Ignore malformed stream chunks
        }
      }
    });

    response.data.on("end", async () => {
      if (createdTicket) {
        fullReply += `

Support ticket created successfully.

Ticket ID: ${createdTicket.id}
Priority: ${createdTicket.priority}
Title: ${createdTicket.title}
`;
      }

      if (fullReply.trim()) {
        await saveMessage(req.user.id, conversationId, "assistant", fullReply);
      }

      res.end();
    });

    response.data.on("error", (error) => {
      console.error("Groq stream error:", error);

      res.write("data: [ERROR]\n\n");
      res.end();
    });
  } catch (error) {
    console.log(
      "Streaming error:",
      error.response?.data || error.message || error
    );

    res.write(
      `data: ${JSON.stringify(
        "Sorry, the AI service failed. Check backend logs."
      )}\n\n`
    );

    res.write("data: [DONE]\n\n");
    res.end();
  }
});

module.exports = router;