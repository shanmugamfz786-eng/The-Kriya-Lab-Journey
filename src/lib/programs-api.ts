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
    console.warn("Backend programs fetch failed", err);
  }
  return INITIAL_PROGRAMS;
}

export async function createProgramApi(payload: Omit<ProgramItem, "id">): Promise<ProgramItem> {
  const res = await fetch(`${API_URL}/api/programs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    const data = await res.json();
    return data.program;
  }
  return {
    ...payload,
    id: "prg_" + Date.now(),
  };
}

export async function updateProgramApi(id: string, payload: Partial<ProgramItem>): Promise<ProgramItem | null> {
  const res = await fetch(`${API_URL}/api/programs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json();
    return data.program || null;
  }
  return null;
}

export async function deleteProgramApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/programs/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}
