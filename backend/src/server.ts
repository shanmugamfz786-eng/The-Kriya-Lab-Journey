import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import programsRoutes from "./routes/programs.routes.js";
import usersRoutes from "./routes/users.routes.js";
import enrollRoutes from "./routes/enroll.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for Vercel Frontend
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Root & Health Status
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "THE KRIYA LAB - Node.js Express TiDB Backend API",
    version: "1.0.0",
    database: "TiDB Cloud",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Events Routes
app.use("/api/events", eventsRoutes);

// Programs Routes
app.use("/api/programs", programsRoutes);

// Users Routes
app.use("/api/users", usersRoutes);

// Enrollments Routes
app.use("/api/enrollments", enrollRoutes);

// Start server and initialize DB connection (only if not running in Vercel)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, async () => {
    console.log(`🚀 [THE KRIYA LAB BACKEND] Express Server running on: http://localhost:${PORT}`);
    console.log(`🌐 Configured for Standalone Domain Hosting`);
    await initDb();
  });
}

export default app;
