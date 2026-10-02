import { createServerFn } from "@tanstack/react-start";

export type PublicEvent = {
  id: string;
  title_en: string;
  title_ta: string;
  description_en: string;
  description_ta: string;
  event_date: string;
  event_date_ta?: string;
  start_time?: string;
  end_time?: string;
  venue_en: string;
  venue_ta: string;
  sort_order: number;
  image_url?: string;
  google_form_link?: string;
  event_type: "past" | "future";
};

/** Public read of published events. Safe for SSR/prerender. */
export const listPublicEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicEvent[]> => {
    try {
      // Because this runs on the server, we can fetch from the backend API directly.
      const apiUrl = process.env['VITE_API_URL'] || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/events`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.events)) {
          return data.events.map((e: any, index: number) => ({
            id: e.id,
            title_en: e.title || "",
            title_ta: e.title_ta || "",
            description_en: e.description || "",
            description_ta: e.description_ta || "",
            event_date: e.event_date || "",
            event_date_ta: e.event_date_ta || "",
            start_time: "", // Our backend currently stores time inside event_date
            end_time: "",
            venue_en: e.location || "",
            venue_ta: e.location_ta || "",
            sort_order: index,
            image_url: e.image_url || "",
            google_form_link: e.google_form_link || "",
            event_type: e.event_type || "future"
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch events for public site", err);
    }
    return [];
  },
);

