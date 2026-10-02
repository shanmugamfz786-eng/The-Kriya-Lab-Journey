import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { sitemapPathForLocation, sitemapStaticPaths, sitemapXML, isSitemapRouteIncluded, type SitemapEntry } from "@/lib/sitemap";
import { journal } from "@/content/site";
import { listPublicPrograms } from "@/lib/programs.functions";

const BASE_URL = "https://thekriyalab.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        if (isSitemapRouteIncluded(router.routesById["/programs/$id"])) {
          const programs = await listPublicPrograms();
          for (const program of programs) {
            const location = router.buildLocation({
              to: "/programs/$id",
              params: { id: String(program.id) },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, "/programs/$id");
            if (path) entries.push({ path });
          }
        }

        if (isSitemapRouteIncluded(router.routesById["/journal/$slug"])) {
          for (const article of journal) {
            const location = router.buildLocation({
              to: "/journal/$slug",
              params: { slug: article.slug },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, "/journal/$slug");
            if (path) entries.push({ path });
          }
        }

        if (entries.length === 0) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
