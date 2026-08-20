// =========================================
// NEKKO OS
// Dashboard
// =========================================

let context = null;

let salesPeriod = "today";
let osPeriod = "today";
let storeId = "all";


// =========================================
// Formatar moeda
// =========================================

function formatCurrency(value) {

    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

// =========================================
// Filtro de vendas
// =========================================

function setSalesPeriod(period) {

    salesPeriod = period;

    updateSalesFilterButtons();

    loadDashboard();

}


// =========================================
// Atualizar botões do filtro
// =========================================

function updateSalesFilterButtons() {

    const buttons = {

        today:
            document.getElementById("salesToday"),

        week:
            document.getElementById("salesWeek"),

        month:
            document.getElementById("salesMonth")

    };


    Object.entries(buttons).forEach(
        ([key, button]) => {

            if (!button)
                return;


            if (key === salesPeriod) {

                button.className = `
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-medium
                    bg-green-500
                    text-black
                    transition
                `;

            }

            else {

                button.className = `
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-medium
                    bg-[#0F1411]
                    text-slate-400
                    border
                    border-[#29322C]
                    transition
                    hover:text-white
                `;

            }

        }
    );

}

// =========================================
// FILTRO DE OS
// =========================================

function setOsPeriod(period) {

    osPeriod = period;

    updateOsFilterButtons();

    loadDashboard();

}


// =========================================
// ATUALIZAR BOTÕES DO FILTRO DE OS
// =========================================

function updateOsFilterButtons() {

    const buttons = {

        today:
            document.getElementById("osToday"),

        week:
            document.getElementById("osWeek"),

        month:
            document.getElementById("osMonth")

    };


    Object.entries(buttons).forEach(
        ([key, button]) => {

            if (!button)
                return;


            if (key === osPeriod) {

                button.className = `
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-medium
                    bg-green-500
                    text-black
                    transition
                `;

            }

            else {

                button.className = `
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-medium
                    bg-[#0F1411]
                    text-slate-400
                    border
                    border-[#29322C]
                    transition
                    hover:text-white
                `;

            }

        }
    );

}

// =========================================
// CARREGAR LOJAS
// =========================================

async function loadStores() {

    const select =
        document.getElementById(
            "storeFilter"
        );


    if (!select)
        return;


    const stores =
        await Api.getStores(
            context.company.id
        );


    select.innerHTML = `

        <option value="all">
            Todas as lojas
        </option>

    `;


    stores.forEach(store => {

        select.innerHTML += `

            <option value="${store.id}">
                ${store.name}
            </option>

        `;

    });

}

// =========================================
// Carregar Dashboard
// =========================================

async function loadDashboard() {

    try {

        const data =
            await Api.getDashboardData(
                context,
                salesPeriod,
                osPeriod,
                storeId
            );

        renderDashboard(data);

    }

    catch (error) {

        console.error(
            "Erro ao carregar dashboard:",
            error
        );

        alert(error.message);

    }

}


// =========================================
// Renderizar Dashboard
// =========================================

function renderDashboard(data) {

    // -----------------------------
    // Lucro bruto de OS
    // -----------------------------

    document.getElementById("osRevenue").textContent =
        formatCurrency(data.osRevenue);


    document.getElementById("deliveredOrders").textContent =
        `${data.deliveredOrders} OS entregues`;

    // -----------------------------
    // Vendas
    // -----------------------------

    document.getElementById("salesRevenue").textContent =
        formatCurrency(data.salesRevenue);


    document.getElementById("salesCount").textContent =
        `${data.salesCount} vendas registradas`;


    // -----------------------------
    // Lista de vendas
    // -----------------------------

    const salesContainer =
        document.getElementById("salesTable");


    salesContainer.innerHTML = "";


    if (!data.sales.length) {

        salesContainer.innerHTML = `
            <div class="
                text-center
                text-slate-500
                py-8
            ">
                Nenhuma venda encontrada neste período.
            </div>
        `;

    }

    else {

        data.sales.forEach(sale => {

               salesContainer.innerHTML += `

                    <div class="
                        flex
                        items-center
                        justify-between
                        gap-4
                        bg-[#0F1411]
                        border
                        border-[#29322C]
                        rounded-2xl
                        px-5
                        py-4
                    ">
                
                        <!-- INFORMAÇÕES DA VENDA -->
                
                        <div class="min-w-0">

                            ${
                                sale.items && sale.items.length > 0
                        
                                    ? sale.items.map(
                                        item => `
                                            <p
                                                class="
                                                    font-semibold
                                                    text-white
                                                    truncate
                                                "
                                            >
                                                ${item.product_name}
                                            </p>
                                        `
                                    ).join("")
                        
                                    : `
                                        <p
                                            class="
                                                font-semibold
                                                text-white
                                                truncate
                                            "
                                        >
                                            Venda sem produtos
                                        </p>
                                    `
                            }
                        
                        </div>
                
                
                            <p class="
                                text-xs
                                text-slate-500
                                mt-1
                            ">
                
                                ${new Date(
                                    sale.created_at
                                ).toLocaleString(
                                    "pt-BR"
                                )}
                
                            </p>
                
                        </div>
                
                
                        <!-- AÇÕES + VALOR -->

                        <div class="
                            flex
                            items-center
                            gap-2
                            shrink-0
                        ">
                        
                            <!-- IMPRIMIR -->
                        
                            <button
                                type="button"
                                onclick="printSale('${sale.id}')"
                                class="
                                    inline-flex
                                    items-center
                                    justify-center
                                    w-9
                                    h-9
                                    rounded-xl
                                    border
                                    border-[#29322C]
                                    bg-[#141A16]
                                    text-slate-400
                                    hover:text-white
                                    hover:border-slate-500
                                    transition
                                "
                                title="Imprimir venda"
                            >
                        
                                <i
                                    data-lucide="printer"
                                    class="w-4 h-4"
                                ></i>
                        
                            </button>
                        
                        
                            <!-- EXCLUIR -->
                        
                            <button
                                type="button"
                                onclick="deleteSale('${sale.id}')"
                                class="
                                    inline-flex
                                    items-center
                                    justify-center
                                    w-9
                                    h-9
                                    rounded-xl
                                    border
                                    border-[#29322C]
                                    bg-[#141A16]
                                    text-slate-400
                                    hover:text-red-400
                                    hover:border-red-400/40
                                    transition
                                "
                                title="Excluir venda"
                            >
                        
                                <i
                                    data-lucide="trash-2"
                                    class="w-4 h-4"
                                ></i>
                        
                            </button>
                        
                        
                            <!-- VALOR -->
                        
                            <p class="
                                font-semibold
                                text-purple-400
                                ml-2
                                whitespace-nowrap
                            ">
                        
                                ${formatCurrency(
                                    sale.total_price
                                )}
                        
                            </p>
                        
                        </div>
                
                    </div>
                
                `;

        });

    }

    // ATUALIZAR ÍCONES
    lucide.createIcons();

    }

// =========================================
// IMPRIMIR VENDA
// =========================================

function printSale(id) {

    if (!id) {

        alert(
            "Venda não encontrada."
        );

        return;

    }


    window.open(
        `../sales/print.html?id=${encodeURIComponent(id)}`,
        "_blank"
    );

}

// =========================================
// EXCLUIR VENDA
// =========================================

async function deleteSale(id) {

    if (!id) {

        alert(
            "Venda não encontrada."
        );

        return;

    }


    const confirmed =
        confirm(
            "Tem certeza que deseja excluir esta venda?"
        );


    if (!confirmed)
        return;


    try {

        await Api.deleteSale(id);


        alert(
            "Venda excluída com sucesso."
        );


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Erro ao excluir venda:",
            error
        );


        alert(
            "Erro ao excluir a venda."
        );

    }

}

// =========================================
// Inicialização
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            const result =
                await Bootstrap.init();


            if (result.status !== "READY") {

                window.location.href =
                    "../login/login.html";

                return;

            }


            context = result.context;

            await loadStores();
            
            await loadDashboard();


            const loading =
                document.getElementById(
                    "dashboardLoading"
                );

            if (loading) {

                loading.remove();

            }

            document
                .getElementById("salesToday")
                .addEventListener(
                    "click",
                    () => setSalesPeriod("today")
                );
            
            
            document
                .getElementById("salesWeek")
                .addEventListener(
                    "click",
                    () => setSalesPeriod("week")
                );
            
            
            document
                .getElementById("salesMonth")
                .addEventListener(
                    "click",
                    () => setSalesPeriod("month")
                );
            
            
            updateSalesFilterButtons();

            // =========================================
            // FILTROS DE OS
            // =========================================
            
            document
                .getElementById("osToday")
                .addEventListener(
                    "click",
                    () => setOsPeriod("today")
                );
            
            
            document
                .getElementById("osWeek")
                .addEventListener(
                    "click",
                    () => setOsPeriod("week")
                );
            
            
            document
                .getElementById("osMonth")
                .addEventListener(
                    "click",
                    () => setOsPeriod("month")
                );

            // =========================================
            // FILTRO DE LOJA
            // =========================================
            
            document
                .getElementById("storeFilter")
                .addEventListener(
                    "change",
                    (event) => {
            
                        storeId =
                            event.target.value;
            
                        loadDashboard();
            
                    }
                );
            
            updateOsFilterButtons();


            lucide.createIcons();

        }

        catch (error) {

            console.error(
                "Erro ao iniciar dashboard:",
                error
            );

            alert(error.message);

        }

    }
);
