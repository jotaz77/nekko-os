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
    const backButton = document.getElementById("backButton");
    if (backButton) backButton.addEventListener("click", () => window.history.back());

    const editButton = document.getElementById("editButton");
    if (editButton) editButton.addEventListener("click", () => {
        window.location.href = `edit.html?id=${order.id}`;
    });

    const whatsappButton = document.getElementById("whatsappButton");
    if (whatsappButton) whatsappButton.addEventListener("click", () => {
        const phone = normalizePhone(order.customer_phone || "");
        if (!phone) { alert("O cliente não possui um telefone válido cadastrado."); return; }
        const message = buildWhatsAppMessage();
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, "_blank");
    });

    const printButton = document.getElementById("printButton");
    if (printButton) printButton.addEventListener("click", () => {
        window.open(`print.html?id=${order.id}`, "_blank");
    });

    const guaranteeButton = document.getElementById("guaranteeButton");
    if (guaranteeButton) {
        const isReady = String(order.status || "").trim().toLowerCase() === "pronta";
        if (isReady) {
            guaranteeButton.classList.remove("hidden");
            guaranteeButton.addEventListener("click", openGuaranteeModal);
        } else {
            guaranteeButton.classList.add("hidden");
        }
    }

    setupGuaranteeModal();
}
// ======================================================
// MODAL DE GARANTIA
// ======================================================

const WARRANTY_ESTIMATES = {
    screen: { label: "90 dias", days: 90 },
    premiumBattery: { label: "1 ano", days: 365 },
    parallelBattery: { label: "90 dias", days: 90 },
    board: { label: "Sem garantia", days: 0 },
    component: { label: "90 dias", days: 90 },
    default: { label: "90 dias", days: 90 }
};

function setupGuaranteeModal() {
    const modal = document.getElementById("guaranteeModal");
    if (!modal) return;

    document.getElementById("closeGuaranteeModal")?.addEventListener("click", closeGuaranteeModal);
    document.getElementById("guaranteePrintButton")?.addEventListener("click", printStandardGuarantee);
    document.getElementById("guaranteeEditButton")?.addEventListener("click", () => {
        populateGuaranteeModal(true);
        showGuaranteeStep("edit");
    });
    document.getElementById("guaranteeBackButton")?.addEventListener("click", () => showGuaranteeStep("choice"));
    document.getElementById("guaranteeEditPrintButton")?.addEventListener("click", printEditedGuarantee);

    const checkbox = document.getElementById("guaranteeChangeCheckbox");
    checkbox?.addEventListener("change", () => {
        const options = document.getElementById("guaranteeCustomOptions");
        if (!options) return;
        options.classList.toggle("hidden", !checkbox.checked);
        if (checkbox.checked) {
            const first = document.querySelector('input[name="guaranteeCustomDays"][value="30"]');
            if (first) first.checked = true;
        } else {
            document.querySelectorAll('input[name="guaranteeCustomDays"]').forEach(input => input.checked = false);
        }
    });

    modal.addEventListener("click", event => {
        if (event.target === modal) closeGuaranteeModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.classList.contains("hidden")) closeGuaranteeModal();
    });
}

function openGuaranteeModal() {
    populateGuaranteeModal(false);
    showGuaranteeStep("choice");
    const modal = document.getElementById("guaranteeModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (window.lucide) lucide.createIcons();
}

function closeGuaranteeModal() {
    const modal = document.getElementById("guaranteeModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function showGuaranteeStep(step) {
    const choice = document.getElementById("guaranteeChoiceStep");
    const edit = document.getElementById("guaranteeEditStep");
    const title = document.getElementById("guaranteeModalTitle");
    const subtitle = document.getElementById("guaranteeModalSubtitle");
    if (!choice || !edit) return;

    const isEdit = step === "edit";
    choice.classList.toggle("hidden", isEdit);
    edit.classList.toggle("hidden", !isEdit);
    title.textContent = isEdit ? "Editar e imprimir garantia" : "Como deseja emitir a garantia?";
    subtitle.textContent = isEdit
        ? "Os dados da OS são somente leitura. Você pode alterar apenas o prazo desta nota."
        : "Escolha o procedimento para esta OS pronta.";
    if (window.lucide) lucide.createIcons();
}

function populateGuaranteeModal(editStep = false) {
    const items = getGuaranteeServiceItems();
    const summary = buildGuaranteeSummary(items);
    const orderNumber = formatOsNumber(order?.os_number);
    const serviceText = summary.serviceText;
    const valueText = formatCurrencyValue(summary.total);
    const estimateHtml = summary.estimateHtml;

    setText("guaranteeOrderLabel", `OS #${orderNumber}`);
    setText("guaranteeChoiceService", serviceText);
    setText("guaranteeChoiceValue", valueText);
    const choiceEstimate = document.getElementById("guaranteeChoiceEstimate");
    if (choiceEstimate) choiceEstimate.innerHTML = estimateHtml;

    setText("guaranteeEditService", serviceText);
    setText("guaranteeEditValue", valueText);
    const editEstimate = document.getElementById("guaranteeEditEstimate");
    if (editEstimate) editEstimate.innerHTML = estimateHtml;
    const preview = document.getElementById("guaranteeEditPreview");
    if (preview) preview.innerHTML = summary.previewHtml;

    const checkbox = document.getElementById("guaranteeChangeCheckbox");
    const options = document.getElementById("guaranteeCustomOptions");
    if (checkbox) checkbox.checked = false;
    if (options) options.classList.add("hidden");
    document.querySelectorAll('input[name="guaranteeCustomDays"]').forEach(input => input.checked = false);

    if (editStep) showGuaranteeStep("edit");
}

function getGuaranteeServiceItems() {
    const items = Array.isArray(order?.service_order_items) ? order.service_order_items : [];
    if (items.length) {
        return items.map(item => ({
            name: item.service_name || item.service || item.name || "Serviço",
            price: Number(item.unit_price ?? item.price ?? 0)
        }));
    }
    if (order?.service) return [{ name: order.service, price: Number(order.price ?? 0) }];
    return [];
}

function classifyGuaranteeService(serviceName) {
    const text = normalizeGuaranteeText(serviceName);
    const hasBattery = text.includes("bateria");
    const hasPremium = text.includes("premium");
    const hasParallel = text.includes("paralela") || text.includes("paralelo");
    const hasScreen = text.includes("tela") || text.includes("display") || text.includes("lcd");
    const hasReplacement = text.includes("troca") || text.includes("substituicao") || text.includes("substituir");
    const hasBoard = text.includes("placa") || text.includes("memoria") || text.includes("cpu");
    const hasBoardRepair = text.includes("reparo") || text.includes("conserto") || text.includes("manutencao");

    if (hasBattery && hasPremium) return "premiumBattery";
    if (hasBattery && hasParallel) return "parallelBattery";
    if (hasScreen && hasReplacement) return "screen";
    if (hasBoard && hasBoardRepair) return "board";
    if (hasReplacement) return "component";
    return "default";
}

function normalizeGuaranteeText(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function getGuaranteeEstimate(serviceName) {
    return WARRANTY_ESTIMATES[classifyGuaranteeService(serviceName)] || WARRANTY_ESTIMATES.default;
}

function buildGuaranteeSummary(items) {
    const safeItems = items.length ? items : [{ name: "Serviço não informado", price: Number(order?.price || 0) }];
    const total = safeItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const unique = [];
    safeItems.forEach(item => {
        const estimate = getGuaranteeEstimate(item.name);
        const key = `${item.name}|${estimate.label}`;
        if (!unique.some(x => x.key === key)) unique.push({ key, name: item.name, estimate });
    });

    const serviceText = safeItems.map(item => item.name).join(" • ");
    const estimateHtml = unique.map(item => `${escapeHtml(item.name)}: <strong>${escapeHtml(item.estimate.label)}</strong>`).join("<br>");
    const previewHtml = unique.length === 1
        ? `O sistema identificou <strong class="text-zinc-300">${escapeHtml(unique[0].name)}</strong> e aplicará <strong class="text-emerald-400">${escapeHtml(unique[0].estimate.label)}</strong> no procedimento padrão.`
        : unique.map(item => `• ${escapeHtml(item.name)} — <strong class="text-emerald-400">${escapeHtml(item.estimate.label)}</strong>`).join("<br>");

    return { serviceText, total, estimateHtml, previewHtml };
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCurrencyValue(value) {
    return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function printStandardGuarantee() {
    if (!order?.id) return;
    window.open(`garantia.html?id=${encodeURIComponent(order.id)}`, "_blank");
    closeGuaranteeModal();
}

function printEditedGuarantee() {
    if (!order?.id) return;
    const checkbox = document.getElementById("guaranteeChangeCheckbox");
    const selected = document.querySelector('input[name="guaranteeCustomDays"]:checked');

    if (checkbox?.checked && !selected) {
        alert("Selecione 1 mês ou 2 meses para alterar o prazo de garantia.");
        return;
    }

    const params = new URLSearchParams({ id: order.id });
    if (checkbox?.checked && selected) params.set("warranty_days", selected.value);

    window.open(`garantia.html?${params.toString()}`, "_blank");
    closeGuaranteeModal();
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
// SERVIÇOS DA OS
// ======================================================

function renderServiceItems() {

    const container =
        document.getElementById(
            "serviceItemsList"
        );


    const totalElement =
        document.getElementById(
            "servicePrice"
        );


    if (!container || !totalElement)
        return;


    const items =
        order.service_order_items || [];


    // ---------------------------------
    // OS antiga sem itens
    // ---------------------------------

    if (!items.length) {

        container.innerHTML = `

            <p class="text-zinc-400">
                ${order.service || "Não informado"}
            </p>

        `;


        totalElement.textContent =
            formatCurrency(
                order.price
            );

        return;

    }


    // ---------------------------------
    // Serviços
    // ---------------------------------

    container.innerHTML =
        items
            .map(
                item => `

                    <div
                        class="
                            flex
                            items-center
                            justify-between
                            gap-4
                            py-2
                        "
                    >

                        <span
                            class="
                                text-zinc-300
                            "
                        >
                            ${item.service_name}
                        </span>


                        <span
                            class="
                                text-emerald-400
                                font-medium
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
            .join("");


    // ---------------------------------
    // Total
    // ---------------------------------

    const total =
        items.reduce(
            (sum, item) => {

                return sum +
                    Number(
                        item.unit_price || 0
                    );

            },
            0
        );


    totalElement.textContent =
        formatCurrency(total);

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

        case "Aguardando aprovação":

            badge.classList.add(
                "bg-purple-500/15",
                "text-purple-400"
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
