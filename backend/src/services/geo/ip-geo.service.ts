import { Request } from "express";
import { normalizeCountryCode } from "./country-codes.js";

export interface IIpGeoProvider {
  readonly name: string;
  getCountryCode(ip: string): Promise<string>;
}

/**
 * Checks whether an IP address belongs to private, loopback, or link-local ranges.
 */
export function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, "").trim();

  // Loopback and unspecified
  if (clean === "127.0.0.1" || clean === "::1" || clean === "0.0.0.0" || clean === "localhost") {
    return true;
  }

  // IPv4 Private & Link-local ranges
  // 10.0.0.0 – 10.255.255.255
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(clean)) return true;
  // 172.16.0.0 – 172.31.255.255
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(clean)) return true;
  // 192.168.0.0 – 192.168.255.255
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(clean)) return true;
  // 169.254.0.0 – 169.254.255.255 (Link-local)
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(clean)) return true;

  // IPv6 Unique Local Address (fc00::/7) or Link-local (fe80::/10)
  if (/^(fc|fd|fe80)/i.test(clean)) return true;

  return false;
}

/**
 * Extracts and sanitizes the client IP address from the Express request.
 * Relies on Express trusted proxy configuration (e.g. app.set("trust proxy", 1) on Render).
 */
export function extractClientIp(req: Request): string {
  // Only permit x-test-client-ip header in non-production environments
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const testHeader = req.headers["x-test-client-ip"];
    if (typeof testHeader === "string" && testHeader.trim()) {
      return testHeader.trim().replace(/^::ffff:/, "");
    }
  }

  // 1. Check CF-Connecting-IP (Render native Cloudflare layer)
  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (typeof cfConnectingIp === "string" && cfConnectingIp.trim()) {
    const cleanCf = cfConnectingIp.trim().replace(/^::ffff:/, "");
    if (!isPrivateOrLocalIp(cleanCf)) {
      return cleanCf;
    }
  }

  // 2. Check req.ips (populated by Express when trust proxy is enabled)
  if (Array.isArray(req.ips) && req.ips.length > 0) {
    for (const item of req.ips) {
      if (typeof item === "string") {
        const cleanItem = item.trim().replace(/^::ffff:/, "");
        if (!isPrivateOrLocalIp(cleanItem)) {
          return cleanItem;
        }
      }
    }
  }

  // 3. Fallback to Express req.ip or socket.remoteAddress
  const rawIp = req.ip || req.socket?.remoteAddress || "";
  const sanitized = rawIp.replace(/^::ffff:/, "").trim();

  return sanitized;
}

/**
 * IP-API Provider Adapter (http://ip-api.com)
 * Free for non-commercial, supports key if pro
 */
export class IpApiProvider implements IIpGeoProvider {
  public readonly name = "ip-api";
  private apiKey?: string;
  private timeoutMs: number;

  constructor(apiKey?: string, timeoutMs: number = 4000) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
  }

  async getCountryCode(ip: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const endpoint = this.apiKey
        ? `https://pro.ip-api.com/json/${encodeURIComponent(ip)}?key=${this.apiKey}&fields=status,message,countryCode`
        : `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,countryCode`;

      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`IP Geolocation HTTP Error: ${response.status}`);
      }

      const data = (await response.json()) as { status?: string; message?: string; countryCode?: string };

      if (data.status !== "success" || !data.countryCode) {
        throw new Error(data.message || "IP Geolocation lookup failed");
      }

      const normalized = normalizeCountryCode(data.countryCode);
      if (!normalized) {
        throw new Error(`Unrecognized country code returned by IP provider: ${data.countryCode}`);
      }

      return normalized;
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * IpInfo Provider Adapter (https://ipinfo.io)
 */
export class IpInfoProvider implements IIpGeoProvider {
  public readonly name = "ipinfo";
  private apiKey?: string;
  private timeoutMs: number;

  constructor(apiKey?: string, timeoutMs: number = 4000) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
  }

  async getCountryCode(ip: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = this.apiKey
        ? `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${this.apiKey}`
        : `https://ipinfo.io/${encodeURIComponent(ip)}/json`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`IP Geolocation HTTP Error: ${response.status}`);
      }

      const data = (await response.json()) as { country?: string; error?: { message?: string } };

      if (data.error || !data.country) {
        throw new Error(data.error?.message || "IP Geolocation lookup failed");
      }

      const normalized = normalizeCountryCode(data.country);
      if (!normalized) {
        throw new Error(`Unrecognized country code returned by IP provider: ${data.country}`);
      }

      return normalized;
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * Mock IP Geo Provider for automated testing and isolated unit tests
 */
export class MockIpGeoProvider implements IIpGeoProvider {
  public readonly name = "mock";
  private ipMap: Map<string, string> = new Map();
  private defaultCountry: string | null = "IN";
  private shouldFail: boolean = false;

  constructor(defaultCountry: string | null = "IN") {
    this.defaultCountry = defaultCountry;
  }

  setCountryForIp(ip: string, country: string) {
    this.ipMap.set(ip.replace(/^::ffff:/, "").trim(), country.toUpperCase());
  }

  setDefaultCountry(country: string | null) {
    this.defaultCountry = country;
  }

  setShouldFail(fail: boolean) {
    this.shouldFail = fail;
  }

  async getCountryCode(ip: string): Promise<string> {
    if (this.shouldFail) {
      throw new Error("Mock IP Geolocation provider simulated service timeout/failure");
    }

    const clean = ip.replace(/^::ffff:/, "").trim();
    const mapped = this.ipMap.get(clean) || this.defaultCountry;

    if (!mapped) {
      throw new Error(`No IP location found for: ${ip}`);
    }

    const normalized = normalizeCountryCode(mapped);
    if (!normalized) {
      throw new Error(`Invalid mock country code: ${mapped}`);
    }

    return normalized;
  }
}

/**
 * IP Geolocation Service
 */
export class IpGeoService {
  private provider: IIpGeoProvider;

  constructor(provider?: IIpGeoProvider) {
    if (provider) {
      this.provider = provider;
      return;
    }

    const providerType = (process.env.IP_GEO_PROVIDER || "ip-api").toLowerCase();
    const apiKey = process.env.IP_GEO_API_KEY;
    const timeout = Number(process.env.GEO_VERIFICATION_TIMEOUT_MS) || 4000;

    switch (providerType) {
      case "ipinfo":
        this.provider = new IpInfoProvider(apiKey, timeout);
        break;
      case "mock":
        this.provider = new MockIpGeoProvider();
        break;
      case "ip-api":
      default:
        this.provider = new IpApiProvider(apiKey, timeout);
        break;
    }
  }

  setProvider(provider: IIpGeoProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  async resolveCountry(req: Request): Promise<string> {
    const clientIp = extractClientIp(req);
    const isProd = process.env.NODE_ENV === "production";

    if (!clientIp) {
      throw new Error("Unable to determine client IP address");
    }

    if (isPrivateOrLocalIp(clientIp)) {
      if (isProd) {
        throw new Error("Client connected from non-public IP address. Cannot verify country in production.");
      }
      // Non-production fallback (local dev environment): allow fallback IP if provided
      const devFallback = process.env.DEV_FALLBACK_IP || "103.21.124.0"; // Default to India IP for dev
      const countryCode = await this.provider.getCountryCode(devFallback);
      console.log(`[GEO_DIAGNOSTIC] IP Geolocation (dev fallback) -> Country: ${countryCode}`);
      return countryCode;
    }

    const countryCode = await this.provider.getCountryCode(clientIp);
    console.log(`[GEO_DIAGNOSTIC] IP Geolocation resolved -> Country: ${countryCode}`);
    return countryCode;
  }
}

export const defaultIpGeoService = new IpGeoService();

