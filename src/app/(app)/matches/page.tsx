"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getMatches, type MatchWithUser } from "@/lib/actions/chat";
import { formatDistanceToNow } from "date-fns";

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getMatches();
      setMatches(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
          <MessageCircle className="w-16 h-16 text-rose-200 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
          <p className="text-muted-foreground">
            Start swiping to find your matches. When you both like each other,
            you can chat here!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {matches.map(({ match, otherUser, otherUserPhoto, lastMessage, unreadCount }) => (
            <Link
              key={match.id}
              href={`/chat/${match.id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
            >
              <div className="relative">
                <Avatar className="w-14 h-14">
                  {otherUserPhoto ? (
                    <AvatarImage
                      src={otherUserPhoto.url}
                      alt={otherUser.full_name}
                    />
                  ) : null}
                  <AvatarFallback className="bg-rose-100 text-rose-600 text-lg">
                    {otherUser.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-rose-500 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">
                    {otherUser.full_name}
                  </h3>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(lastMessage.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm truncate ${
                    unreadCount > 0
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {lastMessage
                    ? lastMessage.message_type === "text"
                      ? lastMessage.content
                      : `Sent a ${lastMessage.message_type}`
                    : "Say hello! 👋"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
