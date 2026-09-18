import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ArrowRight, Compass, Sparkles, BookOpen, User } from "lucide-react";
import { useEffect, useState } from "react";
import { settings, ui } from "@/content/site";
import { supabase } from "@/integrations/supabase/client";
import { bi, useLang } from "@/lib/i18n";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";

/** Grouped navigation items for the comprehensive Luxury Drawer */
const navigationGroups = [
  {
    title: bi("Wisdom & Tradition", "ஞானமும் மரபும்"),
    icon: Sparkles,
    links: [
      {
        label: bi("Kriya Yoga", "கிரியா யோகம்"),
        sub: bi("Core fundamentals & breath practice", "அடிப்படை கிரியா யோக பயிற்சி"),
        to: "/kriya-yoga",
      },
      {
        label: bi("Science of Kriya Yoga", "கிரியா யோக அறிவியல்"),
        sub: bi("Biological & nervous system rewiring", "உடலியல் மற்றும் நரம்பு மண்டல மாற்றம்"),
        to: "/science-of-kriya-yoga",
      },
      {
        label: bi("The Kriya Lab", "தி கிரியா லேப்"),
        sub: bi("Our philosophy & experiential method", "ஆய்வக தத்துவம் மற்றும் முறை"),
        to: "/the-kriya-lab",
      },
      {
        label: bi("Siddha Tradition", "சித்தர் மரபு"),
        sub: bi("18 Tamil Siddhas & ancient heritage", "18 சித்தர்களின் யோக பாரம்பரியம்"),
        to: "/siddha-tradition",
      },
      {
        label: bi("Guru Lineage", "குரு பரம்பரை"),
        sub: bi("Babaji & the unbroken transmission", "பாபாஜி மற்றும் குருமார்களின் பரம்பரை"),
        to: "/lineage",
      },
    ],
  },
  {
    title: bi("Programs & Events", "நிகழ்ச்சிகளும் நிகழ்வுகளும்"),
    icon: Compass,
    links: [
      {
        label: bi("All Programs", "அனைத்து நிகழ்ச்சிகள்"),
        sub: bi("Online & in-person initiation courses", "நேரலை மற்றும் நேரடி தீட்சை வகுப்புகள்"),
        to: "/programs",
      },
      {
        label: bi("Upcoming Events", "நிகழ்வுகள் & பட்டறைகள்"),
        sub: bi("Live workshops, webinars & retreats", "பயிலரங்குகள் மற்றும் நேரலை அமர்வுகள்"),
        to: "/events",
      },
      {
        label: bi("Buy / Enroll Online", "நேரடி முன்பதிவு"),
        sub: bi("Instant seat confirmation & portal access", "உடனடி இட ஒதுக்கீடு மற்றும் அனுமதி"),
        to: "/buy",
      },
    ],
  },
  {
    title: bi("Insights & Support", "அறிந்து கொள்ளுங்கள்"),
    icon: BookOpen,
    links: [
      {
        label: bi("About the Teacher", "ஆசிரியர் பற்றி"),
        sub: bi("Sadhana journey & training background", "ஆசிரியரின் யோகப் பயணம்"),
        to: "/about",
      },
      {
        label: bi("The Journal", "இதழ் & கட்டுரைகள்"),
        sub: bi("Articles on sadhana, meditation & breath", "தியானம் மற்றும் சாதனா கட்டுரைகள்"),
        to: "/journal",
      },
      {
        label: bi("Testimonials", "அனுபவப் பகிர்வுகள்"),
        sub: bi("Seeker experiences and reviews", "பயிற்சியாளர்களின் அனுபவங்கள்"),
        to: "/testimonials",
      },
      {
        label: bi("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்"),
        sub: bi("Preparation, requirements & doubts", "தயாரிப்பு மற்றும் சந்தேகங்கள்"),
        to: "/faq",
      },
      {
        label: bi("Contact Us", "தொடர்பு கொள்ள"),
        sub: bi("Direct guidance & questions", "நேரடி வழிகாட்டல் மற்றும் வினவல்கள்"),
        to: "/contact",
      },
    ],
  },
];

/** Fast-access links on the primary desktop header */
const primaryHeaderNav = [
  { label: bi("Kriya Yoga", "கிரியா யோகம்"), to: "/kriya-yoga" },
  { label: bi("Science of Kriya Yoga", "யோக அறிவியல்"), to: "/science-of-kriya-yoga" },
  { label: bi("The Kriya Lab", "தி கிரியா லேப்"), to: "/the-kriya-lab" },
  { label: bi("Guru Lineage", "குரு பரம்பரை"), to: "/lineage" },
  { label: bi("About the Teacher", "ஆசிரியர் பற்றி"), to: "/about" },
];

function LanguageSwitcher({ className, isTransparent }: { className?: string; isTransparent?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs tracking-wider transition-all",
        isTransparent
          ? "border-white/20 bg-white/10 text-white backdrop-blur-sm"
          : "border-border bg-secondary/50 text-foreground",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={cn(
          "px-1 font-medium transition-colors",
          lang === "en"
            ? isTransparent
              ? "text-gold"
              : "text-primary font-semibold"
            : isTransparent
              ? "text-white/60 hover:text-white"
              : "text-muted-foreground hover:text-foreground",
        )}
      >
        EN
      </button>
      <span aria-hidden="true" className={isTransparent ? "text-white/30" : "text-border"}>
        |
      </span>
      <button
        type="button"
        onClick={() => setLang("ta")}
        aria-pressed={lang === "ta"}
        className={cn(
          "px-1 font-medium transition-colors",
          lang === "ta"
            ? isTransparent
              ? "text-gold"
              : "text-primary font-semibold"
            : isTransparent
              ? "text-white/60 hover:text-white"
              : "text-muted-foreground hover:text-foreground",
        )}
      >
        தமிழ்
      </button>
    </div>
  );
}

function AccountLink({
  className,
  onClick,
  isTransparent,
}: {
  className?: string;
  onClick?: () => void;
  isTransparent?: boolean;
}) {
  const { t } = useLang();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <Link
      to="/auth"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-[0.82rem] tracking-wide transition-colors font-medium hover:text-gold",
        isTransparent ? "text-white/90 hover:text-gold" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <User className="size-3.5 text-gold/90" />
      <span>{t(bi("Sign in", "உள்நுழை"))}</span>
    </Link>
  );
}

export function Header() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Prevent background body scroll when full luxury menu drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle scroll trigger for navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isTransparent = isHome && !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "top-0 z-40 transition-all duration-300",
          isHome ? "fixed inset-x-0" : "sticky",
          isTransparent
            ? "border-b border-white/10 bg-gradient-to-b from-black/85 via-black/40 to-transparent backdrop-blur-xs text-white"
            : "border-b border-border/60 bg-background/90 backdrop-blur-xl text-foreground shadow-xs",
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-20 w-full items-center justify-between px-3 sm:px-5 lg:px-6 transition-all max-w-[1560px]",
          )}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            className="group flex flex-shrink-0 flex-col justify-center leading-none min-w-max mr-2 sm:mr-3"
            onClick={() => setOpen(false)}
          >
            <span
              className={cn(
                "font-serif tracking-[0.18em] transition-colors whitespace-nowrap",
                lang === "ta" ? "text-base sm:text-lg lg:text-xl" : "text-lg sm:text-xl lg:text-2xl",
                isTransparent ? "text-white" : "text-foreground",
              )}
            >
              {settings.brand}
            </span>
            <span
              className={cn(
                "mt-0.5 block transition-colors whitespace-nowrap",
                lang === "ta" ? "text-[0.50rem] sm:text-[0.56rem] tracking-[0.14em]" : "text-[0.50rem] sm:text-[0.56rem] tracking-[0.24em]",
                isTransparent ? "text-gold/90" : "text-muted-foreground",
              )}
            >
              {t(settings.tagline).toUpperCase()}
            </span>
          </Link>

          {/* Desktop Primary Nav + Menu Trigger (5 key items + Explore All) */}
          <div className="hidden xl:flex items-center gap-3 2xl:gap-5">
            <nav className={cn("flex items-center", lang === "ta" ? "gap-2 xl:gap-2.5 2xl:gap-4" : "gap-2.5 xl:gap-3.5 2xl:gap-4.5")} aria-label="Primary">
              {primaryHeaderNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "tracking-wide transition-colors font-medium hover:text-gold whitespace-nowrap",
                    lang === "ta" ? "text-[0.74rem] 2xl:text-[0.78rem]" : "text-[0.78rem] 2xl:text-[0.82rem]",
                    isTransparent
                      ? "text-white/85 [&.active]:text-gold font-light"
                      : "text-foreground/80 [&.active]:text-primary",
                  )}
                >
                  {t(item.label)}
                </Link>
              ))}
            </nav>

            {/* Explore All / Menu Button (Option B) */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.75rem] font-medium tracking-wide transition-all hover:scale-105 whitespace-nowrap",
                isTransparent
                  ? "border-gold/40 bg-white/10 text-white hover:border-gold hover:bg-gold/20"
                  : "border-border bg-secondary/80 text-foreground hover:border-primary/40 hover:bg-secondary",
              )}
              aria-label="Open Explore Menu"
            >
              <Menu className="size-3 text-gold" />
              <span>{t(bi("Explore All", "அனைத்தும்"))}</span>
            </button>
          </div>

          {/* Right Controls */}
          <div className={cn("hidden items-center sm:flex", lang === "ta" ? "gap-2 xl:gap-2.5" : "gap-2.5 xl:gap-3.5")}>
            <LanguageSwitcher isTransparent={isTransparent} />
            <AccountLink isTransparent={isTransparent} />
            <WhatsAppButton
              variant="ghost"
              label=""
              className={cn("px-1", isTransparent && "text-white hover:text-white hover:bg-white/10")}
            />
            <Link
              to="/programs"
              className={cn(
                "rounded-full font-medium transition-all shadow-xs whitespace-nowrap flex-shrink-0",
                lang === "ta" ? "px-3.5 py-1.5 text-[0.75rem] 2xl:text-[0.78rem]" : "px-4 sm:px-5 py-2 text-[0.80rem]",
                isTransparent
                  ? "bg-gold text-velvet-deep hover:bg-gold/90 hover:shadow-md"
                  : "bg-velvet text-primary-foreground hover:bg-primary",
              )}
            >
              {t(ui.begin)}
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-lg p-2 xl:hidden transition-colors",
              isTransparent ? "text-white bg-white/10" : "text-foreground bg-secondary",
            )}
            aria-label="Open Menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6 text-gold" />
          </button>
        </div>
      </header>

      {/* 🌟 Luxury Full Slide Drawer (Option B) 🌟 */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Content Panel */}
          <div className="relative z-50 flex h-full w-full max-w-2xl flex-col bg-velvet-deep text-[oklch(0.96_0.01_300)] shadow-2xl border-l border-gold/20 overflow-y-auto">
            {/* Drawer Top Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-velvet-deep/95 px-6 py-5 backdrop-blur-lg">
              <div>
                <span className="font-serif text-xl tracking-[0.2em] text-white">
                  {settings.brand}
                </span>
                <p className="text-[0.6rem] tracking-[0.25em] text-gold mt-0.5">
                  {t(settings.tagline).toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <LanguageSwitcher isTransparent={true} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close Menu"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            {/* Categorized Navigation Columns */}
            <div className="flex-1 space-y-10 px-6 py-8 sm:px-10">
              {navigationGroups.map((group, idx) => {
                const Icon = group.icon;
                return (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-gold/20 pb-2">
                      <Icon className="size-4 text-gold" />
                      <h3 className="font-serif text-sm tracking-widest text-gold uppercase">
                        {t(group.title)}
                      </h3>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-1">
                      {group.links.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className="group flex items-start justify-between rounded-xl p-3 transition-all hover:bg-white/5"
                        >
                          <div className="space-y-0.5">
                            <span className="font-serif text-lg text-white group-hover:text-gold transition-colors">
                              {t(item.label)}
                            </span>
                            <p className="text-xs text-[oklch(0.8_0.02_300)] font-light leading-relaxed">
                              {t(item.sub)}
                            </p>
                          </div>
                          <ArrowRight className="size-4 text-gold/40 transition-transform group-hover:translate-x-1 group-hover:text-gold mt-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Bottom Actions */}
            <div className="sticky bottom-0 border-t border-white/10 bg-velvet-deep/95 p-6 backdrop-blur-lg sm:px-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <AccountLink isTransparent={true} onClick={() => setOpen(false)} />
                <WhatsAppButton
                  variant="line"
                  className="border-gold/40 text-white hover:border-gold hover:text-gold hover:bg-white/5"
                />
                <Link
                  to="/programs"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-gold px-6 py-3 text-center text-sm font-medium text-velvet-deep transition-all hover:bg-gold/90 shadow-md"
                >
                  {t(ui.begin)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
