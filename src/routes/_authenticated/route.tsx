import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  staticData: { sitemap: false },
  ssr: false,
  beforeLoad: async () => {
    // [Standby Mode for Frontend-Only Vercel Deployment]
    // Original DB auth check preserved for TiDB integration:
    // const { data, error } = await supabase.auth.getUser();
    // if (error || !data.user) throw redirect({ to: "/auth" });
    // return { user: data.user };
    return { user: { id: "guest-user", email: "guest@thekriyalab.com" } };
  },
  component: () => <Outlet />,
});
