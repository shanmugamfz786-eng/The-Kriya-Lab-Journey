import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Maximize2,
  Layers,
  LucideIcon,
  ChevronRight,
  PlusCircle,
  History,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface VelzonLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  href: string;
  subItems?: { name: string; href: string; icon?: LucideIcon }[];
}

export function VelzonLayout({ children }: VelzonLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(true);
  const [programsExpanded, setProgramsExpanded] = useState(true);

  const pathname = location.pathname;

  const navItems: NavItem[] = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { id: "users", name: "Users", icon: Users, href: "/admin/users" },
    { 
      id: "programs", 
      name: "Programs", 
      icon: Layers, 
      href: "/admin/programs/online",
      subItems: [
        { name: "Add Program", href: "/admin/programs/add", icon: PlusCircle },
        { name: "Online Programs", href: "/admin/programs/online" },
        { name: "Offline Programs", href: "/admin/programs/offline" },
      ],
    },
    {
      id: "events",
      name: "Events",
      icon: Calendar,
      href: "/admin/events/future",
      subItems: [
        { name: "Add Event", href: "/admin/events/add", icon: PlusCircle },
        { name: "All Past Events", href: "/admin/events/past", icon: History },
        { name: "All Future Events", href: "/admin/events/future", icon: Sparkles },
      ],
    },
    { id: "settings", name: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  const isNavActive = (item: NavItem) => {
    if (item.id === "dashboard") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    if (item.id === "events") {
      return pathname.startsWith("/admin/events");
    }
    if (item.id === "programs") {
      return pathname.startsWith("/admin/programs");
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className="h-screen bg-[#f4f6fa] text-[#495057] font-['Poppins',sans-serif] antialiased flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="shrink-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#eef0f5] bg-white px-4 lg:px-6 shadow-xs">
        {/* Left Side: Hamburger & Search */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="size-5" />
          </button>

          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in admin portal..."
              className="h-9 w-64 lg:w-72 rounded-lg border border-gray-200 bg-[#f8f9fa] pl-9 pr-4 text-xs font-medium focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Right Side: Action Icons + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#334d84] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            <span>Live Website</span>
          </Link>

          {/* Fullscreen icon */}
          <button
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="hidden sm:flex rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="size-4" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ab39c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ab39c]"></span>
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            className="hidden sm:flex rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Toggle Theme"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 rounded-full p-1 pr-2 hover:bg-gray-100 transition-colors"
            >
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={user?.full_name || "User Avatar"}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-[#334d84]/20"
              />
              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {user?.full_name || "Rishi"}
                </p>
                <p className="text-[0.65rem] text-gray-400 capitalize font-medium">
                  {user?.role || "Admin"}
                </p>
              </div>
              <ChevronDown className="size-3.5 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl animate-in fade-in-50 zoom-in-95 font-['Poppins',sans-serif]">
                  <div className="border-b border-gray-100 px-4 py-2.5">
                    <p className="text-xs font-bold text-gray-800">
                      {user?.full_name || "Rishi Admin"}
                    </p>
                    <p className="text-[0.68rem] text-gray-400 truncate">
                      {user?.email || "admin@thekriyalab.com"}
                    </p>
                  </div>
                  <div className="py-1 text-xs text-gray-700">
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-[#334d84] transition-colors"
                    >
                      <ShieldCheck className="size-4 text-gray-400" />
                      <span>Admin Control Center</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        window.location.href = "/";
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="size-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Professional Blue Sidebar (Velzon Style) */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex flex-col bg-[#405189] text-[#abb9e8] transition-all duration-300 lg:static lg:z-50 shadow-lg h-full",
            sidebarOpen ? "w-64" : "w-0 lg:w-20",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          {/* Sidebar Top Brand Header */}
          <div className="flex h-16 items-center justify-center border-b border-white/5 bg-[#405189]">
            <Link to="/admin" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              {sidebarOpen ? (
                <span className="font-bold text-lg tracking-widest text-white uppercase block leading-tight">
                  THE KRIYA LAB
                </span>
              ) : (
                <span className="font-bold text-xl tracking-widest text-white uppercase block leading-tight">
                  KL
                </span>
              )}
            </Link>
          </div>

          {/* Clean 5-Item Navigation Links with Individual Dedicated Routes */}
          <div className={cn(
            "flex-1 py-4 space-y-1 scrollbar-thin font-['Poppins',sans-serif]",
            sidebarOpen ? "overflow-y-auto" : "overflow-visible"
          )}>
            {sidebarOpen && (
              <div className="px-5 py-3 text-[11px] font-semibold tracking-wider text-[#838fb9] uppercase">
                Menu
              </div>
            )}
            
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavActive(item);
              const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);

              if (hasSubItems) {
                return (
                  <div key={item.id} className="space-y-1 relative group/navitem">
                    <div
                      onClick={() => {
                        if (item.id === "events") setEventsExpanded(!eventsExpanded);
                        if (item.id === "programs") setProgramsExpanded(!programsExpanded);
                      }}
                      className={cn(
                        "group flex w-full items-center justify-between px-5 py-2.5 text-[0.9rem] font-medium transition-all cursor-pointer select-none",
                        isActive
                          ? "text-white"
                          : "text-[#abb9e8] hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isActive ? "text-white" : "text-[#838fb9] group-hover:text-white"
                          )}
                        />
                        {sidebarOpen && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>
                      {sidebarOpen && (
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform text-[#9cb3e6] group-hover:text-white",
                            (item.id === "events" ? eventsExpanded : programsExpanded) ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      )}
                    </div>

                    {/* Dedicated Submenu Routes (Desktop expanded) */}
                    {sidebarOpen && (item.id === "events" ? eventsExpanded : programsExpanded) && (
                      <div className="ml-9 border-l border-white/10 space-y-0.5 py-1 animate-in fade-in-50">
                        {item.subItems!.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              to={sub.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex w-full items-center gap-3 px-5 py-2 text-[13px] font-medium transition-all text-left relative",
                                isSubActive
                                  ? "text-white"
                                  : "text-[#abb9e8] hover:text-white"
                              )}
                            >
                              {isSubActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-white" />
                              )}
                              <span>{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {/* Popout menu on hover when sidebar is closed */}
                    {!sidebarOpen && (
                      <div className="absolute left-full top-0 ml-1 hidden w-48 rounded-lg bg-[#405189] p-2 shadow-xl group-hover/navitem:block z-50 border border-white/10 animate-in fade-in zoom-in-95">
                        <div className="mb-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white border-b border-white/10">
                          {item.name}
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {item.subItems!.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                to={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  "flex w-full items-center gap-3 px-3 py-2 text-[13px] font-medium transition-all rounded-md",
                                  isSubActive
                                    ? "bg-white/10 text-white"
                                    : "text-[#abb9e8] hover:bg-white/5 hover:text-white"
                                )}
                              >
                                <span>{sub.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.id} className="relative group/navitem">
                  <Link
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "group flex w-full items-center gap-3.5 px-5 py-2.5 text-[0.9rem] font-medium transition-all text-left cursor-pointer relative",
                      isActive
                        ? "text-white bg-white/5"
                        : "text-[#abb9e8] hover:text-white hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#0ab39c]" />
                    )}
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive ? "text-white" : "text-[#838fb9] group-hover:text-white"
                      )}
                    />
                    {sidebarOpen && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                  </Link>

                  {/* Tooltip for standard items when sidebar is closed */}
                  {!sidebarOpen && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1 hidden rounded-md bg-[#405189] px-3 py-1.5 shadow-xl group-hover/navitem:block z-50 border border-white/10 animate-in fade-in zoom-in-95 whitespace-nowrap">
                      <span className="text-[13px] font-medium text-white">{item.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer (Hidden in standard Velzon, but kept minimal here) */}
          {sidebarOpen && (
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
                    alt="User"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#0ab39c] ring-2 ring-[#405189]" />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.full_name || "Rishi"}
                  </p>
                  <p className="text-[11px] text-[#838fb9] truncate font-medium">
                    {user?.role === "admin" ? "Super Admin" : "Initiated Seeker"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Clean Main Content Container without duplicate top headers */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#f4f6fa]">
          {children}
        </main>
      </div>
    </div>
  );
}
