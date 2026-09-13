import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, Eyebrow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { journal } from "@/content/site";

export const Route = createFileRoute("/journal/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Journal | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "Essays on Kriya Yoga, meditation, consciousness, breath and inner exploration from THE KRIYA LAB.",
      },
      { property: "og:title", content: "Journal — THE KRIYA LAB" },
      { property: "og:description", content: "Writing on breath, awareness and inner exploration." },
    ],
  }),
  component: JournalPage,
});

const categories = [
  bi("Kriya Yoga", "கிரியா யோகம்"),
  bi("Meditation", "தியானம்"),
  bi("Consciousness", "உணர்வு"),
  bi("Inner Exploration", "உள்முக ஆய்வு"),
  bi("Spiritual Practice", "ஆன்மிகப் பயிற்சி"),
  bi("Yoga Philosophy", "யோக தத்துவம்"),
  bi("Siddha Tradition", "சித்தர் மரபு"),
  bi("Breath", "சுவாசம்"),
  bi("Self-Discovery", "சுய கண்டுபிடிப்பு"),
];

function JournalPage() {
  const { t } = useLang();
  const featured = journal[0]!;
  const rest = journal.slice(1);

  return (
    <>
      <PageHero
        eyebrow={t(bi("Journal", "இதழ்"))}
        title={t(bi("Nadi", "ஆய்வகக் குறிப்புகள்"))}
        intro={t(
          bi(
            "The Nadi system: Meaning, Definition, Types and Use\n\nThere are thousands of invisible energy channels that run through our\nbodies, carrying prana—the life force energy that sustains, supports, and\nnourishes our physical, mental, and spiritual well-being. These channels, known\nas Nadi, flow through our body like rivers of energy, interconnecting and\nnourishing every cell and organ within us. Among these countless Nadis, there\nare three primary pathways or Naadi’s that play a significant role in the\ncirculation of prana: Ida Nadi , Pingala Nadi , and Sushumna Nadi .\nUnderstanding their location, significance, and function can unlock a world of profound\nhealing, transformation, and spiritual development.\n\n\n\n\n\nWhat are Nadi’s?\n\nIn Tamil, Nadi means “stream or river”. In ancient yoga\nand Ayurvedic traditions, practitioners believe that there are thousands of\nnadi’s or subtle energy channels traveling throughout the physical body. They\nare not visible to the naked eye yet run alongside the nerves, blood vessels,\nand other anatomical structures. Their primary function of the nadi is to\ncarry Prana,\nlife force energy, throughout the\nbody. These subtle channels can be thought of as the flexible tubes through\nwhich Prana flows, ensuring the vitality and balance of our physical, mental,\nand spiritual well-being.\n\nSignificance of Nadi in yoga\n\nOne of the primary goals in hatha yoga is to balance and harmonize the flow of prana\nthroughout the body. Hatha translates to “ha” meaning sun and “tha” meaning\nmoon, referencing the two of the primary channels through which prana flows—the\nIda nadi and Pingala nadi. The asanas, pranyamas,\nmudras and bandhas utilized in a traditional hatha yoga practice help clear any\nblockages in these energy channels, allowing prana to flow freely—enhancing\nwell-being, boosting awareness, and elevating consciousness. When the energy is\nrestricted or blocked in the Ida nadi and Pingala nadi, it can lead to\nphysical, mental, and emotional imbalances and disease. This imbalance can\nprevent a yogi from reaching their full potential both on and off the mat.\n\n\n\n\n\nThe relationship between nadi and chakras\n\nNadi and chakras are interconnected and mutually influence each\nother. Chakras\nare powerful energy centres in our\nsubtle body that are located at specific points on the central energy channel.\nThe Ida Nadi and Pingala Nadi or channels intersect, link and interact with the\nlower six chakras, creating a complex network of energy flow throughout our\nbeing. When the nadi are clear and the flow of prana is unobstructed, the chakras\ncan function optimally, supporting our\noverall health and vitality. However, if there are blockages or imbalances in\nthe nadi, the flow of energy can become restricted in the chakras, leading to\nphysical, emotional, and mental ailments.\n\n\n\n\nHow many Nadi’s are in the body?\n\nAccording to ancient Sidha Yogic texts, there are 72,000 nadi’s in the\nhuman body, each serving as a conduit for the flow of Pranic energy. There are\nother texts, like the Shiva Samhitha, that mention the human body having\n350,000 channels.\n\nThe 3 main Nadi’s\n\nThere are three main nadi’s—the Ida nadi, Pingala nadi,\nand Sushumna nadi. Each of these has distinct qualities and functions which\nplay a crucial role in the flow of cosmic energy within the body. Understanding\nthe characteristics of these nadi is essential to harness their power and\nunlock the full potential of our being.\n\n\n\n\nThe Ida, Pingala, and Sushumna nadi’s begin at a bulb like structure\nsituated just below the Muladhara or Root\nChakra at the base of the\nspine. Yogis often describe it as a small, oval-shaped reservoir that contains\nthe Kundalini, often represented as the coiled serpent. The Kanda is the store house\nof dormant vital energy and is responsible for distributing Prana throughout\nthe body.\n\n\n\n\n1. Ida Nadi: the lunar left channel\n\nThe Ida or Chandra nadi starts at base of the spine at Muladhara\nchakra and travels up the left side of the spine, ending at the left nostril.\nIt is often referred to as the “Moon Channel” because of its feminine and\ncooling qualities. When this channel is balanced and flowing freely, it\nsupports a calm and receptive state of being. It is also connected to the\nparasympathetic nervous system, promoting relaxation and rest.\n\nIndividuals with dominant Ida energies are typically introspective,\nimaginative, and often have a penchant for creative endeavours. They are\ncharacterized by their calm demeanour and emotional depth.\n\nEnergetic functions: Governs mental processes and is associated\nwith intuitive thinking. Reflects qualities of the moon, such as receptivity\nand coolness.\nColour Association: White, symbolizing purity and clarity.\nPersonality Traits: Individuals with dominant Ida energies are\nnurturing and intuitive but may lack assertiveness.\n\n\n\n\n\n2. Pingala Nadi: the solar right channel\n\nThe Pingala or surya nadi starts at the Base of the spine in\nMuladhara chakra and travels up the right side of the spine, ending at the\nright nostril. It is often referred to as the “Sun Channel” due to its\nmasculine and heating qualities. The pingala nadi is responsible for vital\nlife processes and imparts vitality, efficiency, and strength. Balancing this\nchannel can help enhance motivation, productivity, and active engagement with\nthe external world. Individuals with a dominant Pingala energy are characterized\nby their dynamic nature, vibrant physicality, and strong logical processing\nability.\n\nEnergetic functions: Serves as the source of vital life force or\nprana. Symbolizes sun-related qualities like brightness and dynamism.\n\n\nColour Association: Red, indicative of vigour and vitality.\n\n\nPersonality Traits: Dominant pingala energy leads to traits such\nas creativity and assertiveness but can diminish lunar qualities like\nempathy.\n\n\n\n3. Sushumna nadi: the central channel\n\nThe Sushumna nadi is the central channel that runs along the spinal\ncord’s length, from the Muladhara chakra at the base of the spine to the crown\nchakra at the centre top of the head. It is considered the most important\npathway for Kundalini awakening and enlightenment.\n\n\n\n\n\nSignificance of sushumna\n\nThe Sushumna nadi acts as a harmonizing and integrating force between\nIda and Pingala energies. When the energy flows freely through Sushumna Nadi,\nit brings about a state of equilibrium, stillness, and harmony. This is a state\nof balance between the masculine and feminine aspects of our energy system or\nsolar and lunar energies. A balanced Sushumna fosters inner peace, enhances\nconcentration, and promotes overall well-being.\n\n\n\n\nPathway to higher consciousness\n\nWhen Kundalini energy is awakened and rises through the Sushumna nadi,\nit can lead to a profound spiritual awakening and transformation. This awakening can cause heightened states of consciousness, expanded awareness, and a deep sense of connection to the divine. When the Sushumna nadi is active, it is recommended to rest, meditate, practice yoga, chant mantras, and send out prayers and blessings to loved ones.When a yogi creates a continuous energy flow centred through Sushumna nadi,it can lead to transcendence and spiritual enlightenment. Sushumna nadi is alsoreferred to as Brahma nadi, which recognizes the importance of activating this channel for spiritual development. To reach this level of awakening, a yogi must strengthen the physical body, purify the nadi system mainly the three main nadi’s, cultivate prana, balance the chakras, finally activate kundalini.\n\n\n\n",
            "சுவாசம், தியானம், உணர்வு மற்றும் உள்முக கவனிப்பு பயிற்சி குறித்த எழுத்துகள்.",
          ),
        )}
      />

      <Section>
        <Eyebrow>{t(bi("Featured", "சிறப்புக் கட்டுரை"))}</Eyebrow>
        <Link to="/journal/$slug" params={{ slug: featured.slug }} className="group mt-6 block">
          <h2 className="max-w-3xl font-serif text-4xl leading-tight transition-colors group-hover:text-primary lg:text-6xl">
            {t(featured.title)}
          </h2>
          <p className="measure mt-5 text-muted-foreground">{t(featured.subtitle)}</p>
          <p className="mt-4 text-xs tracking-widest text-gold uppercase">
            {t(featured.category)} · {t(featured.readingTime)}
          </p>
        </Link>
      </Section>

      <Section tone="muted">
        <Eyebrow>{t(bi("Latest", "சமீபத்தியவை"))}</Eyebrow>
        <div className="mt-10 grid gap-px bg-border md:grid-cols-2">
          {rest.map((a) => (
            <Link
              key={a.slug}
              to="/journal/$slug"
              params={{ slug: a.slug }}
              className="group bg-background p-9"
            >
              <p className="text-xs tracking-widest text-gold uppercase">{t(a.category)}</p>
              <h3 className="mt-4 font-serif text-3xl transition-colors group-hover:text-primary">
                {t(a.title)}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">{t(a.subtitle)}</p>
              <p className="mt-6 text-xs text-muted-foreground">{t(a.readingTime)}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>{t(bi("Explore by category", "வகைவாரியாக ஆராயுங்கள்"))}</Eyebrow>
        <ul className="mt-8 flex flex-wrap gap-3">
          {categories.map((c, i) => (
            <li
              key={i}
              className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground"
            >
              {t(c)}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
