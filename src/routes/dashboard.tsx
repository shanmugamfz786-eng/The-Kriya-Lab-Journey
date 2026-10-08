import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { Section, Eyebrow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { BookOpen, Home, Compass, Calendar } from "lucide-react";
import { useEnrollments } from "@/lib/enrollment-store";
import { ProgramCard } from "@/components/ProgramCard";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: false },
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { enrolledPrograms, loading } = useEnrollments(user?.id);
  
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
           <Link to="/" className="text-lg font-serif text-[#111116] font-bold">THE KRIYA LAB</Link>
           <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm border border-gold/30">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
        </div>

        <div className="p-5 sm:p-8 md:p-12 max-w-7xl mx-auto">
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
