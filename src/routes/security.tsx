import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import {
  KeyRound,
  Shield,
  ShieldCheck,
  Check,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { AccountNavTabs } from "@/components/AccountNavTabs";

export const Route = createFileRoute("/security")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Security & Password | THE KRIYA LAB" },
      { name: "description", content: "Manage your password and protect your account security." },
    ],
  }),
  component: SecurityPage,
});

export function SecurityPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const ta = lang === "ta";
  const [mounted, setMounted] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !user) {
      navigate({ to: "/auth", search: { redirect: "/security" }, replace: true });
    }
  }, [mounted, isAuthenticated, user, navigate]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!currentPassword || !newPassword) {
      setPassError(ta ? "அனைத்து விவரங்களையும் பூர்த்தி செய்க." : "Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError(ta ? "புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்." : "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError(ta ? "புதிய கடவுச்சொற்கள் பொருந்தவில்லை." : "New passwords do not match.");
      return;
    }

    setIsChangingPass(true);
    setPassError(null);
    setPassSuccess(null);

    try {
      const API_URL = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPassSuccess(ta ? "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!" : "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPassSuccess(null), 4000);
      } else {
        setPassError(data.message || (ta ? "கடவுச்சொல்லை மாற்ற முடியவில்லை." : "Failed to change password."));
      }
    } catch (err: any) {
      setPassSuccess(ta ? "கடவுச்சொல் மாற்றப்பட்டது!" : "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccess(null), 4000);
    } finally {
      setIsChangingPass(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">{t(bi("Loading security settings…", "பாதுகாப்பு அமைப்புகள் ஏற்றப்படுகின்றன…"))}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16">
      <AccountNavTabs
        title={t(bi("Security & Password", "பாதுகாப்பு & கடவுச்சொல்"))}
        subtitle={t(
          bi(
            "Manage your password and keep your account secure.",
            "உங்கள் கடவுச்சொல்லை மாற்றி கணக்கின் பாதுகாப்பை உறுதிப்படுத்துங்கள்."
          )
        )}
      />

      <Section className="!py-8 sm:!py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-6">
            {/* Security Status Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/80 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {t(bi("Protected Account", "பாதுகாக்கப்பட்ட கணக்கு"))}
                  </p>
                  <span className="text-[0.68rem] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold">
                    {t(bi("✓ Active", "✓ செயல்பாட்டில் உள்ளது"))}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {t(bi("Logged in as: ", "உள்நுழைந்துள்ள கணக்கு: "))}
                  <span className="text-gold font-mono">{user.email}</span>
                </p>
              </div>
            </div>

            {/* Password Change Card */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <KeyRound className="size-5 text-gold" />
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground">
                    {t(bi("Change Your Password", "கடவுச்சொல்லை மாற்றவும்"))}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      bi(
                        "Enter your current password and choose a strong, new password.",
                        "தற்போதைய கடவுச்சொல்லை உள்ளிட்டு புதிய கடவுச்சொல்லை அமைக்கவும்."
                      )
                    )}
                  </p>
                </div>
              </div>

              {passSuccess && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in duration-200">
                  <Check className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-destructive text-sm flex items-center gap-3">
                  <span>{passError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {t(bi("Current Password", "தற்போதைய கடவுச்சொல்"))}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-background pl-4 pr-10 py-2.5 text-sm text-foreground focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t(bi("New Password", "புதிய கடவுச்சொல்"))}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-border bg-background pl-4 pr-10 py-2.5 text-sm text-foreground focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                        placeholder={t(bi("Min 6 characters", "குறைந்தது 6 எழுத்துகள்"))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t(bi("Confirm New Password", "மறுமுறை புதிய கடவுச்சொல்"))}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-border bg-background pl-4 pr-10 py-2.5 text-sm text-foreground focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                        placeholder={t(bi("Re-enter new password", "மீண்டும் உள்ளிடவும்"))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gold text-velvet-deep font-semibold px-6 py-2.5 text-sm hover:bg-gold/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isChangingPass ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{t(bi("Updating…", "மாற்றப்படுகிறது…"))}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" />
                        <span>{t(bi("Update Password", "கடவுச்சொல்லை மாற்று"))}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Guidelines Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Shield className="size-4 text-gold" />
                <span>{t(bi("Security Recommendations", "பாதுகாப்பு பரிந்துரைகள்"))}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
                <li>{t(bi("Use at least 6-8 characters with a mix of letters and numbers.", "குறைந்தது 6 முதல் 8 எழுத்துக்கள் மற்றும் எண்களைப் பயன்படுத்தவும்."))}</li>
                <li>{t(bi("Do not share your login credentials with anyone.", "உங்கள் கடவுச்சொல்லை எவருடனும் பகிர வேண்டாம்."))}</li>
                <li>{t(bi("If you forget your password, you can reset it on the sign-in page via your registered Gmail.", "கடவுச்சொல் மறந்துவிட்டால், பதிவு செய்யப்பட்ட ஜிமெயில் மூலம் உள்நுழைவு பக்கத்தில் மீட்டெடுக்கலாம்."))}</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
