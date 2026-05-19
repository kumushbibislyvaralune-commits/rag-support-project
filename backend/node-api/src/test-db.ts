const pool = require("./config/database.config");

const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("Database connected successfully");
    console.log(result.rows);
  } catch (error) {
    console.log("Database connection failed");
    console.log(error);
  }
};

testDatabaseConnection();