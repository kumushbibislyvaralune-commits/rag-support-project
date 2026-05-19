const express = require("express");

const { authenticateUser } = require("../middleware/auth.middleware");

const {
  createSupportTicket,
  getUserTickets,
} = require("../services/ticket.service");

const router = express.Router();

router.post(
  "/tickets",
  authenticateUser,
  async (req, res) => {
    try {
      const {
        conversationId,
        title,
        description,
        priority,
      } = req.body;

      const ticket = await createSupportTicket(
        req.user.id,
        conversationId,
        title,
        description,
        priority
      );

      return res.json({
        success: true,
        ticket,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        error: "Failed to create ticket",
      });
    }
  }
);

router.get(
  "/tickets",
  authenticateUser,
  async (req, res) => {
    try {
      const tickets = await getUserTickets(req.user.id);

      return res.json({
        success: true,
        tickets,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        error: "Failed to fetch tickets",
      });
    }
  }
);

module.exports = router;