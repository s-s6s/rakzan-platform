-- Rakzan Platform Schema v3
-- ============================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- 1. Enums
do $$ begin
  create type property_status as enum ('available','sold','rented','under_contract','off_market');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type property_purpose as enum ('sale','rent');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type property_type as enum ('apartment','villa','land','office','commercial','warehouse','building');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_role as enum ('super_admin','manager','agent','viewer','client');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type client_type as enum ('buyer','seller','tenant','landlord','investor','other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type client_status as enum ('active','inactive','lead');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type inquiry_status as enum ('new','contacted','converted','closed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type contract_type as enum ('sale','rent','lease','management');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type contract_status as enum ('active','expired','terminated','draft');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','overdue','cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_method as enum ('cash','bank_transfer','check','credit_card','other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type appointment_status as enum ('scheduled','completed','cancelled','rescheduled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type notification_type as enum ('inquiry','contract','payment','appointment','system');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type activity_type as enum ('created','updated','deleted','viewed','contacted','converted','signed','paid','imported','exported');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type activity_entity as enum ('property','client','contract','payment','appointment','inquiry','user','setting','template');
exception when duplicate_object then null;
end $$;

-- 2. Profiles (syncs with auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role user_role default 'agent',
  is_active boolean default true,
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id or auth.jwt() ->> 'role' in ('super_admin','manager'));

-- 3. Settings
create table if not exists settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz default now()
);

insert into settings (key, value, description) values
  ('company_name', 'شركة ركزان الآفاق العقارية', 'اسم الشركة'),
  ('company_phone', '0500000000', 'رقم جوال الشركة'),
  ('company_email', 'info@rakzan.com', 'البريد الإلكتروني للشركة'),
  ('company_address', 'الرياض، المملكة العربية السعودية', 'عنوان الشركة'),
  ('whatsapp_number', '0500000000', 'رقم واتساب'),
  ('commission_rate', '2.5', 'نسبة العمولة الافتراضية (%)'),
  ('currency', 'SAR', 'العملة الافتراضية'),
  ('currency_symbol', 'ريال', 'رمز العملة'),
  ('currency_position', 'right', 'موضع رمز العملة'),
  ('timezone', 'Asia/Riyadh', 'المنطقة الزمنية'),
  ('date_format', 'YYYY/MM/DD', 'صيغة التاريخ'),
  ('locale', 'ar-SA', 'اللغة الافتراضية'),
  ('notify_on_inquiry', 'true', 'إشعار عند استفسار جديد'),
  ('notify_on_contract', 'true', 'إشعار عند عقد جديد'),
  ('notify_on_payment', 'true', 'إشعار عند دفعة جديدة'),
  ('notify_on_appointment', 'true', 'إشعار عند موعد جديد'),
  ('default_property_image', '', 'صورة العقار الافتراضية'),
  ('favicon_url', '', 'أيقونة الموقع')
on conflict (key) do nothing;

-- 4. Currencies
create table if not exists currencies (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  symbol text not null,
  exchange_rate numeric(15,6) default 1.0,
  is_default boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into currencies (code, name, symbol, exchange_rate, is_default) values
  ('SAR', 'ريال سعودي', 'ر.س', 1.0, true),
  ('USD', 'دولار أمريكي', '$', 0.266, false),
  ('AED', 'درهم إماراتي', 'د.إ', 0.98, false),
  ('QAR', 'ريال قطري', 'ر.ق', 0.97, false),
  ('KWD', 'دينار كويتي', 'د.ك', 0.081, false),
  ('BHD', 'دينار بحريني', 'د.ب', 0.10, false),
  ('OMR', 'ريال عماني', 'ر.ع', 0.102, false),
  ('EGP', 'جنيه مصري', 'ج.م', 8.27, false)
on conflict (code) do nothing;

-- 5. Properties
create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Basic Info
  title text not null,
  description text,
  slug text not null unique,
  status property_status default 'available',
  purpose property_purpose default 'sale',
  type property_type default 'apartment',
  
  -- Pricing
  price numeric(15,2) not null default 0,
  currency text default 'SAR',
  rent_period text,
  price_per_meter numeric(15,2),
  is_negotiable boolean default true,
  has_mortgage boolean default false,
  
  -- Dimensions
  area numeric(10,2),
  area_unit text default 'متر مربع',
  land_area numeric(10,2),
  building_area numeric(10,2),
  
  -- Rooms
  bedrooms integer,
  bathrooms integer,
  living_rooms integer,
  kitchens integer,
  parking_spots integer default 0,
  
  -- Details
  furnished text default 'unfurnished',
  floors integer,
  year_built integer,
  street_width numeric(10,2),
  deed_number text,
  property_number text,
  plot_number text,
  license_number text,
  
  -- Utilities
  has_electricity boolean default false,
  has_water boolean default false,
  has_sewage boolean default false,
  has_gas boolean default false,
  
  -- Amenities
  amenities text[] default '{}',
  
  -- Location
  address text,
  city text not null default '',
  district text,
  neighborhood text,
  latitude double precision,
  longitude double precision,
  map_zoom integer default 15,
  
  -- Media
  featured_image text,
  images_bathroom text[] default '{}',
  images_bedroom text[] default '{}',
  images_living text[] default '{}',
  images_kitchen text[] default '{}',
  images_facilities text[] default '{}',
  images_exterior text[] default '{}',
  images_other text[] default '{}',
  additional_images text[] default '{}',
  video_url text,
  virtual_tour_url text,
  
  -- Features
  features text[] default '{}',
  nearby_places jsonb default '[]',
  
  -- Owner
  owner_id uuid references auth.users(id),
  owner_name text,
  owner_phone text,
  
  -- Status
  is_featured boolean default false,
  is_active boolean default true,
  views_count integer default 0,
  inquiry_count integer default 0
);

alter table properties enable row level security;
create policy "properties_select" on properties for select using (true);
create policy "properties_insert" on properties for insert with check (auth.role() = 'authenticated');
create policy "properties_update" on properties for update using (auth.role() = 'authenticated');
create policy "properties_delete" on properties for delete using (auth.role() = 'authenticated');

-- 6. Clients
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  phone text not null,
  email text,
  type client_type default 'buyer',
  status client_status default 'lead',
  city text,
  district text,
  address text,
  national_id text,
  nationality text default 'سعودي',
  birth_date date,
  occupation text,
  budget_min numeric(15,2),
  budget_max numeric(15,2),
  preferred_property_types text[] default '{}',
  preferred_cities text[] default '{}',
  notes text,
  preferred_contact text default 'phone',
  is_blacklisted boolean default false,
  blacklist_reason text,
  tags text[] default '{}',
  last_contact timestamptz,
  assigned_to uuid references auth.users(id),
  created_by uuid references auth.users(id)
);

alter table clients enable row level security;
create policy "clients_select" on clients for select using (auth.role() = 'authenticated');
create policy "clients_insert" on clients for insert with check (auth.role() = 'authenticated');
create policy "clients_update" on clients for update using (auth.role() = 'authenticated');
create policy "clients_delete" on clients for delete using (auth.role() = 'authenticated');

-- 7. Inquiries
create table if not exists inquiries (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  property_id uuid references properties(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text,
  status inquiry_status default 'new',
  source text default 'website',
  notes text,
  assigned_to uuid references auth.users(id),
  responded_at timestamptz
);

alter table inquiries enable row level security;
create policy "inquiries_select" on inquiries for select using (auth.role() = 'authenticated');
create policy "inquiries_insert" on inquiries for insert with check (auth.role() = 'authenticated');
create policy "inquiries_update" on inquiries for update using (auth.role() = 'authenticated');
create policy "inquiries_delete" on inquiries for delete using (auth.role() = 'authenticated');

-- 8. Contracts
create table if not exists contracts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  contract_number text not null unique,
  property_id uuid references properties(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  owner_id uuid references auth.users(id),
  type contract_type default 'sale',
  status contract_status default 'draft',
  start_date date not null,
  end_date date,
  amount numeric(15,2) not null default 0,
  currency text default 'SAR',
  down_payment numeric(15,2),
  installment_count integer,
  commission_amount numeric(15,2),
  commission_percentage numeric(5,2),
  terms text,
  special_conditions text,
  file_url text,
  notes text
);

alter table contracts enable row level security;
create policy "contracts_select" on contracts for select using (auth.role() = 'authenticated');
create policy "contracts_insert" on contracts for insert with check (auth.role() = 'authenticated');
create policy "contracts_update" on contracts for update using (auth.role() = 'authenticated');
create policy "contracts_delete" on contracts for delete using (auth.role() = 'authenticated');

-- 9. Payments
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  contract_id uuid references contracts(id) on delete cascade,
  amount numeric(15,2) not null default 0,
  currency text default 'SAR',
  due_date date not null,
  paid_date date,
  status payment_status default 'pending',
  method payment_method default 'bank_transfer',
  reference text,
  receipt_url text,
  notes text,
  late_fee numeric(15,2),
  paid_to uuid references auth.users(id)
);

alter table payments enable row level security;
create policy "payments_select" on payments for select using (auth.role() = 'authenticated');
create policy "payments_insert" on payments for insert with check (auth.role() = 'authenticated');
create policy "payments_update" on payments for update using (auth.role() = 'authenticated');
create policy "payments_delete" on payments for delete using (auth.role() = 'authenticated');

-- 10. Appointments
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  property_id uuid references properties(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  agent_id uuid references auth.users(id),
  title text not null,
  date date not null,
  time time not null,
  end_time time,
  status appointment_status default 'scheduled',
  type text default 'visit',
  notes text,
  reminder_sent boolean default false,
  reminder_minutes integer default 60
);

alter table appointments enable row level security;
create policy "appointments_select" on appointments for select using (auth.role() = 'authenticated');
create policy "appointments_insert" on appointments for insert with check (auth.role() = 'authenticated');
create policy "appointments_update" on appointments for update using (auth.role() = 'authenticated');
create policy "appointments_delete" on appointments for delete using (auth.role() = 'authenticated');

-- 11. Notifications
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  type notification_type default 'system',
  is_read boolean default false,
  link text
);

alter table notifications enable row level security;
create policy "notifications_select" on notifications for select using (auth.uid() = user_id);
create policy "notifications_insert" on notifications for insert with check (auth.uid() = user_id);
create policy "notifications_update" on notifications for update using (auth.uid() = user_id);
create policy "notifications_delete" on notifications for delete using (auth.uid() = user_id);

-- 12. Favorites
create table if not exists favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

alter table favorites enable row level security;

-- 13. Activity Log
create table if not exists activity_log (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null,
  user_name text,
  action activity_type not null,
  entity activity_entity not null,
  entity_id uuid,
  entity_name text,
  description text,
  metadata jsonb default '{}',
  ip_address text
);

alter table activity_log enable row level security;
create policy "activity_log_select" on activity_log for select using (auth.role() = 'authenticated');
create policy "activity_log_insert" on activity_log for insert with check (auth.role() = 'authenticated');

-- 14. Email Templates
create table if not exists email_templates (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null unique,
  subject text not null,
  body text not null,
  variables text[] default '{}',
  is_active boolean default true
);

insert into email_templates (name, subject, body, variables) values
  ('inquiry_received', 'استفسار جديد بخصوص {property_title}', 'تم استلام استفسار من {client_name} بخصوص العقار {property_title}. رقم الجوال: {client_phone}', '{client_name},{client_phone},{property_title}'),
  ('contract_created', 'تم إنشاء عقد جديد رقم {contract_number}', 'تم إنشاء عقد {contract_type} برقم {contract_number} بقيمة {amount}', '{contract_number},{contract_type},{amount}'),
  ('payment_reminder', 'تذكير بدفعة مستحقة', 'تذكير بدفعة مستحقة بقيمة {amount} في تاريخ {due_date}', '{amount},{due_date}'),
  ('appointment_reminder', 'تذكير بموعد', 'تذكير بموعد {appointment_title} في تاريخ {appointment_date}', '{appointment_title},{appointment_date}'),
  ('welcome_message', 'مرحباً بك في ركزان الآفاق', 'مرحباً {client_name}، شكراً لتواصلك مع شركة ركزان الآفاق العقارية', '{client_name}')
on conflict (name) do nothing;

alter table email_templates enable row level security;
create policy "email_templates_select" on email_templates for select using (auth.role() = 'authenticated');
create policy "email_templates_insert" on email_templates for insert with check (auth.role() = 'authenticated');
create policy "email_templates_update" on email_templates for update using (auth.role() = 'authenticated');
create policy "email_templates_delete" on email_templates for delete using (auth.role() = 'authenticated');

-- 15. Tags
create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  color text default '#6366f1',
  created_at timestamptz default now()
);

insert into tags (name, color) values
  ('مميز', '#C9A84C'),
  ('عاجل', '#EF4444'),
  ('مخفض', '#10B981'),
  ('جديد', '#3B82F6'),
  ('للبيع', '#1A2B72')
on conflict (name) do nothing;

alter table tags enable row level security;

-- 16. Functions

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'agent');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists properties_updated_at before update on properties
  for each row execute function update_updated_at();
create trigger if not exists clients_updated_at before update on clients
  for each row execute function update_updated_at();
create trigger if not exists contracts_updated_at before update on contracts
  for each row execute function update_updated_at();
create trigger if not exists payments_updated_at before update on payments
  for each row execute function update_updated_at();
create trigger if not exists appointments_updated_at before update on appointments
  for each row execute function update_updated_at();
create trigger if not exists profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
