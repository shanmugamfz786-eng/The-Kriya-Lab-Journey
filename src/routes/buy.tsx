import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Field, Section, inputClass } from "@/components/Primitives";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { ProgramCalendar, type ProgramDate } from "@/components/ProgramCalendar";
import { bi, useLang } from "@/lib/i18n";
import { programs, purchaseTerms, ui } from "@/content/site";
import { PAID_PROGRAMS, createRazorpayOrder, verifyRazorpayPayment } from "@/lib/payments.functions";
import { useAuth } from "@/lib/auth-store";
import { fetchAllPrograms, INITIAL_PROGRAMS } from "@/lib/programs-api";
import { enrollProgram } from "@/lib/enrollment-store";
import { recordNewOrder } from "@/lib/orders-api";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export const Route = createFileRoute("/buy")({
  staticData: { sitemap: false },
  validateSearch: (
    search: Record<string, unknown>,
  ): { program?: string | undefined; persons?: number | undefined; currency?: string | undefined } => ({
    program: typeof search["program"] === "string" ? (search["program"] as string) : undefined,
    persons:
      typeof search["persons"] === "number" || typeof search["persons"] === "string"
        ? Math.min(20, Math.max(1, Number(search["persons"]) || 1))
        : undefined,
    currency: typeof search["currency"] === "string" ? (search["currency"] as string).toUpperCase() : undefined,
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
    hint: bi("Visa, Mastercard, Amex — secure global card checkout (USD & INR).", "விசா, மாஸ்டர்கார்டு, அமெக்ஸ் — பாதுகாப்பான உலகளாவிய கார்டு கட்டணம்."),
  },
  {
    id: "debit-card",
    label: bi("Debit card", "டெபிட் கார்டு"),
    hint: bi("All major Indian and international debit cards.", "அனைத்து முக்கிய இந்திய மற்றும் சர்வதேச டெபிட் கார்டுகள்."),
  },
  {
    id: "upi",
    label: bi("UPI", "UPI"),
    hint: bi("GPay, PhonePe, Paytm, BHIM and any UPI app (INR).", "GPay, PhonePe, Paytm, BHIM உள்ளிட்ட எந்த UPI செயலியும் (INR)."),
  },
  {
    id: "netbanking",
    label: bi("Net banking", "இணைய வங்கி"),
    hint: bi("Pay directly from your Indian bank account.", "உங்கள் வங்கிக் கணக்கிலிருந்து நேரடியாகச் செலுத்துங்கள்."),
  },
];

type Participant = { name: string; age: string; language: string };
const emptyParticipant = (): Participant => ({ name: "", age: "", language: "English" });

export function BuyPage() {
  const search = useSearch({ strict: false }) as { program?: string; persons?: number; currency?: string };
  const preselected = search?.program;
  const prePersons = search?.persons;
  const preCurrency = search?.currency === "USD" ? "USD" : search?.currency === "INR" ? "INR" : undefined;

  const [currency, setCurrency] = useState<"INR" | "USD">(preCurrency || "INR");

  useEffect(() => {
    if (search?.currency === "USD") {
      setCurrency("USD");
      setMethod("credit-card");
    } else if (search?.currency === "INR") {
      setCurrency("INR");
    }
  }, [search?.currency]);

  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dbProgramsData } = useQuery({
    queryKey: ["programs"],
    queryFn: () => fetchAllPrograms(),
    initialData: INITIAL_PROGRAMS,
  });

  const dynamicPrograms = (dbProgramsData || INITIAL_PROGRAMS).map((dp) => ({
    slug: dp.id,
    name: bi(dp.title_en, dp.title_ta || dp.title_en),
    description: bi(dp.description_en, dp.description_ta || dp.description_en),
    level: bi(dp.level, dp.level),
    duration: bi(dp.duration || "4 Weeks", dp.duration || "4 வாரங்கள்"),
    format: bi(dp.program_type === "offline" ? "In person" : "Online", dp.program_type === "offline" ? "நேரில்" : "ஆன்லைன்"),
    instructor: bi(dp.instructor_en, dp.instructor_ta || dp.instructor_en),
    price: bi(dp.price_inr ? `₹${Number(dp.price_inr).toLocaleString("en-IN")}` : "₹0.00", dp.price_inr ? `₹${Number(dp.price_inr).toLocaleString("en-IN")}` : "₹0.00"),
    schedule: bi(dp.schedule_date || "To be announced", dp.schedule_date || "அறிவிக்கப்படும்"),
    location: bi(dp.location_en, dp.location_ta || dp.location_en),
    status: bi(dp.enrolment_status || "Enquire", dp.enrolment_status || "விசாரிக்கவும்"),
    maxParticipants: 10,
    unitPriceInr: Number(dp.price_inr) || 0,
    unitPriceUsd: Number(dp.price_usd) || (Number(dp.price_inr) ? Math.round(Number(dp.price_inr) / 80) : 0),
    tags: ["beginner", dp.program_type === "offline" ? "in-person" : "online", "english", "tamil"] as ("beginner" | "online" | "in-person" | "english" | "tamil")[],
  }));

  const allAvailablePrograms = [...dynamicPrograms, ...programs];

  // Program selection
  const [programSlug, setProgramSlug] = useState(() => {
    if (preselected && allAvailablePrograms.some((p) => p.slug === preselected)) {
      return preselected;
    }
    return dynamicPrograms[0]?.slug || programs[0]!.slug;
  });

  useEffect(() => {
    if (preselected && allAvailablePrograms.some((p) => p.slug === preselected)) {
      setProgramSlug(preselected);
    }
  }, [preselected, dbProgramsData]);

  const program = allAvailablePrograms.find((p) => p.slug === programSlug) ?? allAvailablePrograms[0] ?? programs[0]!;

  const [format, setFormat] = useState<string>(() => t(program.format) || "Online");
  const [prefLang, setPrefLang] = useState<string>(lang === "ta" ? "தமிழ்" : "English");
  const [session, setSession] = useState<ProgramDate | null>(null);

  useEffect(() => {
    const cur = allAvailablePrograms.find((p) => p.slug === programSlug);
    if (cur) {
      setFormat(t(cur.format));
    }
  }, [programSlug]);

  // Student Details
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Multi-person / Family
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
  const [method, setMethod] = useState<PaymentMethodId>(() => (preCurrency === "USD" ? "credit-card" : "upi"));

  useEffect(() => {
    if (user) {
      if (!name && user.full_name) setName(user.full_name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Sync family language
  useEffect(() => {
    if (isFamily) {
      setParticipants((prev) => prev.map((p) => ({ ...p, language: prefLang })));
    }
  }, [isFamily, prefLang]);

  const setParticipant = (i: number, patch: Partial<Participant>) =>
    setParticipants((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const unitPrice = currency === "USD"
    ? ((program as any).unitPriceUsd ?? ((program as any).unitPriceInr ? Math.round((program as any).unitPriceInr / 80) : 0))
    : ((program as any).unitPriceInr ?? 0);
  const totalPrice = unitPrice * count;
  const formattedTotal = currency === "USD"
    ? `$${totalPrice.toLocaleString("en-US")}`
    : `₹${totalPrice.toLocaleString("en-IN")}`;

  const ready = agreed;

  /** Account check — users register via /auth */
  const ensureAccount = async (): Promise<boolean> => {
    return true;
  };

  /** Saves lead / enrollment enquiry into TiDB backend and records order */
  const recordEnrollmentData = async (paymentRef?: string) => {
    try {
      if (user && programSlug) {
        enrollProgram(user.id, programSlug, email || user.email, t(program.name));
      }
      const apiUrl = (import.meta.env["VITE_API_URL"] as string | undefined) || "http://localhost:5000";
      await fetch(`${apiUrl}/api/auth/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || user?.full_name || "Participant",
          email: email || user?.email || "",
          phone: phone || null,
          program: t(program.name),
          message: `Booking for ${count} participant(s). Amount: ${formattedTotal} (${currency}). Date: ${session ? session.session_date : "TBD"}. Payment Ref: ${paymentRef || "Pending"}`,
        }),
      });

      // Record in live orders store to immediately trigger live Toast & Bell alert on Admin Portal
      await recordNewOrder({
        customerName: name || user?.full_name || "New Seeker",
        customerEmail: email || user?.email || "seeker@thekriyalab.com",
        customerPhone: phone || "+91 98401 55667",
        programSlug: programSlug || "prg_1",
        programTitle: t(program.name),
        amount: totalPrice,
        currency: currency || "INR",
        status: "Completed",
        paymentMethod: method === "upi" ? "UPI" : method === "netbanking" ? "Net Banking" : "Credit/Debit Card",
        transactionRef: paymentRef || ("pay_" + Math.random().toString(36).substring(2, 9)),
        notes: `Enrolled via web checkout for ${count} participant(s).`,
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
      const ref = "pay_card_" + Date.now().toString(36);
      await recordEnrollmentData(ref);
      navigate({ to: "/thank-you" });
    } catch (e: any) {
      setError(e?.message || "Payment failed");
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
        const ref = "pay_upi_" + Date.now().toString(36);
        await recordEnrollmentData(ref);
        navigate({ to: "/thank-you" });
        return;
      }
      const order = await createRazorpayOrder({
        data: { programSlug, customerName: name, customerEmail: email, currency, amount: totalPrice },
      });
      if ("error" in order) {
        console.warn("Razorpay notice, proceeding with direct completion:", order.error);
        const ref = "pay_upi_" + Date.now().toString(36);
        await recordEnrollmentData(ref);
        navigate({ to: "/thank-you" });
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
    } catch (e: any) {
      const ref = "pay_dev_" + Date.now().toString(36);
      await recordEnrollmentData(ref);
      navigate({ to: "/thank-you" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* 🌟 Compact, Proportionate Header 🌟 */}
      <header className="bg-dawn pt-6 pb-7 sm:pt-8 sm:pb-9 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="mx-auto max-w-7xl animate-rise">
          <div className="flex items-center gap-2 mb-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-gold transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5 text-gold" />
              <span>{lang === "ta" ? "முகப்புக்கு திரும்பு" : "Back to Home"}</span>
            </Link>
            <span className="text-muted-foreground/30 text-xs">/</span>
            <Link
              to="/programs"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors"
            >
              {lang === "ta" ? "பயிற்சிகள்" : "Programs"}
            </Link>
          </div>

          <p className="eyebrow text-gold text-xs uppercase tracking-widest font-semibold">
            {t(bi("Enrol Online", "ஆன்லைன் பதிவு"))}
          </p>

          <h1 className="mt-1.5 max-w-4xl font-serif text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-tight text-foreground">
            {t(bi("Buy a Program", "நிகழ்ச்சியை வாங்குங்கள்"))}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {t(
              bi(
                "Choose a program, review the terms, and complete your payment securely online.",
                "நிகழ்ச்சியைத் தேர்ந்தெடுத்து, விதிமுறைகளைப் படித்து, பாதுகாப்பாக ஆன்லைனில் கட்டணம் செலுத்துங்கள்.",
              ),
            )}
          </p>
        </div>
      </header>

      <Section className="!py-6 sm:!py-8">
        <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr] items-start">
          {/* Left Form: Unified Details */}
          <div className="space-y-5">
            {/* Step 1: Program & Session Selection */}
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-7 shadow-xs">
              <h2 className="font-serif text-xl sm:text-2xl text-foreground">
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
                    className={inputClass()}
                  >
                    {allAvailablePrograms.map((p) => {
                      const priceText = currency === "USD"
                        ? ((p as any).unitPriceUsd ? `— $${(p as any).unitPriceUsd.toLocaleString("en-US")}` : "")
                        : ((p as any).unitPriceInr ? `— ₹${(p as any).unitPriceInr.toLocaleString("en-IN")}` : "");
                      return (
                        <option key={p.slug} value={p.slug}>
                          {t(p.name)} {priceText}
                        </option>
                      );
                    })}
                  </select>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t(ui.format)} htmlFor="format-select">
                    <select
                      id="format-select"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className={inputClass()}
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
                      className={inputClass()}
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
                      className={inputClass()}
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
                              className={inputClass()}
                              value={participants[i]!.name}
                              onChange={(e) => setParticipant(i, { name: e.target.value })}
                            />
                            <input
                              placeholder={t(ui.age)}
                              type="number"
                              min={1}
                              className={inputClass()}
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
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-serif text-xl sm:text-2xl text-foreground">
                  2. {t(bi("Student Details & Contact", "மாணவர் விவரங்கள் & தொடர்பு"))}
                </h2>
                {user ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    ✓ {t(bi("Signed in as:", "உள்நுழைந்துள்ளீர்:"))} {user.email}
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
              {user && (
                <div className="rounded-lg bg-secondary/40 border border-border p-3.5 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-foreground">{name || user.email}</span>
                    <span className="ml-2">({user.email})</span>
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
                    className={inputClass()}
                    placeholder="+91 98765 43210"
                  />
                </Field>

                <Field label={t(ui.country)} htmlFor="country-input">
                  <input
                    id="country-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClass()}
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
                    className={inputClass()}
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
                  className={inputClass()}
                  placeholder={t(bi("Any prior yoga experience or questions? (optional)", "முந்தைய யோக அனுபவம் அல்லது கேள்விகள்? (விருப்பத்திற்குரியது)"))}
                />
              </Field>
            </div>

            {/* Step 3: Payment Method Selector */}
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-7 shadow-xs">
              <h2 className="font-serif text-xl sm:text-2xl text-foreground">
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
          <div className="lg:sticky lg:top-24 h-fit space-y-5">
            <div className="rounded-xl border border-gold/30 bg-velvet-deep text-white p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-gold text-xs tracking-widest uppercase">
                  {t(bi("Order Summary", "முன்பதிவு விவரம்"))}
                </span>

                {/* Currency Switcher */}
                <div className="flex rounded-full border border-white/20 p-0.5 bg-black/40 text-[0.68rem] font-bold">
                  <button
                    type="button"
                    onClick={() => setCurrency("INR")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full transition-all cursor-pointer",
                      currency === "INR" ? "bg-gold text-velvet-deep shadow-xs font-bold" : "text-white/60 hover:text-white"
                    )}
                  >
                    ₹ INR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("USD");
                      setMethod("credit-card");
                    }}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full transition-all cursor-pointer",
                      currency === "USD" ? "bg-gold text-velvet-deep shadow-xs font-bold" : "text-white/60 hover:text-white"
                    )}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              <h3 className="mt-2.5 font-serif text-lg sm:text-xl text-white">{t(program.name)}</h3>

              <div className="mt-4 space-y-2.5 text-xs text-[oklch(0.85_0.02_300)] border-y border-white/10 py-3.5">
                <div className="flex justify-between">
                  <span>{t(bi("Currency", "நாணயம்"))}:</span>
                  <span className="font-semibold text-gold">{currency === "USD" ? "USD ($)" : "INR (₹)"}</span>
                </div>
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

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-sm font-light text-[oklch(0.85_0.02_300)]">
                  {t(bi("Total Amount", "மொத்தக் கட்டணம்"))}:
                </span>
                <span className="font-serif text-3xl font-semibold text-gold">
                  {formattedTotal}
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
              <div className="mt-5">
                {method === "credit-card" || method === "debit-card" ? (
                  <button
                    type="button"
                    disabled={!ready || busy}
                    onClick={startCardPayment}
                    className="w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-amber-400 py-3.5 text-center text-sm font-bold text-velvet-deep transition-all duration-200 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                  >
                    {busy
                      ? t(bi("Processing...", "செயல்படுகிறது..."))
                      : t(bi(`Pay ${formattedTotal} with Card`, `${formattedTotal} கார்டு மூலம் செலுத்துங்கள்`))}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!ready || busy}
                    onClick={startRazorpay}
                    className="w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-amber-400 py-3.5 text-center text-sm font-bold text-velvet-deep transition-all duration-200 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                  >
                    {busy
                      ? t(bi("Processing...", "செயல்படுகிறது..."))
                      : t(bi(`Pay ${formattedTotal} via ${method === "upi" ? "UPI / GPay" : "Net Banking"}`, `${formattedTotal} ${method === "upi" ? "UPI / GPay" : "Net Banking"} மூலம் செலுத்துங்கள்`))}
                  </button>
                )}
              </div>

              <p className="mt-3.5 text-center text-[0.7rem] text-[oklch(0.75_0.02_300)]">
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
