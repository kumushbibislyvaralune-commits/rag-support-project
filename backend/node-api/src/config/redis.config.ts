const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL;

const redis = redisUrl
  ? new Redis(redisUrl)
  : new Redis({
      host: "redis",
      port: 6379,
    });

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error) => {
  console.log("Redis error:", error);
});

module.exports = redis;