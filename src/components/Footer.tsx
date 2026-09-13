import { Link } from "@tanstack/react-router";
import { bi, useLang } from "@/lib/i18n";
import { footerLinks, settings } from "@/content/site";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";

const legal = [
  { label: bi("Privacy Policy", "தனியுரிமைக் கொள்கை"), to: "/privacy" },
  { label: bi("Terms", "விதிமுறைகள்"), to: "/terms" },
  { label: bi("Disclaimer", "பொறுப்புத் துறப்பு"), to: "/disclaimer" },
];

export function Footer({ className }: { className?: string }) {
  const { t, lang, setLang } = useLang();

  return (
    <footer className={cn("bg-velvet-deep text-[oklch(0.94_0.01_300)]", className)}>
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-10">
        <div>
          <p className="font-serif text-2xl tracking-[0.18em]">{settings.brand}</p>
          <p className="mt-3 text-sm text-[oklch(0.8_0.02_300)]">{t(settings.tagline)}</p>
          <WhatsAppButton
            className="mt-8 border-[oklch(1_0_0_/_0.2)] text-[oklch(0.94_0.01_300)] hover:border-gold hover:text-gold"
            event="whatsapp_contact_click"
          />
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {footerLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[oklch(0.8_0.02_300)] transition-colors hover:text-gold"
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="space-y-6 text-sm">
          <div>
            <p className="eyebrow text-gold">{t(bi("Language", "மொழி"))}</p>
            <div className="mt-3 flex items-center gap-3">
              <button type="button" onClick={() => setLang("en")} aria-pressed={lang === "en"} className="hover:text-gold">
                English
              </button>
              <span className="text-[oklch(1_0_0_/_0.25)]">|</span>
              <button type="button" onClick={() => setLang("ta")} aria-pressed={lang === "ta"} className="hover:text-gold">
                தமிழ்
              </button>
            </div>
          </div>
          <div>
            <p className="eyebrow text-gold">{t(bi("Contact", "தொடர்பு"))}</p>
            <a href={`mailto:${settings.email}`} className="mt-3 block hover:text-gold">
              {settings.email}
            </a>
          </div>
          <div className="flex flex-wrap gap-4 pt-4 text-xs text-[oklch(0.72_0.02_300)]">
            {legal.map((item) => (
              <Link key={item.to} to={item.to} className="hover:text-gold">
                {t(item.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-[oklch(1_0_0_/_0.08)] py-6 text-center text-xs text-[oklch(0.68_0.02_300)]">
        © {new Date().getFullYear()} {settings.brand}
      </div>
    </footer>
  );
}
