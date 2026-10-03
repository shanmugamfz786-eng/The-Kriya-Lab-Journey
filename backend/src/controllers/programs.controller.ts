import { getDbPool } from "../config/db.js";

/**
 * Get All Programs (Optionally filter by ?type=online | ?type=offline)
 */
export async function getPrograms(req, res) {
  try {
    const db = getDbPool();
    const { type } = req.query;

    let query = "SELECT * FROM programs";
    const params = [];

    if (type && (type === "online" || type === "offline")) {
      query += " WHERE program_type = ?";
      params.push(type);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await db.query(query, params);
    return res.json({ success: true, programs: rows || [] });
  } catch (err) {
    console.error("[Get Programs Error]:", err);
    return res.status(500).json({ error: "Failed to fetch programs: " + err.message });
  }
}

/**
 * Create a new Program
 */
export async function createProgram(req, res) {
  try {
    const db = getDbPool();
    const { 
      title_en, description_en, instructor_en, location_en, language_en,
      title_ta, description_ta, instructor_ta, location_ta, language_ta,
      level, duration, schedule_date, enrolment_status, 
      image_url, program_type, price_inr, price_usd
    } = req.body;

    if (!title_en) {
      return res.status(400).json({ error: "Program title (English) is required" });
    }

    const programId = "prg_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const type = program_type === "offline" ? "offline" : "online";

    await db.query(
      `INSERT INTO programs (
        id, title_en, description_en, instructor_en, location_en, language_en,
        title_ta, description_ta, instructor_ta, location_ta, language_ta,
        level, duration, schedule_date, enrolment_status, 
        image_url, program_type, price_inr, price_usd
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        programId,
        title_en, description_en || "", instructor_en || "", location_en || "", language_en || "",
        title_ta || "", description_ta || "", instructor_ta || "", location_ta || "", language_ta || "",
        level || "Beginner", duration || "", schedule_date || "", enrolment_status || "Enquire",
        image_url || "", type, price_inr || "", price_usd || ""
      ]
    );

    const [newProgram] = await db.query("SELECT * FROM programs WHERE id = ?", [programId]);

    return res.status(201).json({
      success: true,
      message: "Program created successfully",
      program: newProgram[0] || { id: programId, title_en, program_type: type },
    });
  } catch (err) {
    console.error("[Create Program Error]:", err);
    return res.status(500).json({ error: "Failed to create program: " + err.message });
  }
}

/**
 * Update an existing Program
 */
export async function updateProgram(req, res) {
  try {
    const db = getDbPool();
    const { id } = req.params;
    const { 
      title_en, description_en, instructor_en, location_en, language_en,
      title_ta, description_ta, instructor_ta, location_ta, language_ta,
      level, duration, schedule_date, enrolment_status, 
      image_url, program_type, price_inr, price_usd
    } = req.body;

    const [existing] = await db.query("SELECT * FROM programs WHERE id = ?", [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    await db.query(
      `UPDATE programs 
       SET title_en = COALESCE(?, title_en),
           description_en = COALESCE(?, description_en),
           instructor_en = COALESCE(?, instructor_en),
           location_en = COALESCE(?, location_en),
           language_en = COALESCE(?, language_en),
           title_ta = COALESCE(?, title_ta),
           description_ta = COALESCE(?, description_ta),
           instructor_ta = COALESCE(?, instructor_ta),
           location_ta = COALESCE(?, location_ta),
           language_ta = COALESCE(?, language_ta),
           level = COALESCE(?, level),
           duration = COALESCE(?, duration),
           schedule_date = COALESCE(?, schedule_date),
           enrolment_status = COALESCE(?, enrolment_status),
           image_url = COALESCE(?, image_url),
           program_type = COALESCE(?, program_type),
           price_inr = COALESCE(?, price_inr),
           price_usd = COALESCE(?, price_usd)
       WHERE id = ?`,
      [
        title_en, description_en, instructor_en, location_en, language_en,
        title_ta, description_ta, instructor_ta, location_ta, language_ta,
        level, duration, schedule_date, enrolment_status,
        image_url, program_type, price_inr, price_usd,
        id
      ]
    );

    const [updated] = await db.query("SELECT * FROM programs WHERE id = ?", [id]);
    return res.json({ success: true, message: "Program updated successfully", program: updated[0] });
  } catch (err) {
    console.error("[Update Program Error]:", err);
    return res.status(500).json({ error: "Failed to update program: " + err.message });
  }
}

/**
 * Delete a Program
 */
export async function deleteProgram(req, res) {
  try {
    const db = getDbPool();
    const { id } = req.params;

    const [existing] = await db.query("SELECT * FROM programs WHERE id = ?", [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    await db.query("DELETE FROM programs WHERE id = ?", [id]);
    return res.json({ success: true, message: "Program deleted successfully", id });
  } catch (err) {
    console.error("[Delete Program Error]:", err);
    return res.status(500).json({ error: "Failed to delete program: " + err.message });
  }
}
