const express = require("express");

const { authenticateUser } = require("../middleware/auth.middleware");

const {
  createConversation,
  getUserConversations,
  updateConversationTitle,
} = require("../services/conversation.db.service");

const {
  getConversationMessages,
} = require("../services/chat.db.service");

const router = express.Router();

router.post("/conversations", authenticateUser, async (req, res) => {
  try {
    const { title } = req.body;

    const conversation = await createConversation(
      req.user.id,
      title || "New Chat"
    );

    return res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to create conversation",
    });
  }
});

router.get("/conversations", authenticateUser, async (req, res) => {
  try {
    const conversations = await getUserConversations(req.user.id);

    return res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Load conversations error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to load conversations",
    });
  }
});

router.get(
  "/conversations/:id/messages",
  authenticateUser,
  async (req, res) => {
    try {
      const conversationId = req.params.id;

      const messages = await getConversationMessages(
        req.user.id,
        conversationId
      );

      return res.json({
        success: true,
        conversationId,
        messages,
      });
    } catch (error) {
      console.error("Load messages error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to load messages",
      });
    }
  }
);

router.put(
  "/conversations/:id/title",
  authenticateUser,
  async (req, res) => {
    try {
      const conversationId = req.params.id;
      const { title } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          error: "Title is required",
        });
      }

      const updatedConversation = await updateConversationTitle(
        req.user.id,
        conversationId,
        title.trim()
      );

      return res.json({
        success: true,
        conversation: updatedConversation,
      });
    } catch (error) {
      console.error("Update title error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to update title",
      });
    }
  }
);

module.exports = router;