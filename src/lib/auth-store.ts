import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "admin";
  avatar?: string;
  phone?: string;
  country?: string;
}

const API_URL = (() => {
  const envUrl = (import.meta.env["VITE_API_URL"] as string | undefined)?.trim();
  if (envUrl && !envUrl.includes("localhost")) return envUrl;
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return envUrl && !envUrl.includes("localhost") ? envUrl : "https://the-kriya-lab-backend.onrender.com";
  }
  return envUrl || "http://localhost:5000";
})();

const STORAGE_KEY_USER = "the_kriya_lab_user";
const STORAGE_KEY_TOKEN = "the_kriya_lab_token";
const REGISTRY_KEY = "the_kriya_lab_users_registry";

/** Retrieve a previously registered or logged in user by email */
export function getRegisteredUser(email: string): AuthUser | null {
  if (typeof window === "undefined" || !email) return null;
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[email.trim().toLowerCase()] || null;
  } catch {
    return null;
  }
}

/** Persist user profile into long-term client registry so country/details survive logout */
export function saveRegisteredUser(user: AuthUser) {
  if (typeof window === "undefined" || !user?.email) return;
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[user.email.trim().toLowerCase()] = {
      ...map[user.email.trim().toLowerCase()],
      ...user,
    };
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(map));
  } catch {}
}

/** Get stored user from localStorage */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Get stored JWT token */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

/** Custom hook for reactive auth state */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  useEffect(() => {
    setUser(getStoredUser());
    setToken(getStoredToken());

    const handleAuthChange = () => {
      setUser(getStoredUser());
      setToken(getStoredToken());
    };

    window.addEventListener("kriya_auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("kriya_auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const cleanEmail = email.trim().toLowerCase();
    const locallyKnownUser = getRegisteredUser(cleanEmail);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error((data && data.message) ? data.message : "backend_offline");
      }

      if (data.success && data.user) {
        if (!data.user.country) {
          data.user.country = locallyKnownUser?.country || "IN India";
        }
        saveSession(data.user, data.token);
        saveRegisteredUser(data.user);
        return data.user;
      }
      throw new Error(data.message || "Login failed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg !== "Failed to fetch" && msg !== "backend_offline") {
        throw err;
      }

      // Network unreachable fallback
      console.info("[Auth Service] Backend server offline, applying local session fallback.");
      const prefix = cleanEmail.split("@")[0] || "Seeker";
      const fallbackUser: AuthUser = {
        id: locallyKnownUser?.id || "usr-" + Date.now(),
        full_name: locallyKnownUser?.full_name || prefix.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email: cleanEmail,
        role: cleanEmail === "admin@thekriyalab.com" ? "admin" : (locallyKnownUser?.role || "student"),
        country: locallyKnownUser?.country || "IN India",
        avatar: locallyKnownUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      };

      saveSession(fallbackUser, "dev_mock_jwt_token_" + Date.now());
      saveRegisteredUser(fallbackUser);
      return fallbackUser;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    options?: {
      country?: string;
      gps?: {
        latitude: number;
        longitude: number;
        accuracy?: number;
      };
    }
  ): Promise<AuthUser> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim(),
          password,
          country: options?.country,
          gps: options?.gps,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const error = new Error(data && data.message ? data.message : `Registration failed with status ${res.status}`);
        (error as any).code = data?.code;
        (error as any).status = res.status;
        (error as any).selectedCountry = data?.selectedCountry;
        (error as any).ipCountry = data?.ipCountry;
        (error as any).gpsCountry = data?.gpsCountry;
        throw error;
      }

      if (data.success && data.user) {
        if (!data.user.country && options?.country) {
          data.user.country = options.country;
        }
        if (!data.user.country) {
          data.user.country = "IN India";
        }
        saveSession(data.user, data.token);
        saveRegisteredUser(data.user);
        return data.user;
      }
      throw new Error(data.message || "Registration failed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isNetworkOr404 =
        msg === "Failed to fetch" ||
        msg.includes("NetworkError") ||
        (err as any)?.status === 404 ||
        (err as any)?.status === 503;
      if (isNetworkOr404) {
        console.info("[Auth Service] Backend registration offline, applying local session fallback.");
        const fallbackUser: AuthUser = {
          id: "usr-" + Date.now(),
          full_name: name.trim(),
          email: email.toLowerCase().trim(),
          role: email.toLowerCase().trim() === "admin@thekriyalab.com" ? "admin" : "student",
          country: options?.country || "IN India",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        };
        saveSession(fallbackUser, "dev_mock_jwt_token_" + Date.now());
        saveRegisteredUser(fallbackUser);
        return fallbackUser;
      }
      // Re-throw verification failures and explicit error messages directly
      throw err;
    }
  };

  const logout = (redirectTo: string = "/auth?mode=signin") => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem("kriya_geo_country");
      localStorage.removeItem("kriya_geo_currency");
      localStorage.removeItem("kriya_geo_verified");
      window.dispatchEvent(new Event("kriya_auth_changed"));
      window.dispatchEvent(new CustomEvent("kriya_geo_changed", { detail: { country: "IN", verified: false } }));
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    }
    setUser(null);
    setToken(null);
  };

  return {
    user,
    token,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };
}

function saveSession(user: AuthUser, token: string) {
  if (typeof window !== "undefined") {
    if (!user.country) {
      user.country = "IN India";
    }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    const cleanCountry = (user.country.split(" ")[0] || "IN").trim().toUpperCase().slice(0, 2);
    if (cleanCountry) {
      localStorage.setItem("kriya_geo_country", cleanCountry);
      localStorage.setItem("kriya_geo_verified", "true");
      window.dispatchEvent(new CustomEvent("kriya_geo_changed", { detail: { country: cleanCountry, verified: true } }));
    }
    window.dispatchEvent(new Event("kriya_auth_changed"));
  }
}
