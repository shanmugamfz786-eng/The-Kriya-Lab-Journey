import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, PlaceholderNote, Section } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang, type Bi } from "@/lib/i18n";
import { ui } from "@/content/site";
import { programMessage } from "@/lib/whatsapp";
import { listPublicPrograms } from "@/lib/programs.functions";
import { type ProgramItem } from "@/lib/programs-api";
import { ProgramCard } from "@/components/ProgramCard";
import { CollectEnquiryModal } from "@/components/CollectEnquiryModal";
import { useAuth } from "@/lib/auth-store";
import { enrollProgram, useEnrollments } from "@/lib/enrollment-store";
import { showAlert } from "@/lib/alert";

export const Route = createFileRoute("/programs/$id")({
  staticData: { sitemap: true },
  loader: async ({ params }) => {
    const all = await listPublicPrograms();
    const program = all.find((p) => String(p.id) === params.id);
    if (!program) throw notFound();
    return { program, allPrograms: all };
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
  const { program, allPrograms } = Route.useLoaderData();
  const { t, lang } = useLang();
  const { isAuthenticated, user } = useAuth();
  const { enrolledIds } = useEnrollments(user?.id);
  const isEnrolled = enrolledIds.includes(program.id);
  const [isCollectModalOpen, setCollectModalOpen] = useState(false);
  
  const recentPrograms = allPrograms
    .filter(p => p.id !== program.id)
    .slice(0, 5);
  
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
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <Link 
          to="/programs" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-gold transition-colors"
        >
          <span aria-hidden="true">&larr;</span> 
          {ta ? "பயிற்சிகளுக்கு திரும்பு" : "Back to Programs"}
        </Link>
      </div>

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
              {isEnrolled ? (
                <div className="rounded-full bg-green-50 border border-green-200 px-6 py-3 text-center text-sm font-medium text-green-700 flex items-center justify-center gap-2 shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {t(bi("Already Collected", "ஏற்கனவே சேர்க்கப்பட்டது"))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (isAuthenticated && user) {
                      enrollProgram(user.id, program.id);
                      showAlert.success(ta ? "வெற்றிகரமாக பதிவு செய்யப்பட்டது!" : "Successfully Collected!", ta ? "உங்கள் பயிற்சி பக்கத்தில் சேர்க்கப்பட்டுள்ளது." : "Added to your learning dashboard.", 2500);
                    } else {
                      setCollectModalOpen(true);
                    }
                  }}
                  className="rounded-full bg-velvet px-6 py-3 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary shadow-sm"
                >
                  {t(bi("Collect", "சேகரிக்க"))}
                </button>
              )}

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
      
      <CollectEnquiryModal 
        isOpen={isCollectModalOpen} 
        onClose={() => setCollectModalOpen(false)} 
        programName={title} 
      />

      {recentPrograms.length > 0 && (
        <Section tone="muted">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl">
              {t(bi("Recent Programs", "சமீபத்திய பயிற்சிகள்"))}
            </h2>
            <Link
              to="/programs"
              className="text-sm font-semibold text-[#334d84] hover:text-[#253861] transition-colors"
            >
              {t(bi("View All", "அனைத்தையும் காண்க"))} &rarr;
            </Link>
          </div>
          
          <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300">
            {recentPrograms.map((p) => (
              <div key={p.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0">
                <ProgramCard program={p} lang={lang} />
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
