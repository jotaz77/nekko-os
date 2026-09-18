// =========================================
// NEKKO OS
// Configurações
//TENHO QUE AJUSTAR UNS BAGUIU
// =========================================

let appContext = null;
let company = null;
let stores = [];
let permissions = [];
let employees = [];


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


            appContext =
                result.context;


            // ---------------------------------
            // Garantir CEO
            // ---------------------------------

            if (
                appContext.role !==
                Roles.CEO
            ) {

                alert(
                    "Acesso permitido somente ao CEO."
                );

                window.location.href =
                    "../menu/index.html";

                return;

            }


            // ---------------------------------
            // Carregar lojas
            // ---------------------------------

            stores =
                await Api.getStores(
                    appContext.company.id
                );

            // ---------------------------------
            // Carregar empresa
            // ---------------------------------
            
            company =
                await Api.getCompany(
                    appContext.company.id
                );


            // ---------------------------------
            // Carregar permissões
            // ---------------------------------

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("permissions")
                    .select(
                        "id, code, name, category"
                    )
                    .eq(
                        "active",
                        true
                    )
                    .order(
                        "category"
                    )
                    .order(
                        "name"
                    );


            if (error)
                throw error;


            permissions =
                data || [];

            // ---------------------------------
            // Funcionários
            // ---------------------------------
            
            await loadEmployees();


            // ---------------------------------
            // Botão
            // ---------------------------------

            const registerButton =
                document.getElementById(
                    "registerEmployeeButton"
                );
            
            if (registerButton) {
            
                registerButton.addEventListener(
                    "click",
                    openEmployeeModal
                );
            
            }
            
            
            const editCompanyButton =
                document.getElementById(
                    "editCompanyButton"
                );
            
            if (editCompanyButton) {
            
                editCompanyButton.addEventListener(
                    "click",
                    openCompanyModal
                );
            
            }
            
            
            const editStoresButton =
                document.getElementById(
                    "editStoresButton"
                );
            
            if (editStoresButton) {
            
                editStoresButton.addEventListener(
                    "click",
                    openStoresModal
                );
            
            }
            
            
            const companyForm =
                document.getElementById(
                    "companyForm"
                );
            
            if (companyForm) {
            
                companyForm.addEventListener(
                    "submit",
                    saveCompany
                );
            
            }

            // =========================================
            // FECHAMENTO DOS MODAIS
            // =========================================
            
            // Botão X do modal da empresa
            const closeCompanyButton =
                document.getElementById(
                    "closeCompanyModalButton"
                );
            
            if (closeCompanyButton) {
            
                closeCompanyButton.addEventListener(
                    "click",
                    closeCompanyModal
                );
            
            }
            
            
            // Botão X do modal de lojas
            const closeStoresButton =
                document.getElementById(
                    "closeStoresModalButton"
                );
            
            if (closeStoresButton) {
            
                closeStoresButton.addEventListener(
                    "click",
                    closeStoresModal
                );
            
            }

            // Botão cancelar do modal da empresa
            const cancelCompanyButton =
                document.getElementById(
                    "cancelCompanyButton"
                );
            
            if (cancelCompanyButton) {
            
                cancelCompanyButton.addEventListener(
                    "click",
                    closeCompanyModal
                );
            
            }

            // =========================================
            // FECHAR AO CLICAR FORA DO MODAL
            // =========================================
            
            // Modal da empresa
            const companyModal =
                document.getElementById(
                    "companyModal"
                );
            
            if (companyModal) {
            
                companyModal.addEventListener(
                    "click",
                    event => {
            
                        // Fecha somente se clicar no fundo
                        if (
                            event.target ===
                            companyModal
                        ) {
            
                            closeCompanyModal();
            
                        }
            
                    }
                );
            
            }
            
            
            // Modal de lojas
            const storesModal =
                document.getElementById(
                    "storesModal"
                );
            
            if (storesModal) {
            
                storesModal.addEventListener(
                    "click",
                    event => {
            
                        // Fecha somente se clicar no fundo
                        if (
                            event.target ===
                            storesModal
                        ) {
            
                            closeStoresModal();
            
                        }
            
                    }
                );
            
            }


        }
        catch (error) {

            console.error(
                "Erro ao iniciar configurações:",
                error
            );

            alert(
                error.message
            );

        }

    }
);

// =========================================
// CARREGAR FUNCIONÁRIOS
// =========================================

async function loadEmployees() {

    const container =
        document.getElementById(
            "employeesContainer"
        );

    try {

        container.innerHTML = `
            <div
                class="
                    rounded-2xl
                    border
                    border-[#29322C]
                    bg-[#0D120E]
                    p-8
                    text-center
                    text-slate-500
                "
            >
                Carregando funcionários...
            </div>
        `;


        const {
            data,
            error
        } =
            await supabaseClient
                .from("company_members")
                .select(`
                    id,
                    profile_id,
                    role,
                    active,
                    store_id,
                    category,
                    profiles (
                        full_name
                    ),
                    stores (
                        name
                    )
                `)
                .eq(
                    "company_id",
                    appContext.company.id
                )
                .neq(
                    "role",
                    "CEO"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error)
            throw error;


        employees =
            data || [];


        renderEmployees();


    }
    catch (error) {

        console.error(
            "Erro ao carregar funcionários:",
            error
        );


        container.innerHTML = `
            <div
                class="
                    rounded-2xl
                    border
                    border-red-500/10
                    bg-red-500/5
                    p-8
                    text-center
                "
            >
                <p
                    class="
                        text-red-400
                        font-medium
                    "
                >
                    Não foi possível carregar
                    os funcionários.
                </p>

                <p
                    class="
                        text-sm
                        text-slate-500
                        mt-2
                    "
                >
                    ${error.message}
                </p>
            </div>
        `;

    }

}

// =========================================
// RENDERIZAR FUNCIONÁRIOS
// =========================================

function renderEmployees() {

    const container =
        document.getElementById(
            "employeesContainer"
        );


    if (
        !employees ||
        employees.length === 0
    ) {

        container.innerHTML = `
            <div
                class="
                    rounded-2xl
                    border
                    border-dashed
                    border-[#29322C]
                    bg-[#0D120E]
                    p-8
                    md:p-10
                    text-center
                "
            >

                <div
                    class="
                        w-14
                        h-14
                        mx-auto
                        rounded-2xl
                        bg-[#141A16]
                        border
                        border-[#29322C]
                        flex
                        items-center
                        justify-center
                        text-slate-500
                        mb-5
                    "
                >

                    <i
                        data-lucide="users-round"
                        class="w-6 h-6"
                    ></i>

                </div>


                <h4
                    class="
                        text-xl
                        font-semibold
                    "
                >
                    Nenhum funcionário cadastrado
                </h4>


                <p
                    class="
                        text-slate-500
                        mt-2
                    "
                >
                    Cadastre o primeiro funcionário
                    da empresa.
                </p>

            </div>
        `;


        lucide.createIcons();

        return;

    }


    container.innerHTML = "";


    employees.forEach(
        employee => {

            const card =
                document.createElement(
                    "div"
                );


            card.className = `
                rounded-2xl
                border
                border-[#29322C]
                bg-[#0D120E]
                p-5
                md:p-6
                transition-all
                duration-200
                hover:border-[#3A463E]
                hover:bg-[#101610]
            `;


            const fullName =
                employee.profiles
                    ?.full_name ||
                "Usuário";


            const storeName =
                employee.stores
                    ?.name ||
                "Sem loja";


            const category =
                employee.category ||
                employee.role ||
                "Funcionário";


            const active =
                employee.active;


            const createdAt =
                employee.created_at
                    ? new Date(
                        employee.created_at
                    ).toLocaleDateString(
                        "pt-BR"
                    )
                    : "—";


            card.innerHTML = `

                <div
                    class="
                        flex
                        flex-col
                        xl:flex-row
                        xl:items-center
                        xl:justify-between
                        gap-5
                    "
                >

                    <!-- IDENTIDADE -->

                    <div
                        class="
                            flex
                            items-center
                            gap-4
                            min-w-0
                        "
                    >

                        <div
                            class="
                                w-12
                                h-12
                                rounded-2xl
                                bg-green-500/10
                                border
                                border-green-500/10
                                flex
                                items-center
                                justify-center
                                text-green-400
                                shrink-0
                            "
                        >

                            <i
                                data-lucide="user-round"
                                class="w-5 h-5"
                            ></i>

                        </div>


                        <div
                            class="min-w-0"
                        >

                            <h4
                                class="
                                    font-semibold
                                    text-white
                                    truncate
                                "
                            >
                                ${fullName}
                            </h4>


                            <div
                                class="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                    mt-1.5
                                "
                            >

                                <span
                                    class="
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    ${category}
                                </span>


                                <span
                                    class="
                                        text-slate-700
                                    "
                                >
                                    •
                                </span>


                                <span
                                    class="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        text-xs
                                        text-slate-500
                                    "
                                >

                                    <i
                                        data-lucide="store"
                                        class="w-3.5 h-3.5"
                                    ></i>

                                    ${storeName}

                                </span>

                            </div>

                        </div>

                    </div>


                    <!-- INFORMAÇÕES -->

                    <div
                        class="
                            flex
                            flex-wrap
                            items-center
                            gap-x-6
                            gap-y-3
                            text-sm
                        "
                    >

                        <div>

                            <p
                                class="
                                    text-xs
                                    text-slate-600
                                    mb-1
                                "
                            >
                                Cadastro
                            </p>

                            <p
                                class="
                                    text-slate-400
                                "
                            >
                                ${createdAt}
                            </p>

                        </div>


                        <div>

                            <p
                                class="
                                    text-xs
                                    text-slate-600
                                    mb-1
                                "
                            >
                                Permissões
                            </p>

                            <p
                                class="
                                    text-slate-400
                                "
                                data-permission-count
                                data-member-id="${employee.id}"
                            >
                                —
                            </p>

                        </div>


                        <div>

                            <p
                                class="
                                    text-xs
                                    text-slate-600
                                    mb-1
                                "
                            >
                                Status
                            </p>

                            <span
                                class="
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-3
                                    py-1.5
                                    rounded-xl
                                    text-xs
                                    ${
                                        active
                                            ? "bg-green-500/10 text-green-400"
                                            : "bg-red-500/10 text-red-400"
                                    }
                                "
                            >

                                <span
                                    class="
                                        w-1.5
                                        h-1.5
                                        rounded-full
                                        ${
                                            active
                                                ? "bg-green-400"
                                                : "bg-red-400"
                                        }
                                    "
                                ></span>

                                ${
                                    active
                                        ? "Ativo"
                                        : "Inativo"
                                }

                            </span>

                        </div>

                    </div>


                    <!-- AÇÕES -->

                    <div
                        class="
                            flex
                            items-center
                            gap-2
                            shrink-0
                        "
                    >

                        <button
                            type="button"
                            class="
                                h-10
                                px-4
                                rounded-xl
                                border
                                border-[#29322C]
                                bg-[#141A16]
                                text-sm
                                text-slate-300
                                hover:text-white
                                hover:border-green-500/30
                                transition
                            "
                            data-action="edit"
                            data-member-id="${employee.id}"
                        >

                            <i
                                data-lucide="pencil"
                                class="w-4 h-4 inline-block mr-1.5"
                            ></i>

                            Editar

                        </button>


                        <button
                            type="button"
                            class="
                                w-10
                                h-10
                                rounded-xl
                                border
                                border-[#29322C]
                                bg-[#141A16]
                                text-slate-400
                                hover:text-white
                                hover:border-green-500/30
                                transition
                            "
                            title="Mais ações"
                            data-action="menu"
                            data-member-id="${employee.id}"
                        >

                            <i
                                data-lucide="more-horizontal"
                                class="w-5 h-5"
                            ></i>

                        </button>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


        lucide.createIcons();


    // ---------------------------------
    // Botão Editar
    // ---------------------------------

    container
        .querySelectorAll(
            '[data-action="edit"]'
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const memberId =
                            button.dataset.memberId;

                        openEditEmployeeModal(
                            memberId
                        );

                    }
                );

            }
        );

}

// =========================================
// MODAL DE EDIÇÃO
// =========================================

function openEditEmployeeModal(
    memberId
) {

    const employee =
        employees.find(
            employee =>
                employee.id === memberId
        );


    if (!employee) {

        console.error(
            "Funcionário não encontrado:",
            memberId
        );

        return;

    }


    const oldModal =
        document.getElementById(
            "employeeModal"
        );


    if (oldModal)
        oldModal.remove();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "employeeModal";


    modal.className = `
        fixed
        inset-0
        z-[100]
        bg-black/70
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
    `;


    const fullName =
        employee.profiles
            ?.full_name ||
        "";


    modal.innerHTML = `

        <div
            class="
                w-full
                max-w-3xl
                max-h-[92vh]
                overflow-hidden
                bg-[#101510]
                border
                border-[#29322C]
                rounded-[28px]
                shadow-2xl
                flex
                flex-col
            "
        >

            <!-- HEADER -->

            <div
                class="
                    px-6
                    md:px-8
                    py-6
                    border-b
                    border-[#222B25]
                    flex
                    items-center
                    justify-between
                    gap-4
                "
            >

                <div>

                    <p
                        class="
                            text-xs
                            uppercase
                            tracking-[0.18em]
                            text-green-400
                            font-medium
                        "
                    >
                        Equipe
                    </p>

                    <h2
                        class="
                            text-2xl
                            font-bold
                            mt-1
                        "
                    >
                        Editar funcionário
                    </h2>

                    <p
                        class="
                            text-sm
                            text-slate-500
                            mt-1
                        "
                    >
                        Atualize os dados administrativos.
                    </p>

                </div>


                <button
                    type="button"
                    id="closeEditEmployeeModal"
                    class="
                        w-10
                        h-10
                        rounded-xl
                        border
                        border-[#29322C]
                        bg-[#141A16]
                        text-slate-400
                        hover:text-white
                        hover:border-red-500/30
                        transition
                        flex
                        items-center
                        justify-center
                    "
                >

                    <i
                        data-lucide="x"
                        class="w-5 h-5"
                    ></i>

                </button>

            </div>


            <!-- FORM -->

            <form
                id="editEmployeeForm"
                class="
                    flex-1
                    overflow-y-auto
                    p-6
                    md:p-8
                    space-y-6
                "
            >

                <!-- NOME -->

                <div>

                    <label
                        class="
                            block
                            text-sm
                            text-slate-300
                            mb-2
                        "
                    >
                        Nome completo
                    </label>

                    <input
                        id="editEmployeeName"
                        type="text"
                        value="${fullName}"
                        required
                        class="
                            w-full
                            bg-[#0D120E]
                            border
                            border-[#29322C]
                            rounded-2xl
                            px-4
                            py-3.5
                            text-white
                            outline-none
                            focus:border-green-500/60
                            focus:ring-4
                            focus:ring-green-500/5
                        "
                    >

                </div>


                <!-- LOJA -->

                <div>

                    <label
                        class="
                            block
                            text-sm
                            text-slate-300
                            mb-2
                        "
                    >
                        Loja
                    </label>

                    <select
                        id="editEmployeeStore"
                        required
                        class="
                            w-full
                            bg-[#0D120E]
                            border
                            border-[#29322C]
                            rounded-2xl
                            px-4
                            py-3.5
                            text-white
                            outline-none
                            focus:border-green-500/60
                        "
                    >

                        <option value="">
                            Selecione a loja
                        </option>

                    </select>

                </div>


                <!-- CATEGORIA -->

                <div>

                    <label
                        class="
                            block
                            text-sm
                            text-slate-300
                            mb-2
                        "
                    >
                        Categoria
                    </label>

                    <select
                        id="editEmployeeCategory"
                        required
                        class="
                            w-full
                            bg-[#0D120E]
                            border
                            border-[#29322C]
                            rounded-2xl
                            px-4
                            py-3.5
                            text-white
                            outline-none
                            focus:border-green-500/60
                        "
                    >

                        <option value="">
                            Selecione a categoria
                        </option>

                        <option
                            value="MANAGER"
                        >
                            Gerente
                        </option>

                        <option
                            value="EMPLOYEE"
                        >
                            Funcionário
                        </option>

                        <option
                            value="TECHNICIAN"
                        >
                            Técnico
                        </option>

                    </select>

                </div>


                <!-- STATUS -->

                <div>

                    <label
                        class="
                            block
                            text-sm
                            text-slate-300
                            mb-2
                        "
                    >
                        Status
                    </label>

                    <select
                        id="editEmployeeStatus"
                        required
                        class="
                            w-full
                            bg-[#0D120E]
                            border
                            border-[#29322C]
                            rounded-2xl
                            px-4
                            py-3.5
                            text-white
                            outline-none
                            focus:border-green-500/60
                        "
                    >

                        <option value="true">
                            Ativo
                        </option>

                        <option value="false">
                            Inativo
                        </option>

                    </select>

                </div>


                <!-- MENSAGEM -->

                <div
                    id="editEmployeeMessage"
                    class="
                        hidden
                        rounded-2xl
                        px-4
                        py-3
                        text-sm
                    "
                ></div>

            </form>


            <!-- FOOTER -->

            <div
                class="
                    px-6
                    md:px-8
                    py-5
                    border-t
                    border-[#222B25]
                    flex
                    flex-col-reverse
                    sm:flex-row
                    sm:justify-end
                    gap-3
                "
            >

                <button
                    type="button"
                    id="cancelEditEmployeeButton"
                    class="
                        px-5
                        py-3
                        rounded-2xl
                        border
                        border-[#29322C]
                        bg-[#141A16]
                        text-slate-300
                        hover:text-white
                        transition
                    "
                >
                    Cancelar
                </button>


                <button
                    type="submit"
                    form="editEmployeeForm"
                    id="saveEditEmployeeButton"
                    class="
                        px-6
                        py-3
                        rounded-2xl
                        bg-green-500
                        text-black
                        font-semibold
                        hover:bg-green-400
                        transition
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                    "
                >

                    <i
                        data-lucide="save"
                        class="w-5 h-5"
                    ></i>

                    Salvar alterações

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ---------------------------------
    // Preencher lojas
    // ---------------------------------

    const storeSelect =
        document.getElementById(
            "editEmployeeStore"
        );


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

            if (
                store.id ===
                employee.store_id
            ) {

                option.selected =
                    true;

            }

            storeSelect.appendChild(
                option
            );

        }
    );


    // ---------------------------------
    // Categoria
    // ---------------------------------

    document
        .getElementById(
            "editEmployeeCategory"
        )
        .value =
        employee.role ||
        "";


    // ---------------------------------
    // Status
    // ---------------------------------

    document
        .getElementById(
            "editEmployeeStatus"
        )
        .value =
        String(
            employee.active
        );


    // ---------------------------------
    // Fechar
    // ---------------------------------

    document
        .getElementById(
            "closeEditEmployeeModal"
        )
        .addEventListener(
            "click",
            closeEmployeeModal
        );


    document
        .getElementById(
            "cancelEditEmployeeButton"
        )
        .addEventListener(
            "click",
            closeEmployeeModal
        );


    // ---------------------------------
    // Submit
    // ---------------------------------

    document
        .getElementById(
            "editEmployeeForm"
        )
        .addEventListener(
            "submit",
            async event => {
    
                event.preventDefault();
    
    
                const button =
                    document.getElementById(
                        "saveEditEmployeeButton"
                    );
    
    
                const nameInput =
                    document.getElementById(
                        "editEmployeeName"
                    );
    
    
                const storeInput =
                    document.getElementById(
                        "editEmployeeStore"
                    );
    
    
                const categoryInput =
                    document.getElementById(
                        "editEmployeeCategory"
                    );
    
    
                const statusInput =
                    document.getElementById(
                        "editEmployeeStatus"
                    );
    
    
                const fullName =
                    nameInput.value.trim();
    
    
                const storeId =
                    storeInput.value;
    
    
                const role =
                    categoryInput.value;
    
    
                const active =
                    statusInput.value ===
                    "true";
    
    
                if (!fullName) {
    
                    showEditEmployeeMessage(
                        "Informe o nome completo.",
                        "error"
                    );
    
                    return;
    
                }
    
    
                if (!storeId) {
    
                    showEditEmployeeMessage(
                        "Selecione a loja.",
                        "error"
                    );
    
                    return;
    
                }
    
    
                if (!role) {
    
                    showEditEmployeeMessage(
                        "Selecione a categoria.",
                        "error"
                    );
    
                    return;
    
                }
    
    
                button.disabled =
                    true;
    
    
                button.innerHTML = `
                    <i
                        data-lucide="loader-circle"
                        class="w-5 h-5 animate-spin"
                    ></i>
    
                    Salvando...
                `;
    
    
                lucide.createIcons();
    
    
                try {
    
                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .functions
                            .invoke(
                                "update-employee",
                                {
                                    body: {
    
                                        member_id:
                                            employee.id,
    
                                        full_name:
                                            fullName,
    
                                        store_id:
                                            storeId,
    
                                        role,
    
                                        category:
                                            categoryInput
                                                .selectedOptions[0]
                                                ?.textContent
                                                .trim() ||
                                            "",
    
                                        active
    
                                    }
                                }
                            );
    
    
                    if (error)
                        throw error;
    
    
                    if (
                        !data ||
                        !data.success
                    ) {
    
                        throw new Error(
                            data?.error ||
                            "Não foi possível salvar as alterações."
                        );
    
                    }
    
    
                    showEditEmployeeMessage(
                        "Funcionário atualizado com sucesso!",
                        "success"
                    );
    
    
                    // ---------------------------------
                    // Atualizar lista local
                    // ---------------------------------
    
                    employee.profiles =
                        employee.profiles ||
                        {};
    
    
                    employee.profiles.full_name =
                        fullName;
    
    
                    employee.store_id =
                        storeId;
    
    
                    employee.role =
                        role;
    
    
                    employee.category =
                        categoryInput
                            .selectedOptions[0]
                            ?.textContent
                            .trim() ||
                        "";
    
    
                    employee.active =
                        active;
    
    
                    const selectedStore =
                        stores.find(
                            store =>
                                store.id ===
                                storeId
                        );
    
    
                    employee.stores =
                        selectedStore
                            ? {
                                name:
                                    selectedStore.name
                            }
                            : {
                                name:
                                    "Sem loja"
                            };
    
    
                    renderEmployees();
    
    
                    setTimeout(
                        closeEmployeeModal,
                        900
                    );
    
                }
    
                catch (error) {
    
                    console.error(
                        "Erro ao editar funcionário:",
                        error
                    );
    
    
                    let realError =
                        error?.message ||
                        "Erro ao salvar alterações.";
    
    
                    try {
    
                        if (
                            error?.context &&
                            typeof
                                error.context.json ===
                                "function"
                        ) {
    
                            const response =
                                await error.context.json();
    
    
                            console.error(
                                "RESPOSTA DA EDGE FUNCTION:",
                                response
                            );
    
    
                            realError =
                                response?.error ||
                                realError;
    
                        }
    
                    }
    
                    catch (readError) {
    
                        console.error(
                            "Não foi possível ler a resposta da Edge Function:",
                            readError
                        );
    
                    }
    
    
                    showEditEmployeeMessage(
                        realError,
                        "error"
                    );
    
                }
    
    
                finally {
    
                    button.disabled =
                        false;
    
    
                    button.innerHTML = `
                        <i
                            data-lucide="save"
                            class="w-5 h-5"
                        ></i>
    
                        Salvar alterações
                    `;
    
    
                    lucide.createIcons();
    
                }
    
            }
        );
    }

// =========================================
// MENSAGEM — EDIÇÃO
// =========================================

function showEditEmployeeMessage(
    text,
    type = "error"
) {

    const message =
        document.getElementById(
            "editEmployeeMessage"
        );


    if (!message)
        return;


    message.className = `
        rounded-2xl
        px-4
        py-3
        text-sm
        ${
            type === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
        }
    `;


    message.textContent =
        text;


    message.classList.remove(
        "hidden"
    );

}

// =========================================
// MODAL
// =========================================

function openEmployeeModal() {

    const oldModal =
        document.getElementById(
            "employeeModal"
        );


    if (oldModal)
        oldModal.remove();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "employeeModal";


    modal.className = `
        fixed
        inset-0
        z-[100]
        bg-black/70
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
    `;


    modal.innerHTML = `

        <div
            class="
                w-full
                max-w-5xl
                max-h-[92vh]
                overflow-hidden
                bg-[#101510]
                border
                border-[#29322C]
                rounded-[28px]
                shadow-2xl
                flex
                flex-col
            "
        >

            <!-- HEADER -->

            <div
                class="
                    px-6
                    md:px-8
                    py-6
                    border-b
                    border-[#222B25]
                    flex
                    items-center
                    justify-between
                    gap-4
                "
            >

                <div>

                    <p
                        class="
                            text-xs
                            uppercase
                            tracking-[0.18em]
                            text-green-400
                            font-medium
                        "
                    >
                        Equipe
                    </p>

                    <h2
                        class="
                            text-2xl
                            font-bold
                            mt-1
                        "
                    >
                        Registrar funcionário
                    </h2>

                    <p
                        class="
                            text-sm
                            text-slate-500
                            mt-1
                        "
                    >
                        Defina os dados,
                        a loja e os acessos.
                    </p>

                </div>


                <button
                    type="button"
                    id="closeEmployeeModal"
                    class="
                        w-10
                        h-10
                        rounded-xl
                        border
                        border-[#29322C]
                        bg-[#141A16]
                        text-slate-400
                        hover:text-white
                        hover:border-red-500/30
                        transition
                        flex
                        items-center
                        justify-center
                    "
                >

                    <i
                        data-lucide="x"
                        class="w-5 h-5"
                    ></i>

                </button>

            </div>


            <!-- CONTEÚDO -->

            <form
                id="employeeForm"
                class="
                    flex-1
                    overflow-y-auto
                    p-6
                    md:p-8
                    space-y-8
                "
            >

                <!-- DADOS -->

                <section>

                    <div
                        class="
                            flex
                            items-center
                            gap-3
                            mb-5
                        "
                    >

                        <div
                            class="
                                w-9
                                h-9
                                rounded-xl
                                bg-green-500/10
                                border
                                border-green-500/10
                                flex
                                items-center
                                justify-center
                                text-green-400
                            "
                        >

                            <i
                                data-lucide="user-round"
                                class="w-4 h-4"
                            ></i>

                        </div>

                        <div>

                            <h3
                                class="
                                    font-semibold
                                "
                            >
                                Dados do funcionário
                            </h3>

                            <p
                                class="
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Informações de acesso
                            </p>

                        </div>

                    </div>


                    <div
                        class="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                        "
                    >

                        <!-- Nome -->

                        <div>

                            <label
                                class="
                                    block
                                    text-sm
                                    text-slate-300
                                    mb-2
                                "
                            >
                                Nome completo
                            </label>

                            <input
                                id="employeeName"
                                type="text"
                                autocomplete="name"
                                required
                                placeholder="Ex.: João Silva"
                                class="
                                    w-full
                                    bg-[#0D120E]
                                    border
                                    border-[#29322C]
                                    rounded-2xl
                                    px-4
                                    py-3.5
                                    text-white
                                    outline-none
                                    focus:border-green-500/60
                                    focus:ring-4
                                    focus:ring-green-500/5
                                "
                            >

                        </div>


                        <!-- E-mail -->

                        <div>

                            <label
                                class="
                                    block
                                    text-sm
                                    text-slate-300
                                    mb-2
                                "
                            >
                                E-mail de acesso
                            </label>

                            <input
                                id="employeeEmail"
                                type="email"
                                autocomplete="email"
                                required
                                placeholder="joao@empresa.com"
                                class="
                                    w-full
                                    bg-[#0D120E]
                                    border
                                    border-[#29322C]
                                    rounded-2xl
                                    px-4
                                    py-3.5
                                    text-white
                                    outline-none
                                    focus:border-green-500/60
                                    focus:ring-4
                                    focus:ring-green-500/5
                                "
                            >

                        </div>


                        <!-- Senha -->

                        <div>

                            <label
                                class="
                                    block
                                    text-sm
                                    text-slate-300
                                    mb-2
                                "
                            >
                                Senha inicial
                            </label>

                            <input
                                id="employeePassword"
                                type="password"
                                autocomplete="new-password"
                                required
                                minlength="6"
                                placeholder="Mínimo de 6 caracteres"
                                class="
                                    w-full
                                    bg-[#0D120E]
                                    border
                                    border-[#29322C]
                                    rounded-2xl
                                    px-4
                                    py-3.5
                                    text-white
                                    outline-none
                                    focus:border-green-500/60
                                    focus:ring-4
                                    focus:ring-green-500/5
                                "
                            >

                        </div>


                        <!-- Loja -->

                        <div>

                            <label
                                class="
                                    block
                                    text-sm
                                    text-slate-300
                                    mb-2
                                "
                            >
                                Loja
                            </label>

                            <select
                                id="employeeStore"
                                required
                                class="
                                    w-full
                                    bg-[#0D120E]
                                    border
                                    border-[#29322C]
                                    rounded-2xl
                                    px-4
                                    py-3.5
                                    text-white
                                    outline-none
                                    focus:border-green-500/60
                                "
                            >

                                <option value="">
                                    Selecione a loja
                                </option>

                            </select>

                        </div>

                    </div>

                </section>


                <!-- CATEGORIA -->

                <section>

                    <div
                        class="
                            flex
                            items-center
                            gap-3
                            mb-5
                        "
                    >

                        <div
                            class="
                                w-9
                                h-9
                                rounded-xl
                                bg-green-500/10
                                border
                                border-green-500/10
                                flex
                                items-center
                                justify-center
                                text-green-400
                            "
                        >

                            <i
                                data-lucide="badge-check"
                                class="w-4 h-4"
                            ></i>

                        </div>

                        <div>

                            <h3
                                class="
                                    font-semibold
                                "
                            >
                                Categoria
                            </h3>

                            <p
                                class="
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Define a função estrutural
                                do funcionário.
                            </p>

                        </div>

                    </div>


                    <select
                        id="employeeCategory"
                        required
                        class="
                            w-full
                            bg-[#0D120E]
                            border
                            border-[#29322C]
                            rounded-2xl
                            px-4
                            py-3.5
                            text-white
                            outline-none
                            focus:border-green-500/60
                        "
                    >

                        <option value="">
                            Selecione a categoria
                        </option>

                        <option
                            value="MANAGER"
                            data-category="Gerente"
                        >
                            Gerente
                        </option>

                        <option
                            value="EMPLOYEE"
                            data-category="Funcionário"
                        >
                            Funcionário
                        </option>

                        <option
                            value="TECHNICIAN"
                            data-category="Técnico"
                        >
                            Técnico
                        </option>

                    </select>

                </section>


                <!-- PERMISSÕES -->

                <section>

                    <div
                        class="
                            flex
                            flex-col
                            md:flex-row
                            md:items-center
                            md:justify-between
                            gap-3
                            mb-5
                        "
                    >

                        <div
                            class="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                class="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-green-500/10
                                    border
                                    border-green-500/10
                                    flex
                                    items-center
                                    justify-center
                                    text-green-400
                                "
                            >

                                <i
                                    data-lucide="shield-check"
                                    class="w-4 h-4"
                                ></i>

                            </div>

                            <div>

                                <h3
                                    class="
                                        font-semibold
                                    "
                                >
                                    Permissões de acesso
                                </h3>

                                <p
                                    class="
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    Escolha exatamente
                                    o que esse funcionário
                                    poderá acessar.
                                </p>

                            </div>

                        </div>


                        <span
                            id="permissionCounter"
                            class="
                                text-xs
                                text-slate-500
                            "
                        >
                            0 permissões selecionadas
                        </span>

                    </div>


                    <div
                        id="permissionsContainer"
                        class="
                            grid
                            grid-cols-1
                            lg:grid-cols-2
                            gap-4
                        "
                    ></div>

                </section>


                <!-- MENSAGEM -->

                <div
                    id="employeeMessage"
                    class="
                        hidden
                        rounded-2xl
                        px-4
                        py-3
                        text-sm
                    "
                ></div>

            </form>


            <!-- FOOTER -->

            <div
                class="
                    px-6
                    md:px-8
                    py-5
                    border-t
                    border-[#222B25]
                    flex
                    flex-col-reverse
                    sm:flex-row
                    sm:justify-end
                    gap-3
                "
            >

                <button
                    type="button"
                    id="cancelEmployeeButton"
                    class="
                        px-5
                        py-3
                        rounded-2xl
                        border
                        border-[#29322C]
                        bg-[#141A16]
                        text-slate-300
                        hover:text-white
                        transition
                    "
                >
                    Cancelar
                </button>


                <button
                    type="submit"
                    form="employeeForm"
                    id="saveEmployeeButton"
                    class="
                        px-6
                        py-3
                        rounded-2xl
                        bg-green-500
                        text-black
                        font-semibold
                        hover:bg-green-400
                        transition
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                    "
                >

                    <i
                        data-lucide="user-plus"
                        class="w-5 h-5"
                    ></i>

                    Registrar funcionário

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    lucide.createIcons();


    populateStores();

    populatePermissions();


    document
        .getElementById(
            "closeEmployeeModal"
        )
        .addEventListener(
            "click",
            closeEmployeeModal
        );


    document
        .getElementById(
            "cancelEmployeeButton"
        )
        .addEventListener(
            "click",
            closeEmployeeModal
        );


    document
        .getElementById(
            "employeeForm"
        )
        .addEventListener(
            "submit",
            submitEmployee
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeEmployeeModal();

            }

        }
    );

}


// =========================================
// FECHAR MODAL
// =========================================

function closeEmployeeModal() {

    const modal =
        document.getElementById(
            "employeeModal"
        );


    if (modal)
        modal.remove();

}


// =========================================
// LOJAS
// =========================================

function populateStores() {

    const select =
        document.getElementById(
            "employeeStore"
        );


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

            select.appendChild(
                option
            );

        }
    );

}


// =========================================
// PERMISSÕES
// =========================================

function populatePermissions() {

    const container =
        document.getElementById(
            "permissionsContainer"
        );


    const grouped =
        {};


    permissions.forEach(
        permission => {

            if (
                !grouped[
                    permission.category
                ]
            ) {

                grouped[
                    permission.category
                ] = [];

            }


            grouped[
                permission.category
            ].push(
                permission
            );

        }
    );


    Object.entries(
        grouped
    ).forEach(
        (
            [
                category,
                items
            ]
        ) => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className = `
                rounded-2xl
                border
                border-[#29322C]
                bg-[#0D120E]
                overflow-hidden
            `;


            wrapper.innerHTML = `

                <div
                    class="
                        px-4
                        py-3
                        border-b
                        border-[#222B25]
                        flex
                        items-center
                        justify-between
                    "
                >

                    <div>

                        <h4
                            class="
                                font-medium
                                text-slate-200
                            "
                        >
                            ${category}
                        </h4>

                        <p
                            class="
                                text-xs
                                text-slate-600
                                mt-0.5
                            "
                        >
                            ${items.length}
                            permissões
                        </p>

                    </div>


                    <button
                        type="button"
                        class="
                            select-all-permissions
                            text-xs
                            text-green-400
                            hover:text-green-300
                        "
                    >
                        Selecionar todas
                    </button>

                </div>


                <div
                    class="
                        p-3
                        space-y-1
                    "
                >

                    ${items
                        .map(
                            permission => `

                                <label
                                    class="
                                        flex
                                        items-center
                                        gap-3
                                        p-3
                                        rounded-xl
                                        hover:bg-[#141A16]
                                        cursor-pointer
                                        transition
                                    "
                                >

                                    <input
                                        type="checkbox"
                                        class="
                                            permission-checkbox
                                            accent-green-500
                                            w-4
                                            h-4
                                        "
                                        value="${permission.code}"
                                    >

                                    <span
                                        class="
                                            text-sm
                                            text-slate-300
                                        "
                                    >
                                        ${permission.name}
                                    </span>

                                </label>

                            `
                        )
                        .join("")}

                </div>

            `;


            container.appendChild(
                wrapper
            );


            wrapper
                .querySelector(
                    ".select-all-permissions"
                )
                .addEventListener(
                    "click",
                    () => {

                        const checkboxes =
                            wrapper.querySelectorAll(
                                ".permission-checkbox"
                            );


                        const shouldSelect =
                            [
                                ...checkboxes
                            ]
                            .some(
                                checkbox =>
                                    !checkbox.checked
                            );


                        checkboxes.forEach(
                            checkbox => {

                                checkbox.checked =
                                    shouldSelect;

                            }
                        );


                        updatePermissionCounter();

                    }
                );

        }
    );


    container
        .addEventListener(
            "change",
            event => {

                if (
                    event.target.classList.contains(
                        "permission-checkbox"
                    )
                ) {

                    updatePermissionCounter();

                }

            }
        );

}


// =========================================
// CONTADOR
// =========================================

function updatePermissionCounter() {

    const selected =
        document.querySelectorAll(
            "#employeeModal .permission-checkbox:checked"
        ).length;


    const counter =
        document.getElementById(
            "permissionCounter"
        );


    if (!counter)
        return;


    counter.textContent =
        `${selected} ${
            selected === 1
                ? "permissão"
                : "permissões"
        } selecionadas`;

}


// =========================================
// SUBMIT
// =========================================

async function submitEmployee(
    event
) {

    event.preventDefault();


    const form =
        document.getElementById(
            "employeeForm"
        );


    const button =
        document.getElementById(
            "saveEmployeeButton"
        );


    const message =
        document.getElementById(
            "employeeMessage"
        );


    const name =
        document.getElementById(
            "employeeName"
        ).value.trim();


    const email =
        document.getElementById(
            "employeeEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "employeePassword"
        ).value;


    const storeId =
        document.getElementById(
            "employeeStore"
        ).value;


    const categorySelect =
        document.getElementById(
            "employeeCategory"
        );


    const role =
        categorySelect.value;


    const category =
        categorySelect
            .selectedOptions[0]
            ?.dataset.category ||
        "";


    const selectedPermissions =
        [
            ...document.querySelectorAll(
                "#employeeModal .permission-checkbox:checked"
            )
        ]
        .map(
            checkbox =>
                checkbox.value
        );


    if (!name) {

        showEmployeeMessage(
            "Informe o nome completo.",
            "error"
        );

        return;

    }


    if (!email) {

        showEmployeeMessage(
            "Informe o e-mail de acesso.",
            "error"
        );

        return;

    }


    if (
        password.length < 6
    ) {

        showEmployeeMessage(
            "A senha precisa ter pelo menos 6 caracteres.",
            "error"
        );

        return;

    }


    if (!storeId) {

        showEmployeeMessage(
            "Selecione a loja.",
            "error"
        );

        return;

    }


    if (!role) {

        showEmployeeMessage(
            "Selecione a categoria.",
            "error"
        );

        return;

    }


    button.disabled = true;


    button.innerHTML = `
        <i
            data-lucide="loader-circle"
            class="w-5 h-5 animate-spin"
        ></i>

        Registrando...
    `;


    lucide.createIcons();


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .functions.invoke(
                    "create-employee",
                    {
                        body: {

                            email,

                            password,

                            full_name:
                                name,

                            store_id:
                                storeId,

                            category,

                            role,

                            permissions:
                                selectedPermissions

                        }
                    }
                );


        if (error)
            throw error;


        if (
            !data ||
            !data.success
        ) {

            throw new Error(
                data?.error ||
                "Não foi possível registrar o funcionário."
            );

        }


        showEmployeeMessage(
            "Funcionário registrado com sucesso!",
            "success"
        );


        form.reset();


        updatePermissionCounter();


        button.innerHTML = `
            <i
                data-lucide="check"
                class="w-5 h-5"
            ></i>

            Funcionário registrado
        `;


        lucide.createIcons();


        setTimeout(
            closeEmployeeModal,
            1200
        );


    }
    catch (error) {
    
        console.error(
            "Erro ao registrar funcionário:",
            error
        );
    
        // =====================================
        // TENTAR OBTER A RESPOSTA REAL
        // DA EDGE FUNCTION
        // =====================================
    
        let realError =
            error?.message ||
            "Erro ao registrar funcionário.";
    
        try {
    
            if (
                error?.context &&
                typeof error.context.json ===
                    "function"
            ) {
    
                const response =
                    await error.context.json();
    
                console.error(
                    "RESPOSTA DA EDGE FUNCTION:",
                    response
                );
    
                realError =
                    response?.error ||
                    realError;
    
            }
    
        }
            
        catch (readError) {
    
            console.error(
                "Não foi possível ler a resposta da Edge Function:",
                readError
            );
    
        }
    
    
        // =====================================
        // MOSTRAR ERRO REAL
        // =====================================
    
        showEmployeeMessage(
            realError,
            "error"
        );
    
    
        // =====================================
        // RESTAURAR BOTÃO
        // =====================================
    
        button.disabled =
            false;
    
    
        button.innerHTML = `
            <i
                data-lucide="user-plus"
                class="w-5 h-5"
            ></i>
    
            Registrar funcionário
        `;
    
    
        lucide.createIcons();
    
    }

}
// =========================================
// MENSAGEM
// =========================================

function showEmployeeMessage(
    text,
    type = "error"
) {

    const message =
        document.getElementById(
            "employeeMessage"
        );


    if (!message)
        return;


    message.className = `
        rounded-2xl
        px-4
        py-3
        text-sm
        ${
            type === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
        }
    `;


    message.textContent =
        text;


    message.classList.remove(
        "hidden"
    );

}

// =========================================
// EMPRESA
// =========================================

function setInputValue(id, value) {

    const input =
        document.getElementById(id);

    if (!input)
        return;

    input.value =
        value ?? "";

}


// =========================================
// ABRIR MODAL DA EMPRESA
// =========================================

function openCompanyModal() {

    if (!company) {

        alert(
            "Não foi possível carregar os dados da empresa."
        );

        return;

    }

    setInputValue(
        "companyName",
        company.name
    );

    setInputValue(
        "companyDocument",
        company.document
    );

    setInputValue(
        "companyPhone",
        company.phone
    );

    setInputValue(
        "companyEmail",
        company.email
    );

    const modal =
        document.getElementById(
            "companyModal"
        );

    if (!modal)
        return;

    modal.classList.remove("hidden");

    modal.classList.add("flex");

}


// =========================================
// FECHAR MODAL DA EMPRESA
// =========================================

function closeCompanyModal() {

    const modal =
        document.getElementById(
            "companyModal"
        );

    if (!modal)
        return;

    modal.classList.add("hidden");

    modal.classList.remove("flex");

}


// =========================================
// SALVAR EMPRESA
// =========================================

async function saveCompany(event) {

    event.preventDefault();

    if (!company?.id) {

        alert(
            "Empresa não encontrada."
        );

        return;

    }

    const payload = {
        name:
            document
                .getElementById("companyName")
                ?.value
                .trim(),

        document:
            document
                .getElementById("companyDocument")
                ?.value
                .trim() || null,

        phone:
            document
                .getElementById("companyPhone")
                ?.value
                .trim() || null,

        email:
            document
                .getElementById("companyEmail")
                ?.value
                .trim() || null
    };

    if (!payload.name) {

        alert(
            "Informe o nome da empresa."
        );

        return;

    }

    try {

        const savedCompany =
            await Api.updateCompany(
                company.id,
                payload
            );

        company = {
            ...company,
            ...savedCompany
        };

        if (appContext?.company) {

            appContext.company = {
                ...appContext.company,
                ...savedCompany
            };

        }

        closeCompanyModal();

        alert(
            "Dados da empresa atualizados com sucesso!"
        );

    }
    catch (error) {

        console.error(
            "Erro ao atualizar empresa:",
            error
        );

        alert(
            error.message ||
            "Não foi possível atualizar a empresa."
        );

    }

}


// =========================================
// MODAL DE LOJAS
// =========================================

function openStoresModal() {

    const modal =
        document.getElementById(
            "storesModal"
        );

    const container =
        document.getElementById(
            "storesEditContainer"
        );

    if (!modal) {

        alert(
            "O modal de lojas ainda não foi encontrado no HTML."
        );

        return;

    }

    if (!container) {

        alert(
            "O container de lojas ainda não foi encontrado no HTML."
        );

        return;

    }

    renderStores();

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );

}

// =========================================
// RENDERIZAR LOJAS
// =========================================

function renderStores() {

    const container =
        document.getElementById(
            "storesEditContainer"
        );

    if (!container) {
        return;
    }

    if (
        !stores ||
        stores.length === 0
    ) {

        container.innerHTML = `
            <div
                class="
                    rounded-2xl
                    border
                    border-dashed
                    border-[#29322C]
                    bg-[#0D120E]
                    p-8
                    text-center
                "
            >

                <div
                    class="
                        mx-auto
                        mb-4
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-[#29322C]
                        bg-[#141A16]
                        text-slate-500
                    "
                >
                    <i
                        data-lucide="store"
                        class="h-6 w-6"
                    ></i>
                </div>

                <h4
                    class="
                        text-lg
                        font-semibold
                        text-white
                    "
                >
                    Nenhuma loja encontrada
                </h4>

                <p
                    class="
                        mt-2
                        text-sm
                        text-slate-500
                    "
                >
                    Nenhuma loja foi cadastrada para esta empresa.
                </p>

            </div>
        `;

        lucide.createIcons();

        return;

    }

    container.innerHTML = stores
        .map((store, index) => {

            const storeName =
                store.name ||
                store.nome ||
                `Loja ${index + 1}`;

            const storeDocument =
                store.document ||
                store.cnpj ||
                "";

            const storePhone =
                store.phone ||
                store.telephone ||
                "";

            const storeEmail =
                store.email ||
                "";

            const storeAddress =
                store.address ||
                store.address_line ||
                store.endereco ||
                "";

            return `
                <div
                    class="
                        rounded-2xl
                        border
                        border-[#29322C]
                        bg-[#0D120E]
                        p-5
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

                        <div
                            class="
                                flex
                                min-w-0
                                items-center
                                gap-3
                            "
                        >

                            <div
                                class="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-[#29322C]
                                    bg-[#141A16]
                                    text-green-400
                                "
                            >
                                <i
                                    data-lucide="store"
                                    class="h-5 w-5"
                                ></i>
                            </div>

                            <div
                                class="min-w-0"
                            >

                                <h4
                                    class="
                                        truncate
                                        text-lg
                                        font-semibold
                                        text-white
                                    "
                                >
                                    ${escapeHtml(storeName)}
                                </h4>

                                <p
                                    class="
                                        mt-1
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    Loja ${index + 1}
                                </p>

                            </div>

                        </div>

                        <span
                            class="
                                shrink-0
                                rounded-full
                                border
                                border-green-500/20
                                bg-green-500/10
                                px-3
                                py-1
                                text-xs
                                font-medium
                                text-green-400
                            "
                        >
                            Cadastrada
                        </span>

                    </div>

                    <div
                        class="
                            mt-5
                            grid
                            gap-3
                            md:grid-cols-2
                        "
                    >

                        <div
                            class="
                                rounded-xl
                                border
                                border-[#222B25]
                                bg-[#101510]
                                p-3
                            "
                        >

                            <p
                                class="
                                    text-xs
                                    text-slate-500
                                "
                            >
                                CNPJ / Documento
                            </p>

                            <p
                                class="
                                    mt-1
                                    break-words
                                    text-sm
                                    text-slate-200
                                "
                            >
                                ${
                                    escapeHtml(
                                        storeDocument || "Não informado"
                                    )
                                }
                            </p>

                        </div>

                        <div
                            class="
                                rounded-xl
                                border
                                border-[#222B25]
                                bg-[#101510]
                                p-3
                            "
                        >

                            <p
                                class="
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Telefone
                            </p>

                            <p
                                class="
                                    mt-1
                                    break-words
                                    text-sm
                                    text-slate-200
                                "
                            >
                                ${
                                    escapeHtml(
                                        storePhone || "Não informado"
                                    )
                                }
                            </p>

                        </div>

                        <div
                            class="
                                rounded-xl
                                border
                                border-[#222B25]
                                bg-[#101510]
                                p-3
                            "
                        >

                            <p
                                class="
                                    text-xs
                                    text-slate-500
                                "
                            >
                                E-mail
                            </p>

                            <p
                                class="
                                    mt-1
                                    break-words
                                    text-sm
                                    text-slate-200
                                "
                            >
                                ${
                                    escapeHtml(
                                        storeEmail || "Não informado"
                                    )
                                }
                            </p>

                        </div>

                        <div
                            class="
                                rounded-xl
                                border
                                border-[#222B25]
                                bg-[#101510]
                                p-3
                            "
                        >

                            <p
                                class="
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Endereço
                            </p>

                            <p
                                class="
                                    mt-1
                                    break-words
                                    text-sm
                                    text-slate-200
                                "
                            >
                                ${
                                    escapeHtml(
                                        storeAddress || "Não informado"
                                    )
                                }
                            </p>

                        </div>

                    </div>

                </div>
            `;

        })
        .join("");

    lucide.createIcons();

}

// =========================================
// PROTEGER TEXTO HTML
// =========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

// =========================================
// FECHAR MODAL DE LOJAS
// =========================================

function closeStoresModal() {

    const modal =
        document.getElementById(
            "storesModal"
        );

    if (!modal)
        return;

    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );

}
