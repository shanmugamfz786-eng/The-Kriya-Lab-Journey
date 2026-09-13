import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/gallery")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Gallery | THE KRIYA LAB" },
      {
        name: "description",
        content: "Photographs from practice, teaching and gatherings at THE KRIYA LAB.",
      },
      { property: "og:title", content: "Gallery — THE KRIYA LAB" },
      { property: "og:description", content: "Photographs from practice and teaching." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t(bi("Gallery", "படத்தொகுப்பு"))}
        title={t(bi("Images from the practice", "பயிற்சியிலிருந்து படங்கள்"))}
        intro={t(
          bi(
            "Photographs from our sessions, initiations and retreats. Only authentic images of THE KRIYA LAB are shown here — no stock imagery.",
            "எங்கள் வகுப்புகள், தீட்சைகள் மற்றும் தியான முகாம்களின் புகைப்படங்கள். தி கிரியா லேப்பின் உண்மையான படங்கள் மட்டுமே இங்கே இடம்பெறும் — வணிகப் படங்கள் இல்லை.",
          ),
        )}
      />
      <Section>
        <p className="measure text-muted-foreground">
          {t(
            bi(
              "New photographs are added here after each session. To see recent images in the meantime, message us on WhatsApp.",
              "ஒவ்வொரு வகுப்புக்குப் பிறகும் புதிய புகைப்படங்கள் இங்கே சேர்க்கப்படும். அதுவரை சமீபத்திய படங்களைக் காண வாட்ஸ்அப்பில் எங்களைத் தொடர்பு கொள்ளுங்கள்.",
            ),
          )}
        </p>
      </Section>
    </>
  );
}

