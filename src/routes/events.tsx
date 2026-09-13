import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHero, Section } from "@/components/Primitives";
import { listPublicEvents, type PublicEvent } from "@/lib/events.functions";
import { bi, useLang } from "@/lib/i18n";

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

const PLACEHOLDERS = [
  bi("Event 1", "நிகழ்வு 1"),
  bi("Event 2", "நிகழ்வு 2"),
  bi("Event 3", "நிகழ்வு 3"),
];

function EventsPage() {
  const { t, lang } = useLang();
  const fetchEvents = useServerFn(listPublicEvents);
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchEvents() as Promise<PublicEvent[]>,
  });

  const rows = data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const future = rows.filter((r) => r.event_date >= today);
  const past = rows.filter((r) => r.event_date < today).reverse();

  return (
    <>
      <PageHero
        eyebrow={t(bi("Gatherings", "சந்திப்புகள்"))}
        title={t(bi("Events", "நிகழ்வுகள்"))}
        intro={t(
          bi(
            "Retreats, initiations and satsangs. Each event moves to Past Events once its date has passed.",
            "பயிற்சி முகாம்கள், தீட்சைகள் மற்றும் சத்சங்கங்கள். நிகழ்வின் தேதி கடந்தவுடன் அது கடந்த நிகழ்வுகளுக்கு மாறும்.",
          ),
        )}
      />

      <Section>
        <h2 className="font-serif text-3xl">{t(bi("Future Events", "வரவிருக்கும் நிகழ்வுகள்"))}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {future.length > 0
            ? future.map((e) => <EventCard key={e.id} event={e} lang={lang} />)
            : PLACEHOLDERS.map((p, i) => (
                <article key={i} className="rounded-2xl border border-dashed border-border p-6">
                  <h3 className="font-serif text-2xl">{t(p)}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t(
                      bi(
                        "Date, time and venue will appear here once this event is published.",
                        "இந்நிகழ்வு வெளியிடப்பட்டவுடன் தேதி, நேரம் மற்றும் இடம் இங்கு தோன்றும்.",
                      ),
                    )}
                  </p>
                </article>
              ))}
        </div>
      </Section>

      <Section tone="muted">
        <h2 className="font-serif text-3xl">{t(bi("Past Events", "கடந்த நிகழ்வுகள்"))}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {past.length > 0 ? (
            past.map((e) => <EventCard key={e.id} event={e} lang={lang} />)
          ) : (
            <p className="text-sm text-muted-foreground">
              {t(bi("No past events yet.", "இதுவரை கடந்த நிகழ்வுகள் இல்லை."))}
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
    <article className="rounded-2xl border border-border p-6">
      <h3 className="font-serif text-2xl">{title}</h3>
      <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
        <div>
          <dt className="sr-only">{ta ? "தேதி" : "Date"}</dt>
          <dd>{event.event_date}</dd>
        </div>
        {when ? <dd>{when}</dd> : null}
        {venue ? <dd>{venue}</dd> : null}
      </dl>
      {description ? <p className="mt-4 whitespace-pre-line text-sm">{description}</p> : null}
    </article>
  );
}
