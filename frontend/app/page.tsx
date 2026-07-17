"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically route home page views to the main authenticated dashboard panel
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FCFCFC] dark:bg-[#0A0E17] font-sans transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Brand Pulse */}
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-extrabold text-2xl shadow-md">
            R
          </div>
          {/* Concentric loading rings */}
          <div className="absolute -inset-4 rounded-[28px] border border-zinc-200 dark:border-zinc-800 animate-ping opacity-20 pointer-events-none" />
        </div>
        
        <div className="flex flex-col items-center gap-1 mt-4">
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5">
            Yuklanmoqda...
          </span>
        </div>
      </div>
    </div>
  );
}
