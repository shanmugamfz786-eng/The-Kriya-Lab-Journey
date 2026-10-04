import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Section } from "@/components/Primitives";
import { listPublicEvents, type PublicEvent } from "@/lib/events.functions";
import { bi, useLang } from "@/lib/i18n";
import { Search } from "lucide-react";

const filters = [
  { key: "all", label: bi("All Events", "அனைத்து நிகழ்வுகள்") },
  { key: "future", label: bi("Upcoming", "வரவிருக்கும் நிகழ்வுகள்") },
  { key: "past", label: bi("Past", "கடந்த நிகழ்வுகள்") },
] as const;

export const Route = createFileRoute("/events")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Events | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "Upcoming and past Kriya Yoga events, retreats and initiations at THE KRIYA LAB — dates, times and venues.",
      },
      { property: "og:title", content: "Events — THE KRIYA LAB" },
      {
        property: "og:description",
        content: "Future and past Kriya Yoga gatherings with dates, times and venues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EventsPage,
});



function EventsPage() {
  const { t, lang } = useLang();
  const fetchEvents = useServerFn(listPublicEvents);
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchEvents() as Promise<PublicEvent[]>,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("future");

  const rows = data ?? [];
  
  const searchedRows = rows.filter(
    (e) =>
      e.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title_ta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.venue_en && e.venue_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.venue_ta && e.venue_ta.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredRows = searchedRows.filter((r) => {
    if (filter === "all") return true;
    
    let isFuture = r.event_type === "future";
    const d = new Date(r.event_date);
    if (!isNaN(d.getTime())) {
      isFuture = d >= today;
    }
    
    if (filter === "future") return isFuture;
    if (filter === "past") return !isFuture;
    return true;
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
        <div className="flex w-full flex-col gap-5">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t(bi("Search events by title or location...", "நிகழ்வுகளை தேடுக..."))}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-border bg-background py-2.5 pl-12 pr-6 text-sm text-foreground shadow-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all"
            />
          </div>

          {/* Category Filters Bottom */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`rounded-full border px-6 py-2 text-sm font-medium transition-all ${
                  filter === f.key
                    ? "border-gold bg-gold text-velvet-deep shadow-md scale-105"
                    : "border-border text-muted-foreground hover:border-gold hover:text-gold hover:bg-gold/5"
                }`}
              >
                {t(f.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Section>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRows.length > 0 ? (
            filteredRows.map((e) => <EventCard key={e.id} event={e} lang={lang} />)
          ) : (
            <p className="text-sm text-muted-foreground text-center col-span-full">
              {t(bi("No events found.", "நிகழ்வுகள் ஏதுமில்லை."))}
            </p>
          )}
        </div>
      </Section>
    </>
  );
}

function EventCard({ event, lang }: { event: PublicEvent; lang: "en" | "ta" }) {
  const ta = lang === "ta";
  const title = (ta ? event.title_ta : event.title_en) || event.title_en;
  const description = (ta ? event.description_ta : event.description_en) || event.description_en;
  const venue = (ta ? event.venue_ta : event.venue_en) || event.venue_en;
  const when = [event.start_time, event.end_time].filter(Boolean).join(" – ");

  return (
    <article className="rounded-2xl border border-border overflow-hidden bg-background shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      {event.image_url && (
        <div className="w-full h-48 sm:h-64 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-border">
          <img src={event.image_url} alt={title} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-serif text-2xl">{title}</h3>
        <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
          <div>
            <dt className="sr-only">{ta ? "தேதி" : "Date"}</dt>
            <dd>{event.event_date}</dd>
          </div>
          {when ? <dd>{when}</dd> : null}
          {venue ? <dd>{venue}</dd> : null}
        </dl>
        {description ? <p className="mt-4 whitespace-pre-line text-sm text-gray-700">{description}</p> : null}
        
        {event.google_form_link && (
          <div className="mt-auto pt-6">
            <a 
              href={event.google_form_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-[#522938] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#41212d] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              {ta ? "பதிவு செய்ய" : "Register Now"}
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
