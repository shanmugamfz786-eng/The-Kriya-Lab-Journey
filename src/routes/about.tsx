import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { PageHero, Section, Eyebrow } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang } from "@/lib/i18n";
import { journeyChapters } from "@/content/site";
import teacherPortrait from "@/assets/images/teacher-portrait.jpg";
import himalayasPhoto from "@/assets/images/in-the-himalayas.jpeg";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "About the Teacher | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "The teacher behind THE KRIYA LAB — experience, approach and personal spiritual journey.",
      },
      { property: "og:title", content: "About the Teacher — THE KRIYA LAB" },
      { property: "og:description", content: "Experience, approach and personal spiritual journey." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t(bi("About the Teacher", "ஆசிரியரைப் பற்றி"))}
        title={t(bi("Shri Guru Babaji's servant", "ஸ்ரீ குரு பாபாஜியின் சேவகன்"))}
        intro={t(
          bi(
            "The teacher who guides initiation and practice at THE KRIYA LAB, and a bit of his personal spiritual journey below.",
            "தி கிரியா லேப்பில் தீட்சை மற்றும் பயிற்சியை வழிநடத்தும் ஆசிரியர், மற்றும் இங்கு வழிநடத்திய தனிப்பட்ட ஆன்மிகப் பயணம்.",
          ),
        )}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.5fr_1.5fr]">
          <figure className="aura-image max-w-xs self-start overflow-hidden rounded-sm border border-border">
            <img
              src={teacherPortrait}
              alt={t(bi("Portrait of the teacher of THE KRIYA LAB", "தி கிரியா லேப் ஆசிரியரின் புகைப்படம்"))}
              className="aspect-[3/4] w-full object-cover"
              loading="lazy"
            />
          </figure>

          <div className="space-y-12">

            <div>
              <Eyebrow>{t(bi("Personal spiritual journey", "தனிப்பட்ட ஆன்மிகப் பயணம்"))}</Eyebrow>
              <ol className="mt-6 space-y-px">
                {journeyChapters.map((c, i) => (
                  <Fragment key={i}>
                    <li className="flex items-baseline gap-5 border-b border-border py-6">
                      <span className="text-xs text-gold">{String(i + 1).padStart(2, "0")}</span>
                      <div className="font-serif text-xl leading-relaxed">
                        {t(c)
                          .split(/\\n|\n+/)
                          .map((p) => p.trim())
                          .filter(Boolean)
                          .map((p, j) => (
                            <p key={j} className={j > 0 ? "mt-7" : undefined}>
                              {p}
                            </p>
                          ))}
                      </div>
                    </li>
                    {i === 15 ? (
                      <li className="border-b border-border py-8 pl-9 sm:pl-12">
                        <figure className="aura-image overflow-hidden rounded-sm border border-border">
                          <img
                            src={himalayasPhoto}
                            alt={t(
                              bi(
                                "Meditating beneath a rocky shelter in the Himalayas",
                                "இமயமலையில் பாறை நிழலில் தியானம்",
                              ),
                            )}
                            className="aspect-[16/9] w-full object-cover"
                            loading="lazy"
                          />
                        </figure>
                      </li>
                    ) : null}
                  </Fragment>
                ))}
              </ol>
            </div>
            <div className="flex flex-wrap gap-4">
              <WhatsAppButton />
              <Link
                to="/lineage"
                className="rounded-full border border-border px-6 py-3 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {t(bi("Our Lineage", "எங்கள் குரு பரம்பரை"))}
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
