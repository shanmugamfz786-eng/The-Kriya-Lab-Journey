import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { useLang, bi } from "@/lib/i18n";
import {
  Home,
  Compass,
  Calendar,
  BookOpen,
  Settings,
  User,
  Edit3,
  KeyRound,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalUserSidebar() {
  const { user } = useAuth();
  const { t } = useLang();
  const location = useRouterState({ select: (s) => s.location });

  const navItems = [
    { name: t(bi("Home", "முகப்பு")), to: "/", icon: Home },
    { name: t(bi("Programs", "பயிற்சிகள்")), to: "/programs", icon: Compass },
    { name: t(bi("Events", "நிகழ்வுகள்")), to: "/events", icon: Calendar },
    { name: t(bi("My Programs", "என் பயிற்சிகள்")), to: "/dashboard", icon: BookOpen },
    { name: t(bi("Contact & Enquiries", "வினவல்கள் & உதவி")), to: "/support", icon: MessageSquare },
  ];

  const settingsSubItems = [
    { name: t(bi("Personal Profile", "தனிப்பட்ட விவரங்கள்")), to: "/profile", icon: User },
    { name: t(bi("Change Your Details", "விவரங்களை மாற்றவும்")), to: "/settings", icon: Edit3 },
    { name: t(bi("Security & Password", "பாதுகாப்பு & கடவுச்சொல்")), to: "/security", icon: KeyRound },
  ];

  const isSettingsActive = ["/profile", "/settings", "/security"].some((path) =>
    location.pathname.startsWith(path)
  );

  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true);
    }
  }, [isSettingsActive]);

  return (
    <aside className="hidden md:flex w-64 flex-col bg-gradient-to-b from-[#2a132f] via-[#1c0d20] to-[#100514] text-white/90 h-screen fixed top-0 left-0 border-r border-gold/15 shadow-2xl shrink-0 overflow-hidden z-50">
      <div className="p-6 pb-2">
        <Link to="/" className="text-xl font-serif text-gold tracking-wide drop-shadow-xs">
          THE KRIYA LAB
        </Link>
        <div className="mt-8 mb-4">
          <p className="text-[0.65rem] font-bold tracking-[0.2em] text-gold/60 uppercase">Main Menu</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium",
                isActive
                  ? "bg-gold/15 text-gold border border-gold/30 shadow-[0_2px_10px_rgba(212,175,55,0.08)]"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className={cn("size-5", isActive ? "text-gold" : "text-white/45")} />
              <span className="text-[0.95rem]">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 pb-2">
          <p className="text-[0.65rem] font-bold tracking-[0.2em] text-gold/60 uppercase px-2">Account</p>
        </div>

        {/* Settings Parent Menu with 3 Nested Options */}
        <div>
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 font-medium cursor-pointer text-left",
              isSettingsActive
                ? "bg-gold/15 text-gold border border-gold/30 shadow-[0_2px_10px_rgba(212,175,55,0.08)]"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <Settings className={cn("size-4.5", isSettingsActive ? "text-gold" : "text-white/50")} />
              <span className="text-[0.9rem]">{t(bi("Settings", "அமைப்புகள்"))}</span>
            </div>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200 opacity-70",
                settingsOpen ? "rotate-180 text-gold" : ""
              )}
            />
          </button>

          {/* Submenu containing the 3 options */}
          {settingsOpen && (
            <div className="mt-1.5 ml-3 pl-3 border-l border-gold/25 space-y-1 animate-in fade-in-50 duration-200">
              {settingsSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium",
                      isActive
                        ? "bg-gold text-velvet-deep font-semibold shadow-xs"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className={cn("size-3.5", isActive ? "text-velvet-deep" : "text-gold/80")} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto bg-black/30 backdrop-blur-xs">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="size-10 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 border border-gold/30 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gold font-bold text-lg">
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/95 truncate">{user?.full_name || "User"}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
