import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PlaceholderNote, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { journeyChapters } from "@/content/site";

export const Route = createFileRoute("/journey")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "The Journey | THE KRIYA LAB" },
      {
        name: "description",
        content: "A chapter-by-chapter personal account of the search that led to THE KRIYA LAB.",
      },
      { property: "og:title", content: "The Journey — THE KRIYA LAB" },
      { property: "og:description", content: "A personal account, told in chapters." },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t(bi("The Journey", "பயணம்"))}
        title={t(bi("Told in chapters", "அத்தியாயங்களாக"))}
        intro={t(
          bi(
            "The path that led to THE KRIYA LAB, told in chapters.",
            "தி கிரியா லேப்பிற்கு வழிநடத்திய பாதை, அத்தியாயங்களாக.",
          ),
        )}

      />
      <Section>
        <ol className="space-y-0">
          {journeyChapters.map((c, i) => (
            <li key={i} className="grid gap-6 border-b border-border py-12 lg:grid-cols-[8rem_1fr]">
              <span className="font-serif text-3xl text-gold/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl">{t(c)}</h2>

              </div>
            </li>
          ))}
        </ol>
        <PlaceholderNote />
      </Section>
    </>
  );
}
