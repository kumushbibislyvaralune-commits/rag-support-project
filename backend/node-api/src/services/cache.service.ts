const { redisClient } = require("../config/redis.config");

const setCache = async (
  key,
  value,
  ttlInSeconds = 300
) => {
  try {
    await redisClient.set(
      key,
      JSON.stringify(value),
      "EX",
      ttlInSeconds
    );
  } catch (error) {
    console.log("Redis set error:", error);
  }
};

const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.log("Redis get error:", error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.log("Redis delete error:", error);
  }
};

module.exports = {
  setCache,
  getCache,
  deleteCache,
};