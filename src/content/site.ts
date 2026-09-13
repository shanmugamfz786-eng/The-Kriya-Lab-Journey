import { bi, type Bi } from "@/lib/i18n";

/**
 * Centralised bilingual content.
 * Every field is EN + TA and is designed to be replaced by CMS data later
 * without changing any component.
 */

export const settings = {
  brand: "THE KRIYA LAB",
  tagline: bi("Experiment. Experience. Evolve.", "பரிசோதி. அனுபவி. பரிணமி."),
  /** Editable placeholder — replace with the school's real number. */
  whatsappNumber: "918870630383",
  whatsappLabel: bi("Enquire on WhatsApp", "வாட்ஸ்அப்பில் விசாரிக்க"),
  whatsappDefault: bi(
    "Hello, I would like to know more about Kriya Yoga. Please guide me on how I can begin.",
    "வணக்கம், கிரியா யோகா பற்றி மேலும் அறிந்து கொள்ள விரும்புகிறேன். நான் எவ்வாறு தொடங்கலாம் என்பது குறித்து வழிகாட்டவும்.",
  ),
  email: "hello@thekriyalab.com",
};

export const ui = {
  begin: bi("Begin Your Journey", "உங்கள் பயணத்தைத் தொடங்குங்கள்"),
  explore: bi("Explore Kriya Yoga", "கிரியா யோகத்தை அறியுங்கள்"),
  learnMore: bi("Learn More", "மேலும் அறிக"),
  enroll: bi("Enroll", "பதிவு செய்க"),
  send: bi("Send Enquiry", "விசாரணையை அனுப்பவும்"),
  submit: bi("Submit Enrollment Request", "பதிவு கோரிக்கையை அனுப்பவும்"),
  name: bi("Name", "பெயர்"),
  email: bi("Email", "மின்னஞ்சல்"),
  phone: bi("Phone", "தொலைபேசி"),
  country: bi("Country", "நாடு"),
  age: bi("Age", "வயது"),
  message: bi("Message", "செய்தி"),
  enquiryType: bi("Enquiry Type", "விசாரணையின் வகை"),
  program: bi("Program interested in", "விருப்பமான நிகழ்ச்சி"),
  format: bi("Preferred format", "விருப்ப வடிவம்"),
  language: bi("Preferred language", "விருப்ப மொழி"),
  consent: bi(
    "I consent to being contacted about my enquiry.",
    "எனது விசாரணை குறித்து என்னைத் தொடர்பு கொள்ள சம்மதிக்கிறேன்.",
  ),
  required: bi("This field is required.", "இந்தப் புலம் அவசியம்."),
  invalidEmail: bi("Please enter a valid email address.", "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்."),
  placeholderNote: bi(
    "\n",
    "மாதிரி உள்ளடக்கம் — திருத்தக்கூடியது",
  ),
};

export const nav: { label: Bi; to: string }[] = [
  { label: bi("Kriya Yoga", "கிரியா யோகம்"), to: "/kriya-yoga" },
  { label: bi("Science of Kriya Yoga", "கிரியா யோக அறிவியல்"), to: "/science-of-kriya-yoga" },
  { label: bi("The Kriya Lab", "தி கிரியா லேப்"), to: "/the-kriya-lab" },
  { label: bi("Siddha Tradition", "சித்தர் மரபு"), to: "/siddha-tradition" },
  { label: bi("Programs", "நிகழ்ச்சிகள்"), to: "/programs" },
  { label: bi("About the\nTeacher", "ஆசிரியர்\nபற்றி"), to: "/about" },
  { label: bi("Events", "நிகழ்வுகள்"), to: "/events" },
  { label: bi("Lineage", "குரு பரம்பரை"), to: "/lineage" },
  { label: bi("Journal", "இதழ்"), to: "/journal" },
];

export const footerLinks: { label: Bi; to: string }[] = [
  ...nav,
  { label: bi("Testimonials", "அனுபவங்கள்"), to: "/testimonials" },
  { label: bi("FAQ", "கேள்விகள்"), to: "/faq" },
  { label: bi("Contact", "தொடர்பு"), to: "/contact" },
];

export const home = {
  heroTitle: bi("Transform Your self with Kriya Yoga", "கிரியா யோகத்தால் உங்கள் சுயத்தை மாற்றுங்கள்"),
  heroSub: settings.tagline,
  heroFlow: bi(
    "Experiment with your breath → Experience the shift in your awareness → Evolve to your fullest",
    "சுவாசத்துடன் பரிசோதி → விழிப்புணர்வின் மாற்றத்தை அனுபவி → பரமநிலை நோக்கி பரிணமி",
  ),
  intro: [
    bi(
      "Science says it takes a billion years to attain the human stage, evolving naturally from a single-cell organism. At The Kriya Lab we believe that once we reach the human stage our evolution is in our own hands. Why wait another billion years to evolve naturally to reach the super conscious state? Learn the Kriya breathing technique at The Kriya Lab and accelerate your own evolution in a natural and systematic way.",
      "ஒரு செல் உயிரினத்திலிருந்து இயற்கையாக மனித நிலையை அடைய நூறு கோடி ஆண்டுகள் தேவை என்று அறிவியல் கூறுகிறது. மனித நிலையை அடைந்த பின், நமது பரிணாமம் நம் கைகளிலேயே உள்ளது என்று தி கிரியா லேப் நம்புகிறது. பரமநிலையை அடைய மேலும் கோடி ஆண்டுகள் ஏன் காத்திருக்க வேண்டும்? தி கிரியா லேப்பில் கிரியா சுவாசப் பயிற்சியைக் கற்று, இயற்கையான, முறையான வழியில் உங்கள் பரிணாமத்தை விரைவுபடுத்துங்கள்.",
    ),
    bi(
      "It is like upgrading a computer — installing new hardware with far greater capability to the existing system ,so the whole system works faster. In the same way, the Kriya breathing techniques practiced regularly help upgrade the human system: the brain, the nervous system ,the intellectual capacity and creativity to understand the highest Self that has always been within.",
      "இது ஒரு கணினியை மேம்படுத்துவது போன்றது — அதிக திறன் கொண்ட புதிய வன்பொருளை நிறுவி முழு அமைப்பையும் வேகப்படுத்துவது. அதேபோல், தொடர்ந்து பயிற்சி செய்யப்படும் கிரியா சுவாசப் பயிற்சிகள் மனித அமைப்பை — மூளை, நரம்பு மண்டலம், மற்றும் எப்போதும் உள்ளிருக்கும் உயர்ந்த ஆத்மாவை உணரும் அறிவுத் திறனை — மேம்படுத்த உதவுகின்றன.",
    ),
    bi(
      "The Kriya Lab is where we learn to use the breath within our own body to experiment with ancient yogic wisdom, and to witness the changes it brings about across all planes of existence — physical, mental, energetic, intellectual and spiritual.",
      "நமது சொந்த உடலில் உள்ள சுவாசத்தைப் பயன்படுத்தி பண்டைய யோக ஞானத்தைப் பரிசோதித்து, அது அனைத்து பரிமாணங்களிலும் — உடல், மனம், ஆற்றல், அறிவு, ஆன்மிகம் — கொண்டு வரும் மாற்றங்களைக் காணக் கற்றுக்கொள்ளும் இடம் தி கிரியா லேப்.",
    ),
    bi(
      "At The Kriya Lab we emphasise gradual progression, consistency and safety. Students are encouraged to follow the instructions given by their teachers and to avoid practising beyond the recommended duration or intensity.",
      "தி கிரியா லேப்பில் படிப்படியான முன்னேற்றம், தொடர்ச்சி மற்றும் பாதுகாப்புக்கு முக்கியத்துவம் தருகிறோம். மாணவர்கள் தங்கள் ஆசிரியர்கள் அளிக்கும் அறிவுறுத்தல்களைப் பின்பற்றவும், பரிந்துரைக்கப்பட்ட கால அளவு அல்லது தீவிரத்தை மீறாமல் பயிற்சி செய்யவும் ஊக்குவிக்கப்படுகிறார்கள்.",
    ),
  ],
  invitation: bi(
    "Every human being carries within them an extraordinary capacity for awareness, wisdom and transformation. The journey begins with a single conscious breath. At The Kriya Lab, we invite you to become both the scientist and the subject of your own inner exploration.",
    "ஒவ்வொரு மனிதனுக்குள்ளும் விழிப்புணர்வு, ஞானம் மற்றும் மாற்றத்திற்கான அசாதாரண திறன் உள்ளது. பயணம் ஒரே ஒரு விழிப்புடன் கூடிய சுவாசத்தில் தொடங்குகிறது. உங்கள் உள்முக ஆய்வில் நீங்களே ஆய்வாளராகவும் ஆய்வுப் பொருளாகவும் இருக்க தி கிரியா லேப் உங்களை அழைக்கிறது.",
  ),
  labIntro: bi(
    "A laboratory is a place of exploration, observation, experimentation and discovery. THE KRIYA LAB approaches Kriya Yoga in the same spirit — not merely as something to believe in, but as something to practice, observe and experience directly.",
    "ஆய்வகம் என்பது ஆய்வு, கவனிப்பு, பரிசோதனை மற்றும் கண்டுபிடிப்பின் இடம். தி கிரியா லேப் கிரியா யோகத்தை அதே உணர்வுடன் அணுகுகிறது — வெறும் நம்பிக்கையாக அல்ல, நேரடியாகப் பயின்று, கவனித்து, அனுபவிக்க வேண்டிய ஒன்றாக.",
  ),
  pillars: [
    {
      key: "experiment",
      title: bi("Experiment", "பரிசோதி"),
      body: bi(
        "Experiment with your breath — explore the relationship between breath, body, mind and awareness.",
        "உங்கள் சுவாசத்துடன் பரிசோதியுங்கள் — சுவாசம், உடல், மனம் மற்றும் விழிப்புணர்வுக்கு இடையிலான தொடர்பை ஆராயுங்கள்.",
      ),
    },
    {
      key: "experience",
      title: bi("Experience", "அனுபவி"),
      body: bi(
        "Experience the shift in your awareness — observe the changes that arise through disciplined practice.",
        "உங்கள் விழிப்புணர்வில் ஏற்படும் மாற்றத்தை அனுபவியுங்கள் — ஒழுக்கமான பயிற்சியால் எழும் மாற்றங்களைக் கவனியுங்கள்.",
      ),
    },
    {
      key: "evolve",
      title: bi("Evolve", "பரிணமி"),
      body: bi(
        "Evolve to your fullest — use direct experience as a pathway to deeper self-understanding.",
        "பரமநிலையை நோக்கிப் பரிணமியுங்கள் — நேரடி அனுபவத்தை ஆழ்ந்த சுய அறிவுக்கான பாதையாகப் பயன்படுத்துங்கள்.",
      ),
    },
  ],
};

export const koshas = [
  {
    key: "annamaya",
    name: bi("Annamaya Kosha", "அன்னமய கோசம்"),
    label: bi("Physical body", "உடல்"),
    body: bi(
      "The dimension of the physical body — nourished by food, movement and rest. Practice begins here with posture, stability and steadiness.",
      "உணவு, இயக்கம், ஓய்வு ஆகியவற்றால் வளர்க்கப்படும் உடல் பரிமாணம். ஆசனம், நிலைத்தன்மை மற்றும் உறுதியுடன் பயிற்சி இங்கே தொடங்குகிறது.",
    ),
  },
  {
    key: "pranamaya",
    name: bi("Pranamaya Kosha", "பிராணமய கோசம்"),
    label: bi("Vital energy / life force", "உயிராற்றல்"),
    body: bi(
      "The dimension of prana — the vital energy carried and shaped by the breath. Kriya practice works most directly here.",
      "பிராணத்தின் பரிமாணம் — சுவாசத்தால் சுமக்கப்படும், வடிவமைக்கப்படும் உயிராற்றல். கிரியா பயிற்சி நேரடியாக இங்கே செயல்படுகிறது.",
    ),
  },
  {
    key: "manomaya",
    name: bi("Manomaya Kosha", "மனோமய கோசம்"),
    label: bi("Mental and emotional dimension", "மனம் மற்றும் உணர்வு"),
    body: bi(
      "The dimension of thought, emotion and impression. As the breath settles, the movement of mind becomes visible to the observer.",
      "எண்ணம், உணர்வு மற்றும் பதிவுகளின் பரிமாணம். சுவாசம் அமைதியடையும்போது, மனதின் இயக்கம் கவனிப்பவனுக்குத் தெரியத் தொடங்குகிறது.",
    ),
  },
  {
    key: "vijnanamaya",
    name: bi("Vijnanamaya Kosha", "விஞ்ஞானமய கோசம்"),
    label: bi("Intellect / discernment", "அறிவு / விவேகம்"),
    body: bi(
      "The dimension of discernment — the capacity to see clearly, to distinguish the observer from what is observed.",
      "விவேகத்தின் பரிமாணம் — தெளிவாகக் காணும் திறன், கவனிப்பவனையும் கவனிக்கப்படுவதையும் வேறுபடுத்தும் திறன்.",
    ),
  },
  {
    key: "anandamaya",
    name: bi("Anandamaya Kosha", "ஆனந்தமய கோசம்"),
    label: bi("Deep inner dimension", "ஆழ்ந்த உள்பரிமாணம்"),
    body: bi(
      "The subtlest dimension described in yogic literature — an inner stillness that is not produced by circumstance.",
      "யோக இலக்கியங்களில் விவரிக்கப்படும் நுட்பமான பரிமாணம் — சூழ்நிலையால் உருவாக்கப்படாத உள்ளார்ந்த அமைதி.",
    ),
  },
];

export const labMethod = [
  {
    step: "01",
    title: bi("Experiment", "பரிசோதி"),
    body: bi("Practice with awareness.", "விழிப்புணர்வுடன் பயிற்சி செய்யுங்கள்."),
  },
  {
    step: "02",
    title: bi("Observe", "கவனி"),
    body: bi("Watch what changes.", "என்ன மாறுகிறது என்பதைக் கவனியுங்கள்."),
  },
  {
    step: "03",
    title: bi("Experience", "அனுபவி"),
    body: bi("Directly experience the process.", "செயல்முறையை நேரடியாக அனுபவியுங்கள்."),
  },
  {
    step: "04",
    title: bi("Understand", "புரிந்துகொள்"),
    body: bi("Develop deeper insight.", "ஆழ்ந்த உள்ளுணர்வை வளர்த்துக்கொள்ளுங்கள்."),
  },
  {
    step: "05",
    title: bi("Transform", "மாறு"),
    body: bi(
      "Allow practice to change the way you experience yourself.",
      "நீங்கள் உங்களை அனுபவிக்கும் விதத்தை பயிற்சி மாற்ற அனுமதியுங்கள்.",
    ),
  },
];

export type Program = {
  slug: string;
  name: Bi;
  description: Bi;
  level: Bi;
  duration: Bi;
  format: Bi;
  instructor: Bi;
  price: Bi;
  schedule: Bi;
  location: Bi;
  status: Bi;
  /** Optional editable placeholders */
  startDate?: Bi;
  endDate?: Bi;
  languages?: Bi;
  /** When set, the card shows a participant selector up to this number. */
  maxParticipants?: number;
  /** Per-person fee in INR. When set, the total is multiplied by the number of participants. */
  unitPriceInr?: number;
  tags: ("beginner" | "online" | "in-person" | "english" | "tamil")[];
};

/** Editable placeholders — not confirmed offerings until published by the administrator. */
export const programs: Program[] = [
  {
    slug: "live-online-group-english",
    name: bi(
      "Kriya Yoga Live — Online Group Class (English)",
      "கிரியா யோகா நேரலை — ஆன்லைன் குழு வகுப்பு (ஆங்கிலம்)",
    ),
    description: bi(
      "A guided group initiation session conducted live online in English.",
      "ஆங்கிலத்தில் நேரலையில் நடத்தப்படும் வழிகாட்டப்பட்ட குழு தீட்சை அமர்வு.",
    ),
    level: bi("Beginner", "தொடக்கநிலை"),
    duration: bi("To be announced", "அறிவிக்கப்படும்"),
    format: bi("Online", "ஆன்லைன்"),
    instructor: bi("To be announced", "அறிவிக்கப்படும்"),
    price: bi("₹0.00", "₹0.00"),
    schedule: bi("Dates to be announced", "தேதிகள் அறிவிக்கப்படும்"),
    location: bi("Online", "ஆன்லைன்"),
    status: bi("Enquire", "விசாரிக்கவும்"),
    tags: ["beginner", "online", "english"],
  },
  {
    slug: "live-online-individual",
    name: bi(
      "Kriya Yoga Live — (one to one)Individual Online Initiation (English / Tamil)",
      "கிரியா யோகா நேரலை — தனிநபர் ஆன்லைன் தீட்சை (ஆங்கிலம் / தமிழ்)",
    ),
    description: bi(
      "A one-to-one online initiation session, paced to the individual seeker.",
      "தனிநபருக்கு ஏற்ப நடத்தப்படும் ஒருவருக்கு ஒருவர் ஆன்லைன் தீட்சை அமர்வு.",
    ),
    level: bi("Beginner", "தொடக்கநிலை"),
    duration: bi("To be announced", "அறிவிக்கப்படும்"),
    format: bi("Online, one to one", "ஆன்லைன், ஒருவருக்கு ஒருவர்"),
    instructor: bi("To be announced", "அறிவிக்கப்படும்"),
    price: bi("₹0.00", "₹0.00"),
    schedule: bi("By appointment", "முன்பதிவின் பேரில்"),
    location: bi("Online", "ஆன்லைன்"),
    status: bi("Enquire", "விசாரிக்கவும்"),
    tags: ["beginner", "online", "english", "tamil"],
  },
  {
    slug: "live-online-group-tamil",
    name: bi(
      "Kriya Yoga Live — Online Group Class (Tamil)",
      "கிரியா யோகா நேரலை — ஆன்லைன் குழு வகுப்பு (தமிழ்)",
    ),
    description: bi(
      "A guided group initiation session conducted live online in Tamil.",
      "தமிழில் நேரலையில் நடத்தப்படும் வழிகாட்டப்பட்ட குழு தீட்சை அமர்வு.",
    ),
    level: bi("Beginner", "தொடக்கநிலை"),
    duration: bi("To be announced", "அறிவிக்கப்படும்"),
    format: bi("Online", "ஆன்லைன்"),
    instructor: bi("To be announced", "அறிவிக்கப்படும்"),
    price: bi("₹0.00", "₹0.00"),
    schedule: bi("Dates to be announced", "தேதிகள் அறிவிக்கப்படும்"),
    location: bi("Online", "ஆன்லைன்"),
    status: bi("Enquire", "விசாரிக்கவும்"),
    tags: ["beginner", "online", "tamil"],
  },
  {
    slug: "in-person-initiation",
    name: bi(
      "Kriya Yoga — (In-person , one to one) Initiation by the Teacher (English / Tamil)",
      "கிரியா யோகா — ஆசிரியரால் நேரடி தீட்சை (ஆங்கிலம் / தமிழ்)",
    ),
    description: bi(
      "An in-person initiation conducted directly by the teacher.",
      "ஆசிரியரால் நேரடியாக நடத்தப்படும் தீட்சை.",
    ),
    level: bi("Beginner", "தொடக்கநிலை"),
    duration: bi("To be announced", "அறிவிக்கப்படும்"),
    format: bi("In person", "நேரில்"),
    instructor: bi("To be announced", "அறிவிக்கப்படும்"),
    price: bi("₹0.00", "₹0.00"),
    schedule: bi("By appointment", "முன்பதிவின் பேரில்"),
    location: bi("To be announced", "அறிவிக்கப்படும்"),
    status: bi("Enquire", "விசாரிக்கவும்"),
    tags: ["beginner", "in-person", "english", "tamil"],
  },
  {
    slug: "gift-a-friend",
    name: bi(
      "Gift a Friend — Kriya Yoga Live Online Group Class",
      "நண்பருக்கு பரிசு — கிரியா யோகா நேரலை ஆன்லைன் குழு வகுப்பு",
    ),
    description: bi(
      "Offer a seat in a live online group class to someone beginning their exploration.",
      "தங்கள் ஆய்வைத் தொடங்கும் ஒருவருக்கு நேரலை ஆன்லைன் குழு வகுப்பில் இடத்தைப் பரிசளியுங்கள்.",
    ),
    level: bi("Beginner", "தொடக்கநிலை"),
    duration: bi("To be announced", "அறிவிக்கப்படும்"),
    format: bi("Online", "ஆன்லைன்"),
    instructor: bi("To be announced", "அறிவிக்கப்படும்"),
    price: bi("₹0.00", "₹0.00"),
    schedule: bi("Dates to be announced", "தேதிகள் அறிவிக்கப்படும்"),
    location: bi("Online", "ஆன்லைன்"),
    status: bi("Enquire", "விசாரிக்கவும்"),
    tags: ["beginner", "online", "english"],
  },
  {
    slug: "family-initiation",
    name: bi(
      "Kriya Yoga — Family Initiation (English / Tamil)",
      "கிரியா யோகா — குடும்ப தீட்சை (ஆங்கிலம் / தமிழ்)",
    ),
    description: bi(
      "A guided initiation for a family or close group, held together in one session. Dates, fees and format are confirmed on enquiry.",
      "ஒரே அமர்வில் ஒரு குடும்பம் அல்லது நெருங்கிய குழுவிற்கு வழிகாட்டப்படும் தீட்சை. தேதிகள், கட்டணம் மற்றும் வடிவம் விசாரணையின் போது உறுதிப்படுத்தப்படும்.",
    ),

    level: bi("Beginner", "தொடக்கநிலை"),
    duration: bi("To be announced", "அறிவிக்கப்படும்"),
    format: bi("Online or in person", "ஆன்லைன் அல்லது நேரில்"),
    instructor: bi("To be announced", "அறிவிக்கப்படும்"),
    price: bi("₹0.00", "₹0.00"),
    schedule: bi("Dates to be announced", "தேதிகள் அறிவிக்கப்படும்"),
    startDate: bi(
      "To be announced (start time — end time)",
      "அறிவிக்கப்படும் (தொடக்க நேரம் — முடிவு நேரம்)",
    ),
    endDate: bi(
      "To be announced (start time — end time)",
      "அறிவிக்கப்படும் (தொடக்க நேரம் — முடிவு நேரம்)",
    ),
    languages: bi("English / Tamil", "ஆங்கிலம் / தமிழ்"),
    maxParticipants: 20,
    location: bi("To be announced", "அறிவிக்கப்படும்"),
    status: bi("Enquire", "விசாரிக்கவும்"),
    tags: ["beginner", "online", "in-person", "english", "tamil"],
  },
];

export const faqs: { q: Bi; a: Bi }[] = [
  {
    q: bi("What is Kriya Yoga?", "கிரியா யோகம் என்றால் என்ன?"),
    a: bi(
      "Kriya Yoga is a traditional yogic path centred on conscious breathing, inner observation and meditation. At The Kriya Lab it is approached experientially rather than as a belief system.",
      "கிரியா யோகம் என்பது விழிப்புடன் கூடிய சுவாசம், உள்முக கவனிப்பு மற்றும் தியானத்தை மையமாகக் கொண்ட ஒரு பாரம்பரிய யோக வழி. தி கிரியா லேப்பில் இது நம்பிக்கை அமைப்பாக அல்லாமல் அனுபவ ரீதியாக அணுகப்படுகிறது.",
    ),
  },
  {
    q: bi("Who can learn Kriya Yoga?", "கிரியா யோகத்தை யார் கற்கலாம்?"),
    a: bi(
      "Anyone sincerely interested in inner exploration may enquire. Suitability is discussed with the teacher before initiation.",
      "உள்முக ஆய்வில் உண்மையான ஆர்வம் உள்ள எவரும் விசாரிக்கலாம். தீட்சைக்கு முன் தகுதி ஆசிரியருடன் பேசப்படும்.",
    ),
  },
  {
    q: bi("Do I need previous yoga experience?", "முந்தைய யோக அனுபவம் தேவையா?"),
    a: bi(
      "No previous Yoga experience is Needed. Practice is introduced gradually.",
      "முந்தைய அனுபவம் தேவையில்லை. பயிற்சி படிப்படியாக அறிமுகப்படுத்தப்படுகிறது.",
    ),
  },
  {
    q: bi(
      "Can people from different religious backgrounds practice Kriya Yoga?",
      "வெவ்வேறு மத பின்னணியில் உள்ளவர்கள் கிரியா யோகம் பயிலலாமா?",
    ),
    a: bi(
      "The practice is not tied to any single religious identity. It is offered as a method of inner observation.",
      "இப்பயிற்சி எந்த ஒரு மத அடையாளத்துடனும் பிணைக்கப்படவில்லை. இது உள்முக கவனிப்பு முறையாக வழங்கப்படுகிறது.",
    ),
  },
  {
    q: bi("How often should I practice?", "எவ்வளவு அடிக்கடி பயிற்சி செய்ய வேண்டும்?"),
    a: bi(
      "Follow the duration and frequency recommended by your teacher. Do not practise beyond what has been advised.",
      "உங்கள் ஆசிரியர் பரிந்துரைக்கும் கால அளவையும் அளவையும் பின்பற்றுங்கள். அறிவுறுத்தப்பட்டதற்கு மேல் பயிற்சி செய்ய வேண்டாம்.",
    ),
  },
  {
    q: bi("What is initiation?", "தீட்சை என்றால் என்ன?"),
    a: bi(
      "Initiation is the session in which the practice is formally transmitted and explained by a teacher.",
      "தீட்சை என்பது ஆசிரியரால் பயிற்சி முறையாக வழங்கப்பட்டு விளக்கப்படும் அமர்வு.",
    ),
  },
  {
    q: bi("How do I begin?", "நான் எப்படித் தொடங்குவது?"),
    a: bi(
      "Send an enrollment request or an enquiry on WhatsApp, and a guide will respond with the next steps.",
      "பதிவு கோரிக்கை அல்லது வாட்ஸ்அப் விசாரணையை அனுப்புங்கள்; அடுத்த படிகளுடன் பதிலளிக்கப்படும்.",
    ),
  },
];

export const journal: {
  slug: string;
  title: Bi;
  subtitle: Bi;
  category: Bi;
  date: string;
  readingTime: Bi;
  body: Bi[];
}[] = [
  {
    slug: "the-first-conscious-breath",
    title: bi("Activation and purification of the Nadi system\n\n\n", "முதல் விழிப்புணர்வு சுவாசம்"),
    subtitle: bi(
      "Activating and purifying the Nadi is a crucial step towards achieving a harmonious flow of energy, ensuring that our life force energy is circulating unimpeded throughout the body. This process not only promotes overall vitality and wellness, but is also essential for fostering a deeper connection with our spiritual selves and attaining higher states of consciousness. Nasal dominance A simple method to determine which nadi is dominate at any given time is through observing nasal dominance. The nadi system are closely connected to our breath, and the flow of air through our nostrils can show which nadi is more active. When the left nostril is dominant, it signifies the activation of the Ida nadi, and conversely, when the right nostril is dominant, it indicates the activation of the Pingala nadi. By becoming aware of our nasal dominance, we can begin to understand the current state of our energy flow and work towards balancing the nadi system. Yogis observed the natural cycle of one nostril becoming more dominant in airflow than the other due to autonomic nervous system control over the nasal turbinate\\u2019s. The alternation between the body\\u2019s nasal dominance happens approximately every three to four hours and is known as the nasal cycle. The interesting intersection between this physiological phenomenon and the shift in subtle energy is observed in how nasal breathing can influence which nadi predominates at a specific moment. The nasal cycle refers to the alternating congestion and decongestion of the nostrils, which occurs naturally throughout the day. When we inhale, one nostril is more dominant than the other, while the other nostril experiences reduced airflow. This dominance switches approximately every 180- 240 minutes, and it is believed to be associated with the activation of the sympathetic (active) and parasympathetic (restful) nervous systems.When the flow of air through our nostrils is perfectly balanced, it indicates the activation of the Sushumna nadi. When the Sushumna nadi becomes active, it allows for a free flow of Prana (life force energy) throughout the body, leading to a state of balance and harmony. Activating the Sushumna nadi is an important goal in many yogic and spiritual practices. Purification of the Nadi Purifying the Nadi is like clearing the water pipe for any blockages for a smoother journey; it expels any obstructions impeding the seamless flow of Prana. This purification process is central to removing stagnant energy, fostering a more harmonious energetic balance, and enhancing overall well-being.When the Nadi\\u2019s are purified and balanced, the flow of prana becomes smooth and unrestricted. This leads to improved physical, mental, and emotional well-being. And heightened spiritual well-being. Techniques for activating the Nadi system \n\n\nActivating and balancing the Nadi can be accomplished through various yoga practices, including asanas (postures) and pranayama (breathing techniques). Pranayama helps to unblock, purify, and balance energies in the nadi system, while also harmonizing the sun energy ( Solar energy ) and moon energy ( Lunar energy) within the body. Specific asanas stimulate different energy pathways and chakras, supporting the flow of prana or energy. To ensure safe and correct practice, it is advisable to learn these techniques under the guidance of a knowledgeable instructor. By incorporating these yogic techniques into your practice, you can enhance your overall energetic well-being. \n\n\nHere are some of the key yogic techniques for activating your energy channels or Nadi system. 1. Hatha Yoga: The physical postures and movements of Hatha Yoga, help to release energy blockages in the nadi system, promoting an improved flow of prana. The practice strives to balance the sun (Pingala) and moon (Idagala) energies within the body. 2. Pranayama (Breathing Exercises): Specific breathing techniques are employed to regulate and direct the prana throughout the nadi. Energizing practices such as Ujjayi, Kapalabhati, and Bhastrika Pranayama increase the flow of prana, stimulating the nadi system and awakening dormant energy within the body. These techniques involve controlled inhalation, exhalation, and sometime retention of breath, helping to cleanse and purify the energy channels. 3. Bandhas (Energy Locks): There are certain contractions or locks within the body, such as Mula Bandha (root lock), Uddiyana Bandha (abdominal lock), and Jalandhara Bandha (throat lock), which, when applied during yoga practice, can aid in directing prana through the nadi system. 4. Meditation: Focused meditation can lead to deep states of relaxation and mental clarity, which are conducive to opening and cleansing the nadi system . Meditation on specific chakras can also stimulate the flow of energy through associated nadi. 5. Chanting and Mantras: The vibration from chanting is believed to purify and activate the nadi system. Mantras are specific sounds or phrases or syllable that, when recited, can influence the energy flow within the body. 6. Cleansing Practices: These are purification rituals that can range from nasal cleansing (Jala Neti), to abdominal cleansing (Agnisar Kriya), and more. Such practices cleanse the physical body but also have subtle effects on the nadi system. 7. Mudras (Hand Gestures): Specific hand gestures are said to influence energy flow and stimulate different areas of the body connected to the nadi system. Final thoughts Ida, Pingala, and Sushumna\\u2014these three primary Nadi or channels are not just pathways for the pranic energy to flow; they are the architects of our inner harmony, and the keys to unlocking our highest potential. As we journey through life\\u2019s myriad experiences, boosting our awareness and embracing the wisdom of these subtle energy streams can lead us to a more profound state of health, vitality, and spiritual awareness.",
      "ஒவ்வொரு உள்முக பரிசோதனையும் தொடங்கும் இடம்.",
    ),
    category: bi("Breath", "சுவாசம்"),
    date: "2026-01-12",
    readingTime: bi("4 min read", "4 நிமிட வாசிப்பு"),
    body: [
      bi(
        "Before any technique, there is the simple fact of the breath moving on its own. Sitting quietly and following one full cycle — the entry of air, the pause, the release — is the first experiment of The Kriya Lab. Nothing is forced and nothing is added; attention alone is the instrument. Practised daily for a few minutes, this observation begins to steady the mind long before any advanced practice is taken up.",
        "எந்தப் பயிற்சிக்கும் முன், சுவாசம் தானாகவே இயங்கும் எளிய உண்மை உள்ளது. அமைதியாக அமர்ந்து ஒரு முழுச் சுழற்சியை — காற்று உள்ளே வருவது, இடைநிறுத்தம், வெளியேறுவது — பின்தொடர்வதே தி கிரியா லேப்பின் முதல் பரிசோதனை. எதுவும் வலிந்து செய்யப்படுவதில்லை; கவனம் மட்டுமே கருவி. தினமும் சில நிமிடங்கள் இதைச் செய்யும்போது, உயர்பயிற்சிகளுக்கு முன்பே மனம் நிலைபெறத் தொடங்குகிறது.",
      ),

    ],
  },
  {
    slug: "observation-as-practice",
    title: bi("Observation as Practice", "கவனிப்பே பயிற்சி"),
    subtitle: bi(
      "What changes when you stop interfering.",
      "தலையிடுவதை நிறுத்தும்போது என்ன மாறுகிறது.",
    ),
    category: bi("Inner Exploration", "உள்முக ஆய்வு"),
    date: "2026-02-04",
    readingTime: bi("6 min read", "6 நிமிட வாசிப்பு"),
    body: [
      bi(
        "Most of us meet an experience by immediately judging it: this is pleasant, this should stop, this should last longer. Observation as practice means setting that reflex aside for the length of a sitting. Sensations, thoughts and moods are allowed to arise and pass while attention stays with the breath. What changes is not the content of the mind but our relationship to it — and that shift is the ground on which Kriya practice is built.",
        "பெரும்பாலும் ஒரு அனுபவத்தை உடனே தீர்ப்பிடுகிறோம்: இது இனிமையானது, இது நிற்க வேண்டும், இது நீடிக்க வேண்டும். கவனிப்பே பயிற்சி என்பது ஒரு அமர்வின் நேரம் வரை அந்தப் பழக்கத்தை ஒதுக்கி வைப்பதே. உணர்வுகள், எண்ணங்கள், மனநிலைகள் எழுந்து மறையட்டும்; கவனம் சுவாசத்துடன் இருக்கட்டும். மனத்தின் உள்ளடக்கம் அல்ல, அதனுடனான நமது உறவே மாறுகிறது — கிரியா பயிற்சி கட்டப்படும் அடித்தளம் இதுவே.",
      ),

    ],
  },
  {
    slug: "a-laboratory-of-one",
    title: bi("A Laboratory of One", "ஒருவரின் ஆய்வகம்"),
    subtitle: bi(
      "Becoming both scientist and subject.",
      "ஆய்வாளராகவும் ஆய்வுப் பொருளாகவும் ஆவது.",
    ),
    category: bi("Consciousness", "உணர்வு"),
    date: "2026-03-18",
    readingTime: bi("5 min read", "5 நிமிட வாசிப்பு"),
    body: [
      bi(
        "A laboratory needs an instrument, a subject and someone willing to record what actually happens. In inner work all three are the same person. You test a technique in your own body, you undergo its effect, and you note the result honestly — including the days when nothing seems to happen. This is why The Kriya Lab asks for consistency rather than belief: repeated, careful observation is what turns instruction into direct experience.",
        "ஒரு ஆய்வகத்திற்கு கருவி, ஆய்வுப் பொருள், மற்றும் நடப்பதை நேர்மையாகப் பதிவு செய்பவர் தேவை. உள்முகப் பயிற்சியில் இம்மூன்றும் ஒரே நபர்தான். உங்கள் உடலிலேயே ஒரு பயிற்சியைச் சோதிக்கிறீர்கள், அதன் விளைவை அனுபவிக்கிறீர்கள், முடிவை நேர்மையாகக் குறித்துக்கொள்கிறீர்கள் — எதுவும் நடக்காதது போல் தோன்றும் நாட்களையும் சேர்த்து. அதனால்தான் தி கிரியா லேப் நம்பிக்கையை அல்ல, தொடர்ச்சியைக் கேட்கிறது: தொடர்ந்த கவனிப்பே அறிவுறுத்தலை நேரடி அனுபவமாக மாற்றுகிறது.",
      ),

    ],
  },
];

export const lineage: { name: Bi; role: Bi; note: Bi }[] = [
  {
    name: bi("Lineage Masters", "பரம்பரை குருமார்கள்"),
    role: bi("Agasthiyar and Siddhar Bogar → Sri Guru Babaji → Yogi S.A.A Ramaiah → The Kriya Lab   ", "மாதிரி பதிவு"),
    note: bi(
      `The Initiation of Mahavatar Babaji Mahavatar Babaji’s journey led him directly into the lineages of Agasthiyar and Bogar.Initiation by Siddhar Bogar: Siddhar Bogar recognized Babaji’s immense spiritual potential and accepted him as a disciple. Siddhar Bogar initiated him into advanced meditation, astronomy, and the secrets of progressive light body transformation (Saruva Mukti). Bogar then guided Babaji to seek out Siddhar Agasthiyar to complete his training in the ultimate stages of yoga.Initiation by Siddhar Agasthiyar: Babaji traveled to Courtallam (Kuttalam) in Tamil Nadu, performing intense physical and mental austerities to meet the elusive sage. Pleased by his devotion, Siddhar Agasthiyar appeared and initiated Babaji into the secrets of Vasi Yoga (the ancient Siddha form of pranayama and breath mastery). Siddhar Agasthiyar then commanded him to go to Badrinath in the Himalayas to practice these techniques and attain physical immortality (Siddhi). The Evolution from Vasi Yoga to Kriya Yoga The scientific blueprint of modern Kriya Yoga is directly derived from the ancient teachings of these two masters:  The Core Teachings: The techniques taught by Siddhar Bogar and Siddhar  Agasthiyar were known within the 18 Siddhar tradition as Vasi Yoga or Siva Yoga. The Transition: Sri Guru Babaji synthesized these deep, often cryptic alchemical and breath practices into a structured, accessible five-fold path. He renamed this system Kriya Yoga to make it practical for householders and modern spiritual seekers.  `,
      "உண்மையான பரம்பரைத் தகவலை இங்கே சேர்க்கவும். வரலாற்றுக் கூற்றுகள் எதுவும் உருவாக்கப்படவில்லை.",
    ),
  },
  {
    name: bi("Yogi S.A.A. Ramaiah", "யோகி S.A.A. ராமையா"),
    role: bi("\n", "\n"),
    note: bi(
      `Yogi S.A.A. Ramaiah, the direct disciple of Sathguru Sri Guru Babaji, spread the Science of Kriya Yogam and Tamil Siva Yoga Siddhantam to the nooks and corners of the earth, giving initiation and training to sincere seekers of Truth. His teachings emphasized that yoga is the practical side of all world religions and he lectured globally on this topic. 

As one of the world’s
greatest exponents of yoga from a scientific standpoint, Yogi Ramaiah or Yogiar
as his students referred to him, wrote extensively on the subject. He held a
master’s degree in geology from Madras University, was a trained physical
therapist, orthotist, and renowned scholar of Tamil language. From 1953, he
worked on editing, translating and explaining the deeper meanings of
manuscripts by the Tamil Yoga Siddhas. His publications include thousands of
verses by Siddhas like Agastiar and Boganathar. Yogiar also lectured in
hospitals worldwide, demonstrating how yogic therapy, combined with allopathic
medicine, could treat diseases such as diabetes and hypertension. He was
awarded a Ph.D. In his early 80’s by Columbia Pacific University. Yogiar’s
contributions bridged the gap between yoga and science and he was honored by
the World Health Organization and the World Congress for his work in
alternative medicine.

Yogiar passed away on July 12, 2006, attaining Mahasamadi. His body remained glowing, indicating the divine presence. `,
      "ஆசிரியர் விவரங்கள், புகைப்படங்கள் மற்றும் வாழ்க்கைக் குறிப்புகளை உள்ளடக்க அமைப்பின் மூலம் சேர்க்கவும்.",
    ),
  },
  {
    name: bi("THE KRIYA LAB", "தி கிரியா லேப்"),
    role: bi("Present day", "இன்று"),
    note: bi(
      "The school through which Kriya Yoga is currently offered.",
      "இந்த ஆய்வு தற்போது வழங்கப்படும் பள்ளி.",
    ),
  },
];

export const journeyChapters: Bi[] = [
  bi("Childhood  Roots of Love and Discipline   -   I was born into a home where love and compassion were not taught in words but lived in daily gestures. My mother's love, in particular, was boundless. I still remember her walking into my school's PTA meetings, standing before my principal and teachers, and saying, with quiet conviction, \"Teach him to be a good human being, academic performance is not my only measure of his success.\" Those words have stayed with me my entire life — not as a memory, but as a compass. My father, by contrast, held a firmer hand when it came to academics, and between the two of them, I grew up held by both tenderness and discipline, love and compassion, in equal measure.", "குழந்தைப் பருவம்"),
  bi("The Photograph That Would Not Let Me Look Away    -  When I was in the first grade, someone handed me a small laminated photograph in my school — an old man with spectacles, dressed in an orange robe. I had no way, at that age, to explain what happened next, but I felt an immediate and inexplicable pull toward him. I would find myself returning to that photograph again and again through the school day, simply looking into his eyes. There was a peace that radiated from that small piece of laminated paper, a compassion I could feel but not name, and eyes so magnetic and powerful that I could not look away. It was only years later that I learned his name was Swami Chinmayananda Saraswati of the Chinmaya Mission. To this day, his face and his eyes, the impact it made on a six-year-old boy remains vivid in my memory.  ", "அந்தப் புகைப்படம்"),
  bi("The Meeting Christ  -  At seven, circumstances changed my path in an ordinary, practical way that turned out to carry spiritual weight. My previous school stopped running its bus service, which covered nearly ten kilometers to my home, and so my parents enrolled me in a Christian school nearby. There, mornings began with the Lord's Prayer, hymns, and reflections on the life and teachings of Christ, held out in the open school playground.   I fell in love with Christ's teachings — with the sheer scale of love he held for humanity. I remember, as a child, feeling genuinely troubled by the injustice of his death, thinking to myself that if I had lived in his time and in his place, I would have found some way to protect him from his enemies. It was through those early morning prayers and lessons from the life of Christ, the passion he had for humanity- that the seeds of universal love and compassion were first planted in me, long before I had any language for spirituality at all.", "இமயமலையில் தேடல்"),
  bi("Gratitude to the Messenger  -   I remain deeply grateful to the Indian superstar Shri Rajnikanth, who played a pivotal role in introducing me to Sri Guru Babaji. Like millions of others, I first learned of the immortal Babaji of the Himalayas through the film 'Baba,' produced by the celebrated Indian actor Shri Rajnikanth. It was in 2002 when I first watched the film, with little idea that the next few hours would alter the course of my life. As the story unfolded on screen, something in me stirred — a recognition that felt older than the moment itself. The portrayal of Babaji, radiant and timeless, struck a chord that mere words could not explain. I remember a strong connection to the Guru, sitting in silence long after the film ended, feeling an inexplicable pull toward the timeless Guru. In the days that followed, I found myself drawn to learn more. What began as curiosity soon deepened into reverence, and reverence, in time, into devotion. I came to understand that the film had not merely entertained me; it had served as a doorway — a means by which the divine chose to introduce itself to an ordinary seeker like myself.   Looking back, I recognize this moment as the quiet turning point of my spiritual life which lead me to the \"Autobiography of a Yogi\" which in turn lead me to the Himalayas, whatever came after, it all traces back to that single film and the generosity of an artist who, whether he fully knew it or not, opened a path for millions to encounter something eternal. For this reason, I hold Shri Rajnikanth in a place of lasting gratitude in my heart — To me, he is not only one of India's greatest cinematic icons and an actor of extraordinary talent but also an instrument through whom Shri Guru Babaji entered my life. Whether consciously or as part of a greater divine design, he became a messenger who helped awaken the spiritual quest that would forever transform my life ", "தூதருக்கு நன்றி"),
  bi("The Book That Changed Everything\n\n \n\nMy formal search did not begin until much later, but the inquiry itself had been present since childhood, a persistent curiosity about life, consciousness, and the nature of the Creator that never quite left me. It found new fuel during my college years, while I was pursuing my Bachelor's degree in Chennai. It was then that I came across The Autobiography of a Yogi by Paramahansa Yogananda. The book did not simply interest me — it awakened something. A deep, urgent longing rose within me to directly experience the truths described in its pages, rather than merely read about them.", "தலைப்பு 1"),
  bi("The Search in the Himalayas and my initiation into Kriya Yoga  -     That longing carried me to the Himalayas in 2005, in search of a true spiritual master. I met many saints and yogis along the way, each with something to offer, yet something in me knew the search was not yet complete. It was in pursuit of authentic Kriya Yoga that I learned from the Kriya Yoga school of Shri S. A. A. Ramaiah, a direct disciple of Maha Avatar Babaji or Sri Guru Babaji, who was offering Kriya Yoga initiation in Chennai. In 2005, I received my first Kriya Yoga Deeksha from his chief disciple Mr Marshall Govindhan, the formal beginning of a practice that has never since left my life.   My spiritual education did not stop there.\n\n\nIn 2010, I received Kriya Yoga initiation from Shri Shibendu Lahiri, the great-grandson of Yogiraj Lahiri Mahasaya of Bengal, the house holder yogi and one of the foremost custodians of the authentic Kriya Yoga lineage as Mentioned in the Autobiography of a Yogi.   In 2012 I had met Sri M in Madhanapalli and expressed my wish to get kriya Initiation from him. He smiled and said “not today” .Sri M is the respected teacher and author of the book - Apprenticed to a Himalayan Master, and The Journey Continues and also the founder of The Satsang Foundation. later at the end of 2025 I was further initiated into Kriya yoga by Shri M.   To ground this inner practice in a strong educational foundation, I completed a 200-hour Intensive Yoga Teacher Training Course in 2017 at Asana Andiappan College of Yoga and Research Centre, Chennai, an institution accredited by Yoga Alliance USA. Each initiation was not simply an event, but a deepening — another layer of the path revealing itself.   Since 2005, I have practiced Kriya Yoga and meditation without interruption. Kriya Kundalini Pranayama, a powerful system of breath and meditation that cultivates physical vitality, emotional balance, mental clarity, and spiritual growth. Over the years of practice, I have come realized that kriya yoga is a complete science of inner transformation for the soul to expedite its own spiritual evolution.  ", "தலைப்பு 2"),
  bi("A Snowfall in Herndon ,Virginia , Washington D.C - Feb 2026   -    The Ordinary Made Sacred   It began the way it always begins — with an ordinary Morning made sacred by discipline. Every practice builds toward something, though one rarely knows what until it arrives. Mine arrived on an ordinary snowing Morning In February 2026, snow had stopped falling steadily over Herndon, Virginia, Near Washington DC between Dulles Airport and Copper Creek. My surroundings during that period perfectly mirrored my internal state. It was winter along the East coast of America, a time when the canopy had fully surrendered its colour, leaving the trees looking entirely empty and exposed. The vibrant hum of the summer forest had vanished, replaced by an enveloping silence that felt both isolating and peaceful. Save for the occasional, crisp chipping of birds hidden in the hollows and the gentle rustling of a deer family carefully foraging for food among the frozen roots, the woods were entirely still. In that vast quietude, I found the space where I sit and meditate for past two weeks still with few inches of snow. The world outside had gone quiet, muffled under mostly indoors, a different kind of stillness was being prepared — the stillness of a seeker who had shown up, day after day, year after year, to do the inner work: Kriya pranayama or simply the Kriya as I would prefer to call it, and then meditation, the same sequence followed with the quiet devotion of someone who no longer needs to be reminded to sit. I have been following the same sequence I had followed for over two decades, there was nothing unusual about that Morning. No signs, no premonitions. Just breath, posture, and the slow withdrawal of attention from the world of snow and the chipping birds into the world within. And it was precisely because it was ordinary — because the practice had become as natural as breathing.   ", "தலைப்பு 3"),
  bi("The Ball of White Light  -    In the depths of meditation, a vision arose that no words fully can contain. A huge sphere of white light appeared — not seen with the physical eyes, but perceived through the Agjna chakra, the third eye, the seat of subtle vision that opens only after the ordinary eyes have been surrendered. The brightness was so absolute I could not look directly at it, and yet I was seeing it, fully and simultaneously. From this light, creation itself poured forth. Galaxies spun into being. Animals took form. Human beings emerged, one after another, flung outward from the light like sparks from a fire that never diminishes. The brightness was so absolute that it could not be looked at directly — and yet it was being seen, fully, simultaneously, in a way that defied the logic of ordinary sight. This was not seeing at something. This was seeing from somewhere else entirely. And then, moments later, the light would seem to become utterly void — empty, formless, without a single feature — and still, impossibly, creation continued to pour out of it. Fullness and emptiness were not taking turns. They were the same thing, witnessed from a vantage point where such contradictions dissolve.   ", "தலைப்பு 4"),
  bi("The Question   -   In the middle of this vision, a question arose — not as idle curiosity, but as something urgent, almost desperate to be answered: If all of creation is pouring from this light, is this light itself the Creator? But I see no Creator here in any form I had imagined the creator to be — only creation, endlessly unfolding. Where then, is the one who creates?   It was the oldest question a human being can ask, arising sometime from the intellect and sometime from the very source of being, at the one moment it could actually be answered.   ", "தலைப்பு 5"),
  bi("Babaji Appeared  -  With the question still alive, a deeper longing surfaced — the wish to see my Guru Shri Guru Babaji, to ask him directly. And in that instant — the very instant the longing rose — Babaji appeared as light. There was no reasoning that led to this recognition. No mental effort was needed to confirm that this was indeed Babaji. It was known instantly, wordlessly, through intuition alone, the only faculty capable of recognizing truth at that depth. The question was asked at once: Babaji... I don’t see any creator here as I had imagined the creator to be— only creation, appearing endlessly from light. is this the Creator?  \n\nBabaji answered: \"Yes, my dear child. Both are the same. Both are the same.  \"  \n\n\nIn that dimension, the answer required no further unpacking. There was no bridge to build between \"creator\" and \"creation\" — no reconciliation needed, because separation had never truly existed. The mind, so accustomed to needing explanations, needed none. It simply was so. ", "குருமார்களின் பரம்பரை"),
  bi("The Merging  -  Then something happened that I can only describe as beyond the capacity of human language is designed to carry. Babaji drew this being into himself—not as a metaphor, not as a feeling of closeness, and not merely as an overwhelming sense of union. Something far more profound occurred. The sense of my existence as something separate from him quietly ceased to exist. The “I” that I had always understood as myself was no longer standing apart from Babaji.   It became Babaji.   I do not mean that I felt as though I became Babaji. It was not an imagination, It was not a visualization, It was not an emotional identification, or It was not the thought that “I am Babaji.” There was no thought involved. There was an actual merging in which the distinction between “me” and “Babaji” disappeared completely. The separate identity I had carried throughout my life was simply no longer there. I struggle to explain what happened beyond this point, because language requires separation. It requires a subject who experiences and an object that is experienced. But in that moment, that separation itself had dissolved.\\n\\n\\nAll I can say is:  I am = Babaji.\\n\\n\\nEven writing those words feels inadequate, because they can so easily be misunderstood as a declaration of personal identity. That is not what I am attempting to convey. I am trying to describe an experience in which the individual identity I had known as “I” ceased to exist separately, and what remained was experienced as Babaji himself.\\n\\n \\n\\nI know that my Guru's grace was the only reason I was allowed to experience this. I do not regard it as something I achieved through my own ability or effort. Whatever discipline I had undertaken may have prepared me to some extent, but the experience itself felt entirely like grace. I wish that every human being could experience something of this depth at least once before their earthly journey in a human body comes to an end—not because everyone must accept my interpretation of the experience, but because I came to understand that there may be dimensions of human consciousness far beyond what we ordinarily imagine.\\n\\n \\n\\nMerging with the Creative light -  The merging did not end with Babaji. The identity continued to dissolve outward. What I had experienced as “Babaji” opened into something immeasurably vaster. The boundaries continued disappearing until there was no longer a distinction between the being I had called Babaji and creation itself. Then even that distinction disappeared.\\n\\n \\n\\nThere was only the creative light.\\n\\n \\n\\nThe light I had previously witnessed as pouring forth galaxies, worlds, forms, and beings was no longer something separate from me, something existing “out there” to be observed. Creation was pouring forth from my very being. At this point, \n\n\nI deliberately hesitate to use words such as “I became God.” I do not want to reduce the experience to such a statement. If I attempted to explain what happened using that phrase, I believe I would capture perhaps one percent—or even less—of what the actual experience was. The words would create an intellectual concept where there was, in reality, something that transcended concepts altogether. So I will not attempt to define it that way. There are simply no adjectives left that can adequately describe what this was. Even the word “feeling” becomes inadequate, because a feeling implies that there is a separate self-having an experience. In that moment, there was no longer a separate self-standing apart from what was being experienced.\\n\\n \\n\\nThere was no observer and nothing being observed.\\n\\n \\n\\nThere was no distance.\\n\\n \\n\\nThere was no separation.\\n\\n \\n\\nThere was only the experience of complete merging—and beyond that merging, the dissolution of identity into the creative light from which everything seemed to arise. What remains with me is not merely the memory of an extraordinary spiritual experience. It is the understanding that the identity I had spent my entire life calling “I” may not be what I once believed it to be. And for that glimpse beyond the boundaries of the individual self, I can only bow to the grace of my Guru. \\n\\n  \\n", "வெண் ஒளிக் கோளம்"),
  bi("The Instruction   -     When words became possible again — Babaji, in his infinite compassion, gently returned this being to the world of form, He offered a task:  \n\n\nBabaji spoke \"My Child, your journey is complete. Now help souls who need help, who are waiting to come home. Give it to souls who have lost hope\".  \n\n\n “I pleaded \" Please keep me with you, Babaji. I don't want to go back.\"\u00a0\n\n\nThe words arose from a place deeper than thought. After what I had experienced, the idea of returning to the ordinary world felt almost unbearable. I had experienced a state of consciousness in which the boundaries between my Self, Babaji, and the greater reality seemed to dissolve. I did not want that experience to end. \n\n\nBabaji smiled. \"Not so soon, my dear child. You still have work to do in this world.\"   \"I will fulfill your long-cherished wish — that the kriyas should be open and available to every human being, not reserved for a select few, that everyone who wishes to have it should have access to its benefits. Give it to the souls who need help, who have lost hope. Give it to those who wish to evolve and to those who follow other faiths, for there are many waiting to blossom. I will guide you on what changes are needed on the kriyas, so that people of every faith may practice the kriyas. Do not have an outward representation that identifies with a particular religion, that will help you to reach many souls who follow other religious path. Feed the hungry, the time is limited.\" Simple. Final. Complete.   \n\n\nIn that experience, I understood that the essence of Kriya Yoga need not be confined by religious identity. Its purpose, as I understood it, was to help humans explore consciousness through direct practice and personal experience. I also understood that the Kriyas may need to be presented and adapted in ways that allow sincere practitioners from different faiths and backgrounds to engage with them without feeling that they must abandon their own religious identity. Babaji showed me that there were changes and refinements that would be necessary, and that he would guide me in understanding them.   \n\n\nBabaji then gave me an assurance that remains deeply engraved in my heart:\u00a0\n\n\nBabaji spoke “whoever practices these Kriyas with sincerity and dedication, I will guide them and help accelerate their own spiritual evolution”.   \n\n\nI had asked Babaji to let me remain with him. Instead, he reminded me that I had to return—not because the experience was over, but because it had given me a responsibility. I had to return to the world carrying a promise. A promise to make the path more accessible. A promise to serve those who are searching. A promise to reach those who have lost hope. A promise to make the practice available beyond the boundaries of religious identity. A promise to reach those who wants to evolve and above all, a promise to help make the ancient science of Kriya Yoga available to every sincere human who is ready to explore the possibility of inner transformation and expedite their own spiritual evolution. I had wanted to remain with Babaji. He sent me back with a purpose.   Only now does the deeper meaning of a guru's guidance, offered across years of practice, become clear. Every kriya, every breath, every hour of stillness had been leading toward this single handoff, from student to servant, from seeker to guide. The snowfall started again in Herndon, indifferent and beautiful, while inside, a life's direction had just been quietly, permanently reoriented. What began as a meditation on an ordinary snowy Morning in February 2026 became the moment a lifelong practice bore its fruit — not as personal attainment, but as a calling: to help other souls find their way home. ", "அந்த அறிவுறுத்தல்"),
  bi("Reflections: On the Nature of the Merging  -  What the Merging Revealed  -  In the time since that Morning in Herndon, I have sat with the experience often, turning it over the way one turns a stone in the hand, trying to understand its many faces. And one realization has settled in me with growing clarity: Sri Guru Babaji is not a separate spiritual being who exists apart from the rest of creation. Babaji is the universal light/Love itself —light that takes human form, again and again, simply to meet human beings where they are.   I have come to feel that this taking of form is an act of accommodation, not limitation. The human mind finds comfort in a face, a name, a form it can hold onto. It is far easier for the intellect to trust a being who appears human than to surrender to something formless and vast. So the infinite light/love takes a human form when needed, not because it needs one, but because we do. I know this now not as a concept but as something I lived directly. When the merging happened, my own human form made no sense anymore. It did not vanish through effort or realization; it simply became irrelevant; the way a long explanation or a passage about the taste of sugar becomes irrelevant when we actually taste sugar directly. What I found myself to be, in that space, was light or Love. And more precisely, both were the same in that reality.   \n\n\nLove as a State, Not a Feeling  -  This is the part I find hardest to put into ordinary words, and yet it feels the most important to try. When I say I \"became love,\" I do not mean that I felt love toward someone or something. I mean that love was no longer a feeling directed outward from a self — I mean that I ceased to be anything other than love itself. There was no longer a \"me\" who was loving. There was only a being of love. The self, which had become love or light, then merged into the same creative light from which galaxies and universes were pouring forth. And that same light, in turn, merged into Sri Guru Babaji. In that dimension, love and light revealed themselves as two names for a single, undivided reality. When I speak of love here, I mean universal love — the substance out of which everything, without exception, is made.    ", "அந்த அறிவுறுத்தல்"),
  bi("On Grace, and Why Practice Alone Is Not Enough  -  \n\n \n\nI have asked myself many times whether this experience was the result of my years of sadhana, and I no longer believe I can answer that simply. What I can say is this: practice alone does not produce this. Regular, disciplined effort may prepare the ground, but the seed that grows there is grace. And grace, as I understand it now, only arrives where there is already love and compassion for the whole of creation. This means the most essential ingredient is not technique. It is not the number of years practiced, nor the precision of one's kriya’s. The essential ingredient, at the most basic level, is Love and compassion towards everything, everyone, every being— held not selectively, but universally. if their heart is genuinely filled with love and compassion for every living and non-living thing. I believe this experience could arrive even for someone who has never formally practiced yoga at all.\n\nI say \"non-living\" quite deliberately, because in that state, everything I beheld as light included what we normally consider non-living — stones, rivers, air, soil. I understand fully that it is not an easy thing to love a rock, or a mountain, or the wind, in the way we love a person or an animal. It requires a different kind of heart than the one most of us begin with. ", "பணி"),
  bi("A Prayer of Gratitude   -  As the experience gradually settled into the depths of my heart, an overwhelming sense of gratitude arose within me. My first thoughts turned to my parents, especially my beloved mother, through whom I had received this precious human birth. In that sacred moment, I realized that without this human body they had given me, I could never have experienced the divine grace that had just unfolded before me. With profound reverence, I silently offered my gratitude to them. I reflected that, had they not brought me into this world, I do not know where my soul might have been—perhaps still drifting in the vast currents of cosmic existence, awaiting another opportunity to be awakened to the presence of the Guru. This human birth, so often taken for granted, now revealed itself to me as the greatest of all blessings, for it alone had made possible this extraordinary spiritual experience.My heart then turned with equal gratitude toward Shri Rajnikanth. Through his vision and devotion in bringing Shri guru Babaji to the screen, he became the instrument through which my forgotten connection with Babaji was rekindled. What appeared outwardly to be a motion picture became, for me, a sacred bridge linking the present with an eternal bond that had long remained dormant within my soul. It became increasingly clear to me that the Divine often works through ordinary human instruments to accomplish extraordinary purposes. My parents had given me the priceless gift of human life, while Shri Rajnikanth, unknowingly, became the medium through whom I rediscovered my eternal Guru. One bestowed the body through which I could walk the spiritual path; the other helped awaken the remembrance of the Master who would illuminate that path. In that profound moment of reflection, my heart overflowed with gratitude—to my parents for the gift of this human incarnation, to Shri Rajnikanth for serving as an instrument of Divine Grace, and above all, to Shri guru Babaji, whose unseen compassion had orchestrated every step of this journey long before I became aware of it. Looking back, I can only bow in humility before the mysterious perfection of the Divine plan, in which every person and every event had its sacred place.    ", "தலைப்பு 1"),
  bi("The Mission given to me -    My mission today is to make the ancient wisdom of Kriya Yoga accessible to all modern seekers — to give it to as many individuals possible to cultivate better health, inner peace, heightened awareness, and a deeper connection with their true Self. It is, in many ways, the same journey that began with a six year old kid staring at a stranger's photograph, unable to look away — a journey that has led, decades later, to understanding that the seeker, the sought, and the seeking were never separate at all.   ", "தலைப்பு 2"),
];

/** Real, consented student experiences only. Add entries here as they are collected. */
export const testimonials: { name: Bi; text: Bi; program: Bi }[] = [];


/** Purchase terms shown on the Buy page and the Terms page. Tamil falls back to English until a translation is provided. */
export const purchaseTerms: Bi[] = [
  bi(
    "No refunds will be provided on cancellation or no show for the events but you may be allowed to join a session in future subject to the discretion of The Kriya Lab on a case by case basis.",
    "",
  ),
  bi(
    "All the media, literature and other material presented and shared with the participants of the session are intellectual property of The Kriya Lab. You may not reuse, republish or reprint such content without our written consent. Any violation of the same will lead you to risk and legal implications.",
    "",
  ),
  bi(
    "The audio and video may be recorded during the webinar and may be used for training purposes and / or may be published to public web and social media such as YouTube, Facebook etc. By signing up to the webinar, Online / Off-line Kriya Yoga Course you agree to the same.",
    "",
  ),
  bi(
    "The Kriya Lab reserves the right, at its sole and absolute discretion, to refuse, restrict, or revoke admission of any registered participant to the webinar, on any grounds deemed appropriate by The Kriya Lab Teacher's, including but not limited to reasonable suspicion of fraud, misconduct, plagiarism, defamation, dissemination of misleading information, or any act or omission that may cause harm to the organisation, its reputation, or any individual associated therewith.",
    "",
  ),
  bi(
    "You agree to share information entered on this page with The Kriya Lab (owner of this page) and Stripe, Razorpay, UPI banking and internet banking, adhering to applicable laws.",
    "",
  ),

];
