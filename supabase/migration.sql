-- Migration: Add missing columns & fix RLS policies (no auth required)
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to properties
alter table properties add column if not exists additional_images text[] default '{}';
alter table properties add column if not exists living_rooms integer;
alter table properties add column if not exists kitchens integer;
alter table properties add column if not exists parking_spots integer default 0;
alter table properties add column if not exists furnished text default 'unfurnished';
alter table properties add column if not exists has_electricity boolean default false;
alter table properties add column if not exists has_water boolean default false;
alter table properties add column if not exists has_sewage boolean default false;
alter table properties add column if not exists has_gas boolean default false;
alter table properties add column if not exists amenities text[] default '{}';
alter table properties add column if not exists neighborhood text;
alter table properties add column if not exists map_zoom integer default 15;
alter table properties add column if not exists video_url text;
alter table properties add column if not exists virtual_tour_url text;
alter table properties add column if not exists nearby_places jsonb default '[]';
alter table properties add column if not exists owner_name text;
alter table properties add column if not exists owner_phone text;
alter table properties add column if not exists is_active boolean default true;
alter table properties add column if not exists inquiry_count integer default 0;
alter table properties add column if not exists property_number text;
alter table properties add column if not exists plot_number text;
alter table properties add column if not exists license_number text;
alter table properties add column if not exists land_area numeric(10,2);
alter table properties add column if not exists building_area numeric(10,2);

-- 2. Add missing columns to clients
alter table clients add column if not exists national_id text;
alter table clients add column if not exists nationality text default 'سعودي';
alter table clients add column if not exists birth_date date;
alter table clients add column if not exists occupation text;
alter table clients add column if not exists budget_min numeric(15,2);
alter table clients add column if not exists budget_max numeric(15,2);
alter table clients add column if not exists preferred_property_types text[] default '{}';
alter table clients add column if not exists preferred_cities text[] default '{}';
alter table clients add column if not exists preferred_contact text default 'phone';
alter table clients add column if not exists is_blacklisted boolean default false;
alter table clients add column if not exists blacklist_reason text;
alter table clients add column if not exists tags text[] default '{}';
alter table clients add column if not exists last_contact timestamptz;
alter table clients add column if not exists assigned_to uuid;
alter table clients add column if not exists created_by uuid;

-- 3. Drop ALL old RLS policies and recreate with public access
do $$
declare
  rec record;
begin
  for rec in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on %I', rec.policyname, rec.tablename);
  end loop;
end $$;

-- 4. Recreate policies with full public access
alter table properties enable row level security;
create policy "properties_all" on properties for all using (true) with check (true);
alter table clients enable row level security;
create policy "clients_all" on clients for all using (true) with check (true);
alter table inquiries enable row level security;
create policy "inquiries_all" on inquiries for all using (true) with check (true);
alter table contracts enable row level security;
create policy "contracts_all" on contracts for all using (true) with check (true);
alter table payments enable row level security;
create policy "payments_all" on payments for all using (true) with check (true);
alter table appointments enable row level security;
create policy "appointments_all" on appointments for all using (true) with check (true);
alter table activity_log enable row level security;
create policy "activity_log_all" on activity_log for all using (true) with check (true);
alter table email_templates enable row level security;
create policy "email_templates_all" on email_templates for all using (true) with check (true);
alter table currencies enable row level security;
create policy "currencies_all" on currencies for all using (true) with check (true);
alter table favorites enable row level security;
create policy "favorites_all" on favorites for all using (true) with check (true);
alter table tags enable row level security;
create policy "tags_all" on tags for all using (true) with check (true);
alter table notifications enable row level security;
create policy "notifications_all" on notifications for all using (true) with check (true);
