import { useState, useEffect, useRef } from "react";
import { Search, Compass, Calendar } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useLang, bi } from "@/lib/i18n";
import { listPublicPrograms } from "@/lib/programs.functions";
import { listPublicEvents } from "@/lib/events.functions";
import { type ProgramItem } from "@/lib/programs-api";
import { type PublicEvent } from "@/lib/events.functions";
import { cn } from "@/lib/utils";

export function GlobalSearch({ isTransparent }: { isTransparent?: boolean }) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const ta = lang === "ta";
  
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      if (programs.length > 0) return; // Already fetched
      setIsLoading(true);
      try {
        const [p, e] = await Promise.all([listPublicPrograms(), listPublicEvents()]);
        setPrograms(p);
        setEvents(e);
      } catch (err) {
        console.error("Failed to load search data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isOpen, programs.length]);

  const lowerQuery = query.toLowerCase().trim();
  
  const filteredPrograms = lowerQuery
    ? programs.filter((p) => 
        p.title_en.toLowerCase().includes(lowerQuery) || 
        (p.title_ta && p.title_ta.toLowerCase().includes(lowerQuery)) ||
        p.description_en.toLowerCase().includes(lowerQuery) ||
        (p.description_ta && p.description_ta.toLowerCase().includes(lowerQuery))
      ).slice(0, 3)
    : [];

  const filteredEvents = lowerQuery
    ? events.filter((e) =>
        e.title_en.toLowerCase().includes(lowerQuery) ||
        (e.title_ta && e.title_ta.toLowerCase().includes(lowerQuery)) ||
        (e.venue_en && e.venue_en.toLowerCase().includes(lowerQuery)) ||
        (e.venue_ta && e.venue_ta.toLowerCase().includes(lowerQuery))
      ).slice(0, 3)
    : [];

  const hasResults = filteredPrograms.length > 0 || filteredEvents.length > 0;

  return (
    <div ref={wrapperRef} className="relative hidden xl:block mr-2">
      <div 
        className={cn(
          "flex items-center rounded-full border transition-all duration-300 w-48 xl:w-56 2xl:w-64 px-3.5 py-1.5",
          isTransparent 
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20" 
            : "border-border bg-secondary/50 text-foreground hover:bg-secondary",
          isOpen ? "ring-2 ring-gold/50 border-transparent" : ""
        )}
      >
        <Search className="size-4 shrink-0 mr-2 opacity-70" />
        <input
          id="global-search-input"
          type="text"
          placeholder={t(bi("Search...", "தேடுக..."))}
          className="bg-transparent border-none outline-none text-sm font-medium placeholder:text-current placeholder:opacity-60 w-full"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query.length > 1 && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-[400px] overflow-y-auto rounded-xl border border-border bg-background shadow-2xl p-2 z-50 flex flex-col gap-1">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-xs text-muted-foreground">{t(bi("No results found", "முடிவுகள் இல்லை"))}</div>
          ) : (
            <>
              {filteredPrograms.length > 0 && (
                <div className="mb-2">
                  <div className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest px-2 pb-1 mb-1 border-b border-border">
                    {t(bi("Programs", "பயிற்சிகள்"))}
                  </div>
                  {filteredPrograms.map((p) => (
                    <Link
                      key={p.id}
                      to="/programs/$id"
                      params={{ id: String(p.id) }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => { setIsOpen(false); setQuery(""); }}
                    >
                      <div className="bg-gold/10 text-gold p-1.5 rounded-md shrink-0">
                        <Compass className="size-4" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold truncate text-foreground">{ta && p.title_ta ? p.title_ta : p.title_en}</span>
                        <span className="text-[0.65rem] text-muted-foreground truncate">{p.level}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {filteredEvents.length > 0 && (
                <div>
                  <div className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest px-2 pb-1 mb-1 border-b border-border">
                    {t(bi("Events", "நிகழ்வுகள்"))}
                  </div>
                  {filteredEvents.map((e) => (
                    <Link
                      key={e.id}
                      to="/events"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => { setIsOpen(false); setQuery(""); }}
                    >
                      <div className="bg-primary/10 text-primary p-1.5 rounded-md shrink-0">
                        <Calendar className="size-4" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold truncate text-foreground">{ta && e.title_ta ? e.title_ta : e.title_en}</span>
                        <span className="text-[0.65rem] text-muted-foreground truncate">{ta && e.venue_ta ? e.venue_ta : e.venue_en}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
