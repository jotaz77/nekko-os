// =========================================
// NEKKO OS
// Bootstrap
// =========================================

const Bootstrap = {

    async init() {

        // ---------------------------------
        // Sessão
        // ---------------------------------

        const authenticated = await Auth.isAuthenticated();

        if (!authenticated) {

            return {
                status: "LOGIN"
            };

        }

        // ---------------------------------
        // Usuário
        // ---------------------------------

        const user = await Auth.getUser();

        if (!user) {

            return {
                status: "LOGIN"
            };

        }

        // ---------------------------------
        // Membership
        // ---------------------------------

        const membership = await Api.getMembership(user.id);

        if (!membership) {

            return {
                status: "COMPANY",
                user
            };

        }

        // ---------------------------------
        // Empresa
        // ---------------------------------

        const company = await Api.getCompany(
            membership.company_id
        );

        if (!company) {

            return {
                status: "COMPANY",
                user
            };

        }

        // ---------------------------------
        // Lojas
        // ---------------------------------

        const stores = await Api.getStores(
            company.id
        );

        if (!stores || stores.length === 0) {

            return {
                status: "STORE",
                user,
                company,
                membership
            };

        }

        // ---------------------------------
        // Funcionário
        // ---------------------------------
        
        if (
            membership.role !==
            Roles.CEO
        ) {
        
            if (!membership.store_id) {
        
                return {
        
                    status: "ERROR",
                    user,
                    company,
                    membership
        
                };
        
            }
        
        
            const employeeStore =
                stores.find(
                    store =>
                        store.id ===
                        membership.store_id
                );
        
        
            if (!employeeStore) {
        
                return {
        
                    status: "ERROR",
                    user,
                    company,
                    membership
        
                };
        
            }
        
        
            const employeeContext = {
        
                user,
        
                company,
        
                membership,
        
                store:
                    employeeStore,
        
                role:
                    membership.role
        
            };
        
        
            Storage.setContext(
                employeeContext
            );
        
        
            window.NEKKO =
                employeeContext;
        
        
            return {
        
                status: "READY",
        
                context:
                    employeeContext
        
            };
        
        }

        // ---------------------------------
        // Contexto salvo
        // ---------------------------------

        const context = Storage.getContext();

        if (!context) {

            return {

                status: "MODE_SELECT",

                user,
                company,
                membership,
                stores

            };

        }

        // ---------------------------------
        // Validar loja (quando existir)
        // ---------------------------------

        let store = null;

        if (context.store) {

            store = stores.find(
                s => s.id === context.store.id
            );

            if (!store) {

                Storage.clear();

                return {

                    status: "MODE_SELECT",

                    user,
                    company,
                    membership,
                    stores

                };

            }

        }

        // ---------------------------------
        // Contexto
        // ---------------------------------

        window.NEKKO = {

            user,
            company,
            membership,
            store,
            role: context.role

        };

        return {

            status: "READY",

            context: window.NEKKO

        };

    }

};

window.Bootstrap = Bootstrap;
