const pool = require("../config/database.config");

const saveVectorToDatabase = async (
  userId,
  text,
  vector,
  source = "manual-input",
  page = 1
) => {
  const query = `
    INSERT INTO document_vectors (user_id, content, vector, source, page_number)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [userId, text, JSON.stringify(vector), source, page];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getVectorsFromDatabase = async (userId) => {
  const result = await pool.query(
    `
    SELECT * FROM document_vectors
    WHERE user_id = $1
    ORDER BY id DESC
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    text: row.content,
    vector: JSON.parse(row.vector),
    source: row.source || "manual-input",
    page: row.page_number || 1,
  }));
};

module.exports = {
  saveVectorToDatabase,
  getVectorsFromDatabase,
};