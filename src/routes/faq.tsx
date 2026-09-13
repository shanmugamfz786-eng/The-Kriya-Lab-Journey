import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { faqs } from "@/content/site";
import { Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "Answers about Kriya Yoga, initiation, eligibility, practice frequency and how to begin at THE KRIYA LAB.",
      },
      { property: "og:title", content: "FAQ — THE KRIYA LAB" },
      { property: "og:description", content: "Common questions about Kriya Yoga and initiation." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageHero
        eyebrow={t(bi("FAQ", "கேள்விகள்"))}
        title={t(bi("Questions before you begin", "தொடங்கும் முன் கேள்விகள்"))}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-border">
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-serif text-xl lg:text-2xl">{t(f.q)}</span>
                    {isOpen ? (
                      <Minus className="size-4 shrink-0 text-gold" />
                    ) : (
                      <Plus className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                </h2>
                {isOpen ? (
                  <p className="pb-8 leading-relaxed text-muted-foreground">{t(f.a)}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
