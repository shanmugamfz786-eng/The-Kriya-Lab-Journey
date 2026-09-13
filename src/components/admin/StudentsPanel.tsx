import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProgramAccess, listPurchases, upsertProgramAccess } from "@/lib/admin.functions";
import { PAID_PROGRAMS } from "@/lib/payments.functions";

type AccessRow = {
  program_slug: string;
  program_label: string;
  zoom_url: string;
  zoom_notes_en: string;
  zoom_notes_ta: string;
  materials: { title: string; url: string }[];
};

const inputCls = "mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm";

export function StudentsPanel() {
  const qc = useQueryClient();
  const purchasesFn = useServerFn(listPurchases);
  const accessFn = useServerFn(listProgramAccess);
  const saveFn = useServerFn(upsertProgramAccess);

  const purchases = useQuery({
    queryKey: ["admin", "purchases"],
    queryFn: () => purchasesFn() as unknown as Promise<Record<string, any>[]>,
  });
  const access = useQuery({
    queryKey: ["admin", "program-access"],
    queryFn: () => accessFn() as unknown as Promise<AccessRow[]>,
  });

  const [slug, setSlug] = useState(PAID_PROGRAMS[0]!.slug);
  const [form, setForm] = useState<AccessRow>({
    program_slug: PAID_PROGRAMS[0]!.slug,
    program_label: PAID_PROGRAMS[0]!.label,
    zoom_url: "",
    zoom_notes_en: "",
    zoom_notes_ta: "",
    materials: [],
  });

  useEffect(() => {
    const existing = access.data?.find((a) => a.program_slug === slug);
    setForm({
      program_slug: slug,
      program_label:
        existing?.program_label || PAID_PROGRAMS.find((p) => p.slug === slug)?.label || slug,
      zoom_url: existing?.zoom_url ?? "",
      zoom_notes_en: existing?.zoom_notes_en ?? "",
      zoom_notes_ta: existing?.zoom_notes_ta ?? "",
      materials: existing?.materials ?? [],
    });
  }, [slug, access.data]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: form }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "program-access"] }),
  });

  const slugs = [
    ...new Set([
      ...PAID_PROGRAMS.map((p) => p.slug),
      ...(access.data ?? []).map((a) => a.program_slug),
      ...(purchases.data ?? []).map((p) => p["program_slug"] as string),
    ]),
  ];

  return (
    <div className="space-y-14">
      <section>
        <h2 className="font-serif text-2xl">Zoom link & materials</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Students who have paid for a program see this link and these files after they sign in.
        </p>

        <div className="mt-6 max-w-2xl space-y-4">
          <label className="block text-xs uppercase tracking-widest text-muted-foreground">
            Program
            <select value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls}>
              {slugs.map((s) => (
                <option key={s} value={s}>
                  {PAID_PROGRAMS.find((p) => p.slug === s)?.label ?? s}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs uppercase tracking-widest text-muted-foreground">
            Zoom link
            <input
              value={form.zoom_url}
              onChange={(e) => setForm({ ...form, zoom_url: e.target.value })}
              placeholder="https://zoom.us/j/…"
              className={inputCls}
            />
          </label>

          <label className="block text-xs uppercase tracking-widest text-muted-foreground">
            Joining notes (English)
            <textarea
              value={form.zoom_notes_en}
              onChange={(e) => setForm({ ...form, zoom_notes_en: e.target.value })}
              rows={3}
              className={inputCls}
            />
          </label>

          <label className="block text-xs uppercase tracking-widest text-muted-foreground">
            Joining notes (Tamil)
            <textarea
              value={form.zoom_notes_ta}
              onChange={(e) => setForm({ ...form, zoom_notes_ta: e.target.value })}
              rows={3}
              className={inputCls}
            />
          </label>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Downloads / materials
            </p>
            <div className="mt-2 space-y-3">
              {form.materials.map((m, i) => (
                <div key={i} className="flex flex-wrap gap-2">
                  <input
                    value={m.title}
                    placeholder="Title"
                    onChange={(e) => {
                      const next = [...form.materials];
                      next[i] = { ...next[i]!, title: e.target.value };
                      setForm({ ...form, materials: next });
                    }}
                    className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm"
                  />
                  <input
                    value={m.url}
                    placeholder="https://…"
                    onChange={(e) => {
                      const next = [...form.materials];
                      next[i] = { ...next[i]!, url: e.target.value };
                      setForm({ ...form, materials: next });
                    }}
                    className="flex-[2] rounded-sm border border-border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, materials: form.materials.filter((_, j) => j !== i) })
                    }
                    className="rounded-full border border-border px-4 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, materials: [...form.materials, { title: "", url: "" }] })}
              className="mt-3 rounded-full border border-border px-5 py-2 text-xs"
            >
              Add file link
            </button>
          </div>

          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="rounded-full bg-velvet px-7 py-3 text-sm text-primary-foreground hover:bg-primary disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : "Save"}
          </button>
          {save.error ? (
            <p className="text-sm text-destructive">{(save.error as Error).message}</p>
          ) : null}
          {save.isSuccess ? <p className="text-sm text-muted-foreground">Saved.</p> : null}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Purchases</h2>
        {purchases.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : !purchases.data?.length ? (
          <p className="mt-3 text-sm text-muted-foreground">No purchases recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Program</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.data.map((p) => (
                  <tr key={p["id"]} className="border-t border-border">
                    <td className="py-2 pr-4">
                      {new Date(p["created_at"]).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-2 pr-4">{p["full_name"]}</td>
                    <td className="py-2 pr-4">{p["email"]}</td>
                    <td className="py-2 pr-4">{p["program_label"] || p["program_slug"]}</td>
                    <td className="py-2 pr-4">₹{Number(p["amount_inr"]).toLocaleString("en-IN")}</td>
                    <td className="py-2 pr-4">{p["status"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
