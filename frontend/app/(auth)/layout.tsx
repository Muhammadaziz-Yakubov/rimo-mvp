import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0b0f19] flex items-center justify-center font-sans">
      {children}
    </div>
  );
}
