// =========================================
// NEKKO OS
// Storage Service
// =========================================

const Storage = {

    // =====================================
    // USER
    // =====================================

    setUser(user) {

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

    },

    getUser() {

        const user = localStorage.getItem("user");

        return user
            ? JSON.parse(user)
            : null;

    },

    // =====================================
    // COMPANY
    // =====================================

    setCompany(company) {

        localStorage.setItem(
            "company",
            JSON.stringify(company)
        );

    },

    getCompany() {

        const company = localStorage.getItem("company");

        return company
            ? JSON.parse(company)
            : null;

    },

    // =====================================
    // STORE
    // =====================================

    setStore(store) {

        localStorage.setItem(
            "store",
            JSON.stringify(store)
        );

    },

    getStore() {

        const store = localStorage.getItem("store");

        return store
            ? JSON.parse(store)
            : null;

    },

    // =====================================
    // ROLE
    // =====================================

    setRole(role) {

        localStorage.setItem(
            "role",
            role
        );

    },

    getRole() {

        return localStorage.getItem("role");

    },

    // =====================================
    // TOKEN
    // =====================================

    setToken(token) {

        localStorage.setItem(
            "token",
            token
        );

    },

    getToken() {

        return localStorage.getItem("token");

    },

    // =====================================
    // CONTEXTO
    // =====================================

    setContext(context) {

        this.setUser(context.user);

        this.setCompany(context.company);

        this.setStore(context.store);

        this.setRole(context.role);

    },

    getContext() {

        const user = this.getUser();
        const company = this.getCompany();
        const store = this.getStore();
        const role = this.getRole();

        if (!user || !company || !role) {

            return null;

        }

        return {

            user,
            company,
            store,
            role

        };

    },

    // =====================================
    // LIMPAR
    // =====================================

    clear() {

        [
            "user",
            "company",
            "store",
            "role",
            "token"
        ].forEach(key => localStorage.removeItem(key));

    }

};

window.Storage = Storage;