"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBackToToolkit() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:hidden">
      <Link
        href="/"
        className="ui-button ui-button-primary w-full justify-center text-center uppercase tracking-widest text-xs"
        aria-label="Back to toolkit"
      >
        Back to Toolkit
      </Link>
    </div>
  );
}
