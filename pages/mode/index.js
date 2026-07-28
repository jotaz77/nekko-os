// =========================================
// NEKKO OS
// Mode Select
// =========================================

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
        stores
    } = JSON.parse(raw);

    const grid = document.getElementById("modeGrid");

    grid.innerHTML = "";

    // ---------------------------------
    // Card CEO
    // ---------------------------------

    grid.innerHTML += `
        <div
            class="bg-[#141A16]
                   border
                   border-[#29322C]
                   rounded-3xl
                   p-6
                   hover:border-[#22C55E]
                   transition">

            <div class="flex items-center justify-between">

                <div>

                    <h2 class="text-2xl font-semibold flex items-center gap-3">

                        👑 CEO

                    </h2>

                    <p class="text-slate-400 mt-2">

                        Gerenciar toda a empresa

                    </p>

                </div>

                <button
                    class="enter-ceo
                           bg-green-500
                           hover:bg-green-600
                           px-5
                           py-3
                           rounded-xl
                           font-medium">

                    Entrar

                </button>

            </div>

        </div>
    `;

    // ---------------------------------
    // Cards das lojas
    // ---------------------------------

    stores.forEach(store => {

        grid.innerHTML += `
            <div
                class="bg-[#141A16]
                       border
                       border-[#29322C]
                       rounded-3xl
                       p-6
                       hover:border-[#22C55E]
                       transition">

                <div class="flex items-center justify-between">

                    <div>

                        <h2 class="text-2xl font-semibold flex items-center gap-3">

                            🏪 ${store.name}

                        </h2>

                        <p class="text-slate-400 mt-2">

                            Atendimento da unidade

                        </p>

                    </div>

                    <button
                        class="enter-store
                               bg-green-500
                               hover:bg-green-600
                               px-5
                               py-3
                               rounded-xl
                               font-medium"
                        data-id="${store.id}">

                        Entrar

                    </button>

                </div>

            </div>
        `;

    });

    lucide.createIcons();

    // ---------------------------------
    // Entrar como CEO
    // ---------------------------------

    document
        .querySelector(".enter-ceo")
        .addEventListener("click", () => {

            Storage.setContext({

                user,
                company,
                store: null,
                role: Roles.CEO

            });

            sessionStorage.removeItem("nekko_mode_context");

            window.location.href = "../menu/index.html";

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

                Storage.setContext({

                    user,
                    company,
                    store,
                    role: membership.role

                });

                sessionStorage.removeItem("nekko_mode_context");

                window.location.href = "../menu/index.html";

            });

        });

});