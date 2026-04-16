create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  address text not null,
  number text,
  complement text,
  neighborhood text not null,
  city text not null,
  zip text not null,
  phone text not null,
  email text not null,
  hours text not null,
  operating_days text,
  description text not null,
  services_offered text[] not null default '{}',
  lat double precision,
  lng double precision,
  imagem_url text,
  created_at timestamptz not null default now()
);

create index if not exists services_created_at_idx on public.services (created_at desc);
