import { createFileRoute } from "@tanstack/react-router";
import { Section, Eyebrow, CTARow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { koshas } from "@/content/site";
import babajiImage from "@/assets/images/sri-guru-babaji.jpg";

export const Route = createFileRoute("/kriya-yoga")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Kriya Yoga — An Ancient Practice for Inner Exploration | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "What Kriya Yoga is, why breath matters, and how observation and meditation form a path of direct inner exploration.",
      },
      { property: "og:title", content: "Kriya Yoga — An Ancient Practice for Inner Exploration" },
      {
        property: "og:description",
        content: "Breath, awareness and the five layers of experience at THE KRIYA LAB.",
      },
    ],
  }),
  component: KriyaYoga,
});

const sections = [
  {
    title: bi("What is Kriya Yoga?", "கிரியா யோகம் என்றால் என்ன?"),
    body: bi(
      "Kriya Yoga is an ancient yogic system of energy and breath management  (pranayama) designed to rapidly accelerate spiritual growth and unite the soul with the Infinite. The word kriya comes from the Sanskrit root kri, meaning \"to do, to act and react\". In practice, it involves mental concentration and specialized breathing that circulates life force (prana) up and down the spine.It is a traditional yogic path in which conscious breathing, inner observation and meditation are used to study one's own experience directly. It is presented here as a practice, not as a belief to be accepted. According to Siddhar Pathanjali “kriya” is : “Purificatory action, practice, exercise, or rite; movement; function; skill. Kriyas purify the body and nervous system as well as the subtle bodies to enable the yogi to reach and hold on to higher levels of consciousness and being. And Kriya Yoga as: “The Yoga of Purification: ‘Austerity (tapasya), self-study (swadhyaya), and offering of the life to God (Ishwara pranidhana) are Kriya Yoga’ (Yoga Sutras 2:1).” ",
      "விழிப்புடன் கூடிய சுவாசம், உள்முக கவனிப்பு மற்றும் தியானத்தின் மூலம் தன் அனுபவத்தை நேரடியாக ஆராயும் ஒரு பாரம்பரிய யோக வழி கிரியா யோகம். இது ஏற்றுக்கொள்ள வேண்டிய நம்பிக்கையாக அல்ல, பயிற்சியாக இங்கே வழங்கப்படுகிறது.",
    ),
  },
  {
    title: bi("Why Breath? ", "ஏன் சுவாசம்?"),
    body: bi(
      "Breath is the one physiological process that is both automatic and voluntary. It is therefore the most accessible doorway between body, Mind ,nervous system and awareness.As breathing becomes slow and even, attention becomes less scattered. What was background noise becomes observable. ·\u00a0\u00a0 Breath and Mind Connection: The Kriya Yoga practice teaches that breath and mental restlessness are linked; by calming the breath, the practitioner stills the mind. Energy Control: Practitioners learn to mentally direct energy through the spinal centers, reducing dependence on external sensory inputs and oxygen.",
      "தானாக நடப்பதும், விருப்பப்படி மாற்றக்கூடியதுமான ஒரே உடலியல் செயல்பாடு சுவாசம். எனவே உடல், நரம்பு மண்டலம் மற்றும் கவனத்திற்கு இடையிலான மிக எளிதான வாயில் இதுவே.",
    ),
  },
  {
    title: bi("\n", "சுவாசமும் விழிப்புணர்வும்"),
    body: bi(
      "\n",
      "சுவாசம் மெதுவாகவும் சமமாகவும் ஆகும்போது, கவனம் சிதறுவது குறைகிறது. பின்னணி இரைச்சலாக இருந்தது கவனிக்கத்தக்கதாக மாறுகிறது.",
    ),
  },
  {
    title: bi("Meditation and Inner Observation", "தியானமும் உள்முக கவனிப்பும்"),
    body: bi(
      "Meditation here means sustained, non-interfering observation — watching what arises without trying to correct it.\n\n\n\nInner Stillness:  It aims to shift consciousness away from worldly distractions toward inner realization and divine communion.\n\n ",
      "இங்கே தியானம் என்பது தலையிடாத, தொடர்ச்சியான கவனிப்பு — எழுவதைத் திருத்த முயலாமல் கவனிப்பது.",
    ),
  },
  {
    title: bi("The fundamental philosophy of Kriya Yoga", "பயிற்சியும் மாற்றமும்"),
    body: bi(
      "The fundamental philosophy of Kriya Yoga is that spiritual evolution can be scientifically accelerated by working directly with the body's energy. It is considered a path of Raja Yoga (the royal path of meditation), focusing on self-realization rather than blind belief",
      "மாற்றம் படிப்படியானது, சேர்ந்து வளர்வது. தீவிரத்தை விட தொடர்ச்சியும், வேகத்தை விட பாதுகாப்பும் முக்கியம்.",
    ),
  },
  {
    title: bi("The Spinal Highway", "கிரியா யோகத்தை யார் ஆராயலாம்?"),
    body: bi(
      "In Kriya Yoga philosophy, the human spine and brain are the altar of God-consciousness. The spine contains six subtle energy centers (chakras). By circulating life force (prana) around these centers, a practitioner neutralizes past karma and clears spiritual blocks.",
      "உண்மையான ஆர்வம் உள்ள எவரும் விசாரிக்கலாம். தகுதி, உடல்நலக் கருத்துகள் மற்றும் பயிற்சி வேகம் ஆசிரியருடன் முன்கூட்டியே பேசப்படும்.",
    ),
  },
];

const chain = [
  bi("Breath", "சுவாசம்"),
  bi("Nervous system", "நரம்பு மண்டலம்"),
  bi("Attention", "கவனம்"),
  bi("Mind", "மனம்"),
  bi("Awareness", "விழிப்புணர்வு"),
];

function KriyaYoga() {
  const { t } = useLang();
  return (
    <>
      <header className="bg-dawn px-5 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28">
        <div className="mx-auto grid max-w-7xl animate-rise items-center gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <Eyebrow>{t(bi("Kriya Yoga", "கிரியா யோகம்"))}</Eyebrow>
            <h1 className="mt-5 max-w-4xl whitespace-pre-line text-balance font-serif text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.05]">
              {t(bi("An Ancient Practice for Inner Exploration", "உள்முக ஆய்வுக்கான ஒரு பண்டைய பயிற்சி"))}
            </h1>
            <p className="measure mt-7 whitespace-pre-line text-lg text-muted-foreground">
              {t(
                bi(
                  "An overview of the practice, approached experientially and without exaggerated claims.",
                  "மிகைப்படுத்தப்பட்ட கூற்றுகள் இன்றி, அனுபவ ரீதியாக அணுகப்படும் பயிற்சியின் ஒரு பார்வை.",
                ),
              )}
            </p>
          </div>
          <figure className="aura-image mx-auto w-full max-w-[260px] lg:max-w-none">
            <img
              src={babajiImage}
              alt={t(bi("Sri Guru Babaji", "ஸ்ரீ குரு பாபாஜி"))}
              className="aspect-[3/4] w-full rounded-sm border border-gold/30 object-cover shadow-xl"
              loading="eager"
            />
            <figcaption className="mt-3 text-center text-xs tracking-widest text-muted-foreground uppercase">
              {t(bi("Sri Guru Babaji", "ஸ்ரீ குரு பாபாஜி"))}
            </figcaption>
          </figure>
        </div>
      </header>

      <Section>
        <div className="grid gap-x-16 gap-y-14 md:grid-cols-2">
          {sections.map((s, i) => (
            <article key={i}>
              <span className={`whitespace-pre-line font-serif ${i === 2 ? "text-[19px] text-black" : "text-2xl text-gold"}`}>
                {i === 2
                  ? "03 \nBreath and Mind Connection: The Yoga practice teaches that breath and mental restlessness are linked; by calming the breath, the practitioner stills the mind.  Energy Control: Practitioners learn to mentally direct energy through the spinal centers, reducing dependence on external sensory inputs and oxygen.   \n\n"
                  : `0${i + 1}`}
              </span>
              <h2 className={`mt-4 font-serif ${i === 2 ? "text-[19px] text-black" : "text-3xl"}`}>{t(s.title)}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{t(s.body)}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <Eyebrow>{t(bi("The chain of practice", "பயிற்சியின் தொடர்"))}</Eyebrow>
        <ol className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-5">
          {chain.map((c, i) => (
            <li key={i} className="flex items-center gap-4">
              <span className="font-serif text-2xl lg:text-3xl">{t(c)}</span>
              {i < chain.length - 1 ? <span className="text-gold">→</span> : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <Eyebrow>{t(bi("Five layers of experience", "அனுபவத்தின் ஐந்து அடுக்குகள்"))}</Eyebrow>
        <div className="mt-10 grid gap-px bg-border md:grid-cols-5">
          {koshas.map((k) => (
            <div key={k.key} className="bg-background p-6">
              <h3 className="font-serif text-xl">{t(k.name)}</h3>
              <p className="mt-2 text-xs tracking-widest text-gold uppercase">{t(k.label)}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(k.body)}</p>
            </div>
          ))}
        </div>
        <CTARow className="mt-14" />
      </Section>
    </>
  );
}
