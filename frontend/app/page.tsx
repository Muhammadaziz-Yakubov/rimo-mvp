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
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-[#0B7A3B]" />
        <span className="text-[11px] font-semibold text-zinc-500 tracking-wider">Redirecting...</span>
      </div>
    </div>
  );
}
