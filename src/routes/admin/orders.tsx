import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
  Layers,
  List,
} from "lucide-react";
import {
  fetchAllOrders,
  updateOrderStatus,
  type OrderItem,
} from "@/lib/orders-api";
import { fetchAllUsers } from "@/lib/users-api";
import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";

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
  ): { search?: string | undefined; orderId?: string | undefined } => ({
    search: typeof search["search"] === "string" ? (search["search"] as string) : undefined,
    orderId: typeof search["orderId"] === "string" ? (search["orderId"] as string) : undefined,
  }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const query = Route.useSearch();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [seekerIdMap, setSeekerIdMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query.search || "");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grouped" | "detailed">("grouped");
  const [selectedGroup, setSelectedGroup] = useState<GroupedCustomerOrders | null>(null);
  const [expandedCustomerPrograms, setExpandedCustomerPrograms] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSearchTerm(query.search || "");
  }, [query.search]);

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

  const filteredGroups = groupedOrders.filter((g) => {
    const matchesSearch =
      g.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.orders.some(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.programTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "All" || g.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const filteredIndividualOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.programTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.transactionRef.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || o.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Orders & Transactions
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Consolidated seeker enrollments, program purchases, and transaction receipts.
          </p>
        </div>

        {/* View Switcher: Consolidated (1 ID per User) vs All Transactions */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start sm:self-auto border border-gray-200/80">
          <button
            type="button"
            onClick={() => setViewMode("grouped")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              viewMode === "grouped"
                ? "bg-white text-[#334d84] shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Layers className="size-3.5" />
            <span>Consolidated (1 ID per User)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("detailed")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              viewMode === "detailed"
                ? "bg-white text-[#334d84] shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <List className="size-3.5" />
            <span>All Orders ({orders.length})</span>
          </button>
        </div>
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

        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Enrolled Sadhakas</p>
            <p className="text-xl font-bold text-[#334d84] mt-1">{groupedOrders.length}</p>
            <p className="text-[0.68rem] text-gray-400 mt-0.5">Unique seekers</p>
          </div>
          <div className="size-11 rounded-xl bg-[#334d84]/10 text-[#334d84] flex items-center justify-center">
            <Layers className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Completed Orders</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{completedCount}</p>
            <p className="text-[0.68rem] text-gray-400 mt-0.5">Confirmed enrollments</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Pending / Review</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            <p className="text-[0.68rem] text-gray-400 mt-0.5">Awaiting proof/approval</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="size-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Dropdown Option */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
              <Filter className="size-3.5 text-gray-400" />
              Status:
            </span>
            <div className="relative min-w-[180px]">
              <select
                id="order-status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-gray-50/80 hover:bg-white focus:bg-white text-gray-800 shadow-2xs hover:border-gray-300 focus:outline-none focus:border-[#334d84] transition-colors cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed ({completedCount})</option>
                <option value="Pending">Pending ({pendingCount})</option>
                <option value="Refunded">Refunded ({refundedCount})</option>
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
              placeholder="Search user ID, customer, program, email..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[#334d84]"
            />
          </div>
        </div>

        {/* Table View: 1 ID Per Customer with ALL Purchased Programs Inside */}
        {viewMode === "grouped" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fa] border-b border-gray-100 text-gray-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Purchases</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Enrolled Programs & Breakdown</th>
                  <th className="py-3 px-4">Total Net Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Latest Date</th>
                  <th className="py-3 px-4">Overall Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      Loading consolidated orders...
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      No customer orders match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <tr key={group.customerEmail} className="hover:bg-gray-50/70 transition-colors">
                      {/* Customer / Seeker ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#334d84]">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#334d84]/10 border border-[#334d84]/20">
                          {group.customerId}
                        </span>
                      </td>

                      {/* Number of Purchases on LEFT SIDE */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs border shadow-2xs",
                            group.orderCount > 1
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
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
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{group.customerName}</p>
                        <p className="text-[0.68rem] text-gray-400">{group.customerEmail}</p>
                        {group.customerPhone && (
                          <p className="text-[0.65rem] text-gray-400">{group.customerPhone}</p>
                        )}
                      </td>

                      {/* ALL Purchased Programs Inside This User ID */}
                      <td className="py-3.5 px-4 max-w-[320px]">
                        <div className="space-y-1">
                          {group.orders.map((o) => (
                            <div
                              key={o.id}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-gray-50/80 border border-gray-100 text-[0.7rem]"
                            >
                              <span className="font-medium text-gray-900 truncate max-w-[200px]" title={o.programTitle}>
                                • {o.programTitle}
                              </span>
                              <div className="text-right shrink-0 flex items-center gap-1">
                                <span className="font-bold text-gray-800">
                                  ₹{o.amount.toLocaleString("en-IN")}
                                </span>
                                <span
                                  className={cn(
                                    "inline-block size-1.5 rounded-full",
                                    o.status === "Completed"
                                      ? "bg-emerald-500"
                                      : o.status === "Pending"
                                      ? "bg-amber-500"
                                      : "bg-purple-500"
                                  )}
                                  title={o.status}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 text-sm whitespace-nowrap">
                        ₹{group.totalAmount.toLocaleString("en-IN")}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        <span className="font-medium">{group.paymentMethods.join(", ")}</span>
                      </td>

                      {/* Latest Date */}
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
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

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedGroup(group)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:text-[#334d84] hover:bg-gray-100 hover:border-gray-300 font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="size-3.5" />
                          <span>View Details ({group.orderCount})</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Individual Orders View (Optional raw transaction list) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fa] border-b border-gray-100 text-gray-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Enrolled Program</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIndividualOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#334d84]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-[0.68rem] text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="font-medium text-gray-800 truncate" title={order.programTitle}>
                        {order.programTitle}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <span className="font-medium">{order.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderItem["status"])}
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
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const group = groupedOrders.find(
                            (g) => g.customerEmail.toLowerCase() === order.customerEmail.toLowerCase()
                          );
                          if (group) setSelectedGroup(group);
                        }}
                        className="inline-flex items-center gap-1 text-[#334d84] hover:underline font-semibold text-xs"
                      >
                        <Eye className="size-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-[0.7rem] text-gray-500">
                          <span>Method: <strong className="text-gray-700">{o.paymentMethod}</strong></span>
                        </div>

                        {/* Status update for this specific order */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.68rem] text-gray-400">Status:</span>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold cursor-pointer"
              >
                <FileText className="size-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-xs text-gray-800 transition-colors cursor-pointer"
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
