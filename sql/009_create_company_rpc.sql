-- =========================================================
-- RPC: CREATE COMPANY
-- Nekko OS
-- =========================================================

create or replace function public.create_company(

    p_name text,
    p_document text default null,
    p_phone text default null,
    p_email text default null

)

returns uuid

language plpgsql

security definer

set search_path = public

as $$

declare

    v_company_id uuid;

begin

    if auth.uid() is null then
        raise exception 'Usuário não autenticado.';
    end if;

    --------------------------------------------------------
    -- Cria a empresa
    --------------------------------------------------------

    insert into companies (

        owner_id,
        name,
        document,
        phone,
        email

    )

    values (

        auth.uid(),
        trim(p_name),
        nullif(trim(p_document), ''),
        nullif(trim(p_phone), ''),
        nullif(trim(p_email), '')

    )

    returning id

    into v_company_id;

    --------------------------------------------------------
    -- Vincula automaticamente o CEO
    --------------------------------------------------------

    insert into company_members (

        company_id,
        profile_id,
        role,
        active

    )

    values (

        v_company_id,
        auth.uid(),
        'CEO',
        true

    );

    return v_company_id;

end;

$$;