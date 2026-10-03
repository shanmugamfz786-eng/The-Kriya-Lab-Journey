import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Calendar, BookOpen, User } from "lucide-react";
import { useLang, bi } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";

export function MobileBottomNav() {
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
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background xl:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex h-[4.25rem] items-center justify-around">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
          
          return (
            <Link
              key={idx}
              to={item.to}
              className={cn(
                "relative flex h-full w-full flex-col items-center justify-center gap-1.5 transition-colors",
                isActive ? "text-[oklch(0.45_0.055_45)]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active Top Border */}
              {isActive && (
                <div className="absolute top-0 left-1/2 w-8 -translate-x-1/2 h-[3px] bg-[oklch(0.45_0.055_45)] rounded-b-sm" />
              )}
              
              <Icon className={cn("size-[1.35rem]", isActive ? "stroke-[2.5px]" : "stroke-[1.8px]")} />
              
              <span className="text-[0.6rem] font-bold tracking-wider uppercase">
                {t(item.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
