export interface RefundItem {
  id: string;
  orderNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | undefined;
  programTitle: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Confirm" | "Reject";
  requestedDate: string;
  processedDate?: string | undefined;
  adminNotes?: string | undefined;
}

const STORAGE_KEY = "kriya_admin_refunds_v2";

const SEED_REFUNDS: RefundItem[] = [
  {
    id: "ref_101",
    orderNumber: "ORD-2026-9044",
    studentName: "Ananya Iyer",
    studentEmail: "ananya.iyer@gmail.com",
    studentPhone: "+91 97909 33221",
    programTitle: "Inner Awakening Kriya — Intensive 3-Week Online",
    amount: 4999,
    reason: "Family travel emergency clashed with online batch dates. Requested refund 48 hours before commencement.",
    status: "Confirm",
    requestedDate: "2026-10-18T10:00:00Z",
    processedDate: "2026-10-18T11:20:00Z",
    adminNotes: "Approved under 100% pre-session cancellation policy. UPI reversal completed.",
  },
  {
    id: "ref_102",
    orderNumber: "ORD-2026-9038",
    studentName: "Vijayakumar Govindaraj",
    studentEmail: "vijay.g@gmail.com",
    studentPhone: "+91 94421 55667",
    programTitle: "Foundation Weekend Workshop — Chennai Offline",
    amount: 1999,
    reason: "Sudden official duty outside Tamil Nadu. Requested to either transfer to next batch or refund.",
    status: "Pending",
    requestedDate: "2026-10-22T09:15:00Z",
    adminNotes: "Waiting for admin refund review and disbursement.",
  },
  {
    id: "ref_103",
    orderNumber: "ORD-2026-9042",
    studentName: "Deepa Narayanan",
    studentEmail: "deepa.n@outlook.com",
    studentPhone: "+91 94440 98765",
    programTitle: "Pranayama Vayu Intensive — Subtle Spine Energy",
    amount: 7999,
    reason: "Customer requested refund after attending 2 full weeks of online classes.",
    status: "Reject",
    requestedDate: "2026-10-21T12:00:00Z",
    processedDate: "2026-10-21T15:30:00Z",
    adminNotes: "Rejected per refund policy terms (attended >50% of the live session curriculum).",
  },
];

export function getStoredRefunds(): RefundItem[] {
  if (typeof window === "undefined") return SEED_REFUNDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REFUNDS));
      return SEED_REFUNDS;
    }
    const refunds: RefundItem[] = JSON.parse(raw);
    let updated = false;
    for (const seed of SEED_REFUNDS) {
      if (!refunds.some((r) => r.id === seed.id || r.orderNumber === seed.orderNumber)) {
        refunds.push(seed);
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(refunds));
    }
    return refunds;
  } catch {
    return SEED_REFUNDS;
  }
}

export function saveStoredRefunds(items: RefundItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("kriya_refunds_updated"));
  } catch (e) {
    console.error("Failed to save refunds:", e);
  }
}

export async function fetchAllRefunds(): Promise<RefundItem[]> {
  return getStoredRefunds();
}

export async function processRefundDecision(
  id: string,
  decision: "Confirm" | "Reject" | "Approved" | "Rejected",
  adminNotes?: string
): Promise<boolean> {
  const list = getStoredRefunds();
  const idx = list.findIndex((r) => r.id === id);
  const existing = list[idx];
  if (!existing) return false;
  const canonicalDecision: "Confirm" | "Reject" = 
    (decision === "Approved" || decision === "Confirm") ? "Confirm" : "Reject";
  list[idx] = {
    ...existing,
    status: canonicalDecision,
    processedDate: new Date().toISOString(),
    adminNotes: adminNotes || existing.adminNotes,
  };
  saveStoredRefunds(list);
  return true;
}
