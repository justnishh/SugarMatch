"use client";

import { useEffect, useMemo } from "react";
import { Heart, MapPin, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfilePreviewProps {
  name: string;
  age: number;
  city: string;
  bio: string;
  photos: File[];
  role: "seeker" | "partner";
  conditions?: string[];
  budgetMin?: number;
  budgetMax?: number;
}

export function ProfilePreview({
  name,
  age,
  city,
  bio,
  photos,
  role,
  conditions,
  budgetMin,
  budgetMax,
}: ProfilePreviewProps) {
  const mainPhoto = photos[0];

  // Create and manage blob URL to prevent memory leaks
  const mainPhotoUrl = useMemo(
    () => (mainPhoto ? URL.createObjectURL(mainPhoto) : null),
    [mainPhoto]
  );

  useEffect(() => {
    return () => {
      if (mainPhotoUrl) URL.revokeObjectURL(mainPhotoUrl);
    };
  }, [mainPhotoUrl]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <p className="text-sm text-muted-foreground text-center mb-4">
        This is how others will see your profile
      </p>

      <div className="rounded-3xl overflow-hidden bg-white shadow-xl border">
        {/* Photo */}
        <div className="relative aspect-[3/4] bg-muted">
          {mainPhotoUrl && (
            <img
              src={mainPhotoUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6">
            <h3 className="text-white text-2xl font-bold">
              {name}, {age}
            </h3>
            {city && (
              <div className="flex items-center gap-1 text-white/80 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{city}</span>
              </div>
            )}
          </div>

          {/* Role badge */}
          <div className="absolute top-4 left-4">
            <Badge
              className={
                role === "partner"
                  ? "bg-purple-500 text-white"
                  : "bg-rose-500 text-white"
              }
            >
              {role === "partner" ? (
                <><Briefcase className="w-3 h-3 mr-1" /> Sugar Partner</>
              ) : (
                <><Heart className="w-3 h-3 mr-1" /> Sugar Seeker</>
              )}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          {bio && <p className="text-sm text-foreground">{bio}</p>}

          {conditions && conditions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => (
                <Badge key={c} variant="secondary" className="text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          )}

          {role === "partner" && budgetMin != null && budgetMax != null && (
            <p className="text-sm text-muted-foreground">
              Budget: ₹{budgetMin.toLocaleString()} – ₹{budgetMax.toLocaleString()}/mo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
