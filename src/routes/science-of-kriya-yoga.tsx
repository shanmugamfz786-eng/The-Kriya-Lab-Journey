import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { ui } from "@/content/site";

export const Route = createFileRoute("/science-of-kriya-yoga")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "The Science of Kriya Yoga | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "How Kriya literature describes the relationship between breath control, spinal energy and the pace of human evolution.",
      },
      { property: "og:title", content: "The Science of Kriya Yoga" },
      {
        property: "og:description",
        content: "Breath, nervous system, attention, mind and awareness — explained in accessible modern language.",
      },
    ],
  }),
  component: SciencePage,
});

const blocks = [
  {
    n: "01",
    title: bi("The natural evolutionary baseline", "இயற்கை பரிணாம அடிப்படை"),
    body: [
      bi(
        "According to the traditional accounts of the rishis, a human being requires roughly one million years of disease-free natural evolution for the brain and nervous system to sufficiently refine and safely sustain cosmic consciousness.",
        "பாரம்பரிய ரிஷிகளின் விளக்கத்தின்படி, மூளையும் நரம்பு மண்டலமும் பரிபூரணமடைந்து பரமஉணர்வைத் தாங்கும் அளவுக்கு மனிதனுக்கு ஏறத்தாழ பத்து லட்சம் ஆண்டுகள் நோயற்ற இயற்கை பரிணாமம் தேவைப்படுகிறது.",
      ),
      bi(
        "For an individual living out of rhythm with nature or carrying heavier karmic burden, that timeline is described as doubling to two million years. Under natural conditions the body and brain cells are said to be advanced by the planetary environment in twelve-year cycles.",
        "இயற்கையுடன் இணக்கமின்றி வாழ்பவருக்கு அல்லது கனமான கர்ம சுமை உள்ளவருக்கு, அந்தக் காலம் இரு மடங்காக — இருபது லட்சம் ஆண்டுகளாக — விவரிக்கப்படுகிறது. இயற்கை நிலையில் உடலும் மூளை செல்களும் கிரக சூழலால் பன்னிரண்டு ஆண்டு சுழற்சிகளில் முன்னேற்றப்படுவதாகக் கூறப்படுகிறது.",
      ),
    ],
  },
  {
    n: "02",
    title: bi("The Kriya equation", "கிரியா சமன்பாடு"),
    body: [
      bi(
        "Kriya literature describes an internal shortcut: thirty seconds of Kriya breath — the time taken to mentally revolve the life force up and down the six spinal centres — is said to correspond to one year of natural evolutionary refinement.",
        "கிரியா இலக்கியம் ஒரு உள்முக குறுக்குவழியை விவரிக்கிறது: முப்பது வினாடி கிரியா சுவாசம் — உயிராற்றலை ஆறு முதுகுத்தண்டு மையங்களில் மேலும் கீழும் மனதால் சுழற்ற எடுக்கும் நேரம் — ஒரு ஆண்டு இயற்கை பரிணாமத்திற்குச் சமமாகக் கூறப்படுகிறது.",
      ),
    ],
    formula: bi("30 seconds of Kriya breath = 1 year of natural evolution", "30 வினாடி கிரியா சுவாசம் = 1 ஆண்டு இயற்கை பரிணாமம்"),
  },
  {
    n: "03",
    title: bi("Compounding through practice", "பயிற்சியால் பெருகும் விளைவு"),
    body: [
      bi(
        "Because the relationship is described as linear, 1,000 Kriyas practised over eight hours are said to correspond to 1,000 years of natural growth in a single day — and, practised consistently, some 365,000 years in a year. On this reckoning, an advanced and highly disciplined practitioner is said to accomplish in three years what nature would take a million years to achieve.",
        "இந்த உறவு நேர்கோட்டானது என விவரிக்கப்படுவதால், எட்டு மணி நேரத்தில் 1,000 கிரியாக்கள் ஒரே நாளில் 1,000 ஆண்டுகள் இயற்கை வளர்ச்சிக்குச் சமமாகக் கூறப்படுகிறது — தொடர்ந்து பயின்றால் ஒரு ஆண்டில் சுமார் 3,65,000 ஆண்டுகள். இக்கணக்கின்படி, மிக ஒழுக்கமான மேம்பட்ட சாதகர் மூன்று ஆண்டுகளில் இயற்கை பத்து லட்சம் ஆண்டுகளில் செய்வதை அடைவதாகக் கூறப்படுகிறது.",
      ),
    ],
  },
  {
    n: "04",
    title: bi("Why the technique is said to accelerate", "இத்தொழில்நுட்பம் ஏன் விரைவுபடுத்துகிறது"),
    body: [
      bi(
        "The literature explains that natural human evolution is slow because the body cannot absorb a large influx of spiritual energy without straining the nervous system. Kriya practice is described as calming the breath, slowing the heart and allowing the life force to withdraw from the outer senses and flow along the spine. Over time this steady flow is said to recharge and gradually modify the fine brain cells so they can sustain a higher intensity of awareness within a single lifetime.",
        "நரம்பு மண்டலத்தை சிரமப்படுத்தாமல் உடல் ஒரே நேரத்தில் அதிக ஆன்மிக ஆற்றலை உள்வாங்க முடியாததால் இயற்கை பரிணாமம் மெதுவாக இருக்கிறது என இலக்கியம் விளக்குகிறது. கிரியா பயிற்சி சுவாசத்தை அமைதிப்படுத்தி, இதயத்தை மெதுவாக்கி, உயிராற்றலை புற புலன்களிலிருந்து விலக்கி முதுகுத்தண்டில் பாய அனுமதிக்கிறது. காலப்போக்கில் இந்த நிலையான ஓட்டம் நுட்பமான மூளை செல்களை மீள்நிரப்பி, ஒரே வாழ்நாளில் உயர்ந்த விழிப்புணர்வைத் தாங்கும் வகையில் படிப்படியாக மாற்றுவதாகக் கூறப்படுகிறது.",
      ),
    ],
  },
];

function SciencePage() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t(bi("Science of Kriya Yoga", "கிரியா யோகத்தின் அறிவியல்"))}
        title={t(bi("A psycho-physiological accelerator", "ஒரு மனோ-உடலியல் விரைவுப்படுத்தி"))}
        intro={t(
          bi(
            "In Kriya Yoga literature — most famously in Chapter 26 of Autobiography of a Yogi — the pace of human evolution is described through a precise relationship between breath control, spinal energy and cosmic time.",
            "கிரியா யோக இலக்கியத்தில் — குறிப்பாக 'ஒரு யோகியின் சுயசரிதை' நூலின் 26வது அத்தியாயத்தில் — சுவாசக் கட்டுப்பாடு, முதுகுத்தண்டு ஆற்றல் மற்றும் காலத்திற்கு இடையிலான துல்லியமான உறவின் மூலம் மனித பரிணாம வேகம் விவரிக்கப்படுகிறது.",
          ),
        )}
      />

      <Section>
        <div className="space-y-20">
          {blocks.map((b) => (
            <article key={b.n} className="grid gap-8 lg:grid-cols-[10rem_1fr]">
              <div>
                <span className="font-serif text-5xl text-gold/70">{b.n}</span>
              </div>
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl">{t(b.title)}</h2>
                <div className="measure mt-5 space-y-5 leading-relaxed text-muted-foreground">
                  {b.body.map((p, i) => (
                    <p key={i}>{t(p)}</p>
                  ))}
                </div>
                {b.formula ? (
                  <p className="mt-8 border-l-2 border-gold pl-6 font-serif text-2xl lg:text-3xl">
                    {t(b.formula)}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <Eyebrow>{t(bi("An important note", "ஒரு முக்கியக் குறிப்பு"))}</Eyebrow>
        <p className="measure mt-5 text-muted-foreground">
          {t(
            bi(
              "These descriptions come from traditional Kriya literature. They are presented as the framework within which this school practises, not as clinically verified medical or scientific findings. Kriya Yoga is not a treatment for any illness, and nothing here should replace medical advice.",
              "இந்த விளக்கங்கள் பாரம்பரிய கிரியா இலக்கியத்திலிருந்து வருகின்றன. இவை மருத்துவ ரீதியாக உறுதிப்படுத்தப்பட்ட கண்டுபிடிப்புகள் அல்ல; இப்பள்ளி பயிற்சி செய்யும் கட்டமைப்பாக மட்டுமே வழங்கப்படுகின்றன. கிரியா யோகம் எந்த நோய்க்கும் சிகிச்சை அல்ல; இது மருத்துவ ஆலோசனைக்கு மாற்று அல்ல.",
            ),
          )}
        </p>
        <Link
          to="/enroll"
          className="mt-10 inline-block rounded-full bg-velvet px-8 py-3.5 text-sm text-primary-foreground transition-colors hover:bg-primary"
        >
          {t(bi("Experience Kriya Yoga", "கிரியா யோகத்தை அனுபவியுங்கள்"))} · {t(ui.begin)}
        </Link>
      </Section>
    </>
  );
}
