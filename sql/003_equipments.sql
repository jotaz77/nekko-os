create extension if not exists "pgcrypto";

create table public.equipments (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    brand text not null,
    model text not null,

    imei text,
    serial_number text,

    color text,

    password text,

    condition text,

    notes text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);

alter table public.equipments
enable row level security;

create policy "Users can view own equipments"
on public.equipments
for select
using (auth.uid() = user_id);

create policy "Users can insert own equipments"
on public.equipments
for insert
with check (auth.uid() = user_id);

create policy "Users can update own equipments"
on public.equipments
for update
using (auth.uid() = user_id);

create policy "Users can delete own equipments"
on public.equipments
for delete
using (auth.uid() = user_id);