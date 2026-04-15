"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
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
  const confettiParticles = [...Array(20)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotate: Math.random() * 720,
    duration: 2 + Math.random(),
    color: ["#fbbf24", "#f472b6", "#60a5fa", "#a78bfa", "#34d399"][i % 5],
  }));

  const floatingHearts = [...Array(8)].map((_, i) => ({
    id: i,
    xStart: (i + 1) * 10,
    xEnd: (i + 1) * 10 + (Math.random() - 0.5) * 20,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * 2,
  }));
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-rose-500/95 to-pink-600/95 flex flex-col items-center justify-center px-8"
        >
          {/* Confetti particles */}
          <AnimatePresence>
            {confettiParticles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  opacity: 1,
                  x: "50vw",
                  y: "50vh",
                  scale: 0,
                }}
                animate={{
                  opacity: 0,
                  x: `${particle.x}vw`,
                  y: `${particle.y}vh`,
                  rotate: particle.rotate,
                  scale: 1,
                }}
                transition={{
                  duration: particle.duration,
                  ease: "easeOut",
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: particle.color,
                }}
              />
            ))}
          </AnimatePresence>

          {/* Hearts floating animation */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {floatingHearts.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{ opacity: 0, y: "100vh", x: `${heart.xStart}%` }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: ["100vh", "-10vh"],
                  x: [`${heart.xStart}%`, `${heart.xEnd}%`],
                }}
                transition={{
                  duration: heart.duration,
                  repeat: Infinity,
                  delay: heart.delay,
                }}
                className="absolute text-white/20"
              >
                <Heart className="w-8 h-8" fill="currentColor" />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
          >
            <div className="relative">
              <Heart className="w-24 h-24 text-white mb-6 mx-auto" fill="white" />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-white text-center mb-2"
          >
            It&apos;s a Match!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/90 text-center text-lg mb-6"
          >
            You and {matchName} liked each other
          </motion.p>

          {matchPhoto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="w-40 h-40 rounded-full overflow-hidden border-6 border-white shadow-[0_0_60px_rgba(255,255,255,0.4)] mb-6"
            >
              <img
                src={matchPhoto}
                alt={matchName}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full max-w-xs space-y-3"
          >
            <Button
              onClick={onChat}
              className="w-full h-14 text-lg bg-white text-rose-600 hover:bg-white/90 shadow-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Send a Message
            </Button>
            <Button
              onClick={onContinue}
              variant="ghost"
              className="w-full h-14 text-lg text-white hover:bg-white/10 border border-white/30"
            >
              Keep Swiping
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
