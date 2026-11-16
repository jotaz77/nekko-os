// =========================================
// NEKKO OS | Cadastro de loja
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("storeForm");
    if (!form) {
        console.error("[NEKKO OS] Formulário storeForm não encontrado.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const isAddStore = params.get("mode") === "add-store";
    const title = document.getElementById("pageTitle");
    const subtitle = document.getElementById("pageSubtitle");
    const mobileTitle = document.getElementById("mobileTitle");
    const mobileSubtitle = document.getElementById("mobileSubtitle");

    if (isAddStore) {
        if (title) title.textContent = "Cadastre uma nova loja";
        if (subtitle) subtitle.textContent = "Adicione uma unidade à estrutura da sua empresa.";
        if (mobileTitle) mobileTitle.innerHTML = 'Nova <span class="text-emerald-400">loja</span>';
        if (mobileSubtitle) mobileSubtitle.textContent = "Cadastre uma nova unidade da sua empresa.";
    }

    let companyId = localStorage.getItem("company_id");
    if (!companyId && isAddStore) {
        try {
            const raw = sessionStorage.getItem("nekko_mode_context");
            const context = raw ? JSON.parse(raw) : null;
            companyId = context?.company?.id || null;
        } catch (error) {
            console.warn("[NEKKO OS] Contexto de modo inválido:", error);
        }
    }

    if (!companyId) {
        window.location.href = "../company/create.html";
        return;
    }

    // Busca de endereço pelo serviço público ViaCEP.
    const zipInput = document.getElementById("zip");
    const cepStatus = document.getElementById("cepStatus");
    let cepRequestId = 0;

    function setCepStatus(message, state = "neutral") {
        if (!cepStatus) return;
        cepStatus.textContent = message;
        cepStatus.className = "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] " +
            (state === "success" ? "text-emerald-400" : state === "error" ? "text-red-400" : "text-slate-500");
    }

    async function lookupCep() {
        const cep = (zipInput?.value || "").replace(/\D/g, "");
        const requestId = ++cepRequestId;
        if (cep.length !== 8) {
            setCepStatus("ViaCEP");
            return;
        }

        setCepStatus("Buscando...");
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error("Não foi possível consultar o CEP agora.");
            const address = await response.json();
            if (requestId !== cepRequestId) return;
            if (address.erro) {
                setCepStatus("Não encontrado", "error");
                showMessage("CEP não encontrado. Confira os números ou preencha o endereço manualmente.");
                return;
            }

            // Preenche os campos retornados sem apagar dados que o usuário já digitou.
            const fields = [
                ["street", address.logradouro],
                ["neighborhood", address.bairro],
                ["city", address.localidade],
                ["state", address.uf]
            ];
            for (const [id, value] of fields) {
                const input = document.getElementById(id);
                if (input && value && !input.value.trim()) input.value = value;
            }
            setCepStatus("Endereço localizado", "success");
        } catch (error) {
            if (requestId !== cepRequestId) return;
            console.error("[NEKKO OS] Erro ao consultar CEP:", error);
            setCepStatus("Falha na busca", "error");
            showMessage("Não foi possível consultar o CEP. Você pode preencher o endereço manualmente.");
        }
    }

    zipInput?.addEventListener("input", () => {
        const digits = zipInput.value.replace(/\D/g, "").slice(0, 8);
        zipInput.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
        if (digits.length === 8) lookupCep();
        else {
            cepRequestId++;
            setCepStatus("ViaCEP");
        }
    });
    zipInput?.addEventListener("blur", lookupCep);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideMessage();

        const name = document.getElementById("name").value.trim();
        if (!name) {
            showMessage("Informe o nome da loja para continuar.");
            document.getElementById("name").focus();
            return;
        }

        const emailInput = document.getElementById("email");
        if (emailInput.value.trim() && !emailInput.checkValidity()) {
            showMessage("Informe um e-mail válido para a loja.");
            emailInput.focus();
            return;
        }

        const button = document.getElementById("btnCreate");
        button.disabled = true;
        setButtonLoading("btnCreate", "Criando loja...");

        try {
            const { data, error } = await supabaseClient
                .from("stores")
                .insert({
                    company_id: companyId,
                    name,
                    phone: document.getElementById("phone").value.trim() || null,
                    email: emailInput.value.trim() || null,
                    zip_code: zipInput.value.trim() || null,
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

            // Não usar Storage.clear(): Storage é a API nativa do navegador.
            // Removemos apenas referências antigas de loja/contexto, preservando a sessão.
            localStorage.removeItem("store_id");
            localStorage.removeItem("store_name");
            sessionStorage.removeItem("store_id");
            sessionStorage.removeItem("store_name");
            sessionStorage.removeItem("nekko_mode_context");

            showMessage("Loja criada com sucesso! Preparando seu ambiente...", "success");

            window.setTimeout(async () => {
                try {
                    if (typeof Bootstrap === "undefined" || typeof Bootstrap.init !== "function") {
                        throw new Error("O módulo de inicialização não foi carregado. Atualize a página e tente novamente.");
                    }

                    const result = await Bootstrap.init();

                    if (result.status === "MODE_SELECT") {
                        sessionStorage.setItem("nekko_mode_context", JSON.stringify({
                            user: result.user,
                            company: result.company,
                            membership: result.membership,
                            stores: result.stores
                        }));
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
                    throw new Error("A loja foi criada, mas não foi possível identificar o próximo passo da conta.");
                } catch (bootstrapError) {
                    console.error("[NEKKO OS] Erro ao reconstruir contexto após criar loja:", bootstrapError);
                    showMessage("A loja foi criada, mas houve um problema ao abrir o sistema: " +
                        (bootstrapError.message || "erro inesperado") +
                        ". Atualize a página para continuar.");
                    button.disabled = false;
                    resetButton("btnCreate");
                }
            }, 650);
        } catch (error) {
            console.error("[NEKKO OS] Erro ao criar loja:", error);
            showMessage(error?.message || "Não foi possível criar a loja. Tente novamente.");
            button.disabled = false;
            resetButton("btnCreate");
        }
    });
});
