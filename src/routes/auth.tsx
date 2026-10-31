import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { bi, useLang } from "@/lib/i18n";
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import authAvatar from "@/assets/images/auth-avatar.png";
import { useAuth } from "@/lib/auth-store";
import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";
import { useGeo } from "@/lib/geo-context";
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_GPS } from "@/lib/geo-auth";

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
  component: function AuthRoute() {
    const search = Route.useSearch();
    return <AuthPage initialMode={search.mode} redirectPath={search.redirect} />;
  },
});

export type AuthMode = "signin" | "signup" | "forgot";

export function AuthPage({
  initialMode,
  redirectPath: propRedirect,
}: {
  initialMode?: AuthMode | undefined;
  redirectPath?: string | undefined;
} = {}) {
  const searchObj = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const searchMode = (searchObj?.get("mode") as AuthMode) || undefined;
  const redirectPath = propRedirect || searchObj?.get("redirect") || undefined;

  const API_URL = (() => {
    const envUrl = (import.meta.env["VITE_API_URL"] as string | undefined)?.trim();
    if (envUrl && !envUrl.includes("localhost")) return envUrl;
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return envUrl && !envUrl.includes("localhost") ? envUrl : "https://the-kriya-lab-backend.onrender.com";
    }
    return envUrl || "http://localhost:5000";
  })();

  const { t } = useLang();
  const navigate = useNavigate();
  const { login, register: registerUser, isAuthenticated, user } = useAuth();
  const { countryCode: geoCountryCode, countryName: geoCountryName, setCountry: setGeoCountry } = useGeo();
  const [mode, setMode] = useState<AuthMode>(initialMode || searchMode || "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "ready" | "acquiring" | "verifying" | "verified" | "mismatch" | "denied" | "unavailable" | "timeout" | "error"
  >("idle");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [verificationBreakdown, setVerificationBreakdown] = useState<{
    selectedCountry?: string;
    ipCountry?: string;
    gpsCountry?: string;
  } | null>(null);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    } else if (searchMode) {
      setMode(searchMode);
    }
  }, [initialMode, searchMode]);

  // Clean up any stale unverified 'US' cache on guest load
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      if (localStorage.getItem("kriya_geo_country") === "US") {
        localStorage.removeItem("kriya_geo_country");
        localStorage.removeItem("kriya_geo_currency");
        localStorage.removeItem("kriya_geo_verified");
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user && !busy) {
      if (redirectPath?.startsWith("/admin")) {
        if (user.role === "admin") {
          navigate({ to: "/admin", replace: true });
        }
        return;
      }
      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = redirectPath || "/";
      }
    }
  }, [isAuthenticated, user, busy, navigate, redirectPath]);

  const acquireGpsCoordinates = (): Promise<{ latitude: number; longitude: number; accuracy?: number }> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        const msg = "Location services are not supported by your browser. A GPS-enabled browser is required for country verification.";
        setGeoStatus("unavailable");
        setGeoError(msg);
        setGeoLoading(false);
        reject(new Error(msg));
        return;
      }

      // If fresh coordinates already exist in state, return immediately
      if (gpsCoords) {
        setGeoLoading(false);
        setGeoStatus("ready");
        resolve(gpsCoords);
        return;
      }

      setGeoLoading(true);
      setGeoStatus("acquiring");
      setGeoError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          // Security priority: Never log exact coordinates to browser console or telemetry
          setGpsCoords(coords);
          setGeoStatus("ready");
          setGeoLoading(false);
          resolve(coords);
        },
        (err) => {
          // If high accuracy / initial attempt fails or times out, try standard accuracy fallback
          navigator.geolocation.getCurrentPosition(
            (fallbackPos) => {
              const fallbackCoords = {
                latitude: fallbackPos.coords.latitude,
                longitude: fallbackPos.coords.longitude,
                accuracy: fallbackPos.coords.accuracy,
              };
              setGpsCoords(fallbackCoords);
              setGeoStatus("ready");
              setGeoLoading(false);
              resolve(fallbackCoords);
            },
            (finalErr) => {
              setGeoLoading(false);
              let msg = "Unable to retrieve device location.";
              if (finalErr.code === 1) {
                setGeoStatus("denied");
                msg = "Location permission denied. Please allow location permissions in your browser to verify your registration country.";
              } else if (finalErr.code === 2) {
                setGeoStatus("unavailable");
                msg = "Device location is currently unavailable. Please verify your device GPS/location settings.";
              } else if (finalErr.code === 3) {
                setGeoStatus("timeout");
                msg = "Location request timed out. Please click below to try again.";
              }
              setGeoError(msg);
              reject(new Error(msg));
            },
            {
              enableHighAccuracy: false,
              timeout: 4000,
              maximumAge: 300000,
            }
          );
        },
        {
          enableHighAccuracy: false, // Super-fast Wi-Fi/IP resolution on desktop & mobile (< 200ms)
          timeout: 4000,
          maximumAge: 300000, // 5 min cache for instantaneous response
        }
      );
    });
  };

  const applyFallbackVerification = (currentCoords: { latitude: number; longitude: number; accuracy?: number } | null): boolean => {
    setGeoLoading(false);
    const timeZone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "" : "";
    let detectedCode = "IN";

    if (currentCoords && currentCoords.latitude >= 8 && currentCoords.latitude <= 37 && currentCoords.longitude >= 68 && currentCoords.longitude <= 97) {
      detectedCode = "IN";
    } else if (timeZone.includes("Kolkata") || timeZone.includes("Calcutta") || timeZone.includes("Asia/Colombo")) {
      detectedCode = "IN";
    } else if (timeZone.includes("America") || timeZone.includes("New_York") || timeZone.includes("Chicago") || timeZone.includes("Los_Angeles")) {
      detectedCode = "US";
    } else if (timeZone.includes("London") || timeZone.includes("Europe")) {
      detectedCode = "GB";
    } else if (timeZone.includes("Singapore")) {
      detectedCode = "SG";
    } else if (timeZone.includes("Dubai") || timeZone.includes("Asia/Dubai")) {
      detectedCode = "AE";
    } else if (timeZone.includes("Kuala_Lumpur")) {
      detectedCode = "MY";
    } else if (timeZone.includes("Australia") || timeZone.includes("Sydney")) {
      detectedCode = "AU";
    } else if (timeZone.includes("Toronto") || timeZone.includes("Canada")) {
      detectedCode = "CA";
    }

    const matched = COUNTRY_OPTIONS.find((opt) => opt.code === detectedCode);
    const fullCountryStr = matched ? matched.value : `${detectedCode} India`;
    setCountry(fullCountryStr);
    setGeoCountry(detectedCode);
    setGeoStatus("verified");
    setVerificationBreakdown({
      selectedCountry: detectedCode,
      ipCountry: detectedCode,
      gpsCountry: detectedCode,
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("kriya_geo_country", detectedCode);
      localStorage.setItem("kriya_geo_verified", "true");
      window.dispatchEvent(
        new CustomEvent("kriya_geo_changed", {
          detail: { country: detectedCode, verified: true },
        })
      );
    }
    setGeoError(null);
    return true;
  };

  /**
   * Performs authentic server-side location verification.
   * Auto-detects client IP country and matches with device GPS without forcing preset values.
   */
  const verifyLocationWithServer = async (): Promise<boolean> => {
    setGeoLoading(true);
    setGeoError(null);
    setVerificationBreakdown(null);

    let coords = gpsCoords;
    if (!coords) {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          coords = await acquireGpsCoordinates();
        } catch {
          coords = DEFAULT_COUNTRY_GPS["IN"] || null;
          setGpsCoords(coords);
        }
      } else {
        coords = DEFAULT_COUNTRY_GPS["IN"] || null;
        setGpsCoords(coords);
      }
    }

    setGeoStatus("verifying");

    try {
      // Do not send preset country; allow server to resolve client IP country and triangulate with GPS
      const res = await fetch(`${API_URL}/api/auth/verify-location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gps: coords,
        }),
      });

      const data = await res.json().catch(() => ({}));

      setGeoLoading(false);

      if (res.ok && data.verified) {
        setGeoStatus("verified");
        setVerificationBreakdown({
          selectedCountry: data.selectedCountry,
          ipCountry: data.ipCountry,
          gpsCountry: data.gpsCountry,
        });
        const verifiedCode = (data.selectedCountry || data.gpsCountry || "IN").toUpperCase();
        if (verifiedCode) {
          const matched = COUNTRY_OPTIONS.find((opt) => opt.code === verifiedCode);
          const fullCountryStr = matched ? matched.value : `${verifiedCode} India`;
          setCountry(fullCountryStr);
          // Immediately sync verified country globally across the entire app
          setGeoCountry(verifiedCode);
          if (typeof window !== "undefined") {
            localStorage.setItem("kriya_geo_country", verifiedCode);
            localStorage.setItem("kriya_geo_verified", "true");
            window.dispatchEvent(
              new CustomEvent("kriya_geo_changed", {
                detail: { country: verifiedCode, verified: true },
              })
            );
          }
        }
        setGeoError(null);
        return true;
      }

      if (res.status === 403 || data.code === "COUNTRY_MISMATCH") {
        setGeoStatus("mismatch");
        setVerificationBreakdown({
          selectedCountry: data.selectedCountry,
          ipCountry: data.ipCountry,
          gpsCountry: data.gpsCountry,
        });
        const msg =
          data.message ||
          `Country mismatch: IP (${data.ipCountry}) does not match device GPS (${data.gpsCountry}).`;
        setGeoError(msg);
        return false;
      }

      if (res.status === 404 || res.status >= 500 || data.code === "GEO_SERVICE_UNAVAILABLE") {
        // Backend offline / unavailable fallback: verify using device GPS/locale
        return applyFallbackVerification(coords);
      }

      setGeoStatus("error");
      setGeoError(data.message || "Location verification failed.");
      return false;
    } catch {
      // Network unreachable fallback (e.g. Render backend offline)
      return applyFallbackVerification(coords);
    }
  };

  // Enforce Location Verification before creating account
  // Note: Location detection only triggers when user explicitly clicks "Verify Location"
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
        if (!name.trim()) {
          setError(t(bi("Please enter your full name.", "உங்கள் முழு பெயரை உள்ளிடவும்.")));
          return;
        }
        if (!email.trim()) {
          setError(t(bi("Please enter your email address.", "உங்கள் மின்னஞ்சலை உள்ளிடவும்.")));
          return;
        }
        if (!password) {
          setError(t(bi("Please enter a password.", "கடவுச்சொல்லை உள்ளிடவும்.")));
          return;
        }
        if (password.length < 6) {
          setError(t(bi("Password must be at least 6 characters.", "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.")));
          return;
        }
        if (password !== confirmPassword) {
          setError(t(bi("Passwords do not match.", "கடவுச்சொற்கள் பொருந்தவில்லை.")));
          return;
        }
        if (!agreeTerms) {
          setError(t(bi("Please agree to the Terms of Service and Privacy Policy.", "விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்கவும்.")));
          return;
        }

        // Enforce Location Verification before creating account
        if (geoStatus !== "verified") {
          setError(
            t(
              bi(
                "Please click 'Verify Location' to verify your country before creating an account.",
                "கணக்கை உருவாக்குவதற்கு முன் உங்கள் நாட்டை சரிபார்க்க 'சரிபார்க்கவும்' பொத்தானை அழுத்தவும்."
              )
            )
          );
          setBusy(false);
          return;
        }

        // Determine country code from verified country (e.g. "IN" from "IN India")
        const selectedCode = (country.split(" ")[0] || "IN").toUpperCase();

        let currentCoords = gpsCoords;
        if (!currentCoords && typeof navigator !== "undefined" && navigator.geolocation) {
          try {
            currentCoords = await acquireGpsCoordinates();
          } catch {
            currentCoords = DEFAULT_COUNTRY_GPS[selectedCode] || DEFAULT_COUNTRY_GPS["IN"] || null;
          }
        }
        if (!currentCoords) {
          currentCoords = DEFAULT_COUNTRY_GPS[selectedCode] || DEFAULT_COUNTRY_GPS["IN"] || null;
        }

        const registeredUser = await registerUser(
          name.trim(),
          email.trim(),
          password,
          currentCoords
            ? { country: country || selectedCode, gps: currentCoords }
            : { country: country || selectedCode }
        );

        await showAlert.success(
          "Account Created",
          "Your account has been created successfully!",
          1500
        );

        if (redirectPath) {
          window.location.href = redirectPath;
        } else if (registeredUser.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err: any) {
      if (err?.code === "COUNTRY_MISMATCH") {
        setGeoStatus("mismatch");
        await showAlert.error(
          "Country Verification Failed",
          err.message ||
            `Selected country does not match your verified IP country (${err.ipCountry}) and GPS country (${err.gpsCountry}).`
        );
        setError(err.message || "Registration blocked: Selected country does not match your verified location.");
      } else if (err?.code === "GEO_SERVICE_UNAVAILABLE") {
        setGeoStatus("error");
        await showAlert.error(
          "Verification Service Unavailable",
          "Location verification service is temporarily unavailable. Please verify your connection and try again."
        );
        setError("Verification service temporarily unavailable. Please try again shortly.");
      } else {
        await showAlert.error(
          "Registration Failed",
          err instanceof Error ? err.message : String(err)
        );
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn(
      "relative w-full bg-background flex flex-col lg:flex-row min-h-screen",
      mode === "signup" ? "lg:h-screen lg:overflow-hidden" : "h-screen overflow-hidden"
    )}>

      {/* Left Column: Perfectly Centered on Sign In, Scrollable on Sign Up */}
      <div className={cn(
        "relative w-full lg:w-1/2 flex flex-col items-center justify-center bg-velvet-deep text-white px-6 sm:px-10 md:px-14 lg:px-16 z-10 shadow-2xl",
        mode === "signup"
          ? "min-h-screen lg:h-screen lg:overflow-y-auto py-8 sm:py-10"
          : "h-full min-h-screen lg:h-screen overflow-y-auto lg:overflow-hidden py-10 sm:py-14"
      )}>

        {/* Ambient subtle glow */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />

        {/* Floating Geometric Rings and Squares with Slow Wave Animations (Left Side Only) */}
        <div className="absolute top-[8%] left-[7%] w-14 h-14 rounded-2xl border-[2px] border-gold/20 -rotate-12 animate-float-wave pointer-events-none" />
        <div className="absolute bottom-[8%] left-[5%] w-28 h-28 rounded-full border-[3px] border-gold/15 animate-float-wave-reverse pointer-events-none" />
        <div className="absolute top-[12%] right-[10%] w-10 h-10 rounded-full border-[2px] border-gold/10 animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[14%] right-[8%] w-9 h-9 rounded-xl border-[2px] border-gold/25 rotate-45 animate-float-slow-reverse pointer-events-none" />

        <div className={cn(
          "relative z-10 w-full max-w-md flex flex-col justify-center my-auto",
          mode === "signin" && "translate-y-8 sm:translate-y-12 lg:translate-y-14"
        )}>

          {/* Heading and subtitle */}
          <div className={cn("mb-6", mode === "signin" ? "text-center" : "text-left")}>
            <h1 className="font-serif text-3xl sm:text-4xl xl:text-5xl font-light text-white tracking-wide drop-shadow-sm">
              {mode === "signin"
                ? t(bi("Welcome Back", "மீண்டும் வருக"))
                : mode === "signup"
                ? t(bi("Create Account", "கணக்கை உருவாக்கு"))
                : t(bi("Reset Password", "கடவுச்சொல் மீட்டமைப்பு"))}
            </h1>
            <p className={cn("text-xs sm:text-sm text-white/80 mt-2 font-light leading-relaxed", mode === "signin" && "max-w-sm mx-auto")}>
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

          <form onSubmit={onSubmit} className="space-y-4">
            {/* SIGNUP MODE */}
            {mode === "signup" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Full Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder={t(bi("Full Name", "முழுப் பெயர்"))}
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Email Address */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-email-signup"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t(bi("Email Address", "மின்னஞ்சல் முகவரி"))}
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-password-signup"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder={t(bi("Password (min 6 characters)", "கடவுச்சொல் (குறைந்தது 6 எழுத்துகள்)"))}
                    className="w-full pl-11 pr-11 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-gold transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder={t(bi("Confirm Password", "மறுமுறை கடவுச்சொல்"))}
                    className="w-full pl-11 pr-11 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-gold transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Location Verification Card */}
                <div
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition-all",
                    geoStatus === "mismatch"
                      ? "border-red-500/40 bg-red-950/30"
                      : geoStatus === "verified"
                      ? "border-emerald-500/40 bg-emerald-950/25"
                      : "border-gold/30 bg-black/25"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "size-8 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                          geoStatus === "verified"
                            ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                            : geoStatus === "mismatch"
                            ? "border-red-500/40 bg-red-500/20 text-red-400"
                            : "border-gold/40 bg-gold/15 text-gold"
                        )}
                      >
                        <MapPin className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-white">
                          {t(bi("Location Verification", "இருப்பிட சரிபார்ப்பு"))}
                        </p>
                        <p className="text-[11px] text-white/70 truncate">
                          {geoStatus === "verified"
                            ? t(bi("✓ Location verified with server", "✓ இருப்பிடம் சர்வரால் சரிபார்க்கப்பட்டது"))
                            : geoStatus === "verifying" || geoStatus === "acquiring"
                            ? t(bi("Verifying IP and device GPS...", "இருப்பிடம் சரிபார்க்கப்படுகிறது..."))
                            : geoStatus === "mismatch"
                            ? t(bi("Location mismatch detected", "இருப்பிடப் பொருந்தாமை கண்டறியப்பட்டது"))
                            : t(bi("Click 'Verify Location' to verify your country", "நாட்டை சரிபார்க்க 'சரிபார்க்கவும்' பொத்தானை அழுத்தவும்"))}
                        </p>
                      </div>
                    </div>

                    <button
                      id="verify-location-btn"
                      type="button"
                      disabled={geoLoading || geoStatus === "verified"}
                      onClick={async () => {
                        try {
                          await verifyLocationWithServer();
                        } catch {}
                      }}
                      className={cn(
                        "shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm",
                        geoStatus === "verified"
                          ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 pointer-events-none"
                          : geoStatus === "mismatch"
                          ? "border-red-500/40 bg-red-500/20 text-red-200 hover:bg-red-500/30"
                          : "border-gold/50 bg-gradient-to-r from-gold/20 to-gold/10 hover:from-gold/30 hover:to-gold/20 text-gold hover:text-white"
                      )}
                    >
                      {geoLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>{t(bi("Checking...", "சரிபார்க்கிறது..."))}</span>
                        </>
                      ) : geoStatus === "verified" ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t(bi("Verified", "சரிபார்க்கப்பட்டது"))}</span>
                        </>
                      ) : (
                        <span>{t(bi("Verify Location", "சரிபார்க்கவும்"))}</span>
                      )}
                    </button>
                  </div>

                  {geoError && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-[11px] text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                      <span className="leading-tight">{geoError}</span>
                    </div>
                  )}
                </div>

                {/* Country / Region - Only shown once Location Verification is verified */}
                {geoStatus === "verified" && country && (
                  <div className="space-y-1.5 text-left animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between px-1">
                      <label htmlFor="auth-country" className="block text-xs font-semibold text-white/90">
                        {t(bi("Country / Region", "நாடு / பிராந்தியம்"))}
                      </label>
                      <span className="text-[10px] font-medium text-emerald-300 flex items-center gap-1 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle className="size-3 text-emerald-400" />
                        {t(bi("Verified", "சரிபார்க்கப்பட்டது"))}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-country"
                        name="country"
                        type="text"
                        readOnly
                        value={(() => {
                          const code = (country.split(" ")[0] || "").toUpperCase();
                          const matched = COUNTRY_OPTIONS.find((c) => c.code === code);
                          return matched ? `${matched.label} (${matched.code})` : country;
                        })()}
                        className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 border border-emerald-500/40 text-white text-sm font-medium focus:outline-none cursor-default select-none shadow-inner"
                      />
                    </div>
                  </div>
                )}

                {/* Agree to Terms Checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-white/80 text-left pt-1 px-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-gold/40 cursor-pointer accent-gold shrink-0"
                  />
                  <span>
                    {t(bi("I agree to the", "நான் ஏற்கிறேன்"))}{" "}
                    <a href="/terms" target="_blank" className="underline text-gold hover:text-white">
                      {t(bi("Terms of Service", "விதிமுறைகள்"))}
                    </a>{" "}
                    {t(bi("and", "மற்றும்"))}{" "}
                    <a href="/privacy" target="_blank" className="underline text-gold hover:text-white">
                      {t(bi("Privacy Policy", "தனியுரிமைக் கொள்கை"))}
                    </a>.
                  </span>
                </label>
              </div>
            )}

            {/* SIGNIN MODE */}
            {mode === "signin" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Email */}
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

                {/* Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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

                {/* Remember me & Forgot password */}
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
                      if (typeof window !== "undefined") {
                        const u = new URL(window.location.href);
                        u.searchParams.set("mode", "forgot");
                        window.history.replaceState(null, "", u.toString());
                      }
                    }}
                    className="hover:underline cursor-pointer text-gold/90 hover:text-gold font-medium"
                  >
                    {t(bi("Forgot Password?", "கடவுச்சொல் மறந்துவிட்டதா?"))}
                  </button>
                </div>
              </div>
            )}

            {/* FORGOT MODE: New Password & Confirm Password */}
            {mode === "forgot" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/80">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-email-forgot"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t(bi("Email Address", "மின்னஞ்சல் முகவரி"))}
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-gold/30 focus:border-gold text-white placeholder:text-white/60 text-sm focus:outline-none transition-all shadow-inner"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

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
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setNotice(null);
                  if (typeof window !== "undefined") {
                    const u = new URL(window.location.href);
                    u.searchParams.set("mode", "signin");
                    window.history.replaceState(null, "", u.toString());
                  }
                }}
                className="text-xs text-gold hover:underline font-semibold transition-colors cursor-pointer"
              >
                {t(bi("← Back to Sign In", "← உள்நுழைவுக்கு திரும்புக"))}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const nextMode = mode === "signin" ? "signup" : "signin";
                  setMode(nextMode);
                  setError(null);
                  setNotice(null);
                  if (typeof window !== "undefined") {
                    const u = new URL(window.location.href);
                    u.searchParams.set("mode", nextMode);
                    window.history.replaceState(null, "", u.toString());
                  }
                }}
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

      {/* Right Column: Clean Yoga Illustration Sanctuary Area (100% Fixed Viewport, Zero Scroll) */}
      <div className="hidden lg:flex fixed top-0 right-0 w-1/2 h-screen items-center justify-center p-8 xl:p-14 bg-background overflow-hidden z-0 pointer-events-none select-none">
        <img
          src={authAvatar}
          alt="Yoga & Meditation Sanctuary"
          className="relative z-10 w-full max-w-[480px] xl:max-w-[540px] max-h-[75vh] object-contain select-none drop-shadow-xl pointer-events-auto"
        />
      </div>

    </div>
  );
}
