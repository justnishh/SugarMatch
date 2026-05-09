"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <Link href="/" className="self-start mb-8">
        <ArrowLeft className="w-6 h-6 text-muted-foreground" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-rose-500" fill="currentColor" />
          <h1 className="text-3xl font-bold">Welcome back</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Sign in to continue finding matches
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

         <Button
             type="submit"
             disabled={loading}
             className="w-full h-14 text-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
           </Button>
         </form>

         {/* OR DIVIDER */}
         <div className="flex items-center my-6">
           <div className="w-1 bg-gray-200 flex-1"></div>
           <span className="px-3 text-sm text-muted-foreground">Or continue with</span>
           <div className="w-1 bg-gray-200 flex-1"></div>
         </div>

         {/* OAUTH BUTTONS */}
         <div className="space-y-3">
           <a
             href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v2/authorize?provider=google&redirect_to=${encodeURIComponent('/api/auth/callback')}&response_type=code`}
             className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
           >
             <div className="flex items-center gap-3">
               {/* Google logo */}
               <div className="flex-shrink-0">
                 <img src="https://cdnjs.cloudflare.com/ajax/libs/simple-icons/7.14.0/google.svg" width="20" height="20" alt="Google" />
               </div>
               <span className="text-sm font-medium text-gray-900">Continue with Google</span>
             </div>
           </a>
           
           <a
             href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v2/authorize?provider=facebook&redirect_to=${encodeURIComponent('/api/auth/callback')}&response_type=code`}
             className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
           >
             <div className="flex items-center gap-3">
               {/* Facebook logo */}
               <div className="flex-shrink-0">
                 <img src="https://cdnjs.cloudflare.com/ajax/libs/simple-icons/7.14.0/facebook.svg" width="20" height="20" alt="Facebook" />
               </div>
               <span className="text-sm font-medium text-gray-900">Continue with Facebook</span>
             </div>
           </a>
         </div>

         <p className="text-center text-muted-foreground mt-6">
           Don&apos;t have an account?{" "}
           <Link href="/register" className="text-rose-500 font-medium hover:underline">
             Sign Up
           </Link>
         </p>
      </motion.div>
    </div>
  );
}
