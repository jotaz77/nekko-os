import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {

    try {

        if (req.method !== "POST") {

            return new Response(
                JSON.stringify({
                    error: "Método não permitido"
                }),
                {
                    status: 405,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        }

        const supabaseUrl =
            Deno.env.get("SUPABASE_URL");

        const serviceRoleKey =
            Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY"
            );

        if (
            !supabaseUrl ||
            !serviceRoleKey
        ) {

            return new Response(
                JSON.stringify({
                    error:
                        "Variáveis do Supabase não configuradas"
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        }

        const authHeader =
            req.headers.get(
                "Authorization"
            );

        if (!authHeader) {

            return new Response(
                JSON.stringify({
                    error: "Não autenticado"
                }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        }

        const supabaseAdmin =
            createClient(
                supabaseUrl,
                serviceRoleKey
            );

        const token =
            authHeader.replace(
                "Bearer ",
                ""
            );

        const {
            data: {
                user
            },
            error: userError
        } = await supabaseAdmin.auth.getUser(
            token
        );

        if (
            userError ||
            !user
        ) {

            return new Response(
                JSON.stringify({
                    error: "Sessão inválida"
                }),
                {
                    status: 401,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        }

        const {
            data: isCeo,
            error: ceoError
        } = await supabaseAdmin.rpc(
            "is_company_ceo",
            {},
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (ceoError) {

            throw ceoError;

        }

        if (!isCeo) {

            return new Response(
                JSON.stringify({
                    error:
                        "Somente o CEO pode cadastrar funcionários"
                }),
                {
                    status: 403,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        }

        return new Response(
            JSON.stringify({
                success: true,
                message:
                    "Edge Function funcionando",
                user_id: user.id
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {

        console.error(
            "create-employee:",
            error
        );

        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : "Erro interno"
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    }

});
