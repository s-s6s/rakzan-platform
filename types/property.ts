export type PropertyStatus = "available" | "sold" | "rented" | "under_contract" | "off_market";
export type PropertyPurpose = "sale" | "rent";
export type PropertyType = "apartment" | "villa" | "land" | "office" | "commercial" | "warehouse" | "building";
export type UserRole = "super_admin" | "manager" | "agent" | "viewer" | "client";

export interface Property {
  id: string; created_at: string; updated_at: string;
  title: string; description: string; slug: string;
  status: PropertyStatus; purpose: PropertyPurpose; type: PropertyType;
  price: number; currency: string; area: number; area_unit: string;
  bedrooms: number | null; bathrooms: number | null; year_built: number | null;
  floors: number | null; deed_number: string | null; street_width: number | null;
  latitude: number | null; longitude: number | null;
  address: string | null; city: string; district: string | null;
  featured_image: string | null;
  images_bathroom: string[];
  images_bedroom: string[];
  images_living: string[];
  images_kitchen: string[];
  images_facilities: string[];
  images_exterior: string[];
  images_other: string[];
  features: string[];
  owner_id: string | null; is_featured: boolean; views_count: number;
}

export interface Client {
  id: string; created_at: string; name: string; phone: string; email: string | null;
  type: "buyer" | "seller" | "tenant" | "landlord" | "investor" | "other";
  status: "active" | "inactive" | "lead"; notes: string | null; city: string | null;
  preferred_contact: "phone" | "email" | "whatsapp" | null;
}

export interface Inquiry {
  id: string; created_at: string; property_id: string | null; property?: Property | null;
  client_id: string | null; client?: Client | null;
  name: string; phone: string; email: string | null; message: string;
  status: "new" | "contacted" | "converted" | "closed"; source: string | null;
}

export interface Contract {
  id: string; created_at: string; contract_number: string;
  property_id: string; property?: Property | null; client_id: string; client?: Client | null;
  type: "sale" | "rent" | "lease" | "management";
  start_date: string; end_date: string | null; amount: number;
  status: "active" | "expired" | "terminated" | "draft";
  terms: string | null; file_url: string | null;
}

export interface Payment {
  id: string; created_at: string; contract_id: string; contract?: Contract | null;
  amount: number; due_date: string; paid_date: string | null;
  status: "pending" | "paid" | "overdue" | "cancelled";
  method: "cash" | "bank_transfer" | "check" | "credit_card" | "other";
  reference: string | null; notes: string | null;
}

export interface Appointment {
  id: string; created_at: string; property_id: string | null; property?: Property | null;
  client_id: string | null; client?: Client | null; agent_id: string | null;
  title: string; date: string; time: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"; notes: string | null;
}

export interface Notification {
  id: string; created_at: string; user_id: string;
  title: string; body: string;
  type: "inquiry" | "contract" | "payment" | "appointment" | "system";
  is_read: boolean; link: string | null;
}

export interface Favorite {
  id: string; user_id: string; property_id: string; property?: Property | null; created_at: string;
}
