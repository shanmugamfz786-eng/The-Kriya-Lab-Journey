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
    description_en: `Inner Awakening Kriya is an authentic foundational initiation into the sacred science of Kriya Yoga as handed down by Mahavatar Babaji and Paramahansa Yogananda. This 4-week structured journey takes you step-by-step from foundational breath-body alignment to deep internal stillness.

Key Aspects Covered:
• Energization Exercises (Prana Vidya) to recharge vital nerve centers
• Sacred Kriya Pranayama: Direct circulation of energy along the spine (Sushumna Nadi)
• Jyoti Dhyan: Concentration upon the Spiritual Eye (Ajna Chakra)
• Subtle Sound Meditation (Aum Technique) to calm mental fluctuations
• Daily Sadhana blueprint for modern working professionals

Who Should Attend:
Open to all seekers, beginners, and sincere practitioners seeking authentic inner transformation, mental clarity, and spiritual grounding. No prior yoga experience is needed.`,
    instructor_en: "Swami Kriyanda",
    location_en: "Zoom (Online)",
    title_ta: "உள் விழிப்புணர்வு கிரியா",
    description_ta: `உள் விழிப்புணர்வு கிரியா என்பது மகா அவதார் பாபாஜி மற்றும் பரமஹம்ச யோகானந்தர் அருளிய பாரம்பரிய கிரியா யோகத்தின் புனிதமான தொடக்க நிலை தீட்சை பயிற்சியாகும். இந்த 4 வார நேரடி இணைய வழி பயிற்சி, உடல்-சுவாச ஒருங்கிணைப்பு முதல் ஆழமான உள் அமைதி வரை உங்களை வழிநடத்துகிறது.

பயிற்சியில் இடம்பெறும் முக்கிய அம்சங்கள்:
• பிராண சக்தி பயிற்சிகள்: நரம்பு மண்டலத்தை புத்துணர்ச்சியடையச் செய்யும் முறை
• புனித கிரியா பிராணாயாமம்: சுஷும்னா நாடி வழியாக ஆற்றலை சுழலச் செய்யும் கலை
• ஜோதி தியானம்: ஆக்ஞா சக்கரத்தில் (புருவ மத்தி) கவனத்தை நிலைநிறுத்துதல்
• ஓங்கார நாத தியானம்: மன அலைகளை அடக்கி அமைதி பெறும் உத்தி
• தினசரி சாதனா கால அட்டவணை: பணிச்சூழலில் நடைமுறைப்படுத்தும் வழிமுறைகள்

யாருக்கானது:
ஆன்மீகத் தேடலுடைய அனைவரும், தொடக்க நிலை சாதகர்கள் மற்றும் மன அமைதியை விரும்புவோர் இதில் பங்கேற்கலாம். முந்தைய யோக அனுபவம் தேவையில்லை.`,
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
    description_en: `Advanced Pranayama is an intensive 6-week experiential mastery course based on traditional Siddha and Hatha Yoga breath methodologies. This program delves beyond basic breathwork to harness Kundalini shakti, cleanse psychic channels (Nadis), and elevate consciousness.

Curriculum Highlights:
• Nadi Shuddhi & Bandha Integration (Mula, Uddiyana, and Jalandhara Bandhas)
• Kumbhaka Vigyan: Safe expansion of internal and external breath retention
• Sheetali, Bhastrika, and Surya Bhedana for thermo-energetic balance
• Swara Yoga: Aligning life decisions with lunar and solar nostril dominance
• Micro-circulation of prana to rejuvenate biological cells and slow aging

Prerequisites:
Recommended for seekers who already have a consistent daily meditation or beginner pranayama practice for at least 3 months.`,
    instructor_en: "Sadhguru Ram",
    location_en: "Google Meet",
    title_ta: "மேம்பட்ட பிராணாயாமம்",
    description_ta: `மேம்பட்ட பிராணாயாமம் என்பது பாரம்பரிய சித்த மற்றும் ஹட யோக சுவாசக் கலைகளை அடிப்படையாகக் கொண்ட 6 வார தீவிர அனுபவப் பயிற்சியாகும். இது எளிய சுவாசப் பயிற்சிகளைத் தாண்டி, குண்டலினி சக்தியை விழிப்படையச் செய்யவும், நாடிகளை தூய்மைப்படுத்தவும், உயர் விழிப்புணர்வை அடையவும் உதவுகிறது.

முக்கிய பாடத்திட்டம்:
• நாடி சுத்தி மற்றும் மூவகை பந்தங்கள் (மூல, உட்டியாண மற்றும் ஜாலந்தர பந்தங்கள்)
• கும்பக விஞ்ஞானம்: உள் மற்றும் வெளி மூச்சு நிறுத்தத்தை பாதுகாப்பாக நீட்டிக்கும் நுட்பம்
• பஸ்திரிகா, சீதளி மற்றும் சூர்ய பேதன பயிற்சிகள் மூலம் உடல் சமநிலை
• சர யோகம்: இடகலை, பிங்கலை நாடிகளின் ஓட்டத்தை அறிந்து செயல்படும் கலை
• பிராண சுழற்சி: உடலின் செல்களை இளமையாகவும் சுறுசுறுப்பாகவும் வைத்திருக்கும் முறை

தகுதி:
குறைந்தபட்சம் 3 மாதங்கள் அடிப்படை தியானம் அல்லது மூச்சுப் பயிற்சி செய்து வரும் சாதகர்களுக்கு ஏற்றது.`,
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
    description_en: `Immerse yourself in a transformative 14-day residential sadhana retreat in the sacred energy vortex of Rishikesh and the Himalayan foothills. Designed for advanced seekers, this retreat combines deep silence (Mauna), high-altitude Kriya sadhana, and direct satsangs with realized masters.

Retreat Highlights:
• 14 Days of immersive spiritual living along the banks of the Holy Ganga
• Sunrise & Sunset intensive Kriya initiation sessions in natural cave sanctuaries
• Complete digital detox and observed periods of noble silence (Mauna)
• Sacred Vedic Fire Ceremonies (Homa) and ancient Temple yatras
• Organic Sattvic Himalayan diet prepared according to Ayurvedic principles
• Personal 1-on-1 spiritual mentoring and bespoke sadhana prescription

Experience:
Escape mundane distractions to experience profound spiritual awakening, pristine mountain prana, and timeless Himalayan peace.`,
    instructor_en: "Sri Babaji",
    location_en: "Rishikesh, India",
    title_ta: "இமயமலை தியான முகாம்",
    description_ta: `புனித கங்கை நதிக்கரையில் அமைந்துள்ள ரிஷிகேஷ் மற்றும் இமயமலை அடிவாரத்தின் தெய்வீக சக்தி மண்டலத்தில் 14 நாட்கள் தங்கி பயிலும் தீவிர ஆன்மீக சாதனா முகாம். அமைதி (மௌனம்), உயர்ந்த கிரியா சாதனா மற்றும் ஞான குருமார்களுடனான நேரடி சத்சங்கங்களை அனுபவிக்க இது ஒரு அரிய வாய்ப்பு.

முகாமின் சிறப்பம்சங்கள்:
• புனித கங்கை நதிக்கரையில் 14 நாட்கள் அமைதியான ஆன்மீக வாழ்க்கை
• இயற்கை குகைகள் மற்றும் ஆசிரம சூழலில் காலை, மாலை தீவிர கிரியா தீட்சை
• முழுமையான மின்னணு சாதன விடுப்பு (Digital Detox) மற்றும் மௌன விரதம்
• வேத முறைப்படியான ஹோமங்கள் மற்றும் புனித தல தரிசனங்கள்
• ஆயுர்வேத நெறிமுறைகளுடன் கூடிய சத்தான சாத்விக இமயமலை உணவு
• குருவுடன் நேருக்கு நேர் தனிப்பட்ட ஆன்மீக வழிகாட்டுதல்

அனுபவம்:
அன்றாட அழுத்தங்களை விடுத்து, இமயமலையின் தூய பிராண சக்தியோடு ஆன்ம விழிப்புணர்வை அடையும் உன்னத பயணம்.`,
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
    description_en: `A fast-paced, high-impact 2-day in-person workshop held at our Chennai Center. Specifically designed for busy students, executives, and householders who want to establish an unshakeable foundation in posture, breath, and inner mindfulness.

What You Will Learn:
• Sukshma Vyayama: Subtle joint opening and spinal mobilization drills
• Dynamic Core Breathing to instantly eradicate fatigue and work burnout
• The 15-Minute Daily Routine: Practical Kriya essentials you can practice anywhere
• Science of Posture (Asana Sthirata) for effortless pain-free sitting
• Mindful eating and sleep optimization according to Siddha wisdom

Includes:
Complete workshop manual, guided audio sadhana tracks, and certificate of completion upon concluding the 2 days.`,
    instructor_en: "Master Yogi",
    location_en: "Chennai Center",
    title_ta: "அடிப்படை யோக பட்டறை",
    description_ta: `சென்னை மையத்தில் நடைபெறும் 2 நாட்கள் நேரடி தீவிர யோக பயிற்சி பட்டறை. பணிபுரியும் நபர்கள், இல்லத்தரசிகள் மற்றும் மாணவர்களுக்கு ஏற்ற வகையில், உடல் நலன், சீரான சுவாசம் மற்றும் மன அமைதிக்கான உறுதியான அடித்தளத்தை அமைத்துக் கொடுக்கிறது.

நீங்கள் கற்றுக்கொள்வது:
• சூட்சும வியாயாமம்: மூட்டுகள் மற்றும் முதுகெலும்பை நெகிழ்வாக்கும் எளிய பயிற்சிகள்
• உடனடி புத்துணர்ச்சி தரும் ஆற்றல் வாய்ந்த சுவாச நுட்பங்கள்
• 15 நிமிட தினசரி சாதனா: எங்கும், எப்போதும் செய்யக்கூடிய எளிய பயிற்சி முறை
• ஆசன ஸ்திரத்தன்மை: வலியில்லாமல் நீண்ட நேரம் அமரும் கலை
• சித்த மருத்துவ முறையிலான உணவு மற்றும் தூக்க நெறிமுறைகள்

வழங்கப்படுபவை:
பயிற்சி கையேடு, தினசரி பயிற்சிக்கான வழிகாட்டுதல் ஆடியோக்கள் மற்றும் பங்கேற்பு சான்றிதழ்.`,
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

/**
 * Reads programs directly from user's localStorage (0ms latency, zero backend server hits).
 */
export function getLocalPrograms(): ProgramItem[] {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("mock_programs");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    // Initialize user's localStorage with INITIAL_PROGRAMS on first access
    localStorage.setItem("mock_programs", JSON.stringify(INITIAL_PROGRAMS));
  }
  return INITIAL_PROGRAMS;
}

/**
 * 1-Time Background Sync: Fetches fresh programs from TiDB Cloud Backend
 * whenever user accesses the web page, and updates user's localStorage.
 */
export async function syncProgramsFromBackend(): Promise<ProgramItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/programs`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.programs) && data.programs.length > 0) {
        if (typeof window !== "undefined") {
          const local = localStorage.getItem("mock_programs");
          let merged = data.programs;
          if (local) {
            try {
              const localList: ProgramItem[] = JSON.parse(local);
              const serverIdSet = new Set(data.programs.map((p: ProgramItem) => String(p.id)));
              const customLocal = localList.filter((p) => !serverIdSet.has(String(p.id)));
              merged = [...customLocal, ...data.programs];
            } catch {}
          }
          localStorage.setItem("mock_programs", JSON.stringify(merged));
          window.dispatchEvent(new Event("kriya_programs_updated"));
        }
        return data.programs;
      }
    }
  } catch (err) {
    console.info("[Sync] Backend offline, serving programs directly from localStorage.");
  }
  return getLocalPrograms();
}

/**
 * Fetches all programs:
 * By default, reads 100% from user's localStorage (instant easy access).
 * Only contacts backend if forceRefresh is true or if localStorage is empty.
 */
export async function fetchAllPrograms(forceRefresh: boolean = false): Promise<ProgramItem[]> {
  if (!forceRefresh) {
    const cached = getLocalPrograms();
    if (cached && cached.length > 0) {
      return cached;
    }
  }
  return syncProgramsFromBackend();
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
      const prog = data.program;
      if (typeof window !== "undefined" && prog) {
        try {
          const local = localStorage.getItem("mock_programs");
          const current: ProgramItem[] = local ? JSON.parse(local) : INITIAL_PROGRAMS;
          localStorage.setItem("mock_programs", JSON.stringify([prog, ...current.filter((p) => p.id !== prog.id)]));
        } catch (e) {}
      }
      return prog;
    }
  } catch (e) {
    console.warn("Backend unavailable, faking create and saving to localStorage.");
  }
  
  const newProgram: ProgramItem = {
    ...payload,
    id: "prg_" + Date.now(),
  };

  if (typeof window !== "undefined") {
    const local = localStorage.getItem("mock_programs");
    const current: ProgramItem[] = local ? JSON.parse(local) : INITIAL_PROGRAMS;
    localStorage.setItem("mock_programs", JSON.stringify([newProgram, ...current.filter((p) => p.id !== newProgram.id)]));
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
      const prog = data.program || ({ id, ...payload } as ProgramItem);
      if (typeof window !== "undefined" && prog) {
        try {
          const local = localStorage.getItem("mock_programs");
          if (local) {
            let current = JSON.parse(local) as ProgramItem[];
            current = current.map((p) => (p.id === id ? { ...p, ...payload, ...prog } : p));
            localStorage.setItem("mock_programs", JSON.stringify(current));
          }
        } catch (e) {}
      }
      return prog;
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
