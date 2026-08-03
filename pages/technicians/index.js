// =========================================
// NEKKO OS
// Técnicos
// =========================================

let context = null;

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const result = await Bootstrap.init();

        if (result.status !== "READY") {

            window.location.href = "../login/login.html";
            return;

        }

        context = result.context;

        await loadTechnicians();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});


// =========================================
// Carregar Técnicos
// =========================================

async function loadTechnicians() {

    try {

        const technicians = await Api.getTechnicians(
            context.company.id
        );

        renderTechnicians(technicians);

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// =========================================
// Renderizar
// =========================================

function renderTechnicians(technicians) {

    const list =
        document.getElementById("techniciansList");

    const empty =
        document.getElementById("emptyState");

    list.innerHTML = "";

    if (!technicians.length) {

        empty.classList.remove("hidden");

        return;

    }

    empty.classList.add("hidden");

    technicians.forEach(technician => {

        list.innerHTML += `

        <div
            class="bg-[#141A16]
                   border
                   border-[#29322C]
                   rounded-3xl
                   p-6
                   hover:border-green-500
                   transition
                   cursor-pointer">

            <div class="flex items-center justify-between">

                <h2 class="text-xl font-semibold">

                    ${technician.name}

                </h2>

                <span class="${
                    technician.active

                        ? "text-green-400"

                        : "text-red-400"

                } text-sm font-semibold">

                    ${
                        technician.active

                            ? "Ativo"

                            : "Inativo"
                    }

                </span>

            </div>

            <p class="text-slate-500 mt-3">

                📍 ${
                    technician.stores?.name ||

                    "Todas as lojas"
                }

            </p>

            <div
                class="border-t border-[#29322C] my-5">
            </div>

            <div class="space-y-2">

                <p>

                    🔧 Serviços:
                    <strong>0</strong>

                </p>

                <p>

                    💰 Faturamento:
                    <strong>R$ 0,00</strong>

                </p>

            </div>

        </div>

        `;

    });

}
