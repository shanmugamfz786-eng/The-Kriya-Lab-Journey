import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool = null;

export function getDbPool() {
  if (!pool) {
    const isSsl = process.env.TIDB_SSL !== "false";

    pool = mysql.createPool({
      host: process.env.TIDB_HOST || "localhost",
      port: Number(process.env.TIDB_PORT) || 4000,
      user: process.env.TIDB_USER || "root",
      password: process.env.TIDB_PASSWORD || "",
      database: process.env.TIDB_DATABASE || "the_kriya_lab",
      ssl: isSsl ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

/** Initialize essential tables in TiDB Cloud and create database if not exists */
export async function initDb() {
  try {
    const isSsl = process.env.TIDB_SSL !== "false";
    const dbName = process.env.TIDB_DATABASE || "the_kriya_lab";

    console.log(`[TiDB] Connecting to TiDB Cloud gateway at ${process.env.TIDB_HOST || "localhost"}...`);

    // Preliminary connection to ensure the database exists
    const initConn = await mysql.createConnection({
      host: process.env.TIDB_HOST || "localhost",
      port: Number(process.env.TIDB_PORT) || 4000,
      user: process.env.TIDB_USER || "root",
      password: process.env.TIDB_PASSWORD || "",
      ssl: isSsl ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
    });

    await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await initConn.end();

    const db = getDbPool();

    // Create Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(128) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Enquiries Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        name VARCHAR(128) NOT NULL,
        email VARCHAR(191) NOT NULL,
        phone VARCHAR(32),
        country VARCHAR(64),
        program VARCHAR(128),
        message TEXT,
        status VARCHAR(32) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Events Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        title_ta VARCHAR(255),
        description_ta TEXT,
        image_url LONGTEXT,
        google_form_link TEXT,
        event_type VARCHAR(32) NOT NULL DEFAULT 'future',
        event_date VARCHAR(100),
        event_date_ta VARCHAR(100),
        location VARCHAR(255),
        location_ta VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Add columns if table already exists (silently fail if they exist)
    try {
      await db.query("ALTER TABLE events ADD COLUMN title_ta VARCHAR(255)");
    } catch (e) {}
    try {
      await db.query("ALTER TABLE events ADD COLUMN description_ta TEXT");
    } catch (e) {}
    try {
      await db.query("ALTER TABLE events ADD COLUMN event_date_ta VARCHAR(100)");
    } catch (e) {}
    try {
      await db.query("ALTER TABLE events ADD COLUMN location_ta VARCHAR(255)");
    } catch (e) {}

    // Create Programs Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id VARCHAR(64) PRIMARY KEY,
        title_en VARCHAR(255) NOT NULL,
        description_en TEXT,
        instructor_en VARCHAR(255),
        location_en VARCHAR(255),
        language_en VARCHAR(255),
        title_ta VARCHAR(255),
        description_ta TEXT,
        instructor_ta VARCHAR(255),
        location_ta VARCHAR(255),
        language_ta VARCHAR(255),
        level VARCHAR(64),
        duration VARCHAR(128),
        schedule_date VARCHAR(100),
        enrolment_status VARCHAR(64),
        image_url LONGTEXT,
        program_type VARCHAR(32) NOT NULL DEFAULT 'online',
        price_inr VARCHAR(64),
        price_usd VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Add columns if table already exists (silently fail if they exist)
    try {
      await db.query("ALTER TABLE programs ADD COLUMN price_inr VARCHAR(64)");
    } catch (e) {}
    try {
      await db.query("ALTER TABLE programs ADD COLUMN price_usd VARCHAR(64)");
    } catch (e) {}
    try {
      await db.query("ALTER TABLE programs ADD COLUMN language_en VARCHAR(255)");
    } catch (e) {}
    try {
      await db.query("ALTER TABLE programs ADD COLUMN language_ta VARCHAR(255)");
    } catch (e) {}

    // Seed default Admin user from .env
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@thekriyalab.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Kriya Master Admin";

    const [adminCheck] = await db.query("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if (!adminCheck || adminCheck.length === 0) {
      const bcryptModule = await import("bcryptjs");
      const adminHash = await bcryptModule.default.hash(adminPassword, 10);
      await db.query(
        "INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        ["usr_admin_001", adminName, adminEmail, adminHash, "admin"]
      );
      console.log(`[TiDB] Default Admin user created: ${adminEmail} / ${adminPassword}`);
    }

    console.log(`[TiDB] Database \`${dbName}\` connected & tables (users, enquiries) verified successfully!`);
  } catch (err) {
    console.warn("[TiDB Notice] Could not connect to TiDB Cloud with current credentials. Standby mode active.");
    console.warn("[TiDB Error Message]:", err.message);
  }
}
