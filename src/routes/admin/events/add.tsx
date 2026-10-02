import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Globe,
  Languages
} from "lucide-react";

import { createEventApi, uploadEventImageApi } from "@/lib/events-api";
import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/events/add")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminAddEventPage,
});

function AdminAddEventPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"en" | "ta">("en");

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEventDate, setFormEventDate] = useState("");
  const [formLocation, setFormLocation] = useState("");

  const [formTitleTa, setFormTitleTa] = useState("");
  const [formDescriptionTa, setFormDescriptionTa] = useState("");
  const [formLocationTa, setFormLocationTa] = useState("");

  const [formImageUrl, setFormImageUrl] = useState("");
  const [formGoogleFormLink, setFormGoogleFormLink] = useState("");
  const [formEventType, setFormEventType] = useState<"past" | "future">("future");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const translate = async (text: string) => {
    if (!text.trim()) return "";
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      return data[0].map((item: any) => item[0]).join("");
    } catch (err) {
      return text;
    }
  };

  const autoTranslateField = async (text: string, setter: (val: string) => void, currentVal: string) => {
    if (text.trim() && !currentVal) {
      setter(await translate(text));
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert.error("File Too Large", "Please select an image smaller than 5MB.");
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const uploadedUrl = await uploadEventImageApi(base64);
        setFormImageUrl(uploadedUrl);
        showAlert.success("Image Uploaded", "Banner image is ready.", 1200);
      } catch (err) {
        setFormImageUrl(base64);
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formTitleTa.trim()) {
      showAlert.warning("Validation Error", "Both English and Tamil Event Titles are required.");
      return;
    }
    if (!formDescription.trim() || !formDescriptionTa.trim()) {
      showAlert.warning("Validation Error", "Both English and Tamil Event Descriptions are required.");
      return;
    }
    if (!formEventDate.trim()) {
      showAlert.warning("Validation Error", "Event Date & Timing is required.");
      return;
    }
    if (!formLocation.trim() || !formLocationTa.trim()) {
      showAlert.warning("Validation Error", "Both English and Tamil Locations are required.");
      return;
    }
    if (formEventType === "future" && !formGoogleFormLink.trim()) {
      showAlert.warning("Validation Error", "Google form link is required for future events.");
      return;
    }

    setIsSubmitting(true);

    // Format date string (YYYY-MM-DD) to a readable format if possible
    let formattedDate = formEventDate;
    if (formEventDate) {
      const d = new Date(formEventDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleString("en-US", { 
          month: "short", day: "numeric", year: "numeric"
        });
      }
    }

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      title_ta: formTitleTa.trim(),
      description_ta: formDescriptionTa.trim(),
      image_url: formImageUrl.trim(),
      google_form_link: formEventType === "future" ? formGoogleFormLink.trim() : "",
      event_type: formEventType,
      event_date: formattedDate,
      event_date_ta: formattedDate,
      location: formLocation.trim(),
      location_ta: formLocationTa.trim(),
    };

    try {
      await createEventApi(payload);

      await showAlert.success(
        "Event Created Successfully!",
        `The event has been published to ${formEventType === "past" ? "All Past Events" : "All Future Events"}.`,
        2000
      );

      // Auto-navigate to the corresponding individual page
      if (formEventType === "past") {
        navigate({ to: "/admin/events/past" });
      } else {
        navigate({ to: "/admin/events/future" });
      }
    } catch (err) {
      showAlert.error("Error", "Could not create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 font-['Poppins',sans-serif] max-w-5xl mx-auto">
        {/* Clean Single Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Add New Event / Workshop
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Create a new Kriya Yoga workshop or archive past Diksha retreats with bilingual content.
            </p>
          </div>
        </div>

        {/* Add Event Form Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
          
          {/* Language Tabs */}
          <div className="flex items-center border-b border-gray-200 bg-gray-50/50">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 outline-none cursor-pointer",
                activeTab === "en" 
                  ? "border-[#334d84] text-[#334d84] bg-white" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              <Globe className="size-4" />
              English Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ta")}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 outline-none cursor-pointer",
                activeTab === "ta" 
                  ? "border-[#334d84] text-[#334d84] bg-white" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              <Languages className="size-4" />
              தமிழ் (Tamil) Details
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            <div className={cn(activeTab === "en" ? "block" : "hidden", "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300")}>
              {/* English Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Event Title (English) *
                </label>
                <input
                  type="text"
                  required={activeTab === "en"}
                  placeholder="e.g. 1st Kriya Yoga Online Initiation & Diksha"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  onBlur={() => autoTranslateField(formTitle, setFormTitleTa, formTitleTa)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* English Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Event Description (English) *
                </label>
                <textarea
                  rows={3}
                  required={activeTab === "en"}
                  placeholder="Describe the workshop schedule, sacred techniques covered, and requirements..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  onBlur={() => autoTranslateField(formDescription, setFormDescriptionTa, formDescriptionTa)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* English Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Location / Venue (English) *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    required={activeTab === "en"}
                    placeholder="e.g. Chennai Ashram / Zoom Webinar"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    onBlur={() => autoTranslateField(formLocation, setFormLocationTa, formLocationTa)}
                    className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className={cn(activeTab === "ta" ? "block" : "hidden", "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300")}>
              {/* Tamil Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  நிகழ்வின் தலைப்பு (Tamil Title) *
                </label>
                <input
                  type="text"
                  required={activeTab === "ta"}
                  placeholder="உதாரணம்: 1வது கிரியா யோகா இணையவழி தீட்சை"
                  value={formTitleTa}
                  onChange={(e) => setFormTitleTa(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* Tamil Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  நிகழ்வின் விளக்கம் (Tamil Description) *
                </label>
                <textarea
                  rows={3}
                  required={activeTab === "ta"}
                  placeholder="முகாம் நேரம், பயிற்சிகள் மற்றும் தேவைகளை விவரிக்கவும்..."
                  value={formDescriptionTa}
                  onChange={(e) => setFormDescriptionTa(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Tamil Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  இடம் (Tamil Location) *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    required={activeTab === "ta"}
                    placeholder="உதாரணம்: சென்னை ஆசிரமம் / ஜூம் இணையவழி"
                    value={formLocationTa}
                    onChange={(e) => setFormLocationTa(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Event Category & Common Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Event Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Event Category (Past / Future) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormEventType("past")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs font-semibold border transition-all cursor-pointer",
                      formEventType === "past"
                        ? "border-[#334d84] bg-[#334d84] text-white shadow-xs"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span>Past Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormEventType("future")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs font-semibold border transition-all cursor-pointer",
                      formEventType === "future"
                        ? "border-[#0ab39c] bg-[#0ab39c] text-white shadow-xs"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Sparkles className="size-3.5" />
                    <span>Future Event</span>
                  </button>
                </div>
              </div>

              {formEventType === "future" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Google Form / Registration URL *
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="url"
                      required
                      placeholder="https://forms.gle/your-registration-link"
                      value={formGoogleFormLink}
                      onChange={(e) => setFormGoogleFormLink(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cloudinary Banner Image Upload (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Event Banner Image (Optional)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-[#f8f9fa] p-4">
                {formImageUrl ? (
                  <img
                    src={formImageUrl}
                    alt="Banner preview"
                    className="h-20 w-32 rounded-lg object-cover border border-gray-200 shadow-xs"
                  />
                ) : (
                  <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-400">
                    <ImageIcon className="size-8" />
                  </div>
                )}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#334d84] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2b4273] transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="size-3.5" />
                      <span>{isUploadingImage ? "Uploading to Cloudinary..." : "Choose Image File"}</span>
                    </button>
                    {formImageUrl && (
                      <span className="text-xs text-emerald-600 font-medium">✓ Image Attached</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Or enter image URL directly..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-[#334d84] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setFormTitle("");
                  setFormDescription("");
                  setFormTitleTa("");
                  setFormDescriptionTa("");
                  setFormImageUrl("");
                  setFormGoogleFormLink("");
                  setFormEventDate("");
                  setFormLocation("");
                  setFormLocationTa("");
                }}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="inline-flex items-center gap-2 rounded-xl bg-[#334d84] px-7 py-2.5 text-xs font-bold text-white hover:bg-[#2b4273] shadow-md transition-all cursor-pointer"
              >
                <span>{isSubmitting ? "Creating Event..." : "Publish Event"}</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
