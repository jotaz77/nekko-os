-- ============================================================
-- TABELA: COMPANIES
-- Empresa principal do sistema.
-- Cada usuário pode possuir uma ou mais empresas futuramente.
-- ============================================================

create table if not exists public.companies (

    id uuid primary key default gen_random_uuid(),

    owner_id uuid not null references public.profiles(id) on delete cascade,

    name text not null,

    document text,

    phone text,

    email text,

    logo_url text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

alter table public.companies enable row level security;

-- O dono pode visualizar suas empresas

create policy "companies_select"

on public.companies

for select

using (owner_id = auth.uid());

-- O dono pode criar empresas

create policy "companies_insert"

on public.companies

for insert

with check (owner_id = auth.uid());

-- O dono pode editar empresas

create policy "companies_update"

on public.companies

for update

using (owner_id = auth.uid());

drop trigger if exists companies_updated_at on public.companies;

create trigger companies_updated_at

before update on public.companies

for each row

execute function public.update_updated_at_column();