import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import heroImage from "@/assets/hero-breath.jpg";
import heroVideo from "@/assets/Hero-sections.mp4";
import { home, koshas, settings, ui } from "@/content/site";
import { bi, useLang } from "@/lib/i18n";
import { CTARow, Eyebrow, Section } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
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
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate({ to: "/admin", replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

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
            <p className="eyebrow text-gold">{t(settings.tagline)}</p>
            <h1 className="mt-7 text-balance font-serif text-[clamp(2.8rem,7vw,5.6rem)] leading-[1.02]">
              {t(home.heroTitle)}
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-[oklch(0.85_0.02_300)]">{t(home.heroFlow)}</p>

            <div className="mt-11 flex flex-wrap items-center gap-4">
              <Link
                to="/programs"
                className="rounded-full bg-gold px-8 py-3.5 text-sm text-velvet-deep transition-opacity hover:opacity-90"
              >
                {t(ui.begin)}
              </Link>
              <Link
                to="/kriya-yoga"
                className="rounded-full border border-[oklch(1_0_0_/_0.3)] px-8 py-3.5 text-sm transition-colors hover:border-gold hover:text-gold"
              >
                {t(ui.explore)}
              </Link>
              <WhatsAppButton
                className="border-[oklch(1_0_0_/_0.3)] text-[oklch(0.94_0.01_300)] hover:border-gold hover:text-gold"
              />
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
