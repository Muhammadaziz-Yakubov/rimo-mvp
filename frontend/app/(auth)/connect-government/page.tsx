"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth.store";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(3, "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak."),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function ConnectGovernmentPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
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
    <div className="w-full min-h-screen flex flex-col justify-between bg-[#FCFCFC] dark:bg-[#0A0E17] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      
      {/* Top Header - Apple / Airbnb style minimal navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-extrabold text-lg shadow-sm">
            R
          </div>
          <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Rimo
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-550 dark:text-zinc-400">
          <span>O'zbekcha</span>
          <span className="h-3 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
          <a href="https://t.me/rimo_support" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Yordam
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 my-4 z-10">
        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Main Content Area */}
          <div className="space-y-6">
            
            {/* Typography Header */}
            <div className="space-y-2 text-center sm:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0B7A3B] dark:text-[#4ade80] text-[10px] font-bold tracking-wide"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI-AVTOMATLASHTIRILGAN TIZIM</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white"
              >
                Tizimga ulaning
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal"
              >
                Soliq hisobotlarini avtomatlashtirish uchun rasmiy integratsiya login ma'lumotlaringizni kiriting.
              </motion.p>
            </div>

            {/* Login Form Wrapper */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-4"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Username input */}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Foydalanuvchi nomi
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Integratsiya login nomi"
                    {...register("username")}
                    className="h-11 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all shadow-none"
                    disabled={loading}
                  />
                  {errors.username && (
                    <p className="text-[11px] font-semibold text-red-650 dark:text-red-400 mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Parol
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-[10px] font-semibold text-emerald-600 dark:text-[#4ade80] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Login va parol olish
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className="h-11 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 pr-11 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all shadow-none"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-250 transition-colors"
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
                    <p className="text-[11px] font-semibold text-red-650 dark:text-red-400 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Main Submit Button - Black Apple-Style High Contrast */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-bold text-sm rounded-xl transition-all duration-200 shadow-sm border-none mt-2 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white dark:text-black" />
                  ) : (
                    <>
                      <span>Hukumat portaliga bog'lanish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Secure note */}
              <div className="flex items-start gap-2 justify-center text-[10px] text-zinc-400 dark:text-zinc-500 pt-2 px-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-center leading-normal">
                  AES-256 bilan shifrlangan. Rimo sizning shaxsiy ma'lumotlaringizni to'liq himoya qiladi.
                </span>
              </div>

              {/* Separator - Apple / Airbnb style */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-150 dark:border-zinc-850" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-650">
                  <span className="bg-[#FCFCFC] dark:bg-[#0A0E17] px-4">
                    yoki
                  </span>
                </div>
              </div>

              {/* Premium Airbnb style Demo Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200 text-sm font-bold transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="text-emerald-600 dark:text-[#4ade80] text-base">🎯</span>
                    <span>Demo rejimda hisobni ko'rish</span>
                  </>
                )}
              </button>
              <p className="text-center text-[9px] text-zinc-400 dark:text-zinc-550 leading-normal">
                Tizim bilan tanishish uchun foydalaning. Hukumat ma'lumotlari talab etilmaydi.
              </p>

            </motion.div>

          </div>

        </div>
      </main>

      {/* Footer - Minimalist bottom area */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-600 border-t border-zinc-100 dark:border-zinc-900 z-10 gap-3">
        <div>
          <span>© {new Date().getFullYear()} Rimo. Barcha huquqlar himoyalangan.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline">Maxfiylik kelishuvi</a>
          <a href="#" className="hover:underline">Foydalanish shartlari</a>
          <a href="#" className="hover:underline">Aloqa</a>
        </div>
      </footer>

      {/* Modern Help Modal - Apple/Airbnb style */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-[440px] bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowHelpModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-1">
                  <div className="h-10 w-10 rounded-full bg-emerald-55/40 dark:bg-emerald-950/45 flex items-center justify-center text-[#0B7A3B] dark:text-[#4ade80] mb-3">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-sans">
                    Login va parol olish tartibi
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                    hisobot.gov.uz portalidan integratsiya login va parolini olish uchun quyidagi bosqichlarni bajaring:
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      title: "Portalga kiring",
                      desc: "Brauzerda hisobot.gov.uz saytiga tashrif buyuring."
                    },
                    {
                      step: "2",
                      title: "ERI bilan kiring",
                      desc: "Tashkilotingizning (biznesingizning) ERI kaliti yordamida profilga kirish qiling."
                    },
                    {
                      step: "3",
                      title: "API hujjatlar bo'limiga o'ting",
                      desc: "Saytning pastki qismiga tushib, 'API hujjatlar' tugmasini bosing."
                    },
                    {
                      step: "4",
                      title: "Login/parol yarating",
                      desc: "'Login va parol yaratish' bo'limiga kiring. Tizim sizga integratsiya uchun login va parol taqdim etadi."
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-200">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confirm Button */}
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Tushunarli
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
