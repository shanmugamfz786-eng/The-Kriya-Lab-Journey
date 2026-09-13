import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export function useProgramDates() {
  return useQuery({
    queryKey: ["program-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_dates")
        .select("*")
        .eq("is_open", true)
        .order("session_date", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as ProgramDate[];
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

  const sessions = useMemo(
    () => (data ?? []).filter((s) => !programSlug || s.program_slug === programSlug),
    [data, programSlug],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, ProgramDate[]>();
    for (const s of sessions) {
      if (!s.session_date.startsWith(String(year))) continue;
      const list = map.get(s.session_date) ?? [];
      list.push(s);
      map.set(s.session_date, list);
    }
    return map;
  }, [sessions, year]);

  const months = lang === "ta" ? MONTHS_TA : MONTHS_EN;

  if (isLoading)
    return (
      <p className="text-sm text-muted-foreground">
        {t(bi("Loading available dates…", "கிடைக்கும் தேதிகள் ஏற்றப்படுகிறது…"))}
      </p>
    );
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;

  return (
    <div className="rounded-sm border border-border p-5">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          className="rounded-full border border-border px-4 py-1.5 text-xs hover:border-primary hover:text-primary"
          aria-label={t(bi("Previous year", "முந்தைய ஆண்டு"))}
        >
          ←
        </button>
        <p className="font-serif text-xl">{year}</p>
        <button
          type="button"
          onClick={() => setYear((y) => y + 1)}
          className="rounded-full border border-border px-4 py-1.5 text-xs hover:border-primary hover:text-primary"
          aria-label={t(bi("Next year", "அடுத்த ஆண்டு"))}
        >
          →
        </button>
      </div>

      {byDate.size === 0 ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {t(
            bi(
              "No dates have been published for this selection yet. Please send an enquiry and we will contact you.",
              "இந்தத் தேர்வுக்கு இதுவரை தேதிகள் அறிவிக்கப்படவில்லை. விசாரணை அனுப்பினால் நாங்கள் தொடர்பு கொள்வோம்.",
            ),
          )}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((label, m) => {
          const first = new Date(year, m, 1).getDay();
          const days = new Date(year, m + 1, 0).getDate();
          const cells: (number | null)[] = [
            ...Array.from({ length: first }, () => null),
            ...Array.from({ length: days }, (_, i) => i + 1),
          ];
          const hasAny = cells.some((d) => d && byDate.has(iso(year, m, d)));
          return (
            <div key={label} className={hasAny ? "" : "opacity-50"}>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </p>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
                {DOW_EN.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (!d) return <span key={i} />;
                  const key = iso(year, m, d);
                  const list = byDate.get(key);
                  const selected = value === key;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!list}
                      onClick={() => onSelect(selected ? null : (list?.[0] ?? null))}
                      className={`aspect-square rounded-full text-[11px] transition-colors ${
                        selected
                          ? "bg-velvet text-primary-foreground"
                          : list
                            ? "bg-gold/20 text-foreground hover:bg-gold/40"
                            : "text-muted-foreground/60"
                      }`}
                      aria-label={`${key}${list ? ` — ${list.length} session(s)` : ""}`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {value && byDate.get(value) ? (
        <div className="mt-6 space-y-2 rounded-sm bg-muted p-4 text-sm">
          <p className="font-medium">{value}</p>
          {byDate.get(value)!.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              className="block w-full text-left text-muted-foreground hover:text-primary"
            >
              {s.program_label || s.program_slug}
              {s.start_time ? ` · ${s.start_time}` : ""} · {s.format}
              {s.capacity ? ` · ${Math.max(s.capacity - s.seats_taken, 0)} seats left` : ""}
              {lang === "ta" ? (s.note_ta ? ` — ${s.note_ta}` : "") : s.note_en ? ` — ${s.note_en}` : ""}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
