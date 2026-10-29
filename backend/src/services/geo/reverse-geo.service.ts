import { normalizeCountryCode } from "./country-codes.js";

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface IReverseGeoProvider {
  readonly name: string;
  getCountryCode(lat: number, lng: number): Promise<string>;
}

/**
 * Validates raw coordinate values from the request payload.
 * Throws an Error with descriptive message if validation fails.
 */
export function validateCoordinates(input: any): GpsCoordinates {
  if (!input || typeof input !== "object") {
    throw new Error("Missing GPS location payload");
  }

  const { latitude, longitude, accuracy } = input;

  const latNum = Number(latitude);
  const lngNum = Number(longitude);

  if (typeof latitude === "undefined" || latitude === null || isNaN(latNum)) {
    throw new Error("Latitude is missing or not a valid number");
  }

  if (typeof longitude === "undefined" || longitude === null || isNaN(lngNum)) {
    throw new Error("Longitude is missing or not a valid number");
  }

  if (latNum < -90 || latNum > 90) {
    throw new Error(`Latitude must be between -90 and 90. Received: ${latNum}`);
  }

  if (lngNum < -180 || lngNum > 180) {
    throw new Error(`Longitude must be between -180 and 180. Received: ${lngNum}`);
  }

  let accNum: number | undefined;
  if (typeof accuracy !== "undefined" && accuracy !== null) {
    accNum = Number(accuracy);
    if (isNaN(accNum) || accNum < 0) {
      throw new Error(`Accuracy must be a positive number. Received: ${accuracy}`);
    }
    // Reject excessive inaccuracies (> 100km / 100,000m)
    if (accNum > 100000) {
      throw new Error(`GPS accuracy too low (${Math.round(accNum)}m) for country verification`);
    }
  }

  return {
    latitude: latNum,
    longitude: lngNum,
    accuracy: accNum,
  };
}

/**
 * BigDataCloud Free Reverse Geocoding Adapter
 * Returns ISO 3166-1 alpha-2 country code directly.
 */
export class BigDataCloudReverseGeoProvider implements IReverseGeoProvider {
  public readonly name = "bigdatacloud";
  private apiKey?: string;
  private timeoutMs: number;

  constructor(apiKey?: string, timeoutMs: number = 4000) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
  }

  async getCountryCode(lat: number, lng: number): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = this.apiKey
        ? `https://api-bdc.net/data/reverse-geocode?latitude=${lat}&longitude=${lng}&localityLanguage=en&key=${this.apiKey}`
        : `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Reverse Geocoding HTTP Error: ${response.status}`);
      }

      const data = (await response.json()) as { countryCode?: string; countryName?: string; description?: string };

      if (!data.countryCode) {
        throw new Error(data.description || "Reverse geocoding returned no country code for coordinates");
      }

      const normalized = normalizeCountryCode(data.countryCode);
      if (!normalized) {
        throw new Error(`Unrecognized country code returned by reverse geocoder: ${data.countryCode}`);
      }

      return normalized;
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * OpenStreetMap Nominatim Reverse Geocoding Adapter
 */
export class NominatimReverseGeoProvider implements IReverseGeoProvider {
  public readonly name = "nominatim";
  private timeoutMs: number;

  constructor(timeoutMs: number = 4000) {
    this.timeoutMs = timeoutMs;
  }

  async getCountryCode(lat: number, lng: number): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "TheKriyaLab-Backend/1.0 (contact@thekriyalab.com)",
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim HTTP Error: ${response.status}`);
      }

      const data = (await response.json()) as { address?: { country_code?: string; country?: string }; error?: string };

      if (data.error || !data.address?.country_code) {
        throw new Error(data.error || "No country found at given coordinates");
      }

      const normalized = normalizeCountryCode(data.address.country_code);
      if (!normalized) {
        throw new Error(`Unrecognized country code from Nominatim: ${data.address.country_code}`);
      }

      return normalized;
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * Mock Reverse Geo Provider for automated testing and isolated unit tests
 */
export class MockReverseGeoProvider implements IReverseGeoProvider {
  public readonly name = "mock";
  private mockCountry: string | null = "IN";
  private shouldFail: boolean = false;
  private coordinateMap: Map<string, string> = new Map();

  constructor(defaultCountry: string | null = "IN") {
    this.mockCountry = defaultCountry;
  }

  setMockCountry(country: string | null) {
    this.mockCountry = country;
  }

  setDefaultCountry(country: string | null) {
    this.mockCountry = country;
  }

  setCountryForCoords(lat: number, lng: number, country: string) {
    this.coordinateMap.set(`${lat.toFixed(2)},${lng.toFixed(2)}`, country.toUpperCase());
  }

  setShouldFail(fail: boolean) {
    this.shouldFail = fail;
  }

  async getCountryCode(lat: number, lng: number): Promise<string> {
    if (this.shouldFail) {
      throw new Error("Mock Reverse Geocoding simulated service failure/timeout");
    }

    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const candidate = this.coordinateMap.get(key) || this.mockCountry;

    if (!candidate) {
      throw new Error(`Reverse geocoder could not resolve coordinates: ${lat}, ${lng}`);
    }

    const normalized = normalizeCountryCode(candidate);
    if (!normalized) {
      throw new Error(`Invalid mock country code: ${candidate}`);
    }

    return normalized;
  }
}

/**
 * Reverse Geocoding Service
 */
export class ReverseGeoService {
  private provider: IReverseGeoProvider;

  constructor(provider?: IReverseGeoProvider) {
    if (provider) {
      this.provider = provider;
      return;
    }

    const providerType = (process.env.REVERSE_GEO_PROVIDER || "bigdatacloud").toLowerCase();
    const apiKey = process.env.REVERSE_GEO_API_KEY;
    const timeout = Number(process.env.GEO_VERIFICATION_TIMEOUT_MS) || 4000;

    switch (providerType) {
      case "nominatim":
        this.provider = new NominatimReverseGeoProvider(timeout);
        break;
      case "mock":
        this.provider = new MockReverseGeoProvider();
        break;
      case "bigdatacloud":
      default:
        this.provider = new BigDataCloudReverseGeoProvider(apiKey, timeout);
        break;
    }
  }

  setProvider(provider: IReverseGeoProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  async resolveCountry(coords: GpsCoordinates): Promise<string> {
    return await this.provider.getCountryCode(coords.latitude, coords.longitude);
  }
}

export const defaultReverseGeoService = new ReverseGeoService();
