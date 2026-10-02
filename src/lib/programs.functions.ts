import { createServerFn } from "@tanstack/react-start";
import { type ProgramItem } from "./programs-api";

/** Public read of published programs. Safe for SSR/prerender. */
export const listPublicPrograms = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProgramItem[]> => {
    try {
      const apiUrl = process.env['VITE_API_URL'] || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/programs`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.programs)) {
          return data.programs as ProgramItem[];
        }
      }
    } catch (err) {
      console.warn("Failed to fetch programs for public site", err);
    }
    return [];
  },
);
