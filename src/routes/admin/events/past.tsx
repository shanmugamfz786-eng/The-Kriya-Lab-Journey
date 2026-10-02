import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  ExternalLink,
  Edit3,
  Trash2,
  Plus,
  Search,
  History,
  Image as ImageIcon,
} from "lucide-react";

import { EditEventModal } from "@/components/admin/EditEventModal";
import { fetchAllEvents, deleteEventApi, type EventItem } from "@/lib/events-api";
import { showAlert } from "@/lib/alert";

export const Route = createFileRoute("/admin/events/past")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminPastEventsPage,
});

function AdminPastEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    const data = await fetchAllEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pastEvents = events.filter((e) => {
    const d = new Date(e.event_date);
    if (!isNaN(d.getTime())) return d < today;
    return e.event_type === "past";
  });

  const filtered = pastEvents.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (eventItem: EventItem) => {
    const result = await showAlert.undoableDelete(eventItem.title);

    // If dismissed due to timer, it means the user DID NOT click Undo
    if (result.dismiss === "timer" || result.dismiss?.toString() === "timer") {
      await deleteEventApi(eventItem.id);
      setEvents((prev) => prev.filter((item) => item.id !== eventItem.id));
      showAlert.success("Deleted", "Event has been permanently removed.", 1500);
    }
  };

  const handleUpdate = (updated: EventItem) => {
    setEvents((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  return (
    <>
      <div className="space-y-6 font-['Poppins',sans-serif]">
        {/* Single Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                All Past Events & Dikshas
              </h1>
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                {pastEvents.length}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Archived workshops, Diksha records, recordings, and completed satsangs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/events/add"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#334d84] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2b4273] shadow-xs transition-colors"
            >
              <Plus className="size-3.5" />
              <span>Add Event</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-xs">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search past events by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none"
            />
          </div>
        </div>

        {/* Events Table */}
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f8f9fa] text-[0.72rem] font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4 pl-5">Event</th>
                  <th className="p-4">Date / Timing</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-normal">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 space-y-3">
                      <History className="size-8 mx-auto text-gray-300" />
                      <p className="text-sm font-medium">No past events found.</p>
                      <Link
                        to="/admin/events/add"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#334d84] hover:underline"
                      >
                        <Plus className="size-3.5" />
                        <span>Add New Past Event</span>
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
                              alt={item.title}
                              className="h-12 w-16 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400 shrink-0">
                              <ImageIcon className="size-5" />
                            </div>
                          )}
                          <div className="max-w-xs sm:max-w-md">
                            <p className="font-bold text-gray-900 line-clamp-1">{item.title}</p>
                            <p className="text-[0.7rem] text-gray-400 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-gray-400" />
                          <span>{item.event_date || "Completed"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-gray-400" />
                          <span>{item.location || "Online"}</span>
                        </div>
                      </td>
                      <td className="p-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingEvent(item)}
                            title="Edit Event"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#334d84] transition-colors cursor-pointer"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete Event"
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

        {/* Edit Modal */}
        {editingEvent && (
          <EditEventModal
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onUpdated={handleUpdate}
          />
        )}
      </div>
    </>
  );
}
