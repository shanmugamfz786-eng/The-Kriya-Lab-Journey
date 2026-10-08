import { useState, useEffect } from "react";
import { ProgramItem } from "./programs-api";

const API_URL = import.meta.env['VITE_API_URL'] || "http://localhost:5000";

// Fetch from backend instead of local storage
export async function enrollProgram(userId: string, programId: string) {
  if (typeof window === "undefined" || !userId || !programId) return;
  try {
    const res = await fetch(`${API_URL}/api/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, programId }),
    });
    const data = await res.json();
    if (data.success) {
      window.dispatchEvent(new Event("kriya_enrollments_changed"));
    }
  } catch (err) {
    console.error("Failed to enroll", err);
  }
}

export function useEnrollments(userId?: string) {
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
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
      try {
        const res = await fetch(`${API_URL}/api/enrollments/${userId}`);
        const data = await res.json();
        if (data.success) {
          setEnrolledPrograms(data.programs || []);
          setEnrolledIds(data.programs ? data.programs.map((p: any) => p.id) : []);
        } else {
          setEnrolledPrograms([]);
          setEnrolledIds([]);
        }
      } catch (err) {
        console.error("Failed to fetch user enrollments", err);
        setEnrolledPrograms([]);
        setEnrolledIds([]);
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
