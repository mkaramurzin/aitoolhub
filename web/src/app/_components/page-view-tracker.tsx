"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface PageViewTrackerProps {
  gaId: string;
}

// Optional: Extend the global Window interface to include gtag.
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function PageViewTracker({
  gaId,
}: PageViewTrackerProps): JSX.Element | null {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("config", gaId, { page_path: pathname });
    }
  }, [pathname, gaId]);

  return null;
}
