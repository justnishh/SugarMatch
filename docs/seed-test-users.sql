-- ============================================
-- Seed Test Users (20 accounts)
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- 10 SEEKER ACCOUNTS (women seeking partners)
-- ============================================
-- Seed Test Users (20 accounts)
-- Run in Supabase SQL Editor
-- ============================================

-- Step 1: Create auth.users first (required for FK)
-- Insert into auth.users table with minimal data
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at)
select gen_random_uuid(), email, encrypt_password('Test123456!'), now(), now()
from (values 
  ('emma@test.com'), ('sophia@test.com'), ('olivia@test.com'), ('isabella@test.com'), ('ava@test.com'),
  ('mia@test.com'), ('charlotte@test.com'), ('amelia@test.com'), ('harper@test.com'), ('evelyn@test.com'),
  ('james@test.com'), ('michael@test.com'), ('daniel@test.com'), ('david@test.com'), ('matthew@test.com'),
  ('andrew@test.com'), ('joshua@test.com'), ('ethan@test.com'), ('jacob@test.com'), ('ryan@test.com')
) as v(email);

-- Step 2: Insert public users (linking to auth.users)
insert into public.users (id, role, full_name, dob, gender, email, bio, city, country, latitude, longitude, age_min_pref, age_max_pref, distance_radius_km, is_verified)
select id, 'seeker', name, dob, 'female', email, bio, city, country, lat, lng, 25, 45, 40, false
from (values 
  ('emma@test.com', 'Emma Johnson', '1998-05-15', 'Looking for someone genuine. Love travel and good food!', 'New York', 40.7128, -74.0060),
  ('sophia@test.com', 'Sophia Martinez', '1995-08-22', 'Adventure seeker. Beach lover. Dog mom.', 'Los Angeles', 34.0522, -118.2437),
  ('olivia@test.com', 'Olivia Wang', '2000-01-10', 'Coffee addict. Netflix binger. Cat person.', 'San Francisco', 37.7749, -122.4194),
  ('isabella@test.com', 'Isabella Chen', '1997-03-28', 'Foodie and fitness enthusiast. Let swipe!', 'Chicago', 41.8781, -87.6298),
  ('ava@test.com', 'Ava Thompson', '1999-11-05', 'Simple girl with big dreams', 'Miami', 25.7617, -80.1918),
  ('mia@test.com', 'Mia Garcia', '1996-07-19', 'Yoga lover. Nature walker. Sun seeker.', 'Seattle', 47.6062, -122.3321),
  ('charlotte@test.com', 'Charlotte Kim', '1994-12-03', 'Chef by day, foodie always.', 'Boston', 42.3601, -71.0589),
  ('amelia@test.com', 'Amelia Brown', '1998-04-11', 'Book worm. Coffee lover. Dog mom.', 'Austin', 30.2672, -97.7431),
  ('harper@test.com', 'Harper Lee', '2001-02-25', 'Gen Z. TikTok addict. Gamer girl.', 'Denver', 39.7392, -104.9903),
  ('evelyn@test.com', 'Evelyn Davis', '1995-09-17', 'MBA student. Ambitions.', 'Chicago', 41.8781, -87.6298)
) as seekers(email, name, dob, bio, city, lat, lng)
join auth.users using (email);

insert into public.users (id, role, full_name, dob, gender, email, bio, city, country, latitude, longitude, age_min_pref, age_max_pref, distance_radius_km, is_verified, budget_min, budget_max)
select id, 'partner', name, dob, 'male', email, bio, city, country, lat, lng, 22, 35, 40, true, budget_low, budget_high
from (values 
  ('james@test.com', 'James Wilson', '1985-06-12', 'Successful entrepreneur. Love fine dining and travel.', 'New York', 40.7128, -74.0060, 5000, 10000),
  ('michael@test.com', 'Michael Chen', '1988-02-28', 'Tech executive. Gym rat. Beach days.', 'Los Angeles', 34.0522, -118.2437, 8000, 15000),
  ('daniel@test.com', 'Daniel Brown', '1990-07-04', 'Finance professional. Wine collector. Chef at heart.', 'San Francisco', 37.7749, -122.4194, 6000, 12000),
  ('david@test.com', 'David Kim', '1987-11-15', 'Startup founder. Work hard play hard.', 'Chicago', 41.8781, -87.6298, 7000, 14000),
  ('matthew@test.com', 'Matthew Lee', '1992-03-22', 'Real estate investor. Golf enthusiast.', 'Miami', 25.7617, -80.1918, 5000, 10000),
  ('andrew@test.com', 'Andrew Taylor', '1989-08-30', 'Doctor. Tennis player. Music lover.', 'Boston', 42.3601, -71.0589, 8000, 15000),
  ('joshua@test.com', 'Joshua Anderson', '1986-12-08', 'Business owner. Travel addict. Foodie.', 'Seattle', 47.6062, -122.3321, 6000, 12000),
  ('ethan@test.com', 'Ethan Thomas', '1991-05-18', 'Marketing director. Sports fan. Night out.', 'Austin', 30.2672, -97.7431, 5000, 10000),
  ('jacob@test.com', 'Jacob Jackson', '1988-09-25', 'Lawyer. Art collector. Fine dining.', 'Denver', 39.7392, -104.9903, 7000, 13000),
  ('ryan@test.com', 'Ryan White', '1993-01-14', 'Entrepreneur. Golf. Luxury lifestyle.', 'New York', 40.7128, -74.0060, 8000, 15000)
) as partners(email, name, dob, bio, city, lat, lng, budget_low, budget_high)
join auth.users using (email);

-- Step 3: Add PHOTOS
do $$
declare
  seeker_rec record;
  partner_rec record;
begin
  for seeker_rec in select id from public.users where role = 'seeker' loop
    insert into public.photos (id, user_id, url, position)
    values 
      (gen_random_uuid(), seeker_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 1),
      (gen_random_uuid(), seeker_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 2),
      (gen_random_uuid(), seeker_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 3);
  end loop;

  for partner_rec in select id from public.users where role = 'partner' loop
    insert into public.photos (id, user_id, url, position)
    values 
      (gen_random_uuid(), partner_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 1),
      (gen_random_uuid(), partner_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 2),
      (gen_random_uuid(), partner_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 3);
  end loop;
end $$;