import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Mail,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";

import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";
import { fetchAllUsers, deleteUserApi, type SeekerItem } from "@/lib/users-api";

export const Route = createFileRoute("/admin/users")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [seekers, setSeekers] = useState<SeekerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers().then((data) => {
      setSeekers(data);
      setIsLoading(false);
    });
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSeeker, setSelectedSeeker] = useState<SeekerItem | null>(null);

  const filtered = seekers.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: SeekerItem["status"]) => {
    setSeekers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    await showAlert.success("Status Updated", `Seeker marked as ${newStatus}.`, 1200);
  };

  const handleDelete = async (seeker: SeekerItem) => {
    const result = await showAlert.confirm(
      "Delete Application?",
      `Are you sure you want to permanently delete account for "${seeker.name}"? This removes their dashboard access.`,
      "Yes, delete"
    );

    if (result.isConfirmed) {
      try {
        await deleteUserApi(seeker.id);
        setSeekers((prev) => prev.filter((s) => s.id !== seeker.id));
        showAlert.success("Deleted", "User account deleted successfully.", 1200);
      } catch (e: any) {
        showAlert.error("Delete Failed", e.message || "Failed to delete user account.");
      }
    }
  };

  const handleExportCsv = () => {
    const headers = ["Ref ID,Seeker Name,Email,Phone,Applied Program,Status,Date,Experience"];
    const rows = filtered.map(
      (s) =>
        `"${s.id}","${s.name}","${s.email}","${s.phone}","${s.program}","${s.status}","${s.date}","${s.experience}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `seekers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert.success("CSV Exported", "Seeker data downloaded successfully.", 1500);
  };

  return (
    <>
      <div className="space-y-6 font-['Poppins',sans-serif]">
        {/* Clean Single Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Users & Seeker Applications
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage spiritual aspirants, review background profiles, and assign transmission statuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#334d84] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2b4273] shadow-xs transition-colors cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, phone, program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 focus:border-[#334d84] focus:outline-none"
            >
              <option value="all">All Statuses ({seekers.length})</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Initiated">Initiated</option>
            </select>
          </div>
        </div>

        {/* Seekers Table */}
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f8f9fa] text-[0.72rem] font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Ref ID</th>
                  <th className="p-3.5">Seeker Name</th>
                  <th className="p-3.5">Contact Info</th>
                  <th className="p-3.5">Applied Program</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-normal">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No seeker applications found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-semibold text-gray-700">{item.id}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-[0.7rem] text-gray-400 line-clamp-1">{item.experience}</p>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="size-3 text-gray-400" />
                          <span>{item.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-[0.68rem] mt-0.5">
                          <Phone className="size-2.5 text-gray-400" />
                          <span>{item.phone}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-gray-700 font-medium">{item.program}</td>
                      <td className="p-3.5">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value as SeekerItem["status"])
                          }
                          className={cn(
                            "rounded-md px-2 py-1 text-[0.7rem] font-semibold border-0 cursor-pointer focus:ring-1 focus:ring-[#334d84]",
                            item.status === "Approved" && "bg-[#0ab39c]/15 text-[#0ab39c]",
                            item.status === "Pending Review" && "bg-[#f7b84b]/20 text-[#b7791f]",
                            item.status === "Initiated" && "bg-[#334d84]/15 text-[#334d84]",
                          )}
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Initiated">Initiated</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-gray-500">{item.date}</td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSeeker(item)}
                            title="View Full Details"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#334d84] transition-colors"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete Application"
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Details Modal */}
        {selectedSeeker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-['Poppins',sans-serif]">
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8f9fa] px-6 py-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Seeker Application Profile</h3>
                  <p className="text-xs text-gray-500">{selectedSeeker.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSeeker(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-400">
                    Full Name
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedSeeker.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-400">
                      Email
                    </span>
                    <p className="font-medium text-gray-800 mt-0.5">{selectedSeeker.email}</p>
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-400">
                      Phone Number
                    </span>
                    <p className="font-medium text-gray-800 mt-0.5">{selectedSeeker.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-400">
                      Program Applied
                    </span>
                    <p className="font-bold text-[#334d84] mt-0.5">{selectedSeeker.program}</p>
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-400">
                      Location
                    </span>
                    <p className="font-medium text-gray-800 mt-0.5">{selectedSeeker.location || "Not specified"}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-400">
                    Yoga & Meditation Background
                  </span>
                  <div className="rounded-lg bg-gray-50 p-3 mt-1 text-gray-700">
                    {selectedSeeker.experience}
                  </div>
                </div>

                <div>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-400">
                    Spiritual Aspiration / Motivation
                  </span>
                  <div className="rounded-lg bg-gray-50 p-3 mt-1 text-gray-700">
                    {selectedSeeker.motivation || "Devoted seeker seeking direct initiation into Mahavatar Babaji sacred technique."}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
                      selectedSeeker.status === "Approved" && "bg-[#0ab39c]/15 text-[#0ab39c]",
                      selectedSeeker.status === "Pending Review" && "bg-[#f7b84b]/20 text-[#b7791f]",
                      selectedSeeker.status === "Initiated" && "bg-[#334d84]/15 text-[#334d84]",
                    )}
                  >
                    Status: {selectedSeeker.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedSeeker(null)}
                    className="rounded-lg bg-[#334d84] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2b4273] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
