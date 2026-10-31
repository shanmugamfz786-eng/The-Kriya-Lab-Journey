import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { RotateCcw, HeartHandshake, CalendarCheck, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/returns-and-refunds")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy | THE KRIYA LAB" },
      {
        name: "description",
        content: "Clear, fair, and human-centred refund, cancellation, and rescheduling guidelines for THE KRIYA LAB programs and materials.",
      },
    ],
  }),
  component: ReturnsAndRefundsPage,
});

export function ReturnsAndRefundsPage() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHero
        showBackToHome={false}
        eyebrow={t(bi("Customer Help & Policies", "வாடிக்கையாளர் உதவி & கொள்கைகள்"))}
        title={t(bi("Returns & Refund Policy", "திரும்பப் பெறுதல் & பணத்தைத் திருப்பி அளித்தல் கொள்கை"))}
        intro={t(
          bi(
            "We believe that a spiritual path must be built on trust, empathy, and clear mutual respect. If circumstances change or something doesn't work out as planned, here is our straightforward, honest policy.",
            "ஆன்மிகப் பயணம் என்பது பரஸ்பர நம்பிக்கை மற்றும் நேர்மையின் அடிப்படையில் அமைய வேண்டும் என்று நாங்கள் நம்புகிறோம். உங்கள் சூழல்கள் மாறும்போது எங்களின் நியாயமான கொள்கைகள் இதோ."
          )
        )}
      />

      <Section className="!pt-4 sm:!pt-6 !pb-10 sm:!pb-14">
        <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
          {/* Core Guarantees Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-center space-y-2 shadow-xs">
              <div className="size-10 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <CalendarCheck className="size-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-foreground">
                {t(bi("Flexible Rescheduling", "நெகிழ்வான தேதி மாற்றம்"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">
                {t(
                  bi(
                    "Missed an online batch due to personal emergency? Transfer to the very next batch at zero extra fee.",
                    "அவசர சூழலால் குறிப்பிட்ட வகுப்பில் கலந்து கொள்ள முடியாவிட்டால், அடுத்த வகுப்பிற்கு கூடுதல் கட்டணமின்றி மாறலாம்."
                  )
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-center space-y-2 shadow-xs">
              <div className="size-10 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <RotateCcw className="size-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-foreground">
                {t(bi("Pre-Session Cancellation", "வகுப்புக்கு முன் ரத்து செய்தல்"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">
                {t(
                  bi(
                    "Request cancellation at least 24 hours prior to a webinar/program commencement for a 100% full refund.",
                    "வகுப்பு தொடங்குவதற்கு 24 மணி நேரத்திற்கு முன் ரத்து செய்யக் கோரினால் 100% முழுத் தொகையும் திருப்பித் தரப்படும்."
                  )
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-center space-y-2 shadow-xs">
              <div className="size-10 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto">
                <HeartHandshake className="size-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-foreground">
                {t(bi("Fair Human Approach", "மனிதநேய அணுகுமுறை"))}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">
                {t(
                  bi(
                    "We don't hide behind automated robots. Write to our team with your situation and we will find a fair solution.",
                    "நாங்கள் ரோபோக்கள் அல்ல. உங்கள் சூழ்நிலையை எங்களிடம் கூறினால், உங்களுக்கு சாதகமான நியாயமான முடிவை எடுப்போம்."
                  )
                )}
              </p>
            </div>
          </div>

          {/* Full Policy Body */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-6 text-foreground/90 leading-relaxed shadow-sm">
            {/* 1. Online Programs */}
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-gold shrink-0" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  {t(bi("1. Online Initiations & Interactive Webinars", "1. ஆன்லைன் தீட்சைகள் & நேரலை வகுப்புகள்"))}
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-2 font-light leading-relaxed">
                <p>
                  {t(
                    bi(
                      "When you enroll in an online Kriya initiation course or meditation batch, our teachers prepare limited-capacity seats to maintain personal interaction.",
                      "நீங்கள் ஆன்லைன் கிரியா யோகப் பயிற்சியில் சேரும்போது, தனிப்பட்ட கவனிப்பிற்காக குறைந்த எண்ணிக்கையிலான மாணவர்களே அனுமதிக்கப்படுகிறார்கள்."
                    )
                  )}
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>
                    <strong className="text-foreground">{t(bi("Cancellation 24+ Hours Before Session:", "வகுப்புக்கு 24 மணி நேரத்திற்கு முன் ரத்து செய்தால்:"))}</strong>{" "}
                    {t(
                      bi(
                        "You receive a 100% full refund credited back to your original payment method.",
                        "உங்களின் முழுத் தொகையும் 100% வங்கிக் கணக்கிற்குத் திருப்பித் தரப்படும்."
                      )
                    )}
                  </li>
                  <li>
                    <strong className="text-foreground">{t(bi("Unforeseen Emergencies or Missed Sessions:", "அவசர சூழலில் தவறவிட்ட வகுப்புகள்:"))}</strong>{" "}
                    {t(
                      bi(
                        "If you are unable to attend due to health or family emergency, your seat is kept safe. You can attend the subsequent batch without paying anything extra.",
                        "உடல்நலக் குறைவு அல்லது குடும்ப அவசரத்தால் தவறவிட்டால், அடுத்த வகுப்பில் கூடுதல் கட்டணமின்றி பங்கேற்கலாம்."
                      )
                    )}
                  </li>
                  <li>
                    <strong className="text-foreground">{t(bi("After Transmission of Practice:", "பயிற்சி வழங்கப்பட்ட பின்:"))}</strong>{" "}
                    {t(
                      bi(
                        "Once the secret technique of Kriya Pranayama has been formally taught and transmitted, fees are non-refundable as the spiritual knowledge has already been imparted.",
                        "கிரியா யோக சுவாசப் பயிற்சி முறையாகக் கற்பிக்கப்பட்ட பின், அது திரும்பப் பெற முடியாத ஆன்மிக ஞானம் என்பதால் கட்டணம் திருப்பித் தரப்படாது."
                      )
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. Residential Retreats */}
            <div className="space-y-2 sm:space-y-2.5 border-t border-border/60 pt-5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-gold shrink-0" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  {t(bi("2. Offline Retreats & In-Person Deeksha Camps", "2. நேரடி முகாம்கள் & தங்கும் பயிற்சி வகுப்புகள்"))}
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-2 font-light leading-relaxed">
                <p>
                  {t(
                    bi(
                      "For offline immersion retreats (in locations such as Coimbatore, Himalayas, or Chennai), we commit upfront costs for venue accommodation, satvik meals, and meditation hall reservations.",
                      "நேரடி தியான முகாம்களுக்கு தங்குமிடம் மற்றும் சாத்வீக உணவு ஏற்பாடுகள் முன்கூட்டியே செய்யப்படுகின்றன."
                    )
                  )}
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>
                    <strong className="text-foreground">{t(bi("7 Days Prior Notice:", "7 நாட்களுக்கு முன் அறிவித்தால்:"))}</strong>{" "}
                    {t(
                      bi(
                        "80% refund (20% covers pre-paid venue administration) or a 100% credit pass toward any upcoming retreat within 12 months.",
                        "80% பணம் திருப்பித் தரப்படும் அல்லது அடுத்த 12 மாதங்களுக்குள் நடக்கும் எந்த முகாமிலும் 100% வரவு வைக்கப்படும்."
                      )
                    )}
                  </li>
                  <li>
                    <strong className="text-foreground">{t(bi("Seat Transfer to Friend/Family:", "நண்பர் அல்லது குடும்பத்தினருக்கு மாற்றுதல்:"))}</strong>{" "}
                    {t(
                      bi(
                        "If you cannot attend, you may transfer your confirmed seat to a sincere family member or friend with prior teacher consent.",
                        "நீங்கள் வர இயலாவிட்டால், உங்கள் அனுமதியுடன் உங்கள் இடத்தை குடும்பத்தினர் அல்லது நண்பருக்கு மாற்றிக் கொள்ளலாம்."
                      )
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. Physical Sadhana Goods */}
            <div className="space-y-2 sm:space-y-2.5 border-t border-border/60 pt-5">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="size-4 text-gold shrink-0" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  {t(bi("3. Physical Items (Books, Mats, Sadhana Kits)", "3. புத்தகங்கள், தியான விரிப்புகள் & கையேடுகள்"))}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                {t(
                  bi(
                    "You may return any unopened, unused physical item within 14 days of delivery for a replacement or refund. If an item arrives broken or damaged during transit, take a quick photo and email us — we will immediately send a fresh copy at zero extra cost.",
                    "பயன்படுத்தப்படாத பொருட்களை 14 நாட்களுக்குள் திரும்ப அனுப்பி மாற்றுப் பொருளையோ அல்லது பணத்தையோ பெற்றுக்கொள்ளலாம். அஞ்சலில் சேதமடைந்திருந்தால் உடனடியாக புதிய பொருள் அனுப்பி வைக்கப்படும்."
                  )
                )}
              </p>
            </div>

            {/* 4. Refund Process Timeline */}
            <div className="space-y-2 sm:space-y-2.5 border-t border-border/60 pt-5">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-gold shrink-0" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  {t(bi("4. How to Request & Processing Timeline", "4. பணத்தை திரும்பப் பெறுவது எப்படி?"))}
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5 font-light leading-relaxed">
                <p>
                  {t(
                    bi(
                      "To request a refund or reschedule, email hello@thekriyalab.com with your registered email, program name, and payment receipt or Order ID.",
                      "பணத்தை திரும்பப் பெற அல்லது தேதி மாற்ற, உங்கள் பதிவு மின்னஞ்சல் மற்றும் ரசீதுடன் hello@thekriyalab.com என்ற மின்னஞ்சலுக்கு செய்தி அனுப்பவும்."
                    )
                  )}
                </p>
                <p>
                  {t(
                    bi(
                      "Refunds are approved within 24 to 48 hours and credited back directly to your source bank account, UPI ID, or credit card within 5 to 7 working days, depending on your bank's clearing cycle.",
                      "கோரிக்கைகள் 48 மணி நேரத்திற்குள் அங்கீகரிக்கப்பட்டு, உங்கள் வங்கிக் கணக்கு அல்லது UPI-க்கு 5 முதல் 7 வேலை நாட்களில் பணம் வரவு வைக்கப்படும்."
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
