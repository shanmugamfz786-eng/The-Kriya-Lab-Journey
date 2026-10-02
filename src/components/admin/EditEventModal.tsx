import { useState, useRef } from "react";
import { X, Upload, Calendar, MapPin, Link as LinkIcon, Image as ImageIcon, Save } from "lucide-react";
import { type EventItem, updateEventApi, uploadEventImageApi } from "@/lib/events-api";
import { showAlert } from "@/lib/alert";

interface EditEventModalProps {
  event: EventItem;
  onClose: () => void;
  onUpdated: (updatedEvent: EventItem) => void;
}

export function EditEventModal({ event, onClose, onUpdated }: EditEventModalProps) {
  const [formData, setFormData] = useState<EventItem>({ ...event });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert.error("File Too Large", "Please select an image smaller than 5MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const uploadedUrl = await uploadEventImageApi(base64);
        setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
        showAlert.success("Image Uploaded", "Image updated successfully.", 1200);
      } catch (err) {
        setFormData((prev) => ({ ...prev, image_url: base64 }));
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showAlert.warning("Title Required", "Event title cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateEventApi(formData.id, formData);
      const finalItem = result || formData;
      onUpdated(finalItem);
      await showAlert.success("Event Updated", "Changes have been saved.", 1500);
      onClose();
    } catch (err) {
      showAlert.error("Error", "Could not update event.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-['Poppins',sans-serif]">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8f9fa] px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Edit Event Details</h3>
            <p className="text-xs text-gray-500 font-normal">Update title, google form link, media, and dates</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none focus:ring-1 focus:ring-[#334d84]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Event Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none focus:ring-1 focus:ring-[#334d84] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Event Type
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value as "past" | "future" })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-900 bg-white focus:border-[#334d84] focus:outline-none"
              >
                <option value="future">Future Event</option>
                <option value="past">Past Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Google Form / Registration Link
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://forms.gle/..."
                  value={formData.google_form_link || ""}
                  onChange={(e) => setFormData({ ...formData, google_form_link: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3.5 py-2.5 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Date & Timing
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Oct 15, 2026 • 09:00 AM"
                  value={formData.event_date || ""}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3.5 py-2.5 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Location / Venue
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Chennai Ashram / Zoom Webinar"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3.5 py-2.5 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Event Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Event Banner Image
            </label>
            <div className="flex items-center gap-3">
              {formData.image_url ? (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="h-16 w-24 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400">
                  <ImageIcon className="size-6" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
                >
                  <Upload className="size-3.5" />
                  <span>{isUploading ? "Uploading..." : "Replace Cloudinary Image"}</span>
                </button>
                <p className="text-[0.68rem] text-gray-400 mt-1">
                  Upload directly or paste image URL below
                </p>
              </div>
            </div>
            <input
              type="text"
              placeholder="Or paste Direct Image URL..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#334d84] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2b4273] shadow-xs transition-colors cursor-pointer"
            >
              <Save className="size-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
