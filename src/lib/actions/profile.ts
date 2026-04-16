"use server";

import { createClient } from "@/lib/supabase/server";
import type { UserProfile, Photo } from "@/types/database";

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as UserProfile | null;
}

export async function getUserPhotos(userId: string): Promise<Photo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .eq("user_id", userId)
    .order("position");
  return (data as Photo[]) || [];
}

const ALLOWED_PROFILE_FIELDS = [
  "full_name",
  "bio",
  "city",
  "country",
  "latitude",
  "longitude",
  "instagram",
  "phone",
  "facebook_url",
  "support_preferences",
  "conditions",
  "budget_min",
  "budget_max",
  "age_min_pref",
  "age_max_pref",
  "distance_radius_km",
  "is_hidden",
  "gender",
  "dob",
] as const;

export async function updateProfile(
  updates: Partial<UserProfile>
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Whitelist fields to prevent privilege escalation
  const safeUpdates: Record<string, unknown> = {};
  for (const key of ALLOWED_PROFILE_FIELDS) {
    if (key in updates) {
      safeUpdates[key] = (updates as Record<string, unknown>)[key];
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return { error: "No valid fields to update" };
  }

  const { error } = await supabase
    .from("users")
    .update(safeUpdates)
    .eq("id", user.id);

  if (error) return { error: error.message };
  return {};
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Deactivate account (soft delete)
  const { error } = await supabase
    .from("users")
    .update({ is_active: false })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await supabase.auth.signOut();
  return {};
}
