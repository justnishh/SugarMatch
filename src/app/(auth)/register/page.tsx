"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Diamond } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center w-full">
      <Link href="/" className="absolute left-0 top-0 p-4">
        <ArrowLeft className="w-6 h-6 text-muted-foreground" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-3xl font-bold mb-2">Who are you?</h1>
        <p className="text-muted-foreground mb-10">
          Choose your role to get started
        </p>
      </motion.div>

      <div className="space-y-4 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/register/seeker">
            <div className="border-2 border-rose-200 rounded-2xl p-6 hover:border-rose-400 hover:bg-rose-50/50 transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:from-rose-200 group-hover:to-pink-200 transition-all">
                  <Search className="w-7 h-7 text-rose-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">Sugar Seeker</h3>
                  <p className="text-muted-foreground text-sm">
                    I&apos;m looking for a Sugar Daddy or Sugar Momma who can support me
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/register/partner">
            <div className="border-2 border-purple-200 rounded-2xl p-6 hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-indigo-200 transition-all">
                  <Diamond className="w-7 h-7 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">Sugar Partner</h3>
                  <p className="text-muted-foreground text-sm">
                    I&apos;m a Sugar Daddy or Momma looking for a companion
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      <p className="text-center text-muted-foreground mt-auto pt-8">
        Already have an account?{" "}
        <Link href="/login" className="text-rose-500 font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
