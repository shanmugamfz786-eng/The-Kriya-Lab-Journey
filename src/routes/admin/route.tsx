import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useAuth, getStoredUser } from "@/lib/auth-store";
import { VelzonLayout } from "@/components/dashboard/VelzonLayout";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  const { user, isAuthenticated } = useAuth();
  const effectiveUser = user || (typeof window !== "undefined" ? getStoredUser() : null);
  const effectiveAuth = isAuthenticated || Boolean(effectiveUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!effectiveAuth || !effectiveUser || effectiveUser.role !== "admin") {
      navigate({ to: "/auth", search: { redirect: "/admin" }, replace: true });
    }
  }, [effectiveAuth, effectiveUser, navigate]);

  if (!effectiveAuth || !effectiveUser || effectiveUser.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f6fa] p-4 text-center">
        <div className="w-10 h-10 border-4 border-[#334d84] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-700">Redirecting to Admin Login...</p>
        <div className="mt-4">
          <Link
            to="/auth"
            search={{ redirect: "/admin" }}
            className="px-4 py-2 rounded-xl bg-[#334d84] text-white text-xs font-semibold hover:bg-[#253961] transition-all inline-block shadow-sm"
          >
            Go to Admin Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <VelzonLayout>
      <Outlet />
    </VelzonLayout>
  );
}
