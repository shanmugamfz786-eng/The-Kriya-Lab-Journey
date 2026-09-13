import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { bi } from "@/lib/i18n";

export const Route = createFileRoute("/disclaimer")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Disclaimer | THE KRIYA LAB" },
      {
        name: "description",
        content: "Kriya Yoga is not a medical treatment. Practise under guidance and within recommended limits.",
      },
      { property: "og:title", content: "Disclaimer — THE KRIYA LAB" },
      { property: "og:description", content: "Practice guidance and health note." },
    ],
  }),
  component: () => (
    <LegalPage
      title={bi("Disclaimer", "பொறுப்புத் துறப்பு")}
      body={bi(
        "Kriya Yoga as taught here is a contemplative practice, not a medical treatment, and no cure or guaranteed outcome is claimed. Practise gradually, follow your teacher's instructions, do not exceed the recommended duration or intensity, and consult a qualified medical professional about any health concern.",
        "இங்கே கற்பிக்கப்படும் கிரியா யோகம் ஒரு தியான முறை; மருத்துவ சிகிச்சை அல்ல. எந்த குணமாக்கலோ உறுதியான பலனோ கூறப்படவில்லை. படிப்படியாகப் பயிற்சி செய்யுங்கள், ஆசிரியரின் அறிவுறுத்தல்களைப் பின்பற்றுங்கள், பரிந்துரைக்கப்பட்ட கால அளவையோ தீவிரத்தையோ மீறாதீர்கள், உடல்நலக் கவலைகளுக்கு தகுதியான மருத்துவரை அணுகுங்கள்.",
      )}
    />
  ),
});
