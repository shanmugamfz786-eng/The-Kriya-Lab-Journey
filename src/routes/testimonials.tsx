import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { testimonials } from "@/content/site";

export const Route = createFileRoute("/testimonials")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Student Experiences | THE KRIYA LAB" },
      {
        name: "description",
        content: "Experiences shared by students of THE KRIYA LAB, published with their consent.",
      },
      { property: "og:title", content: "Student Experiences — THE KRIYA LAB" },
      { property: "og:description", content: "Reflections from those exploring Kriya Yoga." },
    ],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t(bi("Experiences", "அனுபவங்கள்"))}
        title={t(bi("In their own words", "அவர்களின் சொந்த வார்த்தைகளில்"))}
        intro={t(
          bi(
            "Reflections from students of THE KRIYA LAB. Experiences are published only with the consent of the person who shared them.",
            "தி கிரியா லேப் மாணவர்களின் அனுபவப் பகிர்வுகள். பகிர்ந்தவரின் அனுமதியுடன் மட்டுமே அவை வெளியிடப்படுகின்றன.",
          ),
        )}
      />

      <Section>
        {testimonials.length === 0 ? (
          <p className="measure text-muted-foreground">
            {t(
              bi(
                "We are collecting written experiences from students who have completed initiation. If you have practised with us and would like to share your experience, write to us and we will publish it here with your consent.",
                "தீட்சை பெற்ற மாணவர்களிடமிருந்து அனுபவப் பகிர்வுகளைச் சேகரித்து வருகிறோம். எங்களுடன் பயிற்சி செய்திருந்தால், உங்கள் அனுபவத்தை எங்களுக்கு எழுதுங்கள்; உங்கள் அனுமதியுடன் இங்கே வெளியிடுவோம்.",
              ),
            )}
          </p>
        ) : (
          <div className="space-y-20">
            {testimonials.map((item, i) => (
              <figure key={i} className="border-t border-border pt-10">
                <blockquote className="measure font-serif text-[clamp(1.5rem,3vw,2.4rem)] leading-snug">
                  “{t(item.text)}”
                </blockquote>
                <figcaption className="mt-8 text-xs tracking-widest text-muted-foreground uppercase">
                  {t(item.name)} · {t(item.program)}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

