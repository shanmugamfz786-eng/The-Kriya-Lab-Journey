export interface ProgramItem {
  id: string;
  title_en: string;
  description_en: string;
  instructor_en: string;
  location_en: string;
  language_en?: string;
  title_ta: string;
  description_ta: string;
  instructor_ta: string;
  location_ta: string;
  language_ta?: string;
  level: string; // beginner / intermediate / pro
  duration: string;
  schedule_date: string;
  enrolment_status: string; // enquire / almost full / full
  image_url: string;
  program_type: "online" | "offline";
  price_inr?: string;
  price_usd?: string;
  created_at?: string;
}

export const API_URL = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:5000";

export const INITIAL_PROGRAMS: ProgramItem[] = [];

export async function fetchAllPrograms(): Promise<ProgramItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/programs`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.programs)) {
        return data.programs;
      }
    }
  } catch (err) {
    console.warn("Backend programs fetch failed, falling back to localStorage", err);
  }
  
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("mock_programs");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
  }
  return INITIAL_PROGRAMS;
}

export async function createProgramApi(payload: Omit<ProgramItem, "id">): Promise<ProgramItem> {
  try {
    const res = await fetch(`${API_URL}/api/programs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return data.program;
    }
  } catch (e) {
    console.warn("Backend unavailable, faking create and saving to localStorage.");
  }
  
  const newProgram = {
    ...payload,
    id: "prg_" + Date.now(),
  };

  if (typeof window !== "undefined") {
    const local = localStorage.getItem("mock_programs");
    const current = local ? JSON.parse(local) : INITIAL_PROGRAMS;
    localStorage.setItem("mock_programs", JSON.stringify([...current, newProgram]));
  }

  return newProgram;
}

export async function updateProgramApi(id: string, payload: Partial<ProgramItem>): Promise<ProgramItem | null> {
  try {
    const res = await fetch(`${API_URL}/api/programs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return data.program || null;
    }
  } catch (e) {
    console.warn("Backend unavailable, faking update and saving to localStorage.");
    const updatedProgram = { id, ...payload } as ProgramItem;
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("mock_programs");
      if (local) {
        let current = JSON.parse(local) as ProgramItem[];
        current = current.map(p => p.id === id ? { ...p, ...payload } : p);
        localStorage.setItem("mock_programs", JSON.stringify(current));
      }
    }
    return updatedProgram;
  }
  return null;
}

export async function deleteProgramApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/programs/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (e) {
    console.warn("Backend unavailable, faking delete and saving to localStorage.");
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("mock_programs");
      if (local) {
        let current = JSON.parse(local) as ProgramItem[];
        current = current.filter(p => p.id !== id);
        localStorage.setItem("mock_programs", JSON.stringify(current));
      }
    }
    return true;
  }
}
