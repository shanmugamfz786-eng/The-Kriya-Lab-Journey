import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow, CTARow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import agasthiyarImage from "@/assets/images/agasthiyar.jpg";

const AGASTHIYAR_MARKER = "Core Treatises of Siddhar Agasthiyar";

function FormattedSectionText({ text }: { text: string }) {
  const blocks = text
    .split("\n\n")
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base font-light">
      {blocks.map((block, i) => {
        const isHeading =
          block.startsWith("Core Treatises") ||
          block.startsWith("The Initiation") ||
          block.startsWith("The Evolution") ||
          block.startsWith("Traces in Kriya");

        if (isHeading) {
          return (
            <h3 key={i} className="font-serif text-xl sm:text-2xl font-bold text-gold pt-3 pb-0.5">
              {block}
            </h3>
          );
        }

        return (
          <p key={i} className="whitespace-pre-line">
            {block}
          </p>
        );
      })}
    </div>
  );
}

function BodyWithImage({ text }: { text: string }) {
  const cleanText = text
    .replace(/[\u00A0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, " ")
    .replace(/(\r\n|\n|\r){3,}/g, "\n\n")
    .trim();

  const idx = cleanText.indexOf(AGASTHIYAR_MARKER);
  if (idx === -1) {
    return (
      <div className="max-w-4xl mt-5">
        <FormattedSectionText text={cleanText} />
      </div>
    );
  }

  const before = cleanText.slice(0, idx).trim();
  const after = cleanText.slice(idx).trim();

  return (
    <div className="max-w-5xl mt-5">
      <FormattedSectionText text={before} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_18rem] items-start">
        <div className="lg:order-1">
          <FormattedSectionText text={after} />
        </div>

        <figure className="aura-image lg:order-2 lg:sticky lg:top-28">
          <img
            src={agasthiyarImage}
            alt="Traditional depiction of Siddhar Agasthiyar seated in meditation"
            loading="lazy"
            className="w-full rounded-2xl border border-border/80 object-cover shadow-md"
          />
          <figcaption className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground text-center">
            Siddhar Agasthiyar
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/siddha-tradition")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "The Siddha Tradition | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "Historical and spiritual context for the school's exploration of yogic practice, presented without invented claims.",
      },
      { property: "og:title", content: "The Siddha Tradition" },
      {
        property: "og:description",
        content: "Context for the practices explored at THE KRIYA LAB.",
      },
    ],
  }),
  component: SiddhaPage,
});

const timeline = [
  {
    title: bi("Origins", "தோற்றம்"),
    desc: bi(
      "Ancient holistic spiritual and healing science revealed through Shiva and Parvati to Nandi, and handed down to the 18 Siddhas.",
      "சிவபெருமானிடமிருந்து நந்திக்கும், பின்னர் அகத்தியர் உள்ளிட்ட 18 சித்தர்களுக்கும் உபதேசிக்கப்பட்ட ஆதி ஆன்மீக மரபு.",
    ),
  },
  {
    title: bi("Sacred Treatises", "நூல்களும் ரசவாதமும்"),
    desc: bi(
      "Foundational manuals authored by Siddhar Agasthiyar and Siddhar Bogar on medicine, alchemy, Kaya Kalpa, and the Palani Navapashanam elixir.",
      "அகத்தியர் மற்றும் போகரால் அருளப்பட்ட வாசி யோகம், வர்மக் கலை, மருத்துவ சூத்திரங்கள் மற்றும் பழனி நவபாஷாண இரகசியங்கள்.",
    ),
  },
  {
    title: bi("Transmission", "பாபாஜிக்கு உபதேசம்"),
    desc: bi(
      "Direct initiation of Mahavatar Babaji by Siddhar Bogar and Siddhar Agasthiyar at Courtallam into the supreme secrets of Vasi Yoga.",
      "குற்றாலத்தில் அகத்தியர் மற்றும் போகரால் மகாவதார் பாபாஜிக்கு அருளப்பட்ட நேரடி வாசி யோக மற்றும் சமாதி தீட்சை.",
    ),
  },
  {
    title: bi("Living Tradition", "வாழும் கிரியா யோகம்"),
    desc: bi(
      "Sri Guru Babaji synthesized esoteric Siddha breath practices into a structured 5-fold Kriya Yoga accessible to modern seekers.",
      "சித்தர்களின் புனித வாசி யோக சூத்திரங்களை இல்லறத்தாருக்கும் பயன்படும் வகையில் 5 அங்க கிரியா யோகமாக முறைப்படுத்திய மரபு.",
    ),
  },
];

const SIDDHA_CONTENT_EN = `The Siddha tradition is an ancient, holistic spiritual and healing system predominantly from south India, primarily founded by enlightened mystic sages known as Siddhas who sought physical and spiritual perfection. Rooted in ancient Tamil civilization, it is believed to be divinely revealed by Lord Shiva and Goddess Parvati to Nandi, then passed down to the 18 primary Siddhas (with Agasthiyar as the founding father).

(Sanskrit: सिद्ध siddha; "perfected one") is a term that is used widely in Indian religions and culture. It means "one who is accomplished". It refers to perfected masters who have achieved a high degree of perfection of the intellect as well as liberation or enlightenment. In Jainism, the term is used to refer to the liberated souls. Siddha may also refer to one who has attained a siddhi (Super Human capabilities).

The ancient texts and treatises of Siddhar Agasthiyar and Siddhar Bogar are cornerstone works of the Tamil Siddha tradition, serving as manuals for medicine, alchemy, spirituality, and linguistics. Written in poetic verses, many of these texts remain critical references for traditional medical practitioners and alchemists today.

Siddhar Bogar and Siddhar Agasthiyar are two of the most supreme and revered figures in the ancient Tamil Siddha tradition, famed for their mastery in medicine, alchemy, yoga, and linguistics. They lived as enlightened mystics who shaped the spiritual and scientific landscape of South India.

Siddhar Agasthiyar is considered the founding father and first Guru of Siddha medicine, martial arts (Varma Kalai), and Tamil grammar. He is also revered as the chief among the 18 primary Siddhas and one of the Sapta rishis (Seven rishis) in broader Vedic tradition. He has authored monumental foundational texts on medicine, pulse reading, and internal alchemy (such as Agathiyar 1200).

Siddhar Bogar is a legendary alchemist and direct disciple of Kalangi Nathar, who also consulted closely with Agasthiyar. Bogar created the iconic Navapashanam idol of Lord Murugan at the Palani Murugan Temple using a unique blend of nine poisonous minerals that turned temple offerings into a healing elixir. He is believed to have travelled and taught alchemy and yoga across foreign lands including China, and is traditionally regarded as a guru to higher lineages. Sage Bogar has penned the comprehensive master work Bogar 7000 detailing profound secrets of chemistry, minerals, and spiritual evolution.

Core Treatises of Siddhar Agasthiyar

Agasthiyar is regarded as the father of Tamil literature and Siddha medicine. His vast body of work spans various branches of science and spirituality:

• Agathiyam: The legendary, oldest foundational text on Tamil grammar and language rules.
• Agathiyar 1200 / Perunool 1200: A monumental masterwork detailing internal alchemy, cosmic secrets, and the spiritual evolution of the soul.
• Agathiyar Vaithiya Suthiram 650: A highly practical medical text outlining precise pharmaceutical prescriptions, herbal formulations, and methods for diagnosing illness.
• Agathiyar Poorana Soothiram 216: A profound treatise focused on Kaya Kalpa (rejuvenation), advanced meditation (Dhyanam), and yoga physics.
• Agathiyar Samhita: A major text detailing rituals, prayers, and the spiritual disciplines necessary to harmonize the mind and body.
• Agathiyar Rana Vaithiyam: A highly technical manual on surgical methods, wound management, and handling traumatic injuries.
• Senthooram 300: A specialized alchemical text detailing the synthesis of metallic and mineral oxides (Senthooram) for treating chronic illness.

Core Treatises of Siddhar Bogar

Bogar's writings are heavily focused on practical chemistry, spiritual travel, and breaking down cryptic concepts into clearer, instructional details:

• Bogar 7000 (Saptha Kandam): Bogar's definitive masterwork spanning 7,000 verses divided into seven major volumes. It fully uncovers the formulations of Kaya Kalpa (longevity), the transmutation of base metals into gold, cosmic travel, and the complete medical science behind the creation of the Navapashanam idol of Lord Murugan at the Palani Murugan Temple using a unique blend of nine poisonous minerals that turned temple offerings into a healing elixir.
• Bogar 700 (போகர் வைத்தியம் 700): A condensed, high-utility version of his larger texts focusing heavily on herbal pharmacology, mineral purification, and diagnostic arts.
• Bogar Karpa Vidhi: A dedicated manual that deals exclusively with instructions, diets, and mental disciplines required for undergoing cellular transformation and anti-aging therapies.
• Bogar Janana Sagaram: A highly philosophical text explaining the process of human birth, the entrapment of the soul in matter, and the methods for achieving final liberation (Samadhi).

Siddhar Agasthiyar and Siddhar Bogar are revered as the primary ancestral Guru’s of Mahavatar Babaji or Sri Guru Babaji, the immortal master who revived Kriya Yoga in the modern era. According to the lineage history, Babaji was directly initiated into its advanced stages by these two ancient Tamil Siddhas.

The Initiation of Mahavatar Babaji

Mahavatar Babaji's journey led him directly into the lineages of Agasthiyar and Bogar:

• Initiation by Siddhar Bogar: Siddhar Bogar recognized Babaji's immense spiritual potential and accepted him as a disciple. Siddhar Bogar initiated him into advanced meditation, astronomy, and the secrets of progressive light body transformation (Saruva Mukti). Bogar then guided Babaji to seek out Siddhar Agasthiyar to complete his training in the ultimate stages of yoga.
• Initiation by Siddhar Agasthiyar: Babaji traveled to Courtallam (Kuttalam) in Tamil Nadu, performing intense physical and mental austerities to meet the elusive sage. Pleased by his devotion, Siddhar Agasthiyar appeared and initiated Babaji into the secrets of Vasi Yoga (the ancient Siddha form of pranayama and breath mastery). Siddhar Agasthiyar then commanded him to go to Badrinath in the Himalayas to practice these techniques and attain physical immortality (Siddhi).

The Evolution from Vasi Yoga to Kriya Yoga

The scientific blueprint of modern Kriya Yoga is directly derived from the ancient teachings of these two masters:

• The Core Teachings: The techniques taught by Siddhar Bogar and Siddhar Agasthiyar were known within the 18 Siddhar tradition as Vasi Yoga or Siva Yoga.
• The Transition: Sri Guru Babaji synthesized these deep, often cryptic alchemical and breath practices into a structured, accessible five-fold path. He renamed this system Kriya Yoga to make it practical for householders and modern spiritual seekers.

Traces in Kriya Yoga Texts and Practice

• The complete system of Kriya Yoga and specific postures, breathing exercises, and meditation techniques: Lineage charts trace the origins of these specific techniques directly back to the physical and spiritual research recorded in Agasthiyar's treatises and Bogar's Saptha Kandam.
• Physical Immortality (Siddhi): Both Siddhar Agasthiyar and Siddhar Bogar taught that the physical body is a temple that can be divinized. This philosophy sets Kriya Yoga apart from paths that focus solely on escaping the physical world, emphasizing instead the transformation of cells through divine energy — a state Sri Guru Babaji is said to maintain permanently.`;

function SiddhaPage() {
  const { t } = useLang();

  return (
    <>
      <PageHero
        eyebrow={t(bi("Context", "பின்னணி"))}
        title={t(bi("The Tamil Siddha tradition - siddhar Agasthiyar and siddhar Bogar", "சித்தர் மரபு"))}
        intro={t(
          bi(
            "Historical and spiritual context of the Tamil Siddha tradition, Vasi Yoga, and the lineage transmission to Mahavatar Babaji.",
            "தி கிரியா லேப்பில் ஆராயப்படும் பயிற்சிகளுக்கு சித்தர் மரபு முக்கியமான வரலாற்று மற்றும் ஆன்மிகப் பின்னணியை அளிக்கிறது.",
          ),
        )}
      />

      <Section className="pt-4 sm:pt-6 lg:pt-8 pb-6 sm:pb-8 lg:pb-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground">
            {t(bi("What is the Siddha Tradition?", "சித்தர் மரபு என்றால் என்ன?"))}
          </h2>
          <BodyWithImage
            text={t(
              bi(
                SIDDHA_CONTENT_EN,
                "சித்தர் மரபு என்பது தென்னிந்தியாவில் தோன்றிய மிகப் பழமையான முழுமையான ஆன்மீக மற்றும் மருத்துவ மரபாகும். உடலையும் ஆன்மாவையும் அழியா நிலைக்கு உயர்த்திய 18 மகா சித்தர்களால் இது வழிநடத்தப்பட்டது. சிவபெருமானும் பார்வதி தேவியும் நந்தி தேவருக்கு உபதேசிக்க, அவரிடமிருந்து தலைசிறந்த 18 சித்தர்களுக்கு உபதேசிக்கப்பட்டதாகக் கருதப்படுகிறது.\n\nஅகத்தியர் மற்றும் போகர் அருளிய வாசி யோகம், மூலிகை மருத்துவம் மற்றும் காயகற்ப ரகசியங்கள் நவீன கிரியா யோகத்தின் நேரடி ஆன்மீக அடித்தளமாக விளங்குகின்றன.",
              ),
            )}
          />
        </div>
      </Section>

      <Section tone="muted" className="py-6 sm:py-8 lg:py-10">
        <div className="max-w-5xl mx-auto">
          <Eyebrow>{t(bi("Timeline", "காலவரிசை"))}</Eyebrow>
          <ol className="mt-5 space-y-px">
            {timeline.map((item, i) => (
              <li
                key={i}
                className="grid gap-1.5 sm:gap-3 border-b border-border/70 py-3.5 sm:py-4 md:grid-cols-[14rem_1fr] items-baseline"
              >
                <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground">{t(item.title)}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                  {t(item.desc)}
                </p>
              </li>
            ))}
          </ol>
          <CTARow className="mt-8" />
        </div>
      </Section>
    </>
  );
}
