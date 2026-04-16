"use client";

import { useEffect, useState } from "react";
import { Users, Heart, MessageCircle, Flag, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  seekers: number;
  partners: number;
  totalMatches: number;
  totalMessages: number;
  pendingReports: number;
  activeToday: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const results = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "seeker"),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "partner"),
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      const hasError = results.some((r) => r.error);
      if (hasError) {
        toast.error("Failed to load some dashboard stats");
      }

      setStats({
        totalUsers: results[0].count || 0,
        seekers: results[1].count || 0,
        partners: results[2].count || 0,
        totalMatches: results[3].count || 0,
        totalMessages: results[4].count || 0,
        pendingReports: results[5].count || 0,
        activeToday: 0,
      });
    }
    load();
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      sub: `${stats.seekers} seekers, ${stats.partners} partners`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Matches",
      value: stats.totalMatches,
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      title: "Messages",
      value: stats.totalMessages,
      icon: MessageCircle,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      icon: Flag,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of SugarMatch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value.toLocaleString()}</p>
              {card.sub && (
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {card.sub}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
