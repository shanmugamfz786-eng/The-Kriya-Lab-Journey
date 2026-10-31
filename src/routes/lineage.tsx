import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { lineage } from "@/content/site";
import agasthiyarImage from "@/assets/images/agasthiyar.jpg";
import bogarImage from "@/assets/images/bogar-lineage.jpg";
import babajiImage from "@/assets/images/sri-guru-babaji.jpg";
import yogiarImage from "@/assets/images/yogiar-saa-ramaiah.jpg";

export const Route = createFileRoute("/lineage")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Teachers & Lineage | THE KRIYA LAB" },
      {
        name: "description",
        content: "The lineage through which the practices taught at THE KRIYA LAB are received.",
      },
      { property: "og:title", content: "Teachers & Lineage — THE KRIYA LAB" },
      { property: "og:description", content: "Lineage masters, teachers and the school today." },
    ],
  }),
  component: LineagePage,
});

function LineagePage() {
  const { t } = useLang();

  return (
    <>
      <PageHero
        eyebrow={t(bi("Lineage", "குரு பரம்பரை"))}
        title={t(bi("A line of transmission", "பரம்பரை வழி"))}
        intro={t(
          bi(
            "The direct sacred transmission from Siddhar Agasthiyar and Siddhar Bogar to Sri Guru Babaji and Yogi S.A.A. Ramaiah.",
            "சித்தர் அகத்தியர், சித்தர் போகர் மற்றும் ஸ்ரீ குரு பாபாஜி வழியில் தொடரும் கிரியா யோகப் பரம்பரை.",
          ),
        )}
      />

      <Section className="pt-4 sm:pt-6 lg:pt-8 pb-10 sm:pb-14">
        <div className="max-w-5xl mx-auto">
          <ol className="relative space-y-0 border-l border-gold/30 pl-6 sm:pl-8">
            {lineage.map((n, i) => (
              <li key={i} className="relative pb-8 sm:pb-10 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.85rem] sm:-left-[2.35rem] top-2 size-2.5 rounded-full bg-gold ring-4 ring-gold/20"
                />
                <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-semibold">{t(n.name)}</h2>
                {t(n.role).trim() ? (
                  <p className="mt-1 text-xs tracking-widest text-gold uppercase font-medium">
                    {t(n.role)}
                  </p>
                ) : null}

                {i === 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-4 max-w-4xl">
                    <figure className="aura-image">
                      <img
                        src={agasthiyarImage}
                        alt={t(bi("Siddhar Agasthiyar", "சித்தர் அகஸ்தியர்"))}
                        loading="lazy"
                        className="aspect-square w-full rounded-2xl border border-border/80 object-cover shadow-sm"
                      />
                      <figcaption className="mt-2 text-center text-xs tracking-wider text-muted-foreground uppercase">
                        {t(bi("Siddhar Agasthiyar", "சித்தர் அகஸ்தியர்"))}
                      </figcaption>
                    </figure>
                    <figure className="aura-image">
                      <img
                        src={bogarImage}
                        alt={t(bi("Siddhar Bogar", "சித்தர் போகர்"))}
                        loading="lazy"
                        className="aspect-square w-full rounded-2xl border border-border/80 object-cover shadow-sm"
                      />
                      <figcaption className="mt-2 text-center text-xs tracking-wider text-muted-foreground uppercase">
                        {t(bi("Siddhar Bogar", "சித்தர் போகர்"))}
                      </figcaption>
                    </figure>
                    <figure className="aura-image">
                      <img
                        src={babajiImage}
                        alt={t(bi("Sri Guru Babaji", "ஸ்ரீ குரு பாபாஜி"))}
                        loading="lazy"
                        className="aspect-square w-full rounded-2xl border border-border/80 object-cover shadow-sm"
                      />
                      <figcaption className="mt-2 text-center text-xs tracking-wider text-muted-foreground uppercase">
                        {t(bi("Sri Guru Babaji", "ஸ்ரீ குரு பாபாஜி"))}
                      </figcaption>
                    </figure>
                    <figure className="aura-image">
                      <img
                        src={yogiarImage}
                        alt={t(bi("Yogi S.A.A. Ramaiah", "யோகி எஸ்.ஏ.ஏ. இராமையா"))}
                        loading="lazy"
                        className="aspect-square w-full rounded-2xl border border-border/80 object-cover shadow-sm"
                      />
                      <figcaption className="mt-2 text-center text-xs tracking-wider text-muted-foreground uppercase">
                        {t(bi("Yogi S.A.A. Ramaiah", "யோகி எஸ்.ஏ.ஏ. இராமையா"))}
                      </figcaption>
                    </figure>
                  </div>
                ) : null}

                <p className="max-w-4xl mt-3 text-sm sm:text-base text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                  {t(n.note).trim()}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}
