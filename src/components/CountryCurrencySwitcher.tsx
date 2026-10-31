import { useState, useRef, useEffect } from "react";
import { useGeo } from "@/lib/geo-context";
import { cn } from "@/lib/utils";
import { ShieldCheck, Globe, CheckCircle2 } from "lucide-react";

export function CountryCurrencySwitcher({
  isTransparent,
  className,
}: {
  isTransparent?: boolean;
  className?: string;
}) {
  const { countryCode, countryName, currency, currencySymbol, flag, isVerified, isLocked } = useGeo();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const isOfficiallyVerified = isLocked || isVerified;

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] tracking-wide transition-all border font-medium cursor-pointer",
          isTransparent
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-gold/60"
            : "border-border bg-secondary/60 text-foreground hover:border-gold hover:bg-gold/10",
          open && "ring-1 ring-gold border-gold"
        )}
        aria-label={isOfficiallyVerified ? "Verified Country and Currency" : "Detected Country and Currency"}
        title={
          isOfficiallyVerified
            ? `Verified Location: ${countryName} (${countryCode}), Currency: ${currency}`
            : `Detected Location: ${countryName} (${countryCode}), Currency: ${currency}`
        }
      >
        <span className="text-sm leading-none">{flag}</span>
        <span className="font-semibold">{currency}</span>
        {isOfficiallyVerified ? (
          <CheckCircle2 className="size-2.5 text-emerald-400" />
        ) : (
          <Globe className="size-2.5 text-white/70" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-foreground">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              {isOfficiallyVerified ? (
                <>
                  <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                  <span>Verified Location</span>
                </>
              ) : (
                <>
                  <Globe className="size-4 text-gold shrink-0" />
                  <span>Detected Location</span>
                </>
              )}
            </div>
            <span
              className={cn(
                "text-[0.62rem] font-mono uppercase px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1",
                isOfficiallyVerified
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-gold/15 text-gold border-gold/30"
              )}
            >
              {isOfficiallyVerified ? "Verified" : "Auto"}
            </span>
          </div>

          <div className="mt-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-secondary/40">
              <span className="text-muted-foreground text-[0.7rem]">Country</span>
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span className="text-sm leading-none">{flag}</span>
                {countryName} ({countryCode})
              </span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-secondary/40">
              <span className="text-muted-foreground text-[0.7rem]">Currency</span>
              <span className="font-semibold text-gold">
                {currency} ({currencySymbol})
              </span>
            </div>
          </div>

          {/* Security & Integrity Note */}
          <div className="mt-3 pt-2.5 border-t border-border/60 text-[0.68rem] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            {isOfficiallyVerified ? (
              <>
                <ShieldCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Your location is verified as {countryName} to protect pricing integrity and account security.
                </span>
              </>
            ) : (
              <>
                <Globe className="size-3 text-gold shrink-0 mt-0.5" />
                <span>
                  Location auto-detected as {countryName}. Device and IP location verification is completed during sign up.
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
