import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero, PlaceholderNote, Section } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang, type Bi } from "@/lib/i18n";
import { programs, ui } from "@/content/site";
import { programMessage } from "@/lib/whatsapp";

export const Route = createFileRoute("/programs/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const program = programs.find((p) => p.slug === params.slug);
    if (!program) throw notFound();
    return { slug: program.slug };
  },
  head: ({ params }) => {
    const program = programs.find((p) => p.slug === params.slug);
    const title = program ? `${program.name.en} | THE KRIYA LAB` : "Program | THE KRIYA LAB";
    const description = program?.description.en ?? "Kriya Yoga initiation program.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProgramPage,
});

function ProgramPage() {
  const { slug } = Route.useLoaderData();
  const { t, lang } = useLang();
  const program = programs.find((p) => p.slug === slug)!;

  const rows: [Bi, Bi][] = [
    [bi("Level", "நிலை"), program.level],
    [bi("Duration", "கால அளவு"), program.duration],
    [bi("Format", "வடிவம்"), program.format],
    [bi("Instructor", "ஆசிரியர்"), program.instructor],
    [bi("Price", "கட்டணம்"), program.price],
    [bi("Schedule", "அட்டவணை"), program.schedule],
    ...(program.startDate ? ([[bi("Start date", "தொடக்க தேதி"), program.startDate]] as [Bi, Bi][]) : []),
    ...(program.endDate ? ([[bi("End date", "முடிவு தேதி"), program.endDate]] as [Bi, Bi][]) : []),
    ...(program.languages ? ([[bi("Language", "மொழி"), program.languages]] as [Bi, Bi][]) : []),
    ...(program.maxParticipants
      ? ([
          [
            bi("Participants", "பங்கேற்பாளர்கள்"),
            bi(`Up to ${program.maxParticipants} persons`, `${program.maxParticipants} நபர்கள் வரை`),
          ],
        ] as [Bi, Bi][])
      : []),
    [bi("Location", "இடம்"), program.location],
    [bi("Enrolment status", "பதிவு நிலை"), program.status],
  ];

  return (
    <>
      <PageHero
        eyebrow={t(bi("Initiation Program", "தீட்சை நிகழ்ச்சி"))}
        title={t(program.name)}
        intro={t(program.description)}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <dl className="grid gap-px bg-border sm:grid-cols-2">
            {rows.map(([k, v], i) => (
              <div key={i} className="bg-background p-6">
                <dt className="text-xs tracking-widest text-muted-foreground uppercase">{t(k)}</dt>
                <dd className="mt-2 font-serif text-xl">{t(v)}</dd>
              </div>
            ))}
          </dl>

          <aside className="rounded-sm bg-muted p-8">
            <h2 className="font-serif text-2xl">{t(ui.begin)}</h2>
            <PlaceholderNote />
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/buy"
                search={{ program: program.slug }}
                className="rounded-full bg-velvet px-6 py-3 text-center text-sm text-primary-foreground transition-colors hover:bg-primary"
              >
                {t(ui.enroll)}
              </Link>

              <WhatsAppButton
                event="whatsapp_program_enquiry"
                message={programMessage(t(program.name), lang)}
                className="justify-center bg-background"
              />
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
