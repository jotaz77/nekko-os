// =========================================
// NEKKO OS
// Registrar Venda
// =========================================

let context = null;

let inventoryProducts = [];
let selectedInventoryProduct = null;
let saleItems = [];

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
// BUSCAR PRODUTOS
// =========================================

function searchInventoryProducts() {

    const search =
        productNameInput.value
            .trim()
            .toLowerCase();


    if (!search) {

        hideProductSuggestions();

        return;

    }


    const results =
        inventoryProducts.filter(
            product =>
                String(
                    product.name || ""
                )
                .toLowerCase()
                .includes(search)
        );


    renderProductSuggestions(
        results
    );

}

// =========================================
// RENDERIZAR SUGESTÕES
// =========================================

function renderProductSuggestions(
    products
) {

    productSuggestions.innerHTML = "";


    if (
        products.length === 0
    ) {

        productSuggestions.innerHTML = `

            <div
                class="
                    px-4
                    py-4
                    text-sm
                    text-slate-500
                "
            >

                Nenhum produto encontrado no estoque.

            </div>

        `;


        productSuggestions.classList.remove(
            "hidden"
        );


        return;

    }


    products
        .slice(0, 8)
        .forEach(
            product => {

                const quantity =
                    Number(
                        product.quantity || 0
                    );


                const minSale =
                    Number(
                        product.min_sale_price || 0
                    );


                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";


                item.className = `
                    w-full
                    text-left
                    px-4
                    py-3
                    hover:bg-white/5
                    transition
                    border-b
                    border-[#29322C]
                    last:border-b-0
                `;


                item.innerHTML = `

                    <div
                        class="
                            flex
                            items-center
                            justify-between
                            gap-4
                        "
                    >

                        <div>

                            <p
                                class="
                                    text-sm
                                    font-medium
                                    text-white
                                "
                            >

                                ${escapeProductHtml(
                                    product.name
                                )}

                            </p>


                            <p
                                class="
                                    text-xs
                                    text-slate-500
                                    mt-1
                                "
                            >

                                ${quantity}
                                ${
                                    quantity === 1
                                        ? "unidade"
                                        : "unidades"
                                }
                                disponíveis

                            </p>

                        </div>


                        <div
                            class="
                                text-right
                                whitespace-nowrap
                            "
                        >

                            <p
                                class="
                                    text-sm
                                    font-semibold
                                    text-green-400
                                "
                            >

                                ${formatSaleCurrency(
                                    minSale
                                )}

                            </p>


                            <p
                                class="
                                    text-[11px]
                                    text-slate-600
                                "
                            >

                                venda mínima

                            </p>

                        </div>

                    </div>

                `;


                item.addEventListener(
                    "click",
                    () => {

                        selectInventoryProduct(
                            product
                        );

                    }
                );


                productSuggestions.appendChild(
                    item
                );

            }
        );


    productSuggestions.classList.remove(
        "hidden"
    );

}

// =========================================
// SELECIONAR PRODUTO
// =========================================

function selectInventoryProduct(
    product
) {

    // Guarda o produto selecionado
    selectedInventoryProduct =
        product;


    // Preenche o campo
    productNameInput.value =
        product.name;


    // Esconde as sugestões
    hideProductSuggestions();

}

// =========================================
// RENDERIZAR ITENS DA VENDA
// =========================================

function renderSaleItems() {

    const container =
        document.getElementById(
            "saleItemsContainer"
        );

    const list =
        document.getElementById(
            "saleItemsList"
        );

    const count =
        document.getElementById(
            "saleItemsCount"
        );

    const total =
        document.getElementById(
            "saleTotal"
        );


    if (!container || !list)
        return;


    // ---------------------------------
    // Nenhum item
    // ---------------------------------

    if (
        saleItems.length === 0
    ) {

        container.classList.add(
            "hidden"
        );

        list.innerHTML = "";

        count.textContent =
            "0 itens";

        total.textContent =
            "R$ 0,00";

        return;

    }


    // ---------------------------------
    // Mostrar container
    // ---------------------------------

    container.classList.remove(
        "hidden"
    );


    // ---------------------------------
    // Contador
    // ---------------------------------

    count.textContent =
        saleItems.length === 1
            ? "1 item"
            : `${saleItems.length} itens`;


    // ---------------------------------
    // Renderizar itens
    // ---------------------------------

    list.innerHTML = "";


    saleItems.forEach(
        (item, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className = `
                flex
                items-center
                justify-between
                gap-4
                p-4
                rounded-xl
                bg-[#0F1411]
                border
                border-[#29322C]
            `;


            row.innerHTML = `

                <div class="min-w-0">

                    <p
                        class="
                            text-sm
                            font-medium
                            text-white
                            truncate
                        "
                    >
                        ${escapeProductHtml(
                            item.product_name
                        )}
                    </p>

                    <p
                        class="
                            text-xs
                            text-slate-500
                            mt-1
                        "
                    >
                        Produto da venda
                    </p>

                </div>


                <div
                    class="
                        flex
                        items-center
                        gap-4
                        shrink-0
                    "
                >

                    <strong
                        class="
                            text-sm
                            font-semibold
                            text-green-400
                        "
                    >
                        ${formatSaleCurrency(
                            item.unit_price
                        )}
                    </strong>


                    <button
                        type="button"
                        data-remove-sale-item="${index}"
                        class="
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            text-slate-500
                            hover:text-red-400
                            hover:bg-red-500/10
                            transition
                        "
                        title="Remover produto"
                    >

                        <i
                            data-lucide="trash-2"
                            class="w-4 h-4"
                        ></i>

                    </button>

                </div>

            `;


            list.appendChild(
                row
            );

        }
    );


    // ---------------------------------
    // Total
    // ---------------------------------

    const totalValue =
        saleItems.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(
                    item.unit_price || 0
                ),
            0
        );


    total.textContent =
        formatSaleCurrency(
            totalValue
        );


    // ---------------------------------
    // Ícones
    // ---------------------------------

    if (
        window.lucide
    ) {

        lucide.createIcons();

    }

}

// =========================================
// ADICIONAR ITEM À VENDA
// =========================================

const addSaleItemButton =
    document.getElementById(
        "addSaleItem"
    );


addSaleItemButton.addEventListener(
    "click",
    () => {

        // ---------------------------------
        // Validar produto
        // ---------------------------------

        if (!selectedInventoryProduct) {

            showMessage(
                "Selecione um produto do estoque."
            );

            productNameInput.focus();

            return;

        }


        // ---------------------------------
        // Valor da venda
        // ---------------------------------

        const salePrice =
            parseSalePrice(
                salePriceInput.value
            );


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


        // ---------------------------------
        // Verificar estoque
        // ---------------------------------

        const currentQuantity =
            Number(
                selectedInventoryProduct.quantity || 0
            );


        if (
            currentQuantity <= 0
        ) {

            showMessage(
                "Este produto está sem estoque."
            );

            return;

        }


        // ---------------------------------
        // Adicionar item
        // ---------------------------------

        saleItems.push({

            product_id:
                selectedInventoryProduct.id,

            product_name:
                selectedInventoryProduct.name,

            quantity:
                1,

            unit_price:
                salePrice,

            unit_cost:
                Number(
                    selectedInventoryProduct.cost_price || 0
                ),

            subtotal:
                salePrice

        });


        // ---------------------------------
        // Atualizar lista
        // ---------------------------------

        renderSaleItems();


        // ---------------------------------
        // Limpar produto atual
        // ---------------------------------

        selectedInventoryProduct =
            null;

        productNameInput.value = "";

        salePriceInput.value = "";

        hideProductSuggestions();


        // ---------------------------------
        // Foco para próximo produto
        // ---------------------------------

        productNameInput.focus();


        // ---------------------------------
        // Mensagem
        // ---------------------------------

        showMessage(
            "Produto adicionado à venda.",
            "success"
        );

    }
);

// =========================================
// ESCONDER SUGESTÕES
// =========================================

function hideProductSuggestions() {

    productSuggestions.classList.add(
        "hidden"
    );

    productSuggestions.innerHTML = "";

}

// =========================================
// FORMATAR MOEDA
// =========================================

function formatSaleCurrency(
    value
) {

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
// SEGURANÇA HTML
// =========================================

function escapeProductHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

// =========================================
// DIGITAÇÃO DO PRODUTO
// =========================================

productNameInput.addEventListener(
    "input",
    () => {

        searchInventoryProducts();

    }
);

// =========================================
// MUDANÇA DE LOJA
// =========================================

storeSelect.addEventListener(
    "change",
    async () => {

        inventoryProducts = [];

        productNameInput.value = "";

        hideProductSuggestions();

        await loadInventoryProducts();

    }
);



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
            // Validar produto do estoque
            // -----------------------------
            
            if (
                !selectedInventoryProduct
            ) {
            
                showMessage(
                    "Selecione um produto do estoque."
                );
            
                productNameInput.focus();
            
                return;
            
            }
            
            
            const currentQuantity =
                Number(
                    selectedInventoryProduct.quantity || 0
                );
            
            
            if (
                currentQuantity <= 0
            ) {
            
                showMessage(
                    "Este produto está sem estoque."
                );
            
                return;
            
            }

            
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
            // Nova quantidade do estoque
            // -----------------------------
            
            const newQuantity =
                currentQuantity - 1;
            
            
            // -----------------------------
            // Baixar estoque
            // -----------------------------
            
            try {
            
                await Api.updateInventoryProduct(
                    selectedInventoryProduct.id,
                    {
                        quantity:
                            newQuantity,
            
                        updated_at:
                            new Date().toISOString()
                    }
                );
            
            }
            
            catch (stockError) {
            
                // Se não conseguiu baixar o estoque,
                // desfazemos a venda criada.
            
                try {
            
                    await Api.deleteSale(
                        createdSale.id
                    );
            
                }
            
                catch (rollbackError) {
            
                    console.error(
                        "Erro ao desfazer venda após falha no estoque:",
                        rollbackError
                    );
            
                }
            
                throw stockError;
            
            }
            
            
            // -----------------------------
            // Registrar movimentação
            // -----------------------------
            
            try {
            
                await Api.createInventoryMovement({
            
                    company_id:
                        context.company.id,
            
                    store_id:
                        storeId,
            
                    product_id:
                        selectedInventoryProduct.id,
            
                    movement_type:
                        "sale",
            
                    quantity:
                        1,
            
                    unit_cost:
                        Number(
                            selectedInventoryProduct.cost_price || 0
                        ),
            
                    sale_price:
                        salePrice,
            
                    sale_id:
                        createdSale.id,
            
                    created_by:
                        context.user?.id || null
            
                });
            
            }
            
            catch (movementError) {
            
                // Se a movimentação não foi registrada,
                // devolvemos a unidade ao estoque.
            
                try {
            
                    await Api.updateInventoryProduct(
                        selectedInventoryProduct.id,
                        {
                            quantity:
                                currentQuantity,
            
                            updated_at:
                                new Date().toISOString()
                        }
                    );
            
                }
            
                catch (rollbackStockError) {
            
                    console.error(
                        "Erro ao restaurar estoque:",
                        rollbackStockError
                    );
            
                }
            
            
                // E desfazemos a venda.
            
                try {
            
                    await Api.deleteSale(
                        createdSale.id
                    );
            
                }
            
                catch (rollbackSaleError) {
            
                    console.error(
                        "Erro ao desfazer venda após falha no estoque:",
                        rollbackSaleError
                    );
            
                }
            
                throw movementError;
            
            }


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
            
            selectedInventoryProduct = null;
            
            inventoryProducts = [];
            
            hideProductSuggestions();
            
            
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
            
            await loadInventoryProducts();


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
