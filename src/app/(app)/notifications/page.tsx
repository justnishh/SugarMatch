"use client";

import { Bell, Heart, MessageCircle, Star, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRealtimeNotifications } from "@/lib/hooks/useRealtimeNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  match: Heart,
  message: MessageCircle,
  superlike: Star,
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead } =
    useRealtimeNotifications();

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500"
            onClick={markAllRead}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
          <Bell className="w-16 h-16 text-rose-200 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            You&apos;ll see match alerts, messages, and more here
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl transition-all",
                  !notif.is_read && "bg-rose-50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    notif.type === "match"
                      ? "bg-green-100"
                      : notif.type === "superlike"
                      ? "bg-blue-100"
                      : "bg-rose-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      notif.type === "match"
                        ? "text-green-500"
                        : notif.type === "superlike"
                        ? "text-blue-500"
                        : "text-rose-500"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notif.title}</p>
                  {notif.body && (
                    <p className="text-xs text-muted-foreground truncate">
                      {notif.body}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
