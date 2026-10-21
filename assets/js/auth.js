// =========================================
// NEKKO OS
// Auth Service
// =========================================

const Auth = {

    // -------------------------------------
    // LOGIN
    // -------------------------------------

    async login(email, password) {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email,
                password

            });

        if (error)
            throw error;

        return data.user;

    },

    // -------------------------------------
    // LOGOUT
    // -------------------------------------

    async logout() {

        const { error } =
            await supabaseClient.auth.signOut();

        if (error)
            throw error;

        localStorage.clear();

        window.location.href =
            "/pages/login/login.html";

    },

    // -------------------------------------
    // USUÁRIO LOGADO
    // -------------------------------------

    async getUser() {

        const {

            data: { user },
            error

        } = await supabaseClient.auth.getUser();

        if (error)
            throw error;

        return user;

    },

    // -------------------------------------
    // SESSÃO
    // -------------------------------------

    async getSession() {

        const {

            data: { session },
            error

        } = await supabaseClient.auth.getSession();

        if (error)
            throw error;

        return session;

    },

    // -------------------------------------
    // AUTENTICADO?
    // -------------------------------------

    async isAuthenticated() {

        const session =
            await this.getSession();

        return session !== null;

    }

};

// =========================================
// RECUPERAÇÃO DA SESSÃO EM ABAS OCIOSAS
// =========================================
// O Supabase já renova tokens automaticamente. Ao voltar para uma aba
// que ficou suspensa por muito tempo, verificamos a sessão e solicitamos
// renovação se o access token estiver próximo do vencimento.
Auth.refreshIfNeeded = async function () {

    try {

        const session = await this.getSession();

        if (!session) {
            return null;
        }

        const expiresAt = Number(session.expires_at || 0);
        const now = Math.floor(Date.now() / 1000);

        if (expiresAt && expiresAt - now <= 120) {

            const { data, error } =
                await supabaseClient.auth.refreshSession();

            if (error) {
                console.warn(
                    "Não foi possível renovar a sessão neste momento:",
                    error.message
                );
                return null;
            }

            return data.session || null;
        }

        return session;

    } catch (error) {

        console.warn(
            "Falha ao verificar a sessão:",
            error
        );

        return null;

    }

};

// Ao retornar para a aba, tenta renovar apenas se estiver perto de expirar.
// Não encerra a sessão automaticamente se houver uma falha temporária de rede.
if (typeof document !== "undefined") {

    document.addEventListener("visibilitychange", () => {

        if (document.visibilityState === "visible") {
            Auth.refreshIfNeeded();
        }

    });

}

window.Auth = Auth;
