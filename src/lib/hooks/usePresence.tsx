"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type UserStatus = "online" | "away" | "offline";

interface UsePresenceOptions {
  userId: string;
  updateInterval?: number;
}

export function usePresence({ userId, updateInterval = 60000 }: UsePresenceOptions) {
  const [status, setStatus] = useState<UserStatus>("offline");
  const [lastActive, setLastActive] = useState<Date | null>(null);

  const updatePresence = useCallback(async () => {
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", userId);
  }, [userId]);

  const fetchStatus = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("last_active_at")
      .eq("id", userId)
      .single();

    if (data?.last_active_at) {
      const lastActiveDate = new Date(data.last_active_at);
      setLastActive(lastActiveDate);
      const now = new Date();
      const diffMs = now.getTime() - lastActiveDate.getTime();
      const diffMins = diffMs / 60000;

      if (diffMins < 2) {
        setStatus("online");
      } else if (diffMins < 30) {
        setStatus("away");
      } else {
        setStatus("offline");
      }
    } else {
      setStatus("offline");
    }
  }, [userId]);

  useEffect(() => {
    updatePresence();
    const interval = setInterval(updatePresence, updateInterval);
    return () => clearInterval(interval);
  }, [updatePresence, updateInterval]);

  useEffect(() => {
    const interval = setInterval(fetchStatus, 30000);
    fetchStatus();
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const getStatusColor = useCallback(() => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-amber-500";
      default: return "bg-gray-400";
    }
  }, [status]);

  const getStatusText = useCallback(() => {
    if (status === "online") return "Online";
    if (status === "away") return "Away";
    if (lastActive) {
      const diffMs = new Date().getTime() - lastActive.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return "Offline";
    }
    return "Offline";
  }, [status, lastActive]);

  return {
    status,
    lastActive,
    updatePresence,
    fetchStatus,
    getStatusColor,
    getStatusText,
  };
}

export function StatusIndicator({
  status,
  size = "md",
}: {
  status: "online" | "away" | "offline";
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const colorClasses = {
    online: "bg-green-500",
    away: "bg-amber-500",
    offline: "bg-gray-400",
  };

  return (
    <span
      className={`${sizeClasses[size]} ${colorClasses[status]} rounded-full inline-block`}
    />
  );
}