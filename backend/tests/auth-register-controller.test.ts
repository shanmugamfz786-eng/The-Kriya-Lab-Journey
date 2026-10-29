import { describe, it, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { register, detectCountry, preVerifyLocation } from "../src/controllers/auth.controller.js";
import { getDbPool } from "../src/config/db.js";
import { removeLocalUser } from "../src/config/local-users.js";
import {
  defaultCountryVerifier,
} from "../src/services/geo/country-verifier.service.js";
import {
  MockIpGeoProvider,
  IpGeoService,
  defaultIpGeoService,
} from "../src/services/geo/ip-geo.service.js";
import {
  MockReverseGeoProvider,
  ReverseGeoService,
} from "../src/services/geo/reverse-geo.service.js";

describe("Express Auth Registration Controller Integration", () => {
  let mockIp: MockIpGeoProvider;
  let mockReverse: MockReverseGeoProvider;

  beforeEach(() => {
    mockIp = new MockIpGeoProvider("IN");
    mockReverse = new MockReverseGeoProvider("IN");
    defaultCountryVerifier.setIpGeoService(new IpGeoService(mockIp));
    defaultCountryVerifier.setReverseGeoService(new ReverseGeoService(mockReverse));
    defaultIpGeoService.setProvider(mockIp);
  });

  function createMockRes() {
    const res: any = {
      statusCode: 200,
      headers: {},
      sentJson: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      setHeader(k: string, v: string) {
        this.headers[k] = v;
      },
      json(data: any) {
        this.sentJson = data;
        return this;
      },
    };
    return res;
  }

  it("Returns HTTP 403 when selected country mismatches IP or GPS", async () => {
    mockIp.setDefaultCountry("US");
    mockReverse.setDefaultCountry("US");

    const req: any = {
      body: {
        full_name: "Test User",
        email: "test.mismatch@example.com",
        password: "password123",
        country: "IN India",
        gps: { latitude: 37.77, longitude: -122.41, accuracy: 10 },
      },
      ip: "8.8.8.8",
      headers: {},
      socket: { remoteAddress: "8.8.8.8" },
    };
    const res = createMockRes();

    await register(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.sentJson?.success, false);
    assert.equal(res.sentJson?.code, "COUNTRY_MISMATCH");
    // Ensure no sensitive coordinates or IPs are leaked in the error message
    assert.ok(!JSON.stringify(res.sentJson).includes("37.77"));
    assert.ok(!JSON.stringify(res.sentJson).includes("8.8.8.8"));
  });

  it("Returns HTTP 400 when GPS coordinates are omitted", async () => {
    const req: any = {
      body: {
        full_name: "Test User",
        email: "test.missing@example.com",
        password: "password123",
        country: "IN India",
        // gps omitted
      },
      ip: "103.21.124.1",
      headers: {},
      socket: { remoteAddress: "103.21.124.1" },
    };
    const res = createMockRes();

    await register(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.sentJson?.success, false);
    assert.equal(res.sentJson?.code, "INVALID_GEO_INPUT");
  });

  it("Returns HTTP 503 when geolocation service is unavailable", async () => {
    mockIp.setShouldFail(true);

    const req: any = {
      body: {
        full_name: "Test User",
        email: "test.down@example.com",
        password: "password123",
        country: "IN India",
        gps: { latitude: 13.08, longitude: 80.27, accuracy: 10 },
      },
      ip: "103.21.124.1",
      headers: {},
      socket: { remoteAddress: "103.21.124.1" },
    };
    const res = createMockRes();

    await register(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(res.sentJson?.success, false);
    assert.equal(res.sentJson?.code, "GEO_SERVICE_UNAVAILABLE");
  });

  it("Asserts TiDB database insert is NEVER invoked when register() fails verification", async () => {
    let dbInsertInvoked = false;
    let anyQueryInvoked = false;

    const pool = getDbPool();
    const originalQuery = pool.query;

    pool.query = async function (sql: any, ...args: any[]) {
      anyQueryInvoked = true;
      if (typeof sql === "string" && sql.toUpperCase().includes("INSERT INTO USERS")) {
        dbInsertInvoked = true;
      }
      return originalQuery.apply(this, [sql, ...args]);
    };

    try {
      mockIp.setDefaultCountry("US");
      mockReverse.setDefaultCountry("US");

      const req: any = {
        body: {
          full_name: "Blocked User",
          email: "blocked.mismatch.test@example.com",
          password: "password123",
          country: "IN India",
          gps: { latitude: 37.77, longitude: -122.41, accuracy: 10 },
        },
        ip: "8.8.8.8",
        headers: {},
        socket: { remoteAddress: "8.8.8.8" },
      };
      const res = createMockRes();

      await register(req, res);

      assert.equal(res.statusCode, 403);
      assert.equal(res.sentJson?.success, false);
      assert.equal(res.sentJson?.code, "COUNTRY_MISMATCH");

      // Critical Security Assertions:
      assert.equal(dbInsertInvoked, false, "TiDB INSERT INTO users must NEVER be invoked on verification failure!");
      assert.equal(anyQueryInvoked, false, "Zero TiDB database queries should be executed when verification fails!");
    } finally {
      pool.query = originalQuery;
    }
  });

  it("Successfully registers user when Selected === IP === GPS (India valid test with cleanup)", async () => {
    mockIp.setDefaultCountry("IN");
    mockReverse.setDefaultCountry("IN");

    const uniqueEmail = `test.verified.${Date.now()}@example.com`;
    const req: any = {
      body: {
        full_name: "Verified Seeker",
        email: uniqueEmail,
        password: "securePassword123!",
        country: "IN India",
        gps: { latitude: 13.08, longitude: 80.27, accuracy: 15 },
      },
      ip: "103.21.124.1",
      headers: {},
      socket: { remoteAddress: "103.21.124.1" },
    };
    const res = createMockRes();

    try {
      await register(req, res);

      assert.equal(res.statusCode, 201);
      assert.equal(res.sentJson?.success, true);
      assert.ok(res.sentJson?.token);
      assert.equal(res.sentJson?.user?.email, uniqueEmail);
    } finally {
      // Clean up test account from local store so no test clutter remains
      removeLocalUser(uniqueEmail);
    }
  });

  it("detectCountry endpoint correctly returns detected IP country code and display name", async () => {
    mockIp.setDefaultCountry("IN");
    const req: any = { ip: "103.21.124.1", headers: {}, socket: { remoteAddress: "103.21.124.1" } };
    const res = createMockRes();

    await detectCountry(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.sentJson?.success, true);
    assert.equal(res.sentJson?.countryCode, "IN");
    assert.equal(res.sentJson?.display, "IN India");
  });

  it("preVerifyLocation rejects Australia (AU) when client IP & GPS are in India (IN)", async () => {
    mockIp.setDefaultCountry("IN");
    mockReverse.setDefaultCountry("IN");

    const req: any = {
      body: {
        country: "AU Australia",
        gps: { latitude: 13.0827, longitude: 80.2707, accuracy: 15 },
      },
      ip: "103.21.124.1",
      headers: {},
      socket: { remoteAddress: "103.21.124.1" },
    };
    const res = createMockRes();

    await preVerifyLocation(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.sentJson?.success, false);
    assert.equal(res.sentJson?.verified, false);
    assert.equal(res.sentJson?.code, "COUNTRY_MISMATCH");
    assert.equal(res.sentJson?.selectedCountry, "AU");
    assert.equal(res.sentJson?.ipCountry, "IN");
    assert.equal(res.sentJson?.gpsCountry, "IN");
    assert.ok(res.sentJson?.message.includes("Country verification failed"));
  });

  it("preVerifyLocation succeeds when selected India matches IP & GPS India", async () => {
    mockIp.setDefaultCountry("IN");
    mockReverse.setDefaultCountry("IN");

    const req: any = {
      body: {
        country: "IN India",
        gps: { latitude: 13.0827, longitude: 80.2707, accuracy: 15 },
      },
      ip: "103.21.124.1",
      headers: {},
      socket: { remoteAddress: "103.21.124.1" },
    };
    const res = createMockRes();

    await preVerifyLocation(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.sentJson?.success, true);
    assert.equal(res.sentJson?.verified, true);
    assert.equal(res.sentJson?.selectedCountry, "IN");
    assert.equal(res.sentJson?.ipCountry, "IN");
    assert.equal(res.sentJson?.gpsCountry, "IN");
  });

  after(async () => {
    try {
      const pool = getDbPool();
      if (pool && typeof pool.end === "function") {
        await pool.end();
      }
    } catch {}
  });
});
