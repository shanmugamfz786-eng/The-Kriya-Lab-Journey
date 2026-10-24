import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { bi, useLang } from "@/lib/i18n";
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import authAvatar from "@/assets/images/auth-avatar.png";

import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined; mode?: "signin" | "signup" | undefined } => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
    mode: search["mode"] === "signup" ? "signup" : search["mode"] === "signin" ? "signin" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In / Sign Up | THE KRIYA LAB" },
      {
        name: "description",
        content: "Sign in or create an account with THE KRIYA LAB.",
      },
      { property: "og:title", content: "Sign In — THE KRIYA LAB" },
      { property: "og:description", content: "Access your programs and yogic journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "signin" | "signup" | "forgot";

function AuthPage() {
  const { redirect: redirectPath, mode: initialMode } = Route.useSearch();
  const { t } = useLang();
  const navigate = useNavigate();
  const { login, register: registerUser, isAuthenticated, user } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode || "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectPath?.startsWith("/admin")) {
        // If already admin, proceed to admin portal!
        if (user.role === "admin") {
          navigate({ to: "/admin", replace: true });
        }
        // If logged in as student, stay on auth page so they can sign in as admin!
        return;
      }
      if (user.role === "admin") {
        navigate({ to: "/admin", replace: true });
      } else {
        navigate({ to: (redirectPath as any) || "/", replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  const handleQuickAdminLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      await login("admin@thekriyalab.com", "admin123");
      navigate({ to: "/admin", replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to login as admin");
    } finally {
      setBusy(false);
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "forgot") {
        if (!email.trim() || !forgotNewPassword) {
          setError(t(bi("Please enter your registered email and new password.", "மின்னஞ்சல் மற்றும் புதிய கடவுச்சொல்லை உள்ளிடவும்.")));
          return;
        }
        if (forgotNewPassword.length < 6) {
          setError(t(bi("New password must be at least 6 characters.", "புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.")));
          return;
        }
        if (forgotNewPassword !== forgotConfirmPassword) {
          setError(t(bi("Passwords do not match.", "கடவுச்சொற்கள் பொருந்தவில்லை.")));
          return;
        }

        const API_URL = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), newPassword: forgotNewPassword }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setNotice(t(bi("Password reset successfully! You can now sign in.", "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! இப்போது உள்நுழையலாம்.")));
          setForgotNewPassword("");
          setForgotConfirmPassword("");
          setTimeout(() => {
            setMode("signin");
            setNotice(null);
          }, 2500);
        } else {
          setError(data.message || t(bi("Failed to reset password.", "கடவுச்சொல்லை மீட்டமைக்க முடியவில்லை.")));
        }
        return;
      }

      if (mode === "signin") {
        const loggedUser = await login(email, password);
        if (redirectPath) {
          navigate({ to: redirectPath as any, replace: true });
        } else if (loggedUser.role === "admin") {
          navigate({ to: "/admin", replace: true });
        } else {
          navigate({ to: "/", replace: true });
        }
      } else {
        const registeredUser = await registerUser(name, email, password);
        if (redirectPath) {
          navigate({ to: redirectPath as any, replace: true });
        } else if (registeredUser.role === "admin") {
          navigate({ to: "/admin", replace: true });
        } else {
          navigate({ to: "/", replace: true });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative w-full flex-1 min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-background">

      {/* Left Column: Brand Velvet-Deep & Gold Form Sanctuary (Fills 100% height on mobile & 50% on desktop) */}
      <div className="relative w-full lg:w-1/2 flex-1 min-h-full flex items-center justify-center bg-velvet-deep text-white px-6 py-10 sm:p-10 md:p-14 lg:p-16 z-10 overflow-hidden">

        {/* Ambient subtle glow */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />

        {/* Floating Geometric Rings and Squares with Slow Wave Animations (Left Side Only) */}
        <div className="absolute top-[8%] left-[7%] w-14 h-14 rounded-2xl border-[2px] border-gold/20 -rotate-12 animate-float-wave pointer-events-none" />
        <div className="absolute bottom-[8%] left-[5%] w-28 h-28 rounded-full border-[3px] border-gold/15 animate-float-wave-reverse pointer-events-none" />
        <div className="absolute top-[12%] right-[10%] w-10 h-10 rounded-full border-[2px] border-gold/10 animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[14%] right-[8%] w-9 h-9 rounded-xl border-[2px] border-gold/25 rotate-45 animate-float-slow-reverse pointer-events-none" />

        <div className="relative z-10 w-full max-w-md flex flex-col justify-center my-auto">

          {/* Heading and subtitle */}
          <div className="mb-6 text-left">
            <h1 className="font-serif text-3xl sm:text-4xl xl:text-5xl font-light text-white tracking-wide drop-shadow-sm">
              {mode === "signin"
                ? t(bi("Welcome Back", "மீண்டும் வருக"))
                : mode === "signup"
                ? t(bi("Create Account", "கணக்கை உருவாக்கு"))
                : t(bi("Reset Password", "கடவுச்சொல் மீட்டமைப்பு"))}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-2 font-light leading-relaxed">
              {mode === "signin"
                ? t(bi(
                    "To keep connected with us please login with your personal info",
                    "எங்களுடன் இணைந்திருக்க உங்கள் விவரங்களை உள்ளிட்டு உள்நுழையவும்",
                  ))
                : mode === "signup"
                ? t(bi(
                    "Enter your personal details to begin your transformative yogic journey with us",
                    "எங்களுடன் யோகப் பயிற்சியைத் தொடங்க உங்கள் விவரங்களை உள்ளிட்டு பதிவு செய்யுங்கள்",
                  ))
                : t(bi(
                    "Enter your registered email address and choose a new password.",
                    "உங்கள் பதிவு செய்த மின்னஞ்சலை உள்ளிட்டு புதிய கடவுச்சொல்லை அமைக்கவும்.",
                  ))}
            </p>
          </div>

          {redirectPath?.startsWith("/admin") && (
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/40 text-xs text-amber-100 animate-in fade-in shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <ShieldCheck className="size-4.5 text-gold" />
                  Admin Portal Protected
                </span>
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  disabled={busy}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-gold via-amber-300 to-gold text-[#1a140b] font-bold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {busy ? "Signing in..." : "1-Click Admin Login"}
                </button>
              </div>
              <p className="text-[0.7rem] text-white/80 mt-2 leading-relaxed">
                Admin access requires an administrator account. Use <span className="font-mono text-amber-300 font-bold">admin@thekriyalab.com</span> or click <strong className="text-amber-200">1-Click Admin Login</strong> above.
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Username (signup only) */}
            {mode === "signup" && (
              <div className="relative animate-fadeIn">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth-name"
                  type="text"
                  required
                  placeholder={t(bi("Full Name / Username", "முழுப்பெயர் / பயனர்பெயர்"))}
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {/* Email (signin, signup, forgot) */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                placeholder={t(bi("Email Address", "மின்னஞ்சல் முகவரி"))}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Normal Password (signin & signup) */}
            {mode !== "forgot" && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  placeholder={t(bi("Password", "கடவுச்சொல்"))}
                  className="w-full pl-11 pr-11 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-gold transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Forgot Mode: New Password & Confirm Password */}
            {mode === "forgot" && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-forgot-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder={t(bi("New Password (min 6 chars)", "புதிய கடவுச்சொல்"))}
                    className="w-full pl-11 pr-11 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-gold transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-forgot-confirm"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder={t(bi("Confirm New Password", "மறுமுறை புதிய கடவுச்சொல்"))}
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Remember me & Forgot password (signin only) */}
            {mode === "signin" && (
              <div className="flex items-center justify-between pt-0.5 px-1 text-xs text-white/90">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gold/40 cursor-pointer accent-gold"
                  />
                  <span className="text-white/80">{t(bi("Remember me", "என்னை நினைவில் கொள்"))}</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                    setNotice(null);
                  }}
                  className="hover:underline cursor-pointer text-gold/90 hover:text-gold font-medium"
                >
                  {t(bi("Forgot Password?", "கடவுச்சொல் மறந்துவிட்டதா?"))}
                </button>
              </div>
            )}

            {/* Error / notice */}
            {error && (
              <div className="p-3 rounded-2xl bg-black/50 border border-red-400/40 text-xs text-red-200 text-center animate-in fade-in">
                {error}
              </div>
            )}
            {notice && (
              <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-400/50 text-xs text-emerald-200 flex items-center justify-center gap-2 animate-in fade-in">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{notice}</span>
              </div>
            )}

            {/* Primary button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7de8b] to-[#d4af37] text-[#1a1208] hover:brightness-110 py-3.5 px-6 text-sm font-bold tracking-wide shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 flex items-center justify-center cursor-pointer mt-3"
            >
              {busy ? (
                <div className="w-4 h-4 border-2 border-[#1a1208] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>
                  {mode === "signin"
                    ? t(bi("Sign In", "உள்நுழைக"))
                    : mode === "signup"
                    ? t(bi("Create Account", "கணக்கை உருவாக்கு"))
                    : t(bi("Reset Password", "கடவுச்சொல்லை மாற்று"))}
                </span>
              )}
            </button>
          </form>

          {/* Toggle buttons / Back to Sign In */}
          <div className="mt-5 text-center">
            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); setNotice(null); }}
                className="text-xs text-gold hover:underline font-semibold transition-colors cursor-pointer"
              >
                {t(bi("← Back to Sign In", "← உள்நுழைவுக்கு திரும்புக"))}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setNotice(null); }}
                className="text-xs text-white/80 hover:text-white font-normal transition-colors cursor-pointer"
              >
                {mode === "signin" ? (
                  <>{t(bi("Don't have an account?", "கணக்கு இல்லையா?"))}{" "}<span className="font-semibold text-gold underline ml-1 hover:text-gold/90">{t(bi("Sign Up", "பதிவு செய்"))}</span></>
                ) : (
                  <>{t(bi("Already have an account?", "ஏற்கனவே கணக்கு உள்ளதா?"))}{" "}<span className="font-semibold text-gold underline ml-1 hover:text-gold/90">{t(bi("Sign In", "உள்நுழைக"))}</span></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Clean Yoga Illustration Sanctuary Area (No floating rings/squares) */}
      <div className="relative hidden lg:flex w-1/2 min-h-full items-center justify-center p-8 xl:p-14 bg-background overflow-hidden">
        <img
          src={authAvatar}
          alt="Yoga & Meditation Sanctuary"
          className="relative z-10 w-full max-w-[480px] xl:max-w-[540px] max-h-[75vh] object-contain select-none drop-shadow-xl"
        />
      </div>

    </div>
  );
}
