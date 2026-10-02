import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  Plus,
  Search,
  Sparkles,
  Image as ImageIcon,
  User,
  Clock
} from "lucide-react";

import { EditProgramModal } from "@/components/admin/EditProgramModal";
import { fetchAllPrograms, deleteProgramApi, type ProgramItem } from "@/lib/programs-api";
import { showAlert } from "@/lib/alert";

export const Route = createFileRoute("/admin/programs/offline")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminOfflineProgramsPage,
});

function AdminOfflineProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);

  const loadPrograms = async () => {
    setLoading(true);
    const data = await fetchAllPrograms();
    setPrograms(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const offlinePrograms = programs.filter((p) => p.program_type === "offline");

  const filtered = offlinePrograms.filter(
    (p) =>
      (p.title_en?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.instructor_en && p.instructor_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (programItem: ProgramItem) => {
    const result = await showAlert.undoableDelete(programItem.title_en);

    if (result.dismiss === "timer" || result.dismiss?.toString() === "timer") {
      await deleteProgramApi(programItem.id);
      setPrograms((prev) => prev.filter((item) => item.id !== programItem.id));
      showAlert.success("Deleted", "Program has been permanently removed.", 1500);
    }
  };

  const handleUpdate = (updated: ProgramItem) => {
    setPrograms((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  return (
    <>
      <div className="space-y-6 font-['Poppins',sans-serif]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Offline Programs
              </h1>
              <span className="inline-flex items-center rounded-full bg-[#0ab39c]/15 px-2.5 py-0.5 text-xs font-semibold text-[#0ab39c]">
                {offlinePrograms.length} Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Manage your offline / in-person workshops and classes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/programs/add"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#334d84] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2b4273] shadow-xs transition-colors"
            >
              <Plus className="size-3.5" />
              <span>Add Program</span>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-xs">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f8f9fa] text-[0.72rem] font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4 pl-5">Program</th>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Schedule / Level</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-normal">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 space-y-3">
                      <Sparkles className="size-8 mx-auto text-gray-300" />
                      <p className="text-sm font-medium">No offline programs scheduled.</p>
                      <Link
                        to="/admin/programs/add"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#334d84] hover:underline"
                      >
                        <Plus className="size-3.5" />
                        <span>Create New Program</span>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 pl-5">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title_en}
                              className="h-12 w-16 rounded-lg object-cover border border-gray-200 shrink-0 shadow-xs"
                            />
                          ) : (
                            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400 shrink-0">
                              <ImageIcon className="size-5" />
                            </div>
                          )}
                          <div className="max-w-xs sm:max-w-md">
                            <p className="font-bold text-gray-900 line-clamp-1">{item.title_en}</p>
                            <p className="text-[0.7rem] text-gray-400 line-clamp-1 mt-0.5">
                              {item.title_ta}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 whitespace-nowrap font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="size-3.5 text-gray-400" />
                          <span>{item.instructor_en || "TBA"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="size-3.5 text-emerald-600" />
                          <span>{item.schedule_date || "TBA"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[0.7rem] text-gray-400">
                          <MapPin className="size-3" />
                          <span>{item.location_en}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[0.7rem] font-semibold text-blue-700 border border-blue-100">
                          {item.enrolment_status}
                        </span>
                      </td>
                      <td className="p-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProgram(item)}
                            title="Edit Program"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#334d84] transition-colors cursor-pointer"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete Program"
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
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

        {editingProgram && (
          <EditProgramModal
            program={editingProgram}
            onClose={() => setEditingProgram(null)}
            onUpdated={handleUpdate}
          />
        )}
      </div>
    </>
  );
}
