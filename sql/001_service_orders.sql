-- Extensão para UUID
create extension if not exists "pgcrypto";

create table public.service_orders (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references auth.users(id) on delete cascade,

    os_number bigint generated always as identity unique,

    customer_name text not null,
    customer_phone text,
    customer_cpf text,

    device_brand text not null,
    device_model text not null,
    imei text,
    color text,
    password text,

    accessories text,

    reported_issue text not null,
    diagnosis text,
    service_performed text,
    observations text,

    labor_cost numeric(10,2) default 0,
    parts_cost numeric(10,2) default 0,
    discount numeric(10,2) default 0,
    total_cost numeric(10,2) default 0,

    status text not null default 'Aberta'
        check (
            status in (
                'Aberta',
                'Aguardando peça',
                'Em manutenção',
                'Pronta',
                'Entregue',
                'Cancelada'
            )
        ),

    entry_date date default current_date,
    expected_date date,
    delivery_date date,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.service_orders enable row level security;

create policy "Users can view their own service orders"
on public.service_orders
for select
using (auth.uid() = user_id);

create policy "Users can insert their own service orders"
on public.service_orders
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own service orders"
on public.service_orders
for update
using (auth.uid() = user_id);

create policy "Users can delete their own service orders"
on public.service_orders
for delete
using (auth.uid() = user_id);
