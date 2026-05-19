const { authenticateUser } = require("../middleware/auth.middleware");
const express = require("express");
const { handleChatMessage } = require("../controllers/chat.controller");

const router = express.Router();

router.post("/chat", authenticateUser, handleChatMessage);

module.exports = router;