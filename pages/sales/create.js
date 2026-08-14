// =========================================
// NEKKO OS
// Registrar Venda
// =========================================

let context = null;

let inventoryProducts = [];


// =========================================
// Elementos
// =========================================

const form = document.getElementById("saleForm");

const productNameInput =
    document.getElementById("productName");

const productSuggestions =
    document.getElementById(
        "productSuggestions"
    );

const salePriceInput =
    document.getElementById("salePrice");

const customerNameInput =
    document.getElementById("customerName");

const customerDocumentInput =
    document.getElementById("customerDocument");

const customerZipCodeInput =
    document.getElementById("customerZipCode");

const storeSelect =
    document.getElementById("store");

const storeHelp =
    document.getElementById("storeHelp");

const submitButton =
    document.getElementById("submitSale");

const message =
    document.getElementById("message");


// =========================================
// Mostrar mensagem
// =========================================

function showMessage(text, type = "error") {

    message.textContent = text;

    message.classList.remove(
        "hidden",
        "bg-red-500/10",
        "text-red-400",
        "bg-green-500/10",
        "text-green-400"
    );


    if (type === "success") {

        message.classList.add(
            "bg-green-500/10",
            "text-green-400"
        );

    }

    else {

        message.classList.add(
            "bg-red-500/10",
            "text-red-400"
        );

    }

}


// =========================================
// Formatar valor
// =========================================

function parseSalePrice(value) {

    if (!value)
        return 0;


    let clean = value
        .replace(/\s/g, "")
        .replace("R$", "")
        .trim();


    // Exemplo:
    // 35,50 → 35.50

    if (
        clean.includes(",") &&
        clean.includes(".")
    ) {

        clean = clean
            .replace(/\./g, "")
            .replace(",", ".");

    }

    else if (clean.includes(",")) {

        clean = clean.replace(",", ".");

    }


    const number =
        Number(clean);


    return Number.isFinite(number)
        ? number
        : 0;

}


// =========================================
// Carregar lojas
// =========================================

function loadStores() {

    storeSelect.innerHTML = "";


    // =====================================
    // Usuário já está dentro de uma loja
    // =====================================

    if (context.store) {

        const option =
            document.createElement("option");

        option.value =
            context.store.id;

        option.textContent =
            context.store.name;

        option.selected = true;

        storeSelect.appendChild(option);

        storeSelect.disabled = true;

        storeHelp.textContent =
            "A venda será registrada nesta loja.";

        return;

    }


    // =====================================
    // CEO
    // =====================================

    if (
        context.role === Roles.CEO
    ) {

        const placeholder =
            document.createElement("option");

        placeholder.value = "";

        placeholder.textContent =
            "Selecione a loja";

        placeholder.selected = true;

        placeholder.disabled = true;

        storeSelect.appendChild(
            placeholder
        );


        context.stores?.forEach(store => {

            const option =
                document.createElement("option");

            option.value =
                store.id;

            option.textContent =
                store.name;

            storeSelect.appendChild(
                option
            );

        });


        storeHelp.textContent =
            "Selecione em qual loja a venda foi realizada.";

    }

}

// =========================================
// CARREGAR PRODUTOS DO ESTOQUE
// =========================================

async function loadInventoryProducts() {

    const storeId =
        storeSelect.value;


    if (!storeId) {

        inventoryProducts = [];

        hideProductSuggestions();

        return;

    }


    try {

        inventoryProducts =
            await Api.getInventoryProducts(
                context.company.id,
                storeId
            );


        hideProductSuggestions();

    }

    catch (error) {

        console.error(
            "Erro ao carregar produtos do estoque:",
            error
        );

        inventoryProducts = [];

    }

}

// =========================================
// Registrar venda
// =========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            showMessage(
                "",
                "success"
            );

            message.classList.add(
                "hidden"
            );


            const productName =
                productNameInput.value.trim();


            const salePrice =
                parseSalePrice(
                    salePriceInput.value
                );

            const customerName =
                customerNameInput.value.trim();
            
            const customerDocument =
                customerDocumentInput.value.trim();
            
            const customerZipCode =
                customerZipCodeInput.value.trim();



            // -----------------------------
            // Validações
            // -----------------------------

            if (!productName) {

                showMessage(
                    "Informe o nome do produto."
                );

                productNameInput.focus();

                return;

            }


            if (
                !salePrice ||
                salePrice <= 0
            ) {

                showMessage(
                    "Informe um valor de venda válido."
                );

                salePriceInput.focus();

                return;

            }


            const storeId =
                storeSelect.value;


            if (!storeId) {

                showMessage(
                    "Selecione a loja da venda."
                );

                storeSelect.focus();

                return;

            }


            // -----------------------------
            // Desabilitar botão
            // -----------------------------

            submitButton.disabled = true;

            submitButton.textContent =
                "Registrando...";


            // -----------------------------
            // Criar venda
            // -----------------------------

            const createdSale =
                await Api.createSale({
            
                    company_id:
                        context.company.id,
            
                    store_id:
                        storeId,
            
                    product_name:
                        productName,
            
                    sale_price:
                        salePrice,
            
                    created_by:
                        context.user.id,
            
                    customer_name:
                        customerName || null,
            
                    customer_document:
                        customerDocument || null,
            
                    customer_zip_code:
                        customerZipCode || null
            
                });


            // -----------------------------
            // Sucesso
            // -----------------------------

            showMessage(
                "Venda registrada com sucesso!",
                "success"
            );
            
            
            // Perguntar se deseja imprimir
            
            const shouldPrint =
                confirm(
                    "Venda registrada com sucesso!\n\n" +
                    "Deseja imprimir a nota?"
                );
            
            
            if (shouldPrint) {
            
                window.open(
                    `print.html?id=${createdSale.id}`,
                    "_blank"
                );
            
            }
            
            
            // Limpar formulário
            
            form.reset();
            
            
            // Recarregar loja atual
            
            loadStores();


        }

        catch (error) {

            console.error(
                "Erro ao registrar venda:",
                error
            );


            showMessage(
                error.message ||
                "Não foi possível registrar a venda."
            );

        }

        finally {

            submitButton.disabled = false;

            submitButton.innerHTML = `
                <i
                    data-lucide="check"
                    class="w-5 h-5">
                </i>

                Registrar Venda
            `;

            lucide.createIcons();

        }

    }
);


// =========================================
// Inicialização
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            const result =
                await Bootstrap.init();


            if (
                result.status !== "READY"
            ) {

                window.location.href =
                    "../login/login.html";

                return;

            }


            context =
                result.context;


            // O Bootstrap já possui
            // user, company, store e role.
            //
            // Precisamos também das lojas
            // quando o usuário for CEO.

            if (
                context.role === Roles.CEO
            ) {

                context.stores =
                    await Api.getStores(
                        context.company.id
                    );

            }


            loadStores();


            lucide.createIcons();

        }

        catch (error) {

            console.error(
                "Erro ao iniciar registro de venda:",
                error
            );


            alert(
                error.message ||
                "Erro ao carregar a tela."
            );

        }

    }
);
