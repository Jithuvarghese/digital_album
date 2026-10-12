-- Our Story, Live: Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Guests have no accounts: they can add content, but only approved items are publicly readable.
-- Moderation and private data (RSVPs, time capsule) are handled by /api/admin with the service role key.

create extension if not exists "pgcrypto";

-- Settings (single row)
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  phase text not null default 'auto' check (phase in ('auto', 'before', 'during', 'after')),
  theme text not null default 'kasavu',
  auto_approve boolean not null default false,
  modules_enabled jsonb not null default '{}'::jsonb,
  game_status text not null default 'open' check (game_status in ('open', 'ended')),
  winner text check (winner in ('bride', 'groom')),
  updated_at timestamptz not null default now()
);
insert into settings (id) values (1) on conflict do nothing;

-- Photos
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  thumb_url text not null,
  uploader_name text not null check (char_length(uploader_name) between 1 and 40),
  caption text not null default '' check (char_length(caption) <= 140),
  team text check (team in ('bride', 'groom')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  likes int not null default 0 check (likes >= 0),
  source text not null default 'guest' check (source in ('couple', 'guest')),
  challenge_id text,
  guest_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists photos_status_created_idx on photos (status, created_at desc);

-- Blessings
create table if not exists blessings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  relation text not null default '' check (char_length(relation) <= 80),
  message text not null check (char_length(message) between 2 and 600),
  style text not null default 'simple' check (style in ('floral', 'gold', 'simple')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists blessings_status_created_idx on blessings (status, created_at desc);

-- Guests and score events
create table if not exists guests (
  id uuid primary key,
  display_name text not null check (char_length(display_name) between 1 and 40),
  team text not null check (team in ('bride', 'groom')),
  points int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests (id) on delete cascade,
  team text not null check (team in ('bride', 'groom')),
  source text not null check (source in ('quiz', 'challenge', 'prediction', 'match', 'bonus')),
  points int not null check (points between 0 and 100),
  created_at timestamptz not null default now()
);
create index if not exists scores_guest_idx on scores (guest_id);
create index if not exists scores_team_idx on scores (team);

-- RSVPs
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  attending boolean not null,
  guest_count int not null default 1 check (guest_count between 0 and 20),
  side text not null check (side in ('bride', 'groom', 'both')),
  meal text not null default 'veg',
  note text not null default '' check (char_length(note) <= 400),
  created_at timestamptz not null default now()
);

-- Time capsule
create table if not exists capsule_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  message text not null check (char_length(message) between 2 and 1000),
  unlock_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Predictions
create table if not exists predictions (
  id text primary key,
  question text not null,
  options jsonb not null,
  revealed_answer int,
  sort_order int not null default 0
);

create table if not exists prediction_votes (
  id uuid primary key default gen_random_uuid(),
  prediction_id text not null references predictions (id) on delete cascade,
  guest_id uuid not null references guests (id) on delete cascade,
  team text not null check (team in ('bride', 'groom')),
  option int not null,
  created_at timestamptz not null default now(),
  unique (prediction_id, guest_id)
);

-- New guest content is pending unless auto-approve is switched on
create or replace function set_initial_status() returns trigger language plpgsql as $$
begin
  new.status := case when (select auto_approve from settings where id = 1) then 'approved' else 'pending' end;
  if tg_table_name = 'photos' then
    new.likes := 0;
    if new.source = 'couple' then new.source := 'guest'; end if;
  end if;
  return new;
end $$;

drop trigger if exists photos_initial_status on photos;
create trigger photos_initial_status before insert on photos
  for each row when (current_user = 'anon') execute function set_initial_status();
drop trigger if exists blessings_initial_status on blessings;
create trigger blessings_initial_status before insert on blessings
  for each row when (current_user = 'anon') execute function set_initial_status();

-- Likes without exposing update rights
create or replace function like_photo(p_id uuid, p_delta int) returns void
language sql security definer set search_path = public as $$
  update photos set likes = greatest(0, likes + case when p_delta > 0 then 1 else -1 end)
  where id = p_id and status = 'approved';
$$;

-- Number of sealed capsule messages, without revealing them
create or replace function capsule_count() returns bigint
language sql security definer set search_path = public as $$
  select count(*) from capsule_messages;
$$;

grant execute on function like_photo(uuid, int) to anon;
grant execute on function capsule_count() to anon;

-- Row level security
alter table settings enable row level security;
alter table photos enable row level security;
alter table blessings enable row level security;
alter table guests enable row level security;
alter table scores enable row level security;
alter table rsvps enable row level security;
alter table capsule_messages enable row level security;
alter table predictions enable row level security;
alter table prediction_votes enable row level security;

drop policy if exists "read settings" on settings;
create policy "read settings" on settings for select using (true);

drop policy if exists "read approved photos" on photos;
create policy "read approved photos" on photos for select using (status = 'approved');
drop policy if exists "guests add photos" on photos;
create policy "guests add photos" on photos for insert with check (status = 'pending' or status = 'approved');

drop policy if exists "read approved blessings" on blessings;
create policy "read approved blessings" on blessings for select using (status = 'approved');
drop policy if exists "guests add blessings" on blessings;
create policy "guests add blessings" on blessings for insert with check (true);

drop policy if exists "read guests" on guests;
create policy "read guests" on guests for select using (true);
drop policy if exists "guests join" on guests;
create policy "guests join" on guests for insert with check (true);
drop policy if exists "guests rename" on guests;
create policy "guests rename" on guests for update using (true) with check (true);

drop policy if exists "read scores" on scores;
create policy "read scores" on scores for select using (true);
drop policy if exists "add scores while game open" on scores;
create policy "add scores while game open" on scores for insert with check (
  points <= 100
  and source in ('quiz', 'match')
  and (select game_status from settings where id = 1) = 'open'
);

drop policy if exists "guests rsvp" on rsvps;
create policy "guests rsvp" on rsvps for insert with check (true);

drop policy if exists "guests seal capsule" on capsule_messages;
create policy "guests seal capsule" on capsule_messages for insert with check (unlock_at > now());

drop policy if exists "read predictions" on predictions;
create policy "read predictions" on predictions for select using (true);

drop policy if exists "read votes" on prediction_votes;
create policy "read votes" on prediction_votes for select using (true);
drop policy if exists "guests vote" on prediction_votes;
create policy "guests vote" on prediction_votes for insert with check (
  (select revealed_answer from predictions p where p.id = prediction_id) is null
);
drop policy if exists "guests change vote" on prediction_votes;
create policy "guests change vote" on prediction_votes for update using (
  (select revealed_answer from predictions p where p.id = prediction_id) is null
);

-- Realtime for the live wall and scoreboard
do $$
begin
  begin alter publication supabase_realtime add table photos; exception when others then null; end;
  begin alter publication supabase_realtime add table blessings; exception when others then null; end;
  begin alter publication supabase_realtime add table scores; exception when others then null; end;
  begin alter publication supabase_realtime add table guests; exception when others then null; end;
  begin alter publication supabase_realtime add table settings; exception when others then null; end;
  begin alter publication supabase_realtime add table predictions; exception when others then null; end;
  begin alter publication supabase_realtime add table prediction_votes; exception when others then null; end;
end $$;

-- Storage bucket for photos (public read, guest upload)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "guests upload photos" on storage.objects;
create policy "guests upload photos" on storage.objects for insert to anon with check (bucket_id = 'photos');
drop policy if exists "public read photos" on storage.objects;
create policy "public read photos" on storage.objects for select using (bucket_id = 'photos');

-- Predictions from the wedding config (edit to match src/config/wedding.config.ts)
insert into predictions (id, question, options, sort_order) values
  ('cry-first', 'Who will cry first during the thali tying?', '["Anjali","Karthik","Divya (groom''s sister)","Lekha (bride''s mother)"]', 1),
  ('sweet', 'Which sweet disappears first at the sadya?', '["Palada payasam","Ada pradhaman","Boli","Pazham"]', 2),
  ('late', 'Who will be the last to arrive at the muhurtham?', '["Arjun","Rahul","Venkatesh Mama","The photographer"]', 3),
  ('dance', 'Who will be first on the dance floor?', '["Priya","Meera","Natarajan Thatha","The couple"]', 4)
on conflict (id) do nothing;
