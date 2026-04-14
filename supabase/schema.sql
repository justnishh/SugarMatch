-- ============================================
-- SugarMatch Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('seeker', 'partner')),
  full_name text not null,
  dob date not null,
  gender text not null check (gender in ('male', 'female', 'bisexual')),
  email text not null,
  phone text,
  instagram text,
  facebook_url text,
  bio varchar(300) default '',
  city text default '',
  country text default '',
  latitude double precision,
  longitude double precision,
  support_preferences text,
  conditions text[] default '{}',
  budget_min integer,
  budget_max integer,
  is_verified boolean default false,
  is_premium boolean default false,
  daily_swipes_remaining integer default 20,
  last_swipe_reset date default current_date,
  is_active boolean default true,
  is_hidden boolean default false,
  is_admin boolean default false,
  age_min_pref integer default 18,
  age_max_pref integer default 60,
  distance_radius_km integer default 50,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_users_updated
  before update on public.users
  for each row execute function public.handle_updated_at();

-- ============================================
-- 2. PHOTOS TABLE
-- ============================================
create table public.photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  url text not null,
  position integer not null check (position >= 1 and position <= 6),
  created_at timestamptz default now()
);

create index idx_photos_user on public.photos(user_id);

-- ============================================
-- 3. SWIPES TABLE
-- ============================================
create table public.swipes (
  id uuid primary key default uuid_generate_v4(),
  swiper_id uuid not null references public.users(id) on delete cascade,
  swiped_id uuid not null references public.users(id) on delete cascade,
  direction text not null check (direction in ('like', 'pass', 'superlike')),
  created_at timestamptz default now(),
  unique(swiper_id, swiped_id)
);

create index idx_swipes_swiper on public.swipes(swiper_id);
create index idx_swipes_swiped on public.swipes(swiped_id);
create index idx_swipes_direction on public.swipes(swiped_id, direction);

-- ============================================
-- 4. MATCHES TABLE
-- ============================================
create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid not null references public.users(id) on delete cascade,
  user2_id uuid not null references public.users(id) on delete cascade,
  is_active boolean default true,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

create index idx_matches_user1 on public.matches(user1_id);
create index idx_matches_user2 on public.matches(user2_id);

-- ============================================
-- 5. MESSAGES TABLE
-- ============================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text default '',
  message_type text not null default 'text' check (message_type in ('text', 'image', 'voice')),
  media_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_messages_match on public.messages(match_id, created_at);

-- ============================================
-- 6. NOTIFICATIONS TABLE
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text default '',
  related_user_id uuid references public.users(id) on delete set null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user on public.notifications(user_id, is_read, created_at desc);

-- ============================================
-- 7. REPORTS TABLE
-- ============================================
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  reported_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamptz default now()
);

create index idx_reports_status on public.reports(status);

-- ============================================
-- 8. BLOCKS TABLE
-- ============================================
create table public.blocks (
  id uuid primary key default uuid_generate_v4(),
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

create index idx_blocks_blocker on public.blocks(blocker_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.photos enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

-- USERS policies
create policy "Users can view active non-hidden profiles"
  on public.users for select
  using (is_active = true and (is_hidden = false or id = auth.uid()));

create policy "Users can update own profile"
  on public.users for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.users for insert
  with check (id = auth.uid());

-- PHOTOS policies
create policy "Anyone can view photos of visible users"
  on public.photos for select
  using (
    exists (
      select 1 from public.users
      where users.id = photos.user_id
        and users.is_active = true
        and (users.is_hidden = false or users.id = auth.uid())
    )
  );

create policy "Users can manage own photos"
  on public.photos for insert
  with check (user_id = auth.uid());

create policy "Users can update own photos"
  on public.photos for update
  using (user_id = auth.uid());

create policy "Users can delete own photos"
  on public.photos for delete
  using (user_id = auth.uid());

-- SWIPES policies
create policy "Users can insert own swipes"
  on public.swipes for insert
  with check (swiper_id = auth.uid());

create policy "Users can view own swipes"
  on public.swipes for select
  using (swiper_id = auth.uid() or swiped_id = auth.uid());

-- MATCHES policies
create policy "Users can view own matches"
  on public.matches for select
  using (user1_id = auth.uid() or user2_id = auth.uid());

-- MESSAGES policies
create policy "Users can view messages in their matches"
  on public.messages for select
  using (
    exists (
      select 1 from public.matches
      where matches.id = messages.match_id
        and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

create policy "Users can send messages in their matches"
  on public.messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.matches
      where matches.id = messages.match_id
        and matches.is_active = true
        and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

create policy "Users can mark messages as read"
  on public.messages for update
  using (
    sender_id != auth.uid() and
    exists (
      select 1 from public.matches
      where matches.id = messages.match_id
        and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

-- NOTIFICATIONS policies
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

-- REPORTS policies
create policy "Users can create reports"
  on public.reports for insert
  with check (reporter_id = auth.uid());

create policy "Users can view own reports"
  on public.reports for select
  using (reporter_id = auth.uid());

-- BLOCKS policies
create policy "Users can manage own blocks"
  on public.blocks for insert
  with check (blocker_id = auth.uid());

create policy "Users can view own blocks"
  on public.blocks for select
  using (blocker_id = auth.uid());

create policy "Users can remove own blocks"
  on public.blocks for delete
  using (blocker_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Reset daily swipes
create or replace function public.reset_daily_swipes()
returns void as $$
begin
  update public.users
  set daily_swipes_remaining = 20, last_swipe_reset = current_date
  where last_swipe_reset < current_date;
end;
$$ language plpgsql security definer;

-- Function: Record a swipe and check for match
create or replace function public.record_swipe(
  p_swiper_id uuid,
  p_swiped_id uuid,
  p_direction text
)
returns json as $$
declare
  v_reverse_swipe record;
  v_match_id uuid;
  v_swipes_left integer;
begin
  -- Check daily swipe limit
  select daily_swipes_remaining into v_swipes_left
  from public.users where id = p_swiper_id;

  -- Reset if needed
  perform public.reset_daily_swipes();

  -- Re-check after reset
  select daily_swipes_remaining into v_swipes_left
  from public.users where id = p_swiper_id;

  if v_swipes_left <= 0 then
    return json_build_object('success', false, 'error', 'Daily swipe limit reached');
  end if;

  -- Insert the swipe
  insert into public.swipes (swiper_id, swiped_id, direction)
  values (p_swiper_id, p_swiped_id, p_direction)
  on conflict (swiper_id, swiped_id) do update set direction = p_direction;

  -- Decrement swipes
  update public.users
  set daily_swipes_remaining = daily_swipes_remaining - 1
  where id = p_swiper_id;

  -- If like/superlike, check for mutual match
  if p_direction in ('like', 'superlike') then
    select * into v_reverse_swipe
    from public.swipes
    where swiper_id = p_swiped_id
      and swiped_id = p_swiper_id
      and direction in ('like', 'superlike');

    if found then
      -- Create match (order user IDs consistently)
      insert into public.matches (user1_id, user2_id)
      values (
        least(p_swiper_id, p_swiped_id),
        greatest(p_swiper_id, p_swiped_id)
      )
      on conflict do nothing
      returning id into v_match_id;

      if v_match_id is not null then
        -- Create notifications for both users
        insert into public.notifications (user_id, type, title, body, related_user_id)
        values
          (p_swiper_id, 'match', 'New Match!', 'You have a new match!', p_swiped_id),
          (p_swiped_id, 'match', 'New Match!', 'You have a new match!', p_swiper_id);

        return json_build_object('success', true, 'matched', true, 'match_id', v_match_id);
      end if;
    end if;
  end if;

  -- Superlike notification
  if p_direction = 'superlike' then
    insert into public.notifications (user_id, type, title, body, related_user_id)
    values (p_swiped_id, 'superlike', 'Someone Super Liked you!', 'Check your feed!', p_swiper_id);
  end if;

  return json_build_object('success', true, 'matched', false);
end;
$$ language plpgsql security definer;

-- Function: Get discovery feed
create or replace function public.get_discovery_feed(
  p_user_id uuid,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  role text,
  full_name text,
  dob date,
  gender text,
  bio varchar,
  city text,
  country text,
  latitude double precision,
  longitude double precision,
  conditions text[],
  budget_min integer,
  budget_max integer,
  is_verified boolean,
  support_preferences text,
  created_at timestamptz,
  distance_km double precision,
  match_score integer
) as $$
declare
  v_user record;
begin
  -- Get current user's profile
  select * into v_user from public.users where users.id = p_user_id;

  -- Reset swipes if needed
  perform public.reset_daily_swipes();

  return query
  select
    u.id,
    u.role,
    u.full_name,
    u.dob,
    u.gender,
    u.bio,
    u.city,
    u.country,
    u.latitude,
    u.longitude,
    u.conditions,
    u.budget_min,
    u.budget_max,
    u.is_verified,
    u.support_preferences,
    u.created_at,
    -- Haversine distance in km
    case
      when v_user.latitude is not null and v_user.longitude is not null
        and u.latitude is not null and u.longitude is not null
      then (
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(v_user.latitude)) * cos(radians(u.latitude))
            * cos(radians(u.longitude) - radians(v_user.longitude))
            + sin(radians(v_user.latitude)) * sin(radians(u.latitude))
          ))
        )
      )
      else null
    end as distance_km,
    -- Match score based on condition overlap
    case
      when v_user.role = 'seeker' and u.conditions is not null and v_user.conditions is not null
      then (select count(*)::integer from unnest(u.conditions) c where c = any(v_user.conditions))
      when v_user.role = 'partner' and u.conditions is not null and v_user.conditions is not null
      then (select count(*)::integer from unnest(v_user.conditions) c where c = any(u.conditions))
      else 0
    end as match_score
  from public.users u
  where u.id != p_user_id
    and u.is_active = true
    and u.is_hidden = false
    -- Role separation: seekers see partners, partners see seekers
    and u.role != v_user.role
    -- Gender filter
    and (
      v_user.gender = 'bisexual'
      or u.gender = 'bisexual'
      or (v_user.gender = 'male' and u.gender = 'female')
      or (v_user.gender = 'female' and u.gender = 'male')
    )
    -- Age preference
    and extract(year from age(u.dob)) between v_user.age_min_pref and v_user.age_max_pref
    -- Not already swiped
    and not exists (
      select 1 from public.swipes s
      where s.swiper_id = p_user_id and s.swiped_id = u.id
    )
    -- Not blocked
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = p_user_id and b.blocked_id = u.id)
         or (b.blocker_id = u.id and b.blocked_id = p_user_id)
    )
    -- Distance filter (if location available)
    and (
      v_user.latitude is null or v_user.longitude is null
      or u.latitude is null or u.longitude is null
      or (
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(v_user.latitude)) * cos(radians(u.latitude))
            * cos(radians(u.longitude) - radians(v_user.longitude))
            + sin(radians(v_user.latitude)) * sin(radians(u.latitude))
          ))
        ) <= v_user.distance_radius_km
      )
    )
  order by match_score desc, u.created_at desc
  limit p_limit offset p_offset;
end;
$$ language plpgsql security definer;

-- ============================================
-- REALTIME
-- ============================================
-- Enable realtime for messages and notifications
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.matches;

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these separately in the Supabase dashboard or via SQL:
insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
insert into storage.buckets (id, name, public) values ('chat-media', 'chat-media', true);

-- Storage policies for photos bucket
create policy "Users can upload own photos"
  on storage.objects for insert
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Anyone can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Users can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for chat-media bucket
create policy "Users can upload chat media"
  on storage.objects for insert
  with check (bucket_id = 'chat-media');

create policy "Anyone can view chat media"
  on storage.objects for select
  using (bucket_id = 'chat-media');
