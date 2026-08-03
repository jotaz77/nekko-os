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

        console.log("ROLE:", role);
        console.log("STORE:", store);
        console.log("CONTEXT:", result.context);

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
                title: "Lista de OS",
                description: "Consultar ordens de serviço",
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
                title: "Técnicos",
                description: "Cadastrar e acompanhar produtividade",
                icon: "wrench",
                href: "../technicians/index.html",
                roles: [
                    Roles.CEO,
                ]
            },

            {
                title: "Clientes",
                description: "Gerenciar clientes",
                icon: "users",
                href: "../customers/index.html",
                roles: [
                    Roles.CEO,
                    Roles.MANAGER,
                    Roles.EMPLOYEE,
                    Roles.TECHNICIAN
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
                        class="group
                               bg-[#141A16]
                               border
                               border-[#29322C]
                               rounded-3xl
                               p-6
                               transition-all
                               duration-300
                               hover:border-[#22C55E]
                               hover:-translate-y-2
                               hover:bg-[#1B231D]
                               hover:shadow-[0_0_25px_rgba(34,197,94,.12)]">

                        <div class="mb-6">

                            <i
                                data-lucide="${module.icon}"
                                class="w-10 h-10 text-slate-400 group-hover:text-green-500 transition-colors">
                            </i>

                        </div>

                        <h3 class="text-xl font-semibold mb-2 group-hover:text-green-400 transition-colors">
                            ${module.title}
                        </h3>

                        <p class="text-sm text-slate-500 leading-relaxed">
                            ${module.description}
                        </p>

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
