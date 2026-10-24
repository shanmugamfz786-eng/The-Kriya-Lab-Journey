import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import {
  User,
  Mail,
  Edit3,
  KeyRound,
  CheckCircle2,
  Globe,
  Bell,
  ArrowRight,
  BookOpen,
  LogOut,
} from "lucide-react";
import { AccountNavTabs } from "@/components/AccountNavTabs";

export const Route = createFileRoute("/profile")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Personal Profile | THE KRIYA LAB" },
      { name: "description", content: "View your personal profile and account details." },
    ],
  }),
  component: ProfilePage,
});

export function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const ta = lang === "ta";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !user) {
      navigate({ to: "/auth", search: { redirect: "/profile" }, replace: true });
    }
  }, [mounted, isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">{t(bi("Loading profile…", "விவரங்கள் ஏற்றப்படுகின்றன…"))}</p>
        </div>
      </div>
    );
  }

  const reminderPref = typeof window !== "undefined" && localStorage.getItem("kriya_reminder_pref") !== "false";

  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16">
      <AccountNavTabs
        title={t(bi("Personal Profile", "தனிப்பட்ட விவரங்கள்"))}
        subtitle={t(
          bi(
            "Review your personal identity, contact email, and active status in The Kriya Lab.",
            "உங்கள் சுயவிவரம் மற்றும் பதிவு செய்யப்பட்ட மின்னஞ்சலை பார்வையிடுங்கள்."
          )
        )}
      />

      <Section className="!py-8 sm:!py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Profile Card */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <User className="size-5 text-gold" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("Personal Details", "தனிப்பட்ட விவரங்கள்"))}
                </h2>
              </div>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/40 bg-gold/10 hover:bg-gold/20 text-gold text-xs font-semibold transition-all cursor-pointer"
              >
                <Edit3 className="size-3.5" />
                <span>{t(bi("Change Details", "விவரங்களை மாற்றவும்"))}</span>
              </Link>
            </div>

            {/* Main Avatar + Name Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-gold/10 via-muted/40 to-muted/20 border border-gold/25 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="size-24 rounded-full bg-gradient-to-br from-gold/40 via-gold/20 to-transparent border-3 border-gold/50 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gold font-bold text-3xl font-serif">
                    {user.full_name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="text-[0.7rem] text-muted-foreground font-semibold uppercase tracking-wider">
                    {t(bi("User Name", "பயனர் பெயர்"))}
                  </p>
                  <h3 className="font-serif text-2xl font-bold text-foreground leading-snug">
                    {user.full_name || "Sadhaka"}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-gold bg-gold/10 border border-gold/30 px-2.5 py-1 rounded-full">
                    <Mail className="size-3 text-gold" />
                    {user.email}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.68rem] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="size-3" />
                    {t(bi("Verified Email", "சரிபார்க்கப்பட்டது"))}
                  </span>
                </div>
              </div>
            </div>

            {/* Identity Information Grid */}
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                <p className="text-[0.7rem] uppercase font-bold text-muted-foreground tracking-wider">
                  {t(bi("Full Name", "முழு பெயர்"))}
                </p>
                <p className="text-sm font-semibold text-foreground truncate">{user.full_name || "-"}</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                <p className="text-[0.7rem] uppercase font-bold text-muted-foreground tracking-wider">
                  {t(bi("Gmail / Email Address", "ஜிமெயில் / மின்னஞ்சல் முகவரி"))}
                </p>
                <p className="text-sm font-mono text-foreground truncate">{user.email}</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                <div className="flex items-center gap-1.5">
                  <Globe className="size-3.5 text-gold" />
                  <p className="text-[0.7rem] uppercase font-bold text-muted-foreground tracking-wider">
                    {t(bi("Portal Language", "காட்சி மொழி"))}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {lang === "ta" ? "தமிழ் (Tamil)" : "English"}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                <div className="flex items-center gap-1.5">
                  <Bell className="size-3.5 text-gold" />
                  <p className="text-[0.7rem] uppercase font-bold text-muted-foreground tracking-wider">
                    {t(bi("Sadhana Reminders", "சாதனா நினைவூட்டல்"))}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {reminderPref ? t(bi("Enabled", "இயக்கப்பட்டுள்ளது")) : t(bi("Disabled", "முடக்கப்பட்டுள்ளது"))}
                </p>
              </div>
            </div>

            {/* Direct Action Hub */}
            <div className="pt-2 border-t border-border/70 flex flex-col sm:flex-row gap-3">
              <Link
                to="/settings"
                className="flex-1 flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                    <Edit3 className="size-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground group-hover:text-gold transition-colors">
                      {t(bi("Change Your Details", "விவரங்களை மாற்றவும்"))}
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      {t(bi("Update photo, full name & preferences", "படம் மற்றும் பெயரை மாற்றவும்"))}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/security"
                className="flex-1 flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                    <KeyRound className="size-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground group-hover:text-gold transition-colors">
                      {t(bi("Security & Password", "பாதுகாப்பு & கடவுச்சொல்"))}
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      {t(bi("Change your login password", "கடவுச்சொல்லை மாற்றவும்"))}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Bottom Actions: Dashboard & Sign Out */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-foreground hover:text-gold transition-colors"
            >
              <BookOpen className="size-4 text-gold" />
              <span>{t(bi("Go to My Programs & Sadhana", "என் பயிற்சிகள் & சாதனா பக்கத்திற்குச் செல்க"))} →</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>{t(bi("Sign Out", "கணக்கிலிருந்து வெளியேறு"))}</span>
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
