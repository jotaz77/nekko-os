// =========================================
// NEKKO OS
// API Service
// =========================================

const Api = {

    // =====================================
    // COMPANY
    // =====================================

    async getCompany(companyId) {

        const { data, error } = await supabaseClient
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .maybeSingle();

        if (error)
            throw error;

        return data;

    },

    async getCompanyByOwner(ownerId) {

        const { data, error } = await supabaseClient
            .from("companies")
            .select("*")
            .eq("owner_id", ownerId)
            .maybeSingle();

        if (error)
            throw error;

        return data;

    },

    async createCompany(company) {

        const { data, error } = await supabaseClient
            .from("companies")
            .insert(company)
            .select()
            .single();

        if (error)
            throw error;

        return data;

    },

    // =====================================
    // MEMBERS
    // =====================================

    async getMembership(profileId) {

        const { data, error } = await supabaseClient
            .from("company_members")
            .select("*")
            .eq("profile_id", profileId)
            .eq("active", true)
            .maybeSingle();

        if (error)
            throw error;

        return data;

    },

    async createMembership(member) {

        const { data, error } = await supabaseClient
            .from("company_members")
            .insert(member)
            .select()
            .single();

        if (error)
            throw error;

        return data;

    },

    // =====================================
    // STORES
    // =====================================

    async getStores(companyId) {

        const { data, error } = await supabaseClient
            .from("stores")
            .select("*")
            .eq("company_id", companyId)
            .eq("active", true)
            .order("name");

        if (error)
            throw error;

        return data;

    },

    async getStore(storeId) {

        const { data, error } = await supabaseClient
            .from("stores")
            .select("*")
            .eq("id", storeId)
            .maybeSingle();

        if (error)
            throw error;

        return data;

    },

    async createStore(store) {

        const { data, error } = await supabaseClient
            .from("stores")
            .insert(store)
            .select()
            .single();

        if (error)
            throw error;

        return data;

    },

    // =====================================
    // SERVICE ORDERS
    // =====================================

    async getServiceOrders(context) {
    
        let query = supabaseClient
            .from("service_orders")
            .select(`
                *,
                stores (
                    id,
                    name
                )
            `)
            .eq("company_id", context.company.id);
        query = query.eq(
            "order_type",
            "customer"
        );
            
        if (context.store) {
    
            query = query.eq(
                "store_id",
                context.store.id
            );
    
        }
    
        const { data, error } = await query
            .order("created_at", {
                ascending: false
            });
    
        if (error)
            throw error;
    
        return data;
    
    },

    async getDealerServiceOrders(context) {
    
        let query = supabaseClient
            .from("service_orders")
            .select(`
                *,
                stores (
                    id,
                    name
                )
            `)
           .eq("company_id", context.company.id);

        query = query.eq(
            "order_type",
            "dealer"
);
        
        if (context.store) {
    
            query = query.eq(
                "store_id",
                context.store.id
            );
    
        }
    
        const { data, error } = await query
            .order("created_at", {
                ascending: false
            });
    
        if (error)
            throw error;
    
        return data;
    
    },
    
        async getServiceOrder(id) {

        const { data, error } = await supabaseClient
            .from("service_orders")
            .select(`
                *,
                stores (
                    id,
                    name
                )
            `)
            .eq("id", id)
            .maybeSingle();
    
        if (error)
            throw error;
    
        return data;
    
    },
    
        async createServiceOrder(order) {
    
            const { data, error } = await supabaseClient
                .from("service_orders")
                .insert(order)
                .select()
                .single();
    
            if (error)
                throw error;
    
            return data;
    
        },

    async updateServiceOrder(id, order) {

        const { data, error } = await supabaseClient
            .from("service_orders")
            .update(order)
            .eq("id", id)
            .select()
            .single();

        if (error)
            throw error;

        return data;

    },

    async updateServiceOrderStatus(id, status) {
    
        const { data, error } = await supabaseClient
            .from("service_orders")
            .update({
                status: status
            })
            .eq("id", id)
            .select();
    
        if (error)
            throw error;
    
        return data;
    
    },

    async deleteServiceOrder(id) {

        const { error } = await supabaseClient
            .from("service_orders")
            .delete()
            .eq("id", id);

        if (error)
            throw error;

        return true;

    }

};

// =====================================
// TÉCNICOS
// =====================================

Api.createTechnician = async (technician) => {

    const { data, error } = await supabaseClient

        .from("technicians")

        .insert(technician)

        .select()

        .single();

    if (error)
        throw error;

    return data;

};

Api.getTechnicians = async (companyId) => {

    const { data, error } = await supabaseClient

        .from("technicians")

        .select(`
            *,
            stores(name)
        `)

        .eq("company_id", companyId)

        .order("name");

    if (error)
        throw error;

    return data;

};

Api.getTechniciansByStore = async (companyId, storeId) => {

    let query = supabaseClient

        .from("technicians")

        .select("*")

        .eq("company_id", companyId)

        .eq("active", true);

    // Se estiver acessando uma loja específica,
    // mostra apenas os técnicos daquela loja
    // ou os que trabalham em todas (store_id = null)

    if (storeId) {

        query = query.or(
            `store_id.eq.${storeId},store_id.is.null`
        );

    }

    const { data, error } = await query.order("name");

    if (error)
        throw error;

    return data;

};

Api.getTechnicianStats = async (companyId) => {

    const { data, error } = await supabaseClient

        .from("service_orders")

        .select(`
            technician,
            status,
            price
        `)

        .eq("company_id", companyId);

    if (error)
        throw error;

    const stats = {};

    data.forEach(order => {

        if (!order.technician)
            return;

        if (!stats[order.technician]) {

            stats[order.technician] = {

                services: 0,

                revenue: 0

            };

        }

        // Conta todos os serviços

        stats[order.technician].services++;

        // Soma apenas OS entregues

        if (order.status === "Entregue") {

            stats[order.technician].revenue +=
                Number(order.price || 0);

        }

    });

    return stats;

};

Api.updateTechnician = async (id, technician) => {

    const { data, error } = await supabaseClient

        .from("technicians")

        .update(technician)

        .eq("id", id)

        .select()

        .single();

    if (error)
        throw error;

    return data;

};

Api.deleteTechnician = async (id) => {

    const { error } = await supabaseClient

        .from("technicians")

        .delete()

        .eq("id", id);

    if (error)
        throw error;

};



window.Api = Api;
