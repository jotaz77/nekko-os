lucide.createIcons();

document.addEventListener("DOMContentLoaded", async () => {

    const result = await Bootstrap.init();

    console.log("Bootstrap:", result);

    if (result.status !== "READY") {

        alert("Sessão inválida.");

        window.location.href = "../login/index.html";

        return;

    }

    context = result.context;
    await loadTechnicians();

    editingId = new URLSearchParams(window.location.search).get("id");

    isEditing = !!editingId;

    if (isEditing) {

        await loadServiceOrder();

        document.title = "Editar Ordem de Serviço • Nekko OS";

        document.querySelector("h1").textContent =
            "Editar Ordem de Serviço";

        document.querySelector("p").textContent =
            "Atualize as informações da Ordem de Serviço.";

        document.getElementById("btnCreate").textContent =
            "Salvar Alterações";

    }
});
// =========================================
// ELEMENTOS
// =========================================

const form = document.getElementById("serviceOrderForm");

const lockType = document.getElementById("lockType");
const lockField = document.getElementById("lockField");
const patternContainer = document.getElementById("patternContainer");

const priceInput = document.getElementById("price");
const cpfInput = document.getElementById("customerCpf");
const cepInput = document.getElementById("customerCep");
const phoneInput = document.getElementById("customerPhone");

const serviceInput =
    document.getElementById("service");

const servicePriceInput =
    document.getElementById("price");

const addServiceItemButton =
    document.getElementById("addServiceItem");

const serviceItemsContainer =
    document.getElementById("serviceItemsContainer");

const serviceItemsList =
    document.getElementById("serviceItemsList");

const serviceItemsCount =
    document.getElementById("serviceItemsCount");

const serviceTotal =
    document.getElementById("serviceTotal");


// =========================================
// CONTEXTO DA SESSÃO
// =========================================

let context = null;
let editingId = null;
let isEditing = false;
let editingOrder = null;
let serviceItems = [];

let pattern = [];
let isDrawing = false;

// =========================================
// MÁSCARAS
// =========================================

function onlyNumbers(value) {

    return value.replace(/\D/g, "");

}

function maskCPF(value) {

    value = onlyNumbers(value);

    value = value.replace(/^(\d{3})(\d)/, "$1.$2");
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");

    return value.substring(0, 14);

}

function maskCEP(value) {

    value = onlyNumbers(value);

    value = value.replace(/^(\d{5})(\d)/, "$1-$2");

    return value.substring(0, 9);

}

function maskPhone(value) {

    value = onlyNumbers(value);

    value = value.replace(/^(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");

    return value;

}

function maskMoney(value) {

    value = onlyNumbers(value);

    value = (Number(value) / 100).toFixed(2);

    return value.replace(".", ",");

}

// =========================================
// EVENTOS DAS MÁSCARAS
// =========================================

cpfInput?.addEventListener("input", (e) => {

    e.target.value = maskCPF(e.target.value);

});

cepInput?.addEventListener("input", async (e) => {

    e.target.value = maskCEP(e.target.value);

    const cep = onlyNumbers(e.target.value);

    if (cep.length !== 8) {
        return;
    }

    await searchCEP(cep);

});

// =========================================
// BUSCAR CEP
// =========================================

async function searchCEP(cep) {

    try {

        const response = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        if (!response.ok) {
            throw new Error("Erro ao consultar o CEP.");
        }

        const data = await response.json();

        if (data.erro) {

            showMessage(
                "CEP não encontrado.",
                "error"
            );

            return;
        }

        document.getElementById("customerAddress").value =
            data.logradouro || "";

        document.getElementById("customerNeighborhood").value =
            data.bairro || "";

        document.getElementById("customerCity").value =
            data.localidade || "";

        document.getElementById("customerState").value =
            data.uf || "";

    }

    catch (error) {

        console.error(
            "Erro ao buscar CEP:",
            error
        );

        showMessage(
            "Não foi possível consultar o CEP.",
            "error"
        );

    }

}

phoneInput?.addEventListener("input", (e) => {

    e.target.value = maskPhone(e.target.value);

});

priceInput?.addEventListener("input", (e) => {

    e.target.value = maskMoney(e.target.value);

});

// =========================================
// ALTERAÇÃO DO BLOQUEIO
// =========================================

lockType.addEventListener("change", () => {

    pattern = [];

    lockField.innerHTML = "";

    patternContainer.innerHTML = "";

    patternContainer.classList.add("hidden");

    switch (lockType.value) {

        case "pin":

            lockField.innerHTML = `

                <input
                    id="devicePin"
                    type="text"
                    maxlength="12"
                    placeholder="Digite o PIN"
                    class="w-full bg-[#0F1411] border border-[#29322C] rounded-xl p-3 outline-none focus:border-green-500">

            `;

            break;

        case "password":

            lockField.innerHTML = `

                <input
                    id="devicePassword"
                    type="text"
                    placeholder="Digite a senha"
                    class="w-full bg-[#0F1411] border border-[#29322C] rounded-xl p-3 outline-none focus:border-green-500">

            `;

            break;

        case "pattern":

            createPattern();

            break;

    }

});

// =========================================
// COMPONENTE PADRÃO ANDROID
// =========================================

function createPattern() {

    patternContainer.classList.remove("hidden");

    patternContainer.innerHTML = `

        <div
            class="bg-[#0F1411]
            border
            border-[#29322C]
            rounded-2xl
            p-6">

            <div class="flex items-center justify-between mb-6">

                <h3 class="font-semibold">

                    Desenho de desbloqueio

                </h3>

                <button
                    id="clearPattern"
                    type="button"
                    class="text-green-500 hover:text-green-400">

                    Limpar

                </button>

            </div>

            <p class="text-slate-400 text-sm mb-6">

                Arraste o mouse ou toque nos pontos.

            </p>

            <div
                id="patternWrapper"
                class="relative w-[280px] h-[280px] mx-auto">

                <svg
                    id="patternSVG"
                    class="absolute inset-0 w-full h-full pointer-events-none">
                </svg>

                <div
                    id="patternGrid"
                    class="absolute inset-0 grid grid-cols-3 place-items-center">
                </div>

            </div>

        </div>

    `;

    buildPatternGrid();

}

// =========================================
// GRID DO DESENHO
// =========================================

function buildPatternGrid() {

    const grid = document.getElementById("patternGrid");
    const svg = document.getElementById("patternSVG");

    pattern = [];

    grid.innerHTML = "";
    svg.innerHTML = "";

    for (let i = 1; i <= 9; i++) {

        const point = document.createElement("div");

        point.dataset.id = i;

        point.className = `
            w-14
            h-14
            rounded-full
            border-2
            border-green-500
            bg-[#141A16]
            cursor-pointer
            flex
            items-center
            justify-center
            font-bold
            text-white
            transition
            hover:scale-110
            select-none
        `;

        point.addEventListener("mousedown", startDraw);
        point.addEventListener("mouseenter", continueDraw);
        point.addEventListener("touchstart", touchDraw);

        grid.appendChild(point);

    }

    document.addEventListener("mouseup", stopDraw);
    document.addEventListener("touchend", stopDraw);

    document
        .getElementById("clearPattern")
        .addEventListener("click", buildPatternGrid);

}

// =========================================
// DESENHO
// =========================================

function startDraw(event) {

    isDrawing = true;

    addPoint(event.target);

}

function continueDraw(event) {

    if (!isDrawing)
        return;

    addPoint(event.target);

}

function touchDraw(event) {

    addPoint(event.target);

}

function stopDraw() {

    isDrawing = false;

}

function addPoint(point) {

    const id = Number(point.dataset.id);

    if (pattern.includes(id))
        return;

    pattern.push(id);

    point.classList.remove("bg-[#141A16]");

    point.classList.add(
        "bg-green-500",
        "text-black"
    );

    point.innerHTML = pattern.length;

    drawLines();

}

// =========================================
// LINHAS SVG
// =========================================

function drawLines() {

    const svg = document.getElementById("patternSVG");

    if (!svg)
        return;

    svg.innerHTML = "";

    if (pattern.length < 2)
        return;

    for (let i = 1; i < pattern.length; i++) {

        const from = getCenter(pattern[i - 1]);
        const to = getCenter(pattern[i]);

        const line = document.createElementNS(

            "http://www.w3.org/2000/svg",
            "line"

        );

        line.setAttribute("x1", from.x);
        line.setAttribute("y1", from.y);

        line.setAttribute("x2", to.x);
        line.setAttribute("y2", to.y);

        line.setAttribute("stroke", "#22C55E");
        line.setAttribute("stroke-width", "6");
        line.setAttribute("stroke-linecap", "round");

        svg.appendChild(line);

    }

}

function getCenter(id) {

    const point = document.querySelector(`[data-id="${id}"]`);

    const wrapper = document
        .getElementById("patternWrapper")
        .getBoundingClientRect();

    const rect = point.getBoundingClientRect();

    return {

        x: rect.left - wrapper.left + (rect.width / 2),

        y: rect.top - wrapper.top + (rect.height / 2)

    };

}

// =========================================
// CARREGAR TÉCNICOS
// =========================================

async function loadTechnicians() {

    try {

        const technicians =
            await Api.getTechniciansByStore(

                context.company.id,

                context.store?.id

            );

        const select =
            document.getElementById("technician");

        select.innerHTML = `

            <option value="">

                Selecionar técnico

            </option>

        `;

        technicians.forEach(tech => {

            select.innerHTML += `

                <option value="${tech.name}">

                    ${tech.name}

                </option>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

// =========================================
// SERVIÇOS CUMULATIVOS
// =========================================

function parseServicePrice(value) {

    return Number(
        String(value || "0")
            .replace(/\./g, "")
            .replace(",", ".")
    ) || 0;

}


function formatServiceCurrency(value) {

    return Number(value || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function renderServiceItems() {

    if (!serviceItemsList)
        return;


    serviceItemsList.innerHTML = "";


    if (!serviceItems.length) {

        serviceItemsContainer
            ?.classList.add("hidden");

        serviceItemsCount.textContent =
            "0 serviços";

        serviceTotal.textContent =
            "R$ 0,00";

        return;

    }


    serviceItemsContainer
        ?.classList.remove("hidden");


    serviceItemsCount.textContent =
        `${serviceItems.length} ${
            serviceItems.length === 1
                ? "serviço"
                : "serviços"
        }`;


    let total = 0;


    serviceItems.forEach(
        (item, index) => {

            total += Number(
                item.unit_price || 0
            );


            serviceItemsList.innerHTML += `

                <div
                    class="
                        flex
                        items-center
                        justify-between
                        gap-4
                        bg-[#0F1411]
                        border
                        border-[#29322C]
                        rounded-2xl
                        px-4
                        py-4
                    "
                >

                    <div class="min-w-0">

                        <p
                            class="
                                font-medium
                                text-white
                                truncate
                            "
                        >
                            ${item.service_name}
                        </p>

                        <p
                            class="
                                text-xs
                                text-slate-500
                                mt-1
                            "
                        >
                            Serviço ${index + 1}
                        </p>

                    </div>


                    <div
                        class="
                            flex
                            items-center
                            gap-3
                            shrink-0
                        "
                    >

                        <strong
                            class="
                                text-green-400
                            "
                        >
                            ${formatServiceCurrency(
                                item.unit_price
                            )}
                        </strong>


                        <button
                            type="button"
                            class="
                                w-9
                                h-9
                                rounded-xl
                                border
                                border-red-500/20
                                bg-red-500/5
                                text-red-400
                                hover:bg-red-500/10
                                transition
                                flex
                                items-center
                                justify-center
                            "
                            data-service-index="${index}"
                            title="Remover serviço"
                        >

                            <i
                                data-lucide="trash-2"
                                class="w-4 h-4"
                            ></i>

                        </button>

                    </div>

                </div>

            `;

        }
    );


    serviceTotal.textContent =
        formatServiceCurrency(total);


    lucide.createIcons();

}


function addServiceItem() {

    const serviceName =
        serviceInput?.value.trim();


    const price =
        parseServicePrice(
            servicePriceInput?.value
        );


    if (!serviceName) {

        showMessage(
            "Informe o serviço.",
            "error"
        );

        serviceInput?.focus();

        return;

    }


    if (price <= 0) {

        showMessage(
            "Informe um valor válido para o serviço.",
            "error"
        );

        servicePriceInput?.focus();

        return;

    }


    serviceItems.push({

        service_name:
            serviceName,

        unit_price:
            price

    });


    serviceInput.value = "";

    servicePriceInput.value = "";

    serviceInput.focus();


    renderServiceItems();

}


function removeServiceItem(index) {

    serviceItems.splice(
        index,
        1
    );


    renderServiceItems();

}

addServiceItemButton?.addEventListener(
    "click",
    addServiceItem
);

serviceItemsList?.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                "[data-service-index]"
            );


        if (!button)
            return;


        const index =
            Number(
                button.dataset.serviceIndex
            );


        removeServiceItem(index);

    }
);

// =========================================
// VALIDAÇÃO
// =========================================

function validateForm() {

    const requiredFields = [

        {
            id: "customerName",
            label: "Nome do cliente"
        },
    
        {
            id: "deviceType",
            label: "Tipo de dispositivo"
        },
    
        {
            id: "brand",
            label: "Marca"
        },
    
        {
            id: "model",
            label: "Modelo"
        },
    
        {
            id: "problem",
            label: "Defeito relatado"
        },
    
        {
            id: "technician",
            label: "Técnico"
        }
    
    ];

    for (const field of requiredFields) {

        const input = document.getElementById(field.id);

        input.classList.remove("border-red-500");

        if (!input.value.trim()) {

            input.classList.add("border-red-500");

            showMessage(`${field.label} é obrigatório.`, "error");

            input.focus();

            return false;

        }

    }

    if (lockType.value === "pin") {

        const pin = document.getElementById("devicePin")?.value.trim();

        if (!pin) {

            showMessage("Informe o PIN do aparelho.", "error");

            return false;

        }

    }

    if (lockType.value === "password") {

        const password = document
            .getElementById("devicePassword")
            ?.value
            .trim();

        if (!password) {

            showMessage("Informe a senha do aparelho.", "error");

            return false;

        }

    }

    if (lockType.value === "pattern") {

        if (pattern.length < 4) {

            showMessage(
                "O desenho precisa conter pelo menos 4 pontos.",
                "error"
            );

            return false;

        }

    }

    return true;

}

// =========================================
// OBJETO DA ORDEM DE SERVIÇO
// =========================================

function buildServiceOrder() {

    return {

        company_id: context.company.id,

        store_id:

            context.store?.id ||
        
            editingOrder?.store_id ||
            null,

        user_id:

            context.user.id ||
        
            editingOrder?.user_id,

        customer_name: document
            .getElementById("customerName")
            .value
            .trim(),

        customer_cpf: document
            .getElementById("customerCpf")
            .value
            .trim() || null,

        customer_phone: document
            .getElementById("customerPhone")
            .value
            .trim() || null,

        customer_cep: document
            .getElementById("customerCep")
            .value
            .trim() || null,

        customer_address: document
            .getElementById("customerAddress")
            .value
            .trim() || null,
        
        customer_number: document
            .getElementById("customerNumber")
            .value
            .trim() || null,
        
        customer_neighborhood: document
            .getElementById("customerNeighborhood")
            .value
            .trim() || null,
        
        customer_city: document
            .getElementById("customerCity")
            .value
            .trim() || null,
        
        customer_state: document
            .getElementById("customerState")
            .value
            .trim() || null,
        
        customer_complement: document
            .getElementById("customerComplement")
            .value
            .trim() || null,

        device_type: document
            .getElementById("deviceType")
            .value,

        brand: document
            .getElementById("brand")
            .value
            .trim(),

        model: document
            .getElementById("model")
            .value
            .trim(),

        imei: document
            .getElementById("imei")
            .value
            .trim() || null,

        lock_type: lockType.value,

        lock_pin:
            document
                .getElementById("devicePin")
                ?.value
                ?.trim() || null,

        lock_password:
            document
                .getElementById("devicePassword")
                ?.value
                ?.trim() || null,

        lock_pattern:

            lockType.value === "pattern"

                ? pattern.join("-")

                : null,

        service: document
            .getElementById("service")
            .value
            .trim(),

        price:
            serviceItems.reduce(
                (total, item) => {
        
                    return total +
                        Number(
                            item.unit_price || 0
                        );
        
                },
                0
            ),

        reported_issue: document
            .getElementById("problem")
            .value
            .trim(),

        problem: document
            .getElementById("problem")
            .value
            .trim(),

        notes: document
            .getElementById("notes")
            .value
            .trim() || null,

        technician: document
            .getElementById("technician")
            .value,

        order_type: document
            .getElementById("orderType")
            .value,

        status: document
            .getElementById("status")
            .value

    };

}

async function loadServiceOrder() {

    editingOrder = await Api.getServiceOrder(editingId);

    const order = editingOrder;

    if (!order) {

        showMessage("Ordem de serviço não encontrada.", "error");

        window.location.href = "./index.html";

        return;

    }

    document.getElementById("customerName").value = order.customer_name ?? "";
    document.getElementById("customerCpf").value = order.customer_cpf ?? "";
    document.getElementById("customerCep").value = order.customer_cep ?? "";
    document.getElementById("customerPhone").value = order.customer_phone ?? "";

    document.getElementById("customerAddress").value =
        order.customer_address ?? "";

    document.getElementById("customerNumber").value =
        order.customer_number ?? "";
    
    document.getElementById("customerNeighborhood").value =
        order.customer_neighborhood ?? "";
    
    document.getElementById("customerCity").value =
        order.customer_city ?? "";
    
    document.getElementById("customerState").value =
        order.customer_state ?? "";
    
    document.getElementById("customerComplement").value =
        order.customer_complement ?? "";

    document.getElementById("deviceType").value = order.device_type ?? "";
    document.getElementById("brand").value = order.brand ?? "";
    document.getElementById("model").value = order.model ?? "";
    document.getElementById("imei").value = order.imei ?? "";

    document.getElementById("service").value = order.service ?? "";
    document.getElementById("price").value =
        Number(order.price ?? 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    
    document.getElementById("problem").value = order.problem ?? "";
    document.getElementById("notes").value = order.notes ?? "";

    document.getElementById("technician").value = order.technician ?? "";
    document.getElementById("orderType").value =
    order.order_type ?? "customer";
    document.getElementById("status").value = order.status ?? "Aberta";

    // Segurança

    lockType.value = order.lock_type ?? "";

    lockType.dispatchEvent(new Event("change"));

    if (order.lock_type === "pin") {

        const input = document.getElementById("devicePin");

        if (input)
            input.value = order.lock_pin ?? "";

    }

    if (order.lock_type === "password") {

        const input = document.getElementById("devicePassword");

        if (input)
            input.value = order.lock_password ?? "";

    }

    if (order.lock_type === "pattern") {

        pattern = order.lock_pattern
            ? order.lock_pattern.split("-").map(Number)
            : [];

        drawLines();

    }

}


// =========================================
// LOADING
// =========================================

function setLoading() {

    setButtonLoading(
        "btnCreate",
        "Salvando Ordem..."
    );

}

function resetLoading() {

    resetButton("btnCreate");

}

// =========================================
// LIMPAR FORMULÁRIO
// =========================================

function clearForm() {

    form.reset();

    pattern = [];

    lockField.innerHTML = "";

    patternContainer.innerHTML = "";

    patternContainer.classList.add("hidden");

}

// =========================================
// SUBMIT
// =========================================

// =========================================
// UTILITÁRIOS
// =========================================

function showMessage(message, type = "success") {

    alert(message);

}

function setButtonLoading(buttonId, text) {

    const button = document.getElementById(buttonId);

    if (!button) return;

    button.disabled = true;

    button.dataset.originalText = button.innerHTML;

    button.innerHTML = text;

}

function resetButton(buttonId) {

    const button = document.getElementById(buttonId);

    if (!button) return;

    button.disabled = false;

    if (button.dataset.originalText) {

        button.innerHTML = button.dataset.originalText;

    }

}

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    setLoading();

    try {

        // =====================================
        // VERIFICA CONTEXTO
        // =====================================
        
        if (!context?.company?.id) {
        
            throw new Error(
                "Empresa não encontrada. Faça login novamente."
            );
        
        }

        // =====================================
        // USUÁRIO LOGADO
        // =====================================

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();

        if (authError)
            throw authError;

        if (!user) {

            window.location.href = "../login/index.html";
            return;

        }

        // =====================================
        // MONTA OBJETO
        // =====================================

        const serviceOrder = buildServiceOrder();

        serviceOrder.created_by = user.id;

        // =====================================
        // INSERT
        // =====================================

                let data;

        if (isEditing) {

            data = await Api.updateServiceOrder(
                editingId,
                serviceOrder
            );

        } else {

            serviceOrder.created_by = user.id;

            data = await Api.createServiceOrder(
                serviceOrder
            );

        // =====================================
        // SALVAR SERVIÇOS DA OS
        // =====================================
        
        for (
            const item of serviceItems
        ) {
        
            await Api.createServiceOrderItem({
        
                service_order_id:
                    data.id,
        
                service_name:
                    item.service_name,
        
                unit_price:
                    item.unit_price
        
            });
        
        }

        // =====================================
        // SUCESSO
        // =====================================

        showMessage(

            isEditing

                ? "Ordem de Serviço atualizada com sucesso!"

                : `Ordem #${data.os_number ?? data.id} criada com sucesso!`,

            "success"

        );

        clearForm();

        // =====================================
        // REDIRECIONA
        // =====================================

        setTimeout(() => {

            window.location.href =
                "./index.html";

        }, 1200);

    }

    catch (error) {

        console.error(error);

        showMessage(

            error.message ||

            "Erro ao cadastrar a Ordem de Serviço.",

            "error"

        );

    }

    finally {

        resetLoading();

    }

});
