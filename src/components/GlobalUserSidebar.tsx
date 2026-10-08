import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { useLang, bi } from "@/lib/i18n";
import { Home, Compass, Calendar, BookOpen, LogOut, Settings, Award, History, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalUserSidebar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const location = useRouterState({ select: (s) => s.location });

  const navItems = [
    { name: t(bi("Home", "முகப்பு")), to: "/", icon: Home },
    { name: t(bi("Programs", "பயிற்சிகள்")), to: "/programs", icon: Compass },
    { name: t(bi("Events", "நிகழ்வுகள்")), to: "/events", icon: Calendar },
    { name: t(bi("My Programs", "என் பயிற்சிகள்")), to: "/dashboard", icon: BookOpen },
  ];

  const bottomNavItems = [
    { name: t(bi("Settings", "அமைப்புகள்")), to: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-[#111116] text-white/90 h-screen fixed top-0 left-0 border-r border-white/5 shadow-2xl shrink-0 overflow-hidden z-50">
      <div className="p-6 pb-2">
        <Link to="/" className="text-xl font-serif text-gold tracking-wide">
          THE KRIYA LAB
        </Link>
        <div className="mt-8 mb-4">
           <p className="text-[0.65rem] font-bold tracking-[0.2em] text-white/30 uppercase">Main Menu</p>
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
                  ? "bg-gold/10 text-gold shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("size-5", isActive ? "text-gold" : "text-white/40")} />
              <span className="text-[0.95rem]">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 pb-2">
           <p className="text-[0.65rem] font-bold tracking-[0.2em] text-white/30 uppercase px-2">Account</p>
        </div>
        
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/50 hover:text-white/90 hover:bg-white/5"
              )}
            >
              <Icon className="size-4 text-white/40" />
              <span className="text-[0.85rem]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto bg-black/20">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="size-10 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 border border-gold/20 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gold font-bold text-lg">
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate">{user?.full_name || "User"}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="mt-3 flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors font-medium text-sm border border-red-500/10"
        >
          <LogOut className="size-4" />
          <span>{t(bi("Sign Out", "வெளியேறு"))}</span>
        </button>
      </div>
    </aside>
  );
}
