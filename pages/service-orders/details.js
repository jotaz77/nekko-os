// ======================================================
// NEKKO OS
// Detalhes da Ordem de Serviço
// ======================================================

let context = null;
let order = null;

// ======================================================
// Inicialização
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const result = await Bootstrap.init();

        context = result.context;

        const id = new URLSearchParams(window.location.search).get("id");

        if (!id) {

            alert("Ordem de serviço não encontrada.");

            window.location.href = "index.html";

            return;

        }

        order = await Api.getServiceOrder(id);

        if (!order) {
        
            alert("Ordem de serviço não encontrada.");
        
            window.location.href = "index.html";
        
            return;
        
        }
        
        order.service_order_items =
            await Api.getServiceOrderItems(id);

        console.log(
            "SERVIÇOS DA OS:",
            order.service_order_items
        );
        
        renderOrder();
        
        setupEvents();

    }

    catch (error) {

        console.error(error);

        alert("Erro ao carregar a ordem de serviço.");

    }

});

// ======================================================
// Eventos
// ======================================================

function setupEvents() {

    document
        .getElementById("backButton")
        .addEventListener("click", () => {

            window.location.href = "index.html";

        });

    document
        .getElementById("editButton")
        .addEventListener("click", () => {

            window.location.href =
                `create.html?id=${order.id}`;

        });



    document
        .getElementById("whatsappButton")
        .addEventListener("click", () => {

            openWhatsApp();

        });


    document
    .getElementById("printButton")
    .addEventListener("click", () => {

        window.open(
            `print.html?id=${order.id}`,
            "_blank"
        );

    });

}
// ======================================================
// Renderização
// ======================================================

function renderOrder() {

    // RESUMO

    setText(
        "osNumber",
        `OS #${formatOsNumber(order.os_number)}`
    );

    setText(
        "deviceName",
        `${order.brand ?? ""} ${order.model ?? ""}`.trim()
    );

    setText(
        "customerName",
        order.customer_name
    );

    setText(
        "customerPhoneHeader",
        order.customer_phone
    );

    // ==================================================
    // CLIENTE
    // ==================================================

    setText(
        "clientFullName",
        order.customer_name
    );

    setText(
        "clientPhone",
        order.customer_phone
    );

    setText(
        "clientCpf",
        order.customer_cpf
    );

    setText(
        "clientCep",
        order.customer_cep
    );

    // ==================================================
    // ENDEREÇO
    // ==================================================
    
    setText(
        "addressCep",
        order.customer_cep
    );
    
    setText(
        "addressStreet",
        order.customer_address
    );
    
    setText(
        "addressNumber",
        order.customer_number
    );
    
    setText(
        "addressNeighborhood",
        order.customer_neighborhood
    );
    
    setText(
        "addressCity",
        order.customer_city
    );
    
    setText(
        "addressState",
        order.customer_state
    );
    
    setText(
        "addressComplement",
        order.customer_complement
    );

    // ==================================================
    // APARELHO
    // ==================================================

    setText(
        "deviceBrand",
        order.brand
    );

    setText(
        "deviceModel",
        order.model
    );

    setText(
        "deviceImei",
        order.imei
    );

    setText(
        "deviceType",
        order.device_type
    );

    setText(
        "deviceLockType",
        getLockType(order.lock_type)
    );

    setText(
        "deviceLockValue",
        getLockValue(order)
    );

    setText(
        "deviceLockType",
        getLockType(order.lock_type)
    );

    setText(
        "deviceLockValue",
        getLockValue(order)
    );

    // ==================================================
    // SERVIÇO
    // ==================================================

    setText(
        "reportedProblem",
        order.problem || order.reported_issue
    );

    renderServiceItems();

    setText(
        "technicianName",
        order.technician
    );

    setText(
        "servicePrice",
        formatCurrency(order.price)
    );

    // ==================================================
    // OBSERVAÇÕES
    // ==================================================

    setText(
        "observations",
        order.notes || order.observations
    );

    updateStatusBadge(order.status);

}

// ======================================================
// Badge
// ======================================================

function updateStatusBadge(status) {

    const badge =
        document.getElementById("statusBadge");

    badge.className =
        "inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold";

    switch (status) {

        case "Aberta":

            badge.classList.add(
                "bg-blue-500/15",
                "text-blue-400"
            );

            break;

        case "Aguardando peça":

            badge.classList.add(
                "bg-yellow-500/15",
                "text-yellow-400"
            );

            break;

        case "Em manutenção":

            badge.classList.add(
                "bg-orange-500/15",
                "text-orange-400"
            );

            break;

        case "Pronta":

            badge.classList.add(
                "bg-green-500/15",
                "text-green-400"
            );

            break;

        case "Entregue":

            badge.classList.add(
                "bg-zinc-500/15",
                "text-zinc-300"
            );

            break;

        case "Cancelada":

            badge.classList.add(
                "bg-red-500/15",
                "text-red-400"
            );

            break;

    }

    badge.innerHTML = `
        <div class="w-2 h-2 rounded-full bg-current"></div>
        ${status}
    `;

}



// ======================================================
// WhatsApp
// ======================================================

function openWhatsApp() {

    if (!order.customer_phone) {

        alert("Cliente não possui telefone cadastrado.");

        return;

    }

    const phone = order.customer_phone.replace(/\D/g, "");

    const message = `Olá ${order.customer_name}!

Estamos entrando em contato sobre sua Ordem de Serviço *#${formatOsNumber(order.os_number)}*.

📱 Aparelho:
${order.brand} ${order.model}

🔧 Serviço:
${order.service}

📌 Status:
${order.status}

Equipe de contato`;

    const url =
        `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

}


// ======================================================
// Helpers
// ======================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element)
        return;

    element.textContent =
        value || "Não informado";

}

function formatCurrency(value) {

    if (value === null || value === undefined)
        return "Não informado";

    return Number(value).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}

function formatOsNumber(number) {

    return String(number)
        .padStart(6, "0");

}

function getLockType(type) {

    switch (type) {

        case "pin":
            return "PIN";

        case "password":
            return "Senha";

        case "pattern":
            return "Desenho";

        case "none":
            return "Sem bloqueio";

        default:
            return "Sem bloqueio";

    }

}

function getLockValue(order) {

    switch (order.lock_type) {

        case "pin":
            return order.lock_pin || "Não informado";

        case "password":
            return order.lock_password || "Não informado";

        case "pattern":
            return "Desenho configurado";

        default:
            return "—";

    }

}
