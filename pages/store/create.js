// =========================================
// NEKKO OS
// Criar Loja
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("storeForm");

    const isAddStore =
        new URLSearchParams(window.location.search)
            .get("mode") === "add-store";
    
    if (isAddStore) {
    
        document.getElementById("pageTitle").textContent =
            "Nova Loja";
    
        document.getElementById("pageSubtitle").textContent =
            "Cadastre uma nova unidade da empresa.";
    
    }

    if (!form) {
        console.error("Formulário 'storeForm' não encontrado.");
        return;
    }

    const companyId = localStorage.getItem("company_id");

    if (!companyId) {

        window.location.href = "../company/create.html";
        return;

    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        hideMessage();

        setButtonLoading("btnCreate", "Criando loja...");

        try {

            const { data, error } = await supabaseClient
                .from("stores")
                .insert({

                    company_id: companyId,

                    name: document.getElementById("name").value.trim(),

                    phone: document.getElementById("phone").value.trim() || null,

                    email: document.getElementById("email").value.trim() || null,

                    zip_code: document.getElementById("zip").value.trim() || null,

                    state: document.getElementById("state").value.trim().toUpperCase() || null,

                    city: document.getElementById("city").value.trim() || null,

                    neighborhood: document.getElementById("neighborhood").value.trim() || null,

                    street: document.getElementById("street").value.trim() || null,

                    number: document.getElementById("number").value.trim() || null,

                    complement: document.getElementById("complement").value.trim() || null,

                    active: true

                })
                .select()
                .single();

            if (error) throw error;

            // Salva contexto da loja
            localStorage.setItem("store_id", data.id);
            localStorage.setItem("store_name", data.name);

            showMessage("Loja criada com sucesso!", "success");

            setTimeout(() => {

                window.location.href = "../mode/index.html";

            }, 1000);

        } catch (err) {

            console.error(err);

            showMessage(err.message || "Erro ao criar loja.");

        } finally {

            resetButton("btnCreate");

        }

    });

});
