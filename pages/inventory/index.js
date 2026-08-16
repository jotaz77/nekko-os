// =========================================
// NEKKO OS
// ESTOQUE
// =========================================

let context = null;

let inventoryProducts = [];
let editingProductId = null;


// =========================================
// INICIALIZAÇÃO
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            // ---------------------------------
            // Contexto
            // ---------------------------------

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


            // ---------------------------------
            // Segurança visual
            // ---------------------------------

            if (
                context.role !== Roles.CEO
            ) {

                alert(
                    "Acesso permitido somente ao CEO."
                );

                window.location.href =
                    "../menu/index.html";

                return;

            }


            // ---------------------------------
            // Nome da loja
            // ---------------------------------

            renderStoreName();


            // ---------------------------------
            // Carregar estoque
            // ---------------------------------

            await setupInventoryStoreFilter();


            // ---------------------------------
            // Carregar estoque
            // ---------------------------------
            
            await loadInventory();
            
            
            // ---------------------------------
            // Modal
            // ---------------------------------
            
            setupProductModal();


            // ---------------------------------
            // Ícones
            // ---------------------------------

            if (
                window.lucide
            ) {

                lucide.createIcons();

            }

        }

        catch (error) {

            console.error(
                "Erro ao iniciar estoque:",
                error
            );

            alert(
                error.message
            );

        }

    }
);


// =========================================
// LOJA
// =========================================

function renderStoreName() {

    const element =
        document.getElementById(
            "storeName"
        );


    if (
        context.store
    ) {

        element.textContent =
            context.store.name;

        return;

    }


    element.textContent =
        "Todas as lojas";

}


// =========================================
// CARREGAR ESTOQUE
// =========================================

async function loadInventory() {

    try {

        const companyId =
            context.company.id;
        
        
        const filter =
            document.getElementById(
                "inventoryStoreFilter"
            );
        
        
        const storeId =
            filter?.value ||
            null;
        
        
        inventoryProducts =
            await Api.getInventoryProducts(
                companyId,
                storeId
            );


        renderInventory(
            inventoryProducts
        );

    }

    catch (error) {

        console.error(
            "Erro ao carregar estoque:",
            error
        );

        throw error;

    }

}


// =========================================
// RENDERIZAR ESTOQUE
// =========================================

function renderInventory(
    products
) {

    const container =
        document.getElementById(
            "productsContainer"
        );


    const totalProducts =
        document.getElementById(
            "totalProducts"
        );


    const totalQuantity =
        document.getElementById(
            "totalQuantity"
        );


    const totalStockValue =
        document.getElementById(
            "totalStockValue"
        );


    const productCount =
        document.getElementById(
            "productCount"
        );


    // ---------------------------------
    // Totais
    // ---------------------------------

    let quantity = 0;

    let stockValue = 0;


    products.forEach(
        product => {

            const productQuantity =
                Number(
                    product.quantity || 0
                );


            const cost =
                Number(
                    product.cost_price || 0
                );


            quantity +=
                productQuantity;


            stockValue +=
                productQuantity *
                cost;

        }
    );


    // ---------------------------------
    // Atualizar resumo
    // ---------------------------------

    totalProducts.textContent =
        products.length;


    totalQuantity.textContent =
        quantity;


    totalStockValue.textContent =
        formatCurrency(
            stockValue
        );


    productCount.textContent =
        `${products.length} ${
            products.length === 1
                ? "produto"
                : "produtos"
        }`;


    // ---------------------------------
    // Limpar lista
    // ---------------------------------

    container.innerHTML = "";


    // ---------------------------------
    // Nenhum produto
    // ---------------------------------

    if (
        products.length === 0
    ) {

        container.innerHTML = `

            <div
                class="
                    bg-[#141A16]
                    border
                    border-[#29322C]
                    rounded-3xl
                    p-10
                    text-center
                    md:col-span-2
                    xl:col-span-3
                "
            >

                <div
                    class="
                        w-14
                        h-14
                        mx-auto
                        rounded-2xl
                        bg-green-500/10
                        flex
                        items-center
                        justify-center
                        mb-5
                    "
                >

                    <i
                        data-lucide="package-open"
                        class="w-7 h-7 text-green-400"
                    ></i>

                </div>


                <h2
                    class="
                        text-xl
                        font-semibold
                    "
                >

                    Nenhum produto cadastrado

                </h2>


                <p
                    class="
                        text-slate-500
                        mt-2
                    "
                >

                    Comece recebendo seu primeiro produto.

                </p>

            </div>

        `;


        if (
            window.lucide
        ) {

            lucide.createIcons();

        }


        return;

    }


    // ---------------------------------
    // Produtos
    // ---------------------------------

    products.forEach(
        product => {

            container.innerHTML +=
                createProductCard(
                    product
                );

        }
    );


    if (
        window.lucide
    ) {

        lucide.createIcons();

    }

}


// =========================================
// CARD DO PRODUTO
// =========================================

function createProductCard(
    product
) {

    const quantity =
        Number(
            product.quantity || 0
        );


    const cost =
        Number(
            product.cost_price || 0
        );


    const minimum =
        Number(
            product.min_sale_price || 0
        );


    const stockValue =
        quantity * cost;


    let stockStatus =
        "Estoque normal";


    let stockClass =
        "text-green-400";


    if (
        quantity === 0
    ) {

        stockStatus =
            "Sem estoque";

        stockClass =
            "text-red-400";

    }

    else if (
        quantity <= 3
    ) {

        stockStatus =
            "Estoque baixo";

        stockClass =
            "text-yellow-400";

    }


    return `

        <article
            class="
                bg-[#141A16]
                border
                border-[#29322C]
                rounded-3xl
                p-6
                hover:border-green-500/40
                transition
            "
        >

            <div
                class="
                    flex
                    items-start
                    justify-between
                    gap-4
                "
            >

                <div>

                    <h3
                        class="
                            text-lg
                            font-semibold
                        "
                    >

                        ${escapeHtml(
                            product.name
                        )}

                    </h3>


                    <p
                        class="
                            text-sm
                            text-slate-500
                            mt-1
                        "
                    >

                        ${escapeHtml(
                            product.stores?.name ||
                            "Loja"
                        )}

                    </p>

                </div>


                <span
                    class="
                        ${stockClass}
                        text-xs
                        font-semibold
                        whitespace-nowrap
                    "
                >

                    ${stockStatus}

                </span>

            </div>


            <div
                class="
                    border-t
                    border-[#29322C]
                    my-5
                "
            ></div>


            <div
                class="
                    grid
                    grid-cols-2
                    gap-4
                "
            >

                <div>

                    <p
                        class="
                            text-xs
                            text-slate-500
                        "
                    >
                        Quantidade
                    </p>


                    <p
                        class="
                            text-xl
                            font-bold
                            mt-1
                        "
                    >
                        ${quantity}
                    </p>

                </div>


                <div>

                    <p
                        class="
                            text-xs
                            text-slate-500
                        "
                    >
                        Custo
                    </p>


                    <p
                        class="
                            text-xl
                            font-bold
                            mt-1
                        "
                    >
                        ${formatCurrency(
                            cost
                        )}
                    </p>

                </div>


                <div>

                    <p
                        class="
                            text-xs
                            text-slate-500
                        "
                    >
                        Venda mínima
                    </p>


                    <p
                        class="
                            text-lg
                            font-semibold
                            mt-1
                        "
                    >
                        ${formatCurrency(
                            minimum
                        )}
                    </p>

                </div>


                <div>

                    <p
                        class="
                            text-xs
                            text-slate-500
                        "
                    >
                        Valor em estoque
                    </p>


                    <p
                        class="
                            text-lg
                            font-semibold
                            mt-1
                        "
                    >
                        ${formatCurrency(
                            stockValue
                        )}
                    </p>

                </div>

            </div>

                        <!-- AÇÕES -->

            <div
                class="
                    flex
                    items-center
                    gap-3
                    mt-5
                    pt-5
                    border-t
                    border-[#29322C]
                "
            >

                <button
                    type="button"
                    class="
                        flex-1
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        border
                        border-[#29322C]
                        text-slate-300
                        hover:bg-white/5
                        hover:text-white
                        transition
                    "
                    onclick="editProduct('${product.id}')"
                >

                    <i
                        data-lucide="pencil"
                        class="w-4 h-4"
                    ></i>

                    Editar

                </button>


                <button
                    type="button"
                    class="
                        flex-1
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        border
                        border-red-500/20
                        text-red-400
                        hover:bg-red-500/10
                        hover:border-red-500/40
                        transition
                    "
                    onclick="deleteProduct('${product.id}')"
                >

                    <i
                        data-lucide="trash-2"
                        class="w-4 h-4"
                    ></i>

                    Excluir

                </button>

            </div>

        </article>

    `;

}


// =========================================
// MOEDA
// =========================================

function formatCurrency(
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

function escapeHtml(
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
// FILTRO DE LOJAS
// =========================================

async function setupInventoryStoreFilter() {

    const filter =
        document.getElementById(
            "inventoryStoreFilter"
        );


    if (!filter) {
        return;
    }


    try {

        const stores =
            await Api.getStores(
                context.company.id
            );


        filter.innerHTML = `
            <option value="">
                Todas as lojas
            </option>
        `;


        stores.forEach(
            store => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    store.id;


                option.textContent =
                    store.name;


                filter.appendChild(
                    option
                );

            }
        );


        // ---------------------------------
        // Loja atual
        // ---------------------------------

        if (
            context.store?.id
        ) {

            filter.value =
                context.store.id;

        }


        // ---------------------------------
        // Alteração do filtro
        // ---------------------------------

        filter.addEventListener(
            "change",
            async () => {

                await loadInventory();

            }
        );

    }

    catch (error) {

        console.error(
            "Erro ao carregar filtro de lojas:",
            error
        );

    }

}

// =========================================
// MODAL DE PRODUTO
// =========================================

function setupProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    const openButton =
        document.getElementById(
            "newProductButton"
        );


    const closeButton =
        document.getElementById(
            "closeProductModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelProductButton"
        );


    const productForm =
        document.getElementById(
            "productForm"
        );


    // ---------------------------------
    // Abrir
    // ---------------------------------

    openButton.addEventListener(
        "click",
        async () => {

            await openProductModal();

        }
    );


    // ---------------------------------
    // Fechar
    // ---------------------------------

    closeButton.addEventListener(
        "click",
        () => {

            closeProductModal();

        }
    );


    cancelButton.addEventListener(
        "click",
        () => {

            closeProductModal();

        }
    );


    // ---------------------------------
    // Salvar produto
    // ---------------------------------

    productForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await saveProduct();

        }
    );


    // ---------------------------------
    // Fechar clicando fora
    // ---------------------------------

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeProductModal();

            }

        }
    );

}


// =========================================
// ABRIR MODAL
// =========================================

async function openProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    const storeSelect =
        document.getElementById(
            "productStore"
        );


    const message =
        document.getElementById(
            "productFormMessage"
        );


    // ---------------------------------
    // Limpar formulário
    // ---------------------------------

    editingProductId = null;

    document
        .getElementById(
            "productForm"
        )
        .reset();


    message.classList.add(
        "hidden"
    );


    message.textContent = "";


    // ---------------------------------
    // Abrir visualmente
    // ---------------------------------

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );


    // ---------------------------------
    // Carregar lojas
    // ---------------------------------

    await loadProductStores();


    // ---------------------------------
    // Selecionar loja atual
    // ---------------------------------

    if (
        context.store?.id
    ) {

        storeSelect.value =
            context.store.id;

    }

}


// =========================================
// FECHAR MODAL
// =========================================

function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );

}


// =========================================
// CARREGAR LOJAS
// =========================================

async function loadProductStores() {

    const storeSelect =
        document.getElementById(
            "productStore"
        );


    try {

        const stores =
            await Api.getStores(
                context.company.id
            );


        storeSelect.innerHTML = "";


        // ---------------------------------
        // Nenhuma loja
        // ---------------------------------

        if (
            !stores ||
            stores.length === 0
        ) {

            storeSelect.innerHTML = `
                <option value="">
                    Nenhuma loja cadastrada
                </option>
            `;

            return;

        }


        // ---------------------------------
        // Opções
        // ---------------------------------

        stores.forEach(
            store => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    store.id;


                option.textContent =
                    store.name;


                storeSelect.appendChild(
                    option
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Erro ao carregar lojas:",
            error
        );


        storeSelect.innerHTML = `
            <option value="">
                Erro ao carregar lojas
            </option>
        `;

    }

}


// =========================================
// SALVAR / RECEBER PRODUTO
// =========================================

async function saveProduct() {

    const nameInput =
        document.getElementById(
            "productName"
        );


    const storeInput =
        document.getElementById(
            "productStore"
        );


    const quantityInput =
        document.getElementById(
            "productQuantity"
        );


    const costInput =
        document.getElementById(
            "productCost"
        );


    const minSaleInput =
        document.getElementById(
            "productMinSale"
        );


    const saveButton =
        document.getElementById(
            "saveProductButton"
        );


    // ---------------------------------
    // Dados
    // ---------------------------------

    const name =
        nameInput.value.trim();


    const storeId =
        storeInput.value;


    const quantity =
        Number(
            quantityInput.value
        );


    const costPrice =
        Number(
            costInput.value
        );


    const minSalePrice =
        Number(
            minSaleInput.value
        );


    // ---------------------------------
    // Validação
    // ---------------------------------

    if (!name) {

        showProductMessage(
            "Informe o nome do produto.",
            "error"
        );

        return;

    }


    if (!storeId) {

        showProductMessage(
            "Selecione uma loja.",
            "error"
        );

        return;

    }


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        showProductMessage(
            "A quantidade deve ser maior que zero.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(costPrice) ||
        costPrice < 0
    ) {

        showProductMessage(
            "Informe um valor de entrada válido.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(minSalePrice) ||
        minSalePrice < 0
    ) {

        showProductMessage(
            "Informe uma venda mínima válida.",
            "error"
        );

        return;

    }


    // ---------------------------------
    // Estado do botão
    // ---------------------------------

    const originalText =
        saveButton.textContent;


    saveButton.disabled = true;

    saveButton.textContent =
        "Salvando...";


    try {


        // ---------------------------------
        // MODO EDIÇÃO
        // ---------------------------------

        console.log(
            "MODO DO FORMULÁRIO:",
            editingProductId !== null
                ? "EDIÇÃO"
                : "RECEBER PRODUTO",
            editingProductId
        );
        
        if (editingProductId !== null) {
        
            const updatedProduct =
                await Api.updateInventoryProduct(
                    editingProductId,
                    {
                        name:
                            name,
        
                        store_id:
                            storeId,
        
                        quantity:
                            quantity,
        
                        cost_price:
                            costPrice,
        
                        min_sale_price:
                            minSalePrice,
        
                        updated_at:
                            new Date().toISOString()
                    }
                );
        
        
            // Atualiza o produto em memória
            inventoryProducts =
                inventoryProducts.map(
                    product =>
                        product.id === editingProductId
                            ? updatedProduct
                            : product
                );
        
        
            // Fecha o modal
            closeProductModal();
        
        
            // Sai do modo edição
            editingProductId = null;
        
        
            // Atualiza o estoque
            await loadInventory();
        
        
            return;
        
        }
        
        // ---------------------------------
        // Procurar produto existente
        // ---------------------------------

        const existingProducts =
            await Api.getInventoryProducts(
                context.company.id,
                storeId
            );


        const normalizedName =
            name.toLowerCase().trim();


        const existingProduct =
            existingProducts.find(
                product =>
                    String(
                        product.name
                    )
                    .toLowerCase()
                    .trim()
                    === normalizedName
            );


        let product;


        // ---------------------------------
        // PRODUTO EXISTENTE
        // ---------------------------------

        if (
            existingProduct
        ) {

            const newQuantity =
                Number(
                    existingProduct.quantity || 0
                ) + quantity;


            product =
                await Api.updateInventoryProduct(
                    existingProduct.id,
                    {
                        quantity:
                            newQuantity,

                        cost_price:
                            costPrice,

                        min_sale_price:
                            minSalePrice,

                        updated_at:
                            new Date().toISOString()
                    }
                );

        }


        // ---------------------------------
        // NOVO PRODUTO
        // ---------------------------------

        else {

            product =
                await Api.createInventoryProduct({

                    company_id:
                        context.company.id,

                    store_id:
                        storeId,

                    name:
                        name,

                    cost_price:
                        costPrice,

                    min_sale_price:
                        minSalePrice,

                    quantity:
                        quantity,

                    active:
                        true

                });

        }


        // ---------------------------------
        // REGISTRAR MOVIMENTAÇÃO
        // ---------------------------------

        await Api.createInventoryMovement({

            company_id:
                context.company.id,

            store_id:
                storeId,

            product_id:
                product.id,

            movement_type:
                "entry",

            quantity:
                quantity,

            unit_cost:
                costPrice,

            sale_price:
                null,

            sale_id:
                null,

            created_by:
                context.user?.id || null

        });


        // ---------------------------------
        // Sucesso
        // ---------------------------------

        closeProductModal();


        await loadInventory();


    }

    catch (error) {

        console.error(
            "Erro ao receber produto:",
            error
        );


        showProductMessage(
            error.message ||
            "Não foi possível salvar o produto.",
            "error"
        );

    }


    finally {

        saveButton.disabled =
            false;

        saveButton.textContent =
            originalText;

    }

}


// =========================================
// MENSAGEM DO FORMULÁRIO
// =========================================

function showProductMessage(
    text,
    type = "error"
) {

    const message =
        document.getElementById(
            "productFormMessage"
        );


    message.textContent =
        text;


    message.classList.remove(
        "hidden",
        "text-red-400",
        "text-green-400",
        "bg-red-500/10",
        "bg-green-500/10"
    );


    if (
        type === "success"
    ) {

        message.classList.add(
            "text-green-400",
            "bg-green-500/10"
        );

    }

    else {

        message.classList.add(
            "text-red-400",
            "bg-red-500/10"
        );

    }

}

// =========================================
// EDITAR PRODUTO
// =========================================

async function editProduct(
    productId
) {

    const product =
        inventoryProducts.find(
            item =>
                item.id === productId
        );


    if (!product) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    editingProductId =
        product.id;


    // ---------------------------------
    // Abrir modal
    // ---------------------------------

    const modal =
        document.getElementById(
            "productModal"
        );


    modal.classList.remove(
        "hidden"
    );


    modal.classList.add(
        "flex"
    );


    // ---------------------------------
    // Carregar lojas
    // ---------------------------------

    await loadProductStores();


    // ---------------------------------
    // Preencher campos
    // ---------------------------------

    document
        .getElementById("productName")
        .value =
        product.name || "";


    document
        .getElementById("productStore")
        .value =
        product.store_id || "";


    document
        .getElementById("productQuantity")
        .value =
        Number(
            product.quantity || 0
        );


    document
        .getElementById("productCost")
        .value =
        Number(
            product.cost_price || 0
        );


    document
        .getElementById("productMinSale")
        .value =
        Number(
            product.min_sale_price || 0
        );


    // ---------------------------------
    // Título do modal
    // ---------------------------------

    const modalTitle =
        document.querySelector(
            "#productModal h2"
        );


    if (modalTitle) {

        modalTitle.textContent =
            "Editar produto";

    }


    // ---------------------------------
    // Descrição
    // ---------------------------------

    const modalDescription =
        document.querySelector(
            "#productModal h2 + p"
        );


    if (modalDescription) {

        modalDescription.textContent =
            "Atualize as informações do produto.";

    }


    // ---------------------------------
    // Botão
    // ---------------------------------

    const saveButton =
        document.getElementById(
            "saveProductButton"
        );


    saveButton.textContent =
        "Salvar alterações";


    // ---------------------------------
    // Limpar mensagem
    // ---------------------------------

    const message =
        document.getElementById(
            "productFormMessage"
        );


    message.classList.add(
        "hidden"
    );

    message.textContent = "";

}

// =========================================
// EXCLUIR PRODUTO
// =========================================

async function deleteProduct(
    productId
) {

    const product =
        inventoryProducts.find(
            item =>
                item.id === productId
        );


    if (!product) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    const confirmed =
        confirm(
            `Tem certeza que deseja excluir o produto "${product.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await Api.deleteInventoryProduct(
            productId
        );


        // Remove da lista local
        inventoryProducts =
            inventoryProducts.filter(
                item =>
                    item.id !== productId
            );


        // Atualiza a tela
        await loadInventory();


    }

    catch (error) {

        console.error(
            "Erro ao excluir produto:",
            error
        );


        alert(
            "Não foi possível excluir o produto."
        );

    }

}
