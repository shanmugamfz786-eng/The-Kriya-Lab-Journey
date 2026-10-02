import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero, PlaceholderNote, Section } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang, type Bi } from "@/lib/i18n";
import { ui } from "@/content/site";
import { programMessage } from "@/lib/whatsapp";
import { listPublicPrograms } from "@/lib/programs.functions";
import { type ProgramItem } from "@/lib/programs-api";

export const Route = createFileRoute("/programs/$id")({
  staticData: { sitemap: true },
  loader: async ({ params }) => {
    const all = await listPublicPrograms();
    const program = all.find((p) => String(p.id) === params.id);
    if (!program) throw notFound();
    return { program };
  },
  head: ({ loaderData }) => {
    const program = loaderData?.program as ProgramItem | undefined;
    const title = program ? `${program.title_en} | THE KRIYA LAB` : "Program | THE KRIYA LAB";
    const description = program?.description_en ?? "Kriya Yoga initiation program.";
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
  const { program } = Route.useLoaderData();
  const { t, lang } = useLang();
  
  const ta = lang === "ta";
  const title = (ta ? program.title_ta : program.title_en) || program.title_en;
  const description = (ta ? program.description_ta : program.description_en) || program.description_en;
  const instructor = (ta ? program.instructor_ta : program.instructor_en) || program.instructor_en;
  const location = (ta ? program.location_ta : program.location_en) || program.location_en;
  const language = (ta ? program.language_ta : program.language_en) || program.language_en;

  const rows: [Bi, string][] = [
    [bi("Level", "நிலை"), program.level],
    [bi("Duration", "கால அளவு"), program.duration || ""],
    [bi("Instructor", "ஆசிரியர்"), instructor],
    [bi("Schedule", "அட்டவணை"), program.schedule_date || ""],
    [bi("Language", "மொழி"), language || ""],
    [bi("Location", "இடம்"), location],
    [bi("Price (INR)", "விலை (INR)"), program.price_inr ? `₹ ${program.price_inr}` : ""],
    [bi("Price (USD)", "விலை (USD)"), program.price_usd ? `$ ${program.price_usd}` : ""],
    [bi("Enrolment status", "பதிவு நிலை"), program.enrolment_status],
  ];

  return (
    <>
      <PageHero
        eyebrow={t(bi("Initiation Program", "தீட்சை நிகழ்ச்சி"))}
        title={title}
        intro={description}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-10">
            {rows.map(([k, v], i) => {
              if (!v) return null;
              return (
                <div key={i} className="flex flex-col">
                  <dt className="text-xs tracking-widest text-muted-foreground uppercase">{t(k)}</dt>
                  <dd className="mt-2 text-base font-medium text-foreground">{v}</dd>
                </div>
              );
            })}
          </dl>

          <aside className="rounded-2xl bg-muted overflow-hidden">
            {program.image_url && (
              <div className="aspect-[4/3] w-full bg-border">
                <img 
                  src={program.image_url} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8">
              <h2 className="font-serif text-2xl">{t(ui.begin)}</h2>
              <PlaceholderNote />
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/programs/$id"
                params={{ id: String(program.id) }}
                className="rounded-full bg-velvet px-6 py-3 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary shadow-sm"
                onClick={(e) => e.preventDefault()}
              >
                {t(ui.enroll)}
              </Link>

              <WhatsAppButton
                event="whatsapp_program_enquiry"
                message={programMessage(title, lang)}
                className="justify-center bg-background"
              />
            </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
