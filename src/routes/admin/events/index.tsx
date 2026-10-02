import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/events/")({
  staticData: { sitemap: false },
  ssr: false,
  beforeLoad: () => {
    throw redirect({
      to: "/admin/events/future",
    });
  },
  component: () => null,
});
