"use server";

import { createClient } from "@/lib/supabase/server";
import type { Match, UserProfile, Photo, Message } from "@/types/database";

export interface MatchWithUser {
  match: Match;
  otherUser: UserProfile;
  otherUserPhoto: Photo | null;
  lastMessage: Message | null;
  unreadCount: number;
}

export async function getMatches(): Promise<MatchWithUser[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!matches || matches.length === 0) return [];

  const result: MatchWithUser[] = [];

  for (const match of matches as Match[]) {
    const otherId =
      match.user1_id === user.id ? match.user2_id : match.user1_id;

    const { data: otherUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", otherId)
      .single();

    if (!otherUser) continue;

    const { data: photos } = await supabase
      .from("photos")
      .select("*")
      .eq("user_id", otherId)
      .order("position")
      .limit(1);

    const { data: lastMsg } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", match.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("match_id", match.id)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    result.push({
      match: match,
      otherUser: otherUser as UserProfile,
      otherUserPhoto: photos?.[0] as Photo | null,
      lastMessage: lastMsg?.[0] as Message | null,
      unreadCount: count || 0,
    });
  }

  return result;
}

export async function sendMessage(
  matchId: string,
  content: string,
  messageType: "text" | "image" | "voice" = "text",
  mediaUrl?: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Validate content length
  if (messageType === "text" && (!content || content.length > 5000)) {
    return { error: "Message must be between 1 and 5000 characters" };
  }

  // Verify user is part of this match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("user1_id, user2_id, is_active")
    .eq("id", matchId)
    .single();

  if (matchError || !match) return { error: "Match not found" };
  if (match.user1_id !== user.id && match.user2_id !== user.id) {
    return { error: "Unauthorized" };
  }
  if (!match.is_active) return { error: "Match is no longer active" };

  const { error } = await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: user.id,
    content,
    message_type: messageType,
    media_url: mediaUrl || null,
  });

  if (error) return { error: error.message };

  // Create notification for the other user
  const otherId =
    match.user1_id === user.id ? match.user2_id : match.user1_id;
  await supabase.from("notifications").insert({
    user_id: otherId,
    type: "message",
    title: "New Message",
    body: messageType === "text" ? content.slice(0, 100) : `Sent a ${messageType}`,
    related_user_id: user.id,
  });

  return {};
}

export async function markMessagesAsRead(matchId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Verify user is part of this match
  const { data: match } = await supabase
    .from("matches")
    .select("user1_id, user2_id")
    .eq("id", matchId)
    .single();

  if (!match || (match.user1_id !== user.id && match.user2_id !== user.id)) {
    return;
  }

  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("match_id", matchId)
    .neq("sender_id", user.id)
    .eq("is_read", false);
}
