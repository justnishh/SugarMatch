"use client";

import { useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import { MapPin, BadgeCheck, Briefcase, Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DiscoveryProfile } from "@/types/database";

interface SwipeCardProps {
  profile: DiscoveryProfile;
  onSwipe: (direction: "like" | "pass" | "superlike") => void;
  style?: React.CSSProperties;
}

export function SwipeCard({ profile, onSwipe, style }: SwipeCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDir, setExitDir] = useState<"left" | "right" | "up" | null>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const passOpacity = useTransform(x, [-150, -50], [1, 0]);
  const superlikeOpacity = useTransform(y, [-50, -150], [0, 1]);
  const cardRotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);

  const dob = new Date(profile.dob);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  const triggerExit = useCallback((direction: "left" | "right" | "up") => {
    if (isExiting) return;
    setIsExiting(true);
    setExitDir(direction);
    
    const swipeDir = direction === "up" ? "superlike" : direction === "right" ? "like" : "pass";
    
    setTimeout(() => {
      onSwipe(swipeDir);
    }, 450);
  }, [isExiting, onSwipe]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const dragX = info.offset.x;
    const dragY = info.offset.y;

    if (dragY < -120 && Math.abs(dragX) < 80) {
      triggerExit("up");
    } else if (dragX > 100) {
      triggerExit("right");
    } else if (dragX < -100) {
      triggerExit("left");
    }
  }

  const getExitStyle = () => {
    if (!exitDir) return {};
    
    if (exitDir === "up") {
      return { y: -1000, rotate: -25, scale: 1.3, opacity: 0 };
    } else if (exitDir === "right") {
      return { x: 600, rotate: 25, opacity: 0 };
    } else {
      return { x: -600, rotate: -25, opacity: 0 };
    }
  };

  const photos = profile.photos || [];
  const currentPhoto = photos[photoIndex];

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, ...style }}
      animate={isExiting ? getExitStyle() : undefined}
      transition={isExiting ? { duration: 0.4, ease: "easeOut" } : { type: "spring", bounce: 0.2, duration: 0.5 }}
      drag={!isExiting}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={!isExiting ? handleDragEnd : undefined}
      whileDrag={{ scale: 1.05 }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 relative select-none">
        {/* Depth gradient overlay for stacked cards */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 rounded-3xl pointer-events-none z-10" />
        <div className="absolute inset-0 bg-muted">
          {currentPhoto && (
            <img
              src={currentPhoto.url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}
        </div>

        {/* Photo navigation dots */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {photos.map((p, i) => (
              <div
                key={p.id}
                className={`h-1 flex-1 rounded-full ${
                  i === photoIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Tap zones for photo navigation */}
        {photos.length > 1 && (
          <>
            <button
              className="absolute top-0 left-0 w-1/3 h-3/4 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIndex(Math.max(0, photoIndex - 1));
              }}
            >
              {photoIndex > 0 && (
                <ChevronLeft className="w-8 h-8 text-white/60 ml-2 mt-20" />
              )}
            </button>
            <button
              className="absolute top-0 right-0 w-1/3 h-3/4 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIndex(Math.min(photos.length - 1, photoIndex + 1));
              }}
            >
              {photoIndex < photos.length - 1 && (
                <ChevronRight className="w-8 h-8 text-white/60 ml-auto mr-2 mt-20" />
              )}
            </button>
          </>
        )}

        {/* Like/Pass overlays */}
        <motion.div
          className="absolute top-8 right-8 z-20 border-4 border-green-500 rounded-xl px-6 py-2 rotate-[-20deg]"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-3xl font-black text-green-500">LIKE</span>
        </motion.div>
        <motion.div
          className="absolute top-8 left-8 z-20 border-4 border-red-500 rounded-xl px-6 py-2 rotate-[20deg]"
          style={{ opacity: passOpacity }}
        >
          <span className="text-3xl font-black text-red-500">NOPE</span>
        </motion.div>
        <motion.div
          className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
          style={{ opacity: superlikeOpacity }}
        >
          <div className="bg-blue-500 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <Star className="w-5 h-5 text-white fill-white" />
            <span className="text-xl font-black text-white">SUPER LIKE</span>
          </div>
        </motion.div>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 z-10">
          {/* Role badge */}
          <Badge
            className={`mb-3 ${
              profile.role === "partner"
                ? "bg-purple-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {profile.role === "partner" ? (
              <><Briefcase className="w-3 h-3 mr-1" /> Sugar Partner</>
            ) : (
              <><Heart className="w-3 h-3 mr-1" /> Sugar Seeker</>
            )}
          </Badge>

          <div className="flex items-center gap-2">
            <h3 className="text-white text-2xl font-bold">
              {profile.full_name}, {age}
            </h3>
            {profile.is_verified && (
              <BadgeCheck className="w-6 h-6 text-blue-400" />
            )}
          </div>

          {profile.city && (
            <div className="flex items-center gap-1 text-white/80 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {profile.city}
                {profile.distance_km != null &&
                  ` · ${Math.round(profile.distance_km)} km away`}
              </span>
            </div>
          )}

          {profile.bio && (
            <p className="text-white/70 text-sm mt-2 line-clamp-2">
              {profile.bio}
            </p>
          )}

          {profile.conditions && profile.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.conditions.slice(0, 3).map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="bg-white/20 text-white text-xs"
                >
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
