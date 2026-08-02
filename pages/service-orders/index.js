// =========================================
// NEKKO OS
// Lista de Ordens de Serviço
// =========================================

let serviceOrders = [];
let appContext = null;
let orderToDelete = null;
let orderToChangeStatus = null;

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

                    <div class="relative text-right">

                        <button
                            class="change-status
                                   inline-flex
                                   items-center
                                   gap-2
                                   px-4
                                   py-2
                                   rounded-full
                                   text-sm
                                   font-medium
                                   transition
                                   ${getStatusBadge(order.status)}"
                            data-id="${order.id}">
                    
                            ${order.status}
                    
                            ▼
                    
                        </button>
                    
                        <div
                            class="status-dropdown
                                   hidden
                                   absolute
                                   right-0
                                   mt-2
                                   w-56
                                   bg-[#141A16]
                                   border
                                   border-[#29322C]
                                   rounded-2xl
                                   shadow-2xl
                                   overflow-hidden
                                   z-20">
                    
                            <button class="status-option w-full text-left px-4 py-3 hover:bg-[#202823]" data-status="Aberta">
                                🔵 Aberta
                            </button>
                    
                            <button class="status-option w-full text-left px-4 py-3 hover:bg-[#202823]" data-status="Aguardando peça">
                                🟡 Aguardando peça
                            </button>
                    
                            <button class="status-option w-full text-left px-4 py-3 hover:bg-[#202823]" data-status="Em manutenção">
                                🟠 Em manutenção
                            </button>
                    
                            <button class="status-option w-full text-left px-4 py-3 hover:bg-[#202823]" data-status="Pronta">
                                🟢 Pronta
                            </button>
                    
                            <button class="status-option w-full text-left px-4 py-3 hover:bg-[#202823]" data-status="Entregue">
                                ⚫ Entregue
                            </button>
                    
                            <button class="status-option w-full text-left px-4 py-3 hover:bg-[#202823]" data-status="Cancelada">
                                🔴 Cancelada
                            </button>
                    
                        </div>
                    
                        <p class="text-2xl font-bold mt-6 text-white">
                    
                            ${formatCurrency(order.price || order.total_cost)}
                    
                        </p>
                    
                    </div>

                </div>

                <div
                    class="
                        grid
                        grid-cols-2
                        gap-3
                        mt-8">

                    <button
                        class="view-order
                                w-full
                                bg-green-800
                                hover:bg-green-600
                                py-2
                                rounded-xl
                                transition"
                        data-id="${order.id}">

                        Ver

                    </button>

                    <button
                        class="edit-order
                                w-full
                                bg-green-800
                                hover:bg-green-600
                                py-2
                                rounded-xl
                                transition"
                        data-id="${order.id}">

                        Editar

                    </button>

                    <button
                        class="print-order
                                w-full
                                bg-green-800
                                hover:bg-green-600
                                py-2
                                rounded-xl
                                transition"
                        data-id="${order.id}">
                    
                        Imprimir
                    
                    </button>

                    <button
                        class="delete-order
                                w-full
                                bg-green-800
                                hover:bg-red-800
                                py-2
                                rounded-xl
                                transition"
                        data-id="${order.id}">
                    
                        Excluir
                    
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
        .querySelectorAll(".edit-order")
        .forEach(button => {
    
            button.addEventListener("click", () => {
    
                window.location.href =
                    `create.html?id=${button.dataset.id}&mode=edit`;
    
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

    // =========================================
    // Excluir
    // =========================================
    
    document
        .querySelectorAll(".delete-order")
        .forEach(button => {
    
            button.addEventListener("click", () => {
    
                orderToDelete = button.dataset.id;
    
                const order = serviceOrders.find(
                    os => os.id === orderToDelete
                );
    
                document.getElementById("deleteText").innerHTML = `
                    Tem certeza que deseja excluir a
                    <br><br>
                    <strong>OS #${formatOsNumber(order.os_number)}</strong>
                    <br><br>
                    Esta ação não poderá ser desfeita.
                `;
    
                document
                    .getElementById("deleteModal")
                    .classList.remove("hidden");
    
                document
                    .getElementById("deleteModal")
                    .classList.add("flex");
    
            });
    
        });

    // =========================================
    // Alterar Status
    // =========================================
    
    document
        .querySelectorAll(".change-status")
        .forEach(button => {
    
            button.addEventListener("click", (e) => {
    
                e.stopPropagation();
    
                document
                    .querySelectorAll(".status-dropdown")
                    .forEach(menu => {
    
                        if (menu !== button.nextElementSibling) {
    
                            menu.classList.add("hidden");
    
                        }
    
                    });
    
                const dropdown =
                    button.nextElementSibling;
    
                if (dropdown) {
    
                    dropdown.classList.toggle("hidden");
    
                }
    
            });
    
        });
    
    document
        .querySelectorAll(".status-option")
        .forEach(option => {
    
            option.addEventListener("click", async (e) => {
    
                e.stopPropagation();
    
                const dropdown =
                    option.closest(".status-dropdown");
    
                const button =
                    dropdown.previousElementSibling;
    
                try {
    
                    await Api.updateServiceOrderStatus(
    
                        button.dataset.id,
    
                        option.dataset.status
    
                    );
    
                    await loadServiceOrders(appContext);
    
                }
    
                catch (error) {
    
                    console.error(error);
    
                    alert(error.message);
    
                }
    
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

    // =========================================
    // Modal
    // =========================================
    
    document
        .getElementById("cancelDelete")
        ?.addEventListener("click", () => {
    
            document
                .getElementById("deleteModal")
                .classList.add("hidden");
    
            document
                .getElementById("deleteModal")
                .classList.remove("flex");
    
            orderToDelete = null;
    
        });


    // =========================================
    // Confirmar exclusão
    // =========================================
    
    document
        .getElementById("confirmDelete")
        ?.addEventListener("click", async () => {
    
            if (!orderToDelete)
                return;
    
            try {
    
                await Api.deleteServiceOrder(orderToDelete);
    
                document
                    .getElementById("deleteModal")
                    .classList.add("hidden");
    
                document
                    .getElementById("deleteModal")
                    .classList.remove("flex");
    
                orderToDelete = null;
    
                await loadServiceOrders(appContext);
    
            }
    
            catch (error) {
    
                console.error(error);
    
                alert(error.message);
    
            }
    
        });

    // =========================================
    // Fechar dropdown ao clicar fora
    // =========================================
    
    document.addEventListener("click", () => {
    
        document
            .querySelectorAll(".status-dropdown")
            .forEach(menu => {
    
                menu.classList.add("hidden");
    
            });
    
    });
