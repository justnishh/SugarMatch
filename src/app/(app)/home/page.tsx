"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Heart, X, Star, SlidersHorizontal, Loader2, Sparkles, RefreshCw, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SwipeCard } from "@/components/discovery/SwipeCard";
import { MatchModal } from "@/components/discovery/MatchModal";
import { getDiscoveryFeed } from "@/lib/actions/discovery";
import { recordSwipe } from "@/lib/actions/swipe";
import { usePremium } from "@/lib/hooks/usePremium";
import { toast } from "sonner";
import type { DiscoveryProfile } from "@/types/database";

const MAX_FREE_SWIPES = 20;

export default function HomePage() {
  const router = useRouter();
  const { status: premiumStatus, isPremium } = usePremium();
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Load swipe count from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("swipeCount");
    const today = new Date().toDateString();
    if (saved) {
      const { count, date } = JSON.parse(saved);
      if (date === today) {
        setSwipeCount(count);
      }
    }
  }, []);

  // Save swipe count to localStorage
  const saveSwipeCount = useCallback((count: number) => {
    const today = new Date().toDateString();
    localStorage.setItem("swipeCount", JSON.stringify({ count, date: today }));
    setSwipeCount(count);
  }, []);

  // Check if user can swipe
  const canSwipe = useCallback(() => {
    if (isPremium) return true;
    return swipeCount < MAX_FREE_SWIPES;
  }, [isPremium, swipeCount]);

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
    if (!canSwipe()) {
      setShowLimitModal(true);
      return;
    }
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

    saveSwipeCount(swipeCount + 1);
    setCurrentIndex((prev) => prev + 1);
    setSwiping(false);

    if (currentIndex >= profiles.length - 3) {
      const more = await getDiscoveryFeed(20, profiles.length);
      setProfiles((prev) => [...prev, ...more]);
    }
  }

  async function handleSuperLike() {
    if (swiping || currentIndex >= profiles.length) return;
    if (!canSwipe()) {
      setShowLimitModal(true);
      return;
    }
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

    saveSwipeCount(swipeCount + 1);
    setCurrentIndex((prev) => prev + 1);
    setSwiping(false);
  }

  const currentProfile =
    currentIndex < profiles.length ? profiles[currentIndex] : null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
            SugarMatch
          </h1>
          {isPremium && (
            <Crown className="w-5 h-5 text-amber-500" />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => router.push("/settings")}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Swipe counter for free users */}
      {!isPremium && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Swipes remaining: {MAX_FREE_SWIPES - swipeCount}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={() => router.push("/premium")}
            >
              Upgrade for unlimited
            </Button>
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-1">
            <div
              className="bg-rose-500 h-1 rounded-full transition-all"
              style={{ width: `${Math.max(0, ((MAX_FREE_SWIPES - swipeCount) / MAX_FREE_SWIPES) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Card stack */}
      <div className="flex-1 px-4 pb-4 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden">
              <Skeleton className="w-full h-full rounded-3xl" />
              <div className="absolute bottom-8 left-8 right-8 space-y-3">
                <Skeleton className="h-8 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-14 h-14 rounded-full" />
              ))}
            </div>
          </div>
        ) : !currentProfile ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-40 h-40 mb-6 relative">
              <div className="absolute inset-0 bg-rose-100 rounded-full animate-pulse" />
              <Heart className="w-20 h-20 text-rose-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-amber-400" />
              </motion.div>
            </div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold mb-2"
            >
              No more profiles
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-6"
            >
              Check back later or adjust your filters to see more people
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={loadFeed}
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Feed
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="relative h-full max-h-[calc(100vh-220px)]">
            <AnimatePresence mode="popLayout">
              {/* Show current and next card */}
              {profiles
                .slice(currentIndex, currentIndex + 2)
                .reverse()
                .map((profile, i) => (
                  <SwipeCard
                    key={profile.id}
                    profile={profile}
                    onSwipe={(dir) => {
                      if (dir === "superlike") {
                        handleSuperLike();
                      } else if (dir === "like") {
                        handleSwipe("like");
                      } else {
                        handleSwipe("pass");
                      }
                    }}
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

      {/* Limit reached modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
            <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Daily Limit Reached</h3>
            <p className="text-muted-foreground mb-6">
              You've used all {MAX_FREE_SWIPES} swipes today. Upgrade to Premium for unlimited swipes!
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                onClick={() => {
                  setShowLimitModal(false);
                  router.push("/premium");
                }}
              >
                Upgrade Now
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowLimitModal(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}

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
        userRole={matchedProfile?.role || "seeker"}
        onChat={(icebreaker) => {
          setShowMatch(false);
          if (matchId) router.push(`/chat/${matchId}${icebreaker ? `?msg=${encodeURIComponent(icebreaker)}` : ""}`);
        }}
        onContinue={() => setShowMatch(false)}
      />
    </div>
  );
}