import { getDbPool } from "../config/db.js";

/**
 * Enroll a user in a program
 */
export async function enrollInProgram(req, res) {
  try {
    const db = getDbPool();
    const { userId, programId } = req.body;

    if (!userId || !programId) {
      return res.status(400).json({ error: "User ID and Program ID are required" });
    }

    const enrollmentId = "enr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);

    // Using INSERT IGNORE so if they are already enrolled it doesn't fail
    await db.query(
      "INSERT IGNORE INTO enrollments (id, user_id, program_id) VALUES (?, ?, ?)",
      [enrollmentId, userId, programId]
    );

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
    const db = getDbPool();
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Join enrollments with programs
    const [rows] = await db.query(
      `SELECT p.* 
       FROM programs p
       JOIN enrollments e ON p.id = e.program_id
       WHERE e.user_id = ?
       ORDER BY e.created_at DESC`,
      [userId]
    );

    return res.json({ success: true, programs: rows || [] });
  } catch (err) {
    console.error("[Get Enrollments Error]:", err);
    return res.status(500).json({ error: "Failed to fetch enrollments: " + err.message });
  }
}
