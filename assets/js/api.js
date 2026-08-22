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


// =====================================
// DASHBOARD
// =====================================

Api.getDashboardData = async (
    context,
    salesPeriod = "today",
    osPeriod = "today",
    storeId = "all"
) => {

    // =================================
    // Buscar OS
    // =================================
    
    let serviceOrdersQuery =
        supabaseClient
    
            .from("service_orders")
    
            .select(`
                technician,
                status,
                price,
                created_at,
                store_id
            `)
    
            .eq(
                "company_id",
                context.company.id
            );
    
    
    // =================================
    // Filtro de período das OS
    // =================================
    
    const osNow = new Date();
    
    let osStartDate;
    
    
    if (osPeriod === "today") {

        osStartDate =
            new Date(
                osNow.getFullYear(),
                osNow.getMonth(),
                osNow.getDate()
            );
    
    }
    
    
    else if (osPeriod === "week") {
    
        const day =
            osNow.getDay();
    
        const diff =
            day === 0
                ? 6
                : day - 1;
    
    
        osStartDate =
            new Date(
                osNow.getFullYear(),
                osNow.getMonth(),
                osNow.getDate() - diff
            );
    
    }
    
    
    else if (osPeriod === "month") {
    
        osStartDate =
            new Date(
                osNow.getFullYear(),
                osNow.getMonth(),
                1
            );
    
    }
    
    
    // =================================
    // Aplicar filtro
    // =================================
    
    serviceOrdersQuery =
        serviceOrdersQuery.gte(
            "created_at",
            osStartDate.toISOString()
        );

    // =================================
    // Filtro de loja das OS
    // =================================
    
    if (storeId !== "all") {
    
        serviceOrdersQuery =
            serviceOrdersQuery.eq(
                "store_id",
                storeId
            );
    
    }
    
    // =================================
    // Executar consulta
    // =================================
    
    const {
        data: serviceOrders,
        error: ordersError
    } = await serviceOrdersQuery;
    
    
        if (ordersError)
            throw ordersError;


    // =================================
    // Valores das OS
    // =================================

    let osRevenue = 0;

    let deliveredOrders = 0;

    // =================================
    // Lista de OS entregues
    // =================================
    
    const deliveredOrdersList =
        serviceOrders.filter(
            order =>
                order.status === "Entregue"
        );


    // =================================
    // Técnicos
    // =================================

    const technicians = {};


    serviceOrders.forEach(order => {

        // -----------------------------
        // OS entregues
        // -----------------------------

        if (order.status === "Entregue") {

            osRevenue += Number(
                order.price || 0
            );

            deliveredOrders++;

        }


        // -----------------------------
        // Técnico
        // -----------------------------

        if (!order.technician)
            return;


        if (!technicians[order.technician]) {

            technicians[order.technician] = {

                name:
                    order.technician,

                services: 0,

                revenue: 0

            };

        }


        technicians[
            order.technician
        ].services++;


        if (
            order.status === "Entregue"
        ) {

            technicians[
                order.technician
            ].revenue += Number(
                order.price || 0
            );

        }

    });


    // =================================
    // Lista de técnicos
    // =================================

    const techniciansList =
        Object.values(technicians);


    // =================================
    // Totais dos técnicos
    // =================================

    const techniciansRevenue =
        techniciansList.reduce(
            (total, technician) => {

                return total +
                    technician.revenue;

            },
            0
        );


    const techniciansServices =
        techniciansList.reduce(
            (total, technician) => {

                return total +
                    technician.services;

            },
            0
        );


    techniciansList.sort(
        (a, b) =>
            b.revenue - a.revenue
    );


    // =================================
    // FILTRO DE VENDAS
    // =================================

    const now = new Date();

    let startDate;


    // =================================
    // Hoje
    // =================================

    if (salesPeriod === "today") {

        startDate =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

    }


    // =================================
    // Esta semana
    // =================================

    else if (salesPeriod === "week") {

        const day =
            now.getDay();

        const diff =
            day === 0
                ? 6
                : day - 1;


        startDate =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - diff
            );

    }


    // =================================
    // Este mês
    // =================================

    else if (salesPeriod === "month") {

        startDate =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

    }


    // =================================
    // Buscar vendas
    // =================================

    let salesQuery =
    supabaseClient

        .from("sales")

        .select(`
            id,
            total_price,
            payment_method,
            store_id,
            created_at
        `)

        .eq(
            "company_id",
            context.company.id
        )

        .gte(
            "created_at",
            startDate.toISOString()
        );


// =================================
// FILTRO DE LOJA DAS VENDAS
// =================================

if (storeId !== "all") {

    salesQuery =
        salesQuery.eq(
            "store_id",
            storeId
        );

}


// =================================
// ORDENAR VENDAS
// =================================

salesQuery =
    salesQuery.order(
        "created_at",
        {
            ascending: false
        }
    );


// =================================
// EXECUTAR CONSULTA
// =================================

const {
    data: sales,
    error: salesError
} = await salesQuery;


    if (salesError)
        throw salesError;


    // =================================
    // Total de vendas
    // =================================

    const salesRevenue =
        sales.reduce(
            (total, sale) => {

                return total +
                    Number(
                        sale.total_price || 0
                    );

            },
            0
        );


    const salesCount =
        sales.length;

    // ---------------------------------
    // Resumo das vendas por pagamento
    // ---------------------------------
    
    const salesByPayment = {
    
        pix: 0,
    
        debit: 0,
    
        cash: 0,
    
        credit_cash: 0,
    
        credit_installments: 0
    
    };
    
    
    sales.forEach(
        sale => {
    
            const payment =
                sale.payment_method;
    
            const value =
                Number(
                    sale.total_price || 0
                );
    
    
            if (
                Object.prototype.hasOwnProperty.call(
                    salesByPayment,
                    payment
                )
            ) {
    
                salesByPayment[payment] +=
                    value;
    
            }
    
        }
    );

    // ---------------------------------
    // Carregar itens das vendas
    // ---------------------------------
    
    const salesWithItems =
        await Promise.all(
    
            sales.map(
                async sale => {
    
                    const items =
                        await Api.getSaleItems(
                            sale.id
                        );
    
                    return {
    
                        ...sale,
    
                        items
    
                    };
    
                }
            )
    
        );


    // =================================
    // Retorno
    // =================================

    return {

        osRevenue,

        deliveredOrders,

        techniciansRevenue,

        techniciansServices,

        technicians: techniciansList,

        salesRevenue,

        salesCount,

        sales: salesWithItems,
        
        salesByPayment,

        deliveredOrdersList
        
    };

};

// =========================================
// REGISTRAR VENDA
// =========================================

Api.createSale = async (sale) => {

    const { data, error } = await supabaseClient

        .from("sales")

        .insert({

            company_id:
                sale.company_id,
        
            store_id:
                sale.store_id,
        
            product_name:
                sale.product_name,
        
            sale_price:
                sale.sale_price,

            total_price:
                sale.total_price || 0,
            
            payment_method:
                sale.payment_method || null,
        
            created_by:
                sale.created_by,
        
            customer_name:
                sale.customer_name || null,
        
            customer_document:
                sale.customer_document || null,
        
            customer_zip_code:
                sale.customer_zip_code || null
        
        })
        
        .select()

        .single();


    if (error)
        throw error;


    return data;

};

// =========================================
// ITENS DA VENDA
// =========================================

Api.createSaleItem = async (
    item
) => {

    const {
        data,
        error
    } = await supabaseClient

        .from("sale_items")

        .insert({

            sale_id:
                item.sale_id,

            product_id:
                item.product_id || null,

            product_name:
                item.product_name,

            quantity:
                item.quantity || 1,

            unit_price:
                item.unit_price || 0,

            unit_cost:
                item.unit_cost || 0,

            subtotal:
                item.subtotal || 0

        })

        .select()

        .single();


    if (error)
        throw error;


    return data;

};

// =========================================
// BUSCAR ITENS DA VENDA
// =========================================

Api.getSaleItems = async (
    saleId
) => {

    const {
        data,
        error
    } = await supabaseClient

        .from("sale_items")

        .select(`
            *
        `)

        .eq(
            "sale_id",
            saleId
        )

        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (error)
        throw error;


    return data || [];

};

// =========================================
// CRIAR VENDA COMPLETA
// =========================================

Api.createCompleteSale = async (
    sale
) => {

    // ---------------------------------
    // 1. Criar a venda principal
    // ---------------------------------

    const createdSale =
        await Api.createSale({
            company_id:
                sale.company_id,

            store_id:
                sale.store_id,

            product_name:
                sale.product_name ||
                (
                    sale.items &&
                    sale.items.length > 0
                        ? sale.items[0].product_name
                        : ""
                ),

            sale_price:
                sale.sale_price ||
                sale.total_price ||
                0,

            total_price:
                sale.total_price ||
                0,

            payment_method:
                sale.payment_method ||
                null,

            created_by:
                sale.created_by,

            customer_name:
                sale.customer_name ||
                null,

            customer_document:
                sale.customer_document ||
                null,

            customer_zip_code:
                sale.customer_zip_code ||
                null
        });


    // ---------------------------------
    // 2. Criar os itens
    // ---------------------------------

    const items =
        sale.items || [];


    const createdItems = [];


    for (
        const item of items
    ) {

        const createdItem =
            await Api.createSaleItem({

                sale_id:
                    createdSale.id,

                product_id:
                    item.product_id ||
                    null,

                product_name:
                    item.product_name,

                quantity:
                    item.quantity ||
                    1,

                unit_price:
                    item.unit_price ||
                    0,

                unit_cost:
                    item.unit_cost ||
                    0,

                subtotal:
                    item.subtotal ||
                    0

            });


        createdItems.push(
            createdItem
        );

    }


    // ---------------------------------
    // 3. Retornar tudo
    // ---------------------------------

    return {

        sale:
            createdSale,

        items:
            createdItems

    };

};

// =========================================
// BUSCAR VENDA PARA IMPRESSÃO
// =========================================

Api.getSale = async (id) => {

    const {
        data,
        error
    } = await supabaseClient

        .from("sales")

        .select(`
            id,
            company_id,
            store_id,
            product_name,
            sale_price,
            created_by,
            created_at,
            customer_name,
            customer_document,
            customer_zip_code,

            companies (
                id,
                name,
                document
            ),

            stores (
                id,
                name,
                phone,
                zip_code,
                state,
                city,
                neighborhood,
                street,
                number,
                complement
            )
        `)

        .eq("id", id)

        .single();


    if (error)
        throw error;


    return data;

};

// =========================================
// EXCLUIR VENDA
// =========================================

Api.deleteSale = async (id) => {

    const {
        error
    } = await supabaseClient

        .from("sales")

        .delete()

        .eq(
            "id",
            id
        );


    if (error)
        throw error;


    return true;

};

// =========================================
// NEKKO OS
// ESTOQUE
// =========================================


// =========================================
// LISTAR PRODUTOS DO ESTOQUE
// =========================================

Api.getInventoryProducts = async (
    companyId,
    storeId = null
) => {

    let query =
        supabaseClient
            .from("inventory_products")
            .select(`
                *,
                stores (
                    id,
                    name
                )
            `)
            .eq(
                "company_id",
                companyId
            )
            .eq(
                "active",
                true
            );


    // -------------------------------------
    // Filtrar loja
    // -------------------------------------

    if (storeId) {

        query =
            query.eq(
                "store_id",
                storeId
            );

    }


    const {
        data,
        error
    } = await query
        .order(
            "name",
            {
                ascending: true
            }
        );


    if (error)
        throw error;


    return data || [];

};


// =========================================
// BUSCAR PRODUTO POR ID
// =========================================

Api.getInventoryProduct = async (
    productId
) => {

    const {
        data,
        error
    } = await supabaseClient

        .from(
            "inventory_products"
        )

        .select(`
            *,
            stores (
                id,
                name
            )
        `)

        .eq(
            "id",
            productId
        )

        .maybeSingle();


    if (error)
        throw error;


    return data;

};


// =========================================
// CRIAR PRODUTO / RECEBER ESTOQUE
// =========================================

Api.createInventoryProduct = async (
    product
) => {

    const {
        data,
        error
    } = await supabaseClient

        .from(
            "inventory_products"
        )

        .insert(
            product
        )

        .select(`
            *,
            stores (
                id,
                name
            )
        `)

        .single();


    if (error)
        throw error;


    return data;

};


// =========================================
// ATUALIZAR PRODUTO
// =========================================

Api.updateInventoryProduct = async (
    productId,
    product
) => {

    const {
        data,
        error
    } = await supabaseClient

        .from(
            "inventory_products"
        )

        .update(
            product
        )

        .eq(
            "id",
            productId
        )

        .select(`
            *,
            stores (
                id,
                name
            )
        `)

        .single();


    if (error)
        throw error;


    return data;

};


// =========================================
// DESATIVAR PRODUTO
// =========================================

Api.deleteInventoryProduct = async (
    productId
) => {

    const {
        error
    } = await supabaseClient

        .from(
            "inventory_products"
        )

        .update({
            active: false
        })

        .eq(
            "id",
            productId
        );


    if (error)
        throw error;


    return true;

};


// =========================================
// HISTÓRICO DO ESTOQUE
// =========================================

Api.getInventoryMovements = async (
    companyId,
    storeId = null,
    productId = null
) => {

    let query =
        supabaseClient

            .from(
                "inventory_movements"
            )

            .select(`
                *,
                inventory_products (
                    id,
                    name
                )
            `)

            .eq(
                "company_id",
                companyId
            );


    // -------------------------------------
    // Loja
    // -------------------------------------

    if (storeId) {

        query =
            query.eq(
                "store_id",
                storeId
            );

    }


    // -------------------------------------
    // Produto
    // -------------------------------------

    if (productId) {

        query =
            query.eq(
                "product_id",
                productId
            );

    }


    const {
        data,
        error
    } = await query

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error)
        throw error;


    return data || [];

};

// =========================================
// REGISTRAR MOVIMENTAÇÃO DE ESTOQUE
// =========================================

Api.createInventoryMovement = async (
    movement
) => {

    const {
        data,
        error
    } = await supabaseClient

        .from(
            "inventory_movements"
        )

        .insert(
            movement
        )

        .select()
        
        .single();


    if (error)
        throw error;


    return data;

};

// =========================================
// EXCLUIR MOVIMENTAÇÃO DE ESTOQUE
// =========================================

Api.deleteInventoryMovement = async (
    movementId
) => {

    const {
        error
    } = await supabaseClient

        .from("inventory_movements")

        .delete()

        .eq(
            "id",
            movementId
        );


    if (error)
        throw error;


    return true;

};

window.Api = Api;
