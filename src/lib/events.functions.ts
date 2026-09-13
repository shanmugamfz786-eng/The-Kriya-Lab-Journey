import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export type PublicEvent = {
  id: string;
  title_en: string;
  title_ta: string;
  description_en: string;
  description_ta: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_en: string;
  venue_ta: string;
  sort_order: number;
};

/** Public, unauthenticated read of published events. Safe for SSR/prerender. */
export const listPublicEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicEvent[]> => {
    const supabase = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("events")
      .select(
        "id,title_en,title_ta,description_en,description_ta,event_date,start_time,end_time,venue_en,venue_ta,sort_order",
      )
      .eq("is_published", true)
      .order("event_date", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as PublicEvent[];
  },
);
