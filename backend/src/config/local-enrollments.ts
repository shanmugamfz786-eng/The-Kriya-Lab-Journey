import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const ENROLLMENTS_FILE = path.join(DATA_DIR, "enrollments.json");

export interface LocalEnrollmentRecord {
  id: string;
  user_id: string;
  program_id: string;
  status: string;
  created_at: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getLocalEnrollments(): LocalEnrollmentRecord[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(ENROLLMENTS_FILE)) {
      // Seed with sample initial enrollments
      const seeds: LocalEnrollmentRecord[] = [
        {
          id: "enr_seed_001",
          user_id: "KL_001",
          program_id: "prg_1",
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: "enr_seed_002",
          user_id: "KL_002",
          program_id: "prg_2",
          status: "active",
          created_at: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(seeds, null, 2), "utf-8");
      return seeds;
    }
    const data = fs.readFileSync(ENROLLMENTS_FILE, "utf-8");
    return JSON.parse(data) || [];
  } catch (err) {
    console.warn("[Local Enrollments] Read error:", err);
    return [];
  }
}

export function saveLocalEnrollment(userId: string, programId: string): LocalEnrollmentRecord {
  ensureDataDir();
  const list = getLocalEnrollments();
  const existing = list.find((e) => e.user_id === userId && e.program_id === programId);
  if (existing) {
    return existing;
  }
  const newRec: LocalEnrollmentRecord = {
    id: "enr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
    user_id: userId,
    program_id: programId,
    status: "active",
    created_at: new Date().toISOString(),
  };
  list.unshift(newRec);
  try {
    fs.writeFileSync(ENROLLMENTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[Local Enrollments] Write error:", err);
  }
  return newRec;
}

export function getUserLocalEnrollments(userId: string): LocalEnrollmentRecord[] {
  const list = getLocalEnrollments();
  return list.filter((e) => e.user_id === userId);
}
