import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Field, PageHero, Section, inputClass } from "@/components/Primitives";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { bi, useLang } from "@/lib/i18n";
import { ui } from "@/content/site";
import { supabase } from "@/integrations/supabase/client";


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
    await supabase.from("enquiries").insert({
      name: String(data.get("name") ?? "").trim(),
      email,
      phone: String(data.get("phone") ?? "").trim() || null,
      kind: "contact",
      programme: String(data.get("type") ?? "") || null,
      language: lang,
      message: String(data.get("message") ?? "").trim(),
      source_page: "/contact",
    });
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
            <Field label={t(ui.name)} htmlFor="name">
              <input id="name" name="name" className={inputClass} aria-invalid={!!errors['name']} />
              {errors['name'] ? <span className="mt-2 block text-xs text-destructive">{errors['name']}</span> : null}
            </Field>
            <div className="grid gap-8 sm:grid-cols-2">
              <Field label={t(ui.email)} htmlFor="email">
                <input id="email" name="email" type="email" className={inputClass} aria-invalid={!!errors['email']} />
                {errors['email'] ? (
                  <span className="mt-2 block text-xs text-destructive">{errors['email']}</span>
                ) : null}
              </Field>
              <Field label={t(ui.phone)} htmlFor="phone">
                <input id="phone" name="phone" type="tel" className={inputClass} />
              </Field>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <Field label={t(ui.country)} htmlFor="country">
                <input id="country" name="country" className={inputClass} />
              </Field>
              <Field label={t(ui.enquiryType)} htmlFor="type">
                <select id="type" name="type" className={inputClass}>
                  {enquiryTypes.map((o, i) => (
                    <option key={i}>{t(o)}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label={t(ui.message)} htmlFor="message">
              <textarea id="message" name="message" rows={5} className={inputClass} aria-invalid={!!errors['message']} />
              {errors['message'] ? (
                <span className="mt-2 block text-xs text-destructive">{errors['message']}</span>
              ) : null}
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-velvet px-8 py-3.5 text-sm text-primary-foreground transition-colors hover:bg-primary disabled:opacity-60"
            >

              {t(ui.send)}
            </button>
          </form>

          <aside className="h-fit rounded-sm bg-muted p-8">
            <h2 className="font-serif text-2xl">
              {t(bi("Prefer to message?", "செய்தி அனுப்ப விரும்புகிறீர்களா?"))}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {t(
                bi(
                  "You can also reach us on WhatsApp. Your message opens pre-filled — you decide when to send it.",
                  "வாட்ஸ்அப்பிலும் எங்களை அணுகலாம். உங்கள் செய்தி முன்கூட்டியே நிரப்பப்பட்டு திறக்கும் — எப்போது அனுப்புவது என்பது உங்கள் விருப்பம்.",
                ),
              )}
            </p>
            <WhatsAppButton className="mt-6 bg-background" event="whatsapp_contact_click" />
          </aside>
        </div>
      </Section>
    </>
  );
}
