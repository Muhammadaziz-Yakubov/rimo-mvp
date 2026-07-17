"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { ShieldCheck, Info, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth.store";

const loginSchema = z.object({
  username: z.string().min(3, "Integration username must be at least 3 characters."),
  password: z.string().min(6, "Integration password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function ConnectGovernmentPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const res = await apiClient.post("/auth/login", values);
      
      toast.success("Hukumat hisob muvaffaqiyatli ulandi.");

      // Build workspace from real login response
      const realWorkspace = res.data.workspace || {
        id: res.data.workspace?.id || "ws-default",
        name: res.data.workspace?.name || "Ish maydoni",
        ownerId: res.data.user.id,
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
            username: values.username,
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

      router.push("/dashboard");
    } catch (e: any) {
      // Errors are handled inside response interceptor in apiClient
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post("/auth/demo-login");

      toast.success("Demo rejimga kirildi!");

      const demoWorkspace = res.data.workspace || {
        id: "demo-workspace-id-0000000",
        name: "Demo Ish Maydoni",
        ownerId: res.data.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAuth({
        user: {
          uuid: res.data.user.id,
          pin: res.data.user.pin,
          status: "active",
          credential: {
            id: "cred-demo",
            username: "demo_user",
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
              firstname: "Demo",
              surname: "Foydalanuvchi",
              fullname: "Demo Foydalanuvchi",
            },
          },
        },
        workspace: demoWorkspace,
        workspaces: [demoWorkspace],
        role: "Admin",
      });

      router.push("/dashboard");
    } catch (e: any) {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B7A3B] text-white font-bold text-2xl shadow-sm mb-3">
          S
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Soliqly
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider font-semibold text-[10px]">
          Soliq Avtomatlashtirish Tizimi
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold text-center">
            Hukumat hisobiga ulaning
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Soliq hisobotlarini avtomatlashtirish uchun rasmiy integratsiya ma'lumotlaringizni kiriting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold">
                Integratsiya foydalanuvchi nomi
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g. basic_username"
                {...register("username")}
                className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus-visible:ring-[#0B7A3B]"
                disabled={loading}
              />
              {errors.username && (
                <p className="text-xs font-medium text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold">
                Integratsiya paroli
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pr-10 focus-visible:ring-[#0B7A3B]"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B7A3B] hover:bg-[#096631] text-white py-2 shadow-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tekshirilmoqda...
                </>
              ) : (
                "Tasdiqlash va ulash"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center border-t border-zinc-100 dark:border-zinc-850 p-4 bg-zinc-50/50 dark:bg-zinc-950/20 text-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <ShieldCheck className="h-4 w-4 text-[#0B7A3B]" />
            Uchidan-uchiga shifrlangan va hukumat tomonidan ruxsat etilgan
          </div>
          <div className="flex gap-1 text-[11px] text-zinc-400">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            Hisobot ma'lumotlari AES-256 bilan shifrlangan va hech kimga uzatilmaydi.
          </div>
        </CardFooter>
      </Card>

      {/* Demo Login Section */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-zinc-50 dark:bg-zinc-950 px-3 text-zinc-400 font-semibold tracking-wider">
            yoki
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[#0B7A3B]/40 bg-[#0B7A3B]/5 dark:bg-[#0B7A3B]/10 p-4">
        <div className="text-center mb-3">
          <p className="text-xs font-semibold text-[#0B7A3B] dark:text-[#4ade80] uppercase tracking-wider">
            🎯 Demo uchun
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Hukumat hisobi bo'lmasa ham tizimni sinab ko'ring
          </p>
        </div>
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#0B7A3B]/30 bg-white dark:bg-zinc-900 hover:bg-[#0B7A3B]/5 dark:hover:bg-[#0B7A3B]/20 text-[#0B7A3B] dark:text-[#4ade80] text-sm font-semibold py-2.5 px-4 transition-all duration-200 disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="text-base">👤</span>
              Demo sifatida kirish
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600 mt-2">
          Demo rejimda ma'lumotlar saqlanmaydi • Faqat ko'rish uchun
        </p>
      </div>
    </div>
  );
}
