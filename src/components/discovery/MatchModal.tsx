"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchModalProps {
  open: boolean;
  matchName: string;
  matchPhoto?: string;
  onChat: () => void;
  onContinue: () => void;
}

export function MatchModal({
  open,
  matchName,
  matchPhoto,
  onChat,
  onContinue,
}: MatchModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-rose-500/90 to-pink-600/90 flex flex-col items-center justify-center px-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Heart className="w-20 h-20 text-white mb-6 mx-auto" fill="white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white text-center mb-2"
          >
            It&apos;s a Match!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 text-center mb-8"
          >
            You and {matchName} liked each other
          </motion.p>

          {matchPhoto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-8"
            >
              <img
                src={matchPhoto}
                alt={matchName}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-xs space-y-3"
          >
            <Button
              onClick={onChat}
              className="w-full h-14 text-lg bg-white text-rose-600 hover:bg-white/90"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Send a Message
            </Button>
            <Button
              onClick={onContinue}
              variant="ghost"
              className="w-full h-14 text-lg text-white hover:bg-white/10"
            >
              Keep Swiping
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
