const pool = require("../config/database.config");

const {
  setCache,
  getCache,
  deleteCache,
} = require("./cache.service");

const createConversation = async (
  userId,
  title = "New Chat"
) => {
  const query = `
    INSERT INTO conversations (user_id, title)
    VALUES ($1, $2)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    userId,
    title,
  ]);

  await deleteCache(`conversations:${userId}`);

  return result.rows[0];
};

const getUserConversations = async (userId) => {
  const cacheKey = `conversations:${userId}`;

  const cachedConversations = await getCache(cacheKey);

  if (cachedConversations) {
    return cachedConversations;
  }

  const result = await pool.query(
    `
    SELECT *
    FROM conversations
    WHERE user_id = $1
    ORDER BY created_at DESC;
    `,
    [userId]
  );

  await setCache(cacheKey, result.rows, 300);

  return result.rows;
};

const updateConversationTitle = async (
  userId,
  conversationId,
  title
) => {
  const result = await pool.query(
    `
    UPDATE conversations
    SET title = $1
    WHERE id = $2
    AND user_id = $3
    RETURNING *;
    `,
    [title, conversationId, userId]
  );

  await deleteCache(`conversations:${userId}`);

  return result.rows[0];
};

module.exports = {
  createConversation,
  getUserConversations,
  updateConversationTitle,
};