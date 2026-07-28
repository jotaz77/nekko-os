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

    // Aparelho

    setText("deviceType", order.device_type);

    setText("deviceBrand", order.brand);

    setText("deviceModel", order.model);

    setText("deviceLockType", getLockType(order.lock_type));

    setText("deviceLockValue", getLockValue(order));

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

    // Serviço

    setText(
        "serviceName",
        order.service
    );

    setText(
        "servicePrice",
        formatMoney(order.price)
    );

    // Rodapé

    setText(
        "printedAt",
        formatDate(new Date())
    );

}

function setText(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = value || "-";

}

function getLockType(type) {

    const types = {

        pin: "PIN",

        password: "Senha",

        pattern: "Padrão",

        biometric: "Biometria",

        face: "Face ID",

        none: "Sem bloqueio"

    };

    return types[type] || "Bloqueio";

}

function getLockValue(order) {

    switch (order.lock_type) {

        case "pin":
            return order.lock_pin || "-";

        case "password":
            return order.lock_password || "-";

        case "pattern":
            return order.lock_pattern || "-";

        default:
            return "-";

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
