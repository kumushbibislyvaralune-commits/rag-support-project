const { generateChatReply } = require("../services/chat.service");

const handleChatMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: "Conversation ID is required",
      });
    }

    const result = await generateChatReply(
      req.user.id,
      conversationId,
      message
    );

    return res.json({
      success: true,
      receivedMessage: message,
      conversationId,
      reply: result.reply,
      history: result.history,
      retrievedContext: result.retrievedContext,
      toolCalls: result.toolCalls || [],
      createdTickets: result.createdTickets || [],
    });
  } catch (error) {
    console.error("Chat controller error:", error);

    return res.status(500).json({
      success: false,
      error: "Chat request failed",
    });
  }
};

module.exports = {
  handleChatMessage,
};