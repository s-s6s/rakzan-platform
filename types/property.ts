export type PropertyStatus = 'available' | 'sold' | 'rented' | 'under_contract' | 'off_market';
export type PropertyPurpose = 'sale' | 'rent';
export type PropertyType = 'apartment' | 'villa' | 'land' | 'office' | 'commercial' | 'warehouse' | 'building';
export type UserRole = 'super_admin' | 'manager' | 'agent' | 'viewer' | 'client';
export type ActivityAction = 'created' | 'updated' | 'deleted' | 'viewed' | 'contacted' | 'converted' | 'signed' | 'paid' | 'imported' | 'exported';
export type ActivityEntity = 'property' | 'client' | 'contract' | 'payment' | 'appointment' | 'inquiry' | 'user' | 'setting' | 'template';

export interface Property {
  id: string; created_at: string; updated_at: string;
  title: string; description: string; slug: string;
  status: PropertyStatus; purpose: PropertyPurpose; type: PropertyType;
  price: number; currency: string; rent_period: string | null;
  price_per_meter: number | null; is_negotiable: boolean; has_mortgage: boolean;
  area: number | null; area_unit: string; land_area: number | null; building_area: number | null;
  bedrooms: number | null; bathrooms: number | null; living_rooms: number | null;
  kitchens: number | null; parking_spots: number;
  furnished: string; floors: number | null; year_built: number | null;
  street_width: number | null; deed_number: string | null; property_number: string | null;
  plot_number: string | null; license_number: string | null;
  has_electricity: boolean; has_water: boolean; has_sewage: boolean; has_gas: boolean;
  amenities: string[];
  address: string | null; city: string; district: string | null; neighborhood: string | null;
  latitude: number | null; longitude: number | null; map_zoom: number;
  featured_image: string | null;
  images_bathroom: string[]; images_bedroom: string[]; images_living: string[];
  images_kitchen: string[]; images_facilities: string[]; images_exterior: string[];
  images_other: string[]; additional_images: string[];
  video_url: string | null; virtual_tour_url: string | null;
  features: string[]; nearby_places: NearbyPlace[];
  owner_id: string | null; owner_name: string | null; owner_phone: string | null;
  is_featured: boolean; is_active: boolean; views_count: number; inquiry_count: number;
}

export interface NearbyPlace {
  name: string; type: string; distance: string; icon?: string;
}

export interface Client {
  id: string; created_at: string; updated_at: string;
  name: string; phone: string; email: string | null;
  type: 'buyer' | 'seller' | 'tenant' | 'landlord' | 'investor' | 'other';
  status: 'active' | 'inactive' | 'lead';
  city: string | null; district: string | null; address: string | null;
  national_id: string | null; nationality: string; birth_date: string | null;
  occupation: string | null;
  budget_min: number | null; budget_max: number | null;
  preferred_property_types: string[]; preferred_cities: string[];
  notes: string | null; preferred_contact: string | null;
  is_blacklisted: boolean; blacklist_reason: string | null;
  tags: string[]; last_contact: string | null;
  assigned_to: string | null; created_by: string | null;
}

export interface Inquiry {
  id: string; created_at: string; property_id: string | null;
  property?: Property | null; client_id: string | null; client?: Client | null;
  name: string; phone: string; email: string | null; message: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  source: string | null; notes: string | null;
  assigned_to: string | null; responded_at: string | null;
}

export interface Contract {
  id: string; created_at: string; updated_at: string;
  contract_number: string; property_id: string; property?: Property | null;
  client_id: string; client?: Client | null; owner_id: string | null;
  type: 'sale' | 'rent' | 'lease' | 'management';
  status: 'active' | 'expired' | 'terminated' | 'draft';
  start_date: string; end_date: string | null;
  amount: number; currency: string;
  down_payment: number | null; installment_count: number | null;
  commission_amount: number | null; commission_percentage: number | null;
  terms: string | null; special_conditions: string | null;
  file_url: string | null; notes: string | null;
}

export interface Payment {
  id: string; created_at: string; updated_at: string;
  contract_id: string; contract?: Contract | null;
  amount: number; currency: string;
  due_date: string; paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  method: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'other';
  reference: string | null; receipt_url: string | null;
  notes: string | null; late_fee: number | null;
  paid_to: string | null;
}

export interface Appointment {
  id: string; created_at: string; updated_at: string;
  property_id: string | null; property?: Property | null;
  client_id: string | null; client?: Client | null;
  agent_id: string | null;
  title: string; date: string; time: string; end_time: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  type: string; notes: string | null;
  reminder_sent: boolean; reminder_minutes: number;
}

export interface Notification {
  id: string; created_at: string; user_id: string;
  title: string; body: string;
  type: 'inquiry' | 'contract' | 'payment' | 'appointment' | 'system';
  is_read: boolean; link: string | null;
}

export interface ActivityLog {
  id: string; created_at: string;
  user_id: string | null; user_name: string | null;
  action: ActivityAction; entity: ActivityEntity;
  entity_id: string | null; entity_name: string | null;
  description: string; metadata: Record<string, unknown>;
  ip_address: string | null;
}

export interface EmailTemplate {
  id: string; created_at: string; updated_at: string;
  name: string; subject: string; body: string;
  variables: string[]; is_active: boolean;
}

export interface Currency {
  id: string; code: string; name: string; symbol: string;
  exchange_rate: number; is_default: boolean; is_active: boolean;
  created_at: string;
}

export interface Tag {
  id: string; name: string; color: string; created_at: string;
}

export interface Profile {
  id: string; full_name: string | null; phone: string | null;
  avatar_url: string | null; role: UserRole;
  is_active: boolean; last_login: string | null; created_at: string;
}

export interface Setting {
  key: string; value: string; description: string | null;
}

export interface DashboardStats {
  total_properties: number; active_properties: number; sold_properties: number;
  total_clients: number; active_clients: number; lead_clients: number;
  total_inquiries: number; new_inquiries: number;
  total_contracts: number; active_contracts: number;
  total_payments: number; paid_payments: number; pending_payments: number;
  total_revenue: number; pending_revenue: number; monthly_revenue: number;
  total_appointments: number; today_appointments: number;
  conversion_rate: number; average_price: number;
  total_commission: number; pending_commission: number;
}
