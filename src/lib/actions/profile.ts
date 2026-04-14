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

export async function updateProfile(
  updates: Partial<UserProfile>
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("users")
    .update(updates)
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
