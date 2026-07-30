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
