import { getDbPool } from "../config/db.js";

/**
 * Get all users (students/seekers)
 */
export async function getUsers(req, res) {
  try {
    const db = getDbPool();
    // Exclude admins from the list if we only want to manage students, 
    // or just fetch all and let the frontend filter. We will fetch all users for the admin.
    const [rows] = await db.query("SELECT id, full_name, email, role, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC");
    return res.json({ success: true, users: rows || [] });
  } catch (err) {
    console.error("[Get Users Error]:", err);
    return res.status(500).json({ error: "Failed to fetch users: " + err.message });
  }
}

/**
 * Delete a user and their associated data (enquiries, etc.)
 */
export async function deleteUser(req, res) {
  try {
    const db = getDbPool();
    const { id } = req.params;

    // Prevent deleting the default admin
    const [existing] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (existing[0].role === 'admin' && existing[0].email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: "Cannot delete the main admin account" });
    }

    // Delete related enquiries first (simulating CASCADE)
    await db.query("DELETE FROM enquiries WHERE user_id = ?", [id]);

    // Delete the user
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    return res.json({ success: true, message: "User account and all related data deleted successfully", id });
  } catch (err) {
    console.error("[Delete User Error]:", err);
    return res.status(500).json({ error: "Failed to delete user: " + err.message });
  }
}

/**
 * Update user profile (name, avatar, etc.)
 */
export async function updateUser(req, res) {
  try {
    const db = getDbPool();
    const { id } = req.params;
    const { full_name, avatar } = req.body;

    if (!id || !full_name) {
      return res.status(400).json({ error: "User ID and Full Name are required" });
    }

    // Notice: we might not have an avatar column yet, so we should try-catch it or add it
    try {
      await db.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(255)");
    } catch (e) {}

    await db.query(
      "UPDATE users SET full_name = ?, avatar = ? WHERE id = ?",
      [full_name, avatar || null, id]
    );

    return res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("[Update User Error]:", err);
    return res.status(500).json({ error: "Failed to update user: " + err.message });
  }
}
