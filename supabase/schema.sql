-- Rakzan Al-Ufuq Real Estate Platform - Database Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE property_status AS ENUM ('available', 'sold', 'rented', 'under_contract', 'off_market');
CREATE TYPE property_purpose AS ENUM ('sale', 'rent');
CREATE TYPE property_type AS ENUM ('apartment', 'villa', 'land', 'office', 'commercial', 'warehouse', 'building');
CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'agent', 'viewer', 'client');
CREATE TYPE client_type AS ENUM ('buyer', 'seller', 'tenant', 'landlord', 'investor', 'other');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'lead');
CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'converted', 'closed');
CREATE TYPE contract_type AS ENUM ('sale', 'rent', 'lease', 'management');
CREATE TYPE contract_status AS ENUM ('active', 'expired', 'terminated', 'draft');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'credit_card', 'other');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE notification_type AS ENUM ('inquiry', 'contract', 'payment', 'appointment', 'system');
CREATE TYPE image_category AS ENUM ('bathroom', 'bedroom', 'living', 'kitchen', 'facilities', 'exterior', 'other');
CREATE TYPE setting_key AS ENUM ('company_name', 'company_phone', 'company_email', 'company_address', 'whatsapp_number', 'commission_rate', 'currency', 'date_format', 'theme_color');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  status property_status NOT NULL DEFAULT 'available',
  purpose property_purpose NOT NULL,
  type property_type NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  area NUMERIC(10, 2) NOT NULL,
  area_unit TEXT NOT NULL DEFAULT 'م²',
  bedrooms INT,
  bathrooms INT,
  year_built INT,
  floors INT,
  deed_number TEXT,
  street_width NUMERIC(5, 2),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  address TEXT,
  city TEXT NOT NULL,
  district TEXT,
  featured_image TEXT,
  images_bathroom TEXT[] DEFAULT '{}',
  images_bedroom TEXT[] DEFAULT '{}',
  images_living TEXT[] DEFAULT '{}',
  images_kitchen TEXT[] DEFAULT '{}',
  images_facilities TEXT[] DEFAULT '{}',
  images_exterior TEXT[] DEFAULT '{}',
  images_other TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INT NOT NULL DEFAULT 0
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  type client_type NOT NULL DEFAULT 'buyer',
  status client_status NOT NULL DEFAULT 'lead',
  notes TEXT,
  city TEXT,
  preferred_contact TEXT
);

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  status inquiry_status NOT NULL DEFAULT 'new',
  source TEXT
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contract_number TEXT NOT NULL UNIQUE,
  property_id UUID NOT NULL REFERENCES properties(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  type contract_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  amount NUMERIC(12, 2) NOT NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  terms TEXT,
  file_url TEXT
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  amount NUMERIC(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status payment_status NOT NULL DEFAULT 'pending',
  method payment_method NOT NULL DEFAULT 'bank_transfer',
  reference TEXT,
  notes TEXT
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key setting_key NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('company_name', 'ركزان الأفق العقارية'),
  ('company_phone', '+966 55 123 4567'),
  ('company_email', 'info@rakzan.com'),
  ('company_address', 'الرياض، المملكة العربية السعودية'),
  ('whatsapp_number', '966500000000'),
  ('commission_rate', '2.5'),
  ('currency', 'SAR'),
  ('date_format', 'YYYY-MM-DD'),
  ('theme_color', '#1a2b72')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_purpose ON properties(purpose);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_featured ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_favorites_user ON favorites(user_id);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view properties" ON properties FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can insert properties" ON properties FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update properties" ON properties FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete properties" ON properties FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access to clients" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public can create inquiries" ON inquiries FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Authenticated can view inquiries" ON inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update inquiries" ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access to contracts" ON contracts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access to payments" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access to appointments" ON appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', 'agent');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
