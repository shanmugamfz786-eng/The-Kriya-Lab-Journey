import { describe, it, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { register } from "../src/controllers/auth.controller.js";
import { getDbPool } from "../src/config/db.js";
import {
  defaultCountryVerifier,
} from "../src/services/geo/country-verifier.service.js";
import {
  MockIpGeoProvider,
  IpGeoService,
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

  it("Successfully registers user when Selected === IP === GPS", async () => {
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

    await register(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.sentJson?.success, true);
    assert.ok(res.sentJson?.token);
    assert.equal(res.sentJson?.user?.email, uniqueEmail);
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
