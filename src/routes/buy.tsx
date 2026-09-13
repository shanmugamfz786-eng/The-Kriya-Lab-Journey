import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Field, PageHero, Section, inputClass } from "@/components/Primitives";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { ProgramCalendar, type ProgramDate } from "@/components/ProgramCalendar";
import { bi, useLang } from "@/lib/i18n";
import { programs, purchaseTerms, ui } from "@/content/site";
import { supabase } from "@/integrations/supabase/client";
import { PAID_PROGRAMS, createRazorpayOrder, verifyRazorpayPayment } from "@/lib/payments.functions";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export const Route = createFileRoute("/buy")({
  staticData: { sitemap: false },
  validateSearch: (
    search: Record<string, unknown>,
  ): { program?: string | undefined; persons?: number | undefined } => ({
    program: typeof search["program"] === "string" ? (search["program"] as string) : undefined,
    persons:
      typeof search["persons"] === "number" || typeof search["persons"] === "string"
        ? Math.min(20, Math.max(1, Number(search["persons"]) || 1))
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Buy a Program | THE KRIYA LAB" },
      {
        name: "description",
        content:
          "Purchase a Kriya Yoga initiation program online — secure card and Razorpay payment options.",
      },
      { property: "og:title", content: "Buy a Program — THE KRIYA LAB" },
      { property: "og:description", content: "Purchase a Kriya Yoga initiation program online." },
    ],
  }),
  component: BuyPage,
});

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type PaymentMethodId = "credit-card" | "debit-card" | "upi" | "netbanking";

const PAYMENT_METHODS: { id: PaymentMethodId; label: ReturnType<typeof bi>; hint: ReturnType<typeof bi> }[] = [
  {
    id: "credit-card",
    label: bi("Credit card", "கிரெடிட் கார்டு"),
    hint: bi("Visa, Mastercard, Amex — secure card checkout.", "விசா, மாஸ்டர்கார்டு, அமெக்ஸ் — பாதுகாப்பான கார்டு கட்டணம்."),
  },
  {
    id: "debit-card",
    label: bi("Debit card", "டெபிட் கார்டு"),
    hint: bi("All major Indian and international debit cards.", "அனைத்து முக்கிய இந்திய மற்றும் சர்வதேச டெபிட் கார்டுகள்."),
  },
  {
    id: "upi",
    label: bi("UPI", "UPI"),
    hint: bi("GPay, PhonePe, Paytm, BHIM and any UPI app.", "GPay, PhonePe, Paytm, BHIM உள்ளிட்ட எந்த UPI செயலியும்."),
  },
  {
    id: "netbanking",
    label: bi("Net banking", "இணைய வங்கி"),
    hint: bi("Pay directly from your bank account.", "உங்கள் வங்கிக் கணக்கிலிருந்து நேரடியாகச் செலுத்துங்கள்."),
  },
];

type Participant = { name: string; age: string; language: string };
const emptyParticipant = (): Participant => ({ name: "", age: "", language: "English" });

export function BuyPage() {
  const { program: preselected, persons: prePersons } = Route.useSearch();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  // Program selection
  const [programSlug, setProgramSlug] = useState(
    programs.some((p) => p.slug === preselected) ? (preselected as string) : programs[0]!.slug,
  );
  const [format, setFormat] = useState<string>("Online");
  const [prefLang, setPrefLang] = useState<string>(lang === "ta" ? "தமிழ்" : "English");
  const [session, setSession] = useState<ProgramDate | null>(null);

  // Student Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Multi-person / Family
  const program = programs.find((p) => p.slug === programSlug) ?? programs[0]!;
  const maxPersons = program.maxParticipants ?? 1;
  const isFamily = programSlug === "family-initiation";
  const [persons, setPersons] = useState(Math.min(prePersons ?? 1, 20));
  const count = Math.min(persons, maxPersons);
  const [participants, setParticipants] = useState<Participant[]>(() =>
    Array.from({ length: 20 }, emptyParticipant),
  );

  // Checkout states
  const [accountNote, setAccountNote] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stripeOpen, setStripeOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethodId>("upi");

  // Auth state detection
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        const u = data.session.user;
        setCurrentUser(u);
        if (u.email) setEmail(u.email);
        const meta = (u.user_metadata || {}) as Record<string, unknown>;
        const fullName = (meta["full_name"] || meta["name"] || "") as string;
        if (fullName) setName(fullName);
      }
    });
  }, []);

  // Sync family language
  useEffect(() => {
    if (isFamily) {
      setParticipants((prev) => prev.map((p) => ({ ...p, language: prefLang })));
    }
  }, [isFamily, prefLang]);

  const setParticipant = (i: number, patch: Partial<Participant>) =>
    setParticipants((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const unitPrice = program.unitPriceInr ?? 0;
  const totalPrice = unitPrice * count;

  const ready = agreed;

  /** Account check — users register via /auth */
  const ensureAccount = async (): Promise<boolean> => {
    return true;
  };

  /** Saves lead / enrollment enquiry into Supabase */
  const recordEnrollmentData = async (paymentRef?: string) => {
    try {
      await supabase.from("enquiries").insert({
        name: name.trim() || currentUser?.user_metadata?.full_name || "Seeker",
        email: email.trim() || currentUser?.email || "student@thekriyalab.com",
        phone: phone.trim() || null,
        kind: "enrollment",
        programme: program.slug,
        session_date: session?.session_date ?? null,
        program_date_id: session?.id ?? null,
        language: lang,
        message: [
          message.trim(),
          country ? `Country: ${country}` : "",
          age ? `Age: ${age}` : "",
          `Format: ${format}`,
          session ? `Chosen date: ${session.session_date}${session.start_time ? " " + session.start_time : ""}` : "",
          `Preferred language: ${prefLang}`,
          maxPersons > 1 ? `Persons: ${count}` : "",
          paymentRef ? `Payment Ref: ${paymentRef}` : "",
          maxPersons > 1 && count > 1
            ? participants
                .slice(1, count)
                .map((p, i) => `Person ${i + 2}: ${p.name}${p.age ? `, age ${p.age}` : ""}`)
                .join("\n")
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
        source_page: "/buy",
      });
    } catch (e) {
      console.error("Enquiry save error:", e);
    }
  };

  const startCardPayment = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (!(await ensureAccount())) return;
      await recordEnrollmentData();
      setStripeOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const startRazorpay = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (!(await ensureAccount())) return;
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Could not load Razorpay. Please try card payment.");
        return;
      }
      const order = await createRazorpayOrder({
        data: { programSlug, customerName: name, customerEmail: email },
      });
      if ("error" in order) {
        setError(order.error);
        return;
      }
      const rzp = new window.Razorpay!({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "THE KRIYA LAB",
        description: t(program.name),
        order_id: order.orderId,
        prefill: {
          name,
          email,
          contact: phone,
          method: method === "netbanking" ? "netbanking" : method === "upi" ? "upi" : "card",
        },
        theme: { color: "#4a2d6b" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const result = await verifyRazorpayPayment({
            data: {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              programSlug,
              customerName: name,
              customerEmail: email,
              customerPhone: phone,
            },
          });
          if (result.ok) {
            await recordEnrollmentData(response.razorpay_payment_id);
            navigate({ to: "/thank-you" });
          } else {
            setError(result.error ?? "Payment verification failed");
          }
        },
      });
      rzp.open();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* 🌟 Unified Hero Header (Exact user requirements) 🌟 */}
      <PageHero
        eyebrow={t(bi("Enrol Online", "ஆன்லைன் பதிவு"))}
        title={t(bi("Buy a Program", "நிகழ்ச்சியை வாங்குங்கள்"))}
        intro={t(
          bi(
            "Choose a program, review the terms, and complete your payment securely online.",
            "நிகழ்ச்சியைத் தேர்ந்தெடுத்து, விதிமுறைகளைப் படித்து, பாதுகாப்பாக ஆன்லைனில் கட்டணம் செலுத்துங்கள்.",
          ),
        )}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left Form: Unified Details */}
          <div className="space-y-8">
            {/* Step 1: Program & Session Selection */}
            <div className="space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-serif text-2xl text-foreground">
                1. {t(bi("Choose Program & Format", "நிகழ்ச்சி மற்றும் வடிவத்தைத் தேர்வு செய்க"))}
              </h2>

              <div className="space-y-4">
                <Field label={t(ui.program)} htmlFor="program-select">
                  <select
                    id="program-select"
                    value={programSlug}
                    onChange={(e) => {
                      setProgramSlug(e.target.value);
                      setSession(null);
                      setStripeOpen(false);
                    }}
                    className={inputClass}
                  >
                    {programs.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {t(p.name)} {p.unitPriceInr ? `— ₹${p.unitPriceInr.toLocaleString("en-IN")}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t(ui.format)} htmlFor="format-select">
                    <select
                      id="format-select"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className={inputClass}
                    >
                      <option>{t(bi("Online", "ஆன்லைன்"))}</option>
                      <option>{t(bi("In person", "நேரில்"))}</option>
                    </select>
                  </Field>

                  <Field label={t(ui.language)} htmlFor="lang-select">
                    <select
                      id="lang-select"
                      value={prefLang}
                      onChange={(e) => setPrefLang(e.target.value)}
                      className={inputClass}
                    >
                      <option>English</option>
                      <option>தமிழ்</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* Multi-person count for family initiation */}
              {maxPersons > 1 && (
                <div className="pt-4 border-t border-border/60">
                  <Field
                    label={t(bi("Number of persons to be initiated", "தீட்சை பெறும் நபர்களின் எண்ணிக்கை"))}
                    htmlFor="persons-select"
                  >
                    <select
                      id="persons-select"
                      value={count}
                      onChange={(e) => setPersons(Number(e.target.value))}
                      className={inputClass}
                    >
                      {Array.from({ length: maxPersons }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n > 1 ? t(bi("persons", "நபர்கள்")) : t(bi("person", "நபர்"))}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {count > 1 && (
                    <div className="mt-4 space-y-4">
                      {Array.from({ length: count - 1 }, (_, i) => i + 1).map((i) => (
                        <div key={i} className="rounded-lg border border-border p-4 bg-background">
                          <p className="text-xs font-serif uppercase tracking-widest text-gold mb-3">
                            {t(bi(`Person ${i + 1} Details`, `${i + 1}-ஆம் நபரின் விவரங்கள்`))}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              placeholder={t(ui.name)}
                              className={inputClass}
                              value={participants[i]!.name}
                              onChange={(e) => setParticipant(i, { name: e.target.value })}
                            />
                            <input
                              placeholder={t(ui.age)}
                              type="number"
                              min={1}
                              className={inputClass}
                              value={participants[i]!.age}
                              onChange={(e) => setParticipant(i, { age: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Live Program Calendar for batch dates */}
              <div className="pt-4 border-t border-border/60">
                <ProgramCalendar
                  programSlug={programSlug}
                  value={session?.session_date ?? null}
                  onSelect={(d) => setSession(d)}
                />
              </div>
            </div>

            {/* Step 2: Student Details & Contact */}
            <div className="space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-serif text-2xl text-foreground">
                  2. {t(bi("Student Details & Contact", "மாணவர் விவரங்கள் & தொடர்பு"))}
                </h2>
                {currentUser ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    ✓ {t(bi("Signed in as:", "உள்நுழைந்துள்ளீர்:"))} {currentUser.email}
                  </span>
                ) : (
                  <Link
                    to="/auth"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {t(bi("Already have an account? Sign In", "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைய"))} →
                  </Link>
                )}
              </div>

              {/* If signed in, show clean profile card */}
              {currentUser && (
                <div className="rounded-lg bg-secondary/40 border border-border p-4 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-foreground">{name || currentUser.email}</span>
                    <span className="ml-2">({currentUser.email})</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {t(bi("Profile linked to order", "கணக்கு விவரங்கள் இணைக்கப்பட்டது"))}
                  </span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={t(ui.phone)} htmlFor="phone-input">
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+91 98765 43210"
                  />
                </Field>

                <Field label={t(ui.country)} htmlFor="country-input">
                  <input
                    id="country-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. India"
                  />
                </Field>

                <Field label={t(ui.age)} htmlFor="age-input">
                  <input
                    id="age-input"
                    type="number"
                    min={1}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 28"
                  />
                </Field>
              </div>

              <Field label={t(ui.message)} htmlFor="message-input">
                <textarea
                  id="message-input"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputClass}
                  placeholder={t(bi("Any prior yoga experience or questions? (optional)", "முந்தைய யோக அனுபவம் அல்லது கேள்விகள்? (விருப்பத்திற்குரியது)"))}
                />
              </Field>
            </div>

            {/* Step 3: Payment Method Selector */}
            <div className="space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-serif text-2xl text-foreground">
                3. {t(bi("Select Payment Method", "கட்டண முறையைத் தேர்வு செய்க"))}
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((pm) => {
                  const selected = method === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setMethod(pm.id);
                        setStripeOpen(false);
                      }}
                      className={cn(
                        "flex flex-col items-start rounded-lg border p-4 text-left transition-all",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                          : "border-border bg-background hover:border-primary/40",
                      )}
                    >
                      <span className="font-serif text-sm font-semibold text-foreground">
                        {t(pm.label)}
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">{t(pm.hint)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Terms & Conditions Agreement */}
              <div className="pt-4 border-t border-border/60">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {t(
                      bi(
                        "I have read and agree to the Terms & Conditions and Medical Disclaimer.",
                        "விதிமுறைகள், நிபந்தனைகள் மற்றும் மருத்துவ மறுப்பை நான் படித்து ஒப்புக்கொள்கிறேன்.",
                      ),
                    )}{" "}
                    <Link to="/terms" target="_blank" className="text-primary underline">
                      {t(bi("Read Terms", "விதிமுறைகள்"))}
                    </Link>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary & Payment Button */}
          <div className="lg:sticky lg:top-28 h-fit space-y-6">
            <div className="rounded-xl border border-gold/30 bg-velvet-deep text-white p-6 sm:p-8 shadow-xl">
              <span className="eyebrow text-gold text-xs tracking-widest uppercase">
                {t(bi("Order Summary", "முன்பதிவு விவரம்"))}
              </span>

              <h3 className="mt-3 font-serif text-xl text-white">{t(program.name)}</h3>

              <div className="mt-5 space-y-3 text-xs text-[oklch(0.85_0.02_300)] border-y border-white/10 py-4">
                <div className="flex justify-between">
                  <span>{t(bi("Format", "வடிவம்"))}:</span>
                  <span className="font-medium text-white">{format}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t(bi("Language", "மொழி"))}:</span>
                  <span className="font-medium text-white">{prefLang}</span>
                </div>
                {session && (
                  <div className="flex justify-between">
                    <span>{t(bi("Session Date", "அமர்வு தேதி"))}:</span>
                    <span className="font-medium text-gold">{session.session_date}</span>
                  </div>
                )}
                {count > 1 && (
                  <div className="flex justify-between">
                    <span>{t(bi("Participants", "நபர்கள்"))}:</span>
                    <span className="font-medium text-white">{count}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-baseline justify-between">
                <span className="text-sm font-light text-[oklch(0.85_0.02_300)]">
                  {t(bi("Total Amount", "மொத்தக் கட்டணம்"))}:
                </span>
                <span className="font-serif text-3xl font-semibold text-gold">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {error && (
                <div className="mt-4 rounded-md bg-destructive/20 p-3 text-xs text-destructive-foreground border border-destructive/40">
                  {error}
                </div>
              )}

              {accountNote && (
                <div className="mt-4 rounded-md bg-emerald-500/20 p-3 text-xs text-emerald-200 border border-emerald-500/40">
                  {accountNote}
                </div>
              )}

              {/* Checkout Action Button — Bright Vibrant Gold */}
              <div className="mt-6">
                {method === "credit-card" || method === "debit-card" ? (
                  <button
                    type="button"
                    disabled={!ready || busy}
                    onClick={startCardPayment}
                    className="w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-amber-400 py-4 text-center text-sm font-bold text-velvet-deep transition-all duration-200 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                  >
                    {busy
                      ? t(bi("Processing...", "செயல்படுகிறது..."))
                      : t(bi(`Pay ₹${totalPrice.toLocaleString("en-IN")} with Card`, `₹${totalPrice.toLocaleString("en-IN")} கார்டு மூலம் செலுத்துங்கள்`))}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!ready || busy}
                    onClick={startRazorpay}
                    className="w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-amber-400 py-4 text-center text-sm font-bold text-velvet-deep transition-all duration-200 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                  >
                    {busy
                      ? t(bi("Processing...", "செயல்படுகிறது..."))
                      : t(bi(`Pay ₹${totalPrice.toLocaleString("en-IN")} via ${method === "upi" ? "UPI / GPay" : "Net Banking"}`, `₹${totalPrice.toLocaleString("en-IN")} ${method === "upi" ? "UPI / GPay" : "Net Banking"} மூலம் செலுத்துங்கள்`))}
                  </button>
                )}
              </div>

              <p className="mt-4 text-center text-[0.7rem] text-[oklch(0.75_0.02_300)]">
                🔒 {t(bi("256-bit Encrypted Secure Checkout", "256-பிட் பாதுகாப்பான பணப்பரிமாற்றம்"))}
              </p>
            </div>

            {/* Embedded Stripe Checkout Modal if Card chosen */}
            {stripeOpen && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h4 className="font-serif text-lg text-foreground">
                    {t(bi("Card Payment", "கார்டு கட்டணம்"))}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setStripeOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕ {t(bi("Close", "மூடு"))}
                  </button>
                </div>
                <div className="pt-4">
                  <StripeEmbeddedCheckout
                    programSlug={programSlug}
                    customerEmail={email}
                    customerName={name}
                    returnUrl={`${window.location.origin}/thank-you`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
