import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth, getStoredUser } from "@/lib/auth-store";

export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  flag: string;
  timezone: string;
  locale: string;
}

export const SUPPORTED_COUNTRIES: Record<string, CountryInfo> = {
  IN: {
    code: "IN",
    name: "India",
    currency: "INR",
    symbol: "₹",
    flag: "🇮🇳",
    timezone: "Asia/Kolkata",
    locale: "en-IN",
  },
  US: {
    code: "US",
    name: "United States",
    currency: "USD",
    symbol: "$",
    flag: "🇺🇸",
    timezone: "America/New_York",
    locale: "en-US",
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    flag: "🇬🇧",
    timezone: "Europe/London",
    locale: "en-GB",
  },
  DE: {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    symbol: "€",
    flag: "🇩🇪",
    timezone: "Europe/Berlin",
    locale: "de-DE",
  },
  FR: {
    code: "FR",
    name: "France",
    currency: "EUR",
    symbol: "€",
    flag: "🇫🇷",
    timezone: "Europe/Paris",
    locale: "fr-FR",
  },
  CA: {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    symbol: "C$",
    flag: "🇨🇦",
    timezone: "America/Toronto",
    locale: "en-CA",
  },
  AU: {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    symbol: "A$",
    flag: "🇦🇺",
    timezone: "Australia/Sydney",
    locale: "en-AU",
  },
  SG: {
    code: "SG",
    name: "Singapore",
    currency: "SGD",
    symbol: "S$",
    flag: "🇸🇬",
    timezone: "Asia/Singapore",
    locale: "en-SG",
  },
  MY: {
    code: "MY",
    name: "Malaysia",
    currency: "MYR",
    symbol: "RM",
    flag: "🇲🇾",
    timezone: "Asia/Kuala_Lumpur",
    locale: "en-MY",
  },
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    symbol: "AED",
    flag: "🇦🇪",
    timezone: "Asia/Dubai",
    locale: "en-AE",
  },
  LK: {
    code: "LK",
    name: "Sri Lanka",
    currency: "LKR",
    symbol: "Rs",
    flag: "🇱🇰",
    timezone: "Asia/Colombo",
    locale: "en-LK",
  },
};

// Base INR Exchange rates (1 INR = X units)
const EXCHANGE_RATES: Record<string, number> = {
  INR: 1,
  USD: 1 / 84, // ~0.0119
  GBP: 1 / 106, // ~0.0094
  EUR: 1 / 91, // ~0.0109
  CAD: 1 / 62, // ~0.0161
  AUD: 1 / 55, // ~0.0181
  SGD: 1 / 63, // ~0.0158
  MYR: 1 / 19, // ~0.0526
  AED: 1 / 22.8, // ~0.0438
  LKR: 3.5, // 1 INR ~ 3.5 LKR
};

export interface ShippingEstimate {
  fee: number;
  feeFormatted: string;
  daysText: string;
  courierName: string;
  isDomestic: boolean;
}

interface GeoContextType {
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  timezone: string;
  isIndia: boolean;
  isLocked: boolean;
  isVerified: boolean;
  isLoading: boolean;
  setCountry: (code: string) => void;
  setCurrency: (curr: string) => void;
  convertPrice: (amountInr: number, targetCurrency?: string) => number;
  formatPrice: (amountInr: number, targetCurrency?: string) => string;
  getShippingEstimate: (isDigital?: boolean) => ShippingEstimate;
  formatScheduleTime: (
    eventDate?: string,
    startTime?: string,
    endTime?: string
  ) => {
    sourceTime: string;
    localTime: string | null;
    isDifferent: boolean;
    timezoneLabel: string;
  };
}

const GeoContext = createContext<GeoContextType | null>(null);

const STORAGE_KEY = "kriya_geo_country";
const CURRENCY_STORAGE_KEY = "kriya_geo_currency";

export function GeoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [countryCode, setCountryCodeState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = getStoredUser();
        if (storedUser?.country) {
          const clean = (storedUser.country.split(" ")[0] || "").trim().toUpperCase().slice(0, 2);
          if (SUPPORTED_COUNTRIES[clean]) return clean;
        }
        // Unauthenticated guests should not retain stale verified state
        localStorage.removeItem("kriya_geo_verified");
      } catch {}
    }
    return "IN";
  });
  const [currencyOverride, setCurrencyOverride] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedCurr = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (cachedCurr) return cachedCurr;
      } catch {}
    }
    return null;
  });
  const [timezone, setTimezone] = useState<string>("Asia/Kolkata");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = getStoredUser();
        if (stored?.country) return true;
        return false;
      } catch {}
    }
    return false;
  });

  // 1. Detect browser timezone reliably
  useEffect(() => {
    try {
      const resolvedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (resolvedTz) {
        setTimezone(resolvedTz);
      }
    } catch {
      setTimezone("Asia/Kolkata");
    }
  }, []);

  // Listen to custom geo update events (e.g. from registration / login)
  useEffect(() => {
    const handleGeoChange = (e: any) => {
      const newCode = e?.detail?.country;
      if (newCode && SUPPORTED_COUNTRIES[newCode]) {
        setCountryCodeState(newCode);
        setCurrencyOverride(SUPPORTED_COUNTRIES[newCode]!.currency);
      }
      if (typeof e?.detail?.verified === "boolean") {
        setIsVerified(e.detail.verified);
      }
    };
    const handleAuthChange = () => {
      const stored = getStoredUser();
      if (stored?.country) {
        const clean = (stored.country.split(" ")[0] || "").trim().toUpperCase().slice(0, 2);
        if (clean && SUPPORTED_COUNTRIES[clean]) {
          setCountryCodeState(clean);
          setCurrencyOverride(SUPPORTED_COUNTRIES[clean]!.currency);
          setIsVerified(true);
        }
      } else {
        const isVer = localStorage.getItem("kriya_geo_verified") === "true";
        setIsVerified(isVer);
      }
    };
    window.addEventListener("kriya_geo_changed", handleGeoChange);
    window.addEventListener("kriya_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("kriya_geo_changed", handleGeoChange);
      window.removeEventListener("kriya_auth_changed", handleAuthChange);
    };
  }, []);

  // 2. Resolve country: Priority: user verified profile > saved preference in localStorage > IP detection > IN fallback
  const effectiveUser = user || (typeof window !== "undefined" ? getStoredUser() : null);

  useEffect(() => {
    let isCancelled = false;

    async function resolveCountry() {
      // Priority 1: User is logged in and has a verified country (Cannot be overridden)
      const currentU = user || (typeof window !== "undefined" ? getStoredUser() : null);
      if (currentU?.country) {
        const clean = (currentU.country.split(" ")[0] || "").trim().toUpperCase().slice(0, 2);
        if (clean && SUPPORTED_COUNTRIES[clean]) {
          setCountryCodeState(clean);
          setCurrencyOverride(SUPPORTED_COUNTRIES[clean]!.currency);
          setIsVerified(true);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, clean);
            localStorage.setItem(CURRENCY_STORAGE_KEY, SUPPORTED_COUNTRIES[clean]!.currency);
            localStorage.setItem("kriya_geo_verified", "true");
          }
          setIsLoading(false);
          return;
        }
      }

      // Priority 2: Automatic IP-based Geolocation via backend (always fresh for guests)
      try {
        const envUrl = (import.meta.env["VITE_API_URL"] as string | undefined)?.trim();
        const API_URL =
          envUrl && !envUrl.includes("localhost")
            ? envUrl
            : typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
            ? "https://the-kriya-lab-backend.onrender.com"
            : envUrl || "http://localhost:5000";

        const res = await fetch(`${API_URL}/api/auth/detect-country`, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data = (await res.json()) as { countryCode?: string; success?: boolean };
          if (!isCancelled && data.countryCode) {
            const detectedCode = data.countryCode.toUpperCase().slice(0, 2);
            const finalCountry = SUPPORTED_COUNTRIES[detectedCode] || SUPPORTED_COUNTRIES["IN"]!;
            setCountryCodeState(finalCountry.code);
            setCurrencyOverride(finalCountry.currency);
            setIsVerified(false);
            if (typeof window !== "undefined") {
              localStorage.setItem(STORAGE_KEY, finalCountry.code);
              localStorage.setItem(CURRENCY_STORAGE_KEY, finalCountry.currency);
              localStorage.removeItem("kriya_geo_verified");
            }
          }
        }
      } catch (err) {
        console.warn("[GeoContext] IP detection notice (using fallback):", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    resolveCountry();

    return () => {
      isCancelled = true;
    };
  }, [user?.country]);

  const isLocked = Boolean(effectiveUser?.country);

  // Handle manual country change (Locked when user account has a verified location)
  const setCountry = (code: string) => {
    if (isLocked) {
      console.info("[GeoContext] Location is locked to verified user country:", effectiveUser?.country);
      return;
    }
    const clean = code.trim().toUpperCase().slice(0, 2);
    const country = SUPPORTED_COUNTRIES[clean] || SUPPORTED_COUNTRIES["IN"]!;
    setCountryCodeState(country.code);
    setCurrencyOverride(country.currency);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, country.code);
      localStorage.setItem(CURRENCY_STORAGE_KEY, country.currency);
    }
  };

  const setCurrency = (curr: string) => {
    setCurrencyOverride(curr);
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
    }
  };

  const currentCountry = SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES["IN"]!;
  const activeCurrency = currencyOverride || currentCountry.currency;
  const isIndia = countryCode === "IN";

  // Calculate currency conversion
  const convertPrice = (amountInr: number, targetCurrency?: string): number => {
    const curr = targetCurrency || activeCurrency;
    if (curr === "INR") return amountInr;
    // Keep exact catalog pricing for standard programs in USD
    if (curr === "USD" && amountInr === 4999) return 59;
    if (curr === "USD" && amountInr === 7999) return 99;
    if (curr === "USD" && amountInr === 25000) return 350;
    if (curr === "USD" && amountInr === 1999) return 29;
    const rate = EXCHANGE_RATES[curr] ?? EXCHANGE_RATES["USD"]!;
    const converted = amountInr * rate;
    // Round to whole friendly currency numbers
    return Math.max(1, Math.round(converted));
  };

  // Format currency with standard symbols
  const formatPrice = (amountInr: number, targetCurrency?: string): string => {
    const curr = targetCurrency || activeCurrency;
    const converted = convertPrice(amountInr, curr);
    switch (curr) {
      case "INR":
        return `₹${converted.toLocaleString("en-IN")}`;
      case "USD":
        return `$${converted.toLocaleString("en-US")}`;
      case "GBP":
        return `£${converted.toLocaleString("en-GB")}`;
      case "SGD":
        return `S$${converted.toLocaleString("en-SG")}`;
      case "AED":
        return `AED ${converted.toLocaleString("en-AE")}`;
      case "EUR":
        return `€${converted.toLocaleString("de-DE")}`;
      case "CAD":
        return `C$${converted.toLocaleString("en-CA")}`;
      case "AUD":
        return `A$${converted.toLocaleString("en-AU")}`;
      default:
        try {
          const locale = currentCountry.locale || "en-US";
          return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: curr,
            maximumFractionDigits: 0,
          }).format(converted);
        } catch {
          return `${curr} ${converted.toLocaleString()}`;
        }
    }
  };

  // Calculate Shipping fee & days
  const getShippingEstimate = (isDigital: boolean = false): ShippingEstimate => {
    if (isDigital) {
      return {
        fee: 0,
        feeFormatted: "Free (Instant Online Access)",
        daysText: "Instant Digital Access (Zoom & Portal)",
        courierName: "Live Streaming & Student Portal",
        isDomestic: true,
      };
    }

    if (isIndia) {
      return {
        fee: 0,
        feeFormatted: "Free Delivery",
        daysText: "2–4 Business Days",
        courierName: "India Post Express / Bluedart",
        isDomestic: true,
      };
    }

    const intlFeeInr = 1200;
    const intlFeeConverted = convertPrice(intlFeeInr, activeCurrency);
    const intlFeeFormatted = formatPrice(intlFeeInr, activeCurrency);

    return {
      fee: intlFeeConverted,
      feeFormatted: intlFeeFormatted,
      daysText: "7–10 Business Days",
      courierName: "DHL / FedEx International Priority",
      isDomestic: false,
    };
  };

  // Timezone schedule converter
  const formatScheduleTime = (
    eventDate?: string,
    startTime?: string,
    endTime?: string
  ) => {
    const rawWhen = [startTime, endTime].filter(Boolean).join(" – ");
    if (!rawWhen) {
      return {
        sourceTime: "",
        localTime: null,
        isDifferent: false,
        timezoneLabel: timezone,
      };
    }

    const sourceTime = `${rawWhen} IST`;

    // If user's timezone is Indian Standard Time, no conversion needed
    const isIndiaTz = timezone === "Asia/Kolkata" || timezone === "Asia/Calcutta";
    if (isIndiaTz) {
      return {
        sourceTime,
        localTime: null,
        isDifferent: false,
        timezoneLabel: "IST (Asia/Kolkata)",
      };
    }

    // Convert IST to user's timezone
    try {
      // Parse time string e.g. "06:00 AM"
      const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
      const startMatch = startTime ? startTime.match(timeRegex) : null;

      if (!startMatch) {
        return {
          sourceTime,
          localTime: null,
          isDifferent: false,
          timezoneLabel: timezone,
        };
      }

      let hours = parseInt(startMatch[1]!, 10);
      const minutes = parseInt(startMatch[2]!, 10);
      const meridiem = startMatch[3]?.toUpperCase();

      if (meridiem === "PM" && hours < 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;

      // Safe Date parsing avoiding client timezone offset shifts
      let yyyy: string;
      let mm: string;
      let dd: string;

      if (eventDate && /^\d{4}-\d{1,2}-\d{1,2}$/.test(eventDate.trim())) {
        const parts = eventDate.trim().split("-");
        yyyy = parts[0]!;
        mm = parts[1]!.padStart(2, "0");
        dd = parts[2]!.padStart(2, "0");
      } else if (eventDate) {
        const parsed = new Date(eventDate);
        if (!isNaN(parsed.getTime())) {
          yyyy = String(parsed.getUTCFullYear());
          mm = String(parsed.getUTCMonth() + 1).padStart(2, "0");
          dd = String(parsed.getUTCDate()).padStart(2, "0");
        } else {
          const now = new Date();
          yyyy = String(now.getFullYear());
          mm = String(now.getMonth() + 1).padStart(2, "0");
          dd = String(now.getDate()).padStart(2, "0");
        }
      } else {
        const now = new Date();
        yyyy = String(now.getFullYear());
        mm = String(now.getMonth() + 1).padStart(2, "0");
        dd = String(now.getDate()).padStart(2, "0");
      }

      // Construct ISO string with +05:30 offset
      const hh = String(hours).padStart(2, "0");
      const min = String(minutes).padStart(2, "0");

      const istDate = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00+05:30`);

      const localTimeOnly = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(istDate);

      // Check timezone abbreviation
      const tzNameFormatted = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
      })
        .formatToParts(istDate)
        .find((part) => part.type === "timeZoneName")?.value || timezone;

      // Check if local day differs from source date
      const localDay = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        day: "2-digit",
      }).format(istDate);

      const localDateParts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        month: "short",
        day: "numeric",
      }).format(istDate);

      const hasDateShift = dd !== localDay;
      const displayLocalTime = hasDateShift
        ? `${localDateParts}, ${localTimeOnly} ${tzNameFormatted}`
        : `${localTimeOnly} ${tzNameFormatted}`;

      return {
        sourceTime,
        localTime: displayLocalTime,
        isDifferent: true,
        timezoneLabel: `${tzNameFormatted} (${timezone})`,
      };
    } catch {
      return {
        sourceTime,
        localTime: null,
        isDifferent: false,
        timezoneLabel: timezone,
      };
    }
  };

  const value = useMemo(
    () => ({
      countryCode: currentCountry.code,
      countryName: currentCountry.name,
      currency: activeCurrency,
      currencySymbol: currentCountry.symbol,
      flag: currentCountry.flag,
      timezone,
      isIndia,
      isLocked,
      isVerified,
      isLoading,
      setCountry,
      setCurrency,
      convertPrice,
      formatPrice,
      getShippingEstimate,
      formatScheduleTime,
    }),
    [currentCountry, activeCurrency, timezone, isIndia, isLocked, isVerified, isLoading]
  );

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
}

export function useGeo() {
  const context = useContext(GeoContext);
  if (!context) {
    throw new Error("useGeo must be used within a GeoProvider");
  }
  return context;
}

