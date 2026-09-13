import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type StudentMaterial = { title: string; url: string };

export type StudentProgram = {
  purchaseId: string;
  programSlug: string;
  programLabel: string;
  amountInr: number;
  currency: string;
  status: string;
  purchasedAt: string;
  enrolment: Record<string, string | number>;
  zoomUrl: string;
  zoomNotesEn: string;
  zoomNotesTa: string;
  materials: StudentMaterial[];
};

/** Everything the signed-in student is entitled to see. RLS scopes rows to them. */
export const getMyPrograms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StudentProgram[]> => {
    const { data: purchases, error } = await context.supabase
      .from("student_purchases")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = purchases ?? [];

    const slugs = [...new Set(rows.map((r: { program_slug: string }) => r.program_slug))];
    const accessBySlug = new Map<string, Record<string, unknown>>();
    if (slugs.length) {
      const { data: access } = await context.supabase
        .from("program_access")
        .select("*")
        .in("program_slug", slugs);
      for (const a of access ?? []) accessBySlug.set(a.program_slug as string, a);
    }

    return rows.map((r: Record<string, any>) => {
      const a = accessBySlug.get(r["program_slug"] as string) ?? {};
      const paid = r["status"] === "paid" || r["status"] === "confirmed";
      const materials = Array.isArray(a["materials"]) ? (a["materials"] as StudentMaterial[]) : [];
      return {
        purchaseId: r["id"],
        programSlug: r["program_slug"],
        programLabel: r["program_label"] || r["program_slug"],
        amountInr: Number(r["amount_inr"] ?? 0),
        currency: r["currency"] ?? "INR",
        status: r["status"],
        purchasedAt: r["created_at"],
        enrolment: (r["enrolment"] ?? {}) as Record<string, string | number>,
        zoomUrl: paid ? ((a["zoom_url"] as string) ?? "") : "",
        zoomNotesEn: (a["zoom_notes_en"] as string) ?? "",
        zoomNotesTa: (a["zoom_notes_ta"] as string) ?? "",
        materials: paid ? materials : [],
      };
    });
  });

/** Links purchases that were recorded before the buyer's account existed. */
export const linkMyPurchases = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims as { email?: string }).email;
    if (!email) return { linked: 0 };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("student_purchases")
      .update({ user_id: context.userId })
      .is("user_id", null)
      .ilike("email", email)
      .select("id");
    return { linked: data?.length ?? 0 };
  });
