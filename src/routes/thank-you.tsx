import { createFileRoute, Link } from "@tanstack/react-router";
import { bi, useLang } from "@/lib/i18n";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/thank-you")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Thank You | THE KRIYA LAB" },
      { name: "description", content: "Your request has been noted. A Kriya guide will be in touch." },
      { property: "og:title", content: "Thank You — THE KRIYA LAB" },
      { property: "og:description", content: "Your enquiry has been noted." },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const { t } = useLang();
  return (
    <section className="bg-dawn px-5 py-32 lg:px-10 lg:py-44">
      <div className="mx-auto max-w-2xl animate-rise text-center">
        <p className="eyebrow text-gold">{t(bi("Received", "பெறப்பட்டது"))}</p>
        <h1 className="mt-6 font-serif text-[clamp(2.2rem,5vw,3.6rem)] leading-tight">
          {t(bi("Thank you. Your journey has begun.", "நன்றி. உங்கள் பயணம் தொடங்கிவிட்டது."))}
        </h1>
        <p className="mt-6 text-muted-foreground">
          {t(
            bi(
              "Your details have been captured on this device. Once the school's enquiry system is connected, requests will be delivered directly to a Kriya guide.",
              "உங்கள் விவரங்கள் இந்தச் சாதனத்தில் பதிவு செய்யப்பட்டுள்ளன. பள்ளியின் விசாரணை அமைப்பு இணைக்கப்பட்டவுடன், கோரிக்கைகள் நேரடியாக ஒரு கிரியா வழிகாட்டிக்கு அனுப்பப்படும்.",
            ),
          )}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="rounded-full bg-velvet px-7 py-3.5 text-sm text-primary-foreground transition-colors hover:bg-primary"
          >
            {t(bi("Return home", "முகப்புக்குத் திரும்பு"))}
          </Link>
          <WhatsAppButton />
        </div>
      </div>
    </section>
  );
}
