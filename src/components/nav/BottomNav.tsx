"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/home", icon: Home, label: "Discover" },
  { href: "/liked", icon: Heart, label: "Liked You" },
  { href: "/matches", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [unreadCount] = useState(3);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-rose-100 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative",
                isActive
                  ? "text-rose-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <item.icon
                  className={cn("w-6 h-6", isActive && "fill-rose-100")}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {item.href === "/matches" && unreadCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
