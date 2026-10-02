import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Sparkles, Languages, Globe } from "lucide-react";
import { updateProgramApi, type ProgramItem } from "@/lib/programs-api";
import { uploadEventImageApi } from "@/lib/events-api";
import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";

interface EditProgramModalProps {
  program: ProgramItem;
  onClose: () => void;
  onUpdated: (updated: ProgramItem) => void;
}

export function EditProgramModal({ program, onClose, onUpdated }: EditProgramModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"en" | "ta">("en");
  const [formTitle, setFormTitle] = useState(program.title_en || "");
  const [formDescription, setFormDescription] = useState(program.description_en || "");
  const [formInstructor, setFormInstructor] = useState(program.instructor_en || "");
  const [formLocation, setFormLocation] = useState(program.location_en || "");

  const [formTitleTa, setFormTitleTa] = useState(program.title_ta || "");
  const [formDescriptionTa, setFormDescriptionTa] = useState(program.description_ta || "");
  const [formInstructorTa, setFormInstructorTa] = useState(program.instructor_ta || "");
  const [formLocationTa, setFormLocationTa] = useState(program.location_ta || "");
  const [formLanguage, setFormLanguage] = useState(program.language_en || "");
  const [formLanguageTa, setFormLanguageTa] = useState(program.language_ta || "");

  const [formLevel, setFormLevel] = useState(program.level || "Beginner");
  const [formDuration, setFormDuration] = useState(program.duration || "");
  const [formSchedule, setFormSchedule] = useState(program.schedule_date || "");
  const [formEnrolmentStatus, setFormEnrolmentStatus] = useState(program.enrolment_status || "Enquire");
  const [formProgramType, setFormProgramType] = useState<"online" | "offline">(program.program_type);
  const [formPriceInr, setFormPriceInr] = useState(program.price_inr || "");
  const [formPriceUsd, setFormPriceUsd] = useState(program.price_usd || "");
  const [formImageUrl, setFormImageUrl] = useState(program.image_url || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      showAlert.warning("Validation Error", "Both English and Tamil Program Titles are required.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title_en: formTitle.trim(),
      description_en: formDescription.trim(),
      instructor_en: formInstructor.trim(),
      location_en: formLocation.trim(),
      language_en: formLanguage.trim(),
      title_ta: formTitleTa.trim(),
      description_ta: formDescriptionTa.trim(),
      instructor_ta: formInstructorTa.trim(),
      location_ta: formLocationTa.trim(),
      language_ta: formLanguageTa.trim(),
      level: formLevel,
      duration: formDuration.trim(),
      schedule_date: formSchedule.trim(),
      enrolment_status: formEnrolmentStatus,
      image_url: formImageUrl.trim(),
      program_type: formProgramType,
      price_inr: formPriceInr.trim(),
      price_usd: formPriceUsd.trim(),
    };

    try {
      const updated = await updateProgramApi(program.id, payload);
      if (updated) {
        onUpdated(updated);
        showAlert.success("Updated", "Program updated successfully.", 1500);
        onClose();
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      showAlert.error("Error", "Could not update program.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Poppins',sans-serif]">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 flex flex-col">
          
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#334d84]" />
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Edit Program</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex shrink-0 items-center border-b border-gray-200 bg-gray-50/50">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors border-b-2 outline-none cursor-pointer",
                activeTab === "en" ? "border-[#334d84] text-[#334d84] bg-white" : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Globe className="size-4" /> English
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ta")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors border-b-2 outline-none cursor-pointer",
                activeTab === "ta" ? "border-[#334d84] text-[#334d84] bg-white" : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Languages className="size-4" /> தமிழ்
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <form id="edit-program-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className={cn(activeTab === "en" ? "block" : "hidden", "space-y-4")}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Program Title (English) *</label>
                  <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Description (English)</label>
                  <textarea rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Instructor (English) *</label>
                    <input type="text" required={activeTab === "en"} placeholder="Enter instructor name..." value={formInstructor} onChange={(e) => setFormInstructor(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Location (English) *</label>
                    <input type="text" required={activeTab === "en"} placeholder="Enter location..." value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Language (English) *</label>
                    <input type="text" required={activeTab === "en"} placeholder="e.g. English, Tamil" value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <div className={cn(activeTab === "ta" ? "block" : "hidden", "space-y-4")}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">நிகழ்வின் தலைப்பு (Tamil Title) *</label>
                  <input type="text" required value={formTitleTa} onChange={(e) => setFormTitleTa(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">விளக்கம் (Tamil Description)</label>
                  <textarea rows={3} value={formDescriptionTa} onChange={(e) => setFormDescriptionTa(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">பயிற்றுவிப்பாளர் (Tamil Instructor) *</label>
                    <input type="text" required={activeTab === "ta"} placeholder="Enter instructor name..." value={formInstructorTa} onChange={(e) => setFormInstructorTa(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">இடம் (Tamil Location) *</label>
                    <input type="text" required={activeTab === "ta"} placeholder="Enter location..." value={formLocationTa} onChange={(e) => setFormLocationTa(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">மொழி (Tamil Language) *</label>
                    <input type="text" required={activeTab === "ta"} placeholder="உதாரணம்: ஆங்கிலம், தமிழ்" value={formLanguageTa} onChange={(e) => setFormLanguageTa(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Program Type</label>
                  <select value={formProgramType} onChange={(e) => setFormProgramType(e.target.value as "online" | "offline")} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:outline-none">
                    <option value="online">Online Program</option>
                    <option value="offline">Offline Program</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Level</label>
                  <select value={formLevel} onChange={(e) => setFormLevel(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:outline-none">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Enrolment Status</label>
                  <select value={formEnrolmentStatus} onChange={(e) => setFormEnrolmentStatus(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:outline-none">
                    <option value="Enquire">Enquire</option>
                    <option value="Almost Full">Almost Full</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Schedule *</label>
                  <input type="text" required value={formSchedule} onChange={(e) => setFormSchedule(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Duration *</label>
                  <input type="text" required placeholder="Enter duration..." value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Price (INR) *</label>
                  <input type="text" required placeholder="Enter price in INR..." value={formPriceInr} onChange={(e) => setFormPriceInr(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Price (USD) *</label>
                  <input type="text" required placeholder="Enter price in USD..." value={formPriceUsd} onChange={(e) => setFormPriceUsd(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-[#334d84] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Banner Image</label>
                <div className="flex items-center gap-4">
                  {formImageUrl ? (
                    <img src={formImageUrl} alt="preview" className="h-12 w-16 rounded-md object-cover border border-gray-200" />
                  ) : (
                    <div className="flex h-12 w-16 items-center justify-center rounded-md border border-gray-300 bg-gray-100">
                      <ImageIcon className="size-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageFileChange} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage} className="text-xs font-semibold text-[#334d84] hover:underline">
                      {isUploadingImage ? "Uploading..." : "Upload New Image"}
                    </button>
                    <input type="text" placeholder="Or image URL..." value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900" />
                  </div>
                </div>
              </div>

            </form>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" form="edit-program-form" disabled={isSubmitting || isUploadingImage} className="rounded-xl bg-[#334d84] px-6 py-2 text-sm font-bold text-white hover:bg-[#2b4273] shadow-md transition-colors disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
