import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  Trash2,
  Mail,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";

import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";
import { fetchAllUsers, deleteUserApi, type SeekerItem } from "@/lib/users-api";
import { useEnrollments } from "@/lib/enrollment-store";

export const Route = createFileRoute("/admin/users")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [seekers, setSeekers] = useState<SeekerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = () => {
      fetchAllUsers().then((data) => {
        setSeekers(data);
        setIsLoading(false);
      });
    };
    loadUsers();

    window.addEventListener("kriya_orders_updated", loadUsers);
    return () => window.removeEventListener("kriya_orders_updated", loadUsers);
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeeker, setSelectedSeeker] = useState<SeekerItem | null>(null);
  const [viewingProgramsFor, setViewingProgramsFor] = useState<SeekerItem | null>(null);
  const [expandedSeekerPrograms, setExpandedSeekerPrograms] = useState<Record<string, boolean>>({});

  const filtered = seekers.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
        </div>

        {/* Seekers Table */}
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f8f9fa] text-[0.72rem] font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Ref ID</th>
                  <th className="p-3.5">Purchases</th>
                  <th className="p-3.5">Seeker Name</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Contact Info</th>
                  <th className="p-3.5">Program Applied</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-normal">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No seeker applications found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-semibold text-[#334d84]">{item.id}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs border shadow-2xs",
                            (item.programs?.length || 1) > 1
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-blue-50 text-blue-700 border-blue-300"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              (item.programs?.length || 1) > 1 ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
                            )}
                          />
                          {item.programs?.length || 1} {(item.programs?.length || 1) === 1 ? "Purchase" : "Purchases"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-[0.7rem] text-gray-400 line-clamp-1">{item.experience}</p>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-gold shrink-0" />
                          <span className="font-semibold text-gray-800 text-xs">
                            {item.location || "India (IN)"}
                          </span>
                        </div>
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
                      <td className="p-3.5 max-w-[260px]">
                        {item.programs && item.programs.length > 0 ? (
                          <div className="space-y-1">
                            {item.programs.map((p, pIdx) => (
                              <p
                                key={pIdx}
                                className="text-[0.72rem] font-medium text-gray-800 line-clamp-1"
                                title={`${p.title} (${p.status})`}
                              >
                                • {p.title}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="font-medium text-gray-800 line-clamp-1" title={item.program}>
                            {item.program}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold border",
                            item.status === "Initiated" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                            item.status === "Approved" && "bg-blue-50 text-blue-600 border-blue-200",
                            item.status === "Pending Review" && "bg-amber-50 text-amber-600 border-amber-200",
                          )}
                        >
                          <CheckCircle2 className="size-3" />
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-500 whitespace-nowrap">{item.date}</td>
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
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8f9fa] px-6 py-4 shrink-0">
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

              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
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

                {/* All Purchased Programs */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] font-bold uppercase tracking-wider text-gray-500">
                      All Enrolled Programs ({selectedSeeker.programs?.length || 1})
                    </span>
                    {selectedSeeker.totalSpent > 0 && (
                      <span className="text-xs font-bold text-emerald-600">
                        Total Paid: ₹{selectedSeeker.totalSpent.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {(selectedSeeker.programs && selectedSeeker.programs.length > 0
                      ? selectedSeeker.programs
                      : [
                          {
                            slug: "prg_1",
                            title: selectedSeeker.program,
                            date: selectedSeeker.date,
                            status: selectedSeeker.status,
                          },
                        ]
                    ).map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-gray-200/80 bg-white flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-xs truncate">{p.title}</p>
                          <p className="text-[0.68rem] text-gray-400 mt-0.5">
                            {p.orderNumber ? `${p.orderNumber} • ` : ""}
                            {p.date}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {p.amount ? (
                            <p className="font-bold text-gray-900 text-xs">
                              {p.currency === "USD" ? "$" : "₹"}
                              {p.amount.toLocaleString("en-IN")}
                            </p>
                          ) : null}
                          <span className="inline-block text-[0.65rem] font-semibold text-emerald-600">
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-400">
                      Location
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="size-3.5 text-gray-600 shrink-0" />
                      <p className="font-semibold text-gray-900 text-xs">
                        {selectedSeeker.location || "India (IN)"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-400">
                      Account Status
                    </span>
                    <p className="font-medium text-emerald-600 mt-0.5">{selectedSeeker.status}</p>
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

                <div className="flex items-center justify-end pt-4 border-t border-gray-100">

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
        
        {viewingProgramsFor && (
          <AdminUserProgramsModal 
            seeker={viewingProgramsFor} 
            onClose={() => setViewingProgramsFor(null)} 
          />
        )}
      </div>
    </>
  );
}

function AdminUserProgramsModal({ seeker, onClose }: { seeker: SeekerItem, onClose: () => void }) {
  const { enrolledPrograms, loading } = useEnrollments(seeker.id);
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-['Poppins',sans-serif]">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8f9fa] px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Collected Programs</h3>
            <p className="text-xs text-gray-500">{seeker.name} ({seeker.id})</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4 font-medium">Loading programs...</p>
          ) : enrolledPrograms.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              This user hasn't collected any programs yet.
            </p>
          ) : (
            <div className="space-y-3">
              {enrolledPrograms.map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 bg-gray-50 hover:bg-gray-100/50 transition-colors">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title_en} className="size-12 rounded-lg object-cover shadow-sm bg-white" />
                  ) : (
                    <div className="size-12 rounded-lg bg-gray-200 flex items-center justify-center shadow-sm">
                      <Sparkles className="size-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{p.title_en}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{p.level} • {p.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-4 border-t border-gray-100 bg-[#f8f9fa]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#334d84] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2b4273] shadow-sm transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
