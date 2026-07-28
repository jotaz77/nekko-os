-- =========================================================
-- RLS HELPERS
-- Nekko OS
-- =========================================================

create or replace function public.is_company_member(company uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from company_members cm
        where cm.company_id = company
          and cm.profile_id = auth.uid()
          and cm.active = true
    );
$$;

create or replace function public.is_company_owner(company uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from companies c
        where c.id = company
          and c.owner_id = auth.uid()
    );
$$;

create or replace function public.is_company_ceo(company uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from company_members cm
        where cm.company_id = company
          and cm.profile_id = auth.uid()
          and cm.role = 'CEO'
          and cm.active = true
    );
$$;

create or replace function public.is_store_member(store uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from stores s
        join company_members cm
            on cm.company_id = s.company_id
        where s.id = store
          and cm.profile_id = auth.uid()
          and cm.active = true
    );
$$;