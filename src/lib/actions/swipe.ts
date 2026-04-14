"use server";

import { createClient } from "@/lib/supabase/server";
import type { SwipeDirection } from "@/types/database";

interface SwipeResult {
  success: boolean;
  matched: boolean;
  match_id?: string;
  error?: string;
}

export async function recordSwipe(
  swipedId: string,
  direction: SwipeDirection
): Promise<SwipeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, matched: false, error: "Not authenticated" };

  const { data, error } = await supabase.rpc("record_swipe", {
    p_swiper_id: user.id,
    p_swiped_id: swipedId,
    p_direction: direction,
  });

  if (error) return { success: false, matched: false, error: error.message };
  return data as SwipeResult;
}
