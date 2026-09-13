import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  deleteProgramDate,
  listProgramDates,
  upsertProgramDate,
} from "@/lib/admin.functions";
import { Field, inputClass } from "@/components/Primitives";
import { programs } from "@/content/site";

type Row = {
  id: string;
  program_slug: string;
  program_label: string;
  session_date: string;
  start_time: string | null;
  format: string;
  capacity: number;
  seats_taken: number;
  note_en: string;
  note_ta: string;
  is_open: boolean;
};

const emptyDraft = {
  program_slug: programs[0]?.slug ?? "",
  session_date: "",
  start_time: "",
  format: "online",
  capacity: 0,
  note_en: "",
  note_ta: "",
};

export function CalendarPanel() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listProgramDates);
  const save = useServerFn(upsertProgramDate);
  const remove = useServerFn(deleteProgramDate);
  const [draft, setDraft] = useState(emptyDraft);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "program-dates"],
    queryFn: () => fetchAll() as Promise<Row[]>,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "program-dates"] });
    qc.invalidateQueries({ queryKey: ["program-dates"] });
  };

  const upsert = useMutation({
    mutationFn: (v: Parameters<typeof save>[0]["data"]) => save({ data: v }),
    onSuccess: invalidate,
  });
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: invalidate,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading calendar…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;

  const labelFor = (slug: string) =>
    programs.find((p) => p.slug === slug)?.name.en ?? slug;

  return (
    <div className="space-y-10">
      <form
        className="space-y-5 rounded-2xl border border-border p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.program_slug || !draft.session_date) return;
          upsert.mutate({
            ...draft,
            program_label: labelFor(draft.program_slug),
            capacity: Number(draft.capacity) || 0,
          });
          setDraft(emptyDraft);
        }}
      >
        <p className="font-serif text-lg">Publish a program date</p>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Program" htmlFor="d-program">
            <select
              id="d-program"
              className={inputClass}
              value={draft.program_slug}
              onChange={(e) => setDraft({ ...draft, program_slug: e.target.value })}
            >
              {programs.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name.en}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date" htmlFor="d-date">
            <input
              id="d-date"
              type="date"
              className={inputClass}
              value={draft.session_date}
              onChange={(e) => setDraft({ ...draft, session_date: e.target.value })}
            />
          </Field>
          <Field label="Start time" htmlFor="d-time">
            <input
              id="d-time"
              placeholder="06:00 IST"
              className={inputClass}
              value={draft.start_time}
              onChange={(e) => setDraft({ ...draft, start_time: e.target.value })}
            />
          </Field>
          <Field label="Format" htmlFor="d-format">
            <select
              id="d-format"
              className={inputClass}
              value={draft.format}
              onChange={(e) => setDraft({ ...draft, format: e.target.value })}
            >
              <option value="online">online</option>
              <option value="in person">in person</option>
            </select>
          </Field>
          <Field label="Capacity" htmlFor="d-cap">
            <input
              id="d-cap"
              type="number"
              min={0}
              className={inputClass}
              value={draft.capacity}
              onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })}
            />
          </Field>
          <Field label="Note (English)" htmlFor="d-note-en">
            <input
              id="d-note-en"
              className={inputClass}
              value={draft.note_en}
              onChange={(e) => setDraft({ ...draft, note_en: e.target.value })}
            />
          </Field>
          <Field label="Note (Tamil)" htmlFor="d-note-ta">
            <input
              id="d-note-ta"
              className={inputClass}
              value={draft.note_ta}
              onChange={(e) => setDraft({ ...draft, note_ta: e.target.value })}
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={upsert.isPending}
          className="rounded-full bg-velvet px-7 py-3 text-sm text-primary-foreground hover:bg-primary disabled:opacity-60"
        >
          Add date
        </button>
        {upsert.error ? (
          <p className="text-sm text-destructive">{(upsert.error as Error).message}</p>
        ) : null}
      </form>

      <div className="space-y-4">
        {(data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No dates published yet.</p>
        ) : null}
        {(data ?? []).map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-border p-5 text-sm"
          >
            <div className="min-w-[14rem] flex-1">
              <p className="font-medium">{row.session_date}</p>
              <p className="text-muted-foreground">
                {row.program_label || row.program_slug}
                {row.start_time ? ` · ${row.start_time}` : ""} · {row.format}
                {row.capacity ? ` · ${row.seats_taken}/${row.capacity}` : ""}
              </p>
            </div>
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={row.is_open}
                onChange={(e) =>
                  upsert.mutate({
                    id: row.id,
                    program_slug: row.program_slug,
                    program_label: row.program_label,
                    session_date: row.session_date,
                    start_time: row.start_time ?? "",
                    format: row.format,
                    capacity: row.capacity,
                    seats_taken: row.seats_taken,
                    note_en: row.note_en,
                    note_ta: row.note_ta,
                    is_open: e.target.checked,
                  })
                }
              />
              Visible to students
            </label>
            <button
              type="button"
              onClick={() => del.mutate(row.id)}
              className="rounded-full border border-border px-5 py-2 text-xs hover:border-destructive hover:text-destructive"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
