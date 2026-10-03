import { MessageCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { settings } from "@/content/site";
import { defaultMessage, trackWhatsApp, whatsappLink, type WhatsAppEvent } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Props = {
  message?: string;
  event?: WhatsAppEvent;
  label?: string;
  className?: string;
  variant?: "line" | "solid" | "ghost";
};

export function WhatsAppButton({
  message,
  event = "whatsapp_contact_click",
  label,
  className,
  variant = "line",
}: Props) {
  const { lang, t } = useLang();
  const text = message ?? defaultMessage(lang);

  return (
    <a
      href={whatsappLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsApp(event, lang)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm transition-colors",
        variant === "line" &&
          "border border-border text-foreground hover:border-primary hover:text-primary",
        variant === "solid" && "bg-velvet text-primary-foreground hover:bg-primary",
        variant === "ghost" && "text-muted-foreground hover:text-primary",
        className,
      )}
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      {label ?? t(settings.whatsappLabel)}
    </a>
  );
}

export function FloatingWhatsApp() {
  const { lang, t } = useLang();
  // Safe check for window since this runs on client
  const isPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  
  return (
    <a
      href={whatsappLink(defaultMessage(lang))}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsApp("whatsapp_floating_click", lang)}
      aria-label={t(settings.whatsappLabel)}
      className={cn(
        "fixed right-4 z-40 inline-flex items-center gap-2 rounded-full bg-velvet px-4 py-3 text-sm text-primary-foreground shadow-lift transition-colors hover:bg-primary sm:px-5 xl:bottom-5 xl:right-5",
        !isPortal ? "bottom-[5.5rem]" : "bottom-5"
      )}
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      <span className="hidden sm:inline">{t(settings.whatsappLabel)}</span>
    </a>
  );
}
