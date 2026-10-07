import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { bi, useLang } from "@/lib/i18n";
import { showAlert } from "@/lib/alert";

interface CollectEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
}

export function CollectEnquiryModal({ isOpen, onClose, programName }: CollectEnquiryModalProps) {
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/enquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          program: programName,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        await showAlert.success(
          lang === "ta" ? "வெற்றி!" : "Success!",
          lang === "ta" 
            ? "உங்கள் விருப்பம் பதிவு செய்யப்பட்டது. நாங்கள் உங்களை தொடர்புகொள்வோம்." 
            : "Your collection interest has been registered. We will contact you soon."
        );
        onClose();
        setFormData({ name: "", email: "", phone: "", country: "", message: "" });
      } else {
        throw new Error(data.message || data.error || "Failed to submit");
      }
    } catch (err: any) {
      await showAlert.error(
        lang === "ta" ? "பிழை" : "Error",
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl animate-in zoom-in-95 fade-in-0 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-2xl text-foreground mb-1">
            {t(bi("Collect Info", "தகவல்களை அளிக்கவும்"))}
          </h2>
          <p className="text-sm text-muted-foreground">
            {programName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(bi("Full Name", "முழு பெயர்"))} *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(bi("Email", "மின்னஞ்சல்"))} *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(bi("Phone Number", "தொலைபேசி எண்"))} *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(bi("Country", "நாடு"))}
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(bi("Any Message?", "உங்கள் செய்தி?"))}
            </label>
            <textarea
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-velvet-deep transition-all hover:bg-gold/90 hover:shadow-lg disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {t(bi("Submit Collection", "சமர்ப்பிக்கவும்"))}
          </button>
        </form>
      </div>
    </div>
  );
}
