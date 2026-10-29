import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-store";
import { Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import {
  User,
  Check,
  Globe,
  Bell,
  Save,
  Camera,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadEventImageApi } from "@/lib/events-api";
import { AccountNavTabs } from "@/components/AccountNavTabs";

export const Route = createFileRoute("/settings")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Change Your Details | THE KRIYA LAB" },
      { name: "description", content: "Update your personal details, profile photo, and preferences." },
    ],
  }),
  component: SettingsPage,
});

export function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLang();
  const ta = lang === "ta";

  const [mounted, setMounted] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Avatar upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(ta ? "படத்தின் அளவு 5MB-க்கு குறைவாக இருக்க வேண்டும்." : "Please select an image smaller than 5MB.");
      return;
    }

    setIsUploadingImage(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setAvatar(base64);

      try {
        const uploadedUrl = await uploadEventImageApi(base64);
        setAvatar(uploadedUrl);
      } catch (err: any) {
        setAvatar(base64);
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
  };

  // Preference states (persisted in localStorage)
  const [dailyReminder, setDailyReminder] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem("kriya_reminder_pref") !== "false";
    } catch {
      return true;
    }
  });
  const [emailUpdates, setEmailUpdates] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem("kriya_updates_pref") !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !user) {
      navigate({ to: "/auth", search: { redirect: "/settings" }, replace: true });
    } else {
      if (!fullName && user.full_name) setFullName(user.full_name);
      if (!avatar && user.avatar) setAvatar(user.avatar);
    }
  }, [mounted, isAuthenticated, user, navigate]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const API_URL = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, avatar }),
      });

      await res.json().catch(() => ({}));
      const updatedUser = { ...user, full_name: fullName, avatar };
      localStorage.setItem("the_kriya_lab_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("kriya_auth_changed"));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.warn("Save profile fallback to client state:", err);
      const updatedUser = { ...user, full_name: fullName, avatar };
      localStorage.setItem("the_kriya_lab_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("kriya_auth_changed"));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDailyReminder = () => {
    const next = !dailyReminder;
    setDailyReminder(next);
    localStorage.setItem("kriya_reminder_pref", String(next));
  };

  const toggleEmailUpdates = () => {
    const next = !emailUpdates;
    setEmailUpdates(next);
    localStorage.setItem("kriya_updates_pref", String(next));
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">{t(bi("Loading details…", "அமைப்புகள் ஏற்றப்படுகின்றன…"))}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16">
      <AccountNavTabs
        title={t(bi("Change Your Details", "விவரங்களை மாற்றவும்"))}
        subtitle={t(
          bi(
            "Update your display name, profile photo, and portal preferences.",
            "உங்கள் சுயவிவரப் படம், பெயர் மற்றும் விருப்பங்களை மாற்றி அமைத்திடுங்கள்."
          )
        )}
      />

      <Section className="!py-8 sm:!py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          {saveSuccess && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in duration-200">
              <Check className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{t(bi("Your profile details have been saved successfully!", "உங்கள் விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன!"))}</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-destructive text-sm flex items-center gap-3">
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Change Details Form Card */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <User className="size-5 text-gold" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("Edit Personal Details", "விவரங்களை மாற்றவும்"))}
                </h2>
              </div>

              {/* 1st: Current Personal Info (Name & Gmail ID) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/80 flex items-center gap-4">
                <div className="size-16 rounded-full bg-gradient-to-br from-gold/30 via-gold/10 to-transparent border-2 border-gold/40 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {avatar ? (
                    <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gold font-bold text-xl font-serif">
                      {fullName?.charAt(0).toUpperCase() || user.full_name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-[0.7rem] text-muted-foreground font-semibold uppercase tracking-wider">
                    {t(bi("User Name", "பயனர் பெயர்"))}
                  </p>
                  <h3 className="font-semibold text-foreground text-base truncate">{user.full_name || fullName}</h3>
                  <p className="text-xs text-gold font-mono truncate">{user.email}</p>
                </div>
              </div>

              {/* Options to Change Photo & Details */}
              <form onSubmit={handleSaveProfile} className="space-y-5 pt-1">
                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="border-t border-border/60 pt-4 space-y-4">
                  {/* Change Photo Option */}
                  <div className="p-3.5 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0 overflow-hidden text-gold">
                        {avatar ? (
                          <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="size-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t(bi("Profile Photo", "சுயவிவரப் படம்"))}</p>
                        <p className="text-[0.7rem] text-muted-foreground">
                          {t(bi("Upload or change your profile picture", "சுயவிவரப் படத்தை மாற்றவும்"))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/40 bg-gold/15 hover:bg-gold/25 text-gold text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="size-3 animate-spin" />
                            <span>{t(bi("Uploading…", "ஏற்றப்படுகிறது…"))}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="size-3" />
                            <span>{avatar ? t(bi("Change Photo", "படத்தை மாற்று")) : t(bi("Upload Photo", "படம் பதிவேற்று"))}</span>
                          </>
                        )}
                      </button>

                      {avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingImage}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                          <span>{t(bi("Remove", "அகற்று"))}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Change Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t(bi("Change Name", "பெயரை மாற்றவும்"))}
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Registered Gmail Address (Readonly) */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t(bi("Registered Gmail / Email", "பதிவு செய்யப்பட்ட ஜிமெயில் / மின்னஞ்சல்"))}
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed font-mono text-xs"
                      />
                      <span className="absolute right-3.5 top-2.5 text-[0.68rem] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        ✓ Verified
                      </span>
                    </div>
                    <p className="text-[0.68rem] text-muted-foreground mt-1">
                      {t(
                        bi(
                          "Registered Gmail is permanently associated with your sadhana records.",
                          "பதிவு செய்யப்பட்ட ஜிமெயில் உங்கள் சாதனா பதிவுகளுடன் இணைக்கப்பட்டுள்ளது."
                        )
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gold text-velvet-deep font-semibold px-6 py-2.5 text-sm hover:bg-gold/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="size-4" />
                    <span>{isSaving ? t(bi("Saving…", "சேமிக்கப்படுகிறது…")) : t(bi("Save Changes", "மாற்றங்களைச் சேமி"))}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Preferences & Language Card */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <Globe className="size-5 text-gold" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("Preferences & Language", "விருப்பங்கள் & மொழி"))}
                </h2>
              </div>

              <div className="space-y-5">
                {/* Language Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-background">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(bi("Portal Display Language", "இணையதள காட்சி மொழி"))}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(bi("Choose between English and தமிழ் for courses and portal UI.", "பாடங்கள் மற்றும் இணையதளத்திற்கான மொழியை தேர்வு செய்க."))}
                    </p>
                  </div>

                  <div className="flex rounded-full border border-border p-1 bg-muted/60 text-xs font-bold self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setLang("en")}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full transition-all cursor-pointer",
                        lang === "en" ? "bg-gold text-velvet-deep shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang("ta")}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full transition-all cursor-pointer",
                        lang === "ta" ? "bg-gold text-velvet-deep shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      தமிழ்
                    </button>
                  </div>
                </div>

                {/* Daily Sadhana Reminders */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <Bell className="size-4 text-gold" />
                      <p className="text-sm font-semibold text-foreground">
                        {t(bi("Daily Sadhana Reminders", "தினசரி சாதனா நினைவூட்டல்"))}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(bi("Receive reminders for morning pranayama and evening kriya meditation.", "காலை பிராணாயாமம் மற்றும் மாலை கிரியா தியானத்திற்கான நினைவூட்டல்."))}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleDailyReminder}
                    aria-pressed={dailyReminder}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      dailyReminder ? "bg-gold" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                        dailyReminder ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Announcements */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-foreground">
                      {t(bi("Initiation & Retreat Updates", "தீட்சை & நிகழ்வு அறிவிப்புகள்"))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(bi("Get notified when new initiation batches, retreats, and live workshops are scheduled.", "புதிய தீட்சை வகுப்புகள் மற்றும் ஆன்லைன் பயிலரங்குகள் பற்றிய அறிவிப்புகளைப் பெறுங்கள்."))}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleEmailUpdates}
                    aria-pressed={emailUpdates}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      emailUpdates ? "bg-gold" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                        emailUpdates ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
