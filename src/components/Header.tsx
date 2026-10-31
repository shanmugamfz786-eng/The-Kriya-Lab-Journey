import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  X,
  ArrowRight,
  User,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Settings,
  Edit3,
  KeyRound,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { settings, ui } from "@/content/site";
import { bi, useLang } from "@/lib/i18n";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useAuth, getStoredUser } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { CountryCurrencySwitcher } from "@/components/CountryCurrencySwitcher";

/** Grouped navigation items for the comprehensive Luxury Drawer */
const navigationGroups = [
  {
    title: bi("Wisdom & Tradition", "ஞானமும் மரபும்"),
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
    ],
  },
  {
    title: bi("Insights & Support", "அறிந்து கொள்ளுங்கள்"),
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

/** Fast-access links for logged in users */
const loggedInNav = [
  { label: bi("Home", "முகப்பு"), to: "/" },
  { label: bi("Programs", "பயிற்சிகள்"), to: "/programs" },
  { label: bi("Events", "நிகழ்வுகள்"), to: "/events" },
  { label: bi("My Programs", "என் சாதனைகள்"), to: "/dashboard" },
];

/** Fast-access links for public users */
const loggedOutNav = [
  { label: bi("Kriya Yoga", "கிரியா யோகம்"), to: "/kriya-yoga" },
  { label: bi("Science of Kriya Yoga", "கிரியா யோக அறிவியல்"), to: "/science-of-kriya-yoga" },
  { label: bi("The Kriya Lab", "தி கிரியா லேப்"), to: "/the-kriya-lab" },
  { label: bi("Siddha Tradition", "சித்தர் மரபு"), to: "/siddha-tradition" },
  { label: bi("Guru Lineage", "குரு பரம்பரை"), to: "/lineage" },
  { label: bi("All Programs", "அனைத்து நிகழ்ச்சிகள்"), to: "/programs" },
  { label: bi("About the Teacher", "ஆசிரியர் பற்றி"), to: "/about" },
];

function LanguageSwitcher({ className, isTransparent }: { className?: string; isTransparent?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] tracking-wider transition-all",
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
          "px-0.5 font-medium transition-colors",
          lang === "en"
            ? isTransparent
              ? "text-gold"
              : "text-primary"
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
          "px-0.5 font-medium transition-colors",
          lang === "ta"
            ? isTransparent
              ? "text-gold"
              : "text-primary"
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
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveUser = mounted ? (user || (typeof window !== "undefined" ? getStoredUser() : null)) : null;
  const effectiveAuth = mounted && (isAuthenticated || Boolean(effectiveUser));

  if (mounted && effectiveAuth && effectiveUser) {
    const initial = (effectiveUser.full_name || effectiveUser.email || "U").charAt(0).toUpperCase();

    return (
      <Link
        to="/profile"
        onClick={onClick}
        title={t(bi("Personal Profile & Details", "தனிப்பட்ட விவரங்கள்"))}
        aria-label={t(bi("Personal Profile & Details", "தனிப்பட்ட விவரங்கள்"))}
        className={cn(
          "flex items-center justify-center rounded-full p-1 transition-all border shadow-xs cursor-pointer group",
          isTransparent
            ? "bg-white/10 text-white border-gold/40 hover:bg-gold/20 hover:border-gold hover:text-gold"
            : "bg-gold/10 text-foreground border-gold/30 hover:bg-gold/20 hover:border-gold",
          className,
        )}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/25 text-gold border border-gold/40 overflow-hidden shrink-0 font-bold text-[0.7rem] group-hover:scale-105 transition-transform">
          {effectiveUser.avatar ? (
            <img src={effectiveUser.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/auth"
      search={{ mode: "signup" }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-[0.75rem] tracking-wide transition-colors font-medium hover:text-gold",
        isTransparent ? "text-white/90 hover:text-gold" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <User className="size-3 text-gold/90" />
      <span>{t(bi("Sign In / Sign Up", "உள்நுழை / பதிவு செய்"))}</span>
    </Link>
  );
}

export function Header() {
  const { t, lang } = useLang();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const authMode = (location.search as any)?.mode || "signin";

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
      // Find the 'Why we practise' section by ID
      const whyWePractiseSection = document.getElementById("why-we-practise");
      
      if (whyWePractiseSection) {
        // Change to solid when the 'Why we practise' section touches the navbar (64px from top)
        const rect = whyWePractiseSection.getBoundingClientRect();
        setScrolled(rect.top <= 64);
      } else {
        // Fallback for other pages
        setScrolled(window.scrollY > 30);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isTransparent = isHome && !scrolled && !open && !isAuthenticated;

  return (
    <>
      <header
        className={cn(
          "top-0 z-40 transition-all duration-500 w-full",
          isHome ? "fixed inset-x-0" : "sticky",
          isTransparent
            ? "border-b border-white/10 bg-black/10 backdrop-blur-md text-white"
            : "border-b border-border/40 bg-background/90 backdrop-blur-xl text-foreground shadow-sm",
        )}
      >
        <div className="mx-auto flex h-14 lg:h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 transition-all">
          
          {/* Left: Brand Logo */}
          <Link
            to="/"
            className="group flex flex-shrink-0 items-center gap-2.5 min-w-max"
            onClick={() => setOpen(false)}
          >
            <div className="flex flex-col justify-center leading-none">
              <span
                className={cn(
                  "font-serif transition-colors whitespace-nowrap",
                  lang === "ta" 
                    ? "text-sm lg:text-base tracking-wide" 
                    : "text-base lg:text-lg font-medium tracking-[0.12em]",
                  isTransparent ? "text-white" : "text-foreground",
                )}
              >
                {settings.brand}
              </span>
            </div>
          </Link>

          {/* Center: Primary Navigation (Desktop) */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-2.5 xl:gap-4 2xl:gap-5 mx-2" aria-label="Primary">
            {loggedOutNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className={cn(
                  "text-[0.74rem] xl:text-[0.78rem] 2xl:text-[0.82rem] whitespace-nowrap tracking-wide font-medium transition-all hover:-translate-y-0.5",
                  isTransparent
                    ? "text-white/80 hover:text-gold [&.active]:text-gold [&.active]:font-semibold"
                    : "text-muted-foreground hover:text-foreground [&.active]:text-black [&.active]:font-bold",
                )}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>

          {/* Right: Tools & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 pl-2 sm:pl-3 lg:pl-4 border-l border-white/10 shrink-0">
            {/* Country & Currency Switcher (Always visible with verified status) */}
            <div className="flex items-center">
              <CountryCurrencySwitcher isTransparent={isTransparent} />
            </div>

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher isTransparent={isTransparent} />
            </div>

            {/* Account (Desktop) */}
            <div className="hidden sm:block">
              <AccountLink isTransparent={isTransparent} />
            </div>

            {/* Mobile Actions (Account / Register) */}
            <div className="block sm:hidden">
              <AccountLink isTransparent={isTransparent} />
            </div>

            {/* Hamburger / Menu Trigger */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all hover:scale-105 border",
                isTransparent
                  ? "bg-white/10 text-white border-white/20 hover:bg-gold hover:text-velvet-deep hover:border-gold"
                  : "bg-secondary text-foreground border-border hover:bg-primary hover:text-primary-foreground",
              )}
              aria-label="Open Explore Menu"
            >
              <Menu className="size-3.5" />
              <span className="text-[0.7rem] font-medium hidden sm:inline-block uppercase tracking-wider">{t(bi("Menu", "மெனு"))}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 Luxury Full Slide Drawer (Option B) 🌟 */}
      {open && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity touch-none"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Content Panel */}
          <div className="relative z-[100] flex h-full w-full max-w-full sm:max-w-sm flex-col bg-velvet-deep text-[oklch(0.96_0.01_300)] shadow-2xl border-l border-gold/20">
            {/* Drawer Top Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-white/10 bg-velvet-deep/95 px-4 sm:px-6 py-4 sm:py-5 backdrop-blur-lg">
              <div>
                <span className="font-serif text-xl tracking-[0.2em] text-white">
                  {settings.brand}
                </span>
                <p className="text-[0.6rem] tracking-[0.25em] text-gold mt-0.5">
                  {t(settings.tagline).toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2">
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
            <div className="flex-1 overflow-y-auto overscroll-contain space-y-8 px-4 py-6 sm:px-6">
              {navigationGroups.map((group, idx) => {
                return (
                  <div key={idx} className="space-y-4">
                    <div className="border-b border-gold/20 pb-2">
                      <h3 className="font-serif text-sm tracking-widest text-gold uppercase">
                        {t(group.title)}
                      </h3>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-1">
                      {group.links.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          activeOptions={{ exact: item.to === "/" }}
                          onClick={() => setOpen(false)}
                          className="group flex items-start justify-between rounded-xl p-3 transition-all hover:bg-white/5 [&.active]:bg-white/10"
                        >
                          <div className="space-y-0.5">
                            <span className="font-serif text-lg text-white group-hover:text-gold group-[.active]:text-gold group-[.active]:font-bold transition-colors">
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
              
              {isAuthenticated && (
                <div className="pt-4 mt-4 border-t border-gold/20">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      logout("/auth?mode=signin");
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-3 text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="size-5" />
                      <span className="font-serif text-lg">{t(bi("Sign Out", "வெளியேறு"))}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
