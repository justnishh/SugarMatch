"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Heart, X, Star, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwipeCard } from "@/components/discovery/SwipeCard";
import { MatchModal } from "@/components/discovery/MatchModal";
import { getDiscoveryFeed } from "@/lib/actions/discovery";
import { recordSwipe } from "@/lib/actions/swipe";
import { toast } from "sonner";
import type { DiscoveryProfile } from "@/types/database";

export default function HomePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  // Match modal
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(
    null
  );
  const [matchId, setMatchId] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    const feed = await getDiscoveryFeed(20, 0);
    setProfiles(feed);
    setCurrentIndex(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  async function handleSwipe(direction: "like" | "pass") {
    if (swiping || currentIndex >= profiles.length) return;
    setSwiping(true);

    const profile = profiles[currentIndex];
    const result = await recordSwipe(
      profile.id,
      direction as "like" | "pass"
    );

    if (!result.success) {
      toast.error(result.error || "Failed to swipe");
      setSwiping(false);
      return;
    }

    if (result.matched) {
      setMatchedProfile(profile);
      setMatchId(result.match_id || null);
      setShowMatch(true);
    }

    setCurrentIndex((prev) => prev + 1);
    setSwiping(false);

    // Load more when running low
    if (currentIndex >= profiles.length - 3) {
      const more = await getDiscoveryFeed(20, profiles.length);
      setProfiles((prev) => [...prev, ...more]);
    }
  }

  async function handleSuperLike() {
    if (swiping || currentIndex >= profiles.length) return;
    setSwiping(true);

    const profile = profiles[currentIndex];
    const result = await recordSwipe(profile.id, "superlike");

    if (!result.success) {
      toast.error(result.error || "Failed to super like");
      setSwiping(false);
      return;
    }

    if (result.matched) {
      setMatchedProfile(profile);
      setMatchId(result.match_id || null);
      setShowMatch(true);
    } else {
      toast.success("Super Like sent!");
    }

    setCurrentIndex((prev) => prev + 1);
    setSwiping(false);
  }

  const currentProfile =
    currentIndex < profiles.length ? profiles[currentIndex] : null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
          SugarMatch
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => router.push("/settings")}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Card stack */}
      <div className="flex-1 px-4 pb-4 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
          </div>
        ) : !currentProfile ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Heart className="w-16 h-16 text-rose-200 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No more profiles</h3>
            <p className="text-muted-foreground mb-6">
              Check back later or adjust your filters to see more people
            </p>
            <Button onClick={loadFeed} variant="outline">
              Refresh Feed
            </Button>
          </div>
        ) : (
          <div className="relative h-full max-h-[calc(100vh-220px)]">
            <AnimatePresence>
              {/* Show current and next card */}
              {profiles
                .slice(currentIndex, currentIndex + 2)
                .reverse()
                .map((profile, i) => (
                  <SwipeCard
                    key={profile.id}
                    profile={profile}
                    onSwipe={handleSwipe}
                    style={{
                      zIndex: profiles.length - currentIndex - i,
                      scale: i === 0 ? 0.95 : 1,
                    }}
                  />
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {currentProfile && (
        <div className="flex items-center justify-center gap-6 pb-24 pt-2">
          <Button
            variant="outline"
            size="icon"
            className="w-16 h-16 rounded-full border-2 border-red-200 hover:bg-red-50 hover:border-red-400"
            onClick={() => handleSwipe("pass")}
            disabled={swiping}
          >
            <X className="w-7 h-7 text-red-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
            onClick={handleSuperLike}
            disabled={swiping}
          >
            <Star className="w-6 h-6 text-blue-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-16 h-16 rounded-full border-2 border-green-200 hover:bg-green-50 hover:border-green-400"
            onClick={() => handleSwipe("like")}
            disabled={swiping}
          >
            <Heart className="w-7 h-7 text-green-500" />
          </Button>
        </div>
      )}

      {/* Match modal */}
      <MatchModal
        open={showMatch}
        matchName={matchedProfile?.full_name || ""}
        matchPhoto={matchedProfile?.photos?.[0]?.url}
        onChat={() => {
          setShowMatch(false);
          if (matchId) router.push(`/chat/${matchId}`);
        }}
        onContinue={() => setShowMatch(false)}
      />
    </div>
  );
}
