const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL;

const redisClient = redisUrl
  ? new Redis(redisUrl)
  : new Redis({
      host: "redis",
      port: 6379,
    });

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (error) => {
  console.log("Redis error:", error);
});

const connectRedis = async () => {
  return redisClient;
};

module.exports = {
  redisClient,
  connectRedis,
};