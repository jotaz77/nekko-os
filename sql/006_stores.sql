-- ============================================================
-- TABELA: STORES
-- Unidades da empresa
-- ============================================================

create table if not exists public.stores (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null references public.companies(id) on delete cascade,

    name text not null,

    phone text,

    email text,

    zip_code text,

    state text,

    city text,

    neighborhood text,

    street text,

    number text,

    complement text,

    active boolean default true,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

alter table public.stores enable row level security;

-- Usuário visualiza apenas lojas das empresas que possui

create policy "stores_select"

on public.stores

for select

using (

    exists (

        select 1

        from public.companies

        where companies.id = stores.company_id

        and companies.owner_id = auth.uid()

    )

);

-- Inserção

create policy "stores_insert"

on public.stores

for insert

with check (

    exists (

        select 1

        from public.companies

        where companies.id = stores.company_id

        and companies.owner_id = auth.uid()

    )

);

-- Atualização

create policy "stores_update"

on public.stores

for update

using (

    exists (

        select 1

        from public.companies

        where companies.id = stores.company_id

        and companies.owner_id = auth.uid()

    )

);

drop trigger if exists stores_updated_at on public.stores;

create trigger stores_updated_at

before update on public.stores

for each row

execute function public.update_updated_at_column();