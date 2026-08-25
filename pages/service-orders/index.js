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

        "Aguardando aprovação":
            "bg-purple-500/15 text-purple-400",

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


    counter.textContent =
        orders.length;


    container.innerHTML = "";


    // =========================================
    // NENHUMA OS
    // =========================================

    if (orders.length === 0) {

        container.innerHTML = `

            <div
                class="
                    xl:col-span-2
                    bg-[#101510]
                    border
                    border-[#222B25]
                    rounded-[28px]
                    p-12
                    text-center
                "
            >

                <div
                    class="
                        w-16
                        h-16
                        mx-auto
                        mb-5
                        rounded-2xl
                        bg-green-500/5
                        border
                        border-green-500/10
                        flex
                        items-center
                        justify-center
                        text-green-400
                    "
                >

                    <i
                        data-lucide="clipboard-list"
                        class="w-7 h-7"
                    ></i>

                </div>


                <h2
                    class="
                        text-2xl
                        font-bold
                    "
                >
                    Nenhuma ordem encontrada
                </h2>


                <p
                    class="
                        text-slate-500
                        mt-3
                    "
                >
                    Não existem ordens de serviço para os filtros selecionados.
                </p>

            </div>

        `;


        if (window.lucide) {
            lucide.createIcons();
        }


        return;

    }


    const isCEO =
        appContext?.role === Roles.CEO;


    // =========================================
    // CARDS
    // =========================================

    orders.forEach(order => {

        const services =
            order.service_order_items || [];


        const total =
            Number(
                order.price ||
                order.total_cost ||
                0
            );


        container.innerHTML += `

            <article
                class="
                    group
                    bg-[#101510]/95
                    border
                    border-[#222B25]
                    rounded-[28px]
                    p-5
                    md:p-6
                    shadow-xl
                    shadow-black/10
                    hover:border-green-500/30
                    hover:-translate-y-1
                    hover:shadow-2xl
                    transition-all
                    duration-300
                "
            >


                <!-- ================================= -->
                <!-- TOPO -->
                <!-- ================================= -->

                <div
                    class="
                        flex
                        items-start
                        justify-between
                        gap-4
                    "
                >

                    <div class="min-w-0">

                        <div
                            class="
                                inline-flex
                                items-center
                                gap-2
                                px-3
                                py-1.5
                                rounded-full
                                bg-green-500/5
                                border
                                border-green-500/10
                                text-green-400
                                text-xs
                                font-bold
                                tracking-wide
                                mb-3
                            "
                        >

                            <i
                                data-lucide="clipboard-list"
                                class="w-3.5 h-3.5"
                            ></i>

                            OS CLIENTE

                        </div>


                        <h2
                            class="
                                text-2xl
                                font-bold
                                tracking-tight
                            "
                        >
                            OS #${formatOsNumber(
                                order.os_number
                            )}
                        </h2>

                    </div>



                    <!-- STATUS -->

                    <div class="relative shrink-0">

                        <button
                            class="
                                change-status
                                inline-flex
                                items-center
                                gap-2
                                px-3.5
                                py-2
                                rounded-full
                                text-xs
                                font-semibold
                                border
                                border-white/5
                                transition
                                ${getStatusBadge(
                                    order.status
                                )}
                            "
                            data-id="${order.id}"
                        >

                            <span
                                class="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-current
                                "
                            ></span>

                            ${order.status}

                            <i
                                data-lucide="chevron-down"
                                class="w-3.5 h-3.5"
                            ></i>

                        </button>



                        <!-- DROPDOWN -->

                        <div
                            class="
                                status-dropdown
                                hidden
                                absolute
                                right-0
                                mt-2
                                w-56
                                bg-[#111712]
                                border
                                border-[#29322C]
                                rounded-2xl
                                shadow-2xl
                                overflow-hidden
                                z-30
                            "
                        >

                            <button
                                class="
                                    status-option
                                    w-full
                                    text-left
                                    px-4
                                    py-3
                                    hover:bg-[#202823]
                                    transition
                                "
                                data-status="Aberta"
                            >
                                🔵 Aberta
                            </button>

                            <button
                                class="
                                    status-option
                                    w-full
                                    text-left
                                    px-4
                                    py-3
                                    hover:bg-[#202823]
                                    transition
                                "
                                data-status="Aguardando aprovação"
                            >
                                🟣 Aguardando aprovação
                            </button>


                            <button
                                class="
                                    status-option
                                    w-full
                                    text-left
                                    px-4
                                    py-3
                                    hover:bg-[#202823]
                                    transition
                                "
                                data-status="Aguardando peça"
                            >
                                🟡 Aguardando peça
                            </button>


                            <button
                                class="
                                    status-option
                                    w-full
                                    text-left
                                    px-4
                                    py-3
                                    hover:bg-[#202823]
                                    transition
                                "
                                data-status="Em manutenção"
                            >
                                🟠 Em manutenção
                            </button>


                            <button
                                class="
                                    status-option
                                    w-full
                                    text-left
                                    px-4
                                    py-3
                                    hover:bg-[#202823]
                                    transition
                                "
                                data-status="Pronta"
                            >
                                🟢 Pronta
                            </button>


                            <button
                                class="
                                    status-option
                                    w-full
                                    text-left
                                    px-4
                                    py-3
                                    hover:bg-[#202823]
                                    transition
                                "
                                data-status="Entregue"
                            >
                                ⚫ Entregue
                            </button>


                            <button
                                class="
                                    status-option
                                    w-full
                                    text-left
                                    px-4
                                    py-3
                                    hover:bg-[#202823]
                                    transition
                                "
                                data-status="Cancelada"
                            >
                                🔴 Cancelada
                            </button>

                        </div>

                    </div>

                </div>



                <!-- ================================= -->
                <!-- DIVISOR -->
                <!-- ================================= -->

                <div
                    class="
                        border-t
                        border-[#222B25]
                        my-5
                    "
                ></div>



                <!-- ================================= -->
                <!-- DADOS PRINCIPAIS -->
                <!-- ================================= -->

                <div class="space-y-4">


                    <!-- CLIENTE -->

                    <div
                        class="
                            flex
                            items-start
                            gap-3
                        "
                    >

                        <div
                            class="
                                w-9
                                h-9
                                shrink-0
                                rounded-xl
                                bg-white/[0.03]
                                border
                                border-[#29322C]
                                flex
                                items-center
                                justify-center
                                text-slate-400
                            "
                        >

                            <i
                                data-lucide="user-round"
                                class="w-4 h-4"
                            ></i>

                        </div>


                        <div class="min-w-0">

                            <p
                                class="
                                    text-xs
                                    uppercase
                                    tracking-widest
                                    text-slate-600
                                "
                            >
                                Cliente
                            </p>


                            <p
                                class="
                                    text-sm
                                    text-slate-200
                                    mt-1
                                    truncate
                                "
                            >
                                ${order.customer_name || "--"}
                            </p>

                        </div>

                    </div>



                    <!-- APARELHO -->

                    <div
                        class="
                            flex
                            items-start
                            gap-3
                        "
                    >

                        <div
                            class="
                                w-9
                                h-9
                                shrink-0
                                rounded-xl
                                bg-white/[0.03]
                                border
                                border-[#29322C]
                                flex
                                items-center
                                justify-center
                                text-slate-400
                            "
                        >

                            <i
                                data-lucide="smartphone"
                                class="w-4 h-4"
                            ></i>

                        </div>


                        <div class="min-w-0">

                            <p
                                class="
                                    text-xs
                                    uppercase
                                    tracking-widest
                                    text-slate-600
                                "
                            >
                                Aparelho
                            </p>


                            <p
                                class="
                                    text-sm
                                    text-slate-200
                                    mt-1
                                "
                            >
                                ${order.brand || "--"}
                                ${order.model || ""}
                            </p>

                        </div>

                    </div>



                    <!-- TÉCNICO -->

                    <div
                        class="
                            flex
                            items-start
                            gap-3
                        "
                    >

                        <div
                            class="
                                w-9
                                h-9
                                shrink-0
                                rounded-xl
                                bg-white/[0.03]
                                border
                                border-[#29322C]
                                flex
                                items-center
                                justify-center
                                text-slate-400
                            "
                        >

                            <i
                                data-lucide="wrench"
                                class="w-4 h-4"
                            ></i>

                        </div>


                        <div class="min-w-0">

                            <p
                                class="
                                    text-xs
                                    uppercase
                                    tracking-widest
                                    text-slate-600
                                "
                            >
                                Técnico
                            </p>


                            <p
                                class="
                                    text-sm
                                    text-slate-200
                                    mt-1
                                "
                            >
                                ${order.technician || "--"}
                            </p>

                        </div>

                    </div>



                    <!-- LOJA PARA CEO -->

                    ${
                        isCEO
                            ? `
                                <div
                                    class="
                                        flex
                                        items-start
                                        gap-3
                                    "
                                >

                                    <div
                                        class="
                                            w-9
                                            h-9
                                            shrink-0
                                            rounded-xl
                                            bg-white/[0.03]
                                            border
                                            border-[#29322C]
                                            flex
                                            items-center
                                            justify-center
                                            text-slate-400
                                        "
                                    >

                                        <i
                                            data-lucide="store"
                                            class="w-4 h-4"
                                        ></i>

                                    </div>


                                    <div class="min-w-0">

                                        <p
                                            class="
                                                text-xs
                                                uppercase
                                                tracking-widest
                                                text-slate-600
                                            "
                                        >
                                            Loja
                                        </p>


                                        <p
                                            class="
                                                text-sm
                                                text-slate-200
                                                mt-1
                                            "
                                        >
                                            ${order.stores?.name || "--"}
                                        </p>

                                    </div>

                                </div>
                            `
                            : ""
                    }


                </div>



                <!-- ================================= -->
                <!-- SERVIÇOS -->
                <!-- ================================= -->

                <div
                    class="
                        mt-6
                        rounded-2xl
                        bg-[#0B0F0C]
                        border
                        border-[#222B25]
                        p-4
                    "
                >

                    <div
                        class="
                            flex
                            items-center
                            justify-between
                            gap-4
                            mb-3
                        "
                    >

                        <div
                            class="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <i
                                data-lucide="wrench"
                                class="
                                    w-4
                                    h-4
                                    text-green-400
                                "
                            ></i>


                            <span
                                class="
                                    text-sm
                                    font-semibold
                                "
                            >
                                Serviços
                            </span>

                        </div>


                        <span
                            class="
                                text-xs
                                text-slate-600
                            "
                        >
                            ${
                                services.length
                            }
                            ${
                                services.length === 1
                                    ? "serviço"
                                    : "serviços"
                            }
                        </span>

                    </div>


                    ${
                        services.length
                            ? services
                                .map(
                                    item => `
                                        <div
                                            class="
                                                flex
                                                items-center
                                                justify-between
                                                gap-4
                                                py-2
                                                border-t
                                                border-[#1B221E]
                                                first:border-t-0
                                            "
                                        >

                                            <span
                                                class="
                                                    text-sm
                                                    text-slate-300
                                                    truncate
                                                "
                                            >
                                                ${item.service_name}
                                            </span>


                                            <span
                                                class="
                                                    text-sm
                                                    text-green-400
                                                    font-semibold
                                                    whitespace-nowrap
                                                "
                                            >
                                                ${formatCurrency(
                                                    item.unit_price
                                                )}
                                            </span>

                                        </div>
                                    `
                                )
                                .join("")
                            : `
                                <p
                                    class="
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    ${order.service || "--"}
                                </p>
                            `
                    }

                </div>



                <!-- ================================= -->
                <!-- RODAPÉ -->
                <!-- ================================= -->

                <div
                    class="
                        flex
                        items-end
                        justify-between
                        gap-4
                        mt-6
                    "
                >

                    <div>

                        <p
                            class="
                                text-xs
                                uppercase
                                tracking-widest
                                text-slate-600
                            "
                        >
                            Registrada em
                        </p>


                        <p
                            class="
                                text-sm
                                text-slate-400
                                mt-1
                            "
                        >
                            ${formatDate(
                                order.created_at
                            )}
                        </p>

                    </div>


                    <div class="text-right">

                        <p
                            class="
                                text-xs
                                uppercase
                                tracking-widest
                                text-slate-600
                            "
                        >
                            Valor total
                        </p>


                        <p
                            class="
                                text-2xl
                                md:text-3xl
                                font-black
                                text-green-400
                                mt-1
                            "
                        >
                            ${formatCurrency(total)}
                        </p>

                    </div>

                </div>



                <!-- ================================= -->
                <!-- AÇÕES -->
                <!-- ================================= -->

                <div
                    class="
                        grid
                        grid-cols-2
                        gap-2
                        mt-6
                    "
                >

                    <button
                        class="
                            view-order
                            w-full
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            bg-[#18211B]
                            hover:bg-[#203126]
                            border
                            border-[#29322C]
                            hover:border-green-500/30
                            py-3
                            rounded-2xl
                            transition
                            font-medium
                        "
                        data-id="${order.id}"
                    >

                        <i
                            data-lucide="eye"
                            class="w-4 h-4"
                        ></i>

                        Ver

                    </button>


                    <button
                        class="
                            edit-order
                            w-full
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            bg-[#18211B]
                            hover:bg-[#203126]
                            border
                            border-[#29322C]
                            hover:border-green-500/30
                            py-3
                            rounded-2xl
                            transition
                            font-medium
                        "
                        data-id="${order.id}"
                    >

                        <i
                            data-lucide="pencil"
                            class="w-4 h-4"
                        ></i>

                        Editar

                    </button>


                    <button
                        class="
                            print-order
                            w-full
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            bg-[#18211B]
                            hover:bg-[#203126]
                            border
                            border-[#29322C]
                            hover:border-green-500/30
                            py-3
                            rounded-2xl
                            transition
                            font-medium
                        "
                        data-id="${order.id}"
                    >

                        <i
                            data-lucide="printer"
                            class="w-4 h-4"
                        ></i>

                        Imprimir

                    </button>


                    <button
                        class="
                            delete-order
                            w-full
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            bg-red-500/5
                            hover:bg-red-500/10
                            border
                            border-red-500/10
                            hover:border-red-500/25
                            text-red-400
                            py-3
                            rounded-2xl
                            transition
                            font-medium
                        "
                        data-id="${order.id}"
                    >

                        <i
                            data-lucide="trash-2"
                            class="w-4 h-4"
                        ></i>

                        Excluir

                    </button>

                </div>

            </article>

        `;

    });


    // =========================================
    // ÍCONES
    // =========================================

    if (window.lucide) {

        lucide.createIcons();

    }


    // =========================================
    // VER
    // =========================================

    document
        .querySelectorAll(".view-order")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `details.html?id=${button.dataset.id}`;

                }
            );

        });


    // =========================================
    // EDITAR
    // =========================================

    document
        .querySelectorAll(".edit-order")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `create.html?id=${button.dataset.id}`;

                }
            );

        });


    // =========================================
    // IMPRIMIR
    // =========================================

    document
        .querySelectorAll(".print-order")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    window.open(
                        `print.html?id=${button.dataset.id}`,
                        "_blank"
                    );

                }
            );

        });


    // =========================================
    // EXCLUIR
    // =========================================

    document
        .querySelectorAll(".delete-order")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    orderToDelete =
                        button.dataset.id;


                    const order =
                        serviceOrders.find(
                            os =>
                                os.id ===
                                orderToDelete
                        );


                    document
                        .getElementById(
                            "deleteText"
                        )
                        .innerHTML = `

                            Tem certeza que deseja excluir a
                            <br><br>

                            <strong>
                                OS #${formatOsNumber(
                                    order.os_number
                                )}
                            </strong>

                            <br><br>

                            Esta ação não poderá ser desfeita.

                        `;


                    document
                        .getElementById(
                            "deleteModal"
                        )
                        .classList.remove(
                            "hidden"
                        );


                    document
                        .getElementById(
                            "deleteModal"
                        )
                        .classList.add(
                            "flex"
                        );

                }
            );

        });


    // =========================================
    // ALTERAR STATUS
    // =========================================

    document
        .querySelectorAll(".change-status")
        .forEach(button => {

            button.addEventListener(
                "click",
                e => {

                    e.stopPropagation();


                    document
                        .querySelectorAll(
                            ".status-dropdown"
                        )
                        .forEach(menu => {

                            if (
                                menu !==
                                button.nextElementSibling
                            ) {

                                menu.classList.add(
                                    "hidden"
                                );

                            }

                        });


                    const dropdown =
                        button.nextElementSibling;


                    if (dropdown) {

                        dropdown.classList.toggle(
                            "hidden"
                        );

                    }

                }
            );

        });


    document
        .querySelectorAll(".status-option")
        .forEach(option => {

            option.addEventListener(
                "click",
                async e => {

                    e.stopPropagation();


                    const dropdown =
                        option.closest(
                            ".status-dropdown"
                        );


                    const button =
                        dropdown.previousElementSibling;


                    try {

                        await Api.updateServiceOrderStatus(
                            button.dataset.id,
                            option.dataset.status
                        );


                        await loadServiceOrders(
                            appContext
                        );

                    }

                    catch (error) {

                        console.error(
                            error
                        );

                        alert(
                            error.message
                        );

                    }

                }
            );

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

    console.log("Filtro:", status);

    console.log(
        "Status da primeira OS:",
        serviceOrders[0]?.status
    );

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
