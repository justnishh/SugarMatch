"use server";

import { createClient } from "@/lib/supabase/server";
import type { DiscoveryProfile, Photo } from "@/types/database";

export async function getDiscoveryFeed(
  limit = 20,
  offset = 0
): Promise<DiscoveryProfile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("get_discovery_feed", {
    p_user_id: user.id,
    p_limit: limit,
    p_offset: offset,
  });

  if (error || !data) return [];

  // Fetch photos for each user
  const userIds = data.map((u: { id: string }) => u.id);
  const { data: allPhotos } = await supabase
    .from("photos")
    .select("*")
    .in("user_id", userIds)
    .order("position");

  const photoMap = new Map<string, Photo[]>();
  (allPhotos || []).forEach((p: Photo) => {
    if (!photoMap.has(p.user_id)) photoMap.set(p.user_id, []);
    photoMap.get(p.user_id)!.push(p);
  });

  return data.map((u: DiscoveryProfile) => ({
    ...u,
    photos: photoMap.get(u.id) || [],
  }));
}
