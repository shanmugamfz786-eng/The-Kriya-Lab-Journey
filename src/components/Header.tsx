import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  X,
  ArrowRight,
  Compass,
  Sparkles,
  BookOpen,
  User,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { settings, ui } from "@/content/site";
import { bi, useLang } from "@/lib/i18n";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useAuth } from "@/lib/auth-store";
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
          "px-1 font-medium transition-colors",
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
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (isAuthenticated && user) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={cn(
            "flex items-center gap-2 rounded-full py-1 px-2 transition-all",
            isTransparent
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-secondary/80 text-foreground hover:bg-secondary",
            className,
          )}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold">
            <User className="size-3.5" />
          </div>
          <span className="text-xs font-semibold max-w-[100px] truncate">
            {user.full_name.split(" ")[0]}
          </span>
          <ChevronDown className="size-3 opacity-70" />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-gold/20 bg-velvet-deep text-white py-2 shadow-2xl animate-in fade-in-50 zoom-in-95">
              <div className="border-b border-white/10 px-4 py-2.5">
                <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                <p className="text-[0.68rem] text-gold truncate">{user.email}</p>
                <span className="mt-1 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[0.6rem] font-semibold text-gold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>

              <div className="py-1 text-xs">
                <Link
                  to="/dashboard"
                  onClick={() => {
                    setDropdownOpen(false);
                    onClick?.();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-white/90 hover:bg-white/10 hover:text-gold transition-colors"
                >
                  <LayoutDashboard className="size-4 text-gold" />
                  <span>User Dashboard</span>
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => {
                      setDropdownOpen(false);
                      onClick?.();
                    }}
                    className="flex items-center gap-2.5 px-4 py-2 text-white/90 hover:bg-white/10 hover:text-gold transition-colors"
                  >
                    <ShieldCheck className="size-4 text-gold" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <Link
                  to="/my-programs"
                  onClick={() => {
                    setDropdownOpen(false);
                    onClick?.();
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-white/90 hover:bg-white/10 hover:text-gold transition-colors"
                >
                  <Compass className="size-4 text-gold" />
                  <span>My Sadhana</span>
                </Link>
              </div>

              <div className="border-t border-white/10 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    navigate({ to: "/", replace: true });
                    onClick?.();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="size-4" />
                  <span>{t(bi("Sign Out", "வெளியேறு"))}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

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
        // Change to solid when the 'Why we practise' section touches the navbar (80px from top)
        const rect = whyWePractiseSection.getBoundingClientRect();
        setScrolled(rect.top <= 80);
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
        <div className="mx-auto flex h-20 w-full max-w-[1560px] items-center justify-between px-4 sm:px-6 lg:px-8 transition-all">
          
          {/* Left: Brand Logo */}
          <Link
            to="/"
            className="group flex flex-shrink-0 items-center gap-3 min-w-max"
            onClick={() => setOpen(false)}
          >
            <div className="flex flex-col justify-center leading-none">
              <span
                className={cn(
                  "font-serif tracking-[0.1em] transition-colors whitespace-nowrap",
                  lang === "ta" ? "text-base lg:text-lg" : "text-xl lg:text-2xl font-medium",
                  isTransparent ? "text-white" : "text-foreground",
                )}
              >
                {settings.brand}
              </span>
            </div>
          </Link>

          {/* Center: Primary Navigation (Desktop) */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-4 xl:gap-6 mx-2" aria-label="Primary">
            {(isAuthenticated ? loggedInNav : loggedOutNav)
              .map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className={cn(
                  "text-[0.85rem] xl:text-[0.92rem] whitespace-nowrap tracking-wide font-medium transition-all hover:-translate-y-0.5",
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
          <div className="flex items-center gap-2 sm:gap-4 pl-4 border-l border-white/10 shrink-0">
            {/* Search */}
            <div className="hidden sm:block">
              <GlobalSearch isTransparent={isTransparent} />
            </div>

            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher isTransparent={isTransparent} />
            </div>

            {/* Account (Desktop) */}
            <div className="hidden sm:block">
              <AccountLink isTransparent={isTransparent} />
            </div>

            {/* Mobile Actions (Register / Dashboard) */}
            <div className="block sm:hidden">
              {!isAuthenticated ? (
                  <Link
                    to="/auth"
                    search={{ mode: "signup" }}
                    className={cn(
                      "text-[0.65rem] font-semibold px-3 py-1.5 rounded-full transition-all uppercase tracking-wider",
                      isTransparent
                        ? "bg-gold text-[#1a140b] hover:bg-gold/90 shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                        : "bg-[#d4af37] text-white hover:bg-[#c5a030] shadow-md"
                    )}
                  >
                    {t(bi("Sign In / Sign Up", "உள்நுழை / பதிவு செய்"))}
                  </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className={cn(
                    "flex items-center justify-center size-8 rounded-full transition-all border",
                    isTransparent
                      ? "bg-white/10 text-gold border-gold/30 hover:bg-white/20"
                      : "bg-secondary text-primary border-border hover:bg-secondary/80"
                  )}
                >
                  <User className="size-4" />
                </Link>
              )}
            </div>

            {/* Hamburger / Menu Trigger */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:scale-105 border",
                isTransparent
                  ? "bg-white/10 text-white border-white/20 hover:bg-gold hover:text-velvet-deep hover:border-gold"
                  : "bg-secondary text-foreground border-border hover:bg-primary hover:text-primary-foreground",
              )}
              aria-label="Open Explore Menu"
            >
              <Menu className="size-4" />
              <span className="text-xs font-semibold hidden sm:inline-block uppercase tracking-wider">{t(bi("Menu", "மெனு"))}</span>
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
            <div className="flex-1 overflow-y-auto overscroll-contain space-y-8 px-4 py-6 sm:px-6">
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
                      logout();
                      navigate({ to: "/", replace: true });
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
