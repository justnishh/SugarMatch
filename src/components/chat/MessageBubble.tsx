"use client";

import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import type { Message } from "@/types/database";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn("flex mb-2", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5",
          isOwn
            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        {message.message_type === "image" && message.media_url && (
          <img
            src={message.media_url}
            alt=""
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
            {format(new Date(message.created_at), "HH:mm")}
          </span>
          {isOwn &&
            (message.is_read ? (
              <CheckCheck className="w-3.5 h-3.5 text-white/60" />
            ) : (
              <Check className="w-3.5 h-3.5 text-white/60" />
            ))}
        </div>
      </div>
    </div>
  );
}
