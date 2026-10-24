export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  programSlug: string;
  programTitle: string;
  amount: number;
  currency: string;
  status: "Completed" | "Pending" | "Refunded" | "Failed";
  paymentMethod: "Razorpay (UPI)" | "Razorpay (Card)" | "Stripe" | "Bank Transfer" | "UPI" | "Net Banking" | "Credit/Debit Card";
  transactionRef: string;
  createdAt: string;
  notes?: string;
}

const STORAGE_KEY = "kriya_admin_orders_v1";

const SEED_ORDERS: OrderItem[] = [
  {
    id: "ord_mrg_01",
    orderNumber: "ORD-2026-9501",
    customerName: "Murugan Anand",
    customerEmail: "murugan.kriya@gmail.com",
    customerPhone: "+91 98401 77889",
    programSlug: "prg_1",
    programTitle: "Inner Awakening Kriya",
    amount: 4999,
    currency: "INR",
    status: "Completed",
    paymentMethod: "UPI",
    transactionRef: "pay_upi_mrg_01",
    createdAt: "2026-10-23T08:00:00Z",
    notes: "Direct sacred enrollment.",
  },
  {
    id: "ord_mrg_02",
    orderNumber: "ORD-2026-9502",
    customerName: "Murugan Anand",
    customerEmail: "murugan.kriya@gmail.com",
    customerPhone: "+91 98401 77889",
    programSlug: "prg_2",
    programTitle: "Advanced Pranayama",
    amount: 7999,
    currency: "INR",
    status: "Completed",
    paymentMethod: "UPI",
    transactionRef: "pay_upi_mrg_02",
    createdAt: "2026-10-23T08:30:00Z",
    notes: "Direct sacred enrollment.",
  },
  {
    id: "ord_mrg_03",
    orderNumber: "ORD-2026-9503",
    customerName: "Murugan Anand",
    customerEmail: "murugan.kriya@gmail.com",
    customerPhone: "+91 98401 77889",
    programSlug: "prg_3",
    programTitle: "Himalayan Retreat",
    amount: 25000,
    currency: "INR",
    status: "Completed",
    paymentMethod: "UPI",
    transactionRef: "pay_upi_mrg_03",
    createdAt: "2026-10-23T09:00:00Z",
    notes: "Direct sacred enrollment.",
  },
  {
    id: "ord_mrg_04",
    orderNumber: "ORD-2026-9504",
    customerName: "Murugan Anand",
    customerEmail: "murugan.kriya@gmail.com",
    customerPhone: "+91 98401 77889",
    programSlug: "prg_4",
    programTitle: "Foundation Weekend Workshop",
    amount: 1999,
    currency: "INR",
    status: "Completed",
    paymentMethod: "UPI",
    transactionRef: "pay_upi_mrg_04",
    createdAt: "2026-10-23T09:30:00Z",
    notes: "Direct sacred enrollment.",
  },
  {
    id: "ord_101",
    orderNumber: "ORD-2026-9041",
    customerName: "Senthil Kumar",
    customerEmail: "senthil.k@gmail.com",
    customerPhone: "+91 98401 23456",
    programSlug: "prg_1",
    programTitle: "Inner Awakening Kriya — Intensive 3-Week Online",
    amount: 4999,
    currency: "INR",
    status: "Completed",
    paymentMethod: "Razorpay (UPI)",
    transactionRef: "pay_rzp_994821a",
    createdAt: "2026-10-21T09:30:00Z",
    notes: "Payment verified via UPI auto-confirmation.",
  },
  {
    id: "ord_102",
    orderNumber: "ORD-2026-9042",
    customerName: "Deepa Narayanan",
    customerEmail: "deepa.n@outlook.com",
    customerPhone: "+91 94440 98765",
    programSlug: "prg_2",
    programTitle: "Pranayama Vayu Intensive — Subtle Spine Energy",
    amount: 7999,
    currency: "INR",
    status: "Completed",
    paymentMethod: "Razorpay (Card)",
    transactionRef: "pay_rzp_883190b",
    createdAt: "2026-10-20T14:15:00Z",
    notes: "Enrolled with Sadhana Journal Kit package.",
  },
  {
    id: "ord_103",
    orderNumber: "ORD-2026-9043",
    customerName: "Rajesh Kannan",
    customerEmail: "rajesh.k@gmail.com",
    customerPhone: "+91 98840 55112",
    programSlug: "prg_4",
    programTitle: "Foundation Weekend Workshop — Chennai Offline",
    amount: 1999,
    currency: "INR",
    status: "Completed",
    paymentMethod: "Razorpay (UPI)",
    transactionRef: "pay_rzp_774921c",
    createdAt: "2026-10-19T18:45:00Z",
  },
  {
    id: "ord_104",
    orderNumber: "ORD-2026-9044",
    customerName: "Ananya Iyer",
    customerEmail: "ananya.iyer@gmail.com",
    customerPhone: "+91 97909 33221",
    programSlug: "prg_1",
    programTitle: "Inner Awakening Kriya — Intensive 3-Week Online",
    amount: 4999,
    currency: "INR",
    status: "Refunded",
    paymentMethod: "Razorpay (UPI)",
    transactionRef: "pay_rzp_662810d",
    createdAt: "2026-10-18T11:20:00Z",
    notes: "Refunded 100% per pre-session cancellation policy.",
  },
  {
    id: "ord_105",
    orderNumber: "ORD-2026-9045",
    customerName: "Karthik Subramanian",
    customerEmail: "karthik.s@yahoo.com",
    customerPhone: "+91 98410 77889",
    programSlug: "prg_3",
    programTitle: "Himalayan Sadhana Immersion Retreat",
    amount: 25000,
    currency: "INR",
    status: "Pending",
    paymentMethod: "Bank Transfer",
    transactionRef: "neft_bank_44210",
    createdAt: "2026-10-22T08:00:00Z",
    notes: "Awaiting bank clearance proof verification.",
  },
  {
    id: "ord_106",
    orderNumber: "ORD-2026-9038",
    customerName: "Vijayakumar Govindaraj",
    customerEmail: "vijay.g@gmail.com",
    customerPhone: "+91 94421 55667",
    programSlug: "prg_4",
    programTitle: "Foundation Weekend Workshop — Chennai Offline",
    amount: 1999,
    currency: "INR",
    status: "Pending",
    paymentMethod: "Razorpay (UPI)",
    transactionRef: "pay_rzp_551920e",
    createdAt: "2026-10-21T16:20:00Z",
    notes: "Refund Requested: Dropped program due to official duty outside TN.",
  },
];

export function getStoredOrders(): OrderItem[] {
  if (typeof window === "undefined") return SEED_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    const orders: OrderItem[] = JSON.parse(raw);
    let updated = false;
    for (const seed of SEED_ORDERS) {
      if (!orders.some((o) => o.id === seed.id || o.orderNumber === seed.orderNumber)) {
        orders.push(seed);
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
    return orders;
  } catch {
    return SEED_ORDERS;
  }
}

export function saveStoredOrders(orders: OrderItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event("kriya_orders_updated"));
  } catch (e) {
    console.error("Failed to save orders:", e);
  }
}

export async function fetchAllOrders(): Promise<OrderItem[]> {
  return getStoredOrders();
}

export async function updateOrderStatus(orderId: string, status: OrderItem["status"]): Promise<boolean> {
  const list = getStoredOrders();
  const idx = list.findIndex((o) => o.id === orderId);
  const existing = list[idx];
  if (!existing) return false;
  list[idx] = { ...existing, status };
  saveStoredOrders(list);
  return true;
}

export async function recordNewOrder(order: Omit<OrderItem, "id" | "createdAt" | "orderNumber">): Promise<OrderItem> {
  const list = getStoredOrders();
  const newOrder: OrderItem = {
    ...order,
    id: "ord_" + Date.now(),
    orderNumber: "ORD-2026-" + Math.floor(1000 + Math.random() * 9000),
    createdAt: new Date().toISOString(),
  };
  list.unshift(newOrder);
  saveStoredOrders(list);

  // Trigger live Admin notification & chime
  try {
    const { pushNotification } = await import("./notifications-store");
    pushNotification({
      type: "order",
      title: `New Order: ₹${newOrder.amount.toLocaleString("en-IN")}`,
      message: `${newOrder.customerName} enrolled in ${newOrder.programTitle}`,
      link: `/admin/orders?search=${encodeURIComponent(newOrder.customerName)}`,
      amount: newOrder.amount,
    });
  } catch (e) {
    console.warn("Notification trigger notice:", e);
  }

  return newOrder;
}
