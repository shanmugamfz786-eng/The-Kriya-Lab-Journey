import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { PageHero, Section, Eyebrow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { PlayCircle, Clock, Award, BookOpen, User, Check } from "lucide-react";
import heroImage from "@/assets/hero-breath.jpg";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: false },
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLang();
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

  const firstName = user.full_name?.split(" ")[0] || "Seeker";

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Mock enrolled program 1 */}
          <article className="rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Online
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                6 Weeks
              </span>
            </div>
            <h3 className="font-serif text-xl mb-2">1st Kriya Pranayama</h3>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
              The foundational technique of Kriya Yoga. Learn to observe and control the life force.
            </p>
            <div className="w-full bg-muted rounded-full h-1.5 mb-2">
              <div className="bg-gold h-1.5 rounded-full w-[45%]" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-6">
              <span>45% Complete</span>
              <span>Module 3 of 6</span>
            </div>
            <button className="w-full rounded-full bg-velvet text-white py-2.5 text-sm font-medium hover:bg-velvet-deep transition-colors flex items-center justify-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Continue Learning
            </button>
          </article>

          {/* Mock enrolled program 2 */}
          <article className="rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow opacity-75">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full uppercase tracking-wider">
                Completed
              </span>
            </div>
            <h3 className="font-serif text-xl mb-2">Introduction to Sadhana</h3>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
              Preparatory course covering the philosophy and basic requirements for Kriya Yoga.
            </p>
            <div className="w-full bg-muted rounded-full h-1.5 mb-2">
              <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-6">
              <span className="text-emerald-600 font-medium flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Completed</span>
              <span>Nov 2025</span>
            </div>
            <button className="w-full rounded-full border border-border text-foreground py-2.5 text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              Review Materials
            </button>
          </article>

          {/* Explore more */}
          <article className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors h-full min-h-[280px]">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 text-gold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg mb-2">Continue the Journey</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Explore more advanced Kriyas and residential retreats.
            </p>
            <Link to="/programs" className="rounded-full bg-gold text-velvet-deep px-6 py-2.5 text-sm font-medium hover:bg-gold/90 transition-colors">
              Explore Programs
            </Link>
          </article>
        </div>
      </Section>
    </>
  );
}
