import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { Section, Eyebrow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { BookOpen, Home, Compass, Calendar, ArrowLeft, MessageSquare, Send } from "lucide-react";
import { useEnrollments } from "@/lib/enrollment-store";
import { ProgramCard } from "@/components/ProgramCard";
import {
  fetchUserEnquiries,
  subscribeToEnquiries,
  type EnquiryItem,
} from "@/lib/enquiries-api";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: false },
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { enrolledPrograms, loading } = useEnrollments(user?.id, user?.email);
  const [userMessages, setUserMessages] = useState<EnquiryItem[]>([]);

  useEffect(() => {
    if (!user?.email) return;
    const loadMsgs = () => {
      fetchUserEnquiries(user.email, user.id).then((items) => {
        setUserMessages(items);
      });
    };
    loadMsgs();
    const unsub = subscribeToEnquiries(loadMsgs);
    return () => unsub();
  }, [user?.email, user?.id]);
  
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate({ to: "/auth", search: { redirect: "/dashboard" }, replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f9] p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const navItems = [
    { name: t(bi("Home", "முகப்பு")), to: "/", icon: Home },
    { name: t(bi("Programs", "பயிற்சிகள்")), to: "/programs", icon: Compass },
    { name: t(bi("Events", "நிகழ்வுகள்")), to: "/events", icon: Calendar },
    { name: t(bi("My Programs", "என் பயிற்சிகள்")), to: "/dashboard", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f9] flex flex-col md:flex-row w-full">
      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pb-20 md:pb-8">
        {/* Mobile Header */}
        <div className="md:hidden bg-white px-5 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between shadow-xs">
           <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-gold transition-colors">
              <ArrowLeft className="size-3.5 text-gold" />
              <span>{t(bi("Back to Home", "முகப்புக்கு திரும்பு"))}</span>
           </Link>
           <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm border border-gold/30">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
        </div>

        <div className="p-5 sm:p-8 md:p-12 max-w-7xl mx-auto">
          {/* Back to Home Button on Desktop */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-gold transition-colors mb-4 group cursor-pointer"
          >
            <ArrowLeft className="size-3.5 text-gold transition-transform group-hover:-translate-x-1" />
            <span>{t(bi("Back to Home", "முகப்புக்கு திரும்பு"))}</span>
          </Link>

          {/* Teacher Guidance / Messages Card */}
          {userMessages.length > 0 && (
            <div className="mb-8 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="size-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageSquare className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.68rem] font-bold text-emerald-700 uppercase tracking-wider">
                        {t(bi("Teacher Guidance & Messages", "ஆசிரியரின் வழிகாட்டல் & செய்தி"))}
                      </span>
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 mt-0.5">
                      {userMessages[0]?.subject || "Direct Message from The Kriya Lab"}
                    </h3>
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed line-clamp-2">
                      "{userMessages[0]?.message}"
                    </p>
                  </div>
                </div>
                <Link
                  to="/support"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <Send className="size-3.5" />
                  <span>{t(bi("View & Reply in Support", "பதிலளிக்க / பார்க்க"))}</span>
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div>
              <Eyebrow>{t(bi("My Learning", "என் பயிற்சிகள்"))}</Eyebrow>
              <h2 className="mt-2 text-2xl font-serif text-[#111116]">
                {t(bi("Enrolled Programs", "பதிவு செய்த பயிற்சிகள்"))}
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : enrolledPrograms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledPrograms.map((p) => (
                <ProgramCard key={p.id} program={p} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-gray-200 bg-white p-12 min-h-[400px] shadow-sm">
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6 text-gold ring-8 ring-gold/5">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-[#111116]">
                {t(bi("No Programs Yet", "எந்த பயிற்சியிலும் பதிவு செய்யவில்லை"))}
              </h3>
              <p className="text-[0.95rem] text-gray-500 mb-8 max-w-md leading-relaxed">
                {t(bi(
                  "You haven't enrolled in any Kriya Yoga programs yet. Start your sadhana by exploring our initiations.",
                  "நீங்கள் இன்னும் எந்த கிரியா யோகப் பயிற்சியிலும் பதிவு செய்யவில்லை. உங்கள் யோகப் பயணத்தை இப்போதே தொடங்குங்கள்."
                ))}
              </p>
              <Link to="/programs" className="rounded-full bg-gold text-[#111116] px-8 py-3.5 text-sm font-bold hover:bg-gold/90 transition-all shadow-md active:scale-95">
                {t(bi("Explore Programs", "பயிற்சிகளைக் காண்க"))}
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
