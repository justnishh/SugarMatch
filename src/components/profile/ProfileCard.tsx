"use client";

import { useState } from "react";
import { MapPin, Briefcase, Heart, BadgeCheck, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserProfile, Photo } from "@/types/database";

interface ProfileCardProps {
  user: UserProfile;
  photos: Photo[];
  showActions?: boolean;
}

export function ProfileCard({ user, photos }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const age = Math.floor(
    (Date.now() - new Date(user.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const openGallery = () => {
    setShowGallery(true);
  };

  const bioPreview = user.bio?.slice(0, 150);
  const showReadMore = user.bio && user.bio.length > 150;

  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-xl border">
      {/* Photo carousel */}
      <div
        className="relative aspect-[3/4] bg-muted cursor-pointer"
        onClick={openGallery}
      >
        {photos[0] && (
          <img
            src={photos[currentPhotoIndex].url}
            alt={user.full_name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Photo counter badge */}
        {photos.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {currentPhotoIndex + 1}/{photos.length}
          </div>
        )}

        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Photo dots indicator */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === currentPhotoIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-2xl font-bold">
              {user.full_name}, {age}
            </h3>
            {user.is_verified && (
              <BadgeCheck className="w-6 h-6 text-blue-400" />
            )}
          </div>
          {user.city && (
            <div className="flex items-center gap-1 text-white/80 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {user.city}, {user.country}
              </span>
            </div>
          )}
        </div>

        <div className="absolute top-4 left-4">
          <Badge
            className={
              user.role === "partner"
                ? "bg-purple-500 text-white"
                : "bg-rose-500 text-white"
            }
          >
            {user.role === "partner" ? (
              <>
                <Briefcase className="w-3 h-3 mr-1" /> Sugar Partner
              </>
            ) : (
              <>
                <Heart className="w-3 h-3 mr-1" /> Sugar Seeker
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {user.bio && (
          <div>
            <p className="text-sm">
              {showReadMore ? bioPreview + "..." : user.bio}
            </p>
            {showReadMore && (
              <Button
                variant="link"
                className="p-0 h-auto text-rose-500"
                onClick={openGallery}
              >
                Read more
              </Button>
            )}
          </div>
        )}

        {user.conditions && user.conditions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.conditions.map((c) => (
              <Badge
                key={c}
                variant="secondary"
                className="text-xs bg-rose-50 border border-rose-200"
              >
                {c}
              </Badge>
            ))}
          </div>
        )}

        {user.role === "partner" &&
          user.budget_min != null &&
          user.budget_max != null && (
            <p className="text-sm text-muted-foreground">
              Budget: ₹{user.budget_min.toLocaleString()} – ₹
              {user.budget_max.toLocaleString()}/mo
            </p>
          )}

        {user.role === "seeker" && user.support_preferences && (
          <p className="text-sm text-muted-foreground">
            Looking for: {user.support_preferences}
          </p>
        )}
      </div>

      {/* Full-screen gallery modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setShowGallery(false)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
              onClick={() => setShowGallery(false)}
            >
              <X className="w-8 h-8" />
            </button>

            {/* Left arrow */}
            {photos.length > 1 && (
              <button
                className="absolute left-4 text-white/80 hover:text-white p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}

            {/* Photo */}
            <motion.img
              key={currentPhotoIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              src={photos[currentPhotoIndex]?.url}
              alt={user.full_name}
              className="max-h-screen max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Right arrow */}
            {photos.length > 1 && (
              <button
                className="absolute right-4 text-white/80 hover:text-white p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}

            {/* Photo dots */}
            {photos.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentPhotoIndex
                        ? "bg-white"
                        : "bg-white/40"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex(idx);
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}