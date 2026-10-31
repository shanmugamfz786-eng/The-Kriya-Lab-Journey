import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { ShieldCheck, Lock, EyeOff, UserCheck, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Policy | THE KRIYA LAB" },
      {
        name: "description",
        content: "Transparent, human-written privacy policy explaining how THE KRIYA LAB protects your personal information and spiritual journey.",
      },
    ],
  }),
  component: PrivacyPage,
});

export function PrivacyPage() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHero
        eyebrow={t(bi("Trust & Transparency", "நம்பிக்கை & வெளிப்படைத்தன்மை"))}
        title={t(bi("Privacy Policy", "தனியுரிமைக் கொள்கை"))}
        intro={t(
          bi(
            "At THE KRIYA LAB, we believe your spiritual practice is deeply personal and sacred. We treat your personal contact details and private inquiries with absolute discretion, integrity, and reverence.",
            "தி கிரியா லேப்பில், உங்கள் ஆன்மிகப் பயணம் மிகவும் புனிதமானது. உங்கள் தனிப்பட்ட விவரங்கள் மற்றும் கேள்விகளை மிகுந்த பாதுகாப்புடனும் மரியாதையுடனும் நாங்கள் கையாளுகிறோம்."
          )
        )}
      />

      <Section className="!pt-4 sm:!pt-6 !pb-10 sm:!pb-14">
        <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
          {/* Key Privacy Highlights */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <EyeOff className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {t(bi("Zero Data Selling", "தகவல் விற்பனை கிடையாது"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "We never sell, rent, or trade your contact info to data brokers or third-party marketers. Ever.",
                    "உங்கள் தொலைபேசி எண் அல்லது மின்னஞ்சலை எக்காரணம் கொண்டும் மூன்றாம் நபர்களுக்கு விற்கவோ பகிரவோ மாட்டோம்."
                  )
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <Lock className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {t(bi("Bank-Grade Security", "வங்கி தரத்திலான பாதுகாப்பு"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "Payments are processed securely via PCI-DSS certified gateways (Stripe & Razorpay) with end-to-end SSL.",
                    "கட்டணங்கள் அனைத்தும் உயர் பாதுகாப்புடன் கூடிய Stripe மற்றும் Razorpay மூலம் நேரடியாக நிர்வகிக்கப்படுகின்றன."
                  )
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <UserCheck className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {t(bi("Full Student Control", "உங்கள் முழு கட்டுப்பாடு"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "Update your profile, change details, or request full deletion of your account anytime with a single click or email.",
                    "உங்கள் விவரங்களை எப்போது வேண்டுமானாலும் மாற்றலாம் அல்லது கணக்கை முழுமையாக நீக்கக் கோரலாம்."
                  )
                )}
              </p>
            </div>
          </div>

          {/* Detailed Policy Text */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 space-y-8 text-foreground/90 leading-relaxed">
            {/* 1. Information We Collect */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("1. What Information We Collect and Why", "1. நாங்கள் சேகரிக்கும் தகவல்கள் & காரணம்"))}
                </h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  {t(
                    bi(
                      "We collect only the bare essential information required to offer you a thoughtful, high-quality sadhana experience:",
                      "உங்களுக்கு சிறந்த பயிற்சி அனுபவத்தை வழங்குவதற்கு தேவையான குறைந்தபட்ச தகவல்களை மட்டுமே நாங்கள் பெறுகிறோம்:"
                    )
                  )}
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>
                    <strong className="text-foreground">{t(bi("Account & Identity:", "பெயர் & மின்னஞ்சல்:"))}</strong>{" "}
                    {t(bi("Your name and email address to create your student portal account and send initiation access.", "உங்கள் மாணவர் கணக்கை உருவாக்கவும், வகுப்பு இணைப்புகளை அனுப்பவும்."))}
                  </li>
                  <li>
                    <strong className="text-foreground">{t(bi("Contact Number:", "தொலைபேசி எண்:"))}</strong>{" "}
                    {t(bi("To provide urgent reminders, session schedule updates, or retreat location guidance.", "வகுப்பு நேர மாற்றங்கள் அல்லது முகாம் பற்றிய அவசர அறிவிப்புகளுக்கு."))}
                  </li>
                  <li>
                    <strong className="text-foreground">{t(bi("Practice Preferences:", "சாதனா விருப்பங்கள்:"))}</strong>{" "}
                    {t(bi("Your selected display language (Tamil/English) and reminder choices saved to your account.", "உங்கள் விருப்ப மொழி மற்றும் நினைவூட்டல் அமைப்புகள்."))}
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. Medical & Spiritual Confidentiality */}
            <div className="space-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-3">
                <HeartHandshake className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("2. Confidentiality of Teacher Consultations", "2. ஆசிரியர் வழிகாட்டல் மற்றும் உடல்நல ரகசியத்தன்மை"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "Before deeksha or advanced pranayama, students may choose to share health background (such as spinal injuries, recent surgeries, or respiratory concerns) to ensure safe adaptation of practices. This information is treated as strictly sacred and confidential between you and the teaching guide. It is never shared with third parties.",
                    "தீட்சைக்கு முன் ஆசனங்கள் மற்றும் சுவாச பயிற்சிகளை சரியாக செய்ய மாணவர்கள் தங்கள் உடல்நல விவரங்களை ஆசிரியரிடம் பகிர்ந்துகொள்ளலாம். இத்தகவல்கள் முற்றிலும் ரகசியமாக வைக்கப்படும்; எவரிடமும் பகிரப்படாது."
                  )
                )}
              </p>
            </div>

            {/* 3. Payment Processing */}
            <div className="space-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-3">
                <Lock className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("3. Safe & Encrypted Payment Processing", "3. பாதுகாப்பான வங்கி பரிவர்த்தனைகள்"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "When you make a payment for a course or retreat, your transaction is processed directly through world-class, RBI & PCI-DSS Level 1 compliant payment gateways such as Stripe and Razorpay. THE KRIYA LAB never sees, handles, or stores your credit card numbers, debit card PINs, or net banking passwords.",
                    "கட்டண பரிவர்த்தனைகள் அனைத்தும் Stripe மற்றும் Razorpay போன்ற உயர் பாதுகாப்பு பெற்ற தளங்கள் வழியாக நடைபெறுகின்றன. உங்கள் கார்டு எண்கள் அல்லது வங்கி கடவுச்சொற்களை தி கிரியா லேப் சேமித்து வைப்பதில்லை."
                  )
                )}
              </p>
            </div>

            {/* 4. Student Rights & Data Deletion */}
            <div className="space-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-3">
                <UserCheck className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("4. Your Rights to Access & Account Deletion", "4. உங்கள் உரிமைகள் & கணக்கை நீக்குதல்"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "You have the right at any time to review your profile, update your personal details in Settings, or request complete removal of your records from our systems. If you ever wish to delete your account, simply email hello@thekriyalab.com, and we will fulfill your request promptly.",
                    "உங்கள் கணக்கு விவரங்களை எப்போது வேண்டுமானாலும் மாற்றலாம் அல்லது கணக்கை முழுமையாக நீக்குமாறு hello@thekriyalab.com என்ற மின்னஞ்சல் மூலம் கோரலாம்; உங்கள் கோரிக்கை உடனடியாக நிறைவேற்றப்படும்."
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
