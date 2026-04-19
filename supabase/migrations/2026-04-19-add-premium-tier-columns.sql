-- Premium Feature Gating Columns
-- Add tier-based premium system

ALTER TABLE users
ADD COLUMN premium_tier TEXT DEFAULT NULL,
ADD COLUMN premium_expires_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN super_likes_remaining INTEGER DEFAULT 1,
ADD COLUMN is_incognito BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_premium_tier ON users(premium_tier);
CREATE INDEX IF NOT EXISTS idx_users_premium_expires ON users(premium_expires_at);

-- Update the reset_daily_swipes function to respect premium tier
CREATE OR REPLACE FUNCTION public.reset_daily_swipes()
RETURNS void AS $$
BEGIN
  -- Reset free users to 20, premium users get 999 (essentially unlimited)
  UPDATE public.users
  SET daily_swipes_remaining = CASE
    WHEN premium_tier IS NOT NULL AND premium_expires_at > now() THEN 999
    ELSE 20
  END,
  last_swipe_reset = current_date
  WHERE last_swipe_reset < current_date OR daily_swipes_remaining IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.users TO service_role;