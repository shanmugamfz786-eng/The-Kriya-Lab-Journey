import { getDbPool } from "../config/db.js";
import {
  getLocalUsers,
  deleteLocalUser,
  addOrUpdateLocalUser,
  findLocalUserById,
} from "../config/local-users.js";

/**
 * Get all users (students/seekers)
 */
export async function getUsers(req, res) {
  try {
    const localUsers = getLocalUsers().filter((u) => u.role !== "admin");
    const userMap = new Map();

    // Add local users first
    for (const u of localUsers) {
      userMap.set(u.email.toLowerCase(), {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        country: u.country || "IN",
        created_at: u.created_at || new Date().toISOString(),
      });
    }

    // Try fetching extra from TiDB if available
    try {
      const db = getDbPool();
      const [rows] = await db.query(
        "SELECT id, full_name, email, role, avatar, country, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC"
      );
      if (rows && rows.length > 0) {
        for (const r of rows) {
          if (!userMap.has(r.email.toLowerCase())) {
            userMap.set(r.email.toLowerCase(), r);
          }
        }
      }
    } catch (err) {
      console.warn("[Get Users Warning] DB query fallback (using local users store):", err.message);
    }

    const allUsers = Array.from(userMap.values());
    return res.json({ success: true, users: allUsers });
  } catch (err) {
    console.error("[Get Users Error]:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Delete a user and their associated data (enquiries, etc.)
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Delete from local store
    deleteLocalUser(id);

    // Try deleting from DB
    try {
      const db = getDbPool();
      await db.query("DELETE FROM enquiries WHERE user_id = ?", [id]);
      await db.query("DELETE FROM users WHERE id = ?", [id]);
    } catch (dbErr) {
      console.warn("[Delete User TiDB Warning]:", dbErr.message);
    }

    return res.json({
      success: true,
      message: "User account and all related data deleted successfully",
      id,
    });
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
    const { id } = req.params;
    const { full_name, avatar, country } = req.body;

    if (!id || !full_name) {
      return res.status(400).json({ error: "User ID and Full Name are required" });
    }

    // Update in local store
    const localUser = findLocalUserById(id);
    if (localUser) {
      addOrUpdateLocalUser({
        ...localUser,
        full_name,
        avatar: avatar || localUser.avatar,
        country: country !== undefined ? country : localUser.country,
      });
    }

    // Try updating TiDB
    try {
      const db = getDbPool();
      await db.query("UPDATE users SET full_name = ?, avatar = ?, country = ? WHERE id = ?", [
        full_name,
        avatar || null,
        country || (localUser?.country ?? null),
        id,
      ]);
    } catch (dbErr) {
      console.warn("[Update User TiDB Notice]:", dbErr.message);
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id,
        full_name,
        avatar: avatar || null,
        country: country || localUser?.country || "IN",
      },
    });
  } catch (err) {
    console.error("[Update User Error]:", err);
    return res.status(500).json({ error: "Failed to update user: " + err.message });
  }
}
