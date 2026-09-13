import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { sitemapPathForLocation, sitemapStaticPaths, sitemapXML, isSitemapRouteIncluded, type SitemapEntry } from "@/lib/sitemap";
import { journal, programs } from "@/content/site";

const BASE_URL = "https://thekriyalab.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        if (isSitemapRouteIncluded(router.routesById["/programs/$slug"])) {
          for (const program of programs) {
            const location = router.buildLocation({
              to: "/programs/$slug",
              params: { slug: program.slug },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, "/programs/$slug");
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
