"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "@/store/theme.store";
import { useLanguageStore } from "@/store/language.store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const { theme } = useThemeStore();
  const { lang } = useLanguageStore();

  // Apply theme to HTML root element on mount/change
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* React key forces total text subtree update when active language changes */}
        <div key={lang} className="contents">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#09090b",
              border: "1px solid #e4e4e7",
              fontSize: "0.875rem",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
            },
            success: {
              iconTheme: {
                primary: "#0B7A3B",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
