import { createFileRoute } from "@tanstack/react-router";
import { CTARow, PageHero, Section, Eyebrow } from "@/components/Primitives";
import { bi, useLang } from "@/lib/i18n";
import { labMethod } from "@/content/site";

const labIntroEn = `

The Kriya Lab is a contemporary Kriya Yoga learning community that helps modern seekers transform their lives by teaching authentic Kriya Yoga and disciplined self-practice, which emphasis more on the practice of Kriya breathing to expedite their own evolution consciously.

Why The Kriya Lab?

Your Body is your Laboratory. Your Breath is the Tool kit. Your Experience is the Proof.

At The Kriya Lab, We encourage and train you to Experiment with your breath, Experience the transformation in your awareness and Evolve through direct realization to your fullest. We make you Practice, observe, and experience the transformative effects of Kriya Yoga for yourself. we believe that the greatest discoveries are not made in laboratories built of concrete and steel—they are made within the laboratory of the human being.


A laboratory is a place of exploration, experimentation, observation, and discovery. It is a space where knowledge is not merely accepted intellectually but explored through observation and experience. In the same spirit, The Kriya Lab invites every individual to become a sincere researcher of their own inner world.
 
For thousands of years, the ancient yogis explored the inner dimensions of life using one of the most powerful yet simple instruments or tool available to every human being: the breath. Through disciplined observation and consistent practice, they realized that the science of Kriya Yoga—a practical system for inner transformation and the evolution of human consciousness.


Science says it Takes a billion year to attain the human stage evolving naturally from single cell organism, At the Kriya Lab we believe once We reach the human stage our evolution is in our own hands, why wait another billion years to evolve naturally  from our current stage to attain the super consciousness state. learn the kriya breathing technique at the Kriya Lab and accelerate your own evolution faster in a natural and scientific way to attain the super consciousness state.


It is like Upgrading a computer by installing a RAM or a processor or any other part with more capabilities to the current system to speed up the working process. The same way the Kriya lab’s kriya breathing techniques when practiced on a regular basis helps to upgrade the human body, the human brain, the nervous system, intellectual capacity and creativity to understand the highest self which has always been in there ever since. 
Our guiding philosophy is simple:

Don't just believe. Practice. Experience. Realize your fullest potential.

At the Kriya Lab, through authentic Kriya breathing techniques taught under qualified guidance, you begin a systematic journey of self-exploration. With regular practice, you may observe gradual changes in your physical well-being, mental clarity, emotional balance, energy levels, intuition, and overall quality of life—not because someone has described them in books, but because they become part of your own lived experience.




Inner Self Engineering or Self Engineering.

Modern science has enabled humanity to explore the outer universe.Kriya Yoga enables us to explore the inner universe.At The Kriya Lab, we call this journey Inner Self Engineering or Self Engineering. The conscious refinement of the human system through breath which puts the practitioner into a meditative state, to witness a shift in their awareness and expansion of their own consciousness.


Vision

To inspire the new generation to discover inner peace, clarity, and purpose by making authentic Kriya Yoga practical, accessible, and relevant for modern life. At The Kriya Lab, you don't just learn Breath work and yoga—you consciously evolve to your highest using your own breath.





Mission

Teach authentic Kriya Yoga with integrity and respect for its lineage.
Empowering millions to awaken their highest potential
Build a global community of conscious, compassionate practitioners.
Empower people with Kriya Breathing Technique to evolve from their current state of being to their highest possible state of evolution.
To cultivate self-awareness through regular practice and personal experience.`;

export const Route = createFileRoute("/the-kriya-lab")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "The Kriya Lab — Experiment. Experience. Evolve." },
      {
        name: "description",
        content:
          "The philosophy and methodology of THE KRIYA LAB: practice, observation, experience, understanding and transformation.",
      },
      { property: "og:title", content: "The Kriya Lab — Experiment. Experience. Evolve." },
      {
        property: "og:description",
        content: "A laboratory where knowledge is explored through observation and direct experience.",
      },
    ],
  }),
  component: LabPage,
});

function LabPage() {
  const { t } = useLang();
  return (
    <>
      <PageHero
        eyebrow={t(bi("The Kriya Lab", "தி கிரியா லேப்"))}
        title={t(bi("Experiment. Experience. Evolve.", "பரிசோதி. அனுபவி. பரிணமி."))}
        intro={t(
          bi(
            labIntroEn,
            "அறிவு வெறும் புத்தி ரீதியாக ஏற்கப்படாமல், கவனிப்பு மற்றும் அனுபவத்தின் மூலம் ஆராயப்படும் இடமே ஆய்வகம்.",
          ),
        )}
      />

      <Section>
        <Eyebrow>{t(bi("Methodology", "முறையியல்"))}</Eyebrow>
        <div className="mt-12 grid gap-px bg-border md:grid-cols-5">
          {labMethod.map((m) => (
            <div key={m.step} className="bg-background p-7">
              <span className="text-xs tracking-widest text-gold">{m.step}</span>
              <h2 className="mt-5 font-serif text-2xl">{t(m.title)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(m.body)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="velvet">
        <Eyebrow>{t(bi("The process", "செயல்முறை"))}</Eyebrow>
        <ol className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-4 font-serif text-2xl lg:text-4xl">
          {[
            bi("Practice", "பயிற்சி"),
            bi("Observation", "கவனிப்பு"),
            bi("Experience", "அனுபவம்"),
            bi("Understanding", "புரிதல்"),
            bi("Transformation", "மாற்றம்"),
          ].map((s, i, arr) => (
            <li key={i} className="flex items-center gap-5">
              <span>{t(s)}</span>
              {i < arr.length - 1 ? <span className="text-gold">→</span> : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <p className="measure text-lg leading-relaxed text-muted-foreground">
          {t(
            bi(
              "In this approach, the practitioner is both the scientist and the subject. Nothing is asked to be believed. What is asked is that you practise carefully, observe honestly, and let your own experience become the evidence.",
              "இந்த அணுகுமுறையில் சாதகரே ஆய்வாளரும் ஆய்வுப் பொருளும் ஆவார். எதையும் நம்பச் சொல்லவில்லை. கவனமாகப் பயிற்சி செய்யுங்கள், நேர்மையாகக் கவனியுங்கள், உங்கள் சொந்த அனுபவமே சான்றாகட்டும் — இதுவே கேட்கப்படுகிறது.",
            ),
          )}
        </p>
        <CTARow className="mt-12" />
      </Section>
    </>
  );
}
