export interface AdminNotification {
  id: string;
  type: "order" | "enquiry" | "refund";
  title: string;
  message: string;
  link: string;
  amount?: number | undefined;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = "kriya_admin_notifications_v6";

const SEED_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif_1",
    type: "order",
    title: "New Order: ₹4,999",
    message: "Senthil Kumar purchased Inner Awakening Kriya",
    link: "/admin/orders?filter=new",
    amount: 4999,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif_3",
    type: "refund",
    title: "Refund Request: Dropped Program",
    message: "Vijayakumar dropped Foundation Weekend Workshop (Refund Pending)",
    link: "/admin/orders?filter=pending",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
];

export function getStoredNotifications(): AdminNotification[] {
  if (typeof window === "undefined") return SEED_NOTIFICATIONS;
  try {
    // Purge legacy caches
    localStorage.removeItem("kriya_admin_notifications_v1");
    localStorage.removeItem("kriya_admin_notifications_v2");
    localStorage.removeItem("kriya_admin_notifications_v3");
    localStorage.removeItem("kriya_admin_notifications_v4");
    localStorage.removeItem("kriya_admin_notifications_v5");

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    const parsed: AdminNotification[] = JSON.parse(raw);
    const sanitized = parsed
      .filter((n) => n.type !== "enquiry" && n.id !== "notif_2" && !n.title.toLowerCase().includes("inquir"))
      .map((n) => {
        let link = n.link || "/admin/orders";
        if (n.type === "refund" || link.includes("refund")) {
          link = "/admin/orders?filter=pending";
        } else if (n.type === "order") {
          link = "/admin/orders?filter=new";
        }
        return {
          ...n,
          link,
        };
      });
    if (sanitized.length !== parsed.length || JSON.stringify(sanitized) !== raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: AdminNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new Event("kriya_notifications_updated"));
  } catch (e) {
    console.error("Failed to save notifications:", e);
  }
}

/** Plays a gentle, pleasant dual-tone chime using Web Audio API */
export function playChimeSound(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Tone 1 (High bell)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Tone 2 (Higher harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    // Audio might be blocked if no user interaction yet, silently ignore
  }
}

export function pushNotification(
  notif: Omit<AdminNotification, "id" | "createdAt" | "read">
): AdminNotification {
  const list = getStoredNotifications();
  const link =
    notif.type === "refund" || notif.link.includes("refund")
      ? "/admin/orders?filter=pending"
      : "/admin/orders?filter=new";
  const item: AdminNotification = {
    ...notif,
    id: "notif_" + Date.now(),
    createdAt: new Date().toISOString(),
    read: false,
    link,
  };
  list.unshift(item);
  saveStoredNotifications(list);

  // Play audio chime
  playChimeSound();

  // Dispatch toast event
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kriya_toast_alert", {
        detail: item,
      })
    );
  }

  return item;
}

export function markNotificationRead(id: string): void {
  const list = getStoredNotifications();
  const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveStoredNotifications(updated);
}

export function markAllNotificationsRead(): void {
  const list = getStoredNotifications();
  const updated = list.map((n) => ({ ...n, read: true }));
  saveStoredNotifications(updated);
}
