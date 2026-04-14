"use client";

import { MapPin, Briefcase, Heart, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UserProfile, Photo } from "@/types/database";

interface ProfileCardProps {
  user: UserProfile;
  photos: Photo[];
  showActions?: boolean;
}

export function ProfileCard({ user, photos }: ProfileCardProps) {
  const age = Math.floor(
    (Date.now() - new Date(user.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-xl border">
      {/* Photo carousel */}
      <div className="relative aspect-[3/4] bg-muted">
        {photos[0] && (
          <img
            src={photos[0].url}
            alt={user.full_name}
            className="w-full h-full object-cover"
          />
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
        {user.bio && <p className="text-sm">{user.bio}</p>}

        {user.conditions && user.conditions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.conditions.map((c) => (
              <Badge key={c} variant="secondary" className="text-xs">
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
    </div>
  );
}
