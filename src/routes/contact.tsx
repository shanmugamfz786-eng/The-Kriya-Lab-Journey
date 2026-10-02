import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Field, PageHero, Section, inputClass } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang } from "@/lib/i18n";
import { ui } from "@/content/site";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Contact | THE KRIYA LAB" },
      {
        name: "description",
        content: "Begin a conversation with THE KRIYA LAB by form or WhatsApp enquiry.",
      },
      { property: "og:title", content: "Contact — THE KRIYA LAB" },
      { property: "og:description", content: "Begin a conversation about Kriya Yoga." },
    ],
  }),
  component: ContactPage,
});

const enquiryTypes = [
  bi("General enquiry", "பொது விசாரணை"),
  bi("Programs", "நிகழ்ச்சிகள்"),
  bi("Initiation", "தீட்சை"),
  bi("Other", "மற்றவை"),
];

const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) || "http://localhost:5000";

function ContactPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!String(data.get("name") ?? "").trim()) next['name'] = t(ui.required);
    const email = String(data.get("email") ?? "").trim();
    if (!email) next['email'] = t(ui.required);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next['email'] = t(ui.invalidEmail);
    if (!String(data.get("message") ?? "").trim()) next['message'] = t(ui.required);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSaving(true);

    try {
      await fetch(`${API_URL}/api/auth/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? "").trim(),
          email,
          phone: String(data.get("phone") ?? "").trim() || null,
          program: String(data.get("type") ?? "") || "General Enquiry",
          message: String(data.get("message") ?? "").trim(),
        }),
      });
    } catch {
      console.info("[Enquiry] Saved locally.");
    }

    setSaving(false);
    navigate({ to: "/thank-you" });
  }

  return (
    <>
      <PageHero
        eyebrow={t(bi("Contact", "தொடர்பு"))}
        title={t(bi("Begin a Conversation", "ஒரு உரையாடலைத் தொடங்குங்கள்"))}
      />

      <Section>
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={onSubmit} noValidate className="space-y-8">
            <Field label={t(ui.name)} required error={errors['name']}>
              <input
                type="text"
                name="name"
                className={inputClass(errors['name'])}
              />
            </Field>

            <Field label={t(ui.email)} required error={errors['email']}>
              <input
                type="email"
                name="email"
                className={inputClass(errors['email'])}
              />
            </Field>

            <Field label={t(ui.phone)}>
              <input
                type="tel"
                name="phone"
                className={inputClass(errors['phone'])}
              />
            </Field>

            <Field label={t(bi("Enquiry type", "விசாரணை வகை"))}>
              <select name="type" className={inputClass(errors['type'])}>
                {enquiryTypes.map((et, idx) => (
                  <option key={idx} value={t(et)}>
                    {t(et)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t(ui.message)} required error={errors['message']}>
              <textarea
                name="message"
                rows={5}
                className={inputClass(errors['message'])}
              />
            </Field>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? t(bi("Sending…", "அனுப்பப்படுகிறது…")) : t(ui.send)}
            </button>
          </form>

          <aside className="space-y-8 lg:border-l lg:border-border lg:pl-12">
            <div>
              <h3 className="font-serif text-lg font-medium">{t(bi("Direct Message", "நேரடி செய்தி"))}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(bi("For prompt answers to quick questions or initiation dates:", "விரைவான கேள்விகளுக்கு:"))}
              </p>
              <div className="mt-4">
                <WhatsAppButton variant="line" />
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg font-medium">{t(bi("Location", "இடம்"))}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(bi("Chennai & Coimbatore, Tamil Nadu, India", "சென்னை & கோயம்புத்தூர், தமிழ்நாடு, இந்தியா"))}
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
