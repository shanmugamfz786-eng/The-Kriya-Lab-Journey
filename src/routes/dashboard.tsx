import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: false },
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/my-programs", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="size-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
