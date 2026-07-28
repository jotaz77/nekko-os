-- ============================================================
-- TABELA: PROFILES
-- Cada usuário autenticado possui um perfil no sistema.
-- ============================================================

create table if not exists public.profiles (

    id uuid primary key references auth.users(id) on delete cascade,

    full_name text,

    phone text,

    avatar_url text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

alter table public.profiles enable row level security;

-- Usuário vê apenas seu próprio perfil

create policy "profile_select"

on public.profiles

for select

using (auth.uid() = id);

create policy "profile_insert"

on public.profiles

for insert

with check (auth.uid() = id);

create policy "profile_update"

on public.profiles

for update

using (auth.uid() = id);

-- Atualiza updated_at automaticamente

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();