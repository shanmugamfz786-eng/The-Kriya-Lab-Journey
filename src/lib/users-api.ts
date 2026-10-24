import { getStoredOrders } from "./orders-api";

export interface SeekerProgramItem {
  slug: string;
  title: string;
  orderNumber?: string;
  amount?: number;
  currency?: string;
  date: string;
  status: string;
}

export interface SeekerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  programs: SeekerProgramItem[];
  totalOrders: number;
  totalSpent: number;
  date: string;
  status: "Pending Review" | "Approved" | "Initiated";
  experience: string;
  location?: string | undefined;
  motivation?: string | undefined;
}

export const API_URL = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:5000";

const DELETED_USERS_KEY = "kriya_admin_deleted_users_v1";

function getDeletedUserIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markUserAsDeleted(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const deleted = getDeletedUserIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(deleted));
    }
  } catch (e) {
    console.error("Failed to mark user deleted:", e);
  }
}

export async function fetchAllUsers(): Promise<SeekerItem[]> {
  const deletedIds = getDeletedUserIds();

  // 1. Group all orders by customer email so every purchased program is preserved
  const orders = getStoredOrders();
  const ordersByEmail = new Map<string, typeof orders>();

  orders.forEach((o) => {
    const em = (o.customerEmail || "").toLowerCase().trim();
    if (!em) return;
    const existingList = ordersByEmail.get(em) || [];
    existingList.push(o);
    ordersByEmail.set(em, existingList);
  });

  const seekersMap = new Map<string, SeekerItem>();
  let userCounter = 1;

  ordersByEmail.forEach((userOrders, email) => {
    // Sort orders by most recent
    const sorted = [...userOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const primary = sorted[0];
    if (!primary) return;

    const programsList: SeekerProgramItem[] = sorted.map((o) => ({
      slug: o.programSlug,
      title: o.programTitle,
      orderNumber: o.orderNumber,
      amount: o.amount,
      currency: o.currency,
      date: new Date(o.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: o.status,
    }));

    const totalSpent = sorted.reduce(
      (acc, curr) => (curr.status === "Completed" ? acc + curr.amount : acc),
      0
    );
    const hasCompleted = sorted.some((o) => o.status === "Completed");

    seekersMap.set(email, {
      id: `KL_${String(userCounter++).padStart(3, "0")}`,
      name: primary.customerName,
      email: primary.customerEmail,
      phone: primary.customerPhone || "+91 98401 23456",
      program: primary.programTitle,
      programs: programsList,
      totalOrders: sorted.length,
      totalSpent,
      date: new Date(primary.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: hasCompleted ? "Initiated" : "Pending Review",
      experience: "Pranayama & Subtle Meditation Practitioner",
      location: "Tamil Nadu, India",
      motivation: "Devoted seeker enrolled in sacred initiation through the portal.",
    });
  });

  // 2. Add demo platform student if not already present
  const demoEmail = "user@thekriyalab.com";
  if (!seekersMap.has(demoEmail)) {
    seekersMap.set(demoEmail, {
      id: `KL_006`,
      name: "Demo Student",
      email: demoEmail,
      phone: "+91 98400 11223",
      program: "Inner Awakening Kriya",
      programs: [
        {
          slug: "prg_1",
          title: "Inner Awakening Kriya",
          orderNumber: "ORD-DEMO-001",
          amount: 4999,
          currency: "INR",
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          status: "Completed",
        },
      ],
      totalOrders: 1,
      totalSpent: 4999,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "Initiated",
      experience: "Practicing Kriya Pranayama daily",
      location: "Chennai, Tamil Nadu",
      motivation: "Dedicated to Mahavatar Babaji lineage teachings.",
    });
  }

  // 3. Fetch registered users from backend API and merge
  try {
    const res = await fetch(`${API_URL}/api/users`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        data.users
          .filter((u: any) => String(u.role).toLowerCase() !== "admin")
          .forEach((u: any) => {
            const emailKey = String(u.email || "").toLowerCase().trim();
            const existing = seekersMap.get(emailKey);
            if (existing) {
              existing.id = u.id || existing.id;
              if (u.full_name) existing.name = u.full_name;
            } else {
              seekersMap.set(emailKey, {
                id: u.id || `KL_${String(userCounter++).padStart(3, "0")}`,
                name: u.full_name || "Platform Seeker",
                email: u.email,
                phone: "+91 98400 99887",
                program: "Inner Awakening Kriya",
                programs: [
                  {
                    slug: "prg_1",
                    title: "Inner Awakening Kriya",
                    date: new Date(u.created_at || Date.now()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                    status: "Completed",
                  },
                ],
                totalOrders: 1,
                totalSpent: 0,
                date: new Date(u.created_at || Date.now()).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                status: "Approved",
                experience: "Spiritual Aspirant",
                location: "Tamil Nadu, India",
                motivation: "Joined THE KRIYA LAB platform.",
              });
            }
          });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch users from backend, using local store:", err);
  }

  // Filter out any locally deleted users
  const allSeekers = Array.from(seekersMap.values()).filter(
    (s) => !deletedIds.includes(s.id) && !deletedIds.includes(s.email)
  );

  return allSeekers;
}

export async function deleteUserApi(id: string): Promise<boolean> {
  // Mark in local deleted list
  markUserAsDeleted(id);

  try {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    console.warn("Backend delete notice:", e);
  }
  return true;
}
