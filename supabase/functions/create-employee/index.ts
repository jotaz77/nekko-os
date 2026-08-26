import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
        "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {

    if (req.method === "OPTIONS") {

        return new Response(
            "ok",
            {
                headers: corsHeaders,
            }
        );

    }

    if (req.method !== "POST") {

        return new Response(
            JSON.stringify({
                error: "Método não permitido",
            }),
            {
                status: 405,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json",
                },
            }
        );

    }

    try {

        const supabaseUrl =
            Deno.env.get("SUPABASE_URL") ?? "";

        const serviceRoleKey =
            Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY"
            ) ?? "";

        if (
            !supabaseUrl ||
            !serviceRoleKey
        ) {

            throw new Error(
                "Variáveis do Supabase não configuradas"
            );

        }

        const authHeader =
            req.headers.get(
                "Authorization"
            );

        if (!authHeader) {

            return new Response(
                JSON.stringify({
                    error:
                        "Authorization ausente",
                }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json",
                    },
                }
            );

        }

        const token =
            authHeader.replace(
                "Bearer ",
                ""
            ).trim();

        if (!token) {

            return new Response(
                JSON.stringify({
                    error:
                        "Token de autenticação ausente",
                }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json",
                    },
                }
            );

        }

        // Cliente com a sessão do CEO.
        // É este cliente que mantém auth.uid()
        // e respeita RLS.
        const supabaseUser =
            createClient(
                supabaseUrl,
                Deno.env.get(
                    "SUPABASE_ANON_KEY"
                ) ?? "",
                {
                    global: {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    },
                }
            );

        const {
            data: {
                user,
            },
            error: userError,
        } =
            await supabaseUser.auth.getUser();

        if (
            userError ||
            !user
        ) {

            return new Response(
                JSON.stringify({
                    error:
                        "Sessão inválida",
                }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json",
                    },
                }
            );

        }

        // Aqui a RPC roda com o JWT real do CEO.
        const {
            data: isCeo,
            error: ceoError,
        } =
            await supabaseUser.rpc(
                "is_company_ceo"
            );

        if (ceoError) {

            throw ceoError;

        }

        if (!isCeo) {

            return new Response(
                JSON.stringify({
                    error:
                        "Somente o CEO pode cadastrar funcionários",
                }),
                {
                    status: 403,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json",
                    },
                }
            );

        }

        // Cliente administrativo.
        // NUNCA enviar esta chave para o navegador.
        const supabaseAdmin =
            createClient(
                supabaseUrl,
                serviceRoleKey
            );

        return new Response(
            JSON.stringify({
                success: true,
                message:
                    "Edge Function funcionando",
                user_id: user.id,
            }),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json",
                },
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
                        : "Erro interno",
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json",
                },
            }
        );

    }

});
