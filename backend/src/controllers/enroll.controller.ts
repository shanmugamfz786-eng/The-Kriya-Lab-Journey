import { getDbPool } from "../config/db.js";
import {
  saveLocalEnrollment,
  getUserLocalEnrollments,
} from "../config/local-enrollments.js";

const FALLBACK_PROGRAMS = [
  {
    id: "prg_1",
    title_en: "Inner Awakening Kriya",
    description_en: "Foundational initiation into sacred Kriya Yoga.",
    instructor_en: "Swami Kriyanda",
    location_en: "Zoom (Online)",
    title_ta: "உள் விழிப்புணர்வு கிரியா",
    description_ta: "புனிதமான தொடக்க நிலை தீட்சை பயிற்சி.",
    instructor_ta: "சுவாமி கிரியானந்தா",
    location_ta: "ஜூம் (ஆன்லைன்)",
    level: "beginner",
    duration: "4 Weeks",
    schedule_date: "2026-11-01T10:00:00Z",
    enrolment_status: "enquire",
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
    program_type: "online",
    price_inr: "4999",
    price_usd: "59",
  },
  {
    id: "prg_2",
    title_en: "Advanced Pranayama",
    description_en: "Mastery course in Siddha and Hatha Yoga breath methodologies.",
    instructor_en: "Sadhguru Ram",
    location_en: "Google Meet",
    title_ta: "மேம்பட்ட பிராணாயாமம்",
    description_ta: "பாரம்பரிய சித்த மற்றும் ஹட யோக சுவாசக் கலைகள்.",
    instructor_ta: "சத்குரு ராம்",
    location_ta: "கூகுள் மீட்",
    level: "intermediate",
    duration: "6 Weeks",
    schedule_date: "2026-11-15T08:00:00Z",
    enrolment_status: "almost full",
    image_url: "https://images.unsplash.com/photo-1522845015757-50bce044e5da?q=80&w=600&auto=format&fit=crop",
    program_type: "online",
    price_inr: "7999",
    price_usd: "99",
  },
  {
    id: "prg_3",
    title_en: "Himalayan Retreat",
    description_en: "14-day residential sadhana retreat in Rishikesh.",
    instructor_en: "Sri Babaji",
    location_en: "Rishikesh, India",
    title_ta: "இமயமலை தியானப் பயிற்சி",
    description_ta: "ரிஷிகேஷில் 14 நாட்கள் நேரடி தியான சாதனா முகாம்.",
    instructor_ta: "ஸ்ரீ பாபாஜி",
    location_ta: "ரிஷிகேஷ், இந்தியா",
    level: "advanced",
    duration: "14 Days",
    schedule_date: "2026-12-01T06:00:00Z",
    enrolment_status: "full",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
    program_type: "offline",
    price_inr: "25000",
    price_usd: "299",
  },
  {
    id: "prg_4",
    title_en: "Weekend Workshop",
    description_en: "2-Day intensive weekend foundational workshop.",
    instructor_en: "Swami Kriyanda",
    location_en: "Chennai Hall",
    title_ta: "வார இறுதி பயிற்சிப் பட்டறை",
    description_ta: "2 நாட்கள் தீவிர நேரடி கிரியா யோகப் பயிற்சி.",
    instructor_ta: "சுவாமி கிரியானந்தா",
    location_ta: "சென்னை அரங்கம்",
    level: "beginner",
    duration: "2 Days",
    schedule_date: "2026-11-20T09:00:00Z",
    enrolment_status: "enquire",
    image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    program_type: "offline",
    price_inr: "1999",
    price_usd: "29",
  },
];

/**
 * Enroll a user in a program
 */
export async function enrollInProgram(req, res) {
  try {
    const { userId, programId } = req.body;

    if (!userId || !programId) {
      return res.status(400).json({ error: "User ID and Program ID are required" });
    }

    // Always persist to local storage first
    saveLocalEnrollment(userId, programId);

    // Also attempt database insert
    try {
      const db = getDbPool();
      const enrollmentId = "enr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
      await db.query(
        "INSERT IGNORE INTO enrollments (id, user_id, program_id) VALUES (?, ?, ?)",
        [enrollmentId, userId, programId]
      );
    } catch (dbErr) {
      console.warn("[Enrollment DB Sync Notice]: Saved locally, DB notice:", dbErr.message);
    }

    return res.json({ success: true, message: "Enrolled successfully" });
  } catch (err) {
    console.error("[Enrollment Error]:", err);
    return res.status(500).json({ error: "Failed to enroll: " + err.message });
  }
}

/**
 * Get all programs a user is enrolled in
 */
export async function getUserEnrollments(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const localList = getUserLocalEnrollments(userId);
    const localProgramIds = new Set(localList.map((e) => e.program_id));

    let dbPrograms = [];
    try {
      const db = getDbPool();
      const [rows] = await db.query(
        `SELECT p.* 
         FROM programs p
         JOIN enrollments e ON p.id = e.program_id
         WHERE e.user_id = ?
         ORDER BY e.created_at DESC`,
        [userId]
      );
      if (Array.isArray(rows)) {
        dbPrograms = rows;
      }
    } catch (dbErr) {
      console.warn("[Get Enrollments DB Notice]: Using local fallback:", dbErr.message);
    }

    // Merge DB programs and local fallback programs
    const programsMap = new Map();
    dbPrograms.forEach((p) => {
      programsMap.set(p.id, p);
    });

    // Add matching fallback programs for any local enrollments
    localProgramIds.forEach((pid) => {
      if (!programsMap.has(pid)) {
        const found = FALLBACK_PROGRAMS.find((fp) => fp.id === pid) || FALLBACK_PROGRAMS[0];
        if (found) {
          programsMap.set(pid, { ...found, id: pid });
        }
      }
    });

    const finalPrograms = Array.from(programsMap.values());
    return res.json({ success: true, programs: finalPrograms });
  } catch (err) {
    console.error("[Get Enrollments Error]:", err);
    return res.status(500).json({ error: "Failed to fetch enrollments: " + err.message });
  }
}

