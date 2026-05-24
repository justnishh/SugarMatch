"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
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

  function handleCancel() {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    onCancel();
  }

  function handleSend() {
    if (audioBlob) {
      onSend(audioBlob);
    }
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  if (audioUrl) {
    return (
      <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-2">
        <button
          onClick={handleCancel}
          className="p-1 rounded-full hover:bg-muted-foreground/10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">{formatDuration(duration)}</span>
          </div>
        </div>

        <button
          onClick={handleSend}
          className="p-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex items-center gap-3 rounded-full px-4 py-2 transition-colors",
        isRecording
          ? "bg-red-500/10 border border-red-500/30"
          : "bg-muted"
      )}
    >
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          "p-2 rounded-full transition-colors",
          isRecording
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-rose-500 hover:bg-rose-600 text-white"
        )}
      >
        {isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {isRecording && (
        <>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-500">
                Recording {formatDuration(duration)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="p-1 rounded-full hover:bg-red-100"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </>
      )}

      {!isRecording && (
        <span className="text-sm text-muted-foreground">Hold to record</span>
      )}
    </motion.div>
  );
}
