import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { deleteEvent, listEvents, upsertEvent } from "@/lib/admin.functions";
import { Field, inputClass } from "@/components/Primitives";

type Row = {
  id: string;
  title_en: string;
  title_ta: string;
  description_en: string;
  description_ta: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_en: string;
  venue_ta: string;
  sort_order: number;
  is_published: boolean;
};

const empty = {
  title_en: "",
  title_ta: "",
  description_en: "",
  description_ta: "",
  event_date: "",
  start_time: "",
  end_time: "",
  venue_en: "",
  venue_ta: "",
  sort_order: 0,
};

export function EventsPanel() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listEvents);
  const save = useServerFn(upsertEvent);
  const remove = useServerFn(deleteEvent);
  const [draft, setDraft] = useState(empty);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: () => fetchAll() as Promise<Row[]>,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "events"] });
    qc.invalidateQueries({ queryKey: ["events"] });
  };

  const upsert = useMutation({
    mutationFn: (v: Parameters<typeof save>[0]["data"]) => save({ data: v }),
    onSuccess: invalidate,
  });
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: invalidate,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading events…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;

  const today = new Date().toISOString().slice(0, 10);
  const rows = data ?? [];
  const future = rows.filter((r) => r.event_date >= today);
  const past = rows.filter((r) => r.event_date < today);

  return (
    <div className="space-y-10">
      <form
        className="space-y-5 rounded-2xl border border-border p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.event_date || !draft.title_en.trim()) return;
          upsert.mutate({ ...draft, sort_order: Number(draft.sort_order) || 0 });
          setDraft(empty);
        }}
      >
        <p className="font-serif text-lg">Add an event</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Event title (English)" htmlFor="e-title-en">
            <input
              id="e-title-en"
              className={inputClass}
              value={draft.title_en}
              onChange={(e) => setDraft({ ...draft, title_en: e.target.value })}
            />
          </Field>
          <Field label="Event title (Tamil)" htmlFor="e-title-ta">
            <input
              id="e-title-ta"
              className={inputClass}
              value={draft.title_ta}
              onChange={(e) => setDraft({ ...draft, title_ta: e.target.value })}
            />
          </Field>
          <Field label="Date of the event" htmlFor="e-date">
            <input
              id="e-date"
              type="date"
              className={inputClass}
              value={draft.event_date}
              onChange={(e) => setDraft({ ...draft, event_date: e.target.value })}
            />
          </Field>
          <Field label="Display order" htmlFor="e-order">
            <input
              id="e-order"
              type="number"
              className={inputClass}
              value={draft.sort_order}
              onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
            />
          </Field>
          <Field label="Start time" htmlFor="e-start">
            <input
              id="e-start"
              placeholder="06:00 IST"
              className={inputClass}
              value={draft.start_time}
              onChange={(e) => setDraft({ ...draft, start_time: e.target.value })}
            />
          </Field>
          <Field label="End time" htmlFor="e-end">
            <input
              id="e-end"
              placeholder="08:00 IST"
              className={inputClass}
              value={draft.end_time}
              onChange={(e) => setDraft({ ...draft, end_time: e.target.value })}
            />
          </Field>
          <Field label="Venue (English)" htmlFor="e-venue-en">
            <input
              id="e-venue-en"
              className={inputClass}
              value={draft.venue_en}
              onChange={(e) => setDraft({ ...draft, venue_en: e.target.value })}
            />
          </Field>
          <Field label="Venue (Tamil)" htmlFor="e-venue-ta">
            <input
              id="e-venue-ta"
              className={inputClass}
              value={draft.venue_ta}
              onChange={(e) => setDraft({ ...draft, venue_ta: e.target.value })}
            />
          </Field>
          <Field label="Short description (English)" htmlFor="e-desc-en">
            <textarea
              id="e-desc-en"
              rows={4}
              className={inputClass}
              value={draft.description_en}
              onChange={(e) => setDraft({ ...draft, description_en: e.target.value })}
            />
          </Field>
          <Field label="Short description (Tamil)" htmlFor="e-desc-ta">
            <textarea
              id="e-desc-ta"
              rows={4}
              className={inputClass}
              value={draft.description_ta}
              onChange={(e) => setDraft({ ...draft, description_ta: e.target.value })}
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={upsert.isPending}
          className="rounded-full bg-velvet px-7 py-3 text-sm text-primary-foreground hover:bg-primary disabled:opacity-60"
        >
          Add event
        </button>
        {upsert.error ? (
          <p className="text-sm text-destructive">{(upsert.error as Error).message}</p>
        ) : null}
      </form>

      <EventList
        title="Future events"
        rows={future}
        onToggle={(row, is_published) => upsert.mutate({ ...row, is_published })}
        onDelete={(id) => del.mutate(id)}
      />
      <EventList
        title="Past events"
        rows={past}
        onToggle={(row, is_published) => upsert.mutate({ ...row, is_published })}
        onDelete={(id) => del.mutate(id)}
      />
    </div>
  );
}

function EventList({
  title,
  rows,
  onToggle,
  onDelete,
}: {
  title: string;
  rows: Row[];
  onToggle: (row: Row, isPublished: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="font-serif text-lg">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      ) : null}
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-border p-5 text-sm"
        >
          <div className="min-w-[16rem] flex-1">
            <p className="font-medium">{row.title_en || "Untitled event"}</p>
            <p className="text-muted-foreground">
              {row.event_date}
              {row.start_time ? ` · ${row.start_time}` : ""}
              {row.end_time ? ` – ${row.end_time}` : ""}
              {row.venue_en ? ` · ${row.venue_en}` : ""}
            </p>
          </div>
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={row.is_published}
              onChange={(e) => onToggle(row, e.target.checked)}
            />
            Visible on the website
          </label>
          <button
            type="button"
            onClick={() => onDelete(row.id)}
            className="rounded-full border border-border px-5 py-2 text-xs hover:border-destructive hover:text-destructive"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
