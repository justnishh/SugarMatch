"use client";

import { motion } from "framer-motion";

interface TypingIndicatorProps {
  userName?: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 p-3">
      <div className="flex items-center gap-1 bg-muted rounded-2xl px-4 py-3">
        <motion.div
          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      {userName && (
        <span className="text-xs text-muted-foreground">{userName} is typing...</span>
      )}
    </div>
  );
}