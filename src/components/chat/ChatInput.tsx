"use client";

import { useState, useRef } from "react";
import { Send, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface ChatInputProps {
  onSend: (content: string, type?: "text" | "image", mediaUrl?: string) => void;
  matchId: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, matchId, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${matchId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("chat-media")
      .upload(path, file);

    if (!error) {
      const { data: urlData } = supabase.storage
        .from("chat-media")
        .getPublicUrl(path);
      onSend("", "image", urlData.publicUrl);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t bg-white">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 rounded-full"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || disabled}
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Image className="w-5 h-5 text-muted-foreground" />
        )}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="flex-1 bg-muted rounded-2xl px-4 py-2.5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent text-sm resize-none outline-none max-h-24"
        />
      </div>

      <Button
        size="icon"
        className="shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
        onClick={handleSend}
        disabled={!text.trim() || disabled}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
