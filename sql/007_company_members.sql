-- ============================================================
-- TABELA: COMPANY MEMBERS
-- Usuários vinculados às empresas
-- ============================================================

create table if not exists public.company_members (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null references public.companies(id) on delete cascade,

    profile_id uuid not null references public.profiles(id) on delete cascade,

    role text not null default 'CEO'
        check (role in ('CEO','MANAGER','TECHNICIAN','EMPLOYEE')),

    active boolean default true,

    created_at timestamptz default now(),

    updated_at timestamptz default now(),

    unique(company_id, profile_id)

);

alter table public.company_members enable row level security;

create policy "company_members_select"

on public.company_members

for select

using (

    profile_id = auth.uid()

);

create policy "company_members_insert"

on public.company_members

for insert

with check (

    profile_id = auth.uid()

);

create policy "company_members_update"

on public.company_members

for update

using (

    profile_id = auth.uid()

);

drop trigger if exists company_members_updated_at
on public.company_members;

create trigger company_members_updated_at

before update on public.company_members

for each row

execute function public.update_updated_at_column();