"use client";

import { useSidebar } from "@/app/context/SidebarContext";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <main className={`flex-1 min-w-0 transition-all duration-300 ${isOpen ? "lg:ml-72" : ""}`}>
      <div className="page-wrap">
        {children}
      </div>
    </main>
  );
}
