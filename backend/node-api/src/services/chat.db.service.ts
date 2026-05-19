const pool = require("../config/database.config");

const saveMessage = async (userId, conversationId, role, content) => {
  const query = `
    INSERT INTO chat_messages (user_id, conversation_id, role, content)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [userId, conversationId, role, content];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getChatHistory = async (userId, conversationId) => {
  const result = await pool.query(
    `
    SELECT role, content
    FROM chat_messages
    WHERE user_id = $1 AND conversation_id = $2
    ORDER BY id DESC
    LIMIT 10;
    `,
    [userId, conversationId]
  );

  return result.rows.reverse().map((row) => ({
    role: row.role,
    content: row.content,
  }));
};

const getConversationMessages = async (userId, conversationId) => {
  const result = await pool.query(
    `
    SELECT id, role, content, created_at
    FROM chat_messages
    WHERE user_id = $1 AND conversation_id = $2
    ORDER BY id ASC;
    `,
    [userId, conversationId]
  );

  return result.rows;
};

module.exports = {
  saveMessage,
  getChatHistory,
  getConversationMessages,
};