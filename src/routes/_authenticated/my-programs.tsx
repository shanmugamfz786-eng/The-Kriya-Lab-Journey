import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHero, Section, Eyebrow } from "@/components/Primitives";
import { getMyPrograms, linkMyPurchases, type StudentProgram } from "@/lib/student.functions";
import { useAuth } from "@/lib/auth-store";
import { bi, useLang } from "@/lib/i18n";
import { useEnrollments } from "@/lib/enrollment-store";
import { getStoredOrders } from "@/lib/orders-api";
import { BookOpen, Video, FileText, ArrowRight, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { fetchUserEnquiries, subscribeToEnquiries, type EnquiryItem } from "@/lib/enquiries-api";

export const Route = createFileRoute("/_authenticated/my-programs")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My Programs | THE KRIYA LAB" },
      {
        name: "description",
        content: "Your enrolled Kriya Yoga programs, joining links, and sadhana materials.",
      },
      { property: "og:title", content: "My Programs — THE KRIYA LAB" },
      { property: "og:description", content: "Your enrolled programs and session joining details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyProgramsPage,
});

function MyProgramsPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isAuthenticated, logout } = useAuth();
  const { enrolledPrograms, loading: enrollmentsLoading } = useEnrollments(user?.id, user?.email);
  const [userMessages, setUserMessages] = useState<EnquiryItem[]>([]);
  const fetchPrograms = useServerFn(getMyPrograms);
  const linkFn = useServerFn(linkMyPurchases);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate({ to: "/auth", search: { redirect: "/my-programs" }, replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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
    linkFn()
      .then(() => qc.invalidateQueries({ queryKey: ["student", "programs"] }))
      .catch(() => {});
  }, [linkFn, qc]);

  const { data, isLoading } = useQuery({
    queryKey: ["student", "programs"],
    queryFn: () => fetchPrograms().catch(() => []) as Promise<StudentProgram[]>,
  });

  const displayPrograms = useMemo(() => {
    const list: StudentProgram[] = [...(data || [])];
    const userEmail = (user?.email || "").toLowerCase().trim();

    // 1. Add completed orders for this user
    if (userEmail) {
      const orders = getStoredOrders().filter(
        (o) =>
          (o.customerEmail || "").toLowerCase().trim() === userEmail &&
          o.status !== "Failed"
      );

      orders.forEach((o) => {
        const alreadyListed = list.some(
          (p) =>
            p.purchaseId === o.id ||
            p.programSlug === o.programSlug ||
            p.programLabel.toLowerCase() === (o.programTitle || "").toLowerCase()
        );
        if (!alreadyListed) {
          list.unshift({
            purchaseId: o.id,
            programSlug: o.programSlug,
            programLabel: o.programTitle,
            amountInr: o.amount,
            currency: o.currency || "INR",
            status: o.status === "Completed" ? "confirmed" : o.status.toLowerCase(),
            purchasedAt: o.createdAt,
            enrolment: { order: o.orderNumber, payment: o.paymentMethod },
            zoomUrl: "https://zoom.us/j/kriya-transmission-live",
            zoomNotesEn: "Please join 10 minutes early on an empty stomach.",
            zoomNotesTa: "10 நிமிடங்களுக்கு முன்னதாகவே இணையவும்.",
            materials: [
              { title: "Daily Practice Checklist & Routine Guide (PDF)", url: "#" },
              { title: "Guided Meditation & Pranayama Audio (MP3)", url: "#" },
              { title: "Spine Energy Alignment Diagram (PDF)", url: "#" },
            ],
          });
        }
      });
    }

    // 2. Add enrolled programs from dynamic/local store
    enrolledPrograms.forEach((ep) => {
      const title = lang === "ta" ? ep.title_ta || ep.title_en : ep.title_en;
      const alreadyListed = list.some(
        (p) =>
          p.programSlug === ep.id ||
          p.programLabel.toLowerCase() === (title || "").toLowerCase()
      );
      if (!alreadyListed) {
        list.unshift({
          purchaseId: "enr_" + ep.id,
          programSlug: ep.id,
          programLabel: title || "Kriya Program",
          amountInr: Number(ep.price_inr) || 4999,
          currency: "INR",
          status: "confirmed",
          purchasedAt: ep.created_at || new Date().toISOString(),
          enrolment: { batch: ep.duration || "4 Weeks" },
          zoomUrl: "https://zoom.us/j/kriya-transmission-live",
          zoomNotesEn: "Please join 10 minutes early in a quiet setting.",
          zoomNotesTa: "10 நிமிடங்களுக்கு முன்னதாகவே இணையவும்.",
          materials: [
            { title: "Daily Sadhana Manual (PDF)", url: "#" },
            { title: "Sacred Aum Chanting Guide (MP3)", url: "#" },
          ],
        });
      }
    });

    return list;
  }, [data, user?.email, enrolledPrograms, lang]);

  const isPageLoading = isLoading && enrollmentsLoading;

  return (
    <>
      <PageHero
        eyebrow={t(bi("Your Sadhana", "உங்கள் பயிற்சிகள்"))}
        title={t(bi("My Programs", "என் பயிற்சிகள்"))}
        intro={t(
          bi(
            "Access your enrolled Kriya Yoga initiations, Zoom joining links, and course materials.",
            "நீங்கள் பதிவு செய்த கிரியா யோகப் பயிற்சிகள், ஜூம் இணைப்புச் சுட்டி மற்றும் சாதனைக் குறிப்புகள்.",
          ),
        )}
      />

      <Section>
        {/* Teacher Guidance / Direct Messages Alert Card */}
        {userMessages.length > 0 && (
          <div className="mb-10 rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-white to-teal-50/60 p-5 sm:p-6 shadow-xs animate-fade-in">
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
                    {userMessages[0]?.subject || "Direct Guidance from The Kriya Lab"}
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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <Eyebrow>{t(bi("Enrolled Offerings", "பதிவு செய்யப்பட்டவை"))}</Eyebrow>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-light">
              {t(bi("Your Active Initiations", "உங்கள் தற்போதைய பயிற்சிகள்"))}
            </h2>
          </div>
          <Link
            to="/programs"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-gold transition-colors"
          >
            <span>{t(bi("Browse More Programs", "மேலும் பயிற்சிகள்"))}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {isPageLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !displayPrograms.length ? (
          <div className="flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-border bg-dawn/40 p-10 sm:p-14 min-h-[380px] shadow-xs">
            <div className="w-18 h-18 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mb-6 text-gold ring-8 ring-gold/5">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl mb-3 text-foreground">
              {t(bi("No Programs Enrolled Yet", "எந்த பயிற்சியிலும் பதிவு செய்யவில்லை"))}
            </h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-md leading-relaxed font-light">
              {t(
                bi(
                  "You haven't enrolled in any Kriya Yoga initiations yet. Begin your sacred sadhana journey by exploring our available courses.",
                  "நீங்கள் இன்னும் எந்த கிரியா யோகப் பயிற்சியிலும் பதிவு செய்யவில்லை. உங்கள் யோகப் பயணத்தை இப்போதே தொடங்குங்கள்.",
                ),
              )}
            </p>
            <Link
              to="/programs"
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-velvet-deep shadow-md hover:bg-gold/90 transition-all hover:scale-105"
            >
              {t(bi("Explore Programs", "பயிற்சிகளைக் காண்க"))}
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {displayPrograms.map((p) => {
              const notes = lang === "ta" ? p.zoomNotesTa || p.zoomNotesEn : p.zoomNotesEn;
              const dateFormatted = p.purchasedAt
                ? new Date(p.purchasedAt).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <article
                  key={p.purchaseId}
                  className="rounded-2xl border border-gold/25 bg-background p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[0.68rem] font-semibold text-emerald-600 mb-2">
                        <CheckCircle2 className="size-3" />
                        <span>{t(bi("Confirmed Enrolment", "உறுதி செய்யப்பட்ட பதிவு"))}</span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-normal">
                        {p.programLabel}
                      </h2>
                    </div>

                    <div className="text-left sm:text-right text-xs text-muted-foreground">
                      {dateFormatted && <p>{t(bi("Enrolled on", "பதிவு செய்த நாள்"))}: {dateFormatted}</p>}
                      <p className="mt-0.5 text-foreground font-medium">
                        ₹{p.amountInr.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Zoom Joining Section */}
                  <div className="mt-6 p-5 rounded-xl bg-gold/5 border border-gold/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Video className="size-4 text-gold" />
                        <h3 className="font-serif text-base font-semibold text-foreground">
                          {t(bi("Live Initiation Session", "நேரடி தீட்சை வகுப்பு"))}
                        </h3>
                      </div>
                      {notes && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-xl">
                          {notes}
                        </p>
                      )}
                    </div>

                    {p.zoomUrl ? (
                      <a
                        href={p.zoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-semibold text-velvet-deep shadow-xs hover:bg-gold/90 transition-all shrink-0 hover:scale-105"
                      >
                        <Video className="size-3.5" />
                        <span>{t(bi("Join on Zoom", "Zoom இல் இணையவும்"))}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        {t(bi("Link will be shared prior to session", "வகுப்புக்கு முன் இணைப்பு பகிரப்படும்"))}
                      </span>
                    )}
                  </div>

                  {/* Course Materials */}
                  {p.materials && p.materials.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-border/50">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                        {t(bi("Sadhana Materials & Guides", "சாதனைப் பொருட்கள் & கையேடுகள்"))}
                      </h4>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {p.materials.map((m, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-secondary/30 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="size-4 text-gold shrink-0" />
                              <span className="font-medium text-foreground">{m.title}</span>
                            </div>
                            <a
                              href={m.url}
                              className="text-gold font-semibold hover:underline shrink-0 ml-3"
                              download
                            >
                              {t(bi("Download", "பதிவிறக்கு"))}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
