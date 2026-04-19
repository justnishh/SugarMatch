"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPremiumStatus, PremiumStatus } from "@/lib/premium";

export function usePremium() {
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchStatus() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);
      const premiumStatus = await getPremiumStatus(user.id);
      setStatus(premiumStatus);
      setLoading(false);
    }

    fetchStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      await fetchStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    status,
    loading,
    userId,
    isPremium: status?.isActive ?? false,
    tier: status?.tier,
  };
}