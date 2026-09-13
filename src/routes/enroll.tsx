import { createFileRoute } from "@tanstack/react-router";
import { BuyPage } from "./buy";

export const Route = createFileRoute("/enroll")({
  staticData: { sitemap: true },
  validateSearch: (
    search: Record<string, unknown>,
  ): { program?: string | undefined; persons?: number | undefined } => ({
    program: typeof search["program"] === "string" ? (search["program"] as string) : undefined,
    persons:
      typeof search["persons"] === "number" || typeof search["persons"] === "string"
        ? Math.min(20, Math.max(1, Number(search["persons"]) || 1))
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Buy a Program | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "Purchase a Kriya Yoga initiation program online — secure card and Razorpay payment options.",
      },
      { property: "og:title", content: "Buy a Program — THE KRIYA LAB" },
      { property: "og:description", content: "Purchase a Kriya Yoga initiation program online." },
    ],
  }),
  component: BuyPage,
});
