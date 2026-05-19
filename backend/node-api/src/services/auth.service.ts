const pool = require("../config/database.config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (name, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email;
  `;

  const values = [name, email, hashedPassword];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const loginUser = async (email, password) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

module.exports = {
  registerUser,
  loginUser,
};