/**
 * ISO 3166-1 alpha-2 Country Codes & Normalization Utilities
 */

// Set of all 249 officially assigned ISO 3166-1 alpha-2 country codes
export const ISO_ALPHA2_CODES = new Set([
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
  "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
  "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"
]);

// Common country name alias map to ISO 3166-1 alpha-2
const COUNTRY_NAME_MAP: Record<string, string> = {
  "INDIA": "IN",
  "UNITED STATES": "US",
  "UNITED STATES OF AMERICA": "US",
  "USA": "US",
  "SINGAPORE": "SG",
  "MALAYSIA": "MY",
  "UNITED ARAB EMIRATES": "AE",
  "UAE": "AE",
  "UNITED KINGDOM": "GB",
  "UK": "GB",
  "AUSTRALIA": "AU",
  "CANADA": "CA",
  "SRI LANKA": "LK",
  "GERMANY": "DE",
  "FRANCE": "FR",
  "INDONESIA": "ID",
  "JAPAN": "JP",
  "NEW ZEALAND": "NZ",
  "NETHERLANDS": "NL",
  "SWITZERLAND": "CH",
  "SWEDEN": "SE",
  "SOUTH AFRICA": "ZA",
  "BRAZIL": "BR",
  "RUSSIA": "RU",
  "RUSSIAN FEDERATION": "RU",
};

/**
 * Normalizes any country representation (e.g. "IN India", "in", "India", "US") to ISO 3166-1 alpha-2.
 * Returns the 2-letter uppercase ISO code, or null if invalid/unrecognized.
 */
export function normalizeCountryCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Pattern 1: Starts with a 2-letter ISO code followed by a space or end of string (e.g., "IN India" or "IN")
  const leadingMatch = trimmed.match(/^([a-zA-Z]{2})(?:\s|$)/);
  if (leadingMatch) {
    const candidate = leadingMatch[1].toUpperCase();
    if (ISO_ALPHA2_CODES.has(candidate)) {
      return candidate;
    }
  }

  // Pattern 2: Direct 2-letter match
  const upper = trimmed.toUpperCase();
  if (upper.length === 2 && ISO_ALPHA2_CODES.has(upper)) {
    return upper;
  }

  // Pattern 3: Country name lookup
  const nameCandidate = COUNTRY_NAME_MAP[upper];
  if (nameCandidate && ISO_ALPHA2_CODES.has(nameCandidate)) {
    return nameCandidate;
  }

  return null;
}

