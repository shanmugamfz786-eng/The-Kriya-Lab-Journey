import { settings } from "@/content/site";
import type { Lang } from "@/lib/i18n";

export type WhatsAppEvent =
  | "whatsapp_floating_click"
  | "whatsapp_program_enquiry"
  | "whatsapp_contact_click"
  | "whatsapp_enrollment_click";

/**
 * Anonymous, in-memory/localStorage interaction counters.
 * Designed so a real analytics or WhatsApp Business API layer can replace this
 * without touching any component.
 */
export function trackWhatsApp(event: WhatsAppEvent, lang: Lang) {
  if (typeof window === "undefined") return;
  try {
    const key = "kriyalab.wa.events";
    const raw = window.localStorage.getItem(key);
    const data: Record<string, number> = raw ? JSON.parse(raw) : {};
    data[event] = (data[event] ?? 0) + 1;
    const langKey = lang === "ta" ? "tamil_whatsapp_click" : "english_whatsapp_click";
    data[langKey] = (data[langKey] ?? 0) + 1;
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* analytics must never break the page */
  }
}

export function whatsappLink(message: string) {
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function programMessage(programName: string, lang: Lang) {
  return lang === "ta"
    ? `வணக்கம், ${programName} பற்றிய கூடுதல் தகவல்களை அறிய விரும்புகிறேன். நேர அட்டவணை, தகுதி, கட்டணம் மற்றும் எவ்வாறு தொடங்குவது என்பது குறித்து தகவல் வழங்கவும்.`
    : `Hello, I would like to know more about the ${programName}. Please share details about the schedule, eligibility, fees and how I can begin.`;
}

export function defaultMessage(lang: Lang) {
  return lang === "ta" ? settings.whatsappDefault.ta : settings.whatsappDefault.en;
}
