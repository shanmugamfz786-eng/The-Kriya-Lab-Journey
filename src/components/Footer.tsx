import { Link } from "@tanstack/react-router";
import { bi, useLang } from "@/lib/i18n";
import { settings } from "@/content/site";
import { cn } from "@/lib/utils";
import { Mail, MapPin } from "lucide-react";

export const customerHelpLinks = [
  { label: bi("Shipping Policy", "விநியோகக் கொள்கை"), to: "/shipping-policy" },
  { label: bi("Returns & Refunds", "திரும்பப் பெறுதல் & பணம் திரும்ப அளிப்பு"), to: "/returns-and-refunds" },
  { label: bi("Privacy Policy", "தனியுரிமைக் கொள்கை"), to: "/privacy" },
  { label: bi("Terms & Conditions", "விதிமுறைகள் & நிபந்தனைகள்"), to: "/terms" },
  { label: bi("FAQs", "அடிக்கடி கேட்கப்படும் கேள்விகள்"), to: "/faq" },
];

export const exploreLinks = [
  { label: bi("Kriya Yoga", "கிரியா யோகம்"), to: "/kriya-yoga" },
  { label: bi("Science of Kriya Yoga", "கிரியா யோக அறிவியல்"), to: "/science-of-kriya-yoga" },
  { label: bi("The Kriya Lab", "தி கிரியா லேப்"), to: "/the-kriya-lab" },
  { label: bi("Siddha Tradition", "சித்தர் மரபு"), to: "/siddha-tradition" },
  { label: bi("Initiation Programs", "பயிற்சி வகுப்புகள்"), to: "/programs" },
  { label: bi("Events & Retreats", "நிகழ்வுகள் & முகாம்கள்"), to: "/events" },
  { label: bi("Lineage", "குரு பரம்பரை"), to: "/lineage" },
  { label: bi("Journal", "இதழ்"), to: "/journal" },
];

export function Footer({ className }: { className?: string }) {
  const { t, lang, setLang } = useLang();

  return (
    <footer className={cn("bg-velvet-deep text-[oklch(0.94_0.01_300)] border-t border-white/10", className)}>
      <div className="mx-auto grid max-w-7xl gap-10 sm:gap-12 px-5 py-16 sm:py-20 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {/* Column 1: Brand & Sacred Mission */}
        <div className="space-y-4">
          <Link to="/" className="font-serif text-2xl tracking-[0.18em] text-white hover:text-gold transition-colors inline-block">
            {settings.brand}
          </Link>
          <p className="text-xs sm:text-sm text-[oklch(0.8_0.02_300)] leading-relaxed">
            {t(settings.tagline)}
          </p>
          <div className="pt-2 text-xs text-[oklch(0.75_0.02_300)] space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-gold shrink-0" />
              <span>{t(bi("Chennai & Coimbatore, Tamil Nadu, India", "சென்னை & கோவை, தமிழ்நாடு, இந்தியா"))}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-3.5 text-gold shrink-0" />
              <a href={`mailto:${settings.email}`} className="text-gold hover:underline">
                {settings.email}
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Explore & Lineage */}
        <div className="space-y-4">
          <p className="eyebrow text-gold text-xs font-bold uppercase tracking-widest">
            {t(bi("Explore", "ஆராயுங்கள்"))}
          </p>
          <nav aria-label="Explore Links" className="grid grid-cols-1 gap-y-2 text-xs sm:text-sm">
            {exploreLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[oklch(0.8_0.02_300)] transition-colors hover:text-gold"
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Column 3: CUSTOMER HELP (As requested) */}
        <div className="space-y-4">
          <p className="eyebrow text-gold text-xs font-bold uppercase tracking-widest">
            {t(bi("Customer Help", "வாடிக்கையாளர் உதவி"))}
          </p>
          <nav aria-label="Customer Help" className="flex flex-col space-y-2.5 text-xs sm:text-sm">
            {customerHelpLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[oklch(0.8_0.02_300)] transition-colors hover:text-gold flex items-center gap-1.5"
              >
                <span>{t(item.label)}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Column 4: Language & Direct Guidance */}
        <div className="space-y-5 text-sm">
          <div>
            <p className="eyebrow text-gold text-xs font-bold uppercase tracking-widest">
              {t(bi("Language", "மொழி"))}
            </p>
            <div className="mt-2.5 flex items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={cn(
                  "px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                  lang === "en" ? "bg-gold text-velvet-deep font-bold border-gold" : "border-white/20 text-white/70 hover:text-white"
                )}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("ta")}
                aria-pressed={lang === "ta"}
                className={cn(
                  "px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                  lang === "ta" ? "bg-gold text-velvet-deep font-bold border-gold" : "border-white/20 text-white/70 hover:text-white"
                )}
              >
                தமிழ்
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <p className="text-xs text-[oklch(0.75_0.02_300)] leading-relaxed">
              {t(
                bi(
                  "Have questions about your initiation or enrollment?",
                  "தீட்சை அல்லது பயிற்சிகள் குறித்த கேள்விகளுக்கு:"
                )
              )}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
            >
              {t(bi("Contact Guidance Team", "வழிகாட்டல் குழுவை தொடர்பு கொள்ள"))} →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-[oklch(1_0_0_/_0.08)] py-6 text-center text-xs text-[oklch(0.68_0.02_300)] px-4">
        © {new Date().getFullYear()} {settings.brand}. {t(bi("Dedicated to Babaji's Kriya Yoga Sadhana & Inner Evolution.", "பாபாஜியின் கிரியா யோக சாதனா & ஆன்மிக பரிணாமத்திற்கு அர்ப்பணிக்கப்பட்டது."))}
      </div>
    </footer>
  );
}
