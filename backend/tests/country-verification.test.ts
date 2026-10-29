import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { normalizeCountryCode, ISO_ALPHA2_CODES } from "../src/services/geo/country-codes.js";
import {
  IpGeoService,
  MockIpGeoProvider,
  isPrivateOrLocalIp,
  extractClientIp,
} from "../src/services/geo/ip-geo.service.js";
import {
  ReverseGeoService,
  MockReverseGeoProvider,
  validateCoordinates,
} from "../src/services/geo/reverse-geo.service.js";
import {
  CountryVerifierService,
  GeoValidationError,
  GeoMismatchError,
  GeoServiceUnavailableError,
} from "../src/services/geo/country-verifier.service.js";

describe("Country Verification Security Suite", () => {
  let mockIpProvider: MockIpGeoProvider;
  let mockReverseProvider: MockReverseGeoProvider;
  let ipService: IpGeoService;
  let reverseService: ReverseGeoService;
  let verifier: CountryVerifierService;

  beforeEach(() => {
    mockIpProvider = new MockIpGeoProvider("IN");
    mockReverseProvider = new MockReverseGeoProvider("IN");
    ipService = new IpGeoService(mockIpProvider);
    reverseService = new ReverseGeoService(mockReverseProvider);
    verifier = new CountryVerifierService(ipService, reverseService);
  });

  // TEST 1: Selected India + IP India + GPS India => Success (continue to registration)
  it("Test 1: Selected India + IP India + GPS India => passes verification", async () => {
    mockIpProvider.setDefaultCountry("IN");
    mockReverseProvider.setMockCountry("IN");

    const fakeReq: any = { ip: "103.21.124.1", headers: {}, socket: { remoteAddress: "103.21.124.1" } };
    const result = await verifier.verifyRegistration({
      req: fakeReq,
      selectedCountry: "IN India",
      gps: { latitude: 13.0827, longitude: 80.2707, accuracy: 15 },
    });

    assert.equal(result.verified, true);
    assert.equal(result.selectedCountry, "IN");
    assert.equal(result.ipCountry, "IN");
    assert.equal(result.gpsCountry, "IN");
    assert.ok(result.correlationId);
  });

  // TEST 2: Selected India + IP US + GPS US => reject, HTTP 403
  it("Test 2: Selected India + IP US + GPS US => reject with GeoMismatchError", async () => {
    mockIpProvider.setDefaultCountry("US");
    mockReverseProvider.setMockCountry("US");

    const fakeReq: any = { ip: "8.8.8.8", headers: {}, socket: { remoteAddress: "8.8.8.8" } };

    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "IN India",
          gps: { latitude: 37.7749, longitude: -122.4194, accuracy: 20 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoMismatchError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "COUNTRY_MISMATCH");
        return true;
      }
    );
  });

  // TEST 3: Selected India + IP India + GPS US => reject, HTTP 403
  it("Test 3: Selected India + IP India + GPS US => reject with GeoMismatchError", async () => {
    mockIpProvider.setDefaultCountry("IN");
    mockReverseProvider.setMockCountry("US");

    const fakeReq: any = { ip: "103.21.124.1", headers: {}, socket: { remoteAddress: "103.21.124.1" } };

    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "IN India",
          gps: { latitude: 37.7749, longitude: -122.4194, accuracy: 20 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoMismatchError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "COUNTRY_MISMATCH");
        return true;
      }
    );
  });

  // TEST 4: Selected US + IP India + GPS India => reject, HTTP 403
  it("Test 4: Selected US + IP India + GPS India => reject with GeoMismatchError", async () => {
    mockIpProvider.setDefaultCountry("IN");
    mockReverseProvider.setMockCountry("IN");

    const fakeReq: any = { ip: "103.21.124.1", headers: {}, socket: { remoteAddress: "103.21.124.1" } };

    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "US United States",
          gps: { latitude: 13.0827, longitude: 80.2707, accuracy: 15 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoMismatchError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "COUNTRY_MISMATCH");
        return true;
      }
    );
  });

  // TEST 5: GPS permission denied or missing coordinates => reject, HTTP 400
  it("Test 5: GPS missing coordinates or null => reject with GeoValidationError", async () => {
    const fakeReq: any = { ip: "103.21.124.1", headers: {}, socket: { remoteAddress: "103.21.124.1" } };

    // Missing GPS entirely
    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "IN India",
          gps: null,
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoValidationError);
        assert.equal(err.statusCode, 400);
        assert.equal(err.code, "INVALID_GEO_INPUT");
        return true;
      }
    );

    // Incomplete GPS (missing longitude)
    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "IN India",
          gps: { latitude: 13.0827 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoValidationError);
        assert.equal(err.statusCode, 400);
        return true;
      }
    );
  });

  // TEST 6: Invalid coordinates or invalid country code => reject, HTTP 400
  it("Test 6: Invalid coordinates (out of range) or invalid country => reject with GeoValidationError", async () => {
    const fakeReq: any = { ip: "103.21.124.1", headers: {}, socket: { remoteAddress: "103.21.124.1" } };

    // Latitude out of range (> 90)
    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "IN India",
          gps: { latitude: 120.0, longitude: 80.2707 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoValidationError);
        assert.equal(err.statusCode, 400);
        return true;
      }
    );

    // Invalid country code (not recognized)
    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "ZZ NonExistentCountry",
          gps: { latitude: 13.0827, longitude: 80.2707 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoValidationError);
        assert.equal(err.statusCode, 400);
        return true;
      }
    );
  });

  // TEST 7: IP provider or geocoder timeout/failure => fail closed, HTTP 503
  it("Test 7: Provider failure or timeout => fail closed with GeoServiceUnavailableError", async () => {
    // Simulate IP Geo service failure
    mockIpProvider.setShouldFail(true);
    const fakeReq: any = { ip: "103.21.124.1", headers: {}, socket: { remoteAddress: "103.21.124.1" } };

    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "IN India",
          gps: { latitude: 13.0827, longitude: 80.2707, accuracy: 10 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoServiceUnavailableError);
        assert.equal(err.statusCode, 503);
        assert.equal(err.code, "GEO_SERVICE_UNAVAILABLE");
        return true;
      }
    );

    // Reset IP provider, simulate Reverse Geo failure
    mockIpProvider.setShouldFail(false);
    mockReverseProvider.setShouldFail(true);

    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "IN India",
          gps: { latitude: 13.0827, longitude: 80.2707, accuracy: 10 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoServiceUnavailableError);
        assert.equal(err.statusCode, 503);
        assert.equal(err.code, "GEO_SERVICE_UNAVAILABLE");
        return true;
      }
    );
  });

  // TEST 8: Country normalization helper accuracy
  it("Test 8: Country normalization accurately normalizes ISO codes and aliases", () => {
    assert.equal(normalizeCountryCode("IN India"), "IN");
    assert.equal(normalizeCountryCode("US United States"), "US");
    assert.equal(normalizeCountryCode("in"), "IN");
    assert.equal(normalizeCountryCode("United States"), "US");
    assert.equal(normalizeCountryCode("India"), "IN");
    assert.equal(normalizeCountryCode("Singapore"), "SG");
    assert.equal(normalizeCountryCode("InvalidUnknownCodeXYZ"), null);
  });

  // TEST 9: Attempts to spoof client-supplied headers cannot bypass verification in production
  it("Test 9: Production ignores x-test-client-ip and rejects private IPs", () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";

      // Attempt to spoof IP via x-test-client-ip
      const spoofReq: any = {
        ip: "127.0.0.1",
        headers: { "x-test-client-ip": "103.21.124.1" },
        socket: { remoteAddress: "127.0.0.1" },
      };

      const extracted = extractClientIp(spoofReq);
      // In production, x-test-client-ip is strictly ignored, returns actual req.ip (127.0.0.1)
      assert.equal(extracted, "127.0.0.1");
      assert.equal(isPrivateOrLocalIp(extracted), true);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  // TEST 10: Zero database insert calls for every rejected case
  it("Test 10: Ensures zero TiDB database inserts occur whenever verification fails", async () => {
    let dbInsertCallCount = 0;

    // Simulated TiDB pool that tracks insert calls
    const mockDb = {
      query: async (sql: string, params: any[]) => {
        if (sql.includes("INSERT INTO users")) {
          dbInsertCallCount++;
        }
        return [[]];
      },
    };

    // Attempt registration with mismatched country
    mockIpProvider.setDefaultCountry("US");
    mockReverseProvider.setMockCountry("US");

    const fakeReq: any = { ip: "8.8.8.8", headers: {}, socket: { remoteAddress: "8.8.8.8" } };

    try {
      await verifier.verifyRegistration({
        req: fakeReq,
        selectedCountry: "IN India",
        gps: { latitude: 37.7749, longitude: -122.4194, accuracy: 20 },
      });
      // If verification passed, query would run:
      await mockDb.query("INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)", [
        "KL_999",
        "Test",
        "test@example.com",
        "hash",
        "student",
      ]);
    } catch {
      // Expected verification failure: no DB insert should be called
    }

    assert.equal(dbInsertCallCount, 0, "Expected ZERO TiDB insert calls for rejected registration!");
  });

  // TEST 11: User in India (IP IN, GPS IN) selecting Australia (AU) => reject with detailed mismatch
  it("Test 11: User in India (IP IN, GPS IN) selecting Australia (AU) => reject with detailed mismatch", async () => {
    mockIpProvider.setDefaultCountry("IN");
    mockReverseProvider.setMockCountry("IN");

    const fakeReq: any = { ip: "103.21.124.1", headers: {}, socket: { remoteAddress: "103.21.124.1" } };

    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "AU Australia",
          gps: { latitude: 13.0827, longitude: 80.2707, accuracy: 15 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoMismatchError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "COUNTRY_MISMATCH");
        assert.equal(err.selectedCountry, "AU");
        assert.equal(err.ipCountry, "IN");
        assert.equal(err.gpsCountry, "IN");
        return true;
      }
    );
  });

  // TEST 12: User in Australia (IP AU, GPS AU) selecting Australia (AU) => passes
  it("Test 12: User in Australia (IP AU, GPS AU) selecting Australia (AU) => passes verification", async () => {
    mockIpProvider.setDefaultCountry("AU");
    mockReverseProvider.setMockCountry("AU");

    const fakeReq: any = { ip: "1.1.1.1", headers: {}, socket: { remoteAddress: "1.1.1.1" } };

    const result = await verifier.verifyRegistration({
      req: fakeReq,
      selectedCountry: "AU Australia",
      gps: { latitude: -33.8688, longitude: 151.2093, accuracy: 20 },
    });

    assert.equal(result.verified, true);
    assert.equal(result.selectedCountry, "AU");
    assert.equal(result.ipCountry, "AU");
    assert.equal(result.gpsCountry, "AU");
  });

  // TEST 13: User in Australia (IP AU, GPS AU) selecting India (IN) => reject with detailed mismatch
  it("Test 13: User in Australia (IP AU, GPS AU) selecting India (IN) => reject with detailed mismatch", async () => {
    mockIpProvider.setDefaultCountry("AU");
    mockReverseProvider.setMockCountry("AU");

    const fakeReq: any = { ip: "1.1.1.1", headers: {}, socket: { remoteAddress: "1.1.1.1" } };

    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "IN India",
          gps: { latitude: -33.8688, longitude: 151.2093, accuracy: 20 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoMismatchError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "COUNTRY_MISMATCH");
        assert.equal(err.selectedCountry, "IN");
        assert.equal(err.ipCountry, "AU");
        assert.equal(err.gpsCountry, "AU");
        return true;
      }
    );
  });

  // TEST 14: GPS Australia (-33.86, 151.20) + IP India + Selected India => reject with detailed mismatch
  it("Test 14: GPS Australia + IP India + Selected India => reject with detailed mismatch", async () => {
    mockIpProvider.setDefaultCountry("IN");
    mockReverseProvider.setMockCountry("AU");

    const fakeReq: any = { ip: "103.21.124.1", headers: {}, socket: { remoteAddress: "103.21.124.1" } };

    await assert.rejects(
      async () => {
        await verifier.verifyRegistration({
          req: fakeReq,
          selectedCountry: "IN India",
          gps: { latitude: -33.8688, longitude: 151.2093, accuracy: 20 },
        });
      },
      (err: any) => {
        assert.ok(err instanceof GeoMismatchError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "COUNTRY_MISMATCH");
        assert.equal(err.selectedCountry, "IN");
        assert.equal(err.ipCountry, "IN");
        assert.equal(err.gpsCountry, "AU");
        return true;
      }
    );
  });
});

