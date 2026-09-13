import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { ui } from "@/content/site";

export function Section({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "velvet";
}) {
  return (
    <section
      className={cn(
        "px-5 py-20 lg:px-10 lg:py-28",
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
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="bg-dawn px-5 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28">
      <div className="mx-auto max-w-7xl animate-rise">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="mt-5 max-w-4xl whitespace-pre-line text-balance font-serif text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.05]">
          {title}
        </h1>
        {intro ? (
          <p className="measure mt-7 whitespace-pre-line text-lg text-muted-foreground">{intro}</p>
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
        to="/enroll"
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
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-2 block text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none transition-colors focus:border-primary";
