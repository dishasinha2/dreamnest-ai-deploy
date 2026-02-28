import { db } from "../db.js";

const tableExistsCache = new Map();

export async function tableExists(tableName) {
  if (tableExistsCache.has(tableName)) return tableExistsCache.get(tableName);
  const [rows] = await db.query(
    "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME=? LIMIT 1",
    [tableName]
  );
  const exists = rows.length > 0;
  tableExistsCache.set(tableName, exists);
  return exists;
}
