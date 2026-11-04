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

    let companyId = localStorage.getItem("company_id");

    // Se estiver adicionando uma nova loja, pega a empresa do contexto
    if (!companyId && isAddStore) {
    
        const raw = sessionStorage.getItem("nekko_mode_context");
    
        if (raw) {
    
            const { company } = JSON.parse(raw);
    
            companyId = company.id;
    
        }
    
    }
    
    // Continua sendo obrigatório existir uma empresa
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

            // A criação da loja invalida qualquer contexto antigo de outra conta.
            // A tela de modos será reconstruída usando a sessão autenticada atual.
            Storage.clear();
            sessionStorage.clear();

            showMessage("Loja criada com sucesso!", "success");

            setTimeout(async () => {

                try {
                    const result = await Bootstrap.init();

                    if (result.status === "MODE_SELECT") {
                        sessionStorage.setItem(
                            "nekko_mode_context",
                            JSON.stringify({
                                user: result.user,
                                company: result.company,
                                membership: result.membership,
                                stores: result.stores
                            })
                        );

                        window.location.href = "../mode/index.html";
                        return;
                    }

                    if (result.status === "READY") {
                        window.location.href = "../menu/index.html";
                        return;
                    }

                    if (result.status === "COMPANY") {
                        window.location.href = "../company/create.html";
                        return;
                    }

                    if (result.status === "STORE") {
                        window.location.href = "../store/create.html";
                        return;
                    }

                    throw new Error("Não foi possível carregar os modos da conta atual.");

                } catch (bootstrapError) {
                    console.error("Erro ao reconstruir o contexto após criar loja:", bootstrapError);
                    showMessage(
                        bootstrapError.message || "Loja criada, mas não foi possível carregar os modos."
                    );
                }

            }, 500);

        } catch (err) {

            console.error(err);

            showMessage(err.message || "Erro ao criar loja.");

        } finally {

            resetButton("btnCreate");

        }

    });

});
