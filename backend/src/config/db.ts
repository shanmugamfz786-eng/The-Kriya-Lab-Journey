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

    const [eventsCheck] = await db.query("SELECT COUNT(*) as cnt FROM events");
    if (eventsCheck && eventsCheck[0].cnt === 0) {
      console.log("[TiDB] Seeding initial events...");
      const mockEvents = [
        ["evt_past_01", "1st Kriya Initiation & Sacred Darshan", "Sacred transmission of 1st Kriya keys, pranayama secrets, and Babaji lineage blessings.", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80", "past", "Oct 06, 2026", "Mylapore Center, Chennai"],
        ["evt_past_02", "Pranayama Vayu Intensive Retreat", "Deep dive into 12 spine energy currents and breath mastery under master supervision.", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80", "past", "Oct 05, 2026", "Velliangiri Ashram, Coimbatore"],
        ["evt_future_01", "Chennai Sacred Satsang & Kriya Diksha", "Direct in-person initiation into the lineage of Mahavatar Babaji with holy diksha.", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80", "future", "Oct 08, 2026 • 09:00 AM", "The Kriya Lab Center, Chennai"],
        ["evt_future_02", "Global Online Babaji Darshan & Q&A Session", "Live interactive Satsang and Q&A on subtle spine meditation for international sadhakas.", "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80", "future", "Oct 14, 2026 • 07:00 PM IST", "Zoom Cloud Webinar"]
      ];
      for (const e of mockEvents) {
        await db.query(
          "INSERT INTO events (id, title, description, image_url, event_type, event_date, location) VALUES (?, ?, ?, ?, ?, ?, ?)",
          e
        );
      }
    }

    const [progCheck] = await db.query("SELECT COUNT(*) as cnt FROM programs");
    if (progCheck && progCheck[0].cnt === 0) {
      console.log("[TiDB] Seeding initial programs...");
      const mockPrograms = [
        ["prg_1", "Inner Awakening Kriya", "A comprehensive journey into the core of Kriya Yoga.", "Swami Kriyanda", "Zoom (Online)", "உள் விழிப்புணர்வு கிரியா", "கிரியா யோகத்தின் அடிப்படை பயணங்கள்.", "சுவாமி கிரியானந்தா", "ஜூம் (ஆன்லைன்)", "beginner", "4 Weeks", "2026-11-01T10:00:00Z", "enquire", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop", "online", "4999", "59"],
        ["prg_2", "Advanced Pranayama", "Master your breath with advanced Siddha techniques.", "Sadhguru Ram", "Google Meet", "மேம்பட்ட பிராணாயாமம்", "சுவாசத்தை கட்டுப்படுத்தும் மேம்பட்ட முறை.", "சத்குரு ராம்", "கூகுள் மீட்", "intermediate", "6 Weeks", "2026-11-15T08:00:00Z", "almost full", "https://images.unsplash.com/photo-1522845015757-50bce044e5da?q=80&w=600&auto=format&fit=crop", "online", "7999", "99"],
        ["prg_3", "Himalayan Retreat", "A deep immersive retreat in the Himalayas.", "Sri Babaji", "Rishikesh, India", "இமயமலை தியான முகாம்", "இமயமலையில் ஆழமான தியான பயிற்சி.", "ஸ்ரீ பாபாஜி", "ரிஷிகேஷ், இந்தியா", "pro", "14 Days", "2027-01-10T09:00:00Z", "full", "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?q=80&w=600&auto=format&fit=crop", "offline", "25000", "350"],
        ["prg_4", "Foundation Weekend Workshop", "A 2-day intensive introduction to the Kriya Lab methods.", "Master Yogi", "Chennai Center", "அடிப்படை யோக பட்டறை", "2 நாட்கள் தொடக்க நிலை பயிற்சி.", "மாஸ்டர் யோகி", "சென்னை மையம்", "beginner", "2 Days", "2026-12-05T10:00:00Z", "enquire", "https://images.unsplash.com/photo-1552858725-2758b5fb1286?q=80&w=600&auto=format&fit=crop", "offline", "1999", "25"]
      ];
      for (const p of mockPrograms) {
        await db.query(
          "INSERT INTO programs (id, title_en, description_en, instructor_en, location_en, title_ta, description_ta, instructor_ta, location_ta, level, duration, schedule_date, enrolment_status, image_url, program_type, price_inr, price_usd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          p
        );
      }
    }

    console.log(`[TiDB] Database \`${dbName}\` connected & tables verified successfully!`);
  } catch (err) {
    console.warn("[TiDB Notice] Could not connect to TiDB Cloud with current credentials. Standby mode active.");
    console.warn("[TiDB Error Message]:", err.message);
  }
}
