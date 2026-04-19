"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Crown, Heart, Eye, Star, Shield, Zap, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePremium } from "@/lib/hooks/usePremium";
import { activatePremium } from "@/lib/premium";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const plans = [
  {
    name: "Weekly",
    price: "₹499",
    period: "/week",
    popular: false,
    tier: "weekly" as const,
    features: ["Unlimited swipes", "See who liked you", "1 Super Like/day"],
  },
  {
    name: "Monthly",
    price: "₹1,499",
    period: "/month",
    popular: true,
    tier: "monthly" as const,
    features: ["Unlimited swipes", "See who liked you", "2 Super Likes/day"],
  },
  {
    name: "Lifetime",
    price: "₹2,999",
    period: "",
    popular: false,
    tier: "lifetime" as const,
    features: ["Unlimited swipes", "See who liked you", "5 Super Likes/day", "Incognito Mode", "Priority Ranking"],
  },
];

const tierColors = {
  free: "bg-gray-200 text-gray-700",
  weekly: "bg-amber-100 text-amber-800",
  monthly: "bg-amber-200 text-amber-900",
  lifetime: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white",
};

export default function PremiumPage() {
  const router = useRouter();
  const { status, userId: hookUserId, loading: hookLoading, tier } = usePremium();
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get fresh userId on mount
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    }
    getUser();
  }, []);

  async function handleTestPay(tierName: "weekly" | "monthly" | "lifetime") {
    // Use fresh userId from state or fallback to hook
    const currentUserId = userId || hookUserId;
    
    if (!currentUserId) {
      toast.error("Please sign in first");
      return;
    }

    setProcessing(true);
    setSelectedPlan(tierName);

    try {
      await activatePremium(currentUserId, tierName);
      toast.success(`Successfully activated ${tierName} plan!`);
      
      // Update local state immediately
      setUserId(currentUserId);
      
      // Small delay then reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Premium activation error:", error);
      toast.error("Failed to activate premium. Please try again.");
    } finally {
      setProcessing(false);
      setSelectedPlan(null);
    }
  }

  function handleDeactivate() {
    router.push("/settings");
  }

  return (
    <div className="px-4 py-6 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Premium</h1>
      </div>

      {/* Loading state */}
      {(hookLoading || !userId) && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <span className="ml-2 text-muted-foreground">Loading...</span>
        </div>
      )}

      {/* Current Status */}
      {status?.isActive && (
        <div className={`rounded-2xl p-4 ${tierColors[status.tier ?? "free"]}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6" />
              <div>
                <p className="font-bold capitalize">{status.tier} Plan</p>
                <p className="text-sm opacity-80">
                  {status.tier === "lifetime"
                    ? "Active forever"
                    : `Expires ${status.expiresAt?.toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-0">
              {status.superLikesRemaining} Super Likes left
            </Badge>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Get unlimited access and find your match faster
        </p>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border-2 transition-all ${
              plan.popular
                ? "border-amber-400 bg-amber-50"
                : "border-border hover:border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-left">{plan.name}</p>
                  {plan.popular && (
                    <Badge className="bg-amber-500 text-white text-[10px] mt-0.5">
                      Most Popular
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-xs text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="px-4 pb-3 space-y-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="p-4 pt-2">
              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                    : ""
                }`}
                disabled={processing || tier === plan.tier}
                onClick={() => handleTestPay(plan.tier)}
              >
                {processing && selectedPlan === plan.tier
                  ? "Processing..."
                  : tier === plan.tier
                  ? "Current Plan"
                  : plan.tier === "lifetime"
                  ? "Get Lifetime Access"
                  : `Subscribe to ${plan.name}`}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Deactivate hint */}
      {status?.isActive && (
        <p className="text-xs text-center text-muted-foreground">
          To manage your subscription, visit Settings
        </p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Cancel anytime. Auto-renews unless cancelled. Test mode - no real payment.
      </p>
    </div>
  );
}