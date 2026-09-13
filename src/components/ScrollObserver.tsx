import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Universal Scroll & Reveal Observer for all pages
 * Discovers sections, card grids, headlines, paragraphs, and lists to create
 * a rich, staggered, smooth entrance experience across all views.
 */
export function ScrollObserver() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  useEffect(() => {
    // Delay slightly to ensure DOM has rendered
    const timeoutId = setTimeout(() => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("section, header.bg-dawn, main > div"));

      sections.forEach((sec) => {
        sec.classList.add("reveal-group");

        // Find internal content blocks that deserve smooth reveal
        const childSelectors = [
          ".grid > *",
          "article",
          "header > *",
          "h2",
          "h3",
          "blockquote",
          "ul > li",
          ".card",
          ".rounded-2xl",
          ".rounded-3xl"
        ].join(", ");

        const children = Array.from(sec.querySelectorAll<HTMLElement>(childSelectors));
        children.forEach((child) => {
          // Avoid nesting reveal-child inside another reveal-child unnecessarily
          if (!child.classList.contains("reveal-child")) {
            child.classList.add("reveal-child");
          }
        });
      });

      const observeTargets = Array.from(
        document.querySelectorAll<HTMLElement>("section, header.bg-dawn, .reveal-on-scroll, .reveal-group, .reveal-scale, .reveal-fade")
      );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.06,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      observeTargets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight - 30;

        if (inView) {
          el.classList.add("is-revealed");
        } else {
          observer.observe(el);
        }
      });
    }, 40);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}

