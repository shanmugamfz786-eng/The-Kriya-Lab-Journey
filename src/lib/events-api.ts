export interface EventItem {
  id: string;
  title: string;
  description: string;
  title_ta?: string;
  description_ta?: string;
  image_url: string;
  google_form_link: string;
  event_type: "past" | "future";
  event_date?: string;
  event_date_ta?: string;
  location?: string;
  location_ta?: string;
  created_at?: string;
}

export const API_URL = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:5000";

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt_past_01",
    title: "1st Kriya Initiation & Sacred Darshan",
    description: "Sacred transmission of 1st Kriya keys, pranayama secrets, and Babaji lineage blessings.",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
    google_form_link: "https://forms.gle/samplePastForm1",
    event_type: "past",
    event_date: "Aug 15, 2026",
    location: "Mylapore Center, Chennai",
  },
  {
    id: "evt_past_02",
    title: "Pranayama Vayu Intensive Retreat",
    description: "Deep dive into 12 spine energy currents and breath mastery under master supervision.",
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80",
    google_form_link: "https://forms.gle/samplePastForm2",
    event_type: "past",
    event_date: "Jul 20, 2026",
    location: "Velliangiri Ashram, Coimbatore",
  },
  {
    id: "evt_future_01",
    title: "Chennai Sacred Satsang & Kriya Diksha",
    description: "Direct in-person initiation into the lineage of Mahavatar Babaji with holy diksha.",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
    google_form_link: "https://forms.gle/chennaiDiksha2026",
    event_type: "future",
    event_date: "Oct 15, 2026 • 09:00 AM",
    location: "The Kriya Lab Center, Chennai",
  },
  {
    id: "evt_future_02",
    title: "Global Online Babaji Darshan & Q&A Session",
    description: "Live interactive Satsang and Q&A on subtle spine meditation for international sadhakas.",
    image_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
    google_form_link: "https://forms.gle/onlineBabajiSession",
    event_type: "future",
    event_date: "Oct 22, 2026 • 07:00 PM IST",
    location: "Zoom Cloud Webinar",
  },
];

export async function fetchAllEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/events`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        return data.events;
      }
    }
  } catch (err) {
    console.warn("Backend events fetch fallback to initial events", err);
  }
  return INITIAL_EVENTS;
}

export async function createEventApi(payload: Omit<EventItem, "id">): Promise<EventItem> {
  const res = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    const data = await res.json();
    return data.event;
  }
  return {
    ...payload,
    id: "evt_" + Date.now(),
  };
}

export async function updateEventApi(id: string, payload: Partial<EventItem>): Promise<EventItem | null> {
  const res = await fetch(`${API_URL}/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json();
    return data.event || null;
  }
  return null;
}

export async function deleteEventApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/events/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function uploadEventImageApi(base64: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/events/upload-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64 }),
  });
  if (res.ok) {
    const data = await res.json();
    return data.url || base64;
  }
  return base64;
}
