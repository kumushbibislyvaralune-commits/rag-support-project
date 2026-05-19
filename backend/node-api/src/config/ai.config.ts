const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || "mock-ai",
  model: process.env.AI_MODEL || "support-assistant-v1",
};

module.exports = AI_CONFIG;