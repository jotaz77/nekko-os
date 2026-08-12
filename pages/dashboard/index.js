// =========================================
// NEKKO OS
// Dashboard
// =========================================

let context = null;

let salesPeriod = "today";
let osPeriod = "today";


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
// Carregar Dashboard
// =========================================

async function loadDashboard() {

    try {

        const data =
            await Api.getDashboardData(
                context,
                salesPeriod,
                osPeriod
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
    // Técnicos
    // -----------------------------

    document.getElementById("techniciansRevenue").textContent =
        formatCurrency(data.techniciansRevenue);


    document.getElementById("techniciansServices").textContent =
        `${data.techniciansServices} serviços realizados`;

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

                    <div>

                        <p class="
                            font-semibold
                            text-white
                        ">
                            ${sale.product_name}
                        </p>

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


                    <div class="text-right">

                        <p class="
                            font-semibold
                            text-purple-400
                        ">
                            ${formatCurrency(
                                sale.sale_price
                            )}
                        </p>

                    </div>

                </div>

            `;

        });

    }


    // -----------------------------
    // Tabela de técnicos
    // -----------------------------

    const container =
        document.getElementById("techniciansTable");

    container.innerHTML = "";


    if (!data.technicians.length) {

        container.innerHTML = `
            <div class="
                text-center
                text-slate-500
                py-8
            ">
                Nenhum serviço técnico encontrado.
            </div>
        `;

        return;

    }


    data.technicians.forEach(technician => {

        container.innerHTML += `

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

                <div>

                    <p class="
                        font-semibold
                        text-white
                    ">
                        ${technician.name}
                    </p>

                    <p class="
                        text-sm
                        text-slate-500
                        mt-1
                    ">
                        ${technician.services} serviços
                    </p>

                </div>


                <div class="text-right">

                    <p class="
                        font-semibold
                        text-green-400
                    ">
                        ${formatCurrency(technician.revenue)}
                    </p>

                    <p class="
                        text-xs
                        text-slate-500
                        mt-1
                    ">
                        produção bruta
                    </p>

                </div>

            </div>

        `;

    });

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
