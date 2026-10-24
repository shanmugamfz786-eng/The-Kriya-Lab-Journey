import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Section, PageHero } from "@/components/Primitives";
import { fetchAllEvents, type EventItem } from "@/lib/events-api";
import { bi, useLang } from "@/lib/i18n";
import { Search, Calendar, Clock, MapPin } from "lucide-react";
import { CollectEnquiryModal } from "@/components/CollectEnquiryModal";

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
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchAllEvents(),
  });

  const rows = data ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredRows = rows.filter((r) => {
    // 1. Tab Filter
    if (filter !== "all") {
      let isFuture = r.event_type === "future";
      const d = new Date(r.event_date || "");
      if (!isNaN(d.getTime())) {
        isFuture = d >= today;
      }

      if (filter === "future" && !isFuture) return false;
      if (filter === "past" && isFuture) return false;
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ta = lang === "ta";
      const title = (ta && r.title_ta ? r.title_ta : r.title) || "";
      const venue = (ta && r.location_ta ? r.location_ta : r.location) || (r as any).venue || "";
      const date = (ta && r.event_date_ta ? r.event_date_ta : r.event_date) || "";
      const desc = (ta && r.description_ta ? r.description_ta : r.description) || "";

      if (
        !title.toLowerCase().includes(q) &&
        !venue.toLowerCase().includes(q) &&
        !date.toLowerCase().includes(q) &&
        !desc.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <>
      {/* Majestic PageHero identical to Program page */}
      <PageHero
        eyebrow={t(bi("Gatherings & Retreats", "நிகழ்வுகள் மற்றும் முகாம்கள்"))}
        title={t(bi("Events", "நிகழ்வுகள்"))}
        intro={t(
          bi(
            "Upcoming and past Kriya Yoga events, retreats, and initiations at THE KRIYA LAB.",
            "வரவிருக்கும் மற்றும் கடந்த கால கிரியா யோகா நிகழ்வுகள், முகாம்கள் மற்றும் தீட்சைகள்."
          )
        )}
      />

      {/* Filter and Search Bar Row identical to Program page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-4">
        <div className="flex flex-col sm:flex-row w-full gap-5 justify-between items-start sm:items-center">
          {/* Category Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`rounded-full border px-6 py-2 text-sm font-medium transition-all cursor-pointer ${
                  filter === f.key
                    ? "border-gold bg-gold text-velvet-deep shadow-md scale-105"
                    : "border-border text-muted-foreground hover:border-gold hover:text-gold hover:bg-gold/5"
                }`}
              >
                {t(f.label)}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t(bi("Search events or venue...", "நிகழ்வுகள் அல்லது இடத்தை தேடவும்..."))}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>
      </div>

      {/* Events Grid Section */}
      <Section>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRows.length > 0 ? (
            filteredRows.map((e) => <EventCard key={e.id} event={e} lang={lang} />)
          ) : (
            <p className="text-sm text-muted-foreground text-center col-span-full py-12">
              {t(bi("No events found.", "நிகழ்வுகள் ஏதுமில்லை."))}
            </p>
          )}
        </div>
      </Section>
    </>
  );
}

function EventCard({ event, lang }: { event: EventItem; lang: "en" | "ta" }) {
  const ta = lang === "ta";
  const [isCollectModalOpen, setCollectModalOpen] = useState(false);
  const title = (ta && event.title_ta ? event.title_ta : event.title) || event.title;
  const description = (ta && event.description_ta ? event.description_ta : event.description) || event.description || "";
  const venue = (ta && event.location_ta ? event.location_ta : event.location) || (event as any).venue || "";
  const eventDate = (ta && event.event_date_ta ? event.event_date_ta : event.event_date) || event.event_date;
  const when = [(event as any).start_time, (event as any).end_time].filter(Boolean).join(" – ");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let isUpcoming = event.event_type === "future";
  const d = new Date(event.event_date || "");
  if (!isNaN(d.getTime())) {
    isUpcoming = d >= today;
  }

  return (
    <article className="rounded-2xl border border-border overflow-hidden bg-background shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      {event.image_url ? (
        <div className="w-full h-48 sm:h-56 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-border shrink-0 relative">
          <img
            src={event.image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            {isUpcoming ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white text-[0.68rem] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md border border-emerald-400/30">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                {ta ? "வரவிருப்பது" : "Upcoming"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-gray-900/80 text-white/90 text-[0.68rem] font-medium px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md">
                {ta ? "முடிந்தது" : "Past Event"}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-velvet-deep to-velvet flex items-center justify-center relative p-4">
          <span className="font-serif text-xl text-gold/80 font-bold">{title}</span>
          <div className="absolute top-3 right-3 z-10">
            {isUpcoming ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white text-[0.68rem] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md border border-emerald-400/30">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                {ta ? "வரவிருப்பது" : "Upcoming"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-gray-900/80 text-white/90 text-[0.68rem] font-medium px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md">
                {ta ? "முடிந்தது" : "Past Event"}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h2 className="font-serif text-[1.15rem] sm:text-xl leading-snug text-gray-900 group-hover:text-[#522938] transition-colors line-clamp-2">
          {title}
        </h2>

        {/* Date, Time, Venue metadata */}
        <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          {eventDate && (
            <div className="flex items-center gap-2 font-medium text-foreground/80">
              <Calendar className="size-3.5 text-gold shrink-0" />
              <span>{eventDate}</span>
            </div>
          )}
          {when ? (
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-muted-foreground/70 shrink-0" />
              <span>{when}</span>
            </div>
          ) : null}
          {venue ? (
            <div className="flex items-center gap-2 truncate">
              <MapPin className="size-3.5 text-muted-foreground/70 shrink-0" />
              <span className="truncate">{venue}</span>
            </div>
          ) : null}
        </div>

        {description ? (
          <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        ) : null}

        {/* Action Button identical to ProgramCard */}
        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={() => setCollectModalOpen(true)}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#334d84] px-6 py-2 sm:py-2.5 text-[0.8rem] sm:text-sm font-semibold text-white hover:bg-[#253861] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
          >
            {ta ? "விவரங்கள் & பதிவு" : "Details & Register"}
          </button>
        </div>
      </div>

      <CollectEnquiryModal
        isOpen={isCollectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        programName={`Event: ${title}`}
      />
    </article>
  );
}
