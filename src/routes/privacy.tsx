import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { bi } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Policy | THE KRIYA LAB" },
      { name: "description", content: "How THE KRIYA LAB handles enquiry and enrollment information." },
      { property: "og:title", content: "Privacy Policy — THE KRIYA LAB" },
      { property: "og:description", content: "How enquiry information is handled." },
    ],
  }),
  component: () => (
    <LegalPage
      title={bi("Privacy Policy", "தனியுரிமைக் கொள்கை")}
      body={bi(
        "Enquiry and enrollment information is used only to respond to your request and is never published. Full policy text is to be provided by the school.",
        "விசாரணை மற்றும் பதிவு தகவல்கள் உங்கள் கோரிக்கைக்குப் பதிலளிக்க மட்டுமே பயன்படுத்தப்படும்; ஒருபோதும் வெளியிடப்படாது. முழுக் கொள்கை உரை பள்ளியால் வழங்கப்படும்.",
      )}
    />
  ),
});
