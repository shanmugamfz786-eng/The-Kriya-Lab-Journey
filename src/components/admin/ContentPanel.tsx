import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  deleteContentBlock,
  listContentBlocks,
  upsertContentBlock,
} from "@/lib/admin.functions";
import { Field, inputClass } from "@/components/Primitives";

type Block = {
  id: string;
  page: string;
  block_key: string;
  label: string | null;
  text_en: string;
  text_ta: string;
};

const emptyDraft = { page: "", block_key: "", label: "", text_en: "", text_ta: "" };

export function ContentPanel() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listContentBlocks);
  const save = useServerFn(upsertContentBlock);
  const remove = useServerFn(deleteContentBlock);
  const [draft, setDraft] = useState(emptyDraft);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "content"],
    queryFn: () => fetchAll() as Promise<Block[]>,
  });

  const upsert = useMutation({
    mutationFn: (v: Parameters<typeof save>[0]["data"]) => save({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading content…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;

  return (
    <div className="space-y-10">
      <form
        className="space-y-5 rounded-2xl border border-border p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.page.trim() || !draft.block_key.trim()) return;
          upsert.mutate({ ...draft });
          setDraft(emptyDraft);
        }}
      >
        <p className="font-serif text-lg">New content block</p>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Page" htmlFor="c-page">
            <input
              id="c-page"
              className={inputClass}
              placeholder="home"
              value={draft.page}
              onChange={(e) => setDraft({ ...draft, page: e.target.value })}
            />
          </Field>
          <Field label="Key" htmlFor="c-key">
            <input
              id="c-key"
              className={inputClass}
              placeholder="hero_intro"
              value={draft.block_key}
              onChange={(e) => setDraft({ ...draft, block_key: e.target.value })}
            />
          </Field>
          <Field label="Label" htmlFor="c-label">
            <input
              id="c-label"
              className={inputClass}
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="English" htmlFor="c-en">
            <textarea
              id="c-en"
              rows={4}
              className={inputClass}
              value={draft.text_en}
              onChange={(e) => setDraft({ ...draft, text_en: e.target.value })}
            />
          </Field>
          <Field label="தமிழ்" htmlFor="c-ta">
            <textarea
              id="c-ta"
              rows={4}
              className={inputClass}
              value={draft.text_ta}
              onChange={(e) => setDraft({ ...draft, text_ta: e.target.value })}
            />
          </Field>
        </div>
        <button
          type="submit"
          className="rounded-full bg-velvet px-7 py-3 text-sm text-primary-foreground hover:bg-primary"
        >
          Add block
        </button>
      </form>

      {(data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No content blocks yet.</p>
      ) : (
        <ul className="space-y-6">
          {(data ?? []).map((b) => (
            <BlockEditor
              key={b.id}
              block={b}
              onSave={(v) => upsert.mutate({ ...v, id: b.id })}
              onDelete={() => {
                if (confirm("Delete this block?")) del.mutate(b.id);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function BlockEditor({
  block,
  onSave,
  onDelete,
}: {
  block: Block;
  onSave: (v: { page: string; block_key: string; label: string; text_en: string; text_ta: string }) => void;
  onDelete: () => void;
}) {
  const [en, setEn] = useState(block.text_en);
  const [ta, setTa] = useState(block.text_ta);
  const dirty = en !== block.text_en || ta !== block.text_ta;

  return (
    <li className="rounded-2xl border border-border p-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="font-serif text-lg">{block.label || block.block_key}</p>
        <span className="text-xs text-muted-foreground">
          {block.page} / {block.block_key}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto text-xs text-destructive underline underline-offset-4"
        >
          Delete
        </button>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="English" htmlFor={`en-${block.id}`}>
          <textarea
            id={`en-${block.id}`}
            rows={5}
            className={inputClass}
            value={en}
            onChange={(e) => setEn(e.target.value)}
          />
        </Field>
        <Field label="தமிழ்" htmlFor={`ta-${block.id}`}>
          <textarea
            id={`ta-${block.id}`}
            rows={5}
            className={inputClass}
            value={ta}
            onChange={(e) => setTa(e.target.value)}
          />
        </Field>
      </div>
      <button
        type="button"
        disabled={!dirty}
        onClick={() =>
          onSave({
            page: block.page,
            block_key: block.block_key,
            label: block.label ?? "",
            text_en: en,
            text_ta: ta,
          })
        }
        className="mt-5 rounded-full bg-velvet px-7 py-3 text-sm text-primary-foreground hover:bg-primary disabled:opacity-50"
      >
        Save changes
      </button>
    </li>
  );
}
