create table public.customers (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references auth.users(id) on delete cascade,

    name text not null,
    cpf text,
    phone text,
    whatsapp text,
    email text,
    address text,
    notes text,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.customers enable row level security;

create policy "Users can view own customers"
on public.customers
for select
using (auth.uid() = user_id);

create policy "Users can insert own customers"
on public.customers
for insert
with check (auth.uid() = user_id);

create policy "Users can update own customers"
on public.customers
for update
using (auth.uid() = user_id);

create policy "Users can delete own customers"
on public.customers
for delete
using (auth.uid() = user_id);