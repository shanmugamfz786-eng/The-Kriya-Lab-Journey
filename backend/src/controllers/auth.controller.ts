import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDbPool } from "../config/db.js";
import {
  findLocalUserByEmail,
  findLocalUserById,
  addOrUpdateLocalUser,
  updateLocalUserPassword,
  updateLocalUserPasswordById,
  getLocalUsers,
} from "../config/local-users.js";
import {
  defaultCountryVerifier,
  GeoValidationError,
  GeoMismatchError,
  GeoServiceUnavailableError,
} from "../services/geo/country-verifier.service.js";
import { defaultIpGeoService } from "../services/geo/ip-geo.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "the_kriya_lab_secret_key";

/**
 * Detects the client country purely from their server-side IP address.
 * Used for initializing the registration form country dropdown.
 */
export async function detectCountry(req, res) {
  try {
    const ipCountry = await defaultIpGeoService.resolveCountry(req);
    console.log(`[GEO_DIAGNOSTIC] Detect Country -> IP Country: ${ipCountry}`);

    const COUNTRY_NAMES: Record<string, string> = {
      IN: "India",
      US: "United States",
      SG: "Singapore",
      MY: "Malaysia",
      AE: "United Arab Emirates",
      GB: "United Kingdom",
      AU: "Australia",
      CA: "Canada",
      LK: "Sri Lanka",
      DE: "Germany",
      FR: "France",
    };

    const countryName = COUNTRY_NAMES[ipCountry] || ipCountry;
    const display = `${ipCountry} ${countryName}`;

    return res.status(200).json({
      success: true,
      countryCode: ipCountry,
      countryName,
      display,
    });
  } catch (err) {
    console.warn("[GEO_DIAGNOSTIC] detectCountry fallback notice:", err.message);
    return res.status(200).json({
      success: true,
      countryCode: "IN",
      countryName: "India",
      display: "IN India",
      fallback: true,
    });
  }
}

/**
 * Pre-verifies device location and IP before form submission.
 * Enforces triangulation: Selected Country === IP Country === GPS Country.
 * Never logs precise coordinates or personal secrets.
 */
export async function preVerifyLocation(req, res) {
  try {
    let { country, gps } = req.body;

    if (!country || typeof country !== "string" || !country.trim()) {
      country = await defaultIpGeoService.resolveCountry(req);
    }

    const geoResult = await defaultCountryVerifier.verifyRegistration({
      req,
      selectedCountry: country,
      gps,
    });

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Location verified successfully",
      selectedCountry: geoResult.selectedCountry,
      ipCountry: geoResult.ipCountry,
      gpsCountry: geoResult.gpsCountry,
    });
  } catch (geoErr: any) {
    if (geoErr instanceof GeoValidationError) {
      return res.status(400).json({
        success: false,
        verified: false,
        code: geoErr.code,
        message: geoErr.message,
      });
    }
    if (geoErr instanceof GeoMismatchError) {
      return res.status(403).json({
        success: false,
        verified: false,
        code: geoErr.code,
        message: geoErr.message,
        selectedCountry: geoErr.selectedCountry,
        ipCountry: geoErr.ipCountry,
        gpsCountry: geoErr.gpsCountry,
      });
    }
    if (geoErr instanceof GeoServiceUnavailableError) {
      return res.status(503).json({
        success: false,
        verified: false,
        code: geoErr.code,
        message: geoErr.message,
      });
    }

    console.error("[GEO_DIAGNOSTIC] preVerifyLocation error:", geoErr);
    return res.status(503).json({
      success: false,
      verified: false,
      code: "GEO_VERIFICATION_FAILED",
      message: "Location verification service is temporarily unavailable.",
    });
  }
}

export async function register(req, res) {
  try {
    let { full_name, email, password, country, gps } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!country || typeof country !== "string" || !country.trim()) {
      country = await defaultIpGeoService.resolveCountry(req);
    }

    // MANDATORY SECURITY VERIFICATION: Triangulate Selected Country === IP Country === GPS Country
    // Enforced strictly BEFORE any TiDB query, password hashing, or user record creation.
    let geoResult;
    try {
      geoResult = await defaultCountryVerifier.verifyRegistration({
        req,
        selectedCountry: country,
        gps,
      });
    } catch (geoErr: any) {
      if (geoErr instanceof GeoValidationError) {
        return res.status(400).json({
          success: false,
          code: geoErr.code,
          message: geoErr.message,
        });
      }
      if (geoErr instanceof GeoMismatchError) {
        return res.status(403).json({
          success: false,
          code: geoErr.code,
          message: geoErr.message,
          selectedCountry: geoErr.selectedCountry,
          ipCountry: geoErr.ipCountry,
          gpsCountry: geoErr.gpsCountry,
        });
      }
      if (geoErr instanceof GeoServiceUnavailableError) {
        return res.status(503).json({
          success: false,
          code: geoErr.code,
          message: geoErr.message,
        });
      }

      console.error("[Geo Verification Error]:", geoErr);
      return res.status(503).json({
        success: false,
        code: "GEO_VERIFICATION_FAILED",
        message: "Registration verification could not be completed at this time.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user already exists in local persistent store
    const localExisting = findLocalUserByEmail(cleanEmail);
    if (localExisting) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Compute sequential next ID (e.g. KL_007)
    const allLocal = getLocalUsers();
    let maxNum = 6;
    for (const u of allLocal) {
      const m = u.id && u.id.match(/KL_(\d+)/);
      if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    let userId = `KL_${(maxNum + 1).toString().padStart(3, "0")}`;

    const assignedRole = cleanEmail === "admin@thekriyalab.com" ? "admin" : "student";

    // 2. Try TiDB query and insert if reachable
    try {
      const db = getDbPool();
      const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [cleanEmail]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: "An account with this email already exists" });
      }

      try {
        await db.query(
          "INSERT INTO users (id, full_name, email, password_hash, role, country) VALUES (?, ?, ?, ?, ?, ?)",
          [userId, full_name.trim(), cleanEmail, passwordHash, assignedRole, geoResult.selectedCountry]
        );
      } catch (insertErr) {
        // Fallback without country column if old schema exists
        await db.query(
          "INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
          [userId, full_name.trim(), cleanEmail, passwordHash, assignedRole]
        );
      }
    } catch (dbErr) {
      console.warn("[Auth Warning] TiDB insert error (fallback to local persistent store):", dbErr.message);
    }

    // 3. Always save to local persistent JSON file so user can reliably login anytime
    addOrUpdateLocalUser({
      id: userId,
      full_name: full_name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
      role: assignedRole,
      country: geoResult.selectedCountry,
      created_at: new Date().toISOString(),
    });

    const token = jwt.sign(
      { id: userId, email: cleanEmail, full_name: full_name.trim(), role: assignedRole },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: { id: userId, full_name: full_name.trim(), email: cleanEmail, role: assignedRole },
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Direct Admin Access for THE KRIYA LAB
    if (cleanEmail === "admin@thekriyalab.com" && password === "admin123") {
      const adminUser = {
        id: "usr_admin_001",
        full_name: "Kriya Master Admin",
        email: cleanEmail,
        role: "admin",
      };

      const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: "7d" });

      return res.status(200).json({
        success: true,
        message: "Admin Login successful",
        token,
        user: adminUser,
      });
    }

    let user = null;

    // 1. Try fetching from TiDB
    try {
      const db = getDbPool();
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [cleanEmail]);
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    } catch (dbErr) {
      console.warn("[Auth Warning] TiDB query notice (checking local store):", dbErr.message);
    }

    // 2. Fallback to local persistent store if TiDB is offline/exhausted or user not found in TiDB
    if (!user) {
      const localUser = findLocalUserByEmail(cleanEmail);
      if (localUser) {
        user = localUser;
      }
    }

    // 3. User not found anywhere
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email. Please sign up.",
      });
    }

    // 4. Verify password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } catch {
      isMatch = false;
    }

    // Also support plain-text match for demo student
    if (!isMatch && cleanEmail === "user@thekriyalab.com" && password === "user123") {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const effectiveUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role || "student",
    };

    const token = jwt.sign(
      {
        id: effectiveUser.id,
        email: effectiveUser.email,
        full_name: effectiveUser.full_name,
        role: effectiveUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: effectiveUser,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Login failed" });
  }
}

export async function me(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.status(200).json({
      success: true,
      user: decoded,
    });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

export async function createEnquiry(req, res) {
  try {
    const { name, email, phone, country, program, message } = req.body;
    const enquiryId = "KL-" + Date.now().toString().slice(-6);

    try {
      const db = getDbPool();
      await db.query(
        "INSERT INTO enquiries (id, name, email, phone, country, program, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [enquiryId, name, email, phone || null, country || "India", program || "General", message || "", "new"]
      );
    } catch (dbErr) {
      console.warn("[TiDB Warning] Enquiry insert notice:", dbErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      enquiryId,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to submit enquiry" });
  }
}

/**
 * Change Password (for logged-in users in Settings / Security)
 * Accepts both email and/or userId to ensure the password is changed specifically
 * for the exact Gmail account the user is currently using.
 */
export async function changePassword(req, res) {
  try {
    const { userId, email, currentPassword, newPassword } = req.body;

    if ((!userId && !email) || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Email or User ID, current password, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const cleanEmail = email ? email.toString().trim().toLowerCase() : "";
    const cleanUserId = userId ? userId.toString().trim() : "";

    // 1. Primary lookup by the user's logged-in Gmail address
    let user = cleanEmail ? findLocalUserByEmail(cleanEmail) : null;

    // 2. Fallback lookup by User ID
    if (!user && cleanUserId) {
      user = findLocalUserById(cleanUserId);
    }

    // 3. Fallback lookup in TiDB database
    if (!user) {
      try {
        const db = getDbPool();
        if (cleanEmail) {
          const [result] = await db.query("SELECT * FROM users WHERE LOWER(email) = ?", [cleanEmail]);
          if (result && result.length > 0) {
            user = result[0];
          }
        }
        if (!user && cleanUserId) {
          const [result] = await db.query("SELECT * FROM users WHERE id = ?", [cleanUserId]);
          if (result && result.length > 0) {
            user = result[0];
          }
        }
      } catch (dbErr) {
        console.warn("[TiDB Notice] changePassword DB query:", dbErr.message);
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: cleanEmail
          ? `No account found for Gmail: ${cleanEmail}`
          : "User account not found",
      });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    } catch {
      isMatch = false;
    }

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password does not match" });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Update in local persistent store by both email and id
    if (user.email) {
      updateLocalUserPassword(user.email, newHash);
    }
    if (user.id) {
      updateLocalUserPasswordById(user.id, newHash);
    }

    // Update in TiDB database
    try {
      const db = getDbPool();
      if (user.email) {
        await db.query("UPDATE users SET password_hash = ? WHERE LOWER(email) = ?", [newHash, user.email.toLowerCase()]);
      }
      if (user.id) {
        await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, user.id]);
      }
    } catch (dbErr) {
      console.warn("[TiDB Notice] update password in TiDB:", dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Password changed successfully for ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[Change Password Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to change password: " + err.message });
  }
}

/**
 * Reset / Forgot Password (for resetting via registered email)
 */
export async function forgotPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = findLocalUserByEmail(cleanEmail);

    if (!user) {
      try {
        const db = getDbPool();
        const [result] = await db.query("SELECT * FROM users WHERE email = ?", [cleanEmail]);
        if (result && result.length > 0) {
          user = result[0];
        }
      } catch (dbErr) {
        console.warn("[TiDB Notice] forgotPassword DB query:", dbErr.message);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "No account registered with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Update in local store
    updateLocalUserPassword(cleanEmail, newHash);
    if (user.id) {
      updateLocalUserPasswordById(user.id, newHash);
    }

    // Try updating in TiDB
    try {
      const db = getDbPool();
      await db.query("UPDATE users SET password_hash = ? WHERE LOWER(email) = ?", [newHash, cleanEmail]);
      if (user.id) {
        await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, user.id]);
      }
    } catch (dbErr) {
      console.warn("[TiDB Notice] forgotPassword update in TiDB:", dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (err) {
    console.error("[Forgot Password Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to reset password: " + err.message });
  }
}
