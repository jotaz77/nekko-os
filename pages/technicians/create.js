// =========================================
// NEKKO OS
// Cadastro de Técnicos
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

        await loadStores();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});


// =========================================
// Carregar lojas
// =========================================

async function loadStores() {

    if (!context.company?.id)
        return;

    const { data, error } = await supabaseClient

        .from("stores")

        .select("*")

        .eq("company_id", context.company.id)

        .order("name");

    if (error)
        throw error;

    const select = document.getElementById("store");

    data.forEach(store => {

        select.innerHTML += `

            <option value="${store.id}">

                ${store.name}

            </option>

        `;

    });

}


// =========================================
// Salvar Técnico
// =========================================

document

    .getElementById("technicianForm")

    .addEventListener("submit", async (e) => {

        e.preventDefault();

        try {

            const technician = {

                company_id: context.company.id,

                store_id:

                    document
                        .getElementById("store")
                        .value || null,

                name:

                    document
                        .getElementById("name")
                        .value
                        .trim(),

                phone:

                    document
                        .getElementById("phone")
                        .value
                        .trim() || null,

                email:

                    document
                        .getElementById("email")
                        .value
                        .trim() || null,

                active:

                    document
                        .querySelector('input[name="active"]:checked')
                        .value === "true"

            };

            const { error } = await supabaseClient

                .from("technicians")

                .insert(technician);

            if (error)
                throw error;

            alert("Técnico cadastrado com sucesso!");

            window.location.href = "./index.html";

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

    });
