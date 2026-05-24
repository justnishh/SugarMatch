"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Shuffle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IcebreakersModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  userRole: "seeker" | "partner";
}

export function IcebreakersModal({
  open,
  onClose,
  onSend,
  userRole,
}: IcebreakersModalProps) {
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userRole) {
      loadIcebreakers();
    }
  }, [open, userRole]);

  async function loadIcebreakers() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("icebreakers")
      .select("text")
      .eq("role", userRole)
      .order("created_at")
      .limit(5);

    if (data && data.length > 0) {
      setIcebreakers(data.map((d) => d.text));
    } else {
      setIcebreakers([
        "What's your idea of a perfect first date?",
        "Tell me about your last trip",
        "What are you looking for in a partner?",
        "What's your favorite restaurant in the city?",
        "Any exciting plans coming up?",
      ]);
    }
    setLoading(false);
  }

  function handleSend() {
    if (selected) {
      onSend(selected);
      onClose();
    }
  }

  function handleShuffle() {
    const shuffled = [...icebreakers].sort(() => Math.random() - 0.5);
    setIcebreakers(shuffled);
    setSelected(shuffled[0]);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h2 className="text-lg font-bold">Break the Ice!</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Pick a conversation starter or shuffle for a random one
            </p>

            <div className="space-y-2 mb-6">
              {icebreakers.map((text, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(text)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all",
                    selected === text
                      ? "border-rose-500 bg-rose-50"
                      : "border-muted hover:border-rose-200"
                  )}
                >
                  <span className="text-sm font-medium">{text}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-rose-200"
                onClick={handleShuffle}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </Button>
              <Button
                className="flex-1 bg-rose-500 hover:bg-rose-600"
                disabled={!selected}
                onClick={handleSend}
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
