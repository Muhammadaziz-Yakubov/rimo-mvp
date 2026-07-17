"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  FileCheck,
  Calculator,
  Bell,
  Settings,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border border-[#e5e7eb] dark:border-[#1e293b] bg-[#f8fafc] dark:bg-[#151b2c] px-3 py-2 text-sm text-[#64748b] hover:bg-[#eff6ff] dark:hover:bg-[#1e293b] transition-all cursor-pointer"
      >
        <span className="flex items-center gap-2.5">
          <Search className="h-4 w-4 text-[#64748b]" />
          <span className="text-[12px] font-medium">Qidirish...</span>
        </span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded-md border border-[#e5e7eb] dark:border-[#1e293b] bg-white dark:bg-[#0d111c] px-1.5 font-mono text-[9px] font-bold text-[#64748b]">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Qidiruv — sahifani tanlang..." />
        <CommandList className="bg-white dark:bg-[#0f172a] border-[#e5e7eb] dark:border-[#1e293b]">
          <CommandEmpty>Natija topilmadi.</CommandEmpty>
          <CommandGroup heading="Asosiy sahifalar">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))} className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4 text-[#64748b]" />
              <span>Bosh sahifa</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/reports/new"))} className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4 text-[#64748b]" />
              <span>Yangi hisobot yaratish</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/reports"))} className="cursor-pointer">
              <FileCheck className="mr-2 h-4 w-4 text-[#64748b]" />
              <span>Topshirilgan hisobotlar</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/tax-calculator"))} className="cursor-pointer">
              <Calculator className="mr-2 h-4 w-4 text-[#64748b]" />
              <span>Soliq kalkulyatori</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Boshqa bo'limlar">
            <CommandItem onSelect={() => runCommand(() => router.push("/notifications"))} className="cursor-pointer">
              <Bell className="mr-2 h-4 w-4 text-[#64748b]" />
              <span>Bildirishnomalar</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/organizations"))} className="cursor-pointer">
              <Building2 className="mr-2 h-4 w-4 text-[#64748b]" />
              <span>Tashkilot (Korxonalar)</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-[#64748b]" />
              <span>Sozlamalar</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
