"use client";

import { ArrowLeft, Crown, Heart, Eye, Star, Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  { name: "Weekly", price: "₹499", period: "/week", popular: false },
  { name: "Monthly", price: "₹1,499", period: "/month", popular: true },
  { name: "3 Months", price: "₹2,999", period: "/3 months", popular: false },
];

const features = [
  { icon: Zap, label: "Unlimited swipes", free: "20/day", premium: "Unlimited" },
  { icon: Eye, label: "See who liked you", free: "Blurred", premium: "Full access" },
  { icon: Star, label: "Super Likes", free: "1/day", premium: "5/day" },
  { icon: Shield, label: "Incognito Mode", free: "No", premium: "Yes" },
  { icon: Heart, label: "Priority ranking", free: "No", premium: "Yes" },
];

export default function PremiumPage() {
  const router = useRouter();

  return (
    <div className="px-4 py-6 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Premium</h1>
      </div>

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

      {/* Feature comparison */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-3 bg-muted/50 text-xs font-medium text-muted-foreground">
          <div className="px-4 py-3">Feature</div>
          <div className="px-4 py-3 text-center">Free</div>
          <div className="px-4 py-3 text-center text-amber-600">Premium</div>
        </div>
        {features.map((f) => (
          <div key={f.label} className="grid grid-cols-3 border-t text-sm">
            <div className="px-4 py-3 flex items-center gap-2">
              <f.icon className="w-4 h-4 text-muted-foreground" />
              <span>{f.label}</span>
            </div>
            <div className="px-4 py-3 text-center text-muted-foreground">
              {f.free}
            </div>
            <div className="px-4 py-3 text-center font-medium text-amber-600">
              {f.premium}
            </div>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <button
            key={plan.name}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
              plan.popular
                ? "border-amber-400 bg-amber-50"
                : "border-border hover:border-amber-200"
            }`}
          >
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
              <span className="text-xs text-muted-foreground">
                {plan.period}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Button
        className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
        onClick={() => {
          // Payment integration placeholder
          alert("Payment integration coming soon!");
        }}
      >
        <Crown className="w-5 h-5 mr-2" />
        Subscribe Now
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Cancel anytime. Auto-renews unless cancelled.
      </p>
    </div>
  );
}
