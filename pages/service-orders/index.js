// =========================================
// NEKKO OS
// Lista de Ordens de Serviço
// =========================================

let serviceOrders = [];
let appContext = null;

document.addEventListener("DOMContentLoaded", async () => {

    try {

        // ---------------------------------
        // Contexto
        // ---------------------------------

        const result = await Bootstrap.init();
        appContext = result.context;

        if (result.status !== "READY") {

            window.location.href = "../login/login.html";
            return;

        }

        // ---------------------------------
        // Carregar OS
        // ---------------------------------

        await loadServiceOrders(result.context);

        // ---------------------------------
        // Eventos
        // ---------------------------------

        document
            .getElementById("refreshButton")
            .addEventListener("click", () => {

                loadServiceOrders(result.context);

            });

        document
            .getElementById("searchInput")
            .addEventListener("input", filterOrders);

        document
            .getElementById("statusFilter")
            .addEventListener("change", filterOrders);

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});

// =========================================
// Carregar OS
// =========================================

async function loadServiceOrders(context) {

    try {

        serviceOrders = await Api.getServiceOrders(context);

        renderOrders(serviceOrders);

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// =========================================
// Helpers
// =========================================

function formatCurrency(value) {

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(value || 0));

}

function formatDate(date) {

    if (!date) return "--";

    return new Date(date).toLocaleDateString("pt-BR");

}

function formatOsNumber(number) {

    return String(number || 0).padStart(6, "0");

}

function getStatusBadge(status) {

    const styles = {

        "Aberta":
            "bg-blue-500/15 text-blue-400",

        "Aguardando peça":
            "bg-yellow-500/15 text-yellow-400",

        "Em manutenção":
            "bg-orange-500/15 text-orange-400",

        "Pronta":
            "bg-green-500/15 text-green-400",

        "Entregue":
            "bg-slate-500/15 text-slate-300",

        "Cancelada":
            "bg-red-500/15 text-red-400"

    };

    return styles[status] ||
        "bg-slate-500/15 text-slate-300";

}

// =========================================
// Renderizar
// =========================================

function renderOrders(orders) {

    const container =
        document.getElementById("ordersContainer");

    const counter =
        document.getElementById("ordersCount");

    counter.textContent = orders.length;

    container.innerHTML = "";

    if (orders.length === 0) {

        container.innerHTML = `

            <div
                class="bg-[#141A16]
                       border
                       border-[#29322C]
                       rounded-3xl
                       p-10
                       text-center">

                <h2 class="text-2xl font-semibold mb-3">

                    Nenhuma ordem de serviço encontrada

                </h2>

                <p class="text-slate-400">

                    Cadastre sua primeira OS.

                </p>

            </div>

        `;

        return;

    }

    const isCEO = appContext?.role === Roles.CEO;
    orders.forEach(order => {

        container.innerHTML += `

            <div
                class="bg-[#141A16]
                       border
                       border-[#29322C]
                       rounded-3xl
                       p-6
                       hover:border-green-500/40
                       transition">

                <div class="flex justify-between items-start gap-6">

                    <div>

                        <h2 class="text-2xl font-bold text-white">

                            OS #${formatOsNumber(order.os_number)}

                        </h2>

                        <p class="text-slate-300 mt-4">

                            👤 ${order.customer_name || "--"}

                        </p>

                        <p class="text-slate-400 mt-2">

                            📱 ${order.brand || "--"} ${order.model || ""}

                        </p>

                        <p class="text-slate-400 mt-2">

                            🔧 ${order.service || "--"}

                        </p>

                        <p class="text-slate-400 mt-2">

                            👨‍🔧 ${order.technician || "--"}
                            
                        </p>

                        ${isCEO ? `
                            <p class="text-slate-400 mt-2">
                        
                                🏪 ${order.stores?.name || "--"}
                        
                            </p>
                        ` : ""}

                        <p class="text-slate-500 mt-2">

                            📅 ${formatDate(order.created_at)}

                        </p>

                    </div>

                    <div class="text-right">

                        <span
                            class="inline-block
                                   px-4
                                   py-2
                                   rounded-full
                                   text-sm
                                   font-medium
                                   ${getStatusBadge(order.status)}">

                            ${order.status}

                        </span>

                        <p class="text-2xl font-bold mt-6 text-white">

                            ${formatCurrency(order.price || order.total_cost)}

                        </p>

                    </div>

                </div>

                <div
                    class="flex justify-end gap-3 mt-8">

                    <button
                        class="view-order
                               bg-green-500
                               hover:bg-green-600
                               px-5
                               py-2
                               rounded-xl
                               transition"
                        data-id="${order.id}">

                        Ver

                    </button>

                    <button
                        class="edit-order
                               bg-[#202823]
                               hover:bg-[#29322C]
                               border
                               border-[#3B4A41]
                               px-5
                               py-2
                               rounded-xl
                               transition"
                        data-id="${order.id}">

                        Editar

                    </button>

                    <button
                        class="print-order
                               bg-blue-600
                               hover:bg-blue-700
                               px-5
                               py-2
                               rounded-xl
                               transition"
                        data-id="${order.id}">
                    
                        Imprimir
                    
                    </button>

                </div>

            </div>

        `;

    });

    document
        .querySelectorAll(".view-order")
        .forEach(button => {

            button.addEventListener("click", () => {

                window.location.href =
                    `details.html?id=${button.dataset.id}`;

            });

        });

    document
        .querySelectorAll(".print-order")
        .forEach(button => {
    
            button.addEventListener("click", () => {
    
                window.open(
                    `print.html?id=${button.dataset.id}`,
                    "_blank"
                );
    
            });
    
        });

}

// =========================================
// Pesquisa / Filtro
// =========================================

function filterOrders() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();

    const status =
        document
            .getElementById("statusFilter")
            .value;

    const filtered = serviceOrders.filter(order => {

        const matchesSearch =

            (order.customer_name || "")
                .toLowerCase()
                .includes(search)

            ||

            (order.model || "")
                .toLowerCase()
                .includes(search)

            ||

            String(order.os_number)
                .includes(search);

        const matchesStatus =

            !status ||

            order.status === status;

        return matchesSearch && matchesStatus;

    });

    renderOrders(filtered);

}
