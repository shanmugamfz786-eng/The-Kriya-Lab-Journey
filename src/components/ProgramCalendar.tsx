import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bi, useLang } from "@/lib/i18n";

export type ProgramDate = {
  id: string;
  program_slug: string;
  program_label: string;
  session_date: string;
  start_time: string | null;
  format: string;
  capacity: number;
  seats_taken: number;
  note_en: string;
  note_ta: string;
  is_open: boolean;
};

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_TA = [
  "ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்",
  "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்",
];
const DOW_EN = ["S", "M", "T", "W", "T", "F", "S"];

const DEFAULT_PROGRAM_DATES: ProgramDate[] = [
  {
    id: "pd-1",
    program_slug: "1st-kriya-online",
    program_label: "1st Kriya Online Initiation",
    session_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    start_time: "06:00 AM IST",
    format: "Online via Zoom",
    capacity: 30,
    seats_taken: 18,
    note_en: "Weekend batch with guided breath correction",
    note_ta: "வழிகாட்டலுடன் கூடிய வார இறுதி வகுப்பு",
    is_open: true,
  },
  {
    id: "pd-2",
    program_slug: "1st-kriya-chennai",
    program_label: "In-Person Chennai Intensive",
    session_date: new Date(Date.now() + 86400000 * 12).toISOString().slice(0, 10),
    start_time: "09:00 AM IST",
    format: "In-Person (Chennai Ashram)",
    capacity: 25,
    seats_taken: 14,
    note_en: "Full day direct initiation & transmission",
    note_ta: "நேரடி தீட்சை மற்றும் பயிற்சி அமர்வு",
    is_open: true,
  },
  {
    id: "pd-3",
    program_slug: "higher-kriya",
    program_label: "Advanced Higher Kriya & Thokar",
    session_date: new Date(Date.now() + 86400000 * 20).toISOString().slice(0, 10),
    start_time: "06:30 AM IST",
    format: "Online Intensive",
    capacity: 20,
    seats_taken: 9,
    note_en: "For initiated sadhakas with 1+ yr practice",
    note_ta: "1 வருடத்திற்கு மேல் பயிற்சி செய்த சாதகர்களுக்கு",
    is_open: true,
  },
];

export function useProgramDates() {
  return useQuery({
    queryKey: ["program-dates"],
    queryFn: async () => {
      return DEFAULT_PROGRAM_DATES;
    },
  });
}

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function ProgramCalendar({
  programSlug,
  value,
  onSelect,
}: {
  programSlug?: string;
  value?: string | null;
  onSelect: (session: ProgramDate | null) => void;
}) {
  const { t, lang } = useLang();
  const { data, isLoading, error } = useProgramDates();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());

  const sessions = useMemo(() => {
    if (!data) return [];
    return data.filter((s) => !programSlug || s.program_slug === programSlug);
  }, [data, programSlug]);

  const sessionMap = useMemo(() => {
    const map = new Map<string, ProgramDate>();
    for (const s of sessions) {
      map.set(s.session_date, s);
    }
    return map;
  }, [sessions]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDOW = new Date(year, month, 1).getDay();

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const selectedSession = sessions.find((s) => s.id === value);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-serif text-lg font-medium">
          {lang === "ta" ? MONTHS_TA[month] : MONTHS_EN[month]} {year}
        </h3>
        <div className="flex items-center gap-1 text-sm">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded px-2.5 py-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded px-2.5 py-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          {t(bi("Loading available dates…", "தேதிகள் ஏற்றப்படுகின்றன…"))}
        </p>
      ) : error ? (
        <p className="py-4 text-xs text-destructive">{(error as Error).message}</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] font-medium text-muted-foreground">
            {DOW_EN.map((d, i) => (
              <div key={i} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({ length: firstDOW }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = iso(year, month, day);
              const session = sessionMap.get(dateStr);
              const isSelected = selectedSession?.id === session?.id && Boolean(session);
              const hasSession = Boolean(session);
              const seatsLeft = session ? session.capacity - session.seats_taken : 0;
              const isFull = seatsLeft <= 0;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!hasSession || isFull}
                  onClick={() => onSelect(session ?? null)}
                  className={`group relative flex flex-col items-center rounded p-2 transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : hasSession && !isFull
                        ? "bg-secondary hover:bg-gold/20 text-foreground font-medium cursor-pointer"
                        : "text-muted-foreground/40 cursor-default"
                  }`}
                >
                  <span>{day}</span>
                  {hasSession && (
                    <span
                      className={`mt-1 h-1 w-1 rounded-full ${
                        isSelected
                          ? "bg-gold"
                          : isFull
                            ? "bg-muted-foreground/50"
                            : "bg-gold animate-pulse"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {selectedSession ? (
            <div className="rounded-lg border border-gold/40 bg-gold/5 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-semibold text-foreground">
                  {selectedSession.session_date}
                </span>
                <span className="text-[0.7rem] text-gold font-medium">
                  {selectedSession.format}
                </span>
              </div>
              {selectedSession.start_time && (
                <p className="mt-1 text-muted-foreground">
                  Time: {selectedSession.start_time}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[0.75rem] text-muted-foreground">
              {t(bi("Select a highlighted date above", "மேலே உள்ள தேதியைத் தேர்ந்தெடுக்கவும்"))}
            </p>
          )}
        </>
      )}
    </div>
  );
}
