import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { ui } from "@/content/site";

import { ArrowLeft } from "lucide-react";

export function Section({
  children,
  className,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "velvet";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-5 py-10 sm:py-12 lg:px-10 lg:py-14",
        tone === "muted" && "bg-muted",
        tone === "velvet" && "bg-velvet-deep text-[oklch(0.94_0.01_300)]",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow text-gold">{children}</p>;
}

export function PageHero({
  eyebrow,
  title,
  intro,
  showBackToHome = true,
  customBackLink,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  showBackToHome?: boolean;
  customBackLink?: { to: string; label: string; search?: Record<string, string> };
  className?: string;
}) {
  const { lang } = useLang();
  const ta = lang === "ta";

  return (
    <header className={cn("bg-dawn px-5 pb-6 pt-6 sm:pb-8 sm:pt-8 lg:px-10 lg:pb-8 lg:pt-10", className)}>
      <div className="mx-auto max-w-7xl animate-rise">
        {customBackLink ? (
          <Link
            to={customBackLink.to as any}
            search={customBackLink.search as any}
            onClick={(e) => {
              if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
                e.preventDefault();
                window.close();
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gold hover:text-white bg-gold/15 hover:bg-gold/25 border border-gold/40 px-3.5 py-1.5 rounded-full transition-all mb-4 group cursor-pointer shadow-xs"
          >
            <ArrowLeft className="size-3.5 text-gold transition-transform group-hover:-translate-x-1" />
            <span>{customBackLink.label}</span>
          </Link>
        ) : showBackToHome ? (
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-gold transition-colors mb-3.5 group cursor-pointer"
          >
            <ArrowLeft className="size-3.5 text-gold transition-transform group-hover:-translate-x-1" />
            <span>{ta ? "முகப்புக்கு திரும்பு" : "Back to Home"}</span>
          </Link>
        ) : null}
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="mt-3 max-w-4xl whitespace-pre-line text-balance font-serif text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.05]">
          {title}
        </h1>
        {intro ? (
          <p className="measure mt-6 whitespace-pre-line text-lg text-muted-foreground">{intro}</p>
        ) : null}
      </div>
    </header>
  );
}

/** Renders an optional editorial note. Generic template notices are no longer shown to visitors. */
export function PlaceholderNote({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-4 inline-block rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground">
      {children}
    </p>
  );
}


export function CTARow({ className }: { className?: string }) {
  const { t } = useLang();
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <Link
        to="/programs"
        className="rounded-full bg-velvet px-7 py-3.5 text-sm text-primary-foreground transition-colors hover:bg-primary"
      >
        {t(ui.begin)}
      </Link>
      <Link
        to="/kriya-yoga"
        className="rounded-full border border-border px-7 py-3.5 text-sm transition-colors hover:border-primary hover:text-primary"
      >
        {t(ui.explore)}
      </Link>
    </div>
  );
}

export function Field({
  label,
  children,
  htmlFor,
  required,
  error,
}: {
  label: string;
  htmlFor?: string | undefined;
  children: ReactNode;
  required?: boolean | undefined;
  error?: string | undefined;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-2 flex items-center justify-between text-xs tracking-widest text-muted-foreground uppercase">
        <span>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
        {error && <span className="text-xs font-normal normal-case text-red-500">{error}</span>}
      </span>
      {children}
    </label>
  );
}

export function inputClass(error?: string | boolean | null): string {
  return cn(
    "w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-base outline-none transition-colors",
    error ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary",
  );
}

