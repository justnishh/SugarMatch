export type UserRole = 'seeker' | 'partner';
export type Gender = 'male' | 'female' | 'bisexual';
export type SwipeDirection = 'like' | 'pass' | 'superlike';
export type MessageType = 'text' | 'image' | 'voice';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export type ConditionTag =
  | 'Companionship'
  | 'Travel Partner'
  | 'Loyalty'
  | 'Discretion'
  | 'Exclusivity';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  dob: string;
  gender: Gender;
  email: string;
  phone: string | null;
  instagram: string | null;
  facebook_url: string | null;
  bio: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  support_preferences: string | null;
  conditions: ConditionTag[] | null;
  budget_min: number | null;
  budget_max: number | null;
  is_verified: boolean;
  is_premium: boolean;
  daily_swipes_remaining: number;
  last_swipe_reset: string;
  is_active: boolean;
  is_hidden: boolean;
  is_admin: boolean;
  age_min_pref: number;
  age_max_pref: number;
  distance_radius_km: number;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  position: number;
  created_at: string;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  related_user_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface DiscoveryProfile extends UserProfile {
  photos: Photo[];
  distance_km?: number;
  match_score?: number;
}
