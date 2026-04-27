"use client";

import { useSidebar } from "@/app/context/SidebarContext";

export default function SidebarToggle() {
  const { isOpen, toggle } = useSidebar();

  return (
    <button
      id="sidebar-toggle"
      onClick={toggle}
      className="fixed top-4 left-4 z-[60] p-3 rounded-sm border border-gold/20 bg-card hover:bg-gold/10 transition-colors text-gold shadow-lg"
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      aria-expanded={isOpen}
    >
      <div className="flex flex-col gap-1.5 w-6">
        <span className={`block h-0.5 bg-current transition-all ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block h-0.5 bg-current transition-all ${isOpen ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 bg-current transition-all ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </div>
    </button>
  );
}
