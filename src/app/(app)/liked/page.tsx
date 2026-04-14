"use client";

import { useEffect, useState } from "react";
import { Heart, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { recordSwipe } from "@/lib/actions/swipe";
import { toast } from "sonner";
import type { UserProfile, Photo } from "@/types/database";

interface LikedUser {
  user: UserProfile;
  photo: Photo | null;
  isSuperLike: boolean;
}

export default function LikedYouPage() {
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("is_premium")
        .eq("id", user.id)
        .single();

      setIsPremium(profile?.is_premium || false);

      // Get people who swiped right on the current user
      const { data: swipes } = await supabase
        .from("swipes")
        .select("swiper_id, direction")
        .eq("swiped_id", user.id)
        .in("direction", ["like", "superlike"])
        .order("created_at", { ascending: false });

      if (!swipes || swipes.length === 0) {
        setLoading(false);
        return;
      }

      // Filter out already-matched users
      const { data: existingSwipes } = await supabase
        .from("swipes")
        .select("swiped_id")
        .eq("swiper_id", user.id);

      const alreadySwiped = new Set(
        (existingSwipes || []).map((s: { swiped_id: string }) => s.swiped_id)
      );

      const unmatched = swipes.filter(
        (s: { swiper_id: string }) => !alreadySwiped.has(s.swiper_id)
      );

      const results: LikedUser[] = [];
      for (const swipe of unmatched) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", swipe.swiper_id)
          .single();

        const { data: photos } = await supabase
          .from("photos")
          .select("*")
          .eq("user_id", swipe.swiper_id)
          .order("position")
          .limit(1);

        if (userData) {
          results.push({
            user: userData as UserProfile,
            photo: photos?.[0] as Photo | null,
            isSuperLike: swipe.direction === "superlike",
          });
        }
      }

      setLikedUsers(results);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLikeBack(userId: string) {
    const result = await recordSwipe(userId, "like");
    if (result.matched) {
      toast.success("It's a Match!");
    }
    setLikedUsers((prev) => prev.filter((l) => l.user.id !== userId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Liked You</h1>
        {likedUsers.length > 0 && (
          <Badge variant="secondary" className="text-rose-500">
            {likedUsers.length}
          </Badge>
        )}
      </div>

      {likedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
          <Heart className="w-16 h-16 text-rose-200 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No likes yet</h3>
          <p className="text-muted-foreground">
            When someone likes your profile, they&apos;ll appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {likedUsers.map(({ user, photo, isSuperLike }) => (
            <div
              key={user.id}
              className="relative rounded-2xl overflow-hidden bg-muted aspect-[3/4]"
            >
              {/* Photo - blurred for free users */}
              {photo && (
                <img
                  src={photo.url}
                  alt={user.full_name}
                  className={`w-full h-full object-cover ${
                    !isPremium ? "blur-lg" : ""
                  }`}
                />
              )}

              {/* Super like badge */}
              {isSuperLike && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-blue-500 text-white">Super Like</Badge>
                </div>
              )}

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                {isPremium ? (
                  <>
                    <h4 className="text-white font-semibold">{user.full_name}</h4>
                    <p className="text-white/70 text-xs">
                      {user.city}, {user.country}
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-2 bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => handleLikeBack(user.id)}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Like Back
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">
                      Upgrade to see
                    </p>
                  </div>
                )}
              </div>

              {/* Premium lock overlay */}
              {!isPremium && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                    <p className="text-white font-semibold text-sm drop-shadow-lg">
                      Premium
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
