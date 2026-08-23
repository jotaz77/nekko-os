let context = null;
let order = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
    try {

        const result = await Bootstrap.init();
        context = result.context;

        const id = new URLSearchParams(window.location.search).get("id");

        if (!id) {
            alert("Ordem de serviço não encontrada.");
            return;
        }

        order = await Api.getServiceOrder(id);

        if (!order) {
            alert("Ordem de serviço não encontrada.");
            return;
        }

        order.service_order_items =
            await Api.getServiceOrderItems(id);

        preencherCupom();

        setTimeout(() => {
            window.print();
        }, 300);

    } catch (error) {

        console.error(error);

        alert("Erro ao carregar a impressão.");

    }
}

function preencherCupom() {

    // Cabeçalho
    setText("companyName", context.company?.name);

    setText("storeName", context.store?.name);

    setText(
        "storePhone",
        context.store?.phone
            ? `WhatsApp: ${context.store.phone}`
            : "-"
    );

    // Ordem de Serviço

    setText("osNumber", order.os_number);

    setText("createdAt", formatDate(order.created_at));

    // Cliente

    setText("customerName", order.customer_name);

    setText("customerPhone", formatPhone(order.customer_phone));

    // Endereço

    const address = [
        order.customer_address,
        order.customer_number
    ].filter(Boolean).join(", ");
    
    setText(
        "customerAddress",
        address || "Não informado"
    );
    
    setText(
        "customerNeighborhood",
        order.customer_neighborhood
    );
    
    const cityState = [
        order.customer_city,
        order.customer_state
    ].filter(Boolean).join(" - ");
    
    setText(
        "customerCityState",
        cityState
    );
    
    setText(
        "customerCep",
        order.customer_cep
            ? `CEP: ${order.customer_cep}`
            : ""
    );
    
    setText(
        "customerComplement",
        order.customer_complement
            ? `Complemento: ${order.customer_complement}`
            : ""
    );

    // Aparelho

    setText("deviceType", order.device_type);

    setText("deviceBrand", order.brand);

    setText("deviceModel", order.model);

    renderDeviceLock(order);

    // Defeito

    setText(
        "reportedProblem",
        order.reported_issue ||
        order.problem ||
        "-"
    );

    // Observações

    setText(
        "observations",
        order.notes ||
        "-"
    );

    // ==================================================
    // SERVIÇOS
    // ==================================================
    
    const serviceItems =
        order.service_order_items || [];
    
    const serviceContainer =
        document.getElementById(
            "serviceItemsList"
        );
    
    
    if (serviceContainer) {
    
        // ------------------------------------------
        // OS nova com serviços cumulativos
        // ------------------------------------------
    
        if (serviceItems.length) {
    
            serviceContainer.innerHTML =
                serviceItems
                    .map(
                        item => `
    
                            <div class="row">
    
                                <span>
                                    ${item.service_name}
                                </span>
    
                                <span>
                                    ${formatMoney(
                                        item.unit_price
                                    )}
                                </span>
    
                            </div>
    
                        `
                    )
                    .join("");
    
        }
    
        // ------------------------------------------
        // OS antiga
        // ------------------------------------------
    
        else {
    
            serviceContainer.innerHTML = `
    
                <p>
                    ${order.service || "-"}
                </p>
    
            `;
    
        }
    
    }
    
    
    // ------------------------------------------
    // TOTAL
    // ------------------------------------------
    
    let serviceTotal = 0;
    
    if (serviceItems.length) {
    
        serviceTotal =
            serviceItems.reduce(
                (total, item) => {
    
                    return total +
                        Number(
                            item.unit_price || 0
                        );
    
                },
                0
            );
    
    } else {
    
        serviceTotal =
            Number(
                order.price || 0
            );
    
    }
    
    
    setText(
        "servicePrice",
        formatMoney(
            serviceTotal
        )
    );
    
}

function setText(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = value || "-";

}

function renderDeviceLock(order) {

    const container =
        document.getElementById("deviceLockContainer");

    if (!container) return;

    // -------------------------
    // SEM SENHA
    // -------------------------

    if (
        !order.lock_type ||
        order.lock_type === "none"
    ) {

        container.innerHTML = `
            <div class="no-lock">
                SEM SENHA
            </div>
        `;

        return;

    }

    // -------------------------
    // PIN
    // -------------------------

    if (order.lock_type === "pin") {

        container.innerHTML = `
            <div class="lock-title">
                Senha:
            </div>

            <div class="lock-value">
                ${order.lock_pin || "-"}
            </div>
        `;

        return;

    }

    // -------------------------
    // SENHA
    // -------------------------

    if (order.lock_type === "password") {

        container.innerHTML = `
            <div class="lock-title">
                Senha:
            </div>

            <div class="lock-value">
                ${order.lock_password || "-"}
            </div>
        `;

        return;

    }

    // -------------------------
    // PADRÃO
    // -------------------------

    if (order.lock_type === "pattern") {

        container.innerHTML = `
            <div class="lock-title">
                Senha:
            </div>

            <svg
                id="patternSVG"
                class="pattern"
                viewBox="0 0 100 100">
            </svg>
        `;

        drawPattern(
            order.lock_pattern || ""
        );

        return;

    }

    // -------------------------
    // Outros
    // -------------------------

    container.innerHTML = `
        <div class="lock-title">
            ${getLockType(order.lock_type)}
        </div>
    `;

}

function drawPattern(pattern) {

    const svg =
        document.getElementById("patternSVG");

    if (!svg) return;

    svg.innerHTML = "";

    const points = {

        1:{x:15,y:15},
        2:{x:50,y:15},
        3:{x:85,y:15},

        4:{x:15,y:50},
        5:{x:50,y:50},
        6:{x:85,y:50},

        7:{x:15,y:85},
        8:{x:50,y:85},
        9:{x:85,y:85}

    };

    const sequence = pattern
        .split("-")
        .map(Number)
        .filter(n => points[n]);

    // Desenha as linhas

    for (let i = 0; i < sequence.length - 1; i++) {

        const a = points[sequence[i]];
        const b = points[sequence[i + 1]];

        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

        line.setAttribute("x1", a.x);
        line.setAttribute("y1", a.y);

        line.setAttribute("x2", b.x);
        line.setAttribute("y2", b.y);

        svg.appendChild(line);

    }

    // Desenha os pontos

    for (let i = 1; i <= 9; i++) {

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        circle.setAttribute("cx", points[i].x);
        circle.setAttribute("cy", points[i].y);

        circle.setAttribute("r", 6);

        if (sequence.includes(i)) {

            circle.classList.add("active");

        }

        svg.appendChild(circle);

    }

}

function formatMoney(value) {

    return Number(value || 0).toLocaleString("pt-BR", {

        style: "currency",

        currency: "BRL"

    });

}

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleString("pt-BR");

}

function formatPhone(phone) {

    if (!phone) return "-";

    const numbers = phone.replace(/\D/g, "");

    if (numbers.length === 11) {

        return numbers.replace(
            /(\d{2})(\d{5})(\d{4})/,
            "($1) $2-$3"
        );

    }

    return phone;

}
