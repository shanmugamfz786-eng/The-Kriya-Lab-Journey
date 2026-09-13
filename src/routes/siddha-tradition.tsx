import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PlaceholderNote, Section, Eyebrow, CTARow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import agasthiyarImage from "@/assets/images/agasthiyar.jpg";

const AGASTHIYAR_MARKER = "Core Treatises of Siddhar Agasthiyar";

function BodyWithImage({ text }: { text: string }) {
  const idx = text.indexOf(AGASTHIYAR_MARKER);
  if (idx === -1) {
    return <p className="measure mt-6 whitespace-pre-line text-muted-foreground">{text}</p>;
  }
  const before = text.slice(0, idx);
  const after = text.slice(idx);
  return (
    <>
      <p className="measure mt-6 whitespace-pre-line text-muted-foreground">{before}</p>
      <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start">
        <p className="whitespace-pre-line text-muted-foreground md:order-1">{after}</p>
        <figure className="aura-image md:order-2 md:sticky md:top-28">
          <img
            src={agasthiyarImage}
            alt="Traditional depiction of Siddhar Agasthiyar seated in meditation"
            loading="lazy"
            className="w-full rounded-sm border border-border object-cover shadow-sm"
          />
          <figcaption className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Siddhar Agasthiyar
          </figcaption>
        </figure>
      </div>
    </>
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
  bi("Origins", "தோற்றம்"),
  bi("Transmission", "பரம்பரை வழி"),
  bi("Texts and practices", "நூல்களும் பயிற்சிகளும்"),
  bi("Living tradition", "வாழும் மரபு"),
];

function SiddhaPage() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t(bi("Context", "பின்னணி"))}
        title={t(bi("The Tamil Siddha tradition - siddhar Agasthiyar and siddhar Bogar", "சித்தர் மரபு"))}
        intro={t(
          bi(
            "\n",
            "தி கிரியா லேப்பில் ஆராயப்படும் பயிற்சிகளுக்கு சித்தர் மரபு முக்கியமான வரலாற்று மற்றும் ஆன்மிகப் பின்னணியை அளிக்கிறது.",
          ),
        )}
      />

      <Section>
        <h2 className="font-serif text-4xl">{t(bi("What is the Siddha Tradition?", "சித்தர் மரபு என்றால் என்ன?"))}</h2>
        <BodyWithImage
          text={t(
            bi(
              "                \nThe Siddha tradition is an ancient, holistic spiritual and healing system predominantly from south India, primarily  founded by enlightened mystic sages known as Siddhas who sought physical and spiritual perfection. Rooted in ancient Tamil civilization. Believed to be divinely revealed by Lord Shiva and Goddess Parvati to Nandi, then passed down to the 18 primary Siddhas (with Agasthiyar as the founding father). (Sanskrit: सिद्ध siddha; \"perfected one\") is a term that is used widely in Indian religions and culture. It means \"one who is accomplished\" .It refers to perfected masters who have achieved a high degree of perfection of the intellect as well as liberation or enlightenment. In Jainism, the term is used to refer to the liberated souls. Siddha may also refer to one who has attained a siddhi ( Super Human capabilities). The ancient texts and treatises of Siddhar  Agasthiyar and Siddhar Bogar are cornerstone works of the Tamil Siddha tradition, serving as manuals for medicine, alchemy, spirituality, and linguistics. Written in poetic verses, many of these texts remain critical references for traditional medical practitioners and alchemists today.\n\nSiddhar Bogar and Siddhar Agasthiyar are two of the most supreme and revered figures in the ancient Tamil Siddha tradition, famed for their mastery in medicine, alchemy, yoga, and linguistics. They lived as enlightened mystics who shaped the spiritual and scientific landscape of South India.\n\nSiddhar Agasthiyar is Considered the founding father and first Guru of Siddha medicine, martial arts (Varma Kalai), and Tamil grammar. He is also revered as the chief among the 18 primary Siddhas and one of the Sapta rishis (Seven rishis) in broader Vedic tradition. He has Authored monumental foundational texts on medicine, pulse reading, and internal alchemy (such as Agathiyar 1200\n\nSiddhar Bogar is a legendary alchemist and direct disciple of Kalangi Nathar, who also consulted closely with Agasthiyar . Bogar Created the iconic Navapashanam idol of Lord Murugan at the Palani Murugan Temple using a unique blend of nine poisonous minerals that turned temple offerings into a healing elixir. He is believed to have travelled and taught alchemy and yoga across foreign lands including China, and is traditionally regarded as a guru to higher lineages. Sage Bogar has Penned the comprehensive master work Bogar 7000 detailing profound secrets of chemistry, minerals, and spiritual evolution.\n\n\n\n\n\nCore Treatises of Siddhar Agasthiyar\n\nAgasthiyar is regarded as the father of Tamil literature and Siddha medicine. His vast body of work spans various branches of science and spirituality.\n\n·Agathiyam: The legendary, oldest foundational text on Tamil grammar and language rules.\n\n·Agathiyar 1200 / Perunool 1200: A monumental masterwork detailing internal alchemy, cosmic secrets, and the spiritual evolution of the soul.\n\n·Agathiyar Vaithiya Suthiram 650: A highly practical medical text outlining precise pharmaceutical prescriptions, herbal formulations, and methods for diagnosing illness.\n\n·Agathiyar Poorana Soothiram 216: A profound treatise focused on Kaya Kalpa (rejuvenation), advanced meditation (Dhyanam), and yoga physics.\n\n·Agathiyar Samhita: A major text detailing rituals, prayers, and the spiritual disciplines necessary to harmonize the mind and body.\n\n·Agathiyar Rana Vaithiyam: A highly technical manual on surgical methods, wound management, and handling traumatic injuries.\n\n \n·Senthooram 300: A specialized alchemical text detailing the synthesis of metallic and mineral oxides (Senthooram) for treating chronic illness.\n\n\n\n\nCore Treatises of Siddhar Bogar\n\nBogar’s writings are heavily focused on practical chemistry, spiritual travel, and breaking down cryptic concepts into clearer, instructional details:\n\n·Bogar 7000 (Saptha Kandam): Bogar's definitive masterwork spanning 7,000 verses divided into seven major volumes. It fully uncovers the formulations of Kaya Kalpa (longevity), the transmutation of base metals into gold, cosmic travel, and the complete medical science behind the creation of the Navapashanam idol of Lord Murugan at the Palani Murugan Temple using a unique blend of nine poisonous minerals that turned temple offerings into a healing elixir.\n\n \n·Bogar 700 (போகர் வைத்தியம் 700 )A condensed, high-utility version of his larger texts focusing heavily on herbal pharmacology, mineral purification, and diagnostic arts.\n\n·Bogar Karpa Vidhi: A dedicated manual that deals exclusively with instructions, diets, and mental disciplines required for undergoing cellular transformation and anti-aging therapies.\n\n·Bogar Janana Sagaram: A highly philosophical text explaining the process of human birth, the entrapment of the soul in matter, and the methods for achieving final liberation (Samadhi).\n\n \nSiddhar Agasthiyar and Siddhar Bogar are revered as the primary ancestral Guru’s of Mahavatar Babaji or Sri Guru Babaji, the immortal master who revived Kriya Yoga in the modern era. According to the lineage history, Babaji was directly initiated into its advanced stages by these two ancient Tamil Siddhas.\n\n \nThe Initiation of Mahavatar Babaji\n\nMahavatar Babaji’s journey led him directly into the lineages of Agasthiyar and Bogar.\n\n·Initiation by Siddhar Bogar: Siddhar Bogar recognized Babaji’s immense spiritual potential and accepted him as a disciple. Siddhar Bogar initiated him into advanced meditation, astronomy, and the secrets of progressive light body transformation (Saruva Mukti). Bogar then guided Babaji to seek out Siddhar Agasthiyar to complete his training in the ultimate stages of yoga.\n\n·Initiation by Siddhar Agasthiyar: Babaji traveled to Courtallam (Kuttalam) in Tamil Nadu, performing intense physical and mental austerities to meet the elusive sage. Pleased by his devotion, Siddhar Agasthiyar appeared and initiated Babaji into the secrets of Vasi Yoga (the ancient Siddha form of pranayama and breath mastery). Siddhar Agasthiyar then commanded him to go to Badrinath in the Himalayas to practice these techniques and attain physical immortality (Siddhi).\n\nThe Evolution from Vasi Yoga to Kriya Yoga\n\nThe scientific blueprint of modern Kriya Yoga is directly derived from the ancient teachings of these two masters:\n\n·The Core Teachings: The techniques taught by Siddhar Bogar and Siddhar  Agasthiyar were known within the 18 Siddhar tradition as Vasi Yoga or Siva Yoga.\n\n·The Transition: Sri Guru Babaji synthesized these deep, often cryptic alchemical and breath practices into a structured, accessible five-fold path. He renamed this system Kriya Yoga to make it practical for householders and modern spiritual seekers.\n\n\nTraces in Kriya Yoga Texts and Practice\n\n·The complete system of Kriya Yoga and specific postures, breathing exercises, and meditation techniques. Lineage charts trace the origins of these specific techniques directly back to the physical and spiritual research recorded in Agasthiyar's treatises and Bogar's Saptha Kandam.\n\n·Physical Immortality (Siddhi): Both Siddhar Agasthiyar and Siddhar Bogar taught that the physical body is a temple that can be divinized. This philosophy sets Kriya Yoga apart from paths that focus solely on escaping the physical world, emphasizing instead the transformation of cells through divine energy—a state Sri Guru Babaji is said to maintain permanently.\n\n \n\n\n\n\n",
              "இப்பகுதி பள்ளியால் உண்மையான மூல ஆதாரங்கள் இடப்படுவதற்காக வேண்டுமென்றே காலியாக விடப்பட்டுள்ளது. வரலாற்று உண்மைகள், தேதிகள், பரம்பரைக் கூற்றுகள் அல்லது மேற்கோள்கள் எதுவும் இங்கே உருவாக்கப்படவில்லை.",
            ),
          )}
        />
        <PlaceholderNote />
      </Section>

      <Section tone="muted">
        <Eyebrow>{t(bi("Timeline", "காலவரிசை"))}</Eyebrow>
        <ol className="mt-12 space-y-px">
          {timeline.map((item, i) => (
            <li
              key={i}
              className="grid gap-4 border-b border-border py-7 md:grid-cols-[12rem_1fr]"
            >
              <h3 className="font-serif text-2xl">{t(item)}</h3>
              <p className="text-sm text-muted-foreground" />

            </li>
          ))}
        </ol>
        <CTARow className="mt-14" />
      </Section>
    </>
  );
}
