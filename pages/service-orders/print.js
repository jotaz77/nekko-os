let context = null;
let order = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {

    try {

        const result = await Bootstrap.init();
        context = result.context;

        const id = new URLSearchParams(location.search).get("id");

        if (!id) {

            alert("Ordem de serviço não encontrada.");
            window.close();
            return;

        }

        order = await Api.getServiceOrder(id);

        if (!order) {

            alert("Ordem de serviço não encontrada.");
            window.close();
            return;

        }

        fillReceipt();

        // Aguarda a renderização completa
        setTimeout(() => {

            window.print();

            // Fecha automaticamente após a impressão
            setTimeout(() => {

                window.close();

            }, 1000);

        }, 500);

    } catch (error) {

        console.error(error);

        alert("Erro ao carregar impressão.");

    }

}

function fillReceipt() {

    // Empresa / Loja

    setText("companyName", context.company?.name);

    setText("storeName", context.store?.name);

    setText("storePhone", context.store?.phone);

    // Cabeçalho

    setText("osNumber", order.os_number);

    setText("createdAt", formatDate(order.created_at));

    // Cliente

    setText("customerName", order.customer_name);

    setText("customerPhone", order.customer_phone);

    // Aparelho

    setText("deviceType", order.device_type);

    setText("deviceBrand", order.brand);

    setText("deviceModel", order.model);

    setText("deviceLockType", getLockType(order.lock_type));

    setText("deviceLockValue", getLockValue(order));

    // Defeito

    setText(
        "reportedProblem",
        order.reported_issue || order.problem
    );

    // Observações

    setText(
        "observations",
        order.notes
    );

    // Serviço

    setText(
        "serviceName",
        order.service
    );

    setText(
        "servicePrice",
        formatCurrency(order.price)
    );

    // Rodapé

    setText(
        "printedAt",
        formatDateTime(new Date())
    );

}

function setText(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = value || "-";

}

function getLockType(type) {

    if (!type) return "-";

    const types = {

        pin: "PIN",
        password: "Senha",
        pattern: "Padrão",
        biometric: "Biometria",
        face: "Face ID",
        none: "Sem bloqueio"

    };

    return types[type] || type;

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

function formatCurrency(value) {

    return Number(value || 0).toLocaleString("pt-BR", {

        style: "currency",
        currency: "BRL"

    });

}

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleDateString("pt-BR");

}

function formatDateTime(date) {

    return new Date(date).toLocaleString("pt-BR");

}
