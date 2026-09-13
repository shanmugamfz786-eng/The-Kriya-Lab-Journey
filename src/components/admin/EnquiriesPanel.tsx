import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { deleteEnquiry, listEnquiries, updateEnquiry } from "@/lib/admin.functions";
import { inputClass } from "@/components/Primitives";

const STATUSES = ["new", "contacted", "enrolled", "closed"] as const;

type Enquiry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  kind: string;
  programme: string | null;
  language: string;
  message: string | null;
  status: string;
  admin_notes: string | null;
  source_page: string | null;
  created_at: string;
};

export function EnquiriesPanel() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listEnquiries);
  const update = useServerFn(updateEnquiry);
  const remove = useServerFn(deleteEnquiry);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: () => fetchAll() as Promise<Enquiry[]>,
  });

  const mutate = useMutation({
    mutationFn: (v: { id: string; status?: string; admin_notes?: string }) => update({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "enquiries"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "enquiries"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading enquiries…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;

  const rows = (data ?? []).filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs capitalize transition-colors ${
              filter === s ? "border-primary text-primary" : "border-border text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} record(s)</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No enquiries yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {rows.map((r) => (
            <li key={r.id} className="p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[r.email, r.phone, r.programme, r.kind, r.source_page]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <select
                  className={`${inputClass} max-w-[10rem]`}
                  value={r.status}
                  onChange={(e) => mutate.mutate({ id: r.id, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-4"
                  onClick={() => setOpen(open === r.id ? null : r.id)}
                >
                  {open === r.id ? "Hide" : "Details"}
                </button>
              </div>

              {open === r.id ? (
                <div className="mt-4 space-y-3">
                  {r.message ? (
                    <p className="whitespace-pre-line rounded-xl bg-muted p-4 text-sm">
                      {r.message}
                    </p>
                  ) : null}
                  <textarea
                    className={inputClass}
                    rows={3}
                    defaultValue={r.admin_notes ?? ""}
                    placeholder="Internal notes"
                    onBlur={(e) => mutate.mutate({ id: r.id, admin_notes: e.target.value })}
                  />
                  <button
                    type="button"
                    className="text-xs text-destructive underline underline-offset-4"
                    onClick={() => {
                      if (confirm("Delete this enquiry permanently?")) del.mutate(r.id);
                    }}
                  >
                    Delete enquiry
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
