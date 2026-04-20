create extension if not exists pgcrypto;

create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admins
  drop constraint if exists admins_email_length_check;

alter table public.admins
  add constraint admins_email_length_check
  check (char_length(email) between 3 and 254);

alter table public.admins enable row level security;
alter table public.admins force row level security;

revoke all on table public.admins from anon, public;

grant select on table public.admins to authenticated;

drop policy if exists "Admins can read their own row" on public.admins;

create policy "Admins can read their own row"
on public.admins
for select
to authenticated
using ((auth.jwt() ->> 'email') = email);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admins
    where email = (auth.jwt() ->> 'email')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

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
  email text,
  hours text not null,
  operating_days text,
  description text not null,
  services_offered text[] not null default '{}',
  lat double precision,
  lng double precision,
  imagem_url text,
  created_at timestamptz not null default now()
);

-- Email is optional for services and must never block inserts/updates.
alter table public.services
  alter column email drop not null,
  alter column email drop default;

alter table public.services
  drop constraint if exists services_name_length_check,
  drop constraint if exists services_type_allowed_check,
  drop constraint if exists services_address_length_check,
  drop constraint if exists services_number_length_check,
  drop constraint if exists services_complement_length_check,
  drop constraint if exists services_neighborhood_length_check,
  drop constraint if exists services_city_length_check,
  drop constraint if exists services_zip_length_check,
  drop constraint if exists services_phone_length_check,
  drop constraint if exists services_hours_length_check,
  drop constraint if exists services_operating_days_length_check,
  drop constraint if exists services_description_length_check,
  drop constraint if exists services_services_offered_cardinality_check,
  drop constraint if exists services_imagem_url_length_check;

update public.services
set email = null
where email is null
  or btrim(email) = ''
  or char_length(email) < 3
  or char_length(email) > 254;

delete from public.services
where lower(btrim(name)) in ('teste', 'teste12')
  or lower(btrim(name)) like 'teste%';

alter table public.services
  add constraint services_name_length_check
  check (char_length(name) between 3 and 120),
  add constraint services_type_allowed_check
  check (type in ('CAPS', 'CRAS', 'CREAS', 'C.A / CTA', 'Saúde', 'Alimentação', 'Trabalho', 'Outro')),
  add constraint services_address_length_check
  check (char_length(address) between 3 and 160),
  add constraint services_number_length_check
  check (number is null or char_length(number) between 1 and 20),
  add constraint services_complement_length_check
  check (complement is null or char_length(complement) <= 60),
  add constraint services_neighborhood_length_check
  check (char_length(neighborhood) between 2 and 120),
  add constraint services_city_length_check
  check (char_length(city) between 2 and 120),
  add constraint services_zip_length_check
  check (char_length(zip) between 8 and 9),
  add constraint services_phone_length_check
  check (char_length(phone) between 10 and 20),
  add constraint services_email_length_check
  check (email is null or char_length(email) between 3 and 254),
  add constraint services_hours_length_check
  check (char_length(hours) between 1 and 80),
  add constraint services_operating_days_length_check
  check (operating_days is null or char_length(operating_days) <= 80),
  add constraint services_description_length_check
  check (char_length(description) between 10 and 2000),
  add constraint services_services_offered_cardinality_check
  check (cardinality(services_offered) <= 20),
  add constraint services_imagem_url_length_check
  check (imagem_url is null or char_length(imagem_url) <= 250000);

alter table public.services enable row level security;
alter table public.services force row level security;

revoke all on table public.services from anon, public;

grant select on table public.services to authenticated;
grant insert, update, delete on table public.services to authenticated;

drop policy if exists "Public can read services" on public.services;
drop policy if exists "Admins can manage services" on public.services;

create policy "Admins can manage services"
on public.services
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

drop view if exists public.public_services;

create view public.public_services as
select
  id,
  name,
  type,
  address,
  number,
  complement,
  neighborhood,
  city,
  zip,
  phone,
  hours,
  operating_days,
  description,
  services_offered,
  lat,
  lng,
  imagem_url,
  created_at
from public.services;

grant select on public.public_services to anon, authenticated;

create index if not exists services_created_at_idx on public.services (created_at desc);

