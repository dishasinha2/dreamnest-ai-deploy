import { db } from "../db.js";

let projectEventsExistsCache = null;

async function projectEventsExists() {
  if (projectEventsExistsCache !== null) return projectEventsExistsCache;
  const [rows] = await db.query(
    "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='project_events' LIMIT 1"
  );
  projectEventsExistsCache = rows.length > 0;
  return projectEventsExistsCache;
}

export async function insertProjectEvent(projectId, eventType, meta = {}) {
  if (!(await projectEventsExists())) return false;
  await db.execute(
    "INSERT INTO project_events (project_id, event_type, meta) VALUES (?,?,?)",
    [Number(projectId), eventType, JSON.stringify(meta)]
  );
  return true;
}

export async function countProjectEvents(projectId, eventType) {
  if (!(await projectEventsExists())) return 0;
  const [[row]] = await db.query(
    "SELECT COUNT(*) AS c FROM project_events WHERE project_id=? AND event_type=?",
    [Number(projectId), eventType]
  );
  return row?.c || 0;
}
