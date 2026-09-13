import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { purchaseTerms } from "@/content/site";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Terms & Conditions | THE KRIYA LAB" },
      { name: "description", content: "Terms and conditions for enrolling in THE KRIYA LAB programs and using this website." },
      { property: "og:title", content: "Terms & Conditions — THE KRIYA LAB" },
      { property: "og:description", content: "Terms and conditions for programs and purchases." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t(bi("THE KRIYA LAB", "தி க்ரியா லேப்"))}
        title={t(bi("Terms & Conditions", "விதிமுறைகள் மற்றும் நிபந்தனைகள்"))}
        intro={t(
          bi(
            "These terms govern enrolment in THE KRIYA LAB programs and purchases made through this website.",
            "",
          ),
        )}
      />
      <Section>
        <ol className="max-w-3xl list-decimal space-y-6 pl-6 leading-relaxed">
          {purchaseTerms.map((term, i) => (
            <li key={i}>{t(term)}</li>
          ))}
        </ol>
      </Section>
    </>
  );
}
