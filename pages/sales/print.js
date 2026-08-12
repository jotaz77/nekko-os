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

    // =====================================
    // DADOS DA EMPRESA
    // =====================================

    const company =
        sale.companies || {};

    const companyName =
        company.name || "-";

    const companyDocument =
        company.document || "-";


    setText(
        "companyName",
        companyName
    );


    setText(
        "companyDocument",
        companyDocument
    );


    setText(
        "companyNameFooter",
        companyName
    );


    setText(
        "companyDocumentFooter",
        companyDocument
    );


    // =====================================
    // DADOS DA LOJA
    // =====================================

    const store =
        sale.stores || {};


    const storeName =
        store.name || "-";


    setText(
        "storeName",
        storeName
    );


    setText(
        "storeNameFooter",
        storeName
    );


    // =====================================
    // ENDEREÇO DA LOJA
    // =====================================

    const addressParts = [];


    if (store.street) {

        let street =
            store.street;


        if (store.number) {

            street +=
                `, ${store.number}`;

        }


        addressParts.push(
            street
        );

    }


    if (store.neighborhood) {

        addressParts.push(
            store.neighborhood
        );

    }


    let cityState = "";


    if (store.city) {

        cityState =
            store.city;

    }


    if (store.state) {

        cityState +=
            cityState
                ? `/${store.state}`
                : store.state;

    }


    if (cityState) {

        addressParts.push(
            cityState
        );

    }


    if (store.zip_code) {

        addressParts.push(
            `CEP: ${store.zip_code}`
        );

    }


    if (store.complement) {

        addressParts.push(
            `Compl.: ${store.complement}`
        );

    }


    setText(
        "storeAddress",
        addressParts.join(" • ")
    );

    setText(
        "storeAddressFooter",
        addressParts.join(" • ")
    );

    // =====================================
    // TELEFONE
    // =====================================

    setText(
        "storePhone",
        store.phone
            ? `Telefone: ${store.phone}`
            : ""
    );


    // =====================================
    // DADOS DA VENDA
    // =====================================

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

    // =====================================
    // DADOS DO CLIENTE
    // =====================================
    
    const customerInfo =
        document.getElementById(
            "customerInfo"
        );
    
    
    if (customerInfo) {
    
        const customerParts = [];
    
    
        if (sale.customer_name) {
    
            customerParts.push(
                `<p>
                    <strong>Cliente:</strong>
                    ${sale.customer_name}
                </p>`
            );
    
        }
    
    
        if (sale.customer_document) {
    
            customerParts.push(
                `<p>
                    <strong>CPF/CNPJ:</strong>
                    ${sale.customer_document}
                </p>`
            );
    
        }
    
    
        if (sale.customer_zip_code) {
    
            customerParts.push(
                `<p>
                    <strong>CEP:</strong>
                    ${sale.customer_zip_code}
                </p>`
            );
    
        }
    
    
        customerInfo.innerHTML =
            customerParts.join("");
    
    }

    // =====================================
    // PRODUTO
    // =====================================

    setText(
        "productName",
        sale.product_name
    );


    // =====================================
    // VALOR
    // =====================================

    const saleValue =
        formatMoney(
            sale.sale_price
        );


    setText(
        "salePrice",
        saleValue
    );


    setText(
        "saleTotal",
        saleValue
    );


    // =====================================
    // DATA DA IMPRESSÃO
    // =====================================

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
