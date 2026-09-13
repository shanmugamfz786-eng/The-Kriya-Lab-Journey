import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PlaceholderNote, Section } from "@/components/Primitives";
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
            "Siddhar Agasthiyar and Siddhar Bogar ",
            "ஆசிரியர் விவரங்கள் திருத்தக்கூடிய மாதிரிப் பதிவுகள். வரலாற்றுக் கூற்றுகள் எதுவும் உருவாக்கப்படவில்லை.",
          ),
        )}
      />

      <Section>
        <ol className="relative space-y-0 border-l border-border pl-8">
          {lineage.map((n, i) => (
            <li key={i} className="relative pb-16 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute -left-[2.15rem] top-2 size-2 rounded-full bg-gold"
              />
              <h2 className="font-serif text-3xl lg:text-4xl">{t(n.name)}</h2>
              <p className="mt-2 text-xs tracking-widest text-muted-foreground uppercase">
                {t(n.role)}
              </p>
              {i === 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <figure className="aura-image">
                    <img
                      src={agasthiyarImage}
                      alt={t(bi("Siddhar Agasthiyar", "சித்தர் அகஸ்தியர்"))}
                      loading="lazy"
                      className="aspect-square w-full rounded-md border border-border object-cover"
                    />
                    <figcaption className="mt-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
                      {t(bi("Siddhar Agasthiyar", "சித்தர் அகஸ்தியர்"))}
                    </figcaption>
                  </figure>
                  <figure className="aura-image">
                    <img
                      src={bogarImage}
                      alt={t(bi("Siddhar Bogar", "சித்தர் போகர்"))}
                      loading="lazy"
                      className="aspect-square w-full rounded-md border border-border object-cover"
                    />
                    <figcaption className="mt-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
                      {t(bi("Siddhar Bogar", "சித்தர் போகர்"))}
                    </figcaption>
                  </figure>
                  <figure className="aura-image">
                    <img
                      src={babajiImage}
                      alt={t(bi("Sri Guru Babaji", "ஸ்ரீ குரு பாபாஜி"))}
                      loading="lazy"
                      className="aspect-square w-full rounded-md border border-border object-cover"
                    />
                    <figcaption className="mt-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
                      {t(bi("Sri Guru Babaji", "ஸ்ரீ குரு பாபாஜி"))}
                    </figcaption>
                  </figure>
                  <figure className="aura-image">
                    <img
                      src={yogiarImage}
                      alt={t(bi("Yogi S.A.A. Ramaiah", "யோகி எஸ்.ஏ.ஏ. இராமையா"))}
                      loading="lazy"
                      className="aspect-square w-full rounded-md border border-border object-cover"
                    />
                    <figcaption className="mt-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
                      {t(bi("Yogi S.A.A. Ramaiah", "யோகி எஸ்.ஏ.ஏ. இராமையா"))}
                    </figcaption>
                  </figure>
                </div>
              ) : null}
              <p className="measure mt-4 text-muted-foreground">{t(n.note)}</p>
              {i < lineage.length - 1 ? <PlaceholderNote /> : null}
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
