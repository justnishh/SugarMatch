"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, BadgeCheck, Briefcase, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DiscoveryProfile } from "@/types/database";
import { StatusIndicator } from "@/lib/hooks/usePresence";

interface ProfilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  profile: DiscoveryProfile | null;
  onViewFull: () => void;
}

export function ProfilePreviewModal({
  open,
  onClose,
  profile,
  onViewFull,
}: ProfilePreviewModalProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!profile) return null;

  const photos = profile.photos || [];
  const currentPhoto = photos[photoIndex];

  const dob = new Date(profile.dob);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/4]">
              <img
                src={currentPhoto?.url || "/placeholder.png"}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />

              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {photos.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"
                    onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))}
                  >
                    <span className="text-white text-lg">‹</span>
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"
                    onClick={() => setPhotoIndex(Math.min(photos.length - 1, photoIndex + 1))}
                  >
                    <span className="text-white text-lg">›</span>
                  </button>
                </>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white text-xl font-bold">
                    {profile.full_name}, {age}
                  </h3>
                  {profile.is_verified && (
                    <BadgeCheck className="w-5 h-5 text-blue-400" />
                  )}
                </div>

                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.city}</span>
                  {profile.distance_km && (
                    <span>· {Math.round(profile.distance_km)} km</span>
                  )}
                </div>
              </div>

              <div className="absolute top-3 left-3 flex gap-1">
                {photos.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      i === photoIndex ? "bg-white" : "bg-white/40"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="p-4">
              <Badge
                className={cn(
                  "mb-3",
                  profile.role === "partner"
                    ? "bg-purple-500 text-white"
                    : "bg-rose-500 text-white"
                )}
              >
                {profile.role === "partner" ? (
                  <><Briefcase className="w-3 h-3 mr-1" /> Sugar Partner</>
                ) : (
                  <><Heart className="w-3 h-3 mr-1" /> Sugar Seeker</>
                )}
              </Badge>

              {profile.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {profile.bio}
                </p>
              )}

              {profile.conditions && profile.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {profile.conditions.slice(0, 4).map((c) => (
                    <Badge
                      key={c}
                      variant="secondary"
                      className="bg-rose-100 text-rose-700 text-xs"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              <Button onClick={onViewFull} className="w-full bg-rose-500 hover:bg-rose-600">
                View Full Profile
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
