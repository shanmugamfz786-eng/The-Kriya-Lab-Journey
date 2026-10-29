import crypto from "crypto";
import { Request } from "express";
import { normalizeCountryCode } from "./country-codes.js";
import { defaultIpGeoService, IpGeoService } from "./ip-geo.service.js";
import { defaultReverseGeoService, ReverseGeoService, validateCoordinates, GpsCoordinates } from "./reverse-geo.service.js";

export class GeoValidationError extends Error {
  public readonly statusCode = 400;
  public readonly code = "INVALID_GEO_INPUT";
  constructor(message: string) {
    super(message);
    this.name = "GeoValidationError";
  }
}

export class GeoMismatchError extends Error {
  public readonly statusCode = 403;
  public readonly code = "COUNTRY_MISMATCH";
  constructor(message: string = "Registration country verification failed: The selected country does not match your verified location.") {
    super(message);
    this.name = "GeoMismatchError";
  }
}

export class GeoServiceUnavailableError extends Error {
  public readonly statusCode = 503;
  public readonly code = "GEO_SERVICE_UNAVAILABLE";
  constructor(message: string = "Location verification service is temporarily unavailable. Please try again shortly.") {
    super(message);
    this.name = "GeoServiceUnavailableError";
  }
}

export interface VerificationAuditLog {
  event: "COUNTRY_VERIFICATION";
  timestamp: string;
  correlationId: string;
  outcome: "MATCH" | "MISMATCH" | "ERROR";
  selectedCountry?: string;
  ipCountry?: string;
  gpsCountry?: string;
  reason?: string;
}

export interface VerificationResult {
  verified: boolean;
  selectedCountry: string;
  ipCountry: string;
  gpsCountry: string;
  correlationId: string;
}

export class CountryVerifierService {
  private ipGeoService: IpGeoService;
  private reverseGeoService: ReverseGeoService;

  constructor(ipGeoService?: IpGeoService, reverseGeoService?: ReverseGeoService) {
    this.ipGeoService = ipGeoService || defaultIpGeoService;
    this.reverseGeoService = reverseGeoService || defaultReverseGeoService;
  }

  setIpGeoService(service: IpGeoService) {
    this.ipGeoService = service;
  }

  setReverseGeoService(service: ReverseGeoService) {
    this.reverseGeoService = service;
  }

  /**
   * Enforces server-side country verification.
   * Compares Selected Country === IP Country === GPS Country.
   * Throws GeoValidationError (400), GeoMismatchError (403), or GeoServiceUnavailableError (503).
   * Never leaks raw IP, exact coordinates, or provider credentials.
   */
  async verifyRegistration(params: {
    req: Request;
    selectedCountry: unknown;
    gps: unknown;
  }): Promise<VerificationResult> {
    const correlationId = "geo_" + crypto.randomBytes(8).toString("hex");

    // 1. Normalize and validate selected country
    if (!params.selectedCountry) {
      this.logAudit({
        event: "COUNTRY_VERIFICATION",
        timestamp: new Date().toISOString(),
        correlationId,
        outcome: "ERROR",
        reason: "Missing country selection",
      });
      throw new GeoValidationError("Country selection is required");
    }

    const normalizedSelected = normalizeCountryCode(params.selectedCountry);
    if (!normalizedSelected) {
      this.logAudit({
        event: "COUNTRY_VERIFICATION",
        timestamp: new Date().toISOString(),
        correlationId,
        outcome: "ERROR",
        reason: "Unrecognized or invalid country selection",
      });
      throw new GeoValidationError("Invalid or unrecognized country selection");
    }

    // 2. Validate GPS coordinates
    let validatedGps: GpsCoordinates;
    try {
      validatedGps = validateCoordinates(params.gps);
    } catch (err: any) {
      this.logAudit({
        event: "COUNTRY_VERIFICATION",
        timestamp: new Date().toISOString(),
        correlationId,
        outcome: "ERROR",
        selectedCountry: normalizedSelected,
        reason: err.message,
      });
      throw new GeoValidationError(err.message || "Invalid GPS location coordinates");
    }

    // 3. Resolve IP Country and GPS Country concurrently with fail-closed behavior
    let ipCountry: string;
    let gpsCountry: string;

    try {
      const [resolvedIpCountry, resolvedGpsCountry] = await Promise.all([
        this.ipGeoService.resolveCountry(params.req),
        this.reverseGeoService.resolveCountry(validatedGps),
      ]);
      ipCountry = resolvedIpCountry;
      gpsCountry = resolvedGpsCountry;
    } catch (err: any) {
      this.logAudit({
        event: "COUNTRY_VERIFICATION",
        timestamp: new Date().toISOString(),
        correlationId,
        outcome: "ERROR",
        selectedCountry: normalizedSelected,
        reason: "Provider lookup error: " + err.message,
      });
      throw new GeoServiceUnavailableError(
        "Location verification services are currently unavailable. Please verify your connection and try again."
      );
    }

    // 4. Enforce strict triangulation: selected === ip === gps
    const isIpMatch = normalizedSelected === ipCountry;
    const isGpsMatch = normalizedSelected === gpsCountry;
    const isTriangulated = isIpMatch && isGpsMatch;

    if (!isTriangulated) {
      this.logAudit({
        event: "COUNTRY_VERIFICATION",
        timestamp: new Date().toISOString(),
        correlationId,
        outcome: "MISMATCH",
        selectedCountry: normalizedSelected,
        ipCountry,
        gpsCountry,
        reason: `Mismatch: Selected(${normalizedSelected}) vs IP(${ipCountry}) vs GPS(${gpsCountry})`,
      });

      throw new GeoMismatchError(
        "Registration country verification failed. Your selected country does not match your physical location or network connection."
      );
    }

    // 5. Successful match
    this.logAudit({
      event: "COUNTRY_VERIFICATION",
      timestamp: new Date().toISOString(),
      correlationId,
      outcome: "MATCH",
      selectedCountry: normalizedSelected,
      ipCountry,
      gpsCountry,
    });

    return {
      verified: true,
      selectedCountry: normalizedSelected,
      ipCountry,
      gpsCountry,
      correlationId,
    };
  }

  private logAudit(entry: VerificationAuditLog) {
    // Audit log intentionally contains only sanitized metadata: timestamps, correlation ID, ISO country codes
    // Raw IP addresses, exact coordinates, and personal identity are NEVER logged.
    console.log(`[AUDIT_GEO] ${JSON.stringify(entry)}`);
  }
}

export const defaultCountryVerifier = new CountryVerifierService();

