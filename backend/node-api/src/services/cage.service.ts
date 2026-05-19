const { redisClient } = require("../config/redis.config");

const setCache = async (key, value, expiration = 3600) => {
  await redisClient.set(
    key,
    JSON.stringify(value),
    {
      EX: expiration,
    }
  );
};

const getCache = async (key) => {
  const data = await redisClient.get(key);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
};

const deleteCache = async (key) => {
  await redisClient.del(key);
};

module.exports = {
  setCache,
  getCache,
  deleteCache,
};