import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHero, Section } from "@/components/Primitives";
import { getMyPrograms, linkMyPurchases, type StudentProgram } from "@/lib/student.functions";
import { useAuth } from "@/lib/auth-store";
import { bi, useLang } from "@/lib/i18n";
import { useEnrollments } from "@/lib/enrollment-store";
import { getStoredOrders } from "@/lib/orders-api";

export const Route = createFileRoute("/_authenticated/my-programs")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My Programs | THE KRIYA LAB" },
      {
        name: "description",
        content: "Your Kriya Yoga purchases, joining link and course materials.",
      },
      { property: "og:title", content: "My Programs — THE KRIYA LAB" },
      { property: "og:description", content: "Your purchases and session joining details." },
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
  const { user, logout } = useAuth();
  const { enrolledPrograms, loading: enrollmentsLoading } = useEnrollments(user?.id, user?.email);
  const fetchPrograms = useServerFn(getMyPrograms);
  const linkFn = useServerFn(linkMyPurchases);

  useEffect(() => {
    void linkFn().then(() => qc.invalidateQueries({ queryKey: ["student", "programs"] }));
  }, [linkFn, qc]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["student", "programs"],
    queryFn: () => fetchPrograms() as Promise<StudentProgram[]>,
  });

  const displayPrograms = useMemo(() => {
    const list: StudentProgram[] = [...(data || [])];
    const userEmail = (user?.email || "").toLowerCase().trim();

    // 1. Add all completed orders for this user
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

    // 2. Add enrolled programs from store
    enrolledPrograms.forEach((ep) => {
      const title = lang === "ta" ? ep.title_ta || ep.title_en : ep.title_en;
      const alreadyListed = list.some(
        (p) =>
          p.programSlug === ep.id ||
          p.programLabel.toLowerCase() === title.toLowerCase()
      );
      if (!alreadyListed) {
        list.unshift({
          purchaseId: "enr_" + ep.id,
          programSlug: ep.id,
          programLabel: title,
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

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    logout();
    navigate({ to: "/auth", replace: true });
  }

  const isPageLoading = isLoading && enrollmentsLoading;

  return (
    <>
      <PageHero
        eyebrow={t(bi("Your account", "உங்கள் கணக்கு"))}
        title={t(bi("My Programs", "என் நிகழ்ச்சிகள்"))}
        intro={t(
          bi(
            "Your purchases, joining link and course materials in one place.",
            "உங்கள் கொள்முதல்கள், இணைப்புச் சுட்டி மற்றும் பாடப் பொருட்கள் ஒரே இடத்தில்.",
          ),
        )}
      />
      <Section>
        <div className="mb-10 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={signOut}
            className="ml-auto rounded-full border border-border px-6 py-2.5 text-xs transition-colors hover:border-primary hover:text-primary cursor-pointer"
          >
            {t(bi("Sign out", "வெளியேறு"))}
          </button>
        </div>

        {isPageLoading ? (
          <p className="text-sm text-muted-foreground">{t(bi("Loading…", "ஏற்றுகிறது…"))}</p>
        ) : error && !displayPrograms.length ? (
          <p className="text-sm text-destructive">{(error as Error).message}</p>
        ) : !displayPrograms.length ? (
          <div className="max-w-xl space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(
                bi(
                  "No purchases are linked to this email address yet. If you have just paid, please allow a few moments and refresh. Make sure you signed in with the same email you used at checkout.",
                  "இந்த மின்னஞ்சலுடன் இதுவரை எந்தக் கொள்முதலும் இணைக்கப்படவில்லை. இப்போது கட்டணம் செலுத்தியிருந்தால், சில நிமிடங்கள் கழித்து புதுப்பிக்கவும். கட்டணம் செலுத்திய அதே மின்னஞ்சலில் உள்நுழைந்துள்ளீர்களா என்பதை உறுதி செய்யவும்.",
                ),
              )}
            </p>
            <Link to="/programs" className="inline-block text-sm underline">
              {t(bi("Browse programs", "நிகழ்ச்சிகளைப் பாருங்கள்"))}
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {displayPrograms.map((p) => {
              const enrolment = Object.entries(p.enrolment ?? {}).filter(
                ([, v]) => typeof v === "string" || typeof v === "number",
              );
              const notes = lang === "ta" ? p.zoomNotesTa || p.zoomNotesEn : p.zoomNotesEn;
              return (
                <article key={p.purchaseId} className="rounded-sm border border-border p-8">
                  <h2 className="font-serif text-2xl">{p.programLabel}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(p.purchasedAt).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN")}{" "}
                    · ₹{p.amountInr.toLocaleString("en-IN")} · {p.status}
                  </p>

                  <div className="mt-6">
                    {p.zoomUrl ? (
                      <>
                        <a
                          href={p.zoomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-full bg-velvet px-7 py-3 text-sm text-primary-foreground transition-colors hover:bg-primary"
                        >
                          {t(bi("Join the session on Zoom", "Zoom இல் அமர்வில் சேரவும்"))}
                        </a>
                        {notes ? (
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                            {notes}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t(
                          bi(
                            "The joining link will appear here as soon as the school publishes it.",
                            "பள்ளி வெளியிட்டதும் இணைப்புச் சுட்டி இங்கே தோன்றும்.",
                          ),
                        )}
                      </p>
                    )}
                  </div>

                  {p.materials.length ? (
                    <div className="mt-8">
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                        {t(bi("Materials", "பாடப் பொருட்கள்"))}
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm">
                        {p.materials.map((m, i) => (
                          <li key={i}>
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {m.title || m.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {enrolment.length ? (
                    <div className="mt-8">
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                        {t(bi("Your enrolment details", "உங்கள் பதிவு விவரங்கள்"))}
                      </h3>
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        {enrolment.map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-muted-foreground">{k.replace(/_/g, " ")}</dt>
                            <dd>{String(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
