"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Shield, Users, Handshake, Building2, ArrowLeft, MessageCircle } from "lucide-react";


const sampleProperties: any[] = [
  {
    id: "1", created_at: "", updated_at: "",
    title: "فلة فاخرة في حي النرجس", description: "فلة راقية بموقع مميز",
    slug: "villa-an-narjis-1", status: "available", purpose: "sale", type: "villa",
    price: 2500000, currency: "SAR", area: 450, area_unit: "م²",
    bedrooms: 5, bathrooms: 4, year_built: 2022, floors: 2,
    deed_number: null, street_width: null, latitude: null, longitude: null,
    address: "حي النرجس، الرياض", city: "الرياض", district: "النرجس",
    featured_image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
    images_bathroom: [], images_bedroom: [], images_living: [], images_kitchen: [],
    images_facilities: [], images_exterior: [], images_other: [],
    features: [], owner_id: null, is_featured: true, views_count: 0,
  },
  {
    id: "2", created_at: "", updated_at: "",
    title: "شقة حديثة في حي العليا", description: "شقة بإطلالة رائعة",
    slug: "apt-olaya-2", status: "available", purpose: "rent", type: "apartment",
    price: 85000, currency: "SAR", area: 180, area_unit: "م²",
    bedrooms: 3, bathrooms: 2, year_built: 2023, floors: 1,
    deed_number: null, street_width: null, latitude: null, longitude: null,
    address: "حي العليا، الرياض", city: "الرياض", district: "العليا",
    featured_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
    images_bathroom: [], images_bedroom: [], images_living: [], images_kitchen: [],
    images_facilities: [], images_exterior: [], images_other: [],
    features: [], owner_id: null, is_featured: true, views_count: 0,
  },
  {
    id: "3", created_at: "", updated_at: "",
    title: "أرض استثمارية في حي الملقا", description: "أرض سكنية بموقع استراتيجي",
    slug: "land-malqa-3", status: "available", purpose: "sale", type: "land",
    price: 800000, currency: "SAR", area: 900, area_unit: "م²",
    bedrooms: null, bathrooms: null, year_built: null, floors: null,
    deed_number: null, street_width: null, latitude: null, longitude: null,
    address: "حي الملقا، الرياض", city: "الرياض", district: "الملقا",
    featured_image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",
    images_bathroom: [], images_bedroom: [], images_living: [], images_kitchen: [],
    images_facilities: [], images_exterior: [], images_other: [],
    features: [], owner_id: null, is_featured: true, views_count: 0,
  },
];

const whyUs = [
  { icon: Shield, title: "موثوقية وأمان", desc: "نلتزم بأعلى معايير النزاهة والشفافية في كل معاملة" },
  { icon: Users, title: "فريق خبير", desc: "كوكبة من المتخصصين في السوق العقاري السعودي" },
  { icon: Handshake, title: "خدمة مخصصة", desc: "حلول عقارية مصممة خصيصاً لاحتياجاتك" },
  { icon: Building2, title: "مجموعة متنوعة", desc: "أكثر من 500 عقار في مختلف المدن والأنواع" },
];

export default function HomePage() {
  const { t, dir } = useLocale();

  return (
    <div dir={dir}>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary py-24 md:py-32">
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 text-lg text-white/80 md:text-xl">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-medium text-primary transition-colors hover:bg-accent-light"
              >
                {t("hero.cta")}
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                {t("hero.cta_secondary")}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      </section>

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold">{t("home.featured")}</h2>
            <p className="mt-2 text-muted">{t("home.featured_desc")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {sampleProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/properties" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-light">
              {t("properties.title")}
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold">{t("home.why_us")}</h2>
            <p className="mt-2 text-muted">{t("home.why_us_desc")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {whyUs.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-border bg-background p-6 text-center transition-shadow hover:shadow-md">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-accent py-16">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-primary">{t("home.contact_strip")}</h2>
          <p className="mt-2 text-primary/80">{t("home.contact_strip_desc")}</p>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-light">
            {t("home.contact_cta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
