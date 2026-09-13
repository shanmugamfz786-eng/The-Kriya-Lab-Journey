import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

/** Server-side admin check against the caller's own role rows (RLS applies). */
async function isAdmin(context: Ctx) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

async function assertAdmin(context: Ctx) {
  if (!(await isAdmin(context))) throw new Error("Forbidden");
}

/* ---------------------------------- session --------------------------------- */

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const data = await isAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    return { isAdmin: Boolean(data), adminCount: count ?? 0, userId: context.userId };
  });

/** Allows the very first signed-in person to claim the admin seat. */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("An administrator already exists.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- enquiries -------------------------------- */

export const listEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status?: string; admin_notes?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const patch: { status?: string; admin_notes?: string } = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.admin_notes !== undefined) patch.admin_notes = data.admin_notes;
    const { error } = await context.supabase.from("enquiries").update(patch).eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("enquiries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------- page content ------------------------------- */

export const listContentBlocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("content_blocks")
      .select("*")
      .order("page", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertContentBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string;
      page: string;
      block_key: string;
      label?: string;
      text_en: string;
      text_ta: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const row = {
      page: data.page,
      block_key: data.block_key,
      label: data.label ?? null,
      text_en: data.text_en,
      text_ta: data.text_ta,
    };
    const { error } = data.id
      ? await context.supabase.from("content_blocks").update(row).eq("id", data.id)
      : await context.supabase.from("content_blocks").upsert(row, { onConflict: "page,block_key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteContentBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("content_blocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- media ----------------------------------- */

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const signed = await Promise.all(
      rows.map(async (r: { storage_path: string }) => {
        const { data: s } = await supabaseAdmin.storage
          .from("media")
          .createSignedUrl(r.storage_path, 3600);
        return s?.signedUrl ?? null;
      }),
    );
    return rows.map((r: Record<string, unknown>, i: number) => ({ ...r, url: signed[i] }));
  });

export const saveMediaAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { storage_path: string; title?: string; alt_en?: string; alt_ta?: string }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("media_assets").upsert(
      {
        storage_path: data.storage_path,
        title: data.title ?? null,
        alt_en: data.alt_en ?? null,
        alt_ta: data.alt_ta ?? null,
        uploaded_by: context.userId,
      },
      { onConflict: "storage_path" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMediaAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; storage_path: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("media_assets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from("media").remove([data.storage_path]);
    return { ok: true };
  });

/* ----------------------------------- users ---------------------------------- */

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    return data.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      roles: (roles ?? [])
        .filter((r: { user_id: string }) => r.user_id === u.id)
        .map((r: { role: string }) => r.role),
    }));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "admin" | "editor"; grant: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    if (!data.grant && data.userId === context.userId && data.role === "admin") {
      throw new Error("You cannot remove your own administrator access.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/* ------------------------------ program dates ------------------------------- */

export const listProgramDates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("program_dates")
      .select("*")
      .order("session_date", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertProgramDate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string;
      program_slug: string;
      program_label: string;
      session_date: string;
      start_time?: string;
      format?: string;
      capacity?: number;
      seats_taken?: number;
      note_en?: string;
      note_ta?: string;
      is_open?: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const row = {
      program_slug: data.program_slug,
      program_label: data.program_label,
      session_date: data.session_date,
      start_time: data.start_time || null,
      format: data.format ?? "online",
      capacity: data.capacity ?? 0,
      seats_taken: data.seats_taken ?? 0,
      note_en: data.note_en ?? "",
      note_ta: data.note_ta ?? "",
      is_open: data.is_open ?? true,
    };
    const { error } = data.id
      ? await context.supabase.from("program_dates").update(row).eq("id", data.id)
      : await context.supabase.from("program_dates").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProgramDate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("program_dates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------- purchases & access ----------------------------- */

export const listPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("student_purchases")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listProgramAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("program_access")
      .select("*")
      .order("program_slug", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertProgramAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      program_slug: string;
      program_label?: string;
      zoom_url?: string;
      zoom_notes_en?: string;
      zoom_notes_ta?: string;
      materials?: { title: string; url: string }[];
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("program_access").upsert(
      {
        program_slug: data.program_slug,
        program_label: data.program_label ?? "",
        zoom_url: data.zoom_url ?? "",
        zoom_notes_en: data.zoom_notes_en ?? "",
        zoom_notes_ta: data.zoom_notes_ta ?? "",
        materials: data.materials ?? [],
      },
      { onConflict: "program_slug" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- events ---------------------------------- */

export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data, error } = await context.supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string;
      title_en?: string;
      title_ta?: string;
      description_en?: string;
      description_ta?: string;
      event_date: string;
      start_time?: string;
      end_time?: string;
      venue_en?: string;
      venue_ta?: string;
      sort_order?: number;
      is_published?: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const row = {
      title_en: data.title_en ?? "",
      title_ta: data.title_ta ?? "",
      description_en: data.description_en ?? "",
      description_ta: data.description_ta ?? "",
      event_date: data.event_date,
      start_time: data.start_time ?? "",
      end_time: data.end_time ?? "",
      venue_en: data.venue_en ?? "",
      venue_ta: data.venue_ta ?? "",
      sort_order: data.sort_order ?? 0,
      is_published: data.is_published ?? true,
    };
    const { error } = data.id
      ? await context.supabase.from("events").update(row).eq("id", data.id)
      : await context.supabase.from("events").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { error } = await context.supabase.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
