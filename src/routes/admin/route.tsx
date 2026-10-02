import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getStoredUser } from "@/lib/auth-store";
import { VelzonLayout } from "@/components/dashboard/VelzonLayout";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  ssr: false,
  beforeLoad: async ({ location }) => {
    const user = getStoredUser();
    if (!user || user.role !== "admin") {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
    return { user };
  },
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  return (
    <VelzonLayout>
      <Outlet />
    </VelzonLayout>
  );
}
