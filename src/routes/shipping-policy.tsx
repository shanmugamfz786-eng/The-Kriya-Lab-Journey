import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { Truck, PackageCheck, Globe2, ShieldCheck, Clock, Mail, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/shipping-policy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Shipping & Delivery Policy | THE KRIYA LAB" },
      {
        name: "description",
        content: "Transparent shipping and fulfillment policy for digital access, sadhana kits, and study materials from THE KRIYA LAB.",
      },
    ],
  }),
  component: ShippingPolicyPage,
});

export function ShippingPolicyPage() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHero
        eyebrow={t(bi("Customer Help & Fulfillment", "வாடிக்கையாளர் உதவி & விநியோகம்"))}
        title={t(bi("Shipping & Delivery Policy", "விநியோகம் & அனுப்புதல் கொள்கை"))}
        intro={t(
          bi(
            "Every program, study guide, and sacred sadhana kit is handled with genuine care and prompt transparency. Here is everything you need to know about how your orders and digital access are delivered.",
            "ஒவ்வொரு பயிற்சி, வழிகாட்டி நூல் மற்றும் சாதனா உபகரணங்களும் மிகுந்த கவனத்துடனும் வெளிப்படைத்தன்மையுடனும் உங்களிடம் சேர்க்கப்படுகின்றன."
          )
        )}
      />

      <Section className="!pt-4 sm:!pt-6 !pb-10 sm:!pb-14">
        <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
          {/* Key Delivery Highlights */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <Clock className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {t(bi("Instant Digital Access", "உடனடி இணைய அணுகல்"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "Online initiations, audio pranayama files, and student dashboard access are activated immediately upon payment.",
                    "கட்டணம் செலுத்திய உடனேயே இணையதள வகுப்புகள் மற்றும் சாதனா கோப்புகள் உங்கள் கணக்கில் செயல்படத் தொடங்கும்."
                  )
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <Truck className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {t(bi("3-5 Days Domestic Delivery", "3-5 நாட்களில் இந்தியாவில் விநியோகம்"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "Physical sadhana materials are dispatched from Chennai / Coimbatore via Blue Dart, DTDC, and Speed Post with live tracking.",
                    "புத்தகங்கள் மற்றும் பொருட்கள் சென்னை/கோவை மையங்களிலிருந்து விரைவு தபால் மூலம் அனுப்பப்படும்."
                  )
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <Globe2 className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {t(bi("Worldwide Sadhana Shipping", "உலகளாவிய சர்வதேச விநியோகம்"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "We regularly ship authentic practice kits to sadhakas in USA, UK, Singapore, Malaysia, UAE, and Europe via DHL Express.",
                    "அமெரிக்கா, இங்கிலாந்து, சிங்கப்பூர், மலேசியா உள்ளிட்ட உலக நாடுகளுக்கு சர்வதேச விரைவு தபால் மூலம் அனுப்பப்படுகிறது."
                  )
                )}
              </p>
            </div>
          </div>

          {/* Detailed Policy Text */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 space-y-8 text-foreground/90 leading-relaxed">
            {/* 1. Digital Programs */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PackageCheck className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("1. Digital Programs & Online Courses", "1. இணையதள பயிற்சிகள் & ஆன்லைன் வகுப்புகள்"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "All online initiations, meditation webinars, study materials, and video lectures are delivered purely digitally. As soon as your registration is completed, you will receive an instant confirmation email with login credentials and access to your personal Student Dashboard (/dashboard). No physical shipping fee is charged for digital courses.",
                    "அனைத்து ஆன்லைன் தீட்சைகள், தியான பயிற்சிகள் மற்றும் வீடியோ வகுப்புகள் டிஜிட்டல் முறையில் வழங்கப்படுகின்றன. பதிவு முடிந்தவுடன் உங்கள் மின்னஞ்சலுக்கு உள்நுழைவு விவரங்கள் உடனே அனுப்பப்படும். டிஜிட்டல் வகுப்புகளுக்கு எவ்வித அஞ்சல் கட்டணமும் கிடையாது."
                  )
                )}
              </p>
            </div>

            {/* 2. Physical Materials */}
            <div className="space-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-3">
                <Truck className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("2. Physical Materials, Sadhana Journals & Study Kits", "2. புத்தகங்கள், சாதனா டைரி & பயிற்சி உபகரணங்கள்"))}
                </h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  {t(
                    bi(
                      "When you order physical books, breath work journals, cotton meditation asanas, or retreat study kits, they are hand-inspected and dispatched with care within 24 to 48 hours (excluding Sundays and national holidays).",
                      "புத்தகங்கள், தியான விரிப்புகள் அல்லது பயிற்சி கையேடுகளை நீங்கள் வாங்கும்போது, அவை 24 முதல் 48 மணி நேரத்திற்குள் பரிசோதிக்கப்பட்டு பாதுகாப்பாக அனுப்பி வைக்கப்படும்."
                    )
                  )}
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>
                    <strong className="text-foreground">{t(bi("Tamil Nadu & South India:", "தமிழ்நாடு & தென்னிந்தியா:"))}</strong>{" "}
                    {t(bi("Usually delivered within 2–3 business days.", "வழக்கமாக 2 முதல் 3 வேலை நாட்களில் வந்து சேரும்."))}
                  </li>
                  <li>
                    <strong className="text-foreground">{t(bi("Rest of India:", "இந்தியாவின் பிற பகுதிகள்:"))}</strong>{" "}
                    {t(bi("Delivered within 4–6 business days depending on location.", "4 முதல் 6 வேலை நாட்களில் வந்து சேரும்."))}
                  </li>
                  <li>
                    <strong className="text-foreground">{t(bi("International Orders:", "சர்வதேச ஆர்டர்கள்:"))}</strong>{" "}
                    {t(bi("Dispatched via DHL Express or India Post EMS, arriving within 7–12 business days.", "7 முதல் 12 வேலை நாட்களில் சர்வதேச தபால் மூலம் வந்து சேரும்."))}
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. Tracking & Communication */}
            <div className="space-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("3. Order Tracking & SMS / Email Updates", "3. பார்சல் கண்காணிப்பு (Tracking) & அறிவிப்புகள்"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "Once your parcel is handed over to the courier partner, an email and SMS with your unique tracking number and courier tracking link will be sent to your registered contact details. You can track your shipment at any moment.",
                    "உங்கள் பார்சல் கொரியர் நிறுவனத்திடம் ஒப்படைக்கப்பட்டவுடன், டிராக்கிங் எண் (Tracking Number) மற்றும் இணைய இணைப்பு உங்கள் மின்னஞ்சல் மற்றும் மொபைல் எண்ணிற்கு அனுப்பப்படும்."
                  )
                )}
              </p>
            </div>

            {/* 4. Damaged or Lost Packages */}
            <div className="space-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-3">
                <HelpCircle className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("4. Damaged or Delayed Packages", "4. சேதமடைந்த அல்லது தாமதமான பார்சல்கள்"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "In the rare event that your physical parcel arrives damaged or is delayed beyond normal transit times, please do not worry. Simply email hello@thekriyalab.com with your Order ID and photos of the damage. We will immediately arrange a free replacement without making you run around.",
                    "ஏதேனும் அரிதான காரணத்தால் உங்கள் பார்சல் சேதமடைந்திருந்தாலோ அல்லது தாமதமானாலோ கவலைப்பட வேண்டாம். உங்கள் ஆர்டர் எண் மற்றும் படங்களை hello@thekriyalab.com என்ற மின்னஞ்சலுக்கு அனுப்புங்கள்; உடனடியாக மாற்று பார்சல் அனுப்பி வைக்கப்படும்."
                  )
                )}
              </p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
