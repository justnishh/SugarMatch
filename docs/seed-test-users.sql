-- ============================================
-- Seed Test Users (20 accounts)
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- 10 SEEKER ACCOUNTS (women seeking partners)
-- ============================================

-- Seeker accounts with random coordinates near major cities
insert into public.users (id, role, full_name, dob, gender, email, bio, city, country, latitude, longitude, age_min_pref, age_max_pref, distance_radius_km, is_verified)
values 
  (gen_random_uuid(), 'seeker', 'Emma Johnson', '1998-05-15', 'female', 'emma@test.com', 'Looking for someone genuine. Love travel and good food!', 'New York', 'USA', 40.7128, -74.0060, 30, 50, 30, true),
  (gen_random_uuid(), 'seeker', 'Sophia Martinez', '1995-08-22', 'female', 'sophia@test.com', 'Adventure seeker. Beach lover. Dog mom.', 'Los Angeles', 'USA', 34.0522, -118.2437, 28, 45, 50, false),
  (gen_random_uuid(), 'seeker', 'Olivia Wang', '2000-01-10', 'female', 'olivia@test.com', 'Coffee addict. Netflix binger. Cat person.', 'San Francisco', 'USA', 37.7749, -122.4194, 25, 40, 25, true),
  (gen_random_uuid(), 'seeker', 'Isabella Chen', '1997-03-28', 'female', 'isabella@test.com', 'Foodie & fitness enthusiast. Let swipe!', 'Chicago', 'USA', 41.8781, -87.6298, 28, 45, 40, false),
  (gen_random_uuid(), 'seeker', 'Ava Thompson', '1999-11-05', 'female', 'ava@test.com', 'Simple girl with big dreams', 'Miami', 'USA', 25.7617, -80.1918, 27, 42, 35, false),
  (gen_random_uuid(), 'seeker', 'Mia Garcia', '1996-07-19', 'female', 'mia@test.com', 'Yoga lover. Nature walker. Sun seeker.', 'Seattle', 'USA', 47.6062, -122.3321, 30, 48, 30, true),
  (gen_random_uuid(), 'seeker', 'Charlotte Kim', '1994-12-03', 'female', 'charlotte@test.com', 'Chef by day, foodie always. Looking for my partner in crime.', 'Boston', 'USA', 42.3601, -71.0589, 32, 50, 25, false),
  (gen_random_uuid(), 'seeker', 'Amelia Brown', '1998-04-11', 'female', 'amelia@test.com', 'Book worm. Coffee lover. Dog mom.', 'Austin', 'USA', 30.2672, -97.7431, 26, 40, 45, false),
  (gen_random_uuid(), 'seeker', 'Harper Lee', '2001-02-25', 'female', 'harper@test.com', 'Gen Z. TikTok addict. Gamer girl.', 'Denver', 'USA', 39.7392, -104.9903, 22, 35, 50, false),
  (gen_random_uuid(), 'seeker', 'Evelyn Davis', '1995-09-17', 'female', 'evelyn@test.com', 'MBA student. Ambitions. Looking for something real.', 'Chicago', 'USA', 41.8781, -87.6298, 28, 45, 30, true);

-- ============================================
-- 10 PARTNER ACCOUNTS (men seeking seekers)
-- ============================================

insert into public.users (id, role, full_name, dob, gender, email, bio, city, country, latitude, longitude, age_min_pref, age_max_pref, distance_radius_km, is_verified, budget_min, budget_max)
values 
  (gen_random_uuid(), 'partner', 'James Wilson', '1985-06-12', 'male', 'james@test.com', 'Successful entrepreneur. Love fine dining and travel.', 'New York', 'USA', 40.7128, -74.0060, 22, 35, 50, true, 5000, 10000),
  (gen_random_uuid(), 'partner', 'Michael Chen', '1988-02-28', 'male', 'michael@test.com', 'Tech executive. Gym rat. Beach days.', 'Los Angeles', 'USA', 34.0522, -118.2437, 22, 32, 40, true, 8000, 15000),
  (gen_random_uuid(), 'partner', 'Daniel Brown', '1990-07-04', 'male', 'daniel@test.com', 'Finance professional. Wine collector. Chef at heart.', 'San Francisco', 'USA', 37.7749, -122.4194, 24, 35, 30, true, 6000, 12000),
  (gen_random_uuid(), 'partner', 'David Kim', '1987-11-15', 'male', 'david@test.com', 'Startup founder. Work hard play hard.', 'Chicago', 'USA', 41.8781, -87.6298, 23, 34, 45, false, 7000, 14000),
  (gen_random_uuid(), 'partner', 'Matthew Lee', '1992-03-22', 'male', 'matthew@test.com', 'Real estate investor. Golf enthusiast.', 'Miami', 'USA', 25.7617, -80.1918, 22, 33, 35, false, 5000, 10000),
  (gen_random_uuid(), 'partner', 'Andrew Taylor', '1989-08-30', 'male', 'andrew@test.com', 'Doctor. Tennis player. Music lover.', 'Boston', 'USA', 42.3601, -71.0589, 24, 36, 30, true, 8000, 15000),
  (gen_random_uuid(), 'partner', 'Joshua Anderson', '1986-12-08', 'male', 'joshua@test.com', 'Business owner. Travel addict. Foodie.', 'Seattle', 'USA', 47.6062, -122.3321, 23, 35, 40, false, 6000, 12000),
  (gen_random_uuid(), 'partner', 'Ethan Thomas', '1991-05-18', 'male', 'ethan@test.com', 'Marketing director. Sports fan. Night out.', 'Austin', 'USA', 30.2672, -97.7431, 22, 34, 50, false, 5000, 10000),
  (gen_random_uuid(), 'partner', 'Jacob Jackson', '1988-09-25', 'male', 'jacob@test.com', 'Lawyer. Art collector. Fine dining.', 'Denver', 'USA', 39.7392, -104.9903, 24, 36, 35, true, 7000, 13000),
  (gen_random_uuid(), 'partner', 'Ryan White', '1993-01-14', 'male', 'ryan@test.com', 'Entrepreneur. Golf. Luxury lifestyle.', 'New York', 'USA', 40.7128, -74.0060, 22, 33, 40, false, 8000, 15000);

-- ============================================
-- ADD PHOTOS (using placeholder URLs)
-- ============================================

do $$
declare
  seeker_rec record;
  partner_rec record;
begin
  -- Add 3 photos for each seeker
  for seeker_rec in select id from public.users where role = 'seeker' loop
    insert into public.photos (id, user_id, url, position)
    values 
      (gen_random_uuid(), seeker_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 1),
      (gen_random_uuid(), seeker_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 2),
      (gen_random_uuid(), seeker_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 3);
  end loop;

  -- Add 3 photos for each partner
  for partner_rec in select id from public.users where role = 'partner' loop
    insert into public.photos (id, user_id, url, position)
    values 
      (gen_random_uuid(), partner_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 1),
      (gen_random_uuid(), partner_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 2),
      (gen_random_uuid(), partner_rec.id, 'https://picsum.photos/seed/' || floor(random()*900)::int || '/400/600', 3);
  end loop;
end $$;