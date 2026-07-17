"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { ErrorBoundary } from "./error-boundary";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiClient } from "@/services/api-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();
  const router = useRouter();

  // Always verify session on mount — this catches Redis flush after backend restart
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/auth/me");
        
        // Build workspace object from real /auth/me response
        const realWorkspace = res.data.workspace || {
          id: res.data.workspaceId,
          name: "Ish maydoni",
          ownerId: res.data.user?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setAuth({
          user: {
            uuid: res.data.user.id,
            pin: res.data.user.pin,
            status: "active",
            credential: {
              id: "cred-0",
              username: res.data.user.username || res.data.user.pin || "",
              user_type: "juridical",
              status: "valid",
              expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            },
            user: {
              pin: res.data.user.pin,
              status: "active",
              uuid: res.data.user.id,
              profile: {
                pin: res.data.user.pin,
                firstname: res.data.user.fullname?.split(" ")[0] || "User",
                surname: res.data.user.fullname?.split(" ")[1] || "",
                fullname: res.data.user.fullname || "",
              },
            },
          },
          workspace: realWorkspace,
          workspaces: [realWorkspace],
          role: res.data.role || "Admin",
        });
      } catch (e) {
        clearAuth();
        router.push("/connect-government");
      }
    };

    fetchSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#0d111c]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] dark:from-[#3b82f6] dark:to-[#2563eb] shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-2xl tracking-tight">S</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1.5">
              {[0,1,2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[#2563eb] dark:bg-[#3b82f6] animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-[#64748b] tracking-wider mt-1">
              Yuklanmoqda...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0d111c] overflow-hidden">
        {/* Chap yon navigatsiya paneli */}
        <Sidebar />

        {/* Asosiy kontent paneli */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Yuqori navigatsiya paneli */}
          <Navbar />

          {/* Asosiy kontent maydoni */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
