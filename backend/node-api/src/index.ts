const cors = require("cors");
require("dotenv").config();

const express = require("express");

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const uploadRoutes = require("./routes/upload.routes");
const retrievalRoutes = require("./routes/retrieval.routes");
const conversationRoutes = require("./routes/conversation.routes");
const streamRoutes = require("./routes/stream.routes");
const ticketRoutes = require("./routes/ticket.routes");

const { connectRedis } = require("./config/redis.config");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/api", authRoutes);
app.use("/api", chatRoutes);
app.use("/api", uploadRoutes);
app.use("/api", retrievalRoutes);
app.use("/api", conversationRoutes);
app.use("/api", streamRoutes);
app.use("/api", ticketRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

connectRedis();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});