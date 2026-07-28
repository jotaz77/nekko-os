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
            "../login/index.html";

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

window.Auth = Auth;