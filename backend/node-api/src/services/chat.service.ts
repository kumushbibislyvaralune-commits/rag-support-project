const {
  generateAIResponse,
} = require("../ai/ai.provider");

const {
  saveMessage,
  getChatHistory,
} = require("./chat.db.service");

const {
  retrieveRelevantChunks,
} = require("../documents/retrieval.service");

const {
  handleToolCall,
} = require("./ticket.service");

const generateChatReply = async (
  userId,
  conversationId,
  message
) => {
  await saveMessage(
    userId,
    conversationId,
    "user",
    message
  );

  const history = await getChatHistory(
    userId,
    conversationId
  );

  const retrievedContext =
    await retrieveRelevantChunks(userId, message);

  const aiMessage = await generateAIResponse(
    message,
    history,
    retrievedContext.results || []
  );

  let finalReply =
    aiMessage.content ||
    "Sorry, I could not generate a response.";

  const toolCalls = aiMessage.tool_calls || [];

  const createdTickets = [];

  if (toolCalls.length > 0) {
    for (const toolCall of toolCalls) {
      const toolResult = await handleToolCall(
        toolCall,
        userId,
        conversationId
      );

      if (toolResult.success && toolResult.ticket) {
        createdTickets.push(toolResult.ticket);

        finalReply += `

Support ticket created successfully.

Ticket ID: ${toolResult.ticket.id}
Priority: ${toolResult.ticket.priority}
Title: ${toolResult.ticket.title}
        `;
      }
    }
  }

  await saveMessage(
    userId,
    conversationId,
    "assistant",
    finalReply
  );

  const updatedHistory = await getChatHistory(
    userId,
    conversationId
  );

  return {
    reply: finalReply,
    history: updatedHistory,
    retrievedContext,
    toolCalls,
    createdTickets,
  };
};

module.exports = {
  generateChatReply,
};