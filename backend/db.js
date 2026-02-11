require("dotenv").config({ path: "./backend/.env" });
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
console.log("DATABASE_URL:", process.env.DATABASE_URL);
