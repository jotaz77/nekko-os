// =========================================
// NEKKO OS
// ESTOQUE
// =========================================

let context = null;

let inventoryProducts = [];


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

            await loadInventory();


            // ---------------------------------
            // Modal de produto
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


        const storeId =
            context.store?.id || null;


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
// RENDERIZAR
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
