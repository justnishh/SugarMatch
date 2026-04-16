"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image, Loader2, Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChatInputProps {
  onSend: (content: string, type?: "text" | "image" | "voice", mediaUrl?: string) => void;
  matchId: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, matchId, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showAttachments, setShowAttachments] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        await uploadVoiceMessage(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  async function uploadVoiceMessage(blob: Blob) {
    setUploading(true);
    const supabase = createClient();
    const path = `${matchId}/${Date.now()}.webm`;

    const { error } = await supabase.storage
      .from("chat-media")
      .upload(path, blob);

    if (error) {
      toast.error("Failed to upload voice message");
    } else {
      const { data: urlData } = supabase.storage
        .from("chat-media")
        .getPublicUrl(path);
      onSend("", "voice", urlData.publicUrl);
    }

    setUploading(false);
  }

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

    if (error) {
      toast.error("Failed to upload image");
    } else {
      const { data: urlData } = supabase.storage
        .from("chat-media")
        .getPublicUrl(path);
      onSend("", "image", urlData.publicUrl);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t bg-white">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => setShowAttachments(!showAttachments)}
          disabled={uploading || disabled}
        >
          <span aria-hidden="true"><Image className="w-5 h-5 text-muted-foreground" /></span>
        </Button>

        <AnimatePresence>
          {showAttachments && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full left-0 mb-2 flex gap-1 bg-white shadow-lg rounded-full p-1.5"
            >
              <button
                onClick={() => {
                  fileRef.current?.click();
                  setShowAttachments(false);
                }}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <span aria-hidden="true"><Image className="w-5 h-5 text-muted-foreground" /></span>
              </button>
              <button
                onClick={() => {
                  setShowAttachments(false);
                  startRecording();
                }}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Mic className="w-5 h-5 text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {isRecording ? (
        <div className="flex-1 bg-muted rounded-2xl px-4 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-500">Recording</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDuration(recordingDuration)}
          </span>
          <button
            onClick={stopRecording}
            className="ml-auto p-2 hover:bg-muted-foreground/10 rounded-full transition-colors"
          >
            <Square className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ) : (
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
      )}

      <Button
        size="icon"
        className={cn(
          "shrink-0 rounded-full",
          isRecording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gradient-to-r from-rose-500 to-pink-500"
        )}
        onClick={isRecording ? stopRecording : handleSend}
        disabled={(!text.trim() && !isRecording) || disabled || uploading}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isRecording ? (
          <X className="w-4 h-4" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}