import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ShieldCheck, BookOpen, Clock, MapPin, User, ArrowLeft } from "lucide-react";
import { PageHero, PlaceholderNote, Section } from "@/components/Primitives";
import { bi, useLang, type Bi } from "@/lib/i18n";
import { ui } from "@/content/site";
import { listPublicPrograms } from "@/lib/programs.functions";
import { type ProgramItem, fetchAllPrograms, INITIAL_PROGRAMS } from "@/lib/programs-api";
import { ProgramCard } from "@/components/ProgramCard";
import { CollectEnquiryModal } from "@/components/CollectEnquiryModal";
import { useAuth } from "@/lib/auth-store";
import { enrollProgram, useEnrollments } from "@/lib/enrollment-store";
import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/programs/$id")({
  staticData: { sitemap: true },
  loader: async ({ params }) => {
    let all = await listPublicPrograms();
    if (!all || all.length === 0) {
      all = INITIAL_PROGRAMS;
    }
    const program = all.find((p) => String(p.id) === params.id) || INITIAL_PROGRAMS.find((p) => String(p.id) === params.id);
    return { program, allPrograms: all, id: params.id };
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
  const loaderData = Route.useLoaderData();
  const { id } = Route.useParams();
  const { t, lang } = useLang();
  const { isAuthenticated, user } = useAuth();
  const [isCollectModalOpen, setCollectModalOpen] = useState(false);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const { data: allProgramsData } = useQuery({
    queryKey: ["programs"],
    queryFn: () => fetchAllPrograms(),
    initialData: loaderData?.allPrograms || INITIAL_PROGRAMS,
  });

  const allPrograms = allProgramsData && allProgramsData.length > 0 ? allProgramsData : (loaderData?.allPrograms || INITIAL_PROGRAMS);
  const program = allPrograms.find((p) => String(p.id) === id) || loaderData?.program || INITIAL_PROGRAMS.find((p) => String(p.id) === id);

  if (!program) {
    throw notFound();
  }

  const { enrolledIds } = useEnrollments(user?.id);
  const isEnrolled = enrolledIds.includes(program.id);
  
  const recentPrograms = allPrograms
    .filter(p => p.id !== program.id)
    .slice(0, 5);
  
  const ta = lang === "ta";
  const [viewDescTa, setViewDescTa] = useState(ta);

  useEffect(() => {
    setViewDescTa(lang === "ta");
  }, [lang]);

  const title = (ta ? program.title_ta : program.title_en) || program.title_en || (program as any).title || "";
  const descEn = program.description_en || (program as any).description || "";
  const descTa = program.description_ta || "";
  const hasBothDesc = Boolean(descEn && descTa && descEn.trim() !== descTa.trim());
  const activeDesc = (viewDescTa ? (descTa || descEn) : (descEn || descTa)) || descEn || descTa || (program as any).description || "";

  const instructor = (ta ? program.instructor_ta : program.instructor_en) || program.instructor_en;
  const location = (ta ? program.location_ta : program.location_en) || program.location_en;
  const language = (ta ? program.language_ta : program.language_en) || program.language_en;

  // Formatted price strings
  const formattedINR = program.price_inr
    ? `₹ ${!isNaN(Number(program.price_inr)) ? Number(program.price_inr).toLocaleString("en-IN") : program.price_inr}`
    : null;
  const formattedUSD = program.price_usd
    ? `$ ${!isNaN(Number(program.price_usd)) ? Number(program.price_usd).toLocaleString("en-US") : program.price_usd}`
    : null;

  const activePriceDisplay = currency === "INR"
    ? (formattedINR || t(bi("Contact for Price", "கட்டண விவரம் அறிய தொடர்பு கொள்ளவும்")))
    : (formattedUSD || t(bi("Contact for Price", "கட்டண விவரம் அறிய தொடர்பு கொள்ளவும்")));

  const rows: [Bi, string][] = [
    [bi("Level", "நிலை"), program.level],
    [bi("Duration", "கால அளவு"), program.duration || ""],
    [bi("Instructor", "ஆசிரியர்"), instructor],
    [bi("Schedule", "அட்டவணை"), program.schedule_date || ""],
    [bi("Language", "மொழி"), language || ""],
    [bi("Location", "இடம்"), location],
    [bi("Enrolment status", "பதிவு நிலை"), program.enrolment_status],
  ];

  return (
    <>
      {/* Compact Cohesive Header */}
      <header className="bg-dawn px-4 pt-6 pb-7 sm:pt-8 sm:pb-9 lg:px-8 border-b border-border/40">
        <div className="mx-auto max-w-7xl animate-rise">
          <div className="flex items-center gap-2 mb-3">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-gold transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5 text-gold" />
              <span>{ta ? "முகப்புக்கு திரும்பு" : "Back to Home"}</span>
            </Link>
            <span className="text-muted-foreground/30 text-xs">/</span>
            <Link 
              to="/programs" 
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors"
            >
              {ta ? "பயிற்சிகள்" : "Programs"}
            </Link>
          </div>

          <p className="eyebrow text-gold text-xs uppercase tracking-widest font-semibold">
            {t(bi("Initiation Program", "தீட்சை நிகழ்ச்சி"))}
          </p>

          <h1 className="mt-2 max-w-4xl font-serif text-[clamp(1.85rem,4vw,2.85rem)] font-bold leading-tight text-foreground">
            {title}
          </h1>

          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 border border-border/70 shadow-xs">
              <Clock className="size-3 text-gold" />
              {program.duration || "4 Weeks"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 border border-border/70 shadow-xs">
              <MapPin className="size-3 text-gold" />
              {location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 border border-border/70 shadow-xs">
              <User className="size-3 text-gold" />
              {instructor}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 text-velvet-deep px-3 py-1 border border-gold/30 text-[0.68rem] font-bold uppercase tracking-wider">
              {program.level}
            </span>
          </div>
        </div>
      </header>

      <Section className="!py-6 sm:!py-8">
        <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr] items-start">
          <div className="space-y-5">
            {/* Dedicated Program Description Card */}
            {activeDesc && (
              <div className="rounded-2xl border border-border/80 bg-background/90 p-5 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 mb-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4.5 text-gold" />
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                      {t(bi("Program Description", "பயிற்சியின் விளக்கம்"))}
                    </h2>
                  </div>

                  {hasBothDesc && (
                    <div className="flex items-center rounded-full border border-border p-0.5 bg-muted/60 text-[0.68rem] font-bold self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setViewDescTa(false)}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full transition-all cursor-pointer",
                          !viewDescTa ? "bg-gold text-velvet-deep shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewDescTa(true)}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full transition-all cursor-pointer",
                          viewDescTa ? "bg-gold text-velvet-deep shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        தமிழ்
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-foreground/90 whitespace-pre-line leading-relaxed text-sm sm:text-[0.95rem] font-sans selection:bg-gold/20">
                  {activeDesc}
                </div>
              </div>
            )}

            {/* Specifications & Overview */}
            <div className="rounded-2xl border border-border/80 bg-background/90 p-5 sm:p-7 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                {t(bi("Program Overview & Specifications", "பயிற்சி விபரம் & அட்டவணை"))}
              </h3>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5">
                {rows.map(([k, v], i) => {
                  if (!v) return null;
                  return (
                    <div key={i} className="flex flex-col border-b border-border/40 pb-2.5 last:border-b-0 sm:last:border-b">
                      <dt className="text-[0.7rem] tracking-widest text-muted-foreground uppercase font-semibold">{t(k)}</dt>
                      <dd className="mt-0.5 text-sm sm:text-[0.95rem] font-medium text-foreground">{v}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>

          <aside className="rounded-2xl bg-muted overflow-hidden lg:sticky lg:top-24 border border-border/60 shadow-xs">
            {program.image_url && (
              <div className="aspect-[4/3] w-full bg-border">
                <img 
                  src={program.image_url} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-5 sm:p-7">
              <h2 className="font-serif text-xl sm:text-2xl">{t(ui.begin)}</h2>
              <PlaceholderNote />

              {/* Selected Fee Callout in Sidebar */}
              <div className="mt-5 rounded-xl border border-border bg-background/90 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold">
                    {t(bi("Selected Fee", "தேர்ந்தெடுக்கப்பட்ட கட்டணம்"))}
                  </span>
                  <div className="flex rounded-full border border-border p-0.5 bg-muted/60 text-[0.68rem] font-bold">
                    <button
                      type="button"
                      onClick={() => setCurrency("INR")}
                      className={cn(
                        "px-2.5 py-0.5 rounded-full transition-all cursor-pointer",
                        currency === "INR" ? "bg-gold text-velvet-deep shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ₹ INR
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency("USD")}
                      className={cn(
                        "px-2.5 py-0.5 rounded-full transition-all cursor-pointer",
                        currency === "USD" ? "bg-gold text-velvet-deep shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      $ USD
                    </button>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                  {activePriceDisplay}
                </div>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                  {currency === "INR" 
                    ? (ta ? "இந்திய மாணவர்களுக்கான கட்டணம் (ஜிஎஸ்டி உள்ளடக்கம்)" : "Standard fee for Indian seekers (All taxes incl.)") 
                    : (ta ? "சர்வதேச மாணவர்களுக்கான கட்டணம்" : "Standard fee for international seekers")}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                {isEnrolled ? (
                  <div className="flex flex-col gap-2">
                    <div className="rounded-full bg-green-50 border border-green-200 px-5 py-2 text-center text-xs font-semibold text-green-700 flex items-center justify-center gap-1.5 shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {t(bi("Already Collected", "ஏற்கனவே சேர்க்கப்பட்டது"))}
                    </div>
                    <Link
                      to="/enroll"
                      search={{ program: String(program.id), currency }}
                      className="rounded-full border border-border bg-background px-5 py-2 text-center text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                    >
                      {t(bi("Buy Again", "மீண்டும் வாங்கவும்"))} &rarr;
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/enroll"
                    search={{ program: String(program.id), currency }}
                    className="rounded-full bg-velvet px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{t(bi("Buy", "வாங்க"))}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      </Section>
      
      <CollectEnquiryModal 
        isOpen={isCollectModalOpen} 
        onClose={() => setCollectModalOpen(false)} 
        programName={`${title} [${activePriceDisplay}]`}
      />

      {recentPrograms.length > 0 && (
        <Section tone="muted" className="!py-8 sm:!py-12">
          <div className="flex items-center justify-between mb-5">
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
