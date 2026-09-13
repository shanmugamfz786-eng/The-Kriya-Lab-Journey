import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { bi, useLang } from "@/lib/i18n";
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import authAvatar from "@/assets/images/auth-avatar.png";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
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

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) navigate({ to: "/my-programs", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        navigate({ to: "/my-programs", replace: true });
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/my-programs`,
          },
        });
        if (err) throw err;
        setNotice(
          t(
            bi(
              "Account created successfully! Check your inbox if confirmation is required.",
              "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! உறுதிப்படுத்தல் மின்னஞ்சலைச் சரிபார்க்கவும்.",
            ),
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative w-full flex-1 min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-[#ede5f5] dark:bg-[#180a1c]">

      {/* Left Column: Rich Magenta Gradient Form Area (Fills 100% height on mobile & 50% on desktop) */}
      <div className="relative w-full lg:w-1/2 flex-1 min-h-full flex items-center justify-center bg-gradient-to-br from-[#9c1252] via-[#c2185b] to-[#6d0733] text-white px-6 py-10 sm:p-10 md:p-14 lg:p-16 z-10 overflow-hidden">

        {/* Floating Geometric Rings and Squares with Slow Wave Animations (Left Side Only) */}
        <div className="absolute top-[8%] left-[7%] w-14 h-14 rounded-2xl border-[3px] border-white/20 -rotate-12 animate-float-wave pointer-events-none" />
        <div className="absolute bottom-[8%] left-[5%] w-28 h-28 rounded-full border-[6px] border-white/15 animate-float-wave-reverse pointer-events-none" />
        <div className="absolute top-[12%] right-[10%] w-10 h-10 rounded-full border-[2px] border-white/25 animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[14%] right-[8%] w-9 h-9 rounded-xl border-[2px] border-white/20 rotate-45 animate-float-slow-reverse pointer-events-none" />

        <div className="relative z-10 w-full max-w-md flex flex-col justify-center my-auto">

          {/* Heading and subtitle */}
          <div className="mb-6 text-left">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-white tracking-tight drop-shadow-sm font-sans">
              {mode === "signin"
                ? t(bi("Welcome Back", "மீண்டும் வருக"))
                : t(bi("Create Account", "கணக்கை உருவாக்கு"))}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-2 font-normal leading-relaxed">
              {mode === "signin"
                ? t(bi(
                    "To keep connected with us please login with your personal info",
                    "எங்களுடன் இணைந்திருக்க உங்கள் விவரங்களை உள்ளிட்டு உள்நுழையவும்",
                  ))
                : t(bi(
                    "Enter your personal details to begin your transformative yogic journey with us",
                    "எங்களுடன் யோகப் பயிற்சியைத் தொடங்க உங்கள் விவரங்களை உள்ளிட்டு பதிவு செய்யுங்கள்",
                  ))}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Username (signup only) */}
            {mode === "signup" && (
              <div className="relative animate-fadeIn">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/80">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth-name"
                  type="text"
                  required
                  placeholder={t(bi("Full Name / Username", "முழுப்பெயர் / பயனர்பெயர்"))}
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border border-white/35 focus:border-white text-white placeholder:text-white/70 text-sm focus:outline-none transition-all shadow-inner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/80">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                placeholder={t(bi("Email Address", "மின்னஞ்சல் முகவரி"))}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border border-white/35 focus:border-white text-white placeholder:text-white/70 text-sm focus:outline-none transition-all shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/80">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                placeholder={t(bi("Password", "கடவுச்சொல்"))}
                className="w-full pl-11 pr-11 py-3 rounded-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border border-white/35 focus:border-white text-white placeholder:text-white/70 text-sm focus:outline-none transition-all shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/75 hover:text-white transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between pt-0.5 px-1 text-xs text-white/90">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/40 cursor-pointer accent-white"
                />
                <span>{t(bi("Remember me", "என்னை நினைவில் கொள்"))}</span>
              </label>
              {mode === "signin" && (
                <span className="hover:underline cursor-pointer text-white/90 hover:text-white">
                  {t(bi("Forgot Password?", "கடவுச்சொல் மறந்துவிட்டதா?"))}
                </span>
              )}
            </div>

            {/* Error / notice */}
            {error && (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/30 text-xs text-white text-center">
                {error}
              </div>
            )}
            {notice && (
              <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 text-xs text-emerald-200 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            {/* Sign In / Sign Up primary button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-white text-[#c2185b] hover:bg-white/95 py-3.5 px-6 text-sm font-bold tracking-wide shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 flex items-center justify-center cursor-pointer mt-2"
            >
              {busy ? (
                <div className="w-4 h-4 border-2 border-[#c2185b] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{mode === "signin" ? t(bi("Sign In", "உள்நுழைக")) : t(bi("Sign Up", "கணக்கை உருவாக்கு"))}</span>
              )}
            </button>
          </form>

          {/* Toggle sign in / sign up */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setNotice(null); }}
              className="text-xs text-white/90 hover:text-white font-medium transition-colors cursor-pointer"
            >
              {mode === "signin" ? (
                <>{t(bi("Don't have an account?", "கணக்கு இல்லையா?"))}{" "}<span className="font-bold underline ml-1">{t(bi("Sign Up", "பதிவு செய்"))}</span></>
              ) : (
                <>{t(bi("Already have an account?", "ஏற்கனவே கணக்கு உள்ளதா?"))}{" "}<span className="font-bold underline ml-1">{t(bi("Sign In", "உள்நுழைக"))}</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Yoga Illustration Sanctuary Area (No floating rings/squares) */}
      <div className="relative hidden lg:flex w-1/2 min-h-full items-center justify-center p-8 xl:p-14 bg-[#ede5f5] dark:bg-[#180a1c] overflow-hidden">
        <img
          src={authAvatar}
          alt="Yoga & Meditation Sanctuary"
          className="relative z-10 w-full max-w-[480px] xl:max-w-[540px] max-h-[75vh] object-contain select-none drop-shadow-xl"
        />
      </div>

    </div>
  );
}
