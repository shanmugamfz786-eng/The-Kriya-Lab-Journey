import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/refunds")({
  staticData: { sitemap: false },
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search["search"] === "string" ? (search["search"] as string) : undefined,
    status: typeof search["status"] === "string" ? (search["status"] as string) : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/admin/orders",
      search: {
        search: search.search,
      },
    });
  },
  component: () => null,
});
