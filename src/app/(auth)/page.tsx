"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SplashPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 w-full">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-500/30 mb-8"
      >
        <Heart className="w-12 h-12 text-white" fill="white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3"
      >
        SugarMatch
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground text-center text-lg mb-12 max-w-xs"
      >
        Find your perfect match. A premium dating experience.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm space-y-4"
      >
        <Link href="/register" className="block">
          <Button className="w-full h-14 text-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/25">
            Get Started
          </Button>
        </Link>

        <Link href="/login" className="block">
          <Button variant="outline" className="w-full h-14 text-lg border-rose-200 text-rose-600 hover:bg-rose-50">
            I have an account
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 flex gap-8 text-muted-foreground"
      >
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-400" />
          <span className="text-xs">Premium</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Shield className="w-5 h-5 text-rose-400" />
          <span className="text-xs">Verified</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400" />
          <span className="text-xs">Real Matches</span>
        </div>
      </motion.div>
    </div>
  );
}
