import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ErrorComponentProps
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LanguageProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/WhatsAppButton";
import { ScrollObserver } from "@/components/ScrollObserver";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DesktopSideNav } from "@/components/DesktopSideNav";
import { cn } from "@/lib/utils";

import notFoundIllustration from "@/assets/images/not-found-illustion.png";
import { Home, Compass, MessageCircle, ArrowLeft } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:py-16 text-center">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-b from-amber-500/10 via-gold/5 to-transparent rounded-full blur-3xl opacity-70" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-[0.25em] text-gold uppercase backdrop-blur-md shadow-sm mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          404 • Lost in the Flow
        </div>

        {/* Vector Illustration Display - Pure floating vector with natural transparent blend */}
        <div className="relative max-w-[280px] sm:max-w-[340px] md:max-w-[390px] mx-auto mb-2 transition-transform duration-700 hover:scale-105">
          <img
            src={notFoundIllustration}
            alt="404 Page Not Found Illustration"
            className="w-full h-auto object-contain select-none filter drop-shadow-[0_15px_30px_rgba(212,175,55,0.18)]"
            loading="eager"
          />
        </div>

        {/* Headings */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-foreground">
          Sacred Path Not Found
        </h1>
        <p className="mt-3 max-w-lg text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
          The page you are seeking seems to have dissolved into stillness or moved to a different realm. Return to the center and begin your journey anew.
        </p>

        {/* Navigation CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 w-full">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#d4af37] px-6 py-3 text-sm font-semibold text-[#1a140b] shadow-lg shadow-gold/20 transition-all duration-300 hover:brightness-110 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>

          <Link
            to="/programs"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-background/80 backdrop-blur-md px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-gold/50 hover:bg-gold/5 hover:scale-[1.02]"
          >
            <Compass className="w-4 h-4 text-gold" />
            Explore Programs
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-transparent px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40"
          >
            <MessageCircle className="w-4 h-4" />
            Need Guidance?
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error as Error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "THE KRIYA LAB — Kriya Yoga School in English & Tamil" },
      {
        name: "description",
        content:
          "A modern laboratory for exploring ancient yogic wisdom through breath, meditation and direct experience.",
      },
      { property: "og:title", content: "THE KRIYA LAB — Kriya Yoga for Inner Exploration" },
      {
        property: "og:description",
        content: "Experiment. Experience. Evolve. Kriya Yoga for modern seekers, in English and Tamil.",
      },
      { property: "og:site_name", content: "THE KRIYA LAB" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500&family=Noto+Sans+Tamil:wght@300;400;500&family=Noto+Serif+Tamil:wght@300;400;500&family=Poppins:wght@300;400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isPortal = pathname.startsWith("/admin");
  const hideFooter = ["/programs", "/events", "/dashboard", "/profile"].some(path => pathname.startsWith(path));

  if (isPortal) {
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <Outlet />
        </LanguageProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ScrollObserver />
        <div className={cn("flex min-h-screen flex-col", !isPortal ? "pb-[4.25rem] md:pb-0" : "", hideFooter ? "md:pl-[5rem]" : "")}>
          <Header />
          <main className="flex-1 flex flex-col">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
          {!hideFooter && <Footer />}
        </div>
        <FloatingWhatsApp />
        {!isPortal && <MobileBottomNav />}
        {!isPortal && hideFooter && <DesktopSideNav />}
      </LanguageProvider>
    </QueryClientProvider>
  );
}
