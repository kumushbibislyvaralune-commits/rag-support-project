const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://redis:6379",
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
};

module.exports = {
  redisClient,
  connectRedis,
};