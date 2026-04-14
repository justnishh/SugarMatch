"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, Flag, Ban, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";
import { sendMessage, markMessagesAsRead } from "@/lib/actions/chat";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { UserProfile, Photo } from "@/types/database";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const scrollRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [otherPhoto, setOtherPhoto] = useState<Photo | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const { messages, loading: messagesLoading } = useRealtimeMessages(matchId);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: match } = await supabase
        .from("matches")
        .select("user1_id, user2_id")
        .eq("id", matchId)
        .single();

      if (!match) {
        router.push("/matches");
        return;
      }

      const otherId =
        match.user1_id === user.id ? match.user2_id : match.user1_id;

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", otherId)
        .single();

      const { data: photos } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", otherId)
        .order("position")
        .limit(1);

      setOtherUser(profile as UserProfile);
      setOtherPhoto(photos?.[0] as Photo | null);
      setPageLoading(false);

      // Mark messages as read
      await markMessagesAsRead(matchId);
    }
    load();
  }, [matchId, router]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Mark incoming as read
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead(matchId);
    }
  }, [messages, matchId]);

  async function handleSend(
    content: string,
    type: "text" | "image" = "text",
    mediaUrl?: string
  ) {
    const result = await sendMessage(matchId, content, type, mediaUrl);
    if (result.error) {
      toast.error(result.error);
    }
  }

  async function handleBlock() {
    if (!otherUser) return;
    const supabase = createClient();
    await supabase.from("blocks").insert({
      blocker_id: currentUserId,
      blocked_id: otherUser.id,
    });
    // Deactivate match
    await supabase
      .from("matches")
      .update({ is_active: false })
      .eq("id", matchId);
    toast.success("User blocked");
    router.push("/matches");
  }

  async function handleReport() {
    if (!otherUser) return;
    const supabase = createClient();
    await supabase.from("reports").insert({
      reporter_id: currentUserId,
      reported_id: otherUser.id,
      reason: "Reported from chat",
    });
    toast.success("Report submitted");
    setShowMenu(false);
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  if (!otherUser) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <button onClick={() => router.push("/matches")}>
          <ArrowLeft className="w-6 h-6" />
        </button>

        <Avatar className="w-10 h-10">
          {otherPhoto ? (
            <AvatarImage src={otherPhoto.url} alt={otherUser.full_name} />
          ) : null}
          <AvatarFallback className="bg-rose-100 text-rose-600">
            {otherUser.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-semibold text-sm">{otherUser.full_name}</h3>
          <p className="text-xs text-muted-foreground">
            {otherUser.city && `${otherUser.city}, ${otherUser.country}`}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setShowMenu(true)}
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">
              Say hello to {otherUser.full_name}!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
            />
          ))
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} matchId={matchId} />

      {/* Report/Block menu */}
      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-amber-600"
              onClick={handleReport}
            >
              <Flag className="w-4 h-4 mr-3" />
              Report {otherUser.full_name}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={handleBlock}
            >
              <Ban className="w-4 h-4 mr-3" />
              Block {otherUser.full_name}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
