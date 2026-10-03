import app from "../backend/src/server.js";
import { initDb } from "../backend/src/config/db.js";

let dbInitialized = false;

// Ensure database is initialized before handling any API requests
export default async function handler(req, res) {
  if (!dbInitialized) {
    console.log("[Vercel Serverless] Initializing TiDB...");
    await initDb();
    dbInitialized = true;
  }
  return app(req, res);
}
