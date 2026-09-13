import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageHero, Section } from "@/components/Primitives";
import { EnquiriesPanel } from "@/components/admin/EnquiriesPanel";
import { ContentPanel } from "@/components/admin/ContentPanel";
import { MediaPanel } from "@/components/admin/MediaPanel";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { CalendarPanel } from "@/components/admin/CalendarPanel";
import { EventsPanel } from "@/components/admin/EventsPanel";
import { StudentsPanel } from "@/components/admin/StudentsPanel";
import { claimFirstAdmin, getAdminStatus } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Admin Dashboard | THE KRIYA LAB" },
      {
        name: "description",
        content: "Manage enquiries, page content, media and users for THE KRIYA LAB.",
      },
      { property: "og:title", content: "Admin Dashboard — THE KRIYA LAB" },
      { property: "og:description", content: "Private school administration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { key: "enquiries", label: "Enquiries & enrollments" },
  { key: "content", label: "Page content" },
  { key: "calendar", label: "Program calendar" },
  { key: "events", label: "Events" },
  { key: "students", label: "Students & Zoom links" },
  { key: "media", label: "Media library" },
  { key: "users", label: "Users" },
] as const;

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const status = useServerFn(getAdminStatus);
  const claim = useServerFn(claimFirstAdmin);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("enquiries");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "status"],
    queryFn: () => status() as Promise<{ isAdmin: boolean; adminCount: number }>,
  });

  const claimMutation = useMutation({
    mutationFn: () => claim(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <>
      <PageHero eyebrow="Administration" title="School Dashboard" />
      <Section>
        <div className="mb-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={signOut}
            className="ml-auto rounded-full border border-border px-6 py-2.5 text-xs transition-colors hover:border-primary hover:text-primary"
          >
            Sign out
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Checking access…</p>
        ) : !data?.isAdmin ? (
          <div className="max-w-xl space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account does not have administrator access yet.
            </p>
            {data?.adminCount === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  No administrator exists for this site. You can claim the first administrator seat.
                </p>
                <button
                  type="button"
                  onClick={() => claimMutation.mutate()}
                  disabled={claimMutation.isPending}
                  className="rounded-full bg-velvet px-7 py-3 text-sm text-primary-foreground hover:bg-primary disabled:opacity-60"
                >
                  Make me administrator
                </button>
                {claimMutation.error ? (
                  <p className="text-sm text-destructive">
                    {(claimMutation.error as Error).message}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ask an existing administrator to grant you access.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-4">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`rounded-full px-5 py-2 text-sm transition-colors ${
                    tab === t.key
                      ? "bg-velvet text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {tab === "enquiries" ? <EnquiriesPanel /> : null}
            {tab === "content" ? <ContentPanel /> : null}
            {tab === "calendar" ? <CalendarPanel /> : null}
            {tab === "events" ? <EventsPanel /> : null}
            {tab === "students" ? <StudentsPanel /> : null}
        {tab === "media" ? <MediaPanel /> : null}
            {tab === "users" ? <UsersPanel /> : null}
          </>
        )}
      </Section>
    </>
  );
}
