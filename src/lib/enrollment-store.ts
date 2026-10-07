import { useState, useEffect } from "react";
import { ProgramItem, fetchAllPrograms } from "./programs-api";

const STORAGE_KEY = "kriya_enrolled_programs";

export function getEnrolledProgramIds(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enrollProgram(userId: string, programId: string) {
  if (typeof window === "undefined") return;
  const current = getEnrolledProgramIds(userId);
  if (!current.includes(programId)) {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify([...current, programId]));
    window.dispatchEvent(new Event("kriya_enrollments_changed"));
  }
}

export function useEnrollments(userId?: string) {
  const [enrolledIds, setEnrolledIds] = useState<string[]>(() => userId ? getEnrolledProgramIds(userId) : []);
  const [enrolledPrograms, setEnrolledPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setEnrolledIds([]);
      setEnrolledPrograms([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const ids = getEnrolledProgramIds(userId);
      setEnrolledIds(ids);
      
      if (ids.length > 0) {
        const all = await fetchAllPrograms();
        const matched = all.filter(p => ids.includes(p.id));
        setEnrolledPrograms(matched);
      } else {
        setEnrolledPrograms([]);
      }
      setLoading(false);
    };

    loadData();

    const handleChange = () => {
      loadData();
    };

    window.addEventListener("kriya_enrollments_changed", handleChange);
    return () => {
      window.removeEventListener("kriya_enrollments_changed", handleChange);
    };
  }, [userId]);

  return { enrolledIds, enrolledPrograms, loading };
}
