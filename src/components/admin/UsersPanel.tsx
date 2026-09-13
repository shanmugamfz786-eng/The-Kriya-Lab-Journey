import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listUsers, setUserRole } from "@/lib/admin.functions";

type AppUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
};

export function UsersPanel() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listUsers);
  const setRole = useServerFn(setUserRole);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchAll() as Promise<AppUser[]>,
  });

  const mutate = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "editor"; grant: boolean }) =>
      setRole({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading users…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      {mutate.error ? (
        <p className="text-sm text-destructive">{(mutate.error as Error).message}</p>
      ) : null}
      <ul className="divide-y divide-border rounded-2xl border border-border">
        {(data ?? []).map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{u.email || u.id}</p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(u.created_at).toLocaleDateString()}
                {u.last_sign_in_at
                  ? ` · Last sign-in ${new Date(u.last_sign_in_at).toLocaleDateString()}`
                  : ""}
              </p>
            </div>
            {(["admin", "editor"] as const).map((role) => {
              const has = u.roles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => mutate.mutate({ userId: u.id, role, grant: !has })}
                  className={`rounded-full border px-4 py-1.5 text-xs capitalize transition-colors ${
                    has ? "border-primary text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {has ? `Revoke ${role}` : `Grant ${role}`}
                </button>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}
