import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { VelzonLayout } from "@/components/dashboard/VelzonLayout";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== "admin") {
      navigate({ to: "/auth", search: { redirect: "/admin" }, replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa]">
        <div className="w-10 h-10 border-4 border-[#334d84] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <VelzonLayout>
      <Outlet />
    </VelzonLayout>
  );
}
