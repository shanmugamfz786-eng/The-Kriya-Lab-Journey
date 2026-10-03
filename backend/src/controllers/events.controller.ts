import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { getDbPool } from "../config/db.js";

dotenv.config();

/**
 * Upload Image to Cloudinary (or return base64 / URL fallback)
 */
export async function uploadEventImage(req, res) {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image data (base64 or URL) is required" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if Cloudinary is configured with credentials
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "the_kriya_lab/events",
        resource_type: "auto",
      });
      return res.json({
        success: true,
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
      });
    }

    // Fallback if Cloudinary credentials not yet configured in .env
    // If it's already an HTTP URL or base64 data, return it directly
    return res.json({
      success: true,
      url: image,
      notice: "Cloudinary credentials not yet provided in backend/.env, using direct image URL.",
    });
  } catch (err) {
    console.error("[Events Image Upload Error]:", err);
    return res.status(500).json({ error: "Failed to upload image: " + err.message });
  }
}

/**
 * Get All Events (Optionally filter by ?type=past | ?type=future)
 */
export async function getEvents(req, res) {
  try {
    const db = getDbPool();
    const { type } = req.query;

    let query = "SELECT * FROM events";
    const params = [];

    if (type && (type === "past" || type === "future")) {
      query += " WHERE event_type = ?";
      params.push(type);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await db.query(query, params);
    return res.json({ success: true, events: rows || [] });
  } catch (err) {
    console.error("[Get Events Error]:", err);
    return res.status(500).json({ error: "Failed to fetch events: " + err.message });
  }
}

/**
 * Create a new Event
 */
export async function createEvent(req, res) {
  try {
    const db = getDbPool();
    const { title, description, title_ta, description_ta, image_url, google_form_link, event_type, event_date, event_date_ta, location, location_ta } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Event title is required" });
    }

    const eventId = "evt_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const type = event_type === "past" ? "past" : "future";

    await db.query(
      `INSERT INTO events (id, title, description, title_ta, description_ta, image_url, google_form_link, event_type, event_date, event_date_ta, location, location_ta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        title,
        description || "",
        title_ta || "",
        description_ta || "",
        image_url || "",
        google_form_link || "",
        type,
        event_date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        event_date_ta || "",
        location || "Online / Ashram",
        location_ta || "",
      ]
    );

    const [newEvent] = await db.query("SELECT * FROM events WHERE id = ?", [eventId]);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent[0] || { id: eventId, title, event_type: type },
    });
  } catch (err) {
    console.error("[Create Event Error]:", err);
    return res.status(500).json({ error: "Failed to create event: " + err.message });
  }
}

/**
 * Update an existing Event
 */
export async function updateEvent(req, res) {
  try {
    const db = getDbPool();
    const { id } = req.params;
    const { title, description, title_ta, description_ta, image_url, google_form_link, event_type, event_date, event_date_ta, location, location_ta } = req.body;

    const [existing] = await db.query("SELECT * FROM events WHERE id = ?", [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    await db.query(
      `UPDATE events 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           title_ta = COALESCE(?, title_ta),
           description_ta = COALESCE(?, description_ta),
           image_url = COALESCE(?, image_url),
           google_form_link = COALESCE(?, google_form_link),
           event_type = COALESCE(?, event_type),
           event_date = COALESCE(?, event_date),
           event_date_ta = COALESCE(?, event_date_ta),
           location = COALESCE(?, location),
           location_ta = COALESCE(?, location_ta)
       WHERE id = ?`,
      [
        title,
        description,
        title_ta,
        description_ta,
        image_url,
        google_form_link,
        event_type,
        event_date,
        event_date_ta,
        location,
        location_ta,
        id,
      ]
    );

    const [updated] = await db.query("SELECT * FROM events WHERE id = ?", [id]);
    return res.json({ success: true, message: "Event updated successfully", event: updated[0] });
  } catch (err) {
    console.error("[Update Event Error]:", err);
    return res.status(500).json({ error: "Failed to update event: " + err.message });
  }
}

/**
 * Delete an Event
 */
export async function deleteEvent(req, res) {
  try {
    const db = getDbPool();
    const { id } = req.params;

    const [existing] = await db.query("SELECT * FROM events WHERE id = ?", [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    await db.query("DELETE FROM events WHERE id = ?", [id]);
    return res.json({ success: true, message: "Event deleted successfully", id });
  } catch (err) {
    console.error("[Delete Event Error]:", err);
    return res.status(500).json({ error: "Failed to delete event: " + err.message });
  }
}
