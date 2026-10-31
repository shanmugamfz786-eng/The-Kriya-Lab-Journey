import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, Fragment } from "react";
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  FileText,
  X,
  Mail,
  Phone,
  ArrowUpRight,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  List,
  Trash2,
} from "lucide-react";
import {
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  deleteOrdersByCustomerEmail,
  type OrderItem,
} from "@/lib/orders-api";
import { fetchAllUsers } from "@/lib/users-api";
import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";
import { markAllNotificationsRead } from "@/lib/notifications-store";

export interface GroupedCustomerOrders {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | undefined;
  totalAmount: number;
  currency: string;
  orderCount: number;
  latestDate: string;
  status: OrderItem["status"];
  paymentMethods: string[];
  orders: OrderItem[];
}

export const Route = createFileRoute("/admin/orders")({
  staticData: { sitemap: false },
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>
  ): {
    search?: string | undefined;
    orderId?: string | undefined;
    filter?: string | undefined;
    status?: string | undefined;
  } => ({
    search: typeof search["search"] === "string" ? (search["search"] as string) : undefined,
    orderId: typeof search["orderId"] === "string" ? (search["orderId"] as string) : undefined,
    filter: typeof search["filter"] === "string" ? (search["filter"] as string) : undefined,
    status: typeof search["status"] === "string" ? (search["status"] as string) : undefined,
  }),
  component: AdminOrdersPage,
});

const isRecentOrder = (dateString: string): boolean => {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    return diff >= 0 && diff < 48 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

function AdminOrdersPage() {
  const query = Route.useSearch();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [seekerIdMap, setSeekerIdMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query.search || "");

  const resolveStatusFromQuery = () => {
    const raw = (query.filter || query.status || "").toLowerCase().trim();
    if (raw === "new") return "New";
    if (raw === "pending" || raw === "refund" || raw === "refunds") return "Pending";
    if (raw === "completed") return "Completed";
    if (raw === "refunded") return "Refunded";
    return "All";
  };

  const [statusFilter, setStatusFilter] = useState<string>(resolveStatusFromQuery());
  const [selectedGroup, setSelectedGroup] = useState<GroupedCustomerOrders | null>(null);
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

  const STORAGE_VIEWED_TABS = "kriya_viewed_order_tabs_v2";

  const [viewedTabs, setViewedTabs] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_VIEWED_TABS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const markTabAsViewed = (tabKey: string) => {
    const key = tabKey.toLowerCase().trim();
    setViewedTabs((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      try {
        localStorage.setItem(STORAGE_VIEWED_TABS, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (key === "new" || key === "pending" || key === "all") {
      markAllNotificationsRead();
    }
  };

  const isTabSeen = (tabKey: string): boolean => {
    return Boolean(viewedTabs[tabKey.toLowerCase().trim()]);
  };

  const handleTabClick = (tab: "All" | "New" | "Pending" | "Completed" | "Refunded") => {
    setStatusFilter(tab);
    setSearchTerm("");
    markTabAsViewed(tab);
  };

  useEffect(() => {
    if (statusFilter) {
      markTabAsViewed(statusFilter);
    }
  }, [statusFilter]);

  useEffect(() => {
    setSearchTerm(query.search || "");
  }, [query.search]);

  useEffect(() => {
    const s = resolveStatusFromQuery();
    setStatusFilter(s);
    markTabAsViewed(s);
  }, [query.filter, query.status]);

  const loadData = () => {
    Promise.all([fetchAllOrders(), fetchAllUsers()]).then(([ordersData, usersData]) => {
      setOrders(ordersData);
      const map: Record<string, string> = {};
      usersData.forEach((u) => {
        if (u.email) {
          map[u.email.toLowerCase().trim()] = u.id;
        }
      });
      setSeekerIdMap(map);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();

    const handler = () => {
      loadData();
    };
    window.addEventListener("kriya_orders_updated", handler);
    return () => window.removeEventListener("kriya_orders_updated", handler);
  }, []);

  // Consolidate all orders under 1 single ID per customer
  const groupedOrders: GroupedCustomerOrders[] = useMemo(() => {
    const map = new Map<string, OrderItem[]>();
    orders.forEach((o) => {
      const email = (o.customerEmail || "").toLowerCase().trim();
      const list = map.get(email) || [];
      list.push(o);
      map.set(email, list);
    });

    const groups: GroupedCustomerOrders[] = [];
    map.forEach((userOrders, email) => {
      const sorted = [...userOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const primary = sorted[0]!;
      const totalAmount = sorted.reduce(
        (acc, curr) => (curr.status === "Completed" ? acc + curr.amount : acc),
        0
      );
      const allCompleted = sorted.every((o) => o.status === "Completed");
      const anyPending = sorted.some((o) => o.status === "Pending");
      const status: OrderItem["status"] = anyPending
        ? "Pending"
        : allCompleted
        ? "Completed"
        : sorted.some((o) => o.status === "Refunded")
        ? "Refunded"
        : primary.status;

      const methods = Array.from(new Set(sorted.map((o) => o.paymentMethod)));
      const assignedId = seekerIdMap[email] || primary.orderNumber;

      groups.push({
        customerId: assignedId,
        customerName: primary.customerName,
        customerEmail: primary.customerEmail,
        customerPhone: primary.customerPhone,
        totalAmount: totalAmount || sorted.reduce((acc, curr) => acc + curr.amount, 0),
        currency: primary.currency || "INR",
        orderCount: sorted.length,
        latestDate: primary.createdAt,
        status,
        paymentMethods: methods,
        orders: sorted,
      });
    });

    return groups.sort(
      (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
    );
  }, [orders, seekerIdMap]);

  const newOrdersCount = useMemo(() => {
    return groupedOrders.filter((g) => g.orders.some((o) => isRecentOrder(o.createdAt))).length;
  }, [groupedOrders]);

  const pendingGroupsCount = useMemo(() => {
    return groupedOrders.filter(
      (g) =>
        g.status === "Pending" ||
        g.orders.some(
          (o) => o.status === "Pending" || Boolean(o.notes && o.notes.toLowerCase().includes("refund"))
        )
    ).length;
  }, [groupedOrders]);

  const completedGroupsCount = useMemo(() => {
    return groupedOrders.filter((g) => g.status === "Completed" || g.orders.some((o) => o.status === "Completed")).length;
  }, [groupedOrders]);

  const refundedGroupsCount = useMemo(() => {
    return groupedOrders.filter((g) => g.status === "Refunded" || g.orders.some((o) => o.status === "Refunded")).length;
  }, [groupedOrders]);

  const filteredGroups = useMemo(() => {
    return groupedOrders.filter((g) => {
      const matchesSearch =
        searchTerm === "" ||
        g.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Boolean(g.customerPhone && g.customerPhone.includes(searchTerm)) ||
        g.orders.some(
          (o) =>
            o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.programTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            Boolean(o.transactionRef && o.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
            Boolean(o.notes && o.notes.toLowerCase().includes(searchTerm.toLowerCase()))
        );

      let matchesStatus = true;
      if (statusFilter === "All") {
        matchesStatus = true;
      } else if (statusFilter === "New") {
        matchesStatus = g.orders.some((o) => isRecentOrder(o.createdAt));
      } else if (statusFilter === "Pending") {
        matchesStatus =
          g.status === "Pending" ||
          g.orders.some(
            (o) => o.status === "Pending" || Boolean(o.notes && o.notes.toLowerCase().includes("refund"))
          );
      } else if (statusFilter === "Completed") {
        matchesStatus = g.status === "Completed" || g.orders.some((o) => o.status === "Completed");
      } else if (statusFilter === "Refunded") {
        matchesStatus = g.status === "Refunded" || g.orders.some((o) => o.status === "Refunded");
      }

      return matchesSearch && matchesStatus;
    });
  }, [groupedOrders, searchTerm, statusFilter]);

  const toggleCustomerExpand = (email: string) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const totalRevenue = orders
    .filter((o) => o.status === "Completed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const completedCount = orders.filter((o) => o.status === "Completed").length;
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const refundedCount = orders.filter((o) => o.status === "Refunded").length;

  const handleStatusChange = async (order: OrderItem, newStatus: OrderItem["status"]) => {
    const confirm = await showAlert.confirm(
      "Update Status?",
      `Change order ${order.orderNumber} status to "${newStatus}"?`,
      "Yes, update"
    );
    if (confirm.isConfirmed) {
      await updateOrderStatus(order.id, newStatus);
      showAlert.success("Updated", `Order marked as ${newStatus}.`, 1200);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
      if (selectedGroup) {
        setSelectedGroup({
          ...selectedGroup,
          orders: selectedGroup.orders.map((o) =>
            o.id === order.id ? { ...o, status: newStatus } : o
          ),
        });
      }
    }
  };

  const handleDeleteCustomerOrders = async (group: GroupedCustomerOrders) => {
    const confirm = await showAlert.confirm(
      "Delete Order Record?",
      `Are you sure you want to delete all order records for ${group.customerName}?`,
      "Yes, delete"
    );
    if (confirm.isConfirmed) {
      await deleteOrdersByCustomerEmail(group.customerEmail);
      setOrders((prev) =>
        prev.filter(
          (o) => (o.customerEmail || "").toLowerCase().trim() !== group.customerEmail.toLowerCase().trim()
        )
      );
      if (selectedGroup?.customerEmail.toLowerCase().trim() === group.customerEmail.toLowerCase().trim()) {
        setSelectedGroup(null);
      }
      showAlert.success("Deleted", `Orders for ${group.customerName} have been deleted.`, 1200);
    }
  };

  const handleDeleteSingleOrder = async (order: OrderItem) => {
    const confirm = await showAlert.confirm(
      "Delete Order?",
      `Delete order ${order.orderNumber} (${order.programTitle})?`,
      "Yes, delete"
    );
    if (confirm.isConfirmed) {
      await deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      if (selectedGroup) {
        const remaining = selectedGroup.orders.filter((o) => o.id !== order.id);
        if (remaining.length === 0) {
          setSelectedGroup(null);
        } else {
          setSelectedGroup({
            ...selectedGroup,
            orders: remaining,
            orderCount: remaining.length,
          });
        }
      }
      showAlert.success("Deleted", `Order ${order.orderNumber} deleted.`, 1200);
    }
  };

  const getStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="size-3" />
            Completed
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-amber-600 border border-amber-200">
            <Clock className="size-3" />
            Pending
          </span>
        );
      case "Refunded":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-purple-600 border border-purple-200">
            <RotateCcw className="size-3" />
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-rose-600 border border-rose-200">
            <XCircle className="size-3" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          All Orders
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Unified view of unique seekers, multi-program enrollments, and live transaction receipts.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Total Net Revenue</p>
            <p className="text-xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString("en-IN")}</p>
            <p className="text-[0.68rem] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
              <TrendingUp className="size-3" /> Live verified sales
            </p>
          </div>
          <div className="size-11 rounded-xl bg-[#0ab39c]/10 text-[#0ab39c] flex items-center justify-center font-bold text-lg">
            ₹
          </div>
        </div>

        <div
          onClick={() => handleTabClick("All")}
          className={cn(
            "rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all cursor-pointer",
            statusFilter === "All"
              ? "border-[#334d84] bg-blue-50/30 ring-1 ring-[#334d84]"
              : "border-gray-200/80 bg-white hover:border-[#334d84]/40"
          )}
        >
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Enrolled Sadhakas</p>
            <p className="text-xl font-bold text-[#334d84] mt-1">{groupedOrders.length}</p>
            <p className="text-[0.68rem] text-gray-400 mt-0.5">Unique seekers</p>
          </div>
          <div className="size-11 rounded-xl bg-[#334d84]/10 text-[#334d84] flex items-center justify-center">
            <Layers className="size-5" />
          </div>
        </div>

        <div
          onClick={() => handleTabClick("Completed")}
          className={cn(
            "rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all cursor-pointer",
            statusFilter === "Completed"
              ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500"
              : "border-gray-200/80 bg-white hover:border-emerald-500/40"
          )}
        >
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Completed Orders</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{completedCount}</p>
            <p className="text-[0.68rem] text-gray-400 mt-0.5">Confirmed enrollments</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div
          onClick={() => handleTabClick("Pending")}
          className={cn(
            "rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all cursor-pointer",
            statusFilter === "Pending"
              ? "border-amber-500 bg-amber-50/30 ring-1 ring-amber-500"
              : "border-gray-200/80 bg-white hover:border-amber-500/40"
          )}
        >
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Pending / Review</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{pendingGroupsCount}</p>
            <p className="text-[0.68rem] text-gray-400 mt-0.5">Awaiting proof/approval</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="size-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card: Merged All Orders & Consolidated Sadhakas */}
      <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
        {/* Table Filter Bar: Quick Pills & Search */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
          {/* Row 1: Fast Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleTabClick("All")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                statusFilter === "All"
                  ? "bg-[#334d84] text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <span>All Orders</span>
              {!isTabSeen("all") && groupedOrders.length > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    statusFilter === "All" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  )}
                >
                  {groupedOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("New")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                statusFilter === "New"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80"
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>New Orders</span>
              {!isTabSeen("new") && newOrdersCount > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    statusFilter === "New" ? "bg-white/20 text-white" : "bg-emerald-200/80 text-emerald-800"
                  )}
                >
                  {newOrdersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("Pending")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                statusFilter === "Pending"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80"
              )}
            >
              <Clock className="size-3" />
              <span>Pending / Refunds</span>
              {!isTabSeen("pending") && pendingGroupsCount > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    statusFilter === "Pending" ? "bg-white/20 text-white" : "bg-amber-200/80 text-amber-800"
                  )}
                >
                  {pendingGroupsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("Completed")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                statusFilter === "Completed"
                  ? "bg-[#334d84] text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <CheckCircle2 className="size-3" />
              <span>Completed</span>
              {!isTabSeen("completed") && completedGroupsCount > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    statusFilter === "Completed" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  )}
                >
                  {completedGroupsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabClick("Refunded")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                statusFilter === "Refunded"
                  ? "bg-[#334d84] text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <RotateCcw className="size-3" />
              <span>Refunded</span>
              {!isTabSeen("refunded") && refundedGroupsCount > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    statusFilter === "Refunded" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  )}
                >
                  {refundedGroupsCount}
                </span>
              )}
            </button>
          </div>

          {/* Row 2: Status Dropdown & Search Input */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                <Filter className="size-3.5 text-gray-400" />
                Status:
              </span>
              <div className="relative min-w-[200px]">
                <select
                  id="order-status-select"
                  value={statusFilter}
                  onChange={(e) => handleTabClick(e.target.value as any)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-gray-50/80 hover:bg-white focus:bg-white text-gray-800 shadow-2xs hover:border-gray-300 focus:outline-none focus:border-[#334d84] transition-colors cursor-pointer"
                >
                  <option value="All">All Statuses {!isTabSeen("all") && groupedOrders.length > 0 ? `(${groupedOrders.length})` : ""}</option>
                  <option value="New">🟢 New Orders {!isTabSeen("new") && newOrdersCount > 0 ? `(${newOrdersCount})` : ""}</option>
                  <option value="Pending">⏳ Pending / Refunds {!isTabSeen("pending") && pendingGroupsCount > 0 ? `(${pendingGroupsCount})` : ""}</option>
                  <option value="Completed">✓ Completed {!isTabSeen("completed") && completedGroupsCount > 0 ? `(${completedGroupsCount})` : ""}</option>
                  <option value="Refunded">↩ Refunded {!isTabSeen("refunded") && refundedGroupsCount > 0 ? `(${refundedGroupsCount})` : ""}</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user ID, order #, name, program, email..."
                className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[#334d84]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Unified Table View: 1 ID Per Customer with Live Inline Expandable Orders */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9fa] border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Customer ID & Orders</th>
                <th className="py-3 px-4">Purchases</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Latest Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const isExpanded = Boolean(expandedCustomers[group.customerEmail]);
                  return (
                    <Fragment key={group.customerEmail}>
                      {/* Primary Customer Row */}
                      <tr className={cn("hover:bg-gray-50/80 transition-colors", isExpanded && "bg-blue-50/20")}>
                        {/* Customer ID with Expand/Collapse Chevron */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#334d84] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleCustomerExpand(group.customerEmail)}
                              className="p-1 rounded-md hover:bg-gray-200/80 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                              title={isExpanded ? "Collapse orders" : "Expand individual orders"}
                              aria-label={isExpanded ? "Collapse orders" : "Expand individual orders"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-4 text-[#334d84]" />
                              ) : (
                                <ChevronRight className="size-4 text-gray-400" />
                              )}
                            </button>
                            <span className="inline-block px-2.5 py-1 rounded-md bg-[#334d84]/10 border border-[#334d84]/20 text-xs">
                              {group.customerId}
                            </span>
                          </div>
                        </td>

                        {/* Number of Purchases Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleCustomerExpand(group.customerEmail)}
                            className="cursor-pointer"
                          >
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs border shadow-2xs hover:brightness-95 transition-all",
                                group.orderCount > 1
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : "bg-blue-50 text-blue-700 border-blue-300"
                              )}
                            >
                              <span
                                className={cn(
                                  "size-2 rounded-full",
                                  group.orderCount > 1 ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
                                )}
                              />
                              {group.orderCount} {group.orderCount === 1 ? "Purchase" : "Purchases"}
                            </span>
                          </button>
                        </td>

                        {/* Customer Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 text-xs">{group.customerName}</p>
                            {group.orders.some((o) => isRecentOrder(o.createdAt)) && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-[0.68rem] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail className="size-3 text-gray-400 shrink-0" />
                            <span>{group.customerEmail}</span>
                          </p>
                          {group.customerPhone && (
                            <p className="text-[0.65rem] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Phone className="size-2.5 text-gray-400 shrink-0" />
                              <span>{group.customerPhone}</span>
                            </p>
                          )}
                        </td>

                        {/* Total Net Amount */}
                        <td className="py-3.5 px-4 font-bold text-gray-900 text-xs whitespace-nowrap">
                          ₹{group.totalAmount.toLocaleString("en-IN")}
                        </td>

                        {/* Payment Methods */}
                        <td className="py-3.5 px-4 text-gray-600 text-xs whitespace-nowrap">
                          <span className="font-medium">{group.paymentMethods.join(", ")}</span>
                        </td>

                        {/* Latest Date */}
                        <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(group.latestDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Overall Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(group.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleCustomerExpand(group.customerEmail)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-medium transition-colors cursor-pointer"
                              title="Expand/Collapse individual orders"
                            >
                              <span>{isExpanded ? "Collapse" : "Orders"}</span>
                              {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedGroup(group)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#334d84] text-white hover:bg-[#253961] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                              title="View Complete Seeker Portfolio"
                            >
                              <Eye className="size-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomerOrders(group)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                              title="Delete Seeker Orders"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Nested Individual Orders Accordion Sub-Table */}
                      {isExpanded && (
                        <tr className="bg-gray-50/90 border-y border-gray-200/80">
                          <td colSpan={8} className="p-0">
                            <div className="p-3.5 pl-10 sm:pl-12 bg-gradient-to-r from-blue-50/30 via-gray-50/80 to-transparent">
                              <div className="rounded-xl border border-gray-200 bg-white shadow-2xs overflow-hidden">
                                <div className="px-4 py-2.5 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between">
                                  <span className="text-[0.68rem] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <List className="size-3.5 text-[#334d84]" />
                                    All Individual Orders for {group.customerName} ({group.orders.length})
                                  </span>
                                  <span className="text-[0.65rem] text-gray-400 font-mono">
                                    Seeker ID: {group.customerId}
                                  </span>
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-[#fcfdfd] border-b border-gray-100 text-gray-400 text-[0.68rem] font-semibold uppercase">
                                      <tr>
                                        <th className="py-2.5 px-3">Order Number</th>
                                        <th className="py-2.5 px-3">Date</th>
                                        <th className="py-2.5 px-3">Enrolled Program</th>
                                        <th className="py-2.5 px-3">Transaction Ref</th>
                                        <th className="py-2.5 px-3">Amount</th>
                                        <th className="py-2.5 px-3">Payment Method</th>
                                        <th className="py-2.5 px-3">Change Status</th>
                                        <th className="py-2.5 px-3 text-right">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {group.orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                                          <td className="py-2.5 px-3 font-mono font-bold text-[#334d84] whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                              <span>{order.orderNumber}</span>
                                              {isRecentOrder(order.createdAt) && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                                                  NEW
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </td>
                                          <td className="py-2.5 px-3 font-semibold text-gray-800">
                                            {order.programTitle}
                                          </td>
                                          <td className="py-2.5 px-3 font-mono text-[0.68rem] text-gray-500">
                                            {order.transactionRef || "N/A"}
                                          </td>
                                          <td className="py-2.5 px-3 font-bold text-gray-900">
                                            ₹{order.amount.toLocaleString("en-IN")}
                                          </td>
                                          <td className="py-2.5 px-3 text-gray-600">
                                            {order.paymentMethod}
                                          </td>
                                          <td className="py-2.5 px-3 whitespace-nowrap">
                                            <div className="relative inline-block">
                                              <select
                                                value={order.status}
                                                onChange={(e) =>
                                                  handleStatusChange(order, e.target.value as OrderItem["status"])
                                                }
                                                aria-label={`Status for ${order.orderNumber}`}
                                                className={cn(
                                                  "appearance-none pl-2.5 pr-6 py-1 rounded-full text-[0.68rem] font-bold border cursor-pointer focus:outline-none transition-all shadow-2xs",
                                                  order.status === "Completed" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                                                  order.status === "Pending" && "bg-amber-50 text-amber-600 border-amber-200",
                                                  order.status === "Refunded" && "bg-purple-50 text-purple-600 border-purple-200",
                                                  order.status === "Failed" && "bg-rose-50 text-rose-600 border-rose-200"
                                                )}
                                              >
                                                <option value="Completed">Completed</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Refunded">Refunded</option>
                                                <option value="Failed">Failed</option>
                                              </select>
                                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-gray-400 pointer-events-none" />
                                            </div>
                                          </td>
                                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteSingleOrder(order)}
                                              className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                              title="Delete order"
                                            >
                                              <Trash2 className="size-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grouped Customer Orders Modal (Shows ALL Programs Inside This 1 User ID) */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#334d84] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="size-6 text-amber-300" />
                <div>
                  <h3 className="font-bold text-base">Customer Enrollment Portfolio</h3>
                  <p className="text-xs text-white/80 font-mono">
                    ID: {selectedGroup.customerId} • {selectedGroup.orderCount} Programs Purchased
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Customer Info Card */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <div>
                    <span className="text-[0.68rem] uppercase font-bold text-gray-400">Customer Name</span>
                    <p className="font-bold text-sm text-gray-900">{selectedGroup.customerName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.68rem] uppercase font-bold text-gray-400">Total Investment</span>
                    <p className="font-bold text-base text-emerald-600">
                      ₹{selectedGroup.totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <p className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                      <Mail className="size-3 text-gray-400" /> {selectedGroup.customerEmail}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <p className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                      <Phone className="size-3 text-gray-400" /> {selectedGroup.customerPhone || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ALL Programs Purchased by this 1 Customer */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[0.68rem]">
                    All Purchased Programs ({selectedGroup.orders.length})
                  </h4>
                  <span className="text-[0.68rem] text-gray-400">
                    Each program order recorded under ID: {selectedGroup.customerId}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedGroup.orders.map((o, idx) => (
                    <div
                      key={o.id}
                      className="rounded-xl border border-gray-200/90 p-4 bg-white shadow-2xs space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs">
                              {idx + 1}. {o.programTitle}
                            </span>
                            {isRecentOrder(o.createdAt) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-[0.68rem] text-gray-400 mt-0.5 font-mono">
                            Order Ref: {o.orderNumber} • Txn: {o.transactionRef}
                          </p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="font-bold text-sm text-gray-900">
                            ₹{o.amount.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[0.68rem] text-gray-400">
                            {new Date(o.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Payment:</span>
                          <span className="font-semibold text-gray-700">{o.paymentMethod}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400">Currency:</span>
                          <span className="font-semibold text-gray-700">{o.currency}</span>
                        </div>

                        {/* Interactive Status Changer directly inside modal */}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Status:</span>
                          <div className="relative inline-block">
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o, e.target.value as OrderItem["status"])}
                              aria-label={`Status for ${o.orderNumber}`}
                              className={cn(
                                "appearance-none pl-2.5 pr-6 py-1 rounded-full text-[0.68rem] font-bold border cursor-pointer focus:outline-none transition-all shadow-2xs",
                                o.status === "Completed" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                                o.status === "Pending" && "bg-amber-50 text-amber-600 border-amber-200",
                                o.status === "Refunded" && "bg-purple-50 text-purple-600 border-purple-200",
                                o.status === "Failed" && "bg-rose-50 text-rose-600 border-rose-200"
                              )}
                            >
                              <option value="Completed">Completed</option>
                              <option value="Pending">Pending</option>
                              <option value="Refunded">Refunded</option>
                              <option value="Failed">Failed</option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-gray-400 pointer-events-none" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingleOrder(o)}
                            className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete this order"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => handleDeleteCustomerOrders(selectedGroup)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Delete All Customer Orders</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
