import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, Section } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang, type Bi } from "@/lib/i18n";
import { programs, ui } from "@/content/site";
import { programMessage } from "@/lib/whatsapp";

export const Route = createFileRoute("/programs/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Initiation Programs | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "Online and in-person Kriya Yoga initiation programs in English and Tamil, group and one-to-one.",
      },
      { property: "og:title", content: "Initiation Programs — THE KRIYA LAB" },
      {
        property: "og:description",
        content: "Explore group and individual Kriya Yoga initiation sessions.",
      },
    ],
  }),
  component: ProgramsPage,
});



const filters = [
  { key: "all", label: bi("All", "அனைத்தும்") },
  { key: "english", label: bi("English", "ஆங்கிலம்") },
  { key: "tamil", label: bi("Tamil", "தமிழ்") },
  { key: "beginner", label: bi("Beginner", "தொடக்கநிலை") },
  { key: "online", label: bi("Online", "ஆன்லைன்") },
  { key: "in-person", label: bi("In Person", "நேரில்") },
] as const;

function ProgramsPage() {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");

  const list = programs.filter((p) => filter === "all" || p.tags.includes(filter));

  return (
    <>
      <PageHero
        eyebrow={t(bi("Initiation Programs", "தீட்சை நிகழ்ச்சிகள்"))}
        title={t(bi("Find the appropriate program that suits you", "உங்கள் நிலைக்கு ஏற்ற பயிற்சியைக் கண்டறியுங்கள்"))}
        intro={t(
          bi(
            "Kriya Yoga initiation in English and Tamil — online group classes, individual sessions, in-person initiation and family initiation. Schedules, fees and availability are confirmed on enquiry.",
            "ஆங்கிலம் மற்றும் தமிழில் கிரியா யோகா தீட்சை — ஆன்லைன் குழு வகுப்புகள், தனிநபர் வகுப்புகள், நேரடித் தீட்சை மற்றும் குடும்பத் தீட்சை. நேர அட்டவணை, கட்டணம் மற்றும் இடவசதி விசாரணையின் போது உறுதிப்படுத்தப்படும்.",
          ),
        )}
      />


      <Section>
        <div className="flex flex-wrap gap-3">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {t(f.label)}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-px bg-border md:grid-cols-2">
          {list.map((p) => (
            <ProgramCard key={p.slug} program={p} />
          ))}
        </div>
      </Section>
    </>
  );
}

function ProgramCard({ program: p }: { program: (typeof programs)[number] }) {
  const { t, lang } = useLang();
  const [people, setPeople] = useState(1);

  const rows: [Bi, Bi][] = [
    [bi("Level", "நிலை"), p.level],
    [bi("Duration", "கால அளவு"), p.duration],
    [bi("Format", "வடிவம்"), p.format],
    [bi("Instructor", "ஆசிரியர்"), p.instructor],
    [bi("Price", "கட்டணம்"), p.price],
    [bi("Schedule", "அட்டவணை"), p.schedule],
  ];
  if (p.startDate) rows.push([bi("Start date", "தொடக்க தேதி"), p.startDate]);
  if (p.endDate) rows.push([bi("End date", "முடிவு தேதி"), p.endDate]);
  if (p.languages) rows.push([bi("Language", "மொழி"), p.languages]);
  rows.push([bi("Location", "இடம்"), p.location]);
  rows.push([bi("Enrolment status", "பதிவு நிலை"), p.status]);

  const message =
    p.maxParticipants
      ? `${programMessage(t(p.name), lang)} ${
          lang === "ta"
            ? `தீட்சை பெற விரும்பும் நபர்களின் எண்ணிக்கை: ${people}.`
            : `Number of persons who wish to be initiated: ${people}.`
        }`
      : programMessage(t(p.name), lang);

  return (
    <article className="flex flex-col bg-background p-8 lg:p-10">
      <h2 className="font-serif text-2xl leading-snug">{t(p.name)}</h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(p.description)}</p>

      <dl className="mt-7 grid grid-cols-2 gap-y-3 text-xs">
        {rows.map(([k, v], i) => (
          <div key={i}>
            <dt className="tracking-widest text-muted-foreground uppercase">{t(k)}</dt>
            <dd className="mt-1">{t(v)}</dd>
          </div>
        ))}
      </dl>

      {p.maxParticipants ? (
        <label className="mt-7 block text-xs" htmlFor={`people-${p.slug}`}>
          <span className="block tracking-widest text-muted-foreground uppercase">
            {t(bi("Number of persons to be initiated", "தீட்சை பெறும் நபர்களின் எண்ணிக்கை"))}
          </span>
          <select
            id={`people-${p.slug}`}
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="mt-2 rounded-full border border-border bg-transparent px-4 py-2 text-sm outline-none focus:border-primary"
          >
            {Array.from({ length: p.maxParticipants }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="mt-3 block text-xs text-muted-foreground">
            {p.unitPriceInr
              ? t(
                  bi(
                    `Total for ${people} ${people > 1 ? "persons" : "person"}: ₹${(p.unitPriceInr * people).toLocaleString("en-IN")}`,
                    `${people} நபர்களுக்கு மொத்தம்: ₹${(p.unitPriceInr * people).toLocaleString("en-IN")}`,
                  ),
                )
              : t(
                  bi(
                    `Fee is per person and is multiplied by ${people} ${people > 1 ? "persons" : "person"}; confirmed on enquiry.`,
                    `கட்டணம் ஒரு நபருக்கானது; ${people} நபர்களுக்கு பெருக்கப்படும். விசாரணையின் போது உறுதிப்படுத்தப்படும்.`,
                  ),
                )}
          </span>
          {people > 1 ? (
            <span className="mt-2 block text-xs text-muted-foreground">
              {t(
                bi(
                  "You will be asked for the details of each person on the enrollment page.",
                  "பதிவு பக்கத்தில் ஒவ்வொரு நபரின் விவரங்களும் கேட்கப்படும்.",
                ),
              )}
            </span>
          ) : null}
        </label>
      ) : null}



      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/programs/$slug"
          params={{ slug: p.slug }}
          className="rounded-full border border-border px-6 py-2.5 text-sm transition-colors hover:border-primary hover:text-primary"
        >
          {t(ui.learnMore)}
        </Link>
        <Link
          to="/buy"
          search={{ program: p.slug }}
          className="rounded-full bg-velvet px-6 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary"
        >
          {t(ui.enroll)}
        </Link>


        <WhatsAppButton event="whatsapp_program_enquiry" variant="ghost" message={message} />
      </div>
    </article>
  );
}
