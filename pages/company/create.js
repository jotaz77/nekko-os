const form = document.getElementById("companyForm");
const submitButton = document.getElementById("btnCreate");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    hideMessage();

    const name = document.getElementById("name").value.trim();
    const documentNumber = document.getElementById("document").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name) {
        showMessage("Informe o nome da empresa para continuar.");
        document.getElementById("name").focus();
        return;
    }

    if (email && !document.getElementById("email").checkValidity()) {
        showMessage("Informe um endereço de e-mail válido.");
        document.getElementById("email").focus();
        return;
    }

    submitButton.disabled = true;
    setButtonLoading("btnCreate", "Criando empresa...");

    try {
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError) throw userError;

        if (!user) {
            window.location.href = "../login/login.html";
            return;
        }

        const { data: company, error: companyError } = await supabaseClient
            .from("companies")
            .insert({
                owner_id: user.id,
                name,
                document: documentNumber || null,
                phone: phone || null,
                email: email || null
            })
            .select()
            .single();

        if (companyError) throw companyError;

        const { error: memberError } = await supabaseClient
            .from("company_members")
            .insert({
                company_id: company.id,
                profile_id: user.id,
                role: Roles.CEO
            });

        if (memberError) {
            console.error("[NEKKO OS] Empresa criada, mas houve erro ao vincular o CEO:", memberError);
            throw new Error(
                "A empresa foi cadastrada, mas não foi possível vincular seu usuário como administrador. " +
                "Entre em contato com o suporte antes de tentar criar outra empresa."
            );
        }

        // Atualiza somente o contexto da empresa. Não limpa o armazenamento inteiro,
        // pois isso poderia apagar a sessão/autenticação do Supabase.
        localStorage.setItem("company_id", company.id);
        localStorage.setItem("company_name", company.name);

        // Evita reaproveitar uma loja selecionada anteriormente, sem apagar outros dados.
        localStorage.removeItem("store_id");
        localStorage.removeItem("store_name");
        sessionStorage.removeItem("store_id");
        sessionStorage.removeItem("store_name");

        showMessage("Empresa criada com sucesso! Vamos configurar sua primeira loja.", "success");

        window.setTimeout(() => {
            window.location.href = "../store/create.html";
        }, 900);

    } catch (error) {
        console.error("[NEKKO OS] Erro ao criar empresa:", error);
        showMessage(error?.message || "Não foi possível criar a empresa. Tente novamente.");
        submitButton.disabled = false;
        resetButton("btnCreate");
    }
});
