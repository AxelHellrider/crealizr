"use client";

import { createContext, useCallback, useContext, useState, useEffect } from "react";

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Close sidebar when clicking outside.
  // Any toggle button (desktop SidebarToggle, mobile Header hamburger) must
  // carry data-sidebar-toggle so its own mousedown isn't treated as "outside" —
  // otherwise mousedown closes the sidebar here and the button's own click
  // handler immediately reopens it (only reproducible where mousedown fires
  // ahead of click, e.g. iOS Safari's synthetic tap event order).
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const sidebar = document.getElementById("sidebar");
      if (!sidebar || sidebar.contains(target)) return;
      if ((target as Element).closest?.("[data-sidebar-toggle]")) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Functional update avoids stale closure on isOpen
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
