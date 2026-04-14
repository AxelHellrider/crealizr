import React from "react";

/**
 * Atomic Select component
 * Optimized for fast CSS paints and high-contrast accessibility.
 * FFXIV-inspired focus states with gold/silver accents.
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ children, className = "", ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`ui-select w-full min-h-[44px] sm:min-h-[38px] transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold 
      bg-bg-elev border-silver/30 text-foreground
      ${className}`}
    >
      {children}
    </select>
  );
}
