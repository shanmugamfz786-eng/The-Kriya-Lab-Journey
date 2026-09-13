import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHero, Section } from "@/components/Primitives";
import { getMyPrograms, linkMyPurchases, type StudentProgram } from "@/lib/student.functions";
import { getAdminStatus } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { bi, useLang } from "@/lib/i18n";

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
  const fetchPrograms = useServerFn(getMyPrograms);
  const linkFn = useServerFn(linkMyPurchases);
  const statusFn = useServerFn(getAdminStatus);

  useEffect(() => {
    void linkFn().then(() => qc.invalidateQueries({ queryKey: ["student", "programs"] }));
  }, [linkFn, qc]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["student", "programs"],
    queryFn: () => fetchPrograms() as Promise<StudentProgram[]>,
  });

  const { data: admin } = useQuery({
    queryKey: ["admin", "status"],
    queryFn: () => statusFn() as Promise<{ isAdmin: boolean }>,
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

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
        <div className="mb-10 flex flex-wrap items-center gap-3">
          {admin?.isAdmin ? (
            <Link
              to="/admin"
              className="rounded-full border border-border px-6 py-2.5 text-xs transition-colors hover:border-primary hover:text-primary"
            >
              {t(bi("Admin dashboard", "நிர்வாகப் பலகை"))}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={signOut}
            className="ml-auto rounded-full border border-border px-6 py-2.5 text-xs transition-colors hover:border-primary hover:text-primary"
          >
            {t(bi("Sign out", "வெளியேறு"))}
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t(bi("Loading…", "ஏற்றுகிறது…"))}</p>
        ) : error ? (
          <p className="text-sm text-destructive">{(error as Error).message}</p>
        ) : !data?.length ? (
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
            {data.map((p) => {
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
