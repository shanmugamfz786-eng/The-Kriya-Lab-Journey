import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getStoredUser } from "@/lib/auth-store";

export const Route = createFileRoute("/_authenticated")({
  staticData: { sitemap: false },
  ssr: false,
  beforeLoad: async () => {
    const user = getStoredUser();
    return { user: user || { id: "guest-user", email: "guest@thekriyalab.com" } };
  },
  component: () => <Outlet />,
});
