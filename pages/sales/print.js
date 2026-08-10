// =========================================
// NEKKO OS
// Impressão de Venda
// =========================================

let context = null;

let sale = null;


// =========================================
// Inicialização
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    try {

        const result =
            await Bootstrap.init();


        context =
            result.context;


        const id =
            new URLSearchParams(
                window.location.search
            ).get("id");


        if (!id) {

            alert(
                "Venda não encontrada."
            );

            return;

        }


        sale =
            await Api.getSale(id);


        if (!sale) {

            alert(
                "Venda não encontrada."
            );

            return;

        }


        preencherNota();


        setTimeout(() => {

            window.print();

        }, 300);


    }

    catch (error) {

        console.error(error);

        alert(
            "Erro ao carregar a impressão."
        );

    }

}


// =========================================
// Preencher nota
// =========================================

function preencherNota() {

    // -----------------------------
    // Empresa
    // -----------------------------

    setText(
        "companyName",
        context.company?.name
    );


    // -----------------------------
    // Loja
    // -----------------------------

    setText(
        "storeName",
        context.store?.name
    );


    setText(
        "storePhone",
        context.store?.phone
            ? `WhatsApp: ${context.store.phone}`
            : "-"
    );


    // -----------------------------
    // Venda
    // -----------------------------

    setText(
        "saleId",
        sale.id
    );


    setText(
        "saleDate",
        formatDate(
            sale.created_at
        )
    );


    // -----------------------------
    // Produto
    // -----------------------------

    setText(
        "productName",
        sale.product_name
    );


    // -----------------------------
    // Valor
    // -----------------------------

    setText(
        "salePrice",
        formatMoney(
            sale.sale_price
        )
    );


    // -----------------------------
    // Impressão
    // -----------------------------

    setText(
        "printedAt",
        formatDate(
            new Date()
        )
    );

}


// =========================================
// Texto
// =========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element)
        return;


    element.textContent =
        value || "-";

}


// =========================================
// Dinheiro
// =========================================

function formatMoney(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// =========================================
// Data
// =========================================

function formatDate(date) {

    if (!date)
        return "-";


    return new Date(
        date
    ).toLocaleString(
        "pt-BR"
    );

}
