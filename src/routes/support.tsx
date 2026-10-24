import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { useLang } from "@/lib/i18n";
import { AccountNavTabs } from "@/components/AccountNavTabs";
import { Section } from "@/components/Primitives";
import {
  MessageSquare,
  Send,
  Clock,
  ChevronDown,
  Loader2,
  Mail,
  User as UserIcon,
  Phone,
  CheckCircle2,
} from "lucide-react";
import {
  recordNewEnquiry,
  fetchUserEnquiries,
  subscribeToEnquiries,
  getEnquiryThread,
  type EnquiryItem,
} from "@/lib/enquiries-api";
import { fetchAllPrograms, type ProgramItem } from "@/lib/programs-api";
import { showAlert } from "@/lib/alert";

export const Route = createFileRoute("/support")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Help & Inquiries | THE KRIYA LAB" },
      { name: "description", content: "Contact THE KRIYA LAB teachers and submit sadhana inquiries." },
    ],
  }),
  component: UserSupportPage,
});

function UserSupportPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLang();
  const ta = lang === "ta";

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adminPrograms, setAdminPrograms] = useState<ProgramItem[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("General Guidance");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // User Inquiries History State
  const [userEnquiries, setUserEnquiries] = useState<EnquiryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Auto pre-fill user info if available
  useEffect(() => {
    if (user) {
      setName(user.full_name || (user as any).name || "");
      setEmail(user.email || "");
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Load programs for dropdown
  useEffect(() => {
    fetchAllPrograms().then((data) => {
      setAdminPrograms(data);
      if (data.length > 0 && data[0]?.title_en) {
        setSelectedProgram(data[0].title_en);
      } else {
        setSelectedProgram("General Guidance");
      }
    });
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate({ to: "/auth", search: { redirect: "/support" }, replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const loadHistory = () => {
    if (!user) return;
    fetchUserEnquiries(user.email, user.id).then((data) => {
      setUserEnquiries(data);
      setLoadingHistory(false);
    });
  };

  useEffect(() => {
    loadHistory();
    const unsubscribe = subscribeToEnquiries(loadHistory);
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || message.trim().length < 5) {
      showAlert.error(
        ta ? "தேவை" : "Required",
        ta
          ? "தயவுசெய்து உங்கள் கேள்வியை விரிவாக எழுதவும்."
          : "Please write your question or doubt."
      );
      return;
    }

    setSubmitting(true);
    try {
      const senderName = name.trim() || user?.full_name || "Seeker";
      const senderEmail = email.trim() || user?.email || "seeker@thekriyalab.com";
      const autoSubject = `${selectedProgram} - Question`;

      await recordNewEnquiry({
        name: senderName,
        email: senderEmail,
        phone: phone.trim() || undefined,
        subject: autoSubject,
        message: message.trim(),
        programInterested: selectedProgram,
        userId: user?.id,
      });

      showAlert.success(
        ta ? "வினவல் அனுப்பப்பட்டது!" : "Inquiry Delivered!",
        ta
          ? "உங்கள் வினவல் ஆசிரியருக்கு அனுப்பப்பட்டது. விரைவில் தொடர்பு கொள்வோம்."
          : "Your question has been sent to the teacher successfully.",
        2500
      );

      setMessage("");
      loadHistory();
    } catch (err) {
      console.error(err);
      showAlert.error("Error", "Could not send inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">
            {ta ? "ஏற்றப்படுகிறது…" : "Loading portal…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16">
      {/* Top Breadcrumb & Page Header */}
      <AccountNavTabs
        title={ta ? "உதவி & வினவல்கள்" : "Help & Inquiries"}
        subtitle={
          ta
            ? "உங்கள் யோகப் பயிற்சி அல்லது வகுப்புகள் குறித்த சந்தேகங்களை நேரடியாக ஆசிரியரிடம் கேளுங்கள்."
            : "Directly communicate with your teacher regarding sadhana questions, batch dates, or guidance."
        }
      />

      <Section className="!py-8 sm:!py-10">
        <div className="mx-auto max-w-2xl space-y-8 animate-rise">
          {/* Main Clean Contact Card (1 Single Box) */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/25 shrink-0">
                  <MessageSquare className="size-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground">
                    {ta ? "ஆசிரியரிடம் கேள்வி கேட்கவும்" : "Contact Teacher / Ask a Question"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ta
                      ? "உங்கள் வினவலை கீழே சமர்ப்பியுங்கள். இது நேரடியாக ஆசிரியரின் பக்கத்திற்கு செல்லும்."
                      : "Submit your inquiry below. It directly reaches the admin page."}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="size-3.5 text-gold" />
                    <span>{ta ? "உங்கள் பெயர்" : "Your Name"}</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all hover:border-gold/50 focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="size-3.5 text-gold" />
                    <span>{ta ? "மின்னஞ்சல் முகவரி" : "Email Address"}</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all hover:border-gold/50 focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
                    required
                  />
                </div>
              </div>

              {/* Phone & Program Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="size-3.5 text-gold" />
                    <span>{ta ? "தொலைபேசி எண் (விருப்பத்தேர்வு)" : "Phone Number (Optional)"}</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all hover:border-gold/50 focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {ta ? "எந்தப் பயிற்சி" : "Program Interest"}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-3.5 py-2.5 pr-8 text-xs font-medium text-foreground transition-all hover:border-gold/50 focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold cursor-pointer"
                    >
                      {adminPrograms.length === 0 ? (
                        <option value="General Guidance">General Guidance</option>
                      ) : (
                        <>
                          {adminPrograms.map((p) => {
                            const title = ta && p.title_ta ? p.title_ta : p.title_en;
                            return (
                              <option key={p.id} value={p.title_en}>
                                {title}
                              </option>
                            );
                          })}
                          <option value="General Guidance">
                            {ta ? "பொது வழிகாட்டல்" : "General Guidance"}
                          </option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Message / Question */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {ta ? "உங்கள் சந்தேகம் அல்லது செய்தி" : "Your Question / Message"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={
                    ta
                      ? "உங்கள் கேள்வியை விரிவாக இங்கே எழுதவும்..."
                      : "Describe your sadhana doubt, practice question, or batch inquiry in detail..."
                  }
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all hover:border-gold/50 focus:border-gold focus:outline-hidden focus:ring-1 focus:ring-gold leading-relaxed"
                  required
                />
              </div>

              {/* Submit Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5 text-gold shrink-0" />
                  <span>
                    {ta
                      ? "ஆசிரியர் 12-24 மணி நேரத்தில் பதிலளிப்பார்."
                      : "Teacher responds within 12–24 hours."}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-gold text-rich-black hover:bg-gold/90 font-semibold text-xs transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{ta ? "அனுப்பப்படுகிறது..." : "Sending..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>{ta ? "ஆசிரியருக்கு அனுப்பவும்" : "Send to Teacher"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Linear Messages History - ALL MESSAGES IN CLEAN LINE-BY-LINE FORMAT */}
            {userEnquiries.length > 0 && (
              <div className="pt-6 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
                    {ta ? "உங்கள் செய்திகள் & ஆசிரியரின் பதில்" : "Your Messages & Teacher Responses"}
                  </h3>
                  <span className="text-[0.7rem] font-medium px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/25">
                    {userEnquiries.length} {ta ? "செய்திகள்" : "Messages"}
                  </span>
                </div>

                {/* Line-by-line linear list */}
                <div className="divide-y divide-border/70 rounded-xl border border-border/80 bg-background/60 overflow-hidden shadow-2xs">
                  {userEnquiries.map((enq) => {
                    const thread = getEnquiryThread(enq);
                    const isAwaitingReply = thread[thread.length - 1]?.sender === "user" && enq.status !== "Resolved";

                    return (
                      <div key={enq.id} className="p-3.5 sm:p-4 space-y-3">
                        {/* Line 1: Header / meta */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {enq.programInterested || "General Guidance"}
                            </span>
                            <span className="text-[0.68rem] text-muted-foreground">
                              • {new Date(enq.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {enq.status === "Resolved" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.68rem] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                              <CheckCircle2 className="size-3" />
                              {ta ? "பதிலளிக்கப்பட்டது" : "Resolved"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[0.68rem] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/25">
                              <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
                              {ta ? "பரிசீலனையில்" : "In Progress"}
                            </span>
                          )}
                        </div>

                        {/* Sequential Line-by-Line messages */}
                        <div className="space-y-2.5">
                          {thread.map((msg, mIdx) => (
                            msg.sender === "user" ? (
                              <div key={msg.id || mIdx} className="text-xs text-foreground/90 leading-relaxed pl-2.5 border-l-2 border-gold/50 py-0.5">
                                <div className="flex items-center justify-between text-[0.66rem] text-muted-foreground mb-0.5">
                                  <span className="font-semibold uppercase tracking-wider">
                                    {ta ? "உங்கள் கேள்வி:" : "You asked:"}
                                  </span>
                                  <span>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <p className="text-foreground">{msg.text}</p>
                              </div>
                            ) : (
                              <div key={msg.id || mIdx} className="text-xs text-foreground leading-relaxed pl-2.5 border-l-2 border-emerald-500 bg-emerald-500/10 p-2.5 rounded-r-lg">
                                <div className="flex items-center justify-between text-[0.66rem] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-0.5">
                                  <span>{ta ? "ஆசிரியரின் வழிகாட்டல்:" : "Teacher guidance:"}</span>
                                  <span className="font-normal text-emerald-700/70 dark:text-emerald-300/70">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <p className="italic text-foreground/95">“{msg.text}”</p>
                              </div>
                            )
                          ))}
                        </div>

                        {/* If awaiting reply */}
                        {isAwaitingReply && (
                          <div className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground pl-2.5 pt-1">
                            <Clock className="size-3 text-gold shrink-0" />
                            <span>
                              {ta
                                ? "ஆசிரியரிடம் உள்ளது • 12-24 மணி நேரத்தில் பதில் வரும்."
                                : "Pending teacher review • Response expected within 12–24 hours."}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
