import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero, PlaceholderNote, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { journal } from "@/content/site";

export const Route = createFileRoute("/journal/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const article = journal.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { slug: article.slug };
  },
  head: ({ params }) => {
    const article = journal.find((a) => a.slug === params.slug);
    const title = article ? `${article.title.en} | THE KRIYA LAB Journal` : "Journal | THE KRIYA LAB";
    const description = article?.subtitle.en ?? "An essay from THE KRIYA LAB Journal.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useLoaderData();
  const { t } = useLang();
  const article = journal.find((a) => a.slug === slug)!;
  const related = journal.filter((a) => a.slug !== slug);

  return (
    <>
      <PageHero eyebrow={t(article.category)} title={t(article.title)} intro={t(article.subtitle)} />

      <Section>
        <div className="mx-auto max-w-2xl">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">
            {article.date} · {t(article.readingTime)}
          </p>
          <div className="mt-10 space-y-6 text-lg leading-relaxed text-muted-foreground">
            {article.body.map((p, i) => (
              <p key={i}>{t(p)}</p>
            ))}
          </div>
          <PlaceholderNote />
        </div>
      </Section>

      <Section tone="muted">
        <h2 className="font-serif text-3xl">{t(bi("Related reading", "தொடர்புடைய வாசிப்பு"))}</h2>
        <div className="mt-8 grid gap-px bg-border md:grid-cols-2">
          {related.map((a) => (
            <Link
              key={a.slug}
              to="/journal/$slug"
              params={{ slug: a.slug }}
              className="group bg-background p-8"
            >
              <h3 className="font-serif text-2xl transition-colors group-hover:text-primary">
                {t(a.title)}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">{t(a.subtitle)}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
