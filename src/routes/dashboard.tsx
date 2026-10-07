import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { Section, Eyebrow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { BookOpen } from "lucide-react";
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

  return (
    <>
      <div className="pt-8" />
      <Section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Eyebrow>{t(bi("My Learning", "என் பயிற்சிகள்"))}</Eyebrow>
            <h2 className="mt-2 text-2xl font-serif">
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
          <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 text-gold">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl mb-2 text-foreground">
              {t(bi("No Programs Yet", "எந்த பயிற்சியிலும் பதிவு செய்யவில்லை"))}
            </h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
              {t(bi(
                "You haven't enrolled in any Kriya Yoga programs yet. Start your sadhana by exploring our initiations.",
                "நீங்கள் இன்னும் எந்த கிரியா யோகப் பயிற்சியிலும் பதிவு செய்யவில்லை. உங்கள் யோகப் பயணத்தை இப்போதே தொடங்குங்கள்."
              ))}
            </p>
            <Link to="/programs" className="rounded-full bg-gold text-[#1a140b] px-8 py-3 text-sm font-semibold hover:bg-gold/90 transition-all shadow-md">
              {t(bi("Explore Programs", "பயிற்சிகளைக் காண்க"))}
            </Link>
          </div>
        )}
      </Section>
    </>
  );
}
