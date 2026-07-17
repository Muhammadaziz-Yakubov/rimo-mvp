"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  ShieldCheck, 
  Info, 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Building2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth.store";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(3, "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak."),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak."),
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
      
      toast.success("Hukumat hisobi muvaffaqiyatli ulandi.");

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
              firstname: res.data.user.fullname?.split(" ")[0] || "Foydalanuvchi",
              surname: res.data.user.fullname?.split(" ")[1] || "",
              fullname: res.data.user.fullname || "",
            },
          },
        },
        workspace: realWorkspace,
        workspaces: [realWorkspace],
        role: res.data.role || "Admin",
        sessionToken: res.data.sessionToken,
      });

      router.push("/dashboard");
    } catch (e: any) {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post("/auth/demo-login");

      toast.success("Demo rejimda muvaffaqiyatli kirildi!");

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
        sessionToken: res.data.sessionToken,
      });

      router.push("/dashboard");
    } catch (e: any) {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 overflow-x-hidden transition-colors duration-200">
      
      {/* LEFT SIDE: Clean Light Brand Presentation & Graphics */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-100 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-[#0B7A3B]/20 items-center justify-center p-12 overflow-hidden border-r border-slate-200 dark:border-slate-800/60">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#0B7A3B]/5 dark:bg-[#0B7A3B]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 dark:opacity-20" />

        <div className="relative z-10 max-w-lg space-y-12">
          
          {/* Header Branding */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 dark:border-[#0B7A3B]/30 bg-emerald-50 dark:bg-[#0B7A3B]/10 text-[#0B7A3B] dark:text-[#4ade80] text-xs font-semibold tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Avtomatlashtirilgan Tizim v1.2</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none"
            >
              Soliq hisobotlari endi osonroq
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 text-base leading-relaxed"
            >
              Hukumat portalining integratsiyalari bilan ish vaqtingizni tejang va barcha jarayonlarni sun'iy intellekt yordamida to'liq avtomatlashtiring.
            </motion.p>
          </div>

          {/* Interactive Floating Card Graphics */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            {/* Main Interactive Mock Card */}
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#0B7A3B]/20 flex items-center justify-center border border-emerald-100 dark:border-[#0B7A3B]/30">
                    <Building2 className="w-4 h-4 text-[#0B7A3B] dark:text-[#4ade80]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Soliqly AI Dashboard</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Barcha hisobotlar faol holatda</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">Soliq Sog'lomligi</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-slate-900 dark:text-white">98%</span>
                      <span className="text-[9px] text-[#0B7A3B] dark:text-[#4ade80] font-bold flex items-center bg-emerald-50 dark:bg-[#4ade80]/10 px-1.5 py-0.5 rounded">A'lo</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider">Tejalgan Soliqlar</span>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-sm font-black">+14.2M UZS</span>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Deklaratsiyalar holati</span>
                    <span className="text-emerald-600 dark:text-[#4ade80] font-bold">Jo'natildi (100%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0B7A3B] to-[#4ade80] rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Accent trust notification */}
            <div className="absolute -bottom-8 -right-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/70 p-4 shadow-lg backdrop-blur-md hidden xl:block w-52 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-900 dark:text-white font-sans">Xavfsizlik Kafolati</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal">
                Barcha integratsiya ma'lumotlaringiz davlat standartlari asosida shifrlanadi.
              </p>
            </div>
          </motion.div>

          {/* Bullet Points */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B7A3B] dark:text-[#4ade80] shrink-0" />
              <span>E-imzo & Hisob-kitoblar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B7A3B] dark:text-[#4ade80] shrink-0" />
              <span>Avtomatik QQS hisoboti</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B7A3B] dark:text-[#4ade80] shrink-0" />
              <span>Kamera nazorati tahlili</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B7A3B] dark:text-[#4ade80] shrink-0" />
              <span>24/7 AI yordamchi</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* RIGHT SIDE: Light Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative min-h-screen">
        
        {/* Glow effect on mobile */}
        <div className="lg:hidden absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#0B7A3B]/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[420px] space-y-8 z-10">
          
          {/* Header Mobile Logo */}
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B7A3B] text-white font-extrabold text-3xl shadow-md mb-4"
            >
              S
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl font-black tracking-tight text-slate-900 dark:text-white"
            >
              Soliqly
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold mt-1.5"
            >
              Soliq Avtomatlashtirish Tizimi
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Elegant Light Card */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl dark:shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white text-center flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-[#0B7A3B] dark:text-[#4ade80]" />
                  Hukumat hisobiga ulaning
                </CardTitle>
                <CardDescription className="text-center text-xs text-slate-500 dark:text-slate-400 px-4 leading-normal">
                  Soliq hisobotlarini yuklash va yangilash uchun integratsiya login ma'lumotlarini kiriting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  
                  {/* Username Input Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Integratsiya foydalanuvchi nomi
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder="Masalan: basic_username"
                        {...register("username")}
                        className="h-10.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650 rounded-xl focus-visible:ring-1 focus-visible:ring-[#0B7A3B] focus-visible:border-[#0B7A3B] transition-all"
                        disabled={loading}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-[11px] font-bold text-red-500 mt-1">
                        ⚠️ {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Password Input Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Integratsiya paroli
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        className="h-10.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650 pr-11 rounded-xl focus-visible:ring-1 focus-visible:ring-[#0B7A3B] focus-visible:border-[#0B7A3B] transition-all"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] font-bold text-red-500 mt-1">
                        ⚠️ {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#0B7A3B] hover:bg-[#096631] text-white font-bold text-sm shadow-md mt-4 rounded-xl transition-all duration-200 border-none"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Ulanyapti...</span>
                      </div>
                    ) : (
                      "Tizimga Ulanish"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-center border-t border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/20 text-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                  <ShieldCheck className="h-4 w-4 text-[#0B7A3B] dark:text-[#4ade80]" />
                  Uchidan-uchiga shifrlangan xavfsiz ulanish
                </div>
                <div className="flex gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 px-4 leading-normal">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                  Hisobot ma'lumotlari AES-256 shifrlash kaliti yordamida himoyalangan holda saqlanadi.
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Separator */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-50 dark:bg-[#080b11] px-4 text-slate-450 dark:text-slate-500 font-bold tracking-wider">
                yoki sinab ko'ring
              </span>
            </div>
          </div>

          {/* Premium Demo Login Block */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl border border-dashed border-[#0B7A3B]/30 bg-emerald-50/30 dark:bg-[#0B7A3B]/5 p-5 text-center space-y-4"
          >
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#0B7A3B] dark:text-[#4ade80] uppercase tracking-wider bg-emerald-50 dark:bg-[#0B7A3B]/10 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-[#0B7A3B]/20">
                <span>🎯</span>
                <span>Demo Hisob</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Hukumat integratsiyasi bo'lmasa, tayyor mock ma'lumotlar bilan tizimni tahlil qiling.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-[#0B7A3B]/30 bg-white dark:bg-slate-900/60 hover:bg-emerald-50/30 dark:hover:bg-[#0B7A3B]/10 text-[#0B7A3B] dark:text-[#4ade80] text-sm font-bold transition-all duration-300 disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span className="text-base">👤</span>
                  Demo Rejimda Kirish
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-400 dark:text-slate-500">
              Demo rejimda ma'lumotlar faqat o'rganish uchun xizmat qiladi.
            </p>
          </motion.div>
          
        </div>
      </div>
      
    </div>
  );
}
