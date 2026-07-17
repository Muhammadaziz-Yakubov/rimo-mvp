"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-red-600 px-4 py-2 text-center text-sm font-medium text-white shadow-md"
        >
          <WifiOff className="mr-2 h-4 w-4 animate-pulse" />
          You are currently offline. Some write and submit operations are disabled until connection resumes.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
