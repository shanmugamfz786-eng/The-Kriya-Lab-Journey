import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Calendar, BookOpen, User } from "lucide-react";
import { useLang, bi } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";

export function DesktopSideNav() {
  const location = useRouterState({ select: (s) => s.location });
  const { t } = useLang();
  const { isAuthenticated } = useAuth();
  
  const navItems = [
    {
      label: bi("Home", "முகப்பு"),
      icon: Home,
      to: "/",
    },
    {
      label: bi("Programs", "பயிற்சிகள்"),
      icon: Compass,
      to: "/programs",
    },
    {
      label: bi("Events", "நிகழ்வுகள்"),
      icon: Calendar,
      to: "/events",
    },
    {
      label: bi("My Programs", "என் சாதனைகள்"),
      icon: BookOpen,
      to: "/dashboard",
    },
    {
      label: bi("Profile", "பயனர்"),
      icon: User,
      to: isAuthenticated ? "/profile" : "/auth",
    },
  ];

  return (
    <div className="hidden md:flex fixed top-0 left-0 z-40 h-full w-[5rem] flex-col border-r border-border bg-background pt-[5rem]">
      <div className="flex flex-1 flex-col items-center gap-8 py-8">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
          
          return (
            <Link
              key={idx}
              to={item.to}
              className={cn(
                "group relative flex w-full flex-col items-center justify-center gap-1.5 transition-colors",
                isActive ? "text-[oklch(0.45_0.055_45)]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active Left Border */}
              {isActive && (
                <div className="absolute top-1/2 left-0 h-8 -translate-y-1/2 w-[3px] bg-[oklch(0.45_0.055_45)] rounded-r-sm" />
              )}
              
              <Icon className={cn("size-[1.4rem]", isActive ? "stroke-[2.5px]" : "stroke-[1.8px]", "group-hover:scale-110 transition-transform")} />
              
              <span className="text-[0.6rem] font-bold tracking-wider uppercase text-center w-full px-1">
                {t(item.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
