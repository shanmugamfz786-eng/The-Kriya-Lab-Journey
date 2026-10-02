import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/programs")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminProgramsLayout,
});

function AdminProgramsLayout() {
  return (
    <Outlet />
  );
}
