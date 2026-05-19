const pool = require("../config/database.config");

const {
  createGitHubIssue,
} = require("./github.service");

const createSupportTicket = async (
  userId,
  conversationId,
  title,
  description,
  priority = "normal"
) => {
  const result = await pool.query(
    `
    INSERT INTO support_tickets
    (
      user_id,
      conversation_id,
      title,
      description,
      priority
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [
      userId,
      conversationId,
      title,
      description,
      priority,
    ]
  );

  const ticket = result.rows[0];

  console.log("Support ticket created:", ticket);

  try {
    const githubIssue = await createGitHubIssue(
      title,
      description,
      priority
    );

    if (githubIssue) {
      console.log(
        "GitHub issue created:",
        githubIssue.html_url
      );
    }
  } catch (error) {
    console.log(
      "GitHub issue creation failed:",
      error.response?.data || error.message
    );
  }

  return ticket;
};

const getUserTickets = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM support_tickets
    WHERE user_id = $1
    ORDER BY id DESC;
    `,
    [userId]
  );

  return result.rows;
};

const handleToolCall = async (
  toolCall,
  userId,
  conversationId
) => {
  const functionName = toolCall.function.name;

  const args = JSON.parse(toolCall.function.arguments);

  if (functionName === "create_support_ticket") {
    const ticket = await createSupportTicket(
      userId,
      conversationId,
      args.title,
      args.description,
      args.priority || "normal"
    );

    return {
      success: true,
      ticket,
    };
  }

  return {
    success: false,
    error: "Unknown tool",
  };
};

module.exports = {
  createSupportTicket,
  getUserTickets,
  handleToolCall,
};