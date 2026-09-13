import { PageHero, PlaceholderNote, Section } from "@/components/Primitives";
import { useLang, type Bi } from "@/lib/i18n";

export function LegalPage({ title, body }: { title: Bi; body: Bi }) {
  const { t } = useLang();
  return (
    <>
      <PageHero title={t(title)} />
      <Section>
        <p className="measure text-muted-foreground">{t(body)}</p>
        <PlaceholderNote />
      </Section>
    </>
  );
}
