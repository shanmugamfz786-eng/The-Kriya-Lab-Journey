import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { deleteMediaAsset, listMedia, saveMediaAsset } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

type Asset = {
  id: string;
  storage_path: string;
  title: string | null;
  alt_en: string | null;
  alt_ta: string | null;
  url: string | null;
  created_at: string;
};

export function MediaPanel() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listMedia);
  const save = useServerFn(saveMediaAsset);
  const remove = useServerFn(deleteMediaAsset);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: () => fetchAll() as Promise<Asset[]>,
  });

  const del = useMutation({
    mutationFn: (a: Asset) => remove({ data: { id: a.id, storage_path: a.storage_path } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "media"] }),
  });

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const path = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, file);
        if (upErr) throw upErr;
        await save({ data: { storage_path: path, title: file.name } });
      }
      await qc.invalidateQueries({ queryKey: ["admin", "media"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <label className="flex cursor-pointer flex-col items-start gap-2 rounded-2xl border border-dashed border-border p-6">
        <span className="font-serif text-lg">Upload media</span>
        <span className="text-xs text-muted-foreground">
          Images, audio or documents up to 20 MB each.
        </span>
        <input
          type="file"
          multiple
          className="mt-2 text-sm"
          disabled={busy}
          onChange={(e) => onUpload(e.target.files)}
        />
      </label>
      {busy ? <p className="text-sm text-muted-foreground">Uploading…</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading media…</p>
      ) : (data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((a) => (
            <li key={a.id} className="overflow-hidden rounded-2xl border border-border">
              {a.url && /\.(png|jpe?g|webp|gif|avif)$/i.test(a.storage_path) ? (
                <img
                  src={a.url}
                  alt={a.alt_en ?? a.title ?? "Media asset"}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-muted text-xs text-muted-foreground">
                  {a.storage_path.split(".").pop()?.toUpperCase()}
                </div>
              )}
              <div className="space-y-2 p-4">
                <p className="truncate text-sm">{a.title ?? a.storage_path}</p>
                <div className="flex items-center gap-4 text-xs">
                  {a.url ? (
                    <button
                      type="button"
                      className="underline underline-offset-4"
                      onClick={() => navigator.clipboard.writeText(a.url!)}
                    >
                      Copy link
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-destructive underline underline-offset-4"
                    onClick={() => {
                      if (confirm("Delete this file?")) del.mutate(a);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
