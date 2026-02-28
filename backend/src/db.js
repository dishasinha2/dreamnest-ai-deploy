import mysql from "mysql2/promise";
import "dotenv/config";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  ssl: String(process.env.DB_SSL || "false").toLowerCase() === "true" ? {} : undefined,
  connectionLimit: 10
});
