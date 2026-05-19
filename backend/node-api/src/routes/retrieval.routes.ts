const express = require("express");
const { authenticateUser } = require("../middleware/auth.middleware");
const {
  retrieveRelevantChunks,
} = require("../documents/retrieval.service");

const router = express.Router();

router.get("/retrieve", authenticateUser, async (req, res) => {
  const query = req.query.query || "";

  const results = await retrieveRelevantChunks(req.user.id, query);

  res.json({
    success: true,
    ...results,
  });
});

module.exports = router;