import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { bi, useLang } from "@/lib/i18n";

interface AccountNavTabsProps {
  activeTab?: "profile" | "details" | "security";
  title?: string;
  subtitle?: string;
}

export function AccountNavTabs({ title, subtitle }: AccountNavTabsProps) {
  const { t, lang } = useLang();
  const ta = lang === "ta";

  return (
    <header className="bg-dawn pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 lg:px-8 border-b border-border/40">
      <div className="mx-auto max-w-5xl animate-rise">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-gold transition-colors mb-3.5 group cursor-pointer"
        >
          <ArrowLeft className="size-3.5 text-gold transition-transform group-hover:-translate-x-1" />
          <span>{ta ? "முகப்புக்கு திரும்பு" : "Back to Home"}</span>
        </Link>

        <p className="eyebrow text-gold text-xs uppercase tracking-widest font-semibold">
          {t(bi("Your Personal Account", "உங்கள் பயனர் கணக்கு"))}
        </p>

        {title && (
          <h1 className="mt-1 font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-tight text-foreground">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
