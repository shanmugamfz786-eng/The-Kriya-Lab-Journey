import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { faqs } from "@/content/site";
import { Plus, Minus, Search, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions (FAQ) | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "Clear answers to common questions about Kriya Yoga, initiation, eligibility, online classes, shipping, payments, and refunds at THE KRIYA LAB.",
      },
      { property: "og:title", content: "FAQ — THE KRIYA LAB" },
      { property: "og:description", content: "Human-written, detailed answers about practice, programs, and student support." },
    ],
  }),
  component: FaqPage,
});

export function FaqPage() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: bi("All Questions", "அனைத்து கேள்விகளும்") },
    { id: "practice", label: bi("Practice & Sadhana", "பயிற்சி & சாதனா") },
    { id: "programs", label: bi("Programs & Initiation", "வகுப்புகள் & தீட்சை") },
    { id: "customer-help", label: bi("Delivery & Customer Help", "விநியோகம் & உதவி") },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesCategory =
        selectedCategory === "all" ||
        f.category === selectedCategory ||
        (selectedCategory === "programs" && f.category === "initiation");

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const qText = `${t(f.q)} ${t(f.a)}`.toLowerCase();
      return qText.includes(searchQuery.toLowerCase());
    });
  }, [selectedCategory, searchQuery, t]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHero
        eyebrow={t(bi("Student Support & FAQs", "மாணவர் உதவி & கேள்விகள்"))}
        title={t(bi("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்"))}
        intro={t(
          bi(
            "Clear, thoughtful answers about Kriya Yoga practice, eligibility, class formats, payments, shipping, and refunds — written with transparency and care.",
            "கிரியா யோகப் பயிற்சி, தகுதி, ஆன்லைன் வகுப்புகள், விநியோகம் மற்றும் கட்டணம் பற்றிய தெளிவான விளக்கங்கள்."
          )
        )}
      />

      <Section className="!py-10 sm:!py-14">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(bi("Search questions (e.g. initiation, refund, beginners)…", "கேள்விகளைத் தேடவும்…"))}
              className="w-full rounded-full border border-border bg-card pl-11 pr-5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setOpen(null);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-semibold transition-all border cursor-pointer",
                    isSelected
                      ? "bg-gold text-velvet-deep border-gold shadow-xs"
                      : "bg-card text-muted-foreground hover:text-foreground border-border hover:border-gold/40"
                  )}
                >
                  {t(cat.label)}
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-8 shadow-xs">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <HelpCircle className="size-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-semibold text-foreground">
                  {t(bi("No matching questions found", "கேள்விகள் எதுவும் பொருந்தவில்லை"))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(bi("Try searching with another keyword or reset the category filter.", "வேறு வார்த்தைகளைப் பயன்படுத்தி தேடவும் அல்லது வகைகளை மாற்றவும்."))}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredFaqs.map((f, i) => {
                  const isOpen = open === i;
                  return (
                    <div key={i} className="py-2">
                      <h3>
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : i)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-6 py-4 text-left transition-colors hover:text-gold cursor-pointer"
                        >
                          <span className="font-serif text-lg sm:text-xl font-bold text-foreground">
                            {t(f.q)}
                          </span>
                          <span className="size-7 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
                            {isOpen ? (
                              <Minus className="size-4 text-gold" />
                            ) : (
                              <Plus className="size-4 text-muted-foreground" />
                            )}
                          </span>
                        </button>
                      </h3>
                      {isOpen && (
                        <div className="pb-5 pt-1 text-sm leading-relaxed text-muted-foreground animate-in fade-in duration-200">
                          <p>{t(f.a)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links to Customer Help Policies */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/shipping-policy"
              className="p-5 rounded-2xl border border-border bg-card hover:border-gold/50 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-serif font-bold text-base text-foreground group-hover:text-gold transition-colors">
                  {t(bi("Shipping & Delivery Policy", "விநியோகக் கொள்கை"))}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(bi("Delivery timelines for online access and physical kits", "அஞ்சல் மற்றும் இணையதள விநியோகம் பற்றிய விவரங்கள்"))}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/returns-and-refunds"
              className="p-5 rounded-2xl border border-border bg-card hover:border-gold/50 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-serif font-bold text-base text-foreground group-hover:text-gold transition-colors">
                  {t(bi("Returns & Refunds Policy", "திரும்பப் பெறுதல் கொள்கை"))}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(bi("Clear refund rules, missed session transfers & cancellations", "பணத்தைத் திரும்பப் பெறுதல் மற்றும் வகுப்பு மாற்றங்கள்"))}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
