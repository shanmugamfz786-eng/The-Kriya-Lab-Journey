import { Request, Response, NextFunction } from "express";
import { extractClientIp } from "../services/geo/ip-geo.service.js";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);
if (cleanupTimer && typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

/**
 * In-memory rate limiter middleware for registration endpoint.
 * Allows maxRequests per windowMs per IP address.
 */
export function registrationRateLimiter(options?: { windowMs?: number; maxRequests?: number }) {
  const windowMs = options?.windowMs || 15 * 60 * 1000; // 15 minutes default
  const maxRequests = options?.maxRequests || 15; // 15 registrations per 15 min per IP

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting during automated testing
    if (process.env.NODE_ENV === "test") {
      return next();
    }

    const clientIp = extractClientIp(req) || "unknown";
    const now = Date.now();

    const record = rateLimitMap.get(clientIp);
    if (!record || now > record.resetTime) {
      rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        success: false,
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many registration attempts from this IP address. Please try again later.",
      });
    }

    next();
  };
}
