"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import type { Message } from "@/types/database";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const quickReactions = ["❤️", "👍", "😊", "🔥", "😢"];

function formatSmartTimestamp(date: Date): string {
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return "Yesterday " + format(date, "HH:mm");
  }
  return format(date, "MMM d, HH:mm");
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [reacted, setReacted] = useState(false);
  const lastTapRef = useRef<number>(0);

  function handleDoubleTap() {
    if (!isOwn && !reacted) {
      setReacted(true);
    }
  }

  function handleTap() {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleTap();
    }
    lastTapRef.current = now;
  }

  function handleReactionClick() {
    setReacted(true);
    setShowReactions(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex mb-2", isOwn ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 relative group",
          isOwn
            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
        onClick={handleTap}
      >
        {message.message_type === "image" && message.media_url && (
          <img
            src={message.media_url}
            alt="Shared image"
            className="rounded-xl mb-1 max-w-full"
          />
        )}

        {message.message_type === "voice" && message.media_url && (
          <audio controls className="max-w-full">
            <source src={message.media_url} />
          </audio>
        )}

        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {reacted && (
          <span className="absolute -top-2 -right-2 text-lg">❤️</span>
        )}

        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-[10px]",
              isOwn ? "text-white/60" : "text-muted-foreground"
            )}
          >
            {formatSmartTimestamp(new Date(message.created_at))}
          </span>
          {isOwn &&
            (message.is_read ? (
              <CheckCheck className="w-3.5 h-3.5 text-white/60" />
            ) : (
              <Check className="w-3.5 h-3.5 text-white/60" />
            ))}
        </div>

        {!isOwn && (
          <button
            className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow rounded-full p-1"
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions(!showReactions);
            }}
          >
            <span className="text-sm">😊</span>
          </button>
        )}

        {showReactions && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-white shadow-lg rounded-full p-1.5">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReactionClick();
                }}
                className="hover:scale-125 transition-transform text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}