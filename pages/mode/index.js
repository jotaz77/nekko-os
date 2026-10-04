// =========================================
// NEKKO OS
// Mode Select
// =========================================

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function logoMarkup(url, icon) {

    if (url) {
        return `
            <img
                src="${escapeAttribute(url)}"
                alt="Logo"
                loading="eager"
                onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');"
            >
            <i data-lucide="${icon}" class="hidden"></i>
        `;
    }

    return `<i data-lucide="${icon}"></i>`;
}

document.addEventListener("DOMContentLoaded", () => {

    const raw = sessionStorage.getItem("nekko_mode_context");

    if (!raw) {
        window.location.href = "../login/login.html";
        return;
    }

    const {
        user,
        company,
        membership,
        stores = []
    } = JSON.parse(raw);

    const grid = document.getElementById("modeGrid");

    if (!grid) return;

    grid.innerHTML = "";

    // ---------------------------------
    // Card CEO
    // ---------------------------------

    grid.innerHTML += `
        <button
            type="button"
            class="access-card enter-ceo w-full text-left p-4 sm:p-5"
            aria-label="Entrar como CEO"
        >
            <div class="relative z-10 flex items-center gap-4 h-full">

                <div class="access-logo">
                    ${logoMarkup(company?.logo_url, "crown")}
                </div>

                <div class="min-w-0 flex-1">
                    <p class="text-[10px] font-extrabold tracking-[.16em] text-[#4ADE80] uppercase">
                        Acesso executivo
                    </p>

                    <h2 class="mt-1 text-lg sm:text-xl font-extrabold tracking-[-.025em] truncate">
                        CEO
                    </h2>

                    <p class="mt-1 text-xs text-slate-400 truncate">
                        ${escapeHtml(company?.name || "Gerenciar toda a empresa")}
                    </p>
                </div>

                <i data-lucide="arrow-right" class="access-arrow w-5 h-5 shrink-0"></i>

            </div>
        </button>
    `;

    // ---------------------------------
    // Cards das lojas
    // ---------------------------------

    stores.forEach(store => {

        grid.innerHTML += `
            <button
                type="button"
                class="access-card enter-store w-full text-left p-4 sm:p-5"
                data-id="${escapeAttribute(store.id)}"
                aria-label="Entrar na loja ${escapeAttribute(store.name)}"
            >
                <div class="relative z-10 flex items-center gap-4 h-full">

                    <div class="access-logo">
                        ${logoMarkup(store.logo_url, "store")}
                    </div>

                    <div class="min-w-0 flex-1">
                        <p class="text-[10px] font-extrabold tracking-[.16em] text-[#8F9A9F] uppercase">
                            Loja
                        </p>

                        <h2 class="mt-1 text-lg sm:text-xl font-extrabold tracking-[-.025em] truncate">
                            ${escapeHtml(store.name)}
                        </h2>

                        <p class="mt-1 text-xs text-slate-400 truncate">
                            Acessar ambiente da unidade
                        </p>
                    </div>

                    <i data-lucide="arrow-right" class="access-arrow w-5 h-5 shrink-0"></i>

                </div>
            </button>
        `;

    });

    // ---------------------------------
    // Card Nova Loja
    // ---------------------------------

    grid.innerHTML += `
        <button
            type="button"
            id="create-store"
            class="access-card new-store-card w-full text-left p-4 sm:p-5"
            aria-label="Criar nova loja"
        >
            <div class="relative z-10 flex items-center gap-4 h-full">

                <div class="access-logo">
                    <i data-lucide="plus"></i>
                </div>

                <div class="min-w-0 flex-1">
                    <p class="text-[10px] font-extrabold tracking-[.16em] text-pink-400 uppercase">
                        Expansão
                    </p>

                    <h2 class="mt-1 text-lg sm:text-xl font-extrabold tracking-[-.025em]">
                        Nova Loja
                    </h2>

                    <p class="mt-1 text-xs text-slate-400 truncate">
                        Cadastre uma nova unidade
                    </p>
                </div>

                <i data-lucide="plus" class="access-arrow w-5 h-5 shrink-0"></i>

            </div>
        </button>
    `;

    // ---------------------------------
    // Entrar como CEO
    // ---------------------------------

    document
        .querySelector(".enter-ceo")
        ?.addEventListener("click", () => {

            Storage.setContext({
                user,
                company,
                store: null,
                role: Roles.CEO
            });

            sessionStorage.removeItem("nekko_mode_context");

            window.location.href = "../menu/ceo/index.html";
        });

    // ---------------------------------
    // Entrar como Loja
    // ---------------------------------

    document
        .querySelectorAll(".enter-store")
        .forEach(button => {

            button.addEventListener("click", () => {

                const store = stores.find(
                    s => s.id === button.dataset.id
                );

                if (!store) return;

                Storage.setContext({
                    user,
                    company,
                    store,
                    role: Roles.MANAGER
                });

                sessionStorage.removeItem("nekko_mode_context");

                window.location.href = "../menu/index.html";
            });
        });

    // ---------------------------------
    // Criar nova loja
    // ---------------------------------

    document
        .getElementById("create-store")
        ?.addEventListener("click", () => {
            window.location.href = "../store/create.html?mode=add-store";
        });

    lucide.createIcons();
});
