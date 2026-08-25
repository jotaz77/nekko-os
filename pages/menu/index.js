// =========================================
// NEKKO OS
// Menu
// =========================================

async function changeStore() {

    const context = Storage.getContext();

    if (context.role === Roles.CEO) {

        window.location.href = "../mode/index.html";
        return;

    }

    await Auth.logout();

    Storage.clear();
    sessionStorage.clear();

    window.location.href = "../login/login.html";

}

document.addEventListener("DOMContentLoaded", async () => {

    try {

        // ---------------------------------
        // Inicializar contexto
        // ---------------------------------

        const result = await Bootstrap.init();

        if (result.status !== "READY") {

            window.location.href = "../login/login.html";
            return;

        }

        const {
            user,
            company,
            store,
            role
        } = result.context;

        // ---------------------------------
        // Usuário
        // ---------------------------------

        document.getElementById("userName").textContent =
            user.name ||
            user.email ||
            "Usuário";

        // ---------------------------------
        // Badges
        // ---------------------------------
        
        const modeBadge = document.getElementById("modeBadge");
        const currentStore = document.getElementById("currentStore");
        
        // Badge do modo (CEO, MANAGER, etc.)
        modeBadge.classList.remove("hidden");
        modeBadge.textContent = role;
        
        // Nome da loja no centro da tela
        if (currentStore) {
        
            currentStore.textContent =
                store?.name || "Todas as Lojas";
        
        }

        // ---------------------------------
        // Módulos
        // ---------------------------------

        const modules = [

            {
                title: "Dashboard",
                description: "Visão geral da empresa",
                icon: "layout-dashboard",
                href: "../dashboard/index.html",
                roles: [Roles.CEO]
            },

            {
                title: "Registrar Venda",
                description: "Registrar uma nova venda",
                icon: "shopping-cart",
                href: "../sales/create.html",
                roles: [Roles.CEO, Roles.MANAGER]
            },

            {
                title: "Nova OS",
                description: "Criar uma ordem de serviço",
                icon: "clipboard-plus",
                href: "../service-orders/create.html",
                roles: [
                    Roles.CEO,
                    Roles.MANAGER,
                    Roles.EMPLOYEE,
                    Roles.TECHNICIAN
                ]
            },

            {
                title: "OS Clientes",
                description: "Consultar ordens de serviço de clientes",
                icon: "clipboard-list",
                href: "../service-orders/index.html",
                roles: [
                    Roles.CEO,
                    Roles.MANAGER,
                    Roles.EMPLOYEE,
                    Roles.TECHNICIAN
                ]
            },

            {
                title: "OS Lojistas",
                description: "Ordens de serviço para lojistas",
                icon: "store",
                href: "../dealer-service-orders/index.html",
                roles: [
                    Roles.CEO,
                    Roles.MANAGER,
                    Roles.EMPLOYEE,
                    Roles.TECHNICIAN
                ]
            },

            {
                title: "Técnicos",
                description: "Cadastrar e acompanhar produtividade",
                icon: "wrench",
                href: "../technicians/index.html",
                roles: [
                    Roles.CEO,
                ]
            },

            {
                title: "Estoque",
                description: "Peças e produtos",
                icon: "package",
                href: "../inventory/index.html",
                roles: [
                    Roles.CEO,
                    Roles.MANAGER,
                    Roles.EMPLOYEE
                ]
            },

            {
                title: "Trocar Loja",
                description: "Entrar em outra unidade",
                icon: "repeat",
                href: "#",
                action: "change-store",
                roles: [
                    Roles.CEO,
                    Roles.MANAGER,
                    Roles.EMPLOYEE,
                    Roles.TECHNICIAN
                ]
            },

            {
                title: "Importar OS",
                description: "Migrar ordens de serviço de outro sistema",
                icon: "file-up",
                href: "../import-service-orders/index.html",
                roles: [Roles.CEO]
            },

            {
                title: "Configurações",
                description: "Preferências do sistema",
                icon: "settings",
                href: "../settings/index.html",
                roles: [Roles.CEO]
            }

        ];
        // ---------------------------------
        // Renderizar módulos
        // ---------------------------------

        const grid = document.getElementById("menuGrid");

        grid.innerHTML = "";

        modules
            .filter(module => module.roles.includes(role))
            .forEach(module => {

                grid.innerHTML += `

                    <a
                        href="${module.href || "#"}"
                        ${module.action ? `data-action="${module.action}"` : ""}
                
                        class="
                            group
                            relative
                            overflow-hidden
                
                            min-h-[210px]
                
                            bg-[#0C110E]/85
                            backdrop-blur-xl
                
                            border
                            border-[#202923]
                
                            rounded-[28px]
                
                            p-6
                            md:p-7
                
                            transition-all
                            duration-300
                
                            hover:-translate-y-1
                
                            hover:border-green-500/30
                
                            hover:bg-[#101710]/95
                
                            hover:shadow-[0_18px_50px_rgba(0,0,0,.25)]
                
                            flex
                            flex-col
                        "
                    >
                
                
                        <!-- BRILHO DO CARD -->
                
                        <div
                            class="
                                absolute
                                -top-20
                                -right-20
                
                                w-40
                                h-40
                
                                rounded-full
                
                                bg-green-400/5
                
                                blur-3xl
                
                                opacity-0
                                group-hover:opacity-100
                
                                transition
                                duration-500
                            "
                        ></div>
                
                
                
                        <!-- LINHA SUPERIOR -->
                
                        <div
                            class="
                                relative
                                flex
                                items-start
                                justify-between
                                gap-4
                            "
                        >
                
                            <!-- ÍCONE -->
                
                            <div
                                class="
                                    w-12
                                    h-12
                
                                    rounded-2xl
                
                                    bg-white/[0.025]
                
                                    border
                                    border-[#29322C]
                
                                    flex
                                    items-center
                                    justify-center
                
                                    text-slate-400
                
                                    group-hover:text-green-400
                                    group-hover:border-green-500/20
                                    group-hover:bg-green-500/5
                
                                    transition-all
                                    duration-300
                                "
                            >
                
                                <i
                                    data-lucide="${module.icon}"
                                    class="
                                        w-5
                                        h-5
                
                                        transition
                                        duration-300
                
                                        group-hover:scale-110
                                    "
                                ></i>
                
                            </div>
                
                
                
                            <!-- SETA -->
                
                            <div
                                class="
                                    w-8
                                    h-8
                
                                    rounded-xl
                
                                    border
                                    border-[#202923]
                
                                    flex
                                    items-center
                                    justify-center
                
                                    text-slate-700
                
                                    group-hover:text-green-400
                                    group-hover:border-green-500/20
                
                                    transition-all
                                    duration-300
                                "
                            >
                
                                <i
                                    data-lucide="arrow-up-right"
                                    class="
                                        w-4
                                        h-4
                
                                        transition
                                        duration-300
                
                                        group-hover:translate-x-0.5
                                        group-hover:-translate-y-0.5
                                    "
                                ></i>
                
                            </div>
                
                        </div>
                
                
                
                        <!-- CONTEÚDO -->
                
                        <div
                            class="
                                relative
                                mt-8
                                flex-1
                            "
                        >
                
                            <h3
                                class="
                                    text-lg
                                    md:text-xl
                
                                    font-bold
                
                                    text-white
                
                                    group-hover:text-green-400
                
                                    transition-colors
                                    duration-300
                                "
                            >
                                ${module.title}
                            </h3>
                
                
                            <p
                                class="
                                    text-sm
                                    text-slate-500
                
                                    leading-6
                
                                    mt-2
                                "
                            >
                                ${module.description}
                            </p>
                
                        </div>
                
                
                
                        <!-- RODAPÉ -->
                
                        <div
                            class="
                                relative
                
                                flex
                                items-center
                                justify-between
                
                                mt-7
                                pt-4
                
                                border-t
                                border-[#18201B]
                            "
                        >
                
                            <span
                                class="
                                    text-[10px]
                                    uppercase
                                    tracking-[0.2em]
                
                                    text-slate-700
                
                                    group-hover:text-green-400/60
                
                                    transition
                                "
                            >
                                Módulo
                            </span>
                
                
                            <span
                                class="
                                    text-xs
                                    font-semibold
                
                                    text-slate-600
                
                                    group-hover:text-slate-300
                
                                    transition
                                "
                            >
                                Acessar
                            </span>
                
                        </div>
                
                    </a>
                
                `;

            });

        lucide.createIcons();

        document
            .querySelectorAll('[data-action="change-store"]')
            .forEach(button => {
        
                button.addEventListener("click", async (event) => {
        
                    event.preventDefault();
        
                    await changeStore();
        
                });
        
            });

        console.log("✅ Menu carregado.");
        console.log("Contexto:", result.context);

    }

    catch (error) {

        console.error("Erro ao iniciar menu:", error);

        alert(error.message);

    }

});
