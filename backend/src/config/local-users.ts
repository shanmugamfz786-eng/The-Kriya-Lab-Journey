import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory located at backend/data/users.json
const DATA_DIR = path.resolve(__dirname, "../../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export interface LocalUserRecord {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: "student" | "admin";
  created_at?: string;
  avatar?: string;
  country?: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Seed initial fallback users with pre-hashed passwords
 */
function getInitialUsers(): LocalUserRecord[] {
  // Pre-hashed "admin123" and "user123" with bcrypt (salt 10)
  // admin123 hash
  const adminHash = "$2a$10$wTfZ4781qC86iRrh4oH4p.e7Xgq9GvR6f0j8gQoU0x7VzE4gqgIri";
  // user123 hash
  const userHash = "$2a$10$1WnIq7X6R4bN7sK4Y5yG3uI0BqXn3y3aV2x.xO6kR9vP3sW9X1zQ2";

  return [
    {
      id: "usr_admin_001",
      full_name: "Kriya Master Admin",
      email: "admin@thekriyalab.com",
      password_hash: bcrypt.hashSync("admin123", 10),
      role: "admin",
      created_at: "2026-10-01T00:00:00.000Z",
    },
    {
      id: "KL_009",
      full_name: "Murugan Anand",
      email: "murugan.kriya@gmail.com",
      password_hash: bcrypt.hashSync("password123", 10),
      role: "student",
      created_at: "2026-10-23T10:10:00.000Z",
    },
    {
      id: "KL_001",
      full_name: "Senthil Kumar",
      email: "senthil.k@gmail.com",
      password_hash: bcrypt.hashSync("student123", 10),
      role: "student",
      created_at: "2026-10-21T09:30:00Z",
    },
    {
      id: "KL_002",
      full_name: "Deepa Narayanan",
      email: "deepa.n@outlook.com",
      password_hash: bcrypt.hashSync("student123", 10),
      role: "student",
      created_at: "2026-10-20T14:15:00Z",
    },
    {
      id: "KL_003",
      full_name: "Rajesh Kannan",
      email: "rajesh.k@gmail.com",
      password_hash: bcrypt.hashSync("student123", 10),
      role: "student",
      created_at: "2026-10-19T18:45:00Z",
    },
    {
      id: "KL_004",
      full_name: "Ananya Iyer",
      email: "ananya.iyer@gmail.com",
      password_hash: bcrypt.hashSync("student123", 10),
      role: "student",
      created_at: "2026-10-18T11:20:00Z",
    },
    {
      id: "KL_005",
      full_name: "Karthik Subramanian",
      email: "karthik.s@yahoo.com",
      password_hash: bcrypt.hashSync("student123", 10),
      role: "student",
      created_at: "2026-10-22T08:00:00Z",
    },
    {
      id: "KL_006",
      full_name: "Demo Student",
      email: "user@thekriyalab.com",
      password_hash: bcrypt.hashSync("user123", 10),
      role: "student",
      created_at: "2026-10-22T06:00:00Z",
    },
  ];
}

export function getLocalUsers(): LocalUserRecord[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    const initial = getInitialUsers();
    saveLocalUsers(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn("[Local Users Store] Error reading users.json, reinitializing:", err);
  }

  const initial = getInitialUsers();
  saveLocalUsers(initial);
  return initial;
}

export function saveLocalUsers(users: LocalUserRecord[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("[Local Users Store] Error saving users.json:", err);
  }
}

export function findLocalUserByEmail(email: string): LocalUserRecord | null {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const users = getLocalUsers();
  return users.find((u) => u.email.toLowerCase() === clean) || null;
}

export function findLocalUserById(id: string): LocalUserRecord | null {
  if (!id) return null;
  const users = getLocalUsers();
  return users.find((u) => u.id === id) || null;
}

export function addOrUpdateLocalUser(user: LocalUserRecord): LocalUserRecord {
  const users = getLocalUsers();
  const cleanEmail = user.email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.toLowerCase() === cleanEmail || u.id === user.id);

  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.unshift(user);
  }

  saveLocalUsers(users);
  return user;
}

export function updateLocalUserPassword(email: string, newPasswordHash: string): boolean {
  const users = getLocalUsers();
  const cleanEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (user) {
    user.password_hash = newPasswordHash;
    saveLocalUsers(users);
    return true;
  }
  return false;
}

export function updateLocalUserPasswordById(userId: string, newPasswordHash: string): boolean {
  const users = getLocalUsers();
  const user = users.find((u) => u.id === userId);

  if (user) {
    user.password_hash = newPasswordHash;
    saveLocalUsers(users);
    return true;
  }
  return false;
}

export function deleteLocalUser(userId: string): boolean {
  const users = getLocalUsers();
  const filtered = users.filter((u) => u.id !== userId);
  if (filtered.length !== users.length) {
    saveLocalUsers(filtered);
    return true;
  }
  return false;
}
