import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  Mail,
  Phone,
  FileText,
  CreditCard,
  TrendingDown,
  Filter,
  ChevronDown,
  ChevronUp,
  Layers,
  List,
} from "lucide-react";
import {
  fetchAllRefunds,
  processRefundDecision,
  type RefundItem,
} from "@/lib/refunds-api";
import { fetchAllOrders, type OrderItem } from "@/lib/orders-api";
import { fetchAllUsers } from "@/lib/users-api";
import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/refunds")({
  staticData: { sitemap: false },
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>
  ): { search?: string | undefined; refundId?: string | undefined; status?: string | undefined } => ({
    search: typeof search["search"] === "string" ? (search["search"] as string) : undefined,
    refundId: typeof search["refundId"] === "string" ? (search["refundId"] as string) : undefined,
    status: typeof search["status"] === "string" ? (search["status"] as string) : undefined,
  }),
  component: AdminRefundsPage,
});

export interface UnifiedRefundRecord {
  id: string;
  orderNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | undefined;
  programTitle: string;
  amount: number;
  status: "Pending" | "Confirm" | "Reject" | "Active";
  requestedDate: string;
  reason: string;
  adminNotes?: string | undefined;
  processedDate?: string | undefined;
  isRefundClaim: boolean;
}

export interface GroupedCustomerRefunds {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | undefined;
  totalAmount: number;
  totalOrders: number;
  refundClaimCount: number;
  hasRefundClaim: boolean;
  hasPendingRefund: boolean;
  overallStatus: "Pending" | "Confirm" | "Reject" | "Active";
  latestDate: string;
  claims: UnifiedRefundRecord[];
}

function AdminRefundsPage() {
  const query = Route.useSearch();
  const [records, setRecords] = useState<UnifiedRefundRecord[]>([]);
  const [seekerIdMap, setSeekerIdMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query.search || "");
  const [statusFilter, setStatusFilter] = useState<string>(query.status || "all");
  const [viewMode, setViewMode] = useState<"grouped" | "detailed">("grouped");
  const [selectedGroup, setSelectedGroup] = useState<GroupedCustomerRefunds | null>(null);
  const [expandedCustomerClaims, setExpandedCustomerClaims] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSearchTerm(query.search || "");
  }, [query.search]);

  const loadUnifiedData = async () => {
    const [refundList, orderList, usersData] = await Promise.all([
      fetchAllRefunds(),
      fetchAllOrders(),
      fetchAllUsers(),
    ]);

    const idMap: Record<string, string> = {};
    usersData.forEach((u) => {
      if (u.email) {
        idMap[u.email.toLowerCase().trim()] = u.id;
      }
    });
    setSeekerIdMap(idMap);

    const combined: UnifiedRefundRecord[] = [];

    // 1. Add all refund items
    refundList.forEach((r) => {
      let normStatus: "Pending" | "Confirm" | "Reject" = "Pending";
      if (r.status === "Approved" || r.status === "Confirm") normStatus = "Confirm";
      else if (r.status === "Rejected" || r.status === "Reject") normStatus = "Reject";

      combined.push({
        id: r.id,
        orderNumber: r.orderNumber,
        studentName: r.studentName,
        studentEmail: r.studentEmail,
        studentPhone: r.studentPhone,
        programTitle: r.programTitle,
        amount: r.amount,
        status: normStatus,
        requestedDate: r.requestedDate,
        reason: r.reason,
        adminNotes: r.adminNotes,
        processedDate: r.processedDate,
        isRefundClaim: true,
      });
    });

    // 2. Add all customer purchases from orders that do not have a refund record
    orderList.forEach((o) => {
      if (!combined.some((c) => c.orderNumber === o.orderNumber)) {
        combined.push({
          id: o.id,
          orderNumber: o.orderNumber,
          studentName: o.customerName,
          studentEmail: o.customerEmail,
          studentPhone: o.customerPhone,
          programTitle: o.programTitle,
          amount: o.amount,
          status: o.status === "Refunded" ? "Confirm" : "Active",
          requestedDate: o.createdAt,
          reason: o.notes || "Standard customer purchase enrollment (No cancellation requested).",
          isRefundClaim: o.status === "Refunded",
        });
      }
    });

    setRecords(combined);
    setLoading(false);
  };

  useEffect(() => {
    loadUnifiedData();

    const handler = () => {
      loadUnifiedData();
    };
    window.addEventListener("kriya_refunds_updated", handler);
    window.addEventListener("kriya_orders_updated", handler);
    return () => {
      window.removeEventListener("kriya_refunds_updated", handler);
      window.removeEventListener("kriya_orders_updated", handler);
    };
  }, []);

  // Consolidate all refund claims and orders by customer ID / email
  const groupedRefunds: GroupedCustomerRefunds[] = useMemo(() => {
    const map = new Map<string, UnifiedRefundRecord[]>();
    records.forEach((rec) => {
      const email = (rec.studentEmail || "").toLowerCase().trim();
      const list = map.get(email) || [];
      list.push(rec);
      map.set(email, list);
    });

    const groups: GroupedCustomerRefunds[] = [];
    map.forEach((userRecords, email) => {
      const sorted = [...userRecords].sort(
        (a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()
      );
      const primary = sorted[0]!;

      const refundClaims = sorted.filter((r) => r.isRefundClaim);
      const pendingClaims = sorted.filter((r) => r.status === "Pending");
      const confirmedClaims = sorted.filter((r) => r.status === "Confirm");
      const rejectedClaims = sorted.filter((r) => r.status === "Reject");

      let overallStatus: "Pending" | "Confirm" | "Reject" | "Active" = "Active";
      if (pendingClaims.length > 0) overallStatus = "Pending";
      else if (confirmedClaims.length > 0) overallStatus = "Confirm";
      else if (rejectedClaims.length > 0) overallStatus = "Reject";

      const totalAmount = sorted.reduce((acc, curr) => acc + curr.amount, 0);
      const assignedId = seekerIdMap[email] || primary.orderNumber;

      groups.push({
        customerId: assignedId,
        customerName: primary.studentName,
        customerEmail: primary.studentEmail,
        customerPhone: primary.studentPhone,
        totalAmount,
        totalOrders: sorted.length,
        refundClaimCount: refundClaims.length,
        hasRefundClaim: refundClaims.length > 0,
        hasPendingRefund: pendingClaims.length > 0,
        overallStatus,
        latestDate: primary.requestedDate,
        claims: sorted,
      });
    });

    return groups.sort(
      (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
    );
  }, [records, seekerIdMap]);

  const filteredGroups = groupedRefunds.filter((group) => {
    const matchesSearch =
      group.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.claims.some(
        (c) =>
          c.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.programTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const activeTab = statusFilter.toLowerCase();
    let matchesStatus = true;
    if (activeTab === "pending") {
      matchesStatus = group.overallStatus === "Pending";
    } else if (activeTab === "confirm") {
      matchesStatus = group.overallStatus === "Confirm";
    } else if (activeTab === "reject") {
      matchesStatus = group.overallStatus === "Reject";
    } else {
      matchesStatus = true;
    }

    return matchesSearch && matchesStatus;
  });

  const filteredDetailedRecords = records.filter((rec) => {
    const matchesSearch =
      rec.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.programTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const activeTab = statusFilter.toLowerCase();
    let matchesStatus = true;
    if (activeTab === "pending") {
      matchesStatus = rec.status === "Pending";
    } else if (activeTab === "confirm") {
      matchesStatus = rec.status === "Confirm";
    } else if (activeTab === "reject") {
      matchesStatus = rec.status === "Reject";
    } else {
      matchesStatus = true;
    }

    return matchesSearch && matchesStatus;
  });

  const allPurchasesCount = groupedRefunds.length;
  const pendingCount = groupedRefunds.filter((r) => r.overallStatus === "Pending").length;
  const confirmCount = groupedRefunds.filter((r) => r.overallStatus === "Confirm").length;
  const rejectCount = groupedRefunds.filter((r) => r.overallStatus === "Reject").length;

  const handleDecision = async (record: UnifiedRefundRecord, decision: "Confirm" | "Reject") => {
    const confirm = await showAlert.confirm(
      decision === "Confirm" ? "Confirm Refund?" : "Reject Refund Request?",
      decision === "Confirm"
        ? `Are you sure you want to confirm and process refund for ${record.studentName} (${record.orderNumber})?`
        : `Are you sure you want to reject the refund claim for order ${record.orderNumber}?`,
      decision === "Confirm" ? "Yes, Confirm Refund" : "Yes, Reject"
    );

    if (confirm.isConfirmed) {
      const note = decision === "Confirm"
        ? "Refund confirmed and disbursed per customer guarantee."
        : "Refund claim rejected following policy conditions.";
      await processRefundDecision(record.id, decision, note);
      showAlert.success("Updated", `Refund marked as ${decision}.`, 1200);
      loadUnifiedData();
      if (selectedGroup) {
        setSelectedGroup({
          ...selectedGroup,
          claims: selectedGroup.claims.map((c) =>
            c.id === record.id
              ? { ...c, status: decision, adminNotes: note, processedDate: new Date().toISOString() }
              : c
          ),
        });
      }
    }
  };

  const getStatusBadge = (status: UnifiedRefundRecord["status"]) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-amber-600 border border-amber-200">
            <Clock className="size-3" />
            pending
          </span>
        );
      case "Confirm":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-purple-600 border border-purple-200">
            <CheckCircle2 className="size-3" />
            refunded
          </span>
        );
      case "Reject":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-rose-600 border border-rose-200">
            <XCircle className="size-3" />
            rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="size-3" />
            active
          </span>
        );
    }
  };

  const TABS = [
    { id: "all", label: "all", count: allPurchasesCount },
    { id: "pending", label: "pending", count: pendingCount },
    { id: "confirm", label: "confirm", count: confirmCount },
    { id: "reject", label: "reject", count: rejectCount },
  ];

  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Refund & Cancellation Requests
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Consolidated seeker refund claims, review requests, and reversal receipts.
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
            <span>All Claims ({records.length})</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">All Seekers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{allPurchasesCount}</p>
            <p className="text-[0.68rem] text-[#334d84] font-semibold mt-0.5">Enrolled seeker accounts</p>
          </div>
          <div className="size-11 rounded-xl bg-[#334d84]/10 text-[#334d84] flex items-center justify-center">
            <CreditCard className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            <p className="text-[0.68rem] text-amber-600 font-semibold mt-0.5">Waiting for refund</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Confirmed Refunds</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{confirmCount}</p>
            <p className="text-[0.68rem] text-purple-600 font-semibold mt-0.5">Refund completed</p>
          </div>
          <div className="size-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gray-400">Rejected Claims</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{rejectCount}</p>
            <p className="text-[0.68rem] text-rose-600 font-semibold mt-0.5">Refund rejected</p>
          </div>
          <div className="size-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="size-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
        {/* Table Filters with all / pending / confirm / reject */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Dropdown Option */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
              <Filter className="size-3.5 text-gray-400" />
              Status:
            </span>
            <div className="relative min-w-[170px]">
              <select
                id="refund-status-select"
                value={statusFilter.toLowerCase()}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-gray-50/80 hover:bg-white focus:bg-white text-gray-800 shadow-2xs hover:border-gray-300 focus:outline-none focus:border-[#334d84] transition-colors cursor-pointer"
              >
                <option value="all">all ({allPurchasesCount})</option>
                <option value="pending">pending ({pendingCount})</option>
                <option value="confirm">confirm ({confirmCount})</option>
                <option value="reject">reject ({rejectCount})</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer ID, name, email, program..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[#334d84]"
            />
          </div>
        </div>

        {/* Consolidated View (1 ID per User with Refunds on LEFT SIDE) */}
        {viewMode === "grouped" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fa] border-b border-gray-100 text-gray-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Refunds</th>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Programs & Refund Claims</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Latest Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      Loading consolidated refund claims...
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No records found matching "{statusFilter}".
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

                      {/* Number of Refunds (LEFT SIDE) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {group.hasRefundClaim ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs border shadow-2xs",
                              group.hasPendingRefund
                                ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                : group.overallStatus === "Confirm"
                                ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                                : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                            )}
                          >
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                group.hasPendingRefund
                                  ? "bg-amber-500 animate-pulse"
                                  : group.overallStatus === "Confirm"
                                  ? "bg-purple-500"
                                  : "bg-rose-500"
                              )}
                            />
                            {group.refundClaimCount} {group.refundClaimCount === 1 ? "Refund" : "Refunds"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-xs bg-gray-50 text-gray-500 border border-gray-200">
                            No Claims
                          </span>
                        )}
                      </td>

                      {/* Student Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{group.customerName}</p>
                        <p className="text-[0.68rem] text-gray-400">{group.customerEmail}</p>
                        {group.customerPhone && (
                          <p className="text-[0.65rem] text-gray-400">{group.customerPhone}</p>
                        )}
                      </td>

                      {/* Programs & Claims List */}
                      <td className="py-3.5 px-4 max-w-[320px]">
                        <div className="space-y-1">
                          {group.claims.map((c) => (
                            <div
                              key={c.id}
                              className={cn(
                                "p-2 rounded-lg border text-[0.7rem] space-y-0.5",
                                c.isRefundClaim
                                  ? "bg-amber-50/50 border-amber-200/80"
                                  : "bg-gray-50 border-gray-100"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-gray-900 truncate max-w-[200px]" title={c.programTitle}>
                                  • {c.programTitle}
                                </span>
                                <span className="font-bold text-gray-800 shrink-0">
                                  ₹{c.amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                              {c.isRefundClaim && (
                                <p className="text-[0.66rem] text-amber-800 italic line-clamp-1" title={c.reason}>
                                  Reason: "{c.reason}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 text-sm whitespace-nowrap">
                        ₹{group.totalAmount.toLocaleString("en-IN")}
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
                        {getStatusBadge(group.overallStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedGroup(group)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:text-[#334d84] hover:bg-gray-100 hover:border-gray-300 font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                            <span>View ({group.claims.length})</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Individual Detailed Claims Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fa] border-b border-gray-100 text-gray-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDetailedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#334d84]">
                      {rec.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(rec.requestedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">{rec.studentName}</p>
                      <p className="text-[0.68rem] text-gray-400">{rec.studentEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="font-medium text-gray-800 truncate" title={rec.programTitle}>
                        {rec.programTitle}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      ₹{rec.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(rec.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const group = groupedRefunds.find(
                            (g) => g.customerEmail.toLowerCase() === rec.studentEmail.toLowerCase()
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

      {/* Grouped Customer Refund Dossier Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#334d84] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <RotateCcw className="size-6 text-amber-300" />
                <div>
                  <h3 className="font-bold text-base">Customer Refund & Claim Dossier</h3>
                  <p className="text-xs text-white/80 font-mono">
                    ID: {selectedGroup.customerId} • {selectedGroup.refundClaimCount} Refund Claims
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
                    <span className="text-[0.68rem] uppercase font-bold text-gray-400">Student Name</span>
                    <p className="font-bold text-sm text-gray-900">{selectedGroup.customerName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.68rem] uppercase font-bold text-gray-400">Total Enrolled Amount</span>
                    <p className="font-bold text-base text-gray-900">
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

              {/* All Refund Claims and Purchases for this Customer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[0.68rem]">
                    All Programs & Refund Claims ({selectedGroup.claims.length})
                  </h4>
                  <span className="text-[0.68rem] text-gray-400">
                    Grouped under Customer ID: {selectedGroup.customerId}
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedGroup.claims.map((c, idx) => (
                    <div
                      key={c.id}
                      className={cn(
                        "rounded-xl border p-4 shadow-2xs space-y-2.5",
                        c.isRefundClaim
                          ? "bg-amber-50/40 border-amber-200"
                          : "bg-white border-gray-200"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs">
                              {idx + 1}. {c.programTitle}
                            </span>
                          </div>
                          <p className="text-[0.68rem] text-gray-400 mt-0.5 font-mono">
                            Order Ref: {c.orderNumber}
                          </p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="font-bold text-sm text-gray-900">
                            ₹{c.amount.toLocaleString("en-IN")}
                          </p>
                          <div className="mt-0.5">{getStatusBadge(c.status)}</div>
                        </div>
                      </div>

                      {/* Reason / Notes */}
                      <div className="text-[0.72rem] text-gray-700 bg-white/80 p-2.5 rounded-lg border border-gray-100">
                        <span className="font-bold text-[0.65rem] uppercase text-gray-400 block mb-0.5">
                          {c.isRefundClaim ? "Cancellation Reason" : "Order Notes"}
                        </span>
                        {c.reason}
                      </div>

                      {/* Admin Note if already processed */}
                      {c.adminNotes && (
                        <div className="text-[0.7rem] text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-200/60">
                          <strong className="text-gray-700">Admin Note:</strong> {c.adminNotes}
                        </div>
                      )}

                      {/* Actions if Pending */}
                      {c.status === "Pending" && (
                        <div className="pt-1 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecision(c, "Confirm")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            ✓ Confirm Refund
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecision(c, "Reject")}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors cursor-pointer"
                          >
                            ✕ Reject Claim
                          </button>
                        </div>
                      )}
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
                <span>Print Dossier</span>
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
