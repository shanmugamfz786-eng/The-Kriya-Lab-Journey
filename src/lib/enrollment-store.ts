import { useState, useEffect } from "react";
import { ProgramItem, INITIAL_PROGRAMS, fetchAllPrograms } from "./programs-api";
import { getStoredOrders } from "./orders-api";

const API_URL = import.meta.env["VITE_API_URL"] || "http://localhost:5000";
const LOCAL_ENROLLMENTS_KEY = "kriya_user_enrollments_v1";

export interface StoredEnrollment {
  userId: string;
  userEmail?: string | undefined;
  programId: string;
  programTitle?: string | undefined;
  enrolledAt: string;
}

function getLocalEnrollments(): StoredEnrollment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ENROLLMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEnrollment(enr: StoredEnrollment): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalEnrollments();
    if (!list.some((e) => e.userId === enr.userId && e.programId === enr.programId)) {
      list.unshift(enr);
      localStorage.setItem(LOCAL_ENROLLMENTS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error("Failed to save local enrollment:", e);
  }
}

/**
 * Enroll a user in a program and persist locally and remotely
 */
export async function enrollProgram(
  userId: string,
  programId: string,
  userEmail?: string,
  programTitle?: string
) {
  if (typeof window === "undefined" || !userId || !programId) return;

  // 1. Immediately persist to client local storage
  saveLocalEnrollment({
    userId,
    userEmail: userEmail?.toLowerCase(),
    programId,
    programTitle,
    enrolledAt: new Date().toISOString(),
  });
  window.dispatchEvent(new Event("kriya_enrollments_changed"));

  // 2. Persist to backend API
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
    console.warn("Backend enrollment sync notice:", err);
  }
}

/**
 * Hook to retrieve all programs a user is enrolled in.
 * Aggregates backend enrollments, completed orders, and local enrollment storage.
 */
export function useEnrollments(userId?: string, userEmail?: string) {
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId && !userEmail) {
      setEnrolledIds([]);
      setEnrolledPrograms([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);

      const targetEmail = (userEmail || "").toLowerCase().trim();
      const targetUserId = userId || "";

      // 1. Gather all dynamic and fallback programs
      let allCatalogPrograms: ProgramItem[] = INITIAL_PROGRAMS;
      try {
        const fetched = await fetchAllPrograms();
        if (Array.isArray(fetched) && fetched.length > 0) {
          allCatalogPrograms = fetched;
        }
      } catch {
        allCatalogPrograms = INITIAL_PROGRAMS;
      }

      // 2. Fetch from backend API
      let backendPrograms: ProgramItem[] = [];
      if (targetUserId) {
        try {
          const res = await fetch(`${API_URL}/api/enrollments/${targetUserId}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.programs)) {
            backendPrograms = data.programs;
          }
        } catch (err) {
          console.warn("Failed to fetch user enrollments from backend, falling back:", err);
        }
      }

      // 3. Read from completed orders matching user's email
      const orders = getStoredOrders();
      const userOrders = targetEmail
        ? orders.filter(
            (o) =>
              (o.customerEmail || "").toLowerCase().trim() === targetEmail &&
              o.status !== "Failed"
          )
        : [];

      // 4. Read from local stored enrollments
      const localEnrs = getLocalEnrollments().filter(
        (e) =>
          (targetUserId && e.userId === targetUserId) ||
          (targetEmail && e.userEmail && e.userEmail === targetEmail)
      );

      // 5. Combine and resolve into full ProgramItems without duplicates
      const programsMap = new Map<string, ProgramItem>();

      // From backend
      backendPrograms.forEach((p) => {
        programsMap.set(p.id, p);
      });

      // From orders
      userOrders.forEach((o) => {
        const slug = o.programSlug;
        const title = (o.programTitle || "").toLowerCase();
        // Match in catalog
        const match =
          allCatalogPrograms.find(
            (p) =>
              p.id === slug ||
              p.title_en.toLowerCase() === title ||
              title.includes(p.title_en.toLowerCase())
          ) ||
          INITIAL_PROGRAMS.find((p) => p.id === slug) ||
          INITIAL_PROGRAMS[0];

        if (match && !programsMap.has(match.id)) {
          programsMap.set(match.id, match);
        }
      });

      // From local enrollments
      localEnrs.forEach((e) => {
        const match =
          allCatalogPrograms.find((p) => p.id === e.programId) ||
          INITIAL_PROGRAMS.find((p) => p.id === e.programId) ||
          INITIAL_PROGRAMS[0];

        if (match && !programsMap.has(match.id)) {
          programsMap.set(match.id, match);
        }
      });

      const list = Array.from(programsMap.values());
      setEnrolledPrograms(list);
      setEnrolledIds(list.map((p) => p.id));
      setLoading(false);
    };

    loadData();

    const handleChange = () => {
      loadData();
    };

    window.addEventListener("kriya_enrollments_changed", handleChange);
    window.addEventListener("kriya_orders_updated", handleChange);
    return () => {
      window.removeEventListener("kriya_enrollments_changed", handleChange);
      window.removeEventListener("kriya_orders_updated", handleChange);
    };
  }, [userId, userEmail]);

  return { enrolledIds, enrolledPrograms, loading };
}
