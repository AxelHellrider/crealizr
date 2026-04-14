import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ children, className = "", ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`ui-select w-full min-h-[44px] sm:min-h-[38px] transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 
      ${className}`}
    >
      {children}
    </select>
  );
}
