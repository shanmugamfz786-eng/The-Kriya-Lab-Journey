import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import heroImage from "@/assets/hero-breath.jpg";
import heroVideo from "@/assets/Hero-sections.mp4";
import { home, koshas, settings, ui } from "@/content/site";
import { bi, useLang } from "@/lib/i18n";
import { CTARow, Eyebrow, Section } from "@/components/Primitives";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPrograms } from "@/lib/programs-api";
import { fetchAllEvents } from "@/lib/events-api";
import { ProgramCard } from "@/components/ProgramCard";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { AuthPage } from "./auth";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined; mode?: "signin" | "signup" | undefined } => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
    mode: search["mode"] === "signup" ? "signup" : search["mode"] === "signin" ? "signin" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "THE KRIYA LAB — Transform Your self with Kriya Yoga" },
      {
        name: "description",
        content:
          "Experiment. Experience. Evolve. A modern laboratory for exploring Kriya Yoga through breath, observation and direct experience.",
      },
      { property: "og:title", content: "THE KRIYA LAB — Transform Your self with Kriya Yoga" },
      {
        property: "og:description",
        content: "Kriya Yoga for modern seekers. Breath, meditation and inner exploration, in English and Tamil.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = useLang();
  const [active, setActive] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();

  // If user is not authenticated, the landing page is the Registration or Login page!
  if (!isAuthenticated) {
    return <AuthPage initialMode={search.mode} redirectPath={search.redirect} />;
  }

  const { data: programsData } = useQuery({
    queryKey: ["programs"],
    queryFn: () => fetchAllPrograms(),
  });
  
  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchAllEvents(),
  });

  const topPrograms = (programsData || []).slice(0, 3);
  const topEvents = (eventsData || []).slice(0, 3);
  const ta = lang === "ta";

  const displayName = user?.full_name || (user as any)?.username || (user as any)?.name || user?.email?.split("@")[0] || "Seeker";

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-velvet-deep text-[oklch(0.96_0.01_300)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={heroImage}
          className="absolute inset-0 -z-10 size-full object-cover opacity-75 scale-115 origin-top pointer-events-none"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_45%,transparent,oklch(0.19_0.045_320/0.85))]"
        />

        <div className="mx-auto flex min-h-[94vh] max-w-7xl items-center px-5 pt-36 pb-24 sm:pt-44 sm:pb-28 lg:px-10">
          <div className="animate-rise max-w-2xl">
            {isAuthenticated && user && (
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-gold mb-5 backdrop-blur-md shadow-xs animate-fade-in">
                <span className="size-2 rounded-full bg-gold animate-pulse" />
                <span>
                  {ta 
                    ? `வணக்கம், ${displayName}` 
                    : `Welcome back, ${displayName}`}
                </span>
              </div>
            )}
            <p className="eyebrow text-gold">{t(settings.tagline)}</p>
            <h1 className="mt-7 text-balance font-serif text-[clamp(2.8rem,7vw,5.6rem)] leading-[1.02]">
              {t(home.heroTitle)}
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-[oklch(0.85_0.02_300)]">{t(home.heroFlow)}</p>

            <div className="mt-11 flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/my-programs"
                  className="rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-velvet-deep shadow-md hover:bg-gold/90 transition-all hover:scale-105"
                >
                  {ta ? "என் பயிற்சிகள் (My Programs)" : "Go to My Programs"}
                </Link>
              ) : (
                <Link
                  to="/programs"
                  className="rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-velvet-deep transition-opacity hover:opacity-90 shadow-md"
                >
                  {t(ui.begin)}
                </Link>
              )}
              <Link
                to="/kriya-yoga"
                className="rounded-full border border-[oklch(1_0_0_/_0.3)] px-8 py-3.5 text-sm transition-colors hover:border-gold hover:text-gold"
              >
                {t(ui.explore)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Long-form intro */}
      <Section id="why-we-practise">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>{t(bi("Why we practise", "நாம் ஏன் பயிற்சி செய்கிறோம்"))}</Eyebrow>
            <h2
              className={cn(
                "mt-5 font-serif text-balance",
                lang === "ta" ? "text-2xl sm:text-3xl lg:text-[2.35rem] leading-[1.3]" : "text-4xl lg:text-5xl leading-tight",
              )}
            >
              {t(
                bi(
                  "Once we reach the human stage, evolution is in our own hands.",
                  "மனித நிலையை அடைந்த பின், பரிணாமம் நம் கைகளிலேயே உள்ளது.",
                ),
              )}
            </h2>
          </div>
          <div className="space-y-6 text-[1.05rem] leading-relaxed text-muted-foreground">
            {home.intro.map((p, i) => (
              <p key={i}>{t(p)}</p>
            ))}
          </div>
        </div>
      </Section>

      {/* Lab concept */}
      <Section tone="muted">
        <Eyebrow>{t(bi("The Kriya Lab", "தி கிரியா லேப்"))}</Eyebrow>
        <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight lg:text-5xl">
          {t(bi("A Laboratory for Inner Exploration", "உள்முக ஆய்வுக்கான ஒரு ஆய்வகம்"))}
        </h2>
        <p className="measure mt-7 text-muted-foreground">{t(home.labIntro)}</p>

        <div className="mt-16 grid gap-px overflow-hidden rounded-sm bg-border md:grid-cols-3">
          {home.pillars.map((p, i) => (
            <article key={p.key} className="bg-background p-9 lg:p-11">
              <span className="font-serif text-3xl text-gold">0{i + 1}</span>
              <h3 className="mt-6 text-lg tracking-[0.2em] uppercase">{t(p.title)}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(p.body)}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Koshas */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>{t(bi("Five Koshas", "ஐந்து கோசங்கள்"))}</Eyebrow>
            <h2 className="mt-5 font-serif text-4xl leading-tight lg:text-5xl">
              {t(bi("The five layers of human experience", "மனித அனுபவத்தின் ஐந்து அடுக்குகள்"))}
            </h2>
            <ul className="mt-10 space-y-px" role="tablist" aria-label="Koshas">
              {koshas.map((k, i) => (
                <li key={k.key}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    onClick={() => setActive(i)}
                    className={`flex w-full items-baseline justify-between gap-4 border-b border-border py-4 text-left transition-colors ${
                      active === i ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-serif text-xl">{t(k.name)}</span>
                    <span className="text-xs tracking-widest uppercase">{t(k.label)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex items-center justify-center rounded-sm bg-muted p-10">
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              {koshas.map((_, i) => (
                <span
                  key={i}
                  className="absolute rounded-full border border-primary/20"
                  style={{
                    width: `${100 - i * 17}%`,
                    aspectRatio: "1",
                    opacity: active === i ? 1 : 0.4,
                    borderColor:
                      active === i ? "var(--gold)" : "color-mix(in oklab, var(--primary) 25%, transparent)",
                    transition: "all .6s cubic-bezier(.22,1,.36,1)",
                  }}
                />
              ))}
            </div>
            <div className="relative max-w-sm text-center">
              <h3 className="font-serif text-2xl">{t(koshas[active]!.name)}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t(koshas[active]!.body)}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Featured Offerings & Gatherings */}
      {(topPrograms.length > 0 || topEvents.length > 0) && (
        <Section tone="muted">
          <div className="space-y-14">
            {topPrograms.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div>
                    <Eyebrow>{t(bi("Offerings", "பயிற்சிகள்"))}</Eyebrow>
                    <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-serif">
                      {t(bi("Latest Programs", "புதிய பயிற்சிகள்"))}
                    </h2>
                  </div>
                  <Link to="/programs" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    {t(bi("Explore All Programs", "அனைத்து பயிற்சிகளையும் காண்க"))}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {topPrograms.map(p => (
                    <ProgramCard key={p.id} program={p} lang={lang} />
                  ))}
                </div>
              </div>
            )}

            {topEvents.length > 0 && (
              <div className={topPrograms.length > 0 ? "pt-12 border-t border-border" : ""}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div>
                    <Eyebrow>{t(bi("Gatherings", "நிகழ்வுகள்"))}</Eyebrow>
                    <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-serif">
                      {t(bi("Upcoming Events", "வரவிருக்கும் நிகழ்வுகள்"))}
                    </h2>
                  </div>
                  <Link to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    {t(bi("Explore All Events", "அனைத்து நிகழ்வுகளையும் காண்க"))}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {topEvents.map(e => {
                    const eTitle = (ta ? e.title_ta : e.title) || e.title;
                    const eLoc = (ta ? e.location_ta : e.location) || e.location;
                    return (
                      <article key={e.id} className="rounded-2xl border border-border overflow-hidden bg-background shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                        {e.image_url && (
                          <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-border">
                            <img src={e.image_url} alt={eTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-serif text-[1.15rem] sm:text-xl line-clamp-2">{eTitle}</h3>
                          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground flex-1">
                            {e.event_date && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                <span>{e.event_date}</span>
                              </div>
                            )}
                            {eLoc && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="line-clamp-1">{eLoc}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-6 pt-4">
                            <Link
                              to="/events"
                              className="inline-flex w-full items-center justify-center rounded-full bg-[#522938] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#41212d] hover:shadow-lg transition-all"
                            >
                              {ta ? "மேலும் காண்க" : "View Event"}
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Invitation */}
      <Section tone="velvet">
        <blockquote className="mx-auto max-w-4xl text-center font-serif text-[clamp(1.6rem,3.4vw,2.6rem)] leading-snug">
          {t(home.invitation)}
        </blockquote>
        <div className="mt-12 flex justify-center">
          <CTARow />
        </div>
        <p className="mt-8 text-center text-xs text-[oklch(0.72_0.02_300)]">
          {lang === "ta"
            ? "தி கிரியா லேப் மருத்துவ ஆலோசனையை வழங்கவில்லை."
            : "The Kriya Lab does not offer medical advice or cures."}
        </p>
      </Section>
    </>
  );
}
