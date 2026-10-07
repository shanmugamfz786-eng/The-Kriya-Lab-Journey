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

export const INITIAL_PROGRAMS: ProgramItem[] = [
  {
    id: "prg_1",
    title_en: "Inner Awakening Kriya",
    description_en: "A comprehensive journey into the core of Kriya Yoga.",
    instructor_en: "Swami Kriyanda",
    location_en: "Zoom (Online)",
    title_ta: "உள் விழிப்புணர்வு கிரியா",
    description_ta: "கிரியா யோகத்தின் அடிப்படை பயணங்கள்.",
    instructor_ta: "சுவாமி கிரியானந்தா",
    location_ta: "ஜூம் (ஆன்லைன்)",
    level: "beginner",
    duration: "4 Weeks",
    schedule_date: "2026-11-01T10:00:00Z",
    enrolment_status: "enquire",
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
    program_type: "online",
    price_inr: "4999",
    price_usd: "59",
    created_at: new Date().toISOString()
  },
  {
    id: "prg_2",
    title_en: "Advanced Pranayama",
    description_en: "Master your breath with advanced Siddha techniques.",
    instructor_en: "Sadhguru Ram",
    location_en: "Google Meet",
    title_ta: "மேம்பட்ட பிராணாயாமம்",
    description_ta: "சுவாசத்தை கட்டுப்படுத்தும் மேம்பட்ட முறை.",
    instructor_ta: "சத்குரு ராம்",
    location_ta: "கூகுள் மீட்",
    level: "intermediate",
    duration: "6 Weeks",
    schedule_date: "2026-11-15T08:00:00Z",
    enrolment_status: "almost full",
    image_url: "https://images.unsplash.com/photo-1522845015757-50bce044e5da?q=80&w=600&auto=format&fit=crop",
    program_type: "online",
    price_inr: "7999",
    price_usd: "99",
    created_at: new Date().toISOString()
  },
  {
    id: "prg_3",
    title_en: "Himalayan Retreat",
    description_en: "A deep immersive retreat in the Himalayas.",
    instructor_en: "Sri Babaji",
    location_en: "Rishikesh, India",
    title_ta: "இமயமலை தியான முகாம்",
    description_ta: "இமயமலையில் ஆழமான தியான பயிற்சி.",
    instructor_ta: "ஸ்ரீ பாபாஜி",
    location_ta: "ரிஷிகேஷ், இந்தியா",
    level: "pro",
    duration: "14 Days",
    schedule_date: "2027-01-10T09:00:00Z",
    enrolment_status: "full",
    image_url: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?q=80&w=600&auto=format&fit=crop",
    program_type: "offline",
    price_inr: "25000",
    price_usd: "350",
    created_at: new Date().toISOString()
  },
  {
    id: "prg_4",
    title_en: "Foundation Weekend Workshop",
    description_en: "A 2-day intensive introduction to the Kriya Lab methods.",
    instructor_en: "Master Yogi",
    location_en: "Chennai Center",
    title_ta: "அடிப்படை யோக பட்டறை",
    description_ta: "2 நாட்கள் தொடக்க நிலை பயிற்சி.",
    instructor_ta: "மாஸ்டர் யோகி",
    location_ta: "சென்னை மையம்",
    level: "beginner",
    duration: "2 Days",
    schedule_date: "2026-12-05T10:00:00Z",
    enrolment_status: "enquire",
    image_url: "https://images.unsplash.com/photo-1552858725-2758b5fb1286?q=80&w=600&auto=format&fit=crop",
    program_type: "offline",
    price_inr: "1999",
    price_usd: "25",
    created_at: new Date().toISOString()
  }
];

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
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
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
