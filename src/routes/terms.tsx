import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { Scale, HeartHandshake, BookOpen, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Terms & Conditions | THE KRIYA LAB" },
      {
        name: "description",
        content: "Transparent, human-written terms of participation and ethical guidelines for students of THE KRIYA LAB.",
      },
    ],
  }),
  component: TermsPage,
});

export function TermsPage() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHero
        showBackToHome={false}
        eyebrow={t(bi("Ethical Guidelines & Code of Harmony", "நெறிமுறைகள் & வழிகாட்டுதல்கள்"))}
        title={t(bi("Terms & Conditions", "விதிமுறைகள் & நிபந்தனைகள்"))}
        intro={t(
          bi(
            "These terms are written in clear, human language to set sincere expectations, protect the sacred purity of the lineage teachings, and foster a supportive environment for every sadhaka.",
            "இந்த விதிமுறைகள் தெளிவான மனித மொழியில் எழுதப்பட்டுள்ளன; போதனைகளின் புனிதத்தன்மையை காக்கவும், ஒவ்வொரு சாதகருக்கும் அமைதியான சூழலை வழங்கவும் இவை உருவாக்கப்பட்டுள்ளன."
          )
        )}
      />

      <Section className="!pt-4 sm:!pt-6 !pb-10 sm:!pb-14">
        <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
          {/* Core Pillars */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <HeartHandshake className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {t(bi("Sacred Trust", "புனிதமான நம்பிக்கை"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "We approach the teaching as a sacred duty, not a commercial transaction, and we ask for the same sincerity from students.",
                    "கற்பித்தலை ஒரு புனிதக் கடமையாகக் கருதுகிறோம்; மாணவர்களிடமிருந்தும் அதே நேர்மையை எதிர்பார்க்கிறோம்."
                  )
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <BookOpen className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {t(bi("Personal Sadhana", "தனிப்பட்ட சாதனா"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "Initiated techniques and course materials are provided exclusively for your own personal daily practice and spiritual growth.",
                    "வழங்கப்படும் பயிற்சிகள் மற்றும் கையேடுகள் உங்களின் சொந்த ஆன்மிக வளர்ச்சிக்காக மட்டுமே வழங்கப்படுகின்றன."
                  )
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-xs">
              <div className="size-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {t(bi("Safe & Mindful", "பாதுகாப்பான பயிற்சி"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "Always practice within your physical capacity and follow the teacher's recommendations carefully.",
                    "உங்கள் உடல் வலிமைக்கேற்ப பயிற்சி செய்யுங்கள்; ஆசிரியரின் வழிகாட்டல்களை கவனமாகப் பின்பற்றுங்கள்."
                  )
                )}
              </p>
            </div>
          </div>

          {/* Detailed Policy Text */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 space-y-8 text-foreground/90 leading-relaxed">
            {/* 1. Nature of the Practice */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("1. Nature of the Teaching & Personal Responsibility", "1. பயிற்சியின் தன்மை & தனிநபர் பொறுப்பு"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "Kriya Yoga as taught by THE KRIYA LAB is an ancient spiritual science focusing on breathwork, concentration, and inner stillness. It is designed to foster heightened awareness and mental clarity. It is not intended to diagnose, treat, cure, or replace professional medical or psychiatric advice. Practitioners are responsible for their own health and should inform the teacher of any severe medical conditions prior to breath retention practices.",
                    "தி கிரியா லேப்பில் கற்பிக்கப்படும் கிரியா யோகம் என்பது விழிப்புணர்வு மற்றும் மன அமைதிக்கான ஆன்மிக அறிவியல். இது மருத்துவ சிகிச்சைக்கு மாற்றானது அல்ல. உங்கள் உடல்நிலைக்கு ஏற்ப பயிற்சியை மேற்கொள்வது உங்களின் சொந்த பொறுப்பாகும்."
                  )
                )}
              </p>
            </div>

            {/* 2. Protection of Lineage Teachings */}
            <div className="space-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("2. Lineage Materials & Intellectual Honesty", "2. பாடக் குறிப்புகள் & அறிவுசார் உரிமை"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "All instructional materials, proprietary breath diagrams, audio files, and guided meditation recordings provided to you are for your individual, private sadhana. To protect the authentic lineage and prevent misguidance, you agree not to re-record, copy, resell, or distribute these materials publicly or commercially without written authorization.",
                    "வழங்கப்படும் அனைத்து பயிற்சி கையேடுகள், ஒலிப்பதிவுகள் மற்றும் விளக்கப் படங்கள் உங்களின் தனிப்பட்ட பயிற்சிக்காக மட்டுமே. போதனைகளின் உண்மைத்தன்மையை பாதுகாக்க, அவற்றை மறுவிற்பனை செய்யவோ அல்லது அனுமதியின்றி பொதுவில் வெளியிடவோ கூடாது."
                  )
                )}
              </p>
            </div>

            {/* 3. Community Conduct & Ashram Harmony */}
            <div className="space-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-3">
                <HeartHandshake className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("3. Classroom & Retreat Harmony", "3. வகுப்பறை & முகாம் நல்லிணக்கம்"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "We strive to maintain a warm, satvik, and respectful environment in all our live webinars and in-person retreats. We expect all attendees to treat teachers, ashram staff, and fellow seekers with kindness and dignity. THE KRIYA LAB reserves the right to decline or revoke admission to any participant exhibiting disruptive, disrespectful, or fraudulent behavior.",
                    "நேரலை வகுப்புகள் மற்றும் தியான முகாம்களில் அமைதியான மற்றும் மரியாதையான சூழலைப் பேண வேண்டும். ஆசிரியர்கள் மற்றும் சக மாணவர்களிடம் கனிவுடனும் கண்ணியத்துடனும் நடந்துகொள்ள வேண்டும்."
                  )
                )}
              </p>
            </div>

            {/* 4. Enrolment & Refund Policy Link */}
            <div className="space-y-3 border-t border-border/60 pt-6">
              <div className="flex items-center gap-3">
                <Scale className="size-5 text-gold shrink-0" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t(bi("4. Program Enrolment & Fair Refund Terms", "4. பயிற்சிப் பதிவு & பணத்தைத் திரும்பப் பெறுதல்"))}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  bi(
                    "All tuition fees are stated clearly at checkout with no hidden charges. If you need to reschedule a missed session or request a cancellation, our procedures are governed by our human-centred ",
                    "கட்டண விவரங்கள் அனைத்தும் வெளிப்படையாகத் தெரிவிக்கப்பட்டுள்ளன. வகுப்புகளை ரத்து செய்ய அல்லது தேதி மாற்ற எங்கள் "
                  )
                )}
                <Link to="/returns-and-refunds" className="text-gold font-semibold hover:underline">
                  {t(bi("Returns & Refund Policy", "திரும்பப் பெறுதல் கொள்கை"))}
                </Link>
                {t(
                  bi(
                    ", which offers 100% pre-session refunds and flexible rescheduling.",
                    "-யைப் பார்வையிடலாம்."
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
