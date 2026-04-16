create extension if not exists pgcrypto;

create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

grant select on table public.admins to authenticated;

drop policy if exists "Admins can read their own row" on public.admins;

create policy "Admins can read their own row"
on public.admins
for select
to authenticated
using ((auth.jwt() ->> 'email') = email);

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

alter table public.services enable row level security;
grant select on table public.services to anon, authenticated;
grant insert, update, delete on table public.services to authenticated;

drop policy if exists "Public can read services" on public.services;
drop policy if exists "Admins can manage services" on public.services;

create policy "Public can read services"
on public.services
for select
using (true);

create policy "Admins can manage services"
on public.services
for all
to authenticated
using (
  exists (
    select 1
    from public.admins
    where email = (auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1
    from public.admins
    where email = (auth.jwt() ->> 'email')
  )
);

create index if not exists services_created_at_idx on public.services (created_at desc);

