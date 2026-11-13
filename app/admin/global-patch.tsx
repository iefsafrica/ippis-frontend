"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function clearStaleBodyLocks() {
  if (typeof document === "undefined") return;

  const hasOpenOverlay = Boolean(
    document.querySelector(
      '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [data-radix-menu-content][data-state="open"], [data-radix-select-content][data-state="open"]'
    )
  );

  if (!hasOpenOverlay) {
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "";
    }
    if (document.body.hasAttribute("data-scroll-locked")) {
      document.body.removeAttribute("data-scroll-locked");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }
}

export default function GlobalPatch() {
  const pathname = usePathname();

  useEffect(() => {
    clearStaleBodyLocks();
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent automatic service worker registration and clear any stale registrations
    if ("serviceWorker" in navigator && navigator.serviceWorker) {
      const originalRegister = navigator.serviceWorker.register;

      navigator.serviceWorker.register = function (...args) {
        return originalRegister.apply(this, args).catch((error) => {
          console.warn("Service worker registration suppressed:", error);
          return Promise.resolve(undefined as any);
        });
      };

      navigator.serviceWorker
        .getRegistrations?.()
        .then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().catch(() => {});
          });
        })
        .catch(() => {});
    }

    // Guard against Radix UI leaving pointer-events: none or scroll locks on document.body
    // after route transitions or nested menu/dialog interactions.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (
        document.body.style.pointerEvents === "none" ||
        document.body.hasAttribute("data-scroll-locked")
      ) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(clearStaleBodyLocks, 180);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "data-scroll-locked"],
    });

    window.addEventListener("popstate", clearStaleBodyLocks);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("popstate", clearStaleBodyLocks);
    };
  }, []);

  return null;
}
