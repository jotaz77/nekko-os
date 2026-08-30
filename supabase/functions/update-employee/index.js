import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
        "POST, OPTIONS"
};

Deno.serve(async (req) => {

    if (req.method === "OPTIONS") {

        return new Response(
            "ok",
            {
                headers: corsHeaders
            }
        );

    }

    try {

        // =====================================
        // CONFIGURAÇÃO
        // =====================================

        const supabaseUrl =
            Deno.env.get(
                "SUPABASE_URL"
            );

        const serviceRoleKey =
            Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY"
            );


        if (
            !supabaseUrl ||
            !serviceRoleKey
        ) {

            throw new Error(
                "Configuração do Supabase não encontrada."
            );

        }


        // =====================================
        // CLIENTE ADMIN
        // =====================================

        const supabaseAdmin =
            createClient(
                supabaseUrl,
                serviceRoleKey
            );


        // =====================================
        // CLIENTE DO USUÁRIO
        // =====================================

        const authHeader =
            req.headers.get(
                "Authorization"
            );


        if (!authHeader) {

            return new Response(
                JSON.stringify({
                    error:
                        "Sessão inválida."
                }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        }


        const supabaseUser =
            createClient(
                supabaseUrl,
                serviceRoleKey,
                {
                    global: {
                        headers: {
                            Authorization:
                                authHeader
                        }
                    }
                }
            );


        // =====================================
        // USUÁRIO LOGADO
        // =====================================

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseUser.auth.getUser();


        if (
            userError ||
            !user
        ) {

            return new Response(
                JSON.stringify({
                    error:
                        "Sessão inválida."
                }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        }


        // =====================================
        // BODY
        // =====================================

        const body =
            await req.json();


        const memberId =
            body?.member_id;

        const fullName =
            String(
                body?.full_name ||
                ""
            ).trim();

        const storeId =
            body?.store_id;

        const role =
            body?.role;

        const category =
            body?.category;

        const active =
            body?.active;


        // =====================================
        // VALIDAÇÕES
        // =====================================

        if (!memberId) {

            throw new Error(
                "Funcionário não informado."
            );

        }


        if (!fullName) {

            throw new Error(
                "Informe o nome completo."
            );

        }


        if (!storeId) {

            throw new Error(
                "Selecione a loja."
            );

        }


        if (!role) {

            throw new Error(
                "Selecione a categoria."
            );

        }


        if (
            typeof active !==
            "boolean"
        ) {

            throw new Error(
                "Status do funcionário inválido."
            );

        }


        // =====================================
        // MEMBRO EXISTE?
        // =====================================

        const {
            data: member,
            error: memberError
        } =
            await supabaseAdmin
                .from(
                    "company_members"
                )
                .select(
                    `
                    id,
                    company_id,
                    profile_id,
                    role,
                    active
                    `
                )
                .eq(
                    "id",
                    memberId
                )
                .maybeSingle();


        if (memberError)
            throw memberError;


        if (!member) {

            throw new Error(
                "Funcionário não encontrado."
            );

        }


        // =====================================
        // CEO DA EMPRESA
        // =====================================

        const {
            data: ceoMember,
            error: ceoError
        } =
            await supabaseAdmin
                .from(
                    "company_members"
                )
                .select(
                    "id"
                )
                .eq(
                    "company_id",
                    member.company_id
                )
                .eq(
                    "profile_id",
                    user.id
                )
                .eq(
                    "role",
                    "CEO"
                )
                .eq(
                    "active",
                    true
                )
                .maybeSingle();


        if (ceoError)
            throw ceoError;


        if (!ceoMember) {

            return new Response(
                JSON.stringify({
                    error:
                        "Você não possui permissão para editar este funcionário."
                }),
                {
                    status: 403,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        }


        // =====================================
        // VALIDAR LOJA
        // =====================================

        const {
            data: store,
            error: storeError
        } =
            await supabaseAdmin
                .from("stores")
                .select(
                    "id, company_id, active"
                )
                .eq(
                    "id",
                    storeId
                )
                .maybeSingle();


        if (storeError)
            throw storeError;


        if (!store) {

            throw new Error(
                "Loja não encontrada."
            );

        }


        if (
            store.company_id !==
            member.company_id
        ) {

            throw new Error(
                "A loja selecionada não pertence à empresa."
            );

        }


        if (!store.active) {

            throw new Error(
                "A loja selecionada está inativa."
            );

        }


        // =====================================
        // PROTEGER CEO
        // =====================================

        if (
            member.role ===
            "CEO"
        ) {

            throw new Error(
                "O CEO da empresa não pode ser editado como funcionário."
            );

        }


        // =====================================
        // ATUALIZAR PROFILE
        // =====================================

        const {
            error: profileError
        } =
            await supabaseAdmin
                .from(
                    "profiles"
                )
                .update({
                    full_name:
                        fullName,
                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    member.profile_id
                );


        if (profileError)
            throw profileError;


        // =====================================
        // ATUALIZAR MEMBRO
        // =====================================

        const {
            data: updatedMember,
            error: updateError
        } =
            await supabaseAdmin
                .from(
                    "company_members"
                )
                .update({

                    store_id:
                        storeId,

                    role,

                    category,

                    active,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    memberId
                )
                .select()
                .single();


        if (updateError)
            throw updateError;


        // =====================================
        // SUCESSO
        // =====================================

        return new Response(
            JSON.stringify({

                success:
                    true,

                member:
                    updatedMember

            }),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json"
                }
            }
        );

    }

    catch (error) {

        console.error(
            "update-employee:",
            error
        );


        return new Response(
            JSON.stringify({
                error:
                    error?.message ||
                    "Erro interno."
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json"
                }
            }
        );

    }

});
