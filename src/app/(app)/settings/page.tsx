"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Bell,
  Shield,
  Eye,
  HelpCircle,
  LogOut,
  Trash2,
  ChevronRight,
  Crown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { toast } from "sonner";
import type { UserProfile } from "@/types/database";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Discovery settings
  const [ageRange, setAgeRange] = useState([18, 60]);
  const [distance, setDistance] = useState(50);
  const [isHidden, setIsHidden] = useState(false);
  const { detecting, detect } = useGeolocation();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const u = profile as UserProfile;
      setUser(u);
      setAgeRange([u.age_min_pref, u.age_max_pref]);
      setDistance(u.distance_radius_km);
      setIsHidden(u.is_hidden);
      setLoading(false);
    }
    load();
  }, []);

  async function saveDiscovery() {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from("users")
      .update({
        age_min_pref: ageRange[0],
        age_max_pref: ageRange[1],
        distance_radius_km: distance,
        is_hidden: isHidden,
      })
      .eq("id", user.id);
    toast.success("Settings saved");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    if (!user) return;

    const supabase = createClient();
    await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", user.id);
    await supabase.auth.signOut();
    toast.success("Account deleted");
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Premium */}
      <button
        className="w-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-left"
        onClick={() => router.push("/premium")}
      >
        <Crown className="w-8 h-8 text-amber-500" />
        <div className="flex-1">
          <p className="font-semibold text-amber-900">Upgrade to Premium</p>
          <p className="text-xs text-amber-700">
            Unlimited swipes, see who liked you & more
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-amber-500" />
      </button>

      {/* Discovery Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          <h2 className="font-semibold">Discovery Settings</h2>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Age Range</Label>
            <span className="text-sm text-muted-foreground">
              {ageRange[0]} – {ageRange[1]}
            </span>
          </div>
          <Slider
            value={ageRange}
            onValueChange={(val) => setAgeRange(val as number[])}
            min={18}
            max={80}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Maximum Distance</Label>
            <span className="text-sm text-muted-foreground">{distance} km</span>
          </div>
          <Slider
            value={[distance]}
            onValueChange={(val) => setDistance((val as number[])[0])}
            min={5}
            max={200}
            step={5}
          />
        </div>

        <Button
          onClick={saveDiscovery}
          variant="outline"
          className="w-full border-rose-200 text-rose-600"
        >
          Save Discovery Settings
        </Button>
      </div>

      <Separator />

      {/* Privacy */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-rose-500" />
          <h2 className="font-semibold">Privacy</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Hide Profile</p>
            <p className="text-xs text-muted-foreground">
              Your profile won&apos;t appear in discovery
            </p>
          </div>
          <Switch checked={isHidden} onCheckedChange={setIsHidden} />
        </div>
      </div>

      <Separator />

      {/* Menu items */}
      <div className="space-y-1">
        {[
          { icon: Bell, label: "Notifications", href: "#" },
          { icon: Shield, label: "Safety & Reporting", href: "#" },
          { icon: HelpCircle, label: "Help & Support", href: "#" },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-muted transition-all"
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-left text-sm font-medium">
              {item.label}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <Separator />

      {/* Danger zone */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Log Out
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleDeleteAccount}
        >
          <Trash2 className="w-4 h-4 mr-3" />
          Delete Account
        </Button>
      </div>
    </div>
  );
}
