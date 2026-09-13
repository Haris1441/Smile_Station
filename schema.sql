-- Production PostgreSQL/Supabase data model for Smile Station.
-- Apply this through a server-side migration; do not expose database credentials to the browser.
create table site_settings (id uuid primary key default gen_random_uuid(), business_name text not null, tagline text, contact jsonb not null default '{}'::jsonb, sections jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table homepage_content (id uuid primary key default gen_random_uuid(), heading text not null, subtitle text, hero_image_url text, primary_cta text, secondary_cta text, updated_at timestamptz not null default now());
create table doctor_profiles (id uuid primary key default gen_random_uuid(), name text not null, title text, biography text, qualifications text, expertise text, photo_url text, updated_at timestamptz not null default now());
create table services (id uuid primary key default gen_random_uuid(), title text not null, description text, image_url text, icon text, position integer not null default 0, enabled boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table gallery_images (id uuid primary key default gen_random_uuid(), storage_path text not null, alt_text text, caption text, position integer not null default 0, created_at timestamptz not null default now());
create table testimonials (id uuid primary key default gen_random_uuid(), patient_name text not null, review text not null, rating smallint check(rating between 1 and 5), photo_url text, enabled boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create type appointment_status as enum ('NEW','CONTACTED','CONFIRMED','COMPLETED','CANCELLED');
create table appointments (id uuid primary key default gen_random_uuid(), patient_name text not null, phone text not null, email text, service_id uuid references services(id) on delete set null, preferred_date date not null, preferred_time time, message text, status appointment_status not null default 'NEW', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create type promotion_status as enum ('DRAFT','SCHEDULED','LIVE','EXPIRED','DISABLED');
create table promotions (id uuid primary key default gen_random_uuid(), name text not null, headline text not null, description text, discount text, image_path text, cta_text text not null, cta_link text not null, starts_at timestamptz, ends_at timestamptz, status promotion_status not null default 'DRAFT', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table social_links (id uuid primary key default gen_random_uuid(), platform text not null, url text not null, position integer not null default 0);
create index appointments_status_created_idx on appointments(status, created_at desc);
create index services_position_idx on services(position);
create index live_promotion_idx on promotions(status, starts_at, ends_at);
