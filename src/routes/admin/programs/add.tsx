import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Upload,
  Image as ImageIcon,
  ArrowRight,
  Globe,
  Languages,
  User,
  Clock,
  Layers,
  Info,
  IndianRupee,
  DollarSign
} from "lucide-react";

import { createProgramApi } from "@/lib/programs-api";
import { uploadEventImageApi } from "@/lib/events-api"; // reusing the same image upload API for Cloudinary
import { showAlert } from "@/lib/alert";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/programs/add")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminAddProgramPage,
});

function AdminAddProgramPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"en" | "ta">("en");

  // Bilingual fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formInstructor, setFormInstructor] = useState("");
  const [formLocation, setFormLocation] = useState("");

  const [formTitleTa, setFormTitleTa] = useState("");
  const [formDescriptionTa, setFormDescriptionTa] = useState("");
  const [formInstructorTa, setFormInstructorTa] = useState("");
  const [formLocationTa, setFormLocationTa] = useState("");
  const [formLanguage, setFormLanguage] = useState("");
  const [formLanguageTa, setFormLanguageTa] = useState("");

  // Common fields
  const [formLevel, setFormLevel] = useState("Beginner");
  const [formDuration, setFormDuration] = useState("");
  const [formSchedule, setFormSchedule] = useState("");
  const [formEnrolmentStatus, setFormEnrolmentStatus] = useState("Enquire");
  const [formPriceInr, setFormPriceInr] = useState("");
  const [formPriceUsd, setFormPriceUsd] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formProgramType, setFormProgramType] = useState<"online" | "offline">("online");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const [usdRate, setUsdRate] = useState<number>(0.0119); // Fallback ~84 INR

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/INR")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates && data.rates.USD) {
          setUsdRate(data.rates.USD);
        }
      })
      .catch((err) => console.error("Could not fetch exchange rate:", err));
  }, []);

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

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    showAlert.success("Translating...", "Please wait.", 1000);

    try {
      if (formTitle && !formTitleTa) setFormTitleTa(await translate(formTitle));
      if (formDescription && !formDescriptionTa) setFormDescriptionTa(await translate(formDescription));
      if (formInstructor && !formInstructorTa) setFormInstructorTa(await translate(formInstructor));
      if (formLocation && !formLocationTa) setFormLocationTa(await translate(formLocation));
      if (formLanguage && !formLanguageTa) setFormLanguageTa(await translate(formLanguage));
    } finally {
      setIsTranslating(false);
      showAlert.success("Done", "Tamil details translated.", 1500);
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
      showAlert.warning("Validation Error", "Both English and Tamil Program Titles are required.");
      return;
    }
    if (!formDescription.trim() || !formDescriptionTa.trim()) {
      showAlert.warning("Validation Error", "Both English and Tamil Program Descriptions are required.");
      return;
    }
    if (!formSchedule.trim()) {
      showAlert.warning("Validation Error", "Schedule date is required.");
      return;
    }

    setIsSubmitting(true);

    let formattedDate = formSchedule;
    if (formSchedule) {
      const d = new Date(formSchedule);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleString("en-US", { 
          month: "short", day: "numeric", year: "numeric"
        });
      }
    }

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
      schedule_date: formattedDate,
      enrolment_status: formEnrolmentStatus,
      image_url: formImageUrl.trim(),
      program_type: formProgramType,
      price_inr: formPriceInr.trim(),
      price_usd: formPriceUsd.trim(),
    };

    try {
      await createProgramApi(payload);

      await showAlert.success(
        "Program Created Successfully!",
        `The program has been added to ${formProgramType === "online" ? "Online Programs" : "Offline Programs"}.`,
        2000
      );

      if (formProgramType === "online") {
        navigate({ to: "/admin/programs/online" });
      } else {
        navigate({ to: "/admin/programs/offline" });
      }
    } catch (err) {
      showAlert.error("Error", "Could not create program. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 font-['Poppins',sans-serif] max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Add New Program
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Create a new online or offline program with bilingual content.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
          
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

          <div className="flex items-center justify-end px-6 pt-4">
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            >
              <Languages className="size-3.5" />
              <span>{isTranslating ? "Translating..." : "Auto Translate to Tamil"}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            <div className={cn(activeTab === "en" ? "block" : "hidden", "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300")}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Program Title (English) *
                </label>
                <input
                  type="text"
                  required={activeTab === "en"}
                  placeholder="Enter program title..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  onBlur={() => autoTranslateField(formTitle, setFormTitleTa, formTitleTa)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Program Description (English) *
                </label>
                <textarea
                  rows={3}
                  required={activeTab === "en"}
                  placeholder="Describe the program..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  onBlur={() => autoTranslateField(formDescription, setFormDescriptionTa, formDescriptionTa)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Instructor (English) *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      required={activeTab === "en"}
                      placeholder="Enter instructor name..."
                      value={formInstructor}
                      onChange={(e) => setFormInstructor(e.target.value)}
                      onBlur={() => autoTranslateField(formInstructor, setFormInstructorTa, formInstructorTa)}
                      className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Location / Venue (English) *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      required={activeTab === "en"}
                      placeholder="Enter location..."
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      onBlur={() => autoTranslateField(formLocation, setFormLocationTa, formLocationTa)}
                      className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Language (English) *
                  </label>
                  <div className="relative">
                    <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      required={activeTab === "en"}
                      placeholder="e.g. English, Tamil"
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      onBlur={() => autoTranslateField(formLanguage, setFormLanguageTa, formLanguageTa)}
                      className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(activeTab === "ta" ? "block" : "hidden", "space-y-6 animate-in fade-in slide-in-from-right-4 duration-300")}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  பயிற்சியின் தலைப்பு (Tamil Title) *
                </label>
                <input
                  type="text"
                  required={activeTab === "ta"}
                  placeholder="Enter program title..."
                  value={formTitleTa}
                  onChange={(e) => setFormTitleTa(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  பயிற்சியின் விளக்கம் (Tamil Description) *
                </label>
                <textarea
                  rows={3}
                  required={activeTab === "ta"}
                  placeholder="பயிற்சியை விவரிக்கவும்..."
                  value={formDescriptionTa}
                  onChange={(e) => setFormDescriptionTa(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    பயிற்றுவிப்பாளர் (Tamil Instructor) *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      required={activeTab === "ta"}
                      placeholder="Enter instructor name..."
                      value={formInstructorTa}
                      onChange={(e) => setFormInstructorTa(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    இடம் (Tamil Location) *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      required={activeTab === "ta"}
                      placeholder="Enter location..."
                      value={formLocationTa}
                      onChange={(e) => setFormLocationTa(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    மொழி (Tamil Language) *
                  </label>
                  <div className="relative">
                    <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      required={activeTab === "ta"}
                      placeholder="உதாரணம்: ஆங்கிலம், தமிழ்"
                      value={formLanguageTa}
                      onChange={(e) => setFormLanguageTa(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Common Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Program Type *
                </label>
                <select
                  value={formProgramType}
                  onChange={(e) => setFormProgramType(e.target.value as "online" | "offline")}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                >
                  <option value="online">Online Program</option>
                  <option value="offline">Offline Program</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Level *
                </label>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Pro">Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Enrolment Status *
                </label>
                <select
                  value={formEnrolmentStatus}
                  onChange={(e) => setFormEnrolmentStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                >
                  <option value="Enquire">Enquire</option>
                  <option value="Almost Full">Almost Full</option>
                  <option value="Full">Full</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Schedule (Date) *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Duration *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter duration..."
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Price (INR) *
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter price in INR..."
                    value={formPriceInr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormPriceInr(val);
                      const cleanVal = val.replace(/,/g, '');
                      const parsed = parseFloat(cleanVal);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setFormPriceUsd((parsed * usdRate).toFixed(2));
                      } else if (val === "") {
                        setFormPriceUsd("");
                      }
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Price (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter price in USD..."
                    value={formPriceUsd}
                    onChange={(e) => setFormPriceUsd(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] pl-10 pr-4 py-3 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Program Banner Image (Optional)
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
                      <span>{isUploadingImage ? "Uploading..." : "Choose Image File"}</span>
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

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setFormTitle("");
                  setFormDescription("");
                  setFormInstructor("");
                  setFormLocation("");
                  setFormTitleTa("");
                  setFormDescriptionTa("");
                  setFormInstructorTa("");
                  setFormLocationTa("");
                  setFormLanguageTa("");
                  setFormLanguage("");
                  setFormImageUrl("");
                  setFormSchedule("");
                  setFormDuration("");
                  setFormPriceInr("");
                  setFormPriceUsd("");
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
                <span>{isSubmitting ? "Creating Program..." : "Publish Program"}</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
