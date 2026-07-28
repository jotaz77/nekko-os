const form = document.getElementById("companyForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    hideMessage();

    setButtonLoading("btnCreate", "Criando empresa...");

    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (!user) {

            window.location.href = "../login/login.html";
            return;

        }

        const name = document.getElementById("name").value.trim();
        const documentNumber = document.getElementById("document").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();

        const { data, error } = await supabaseClient
            .from("companies")
            .insert({

                owner_id: user.id,
                name,
                document: documentNumber || null,
                phone,
                email

            })
            .select()
            .single();

        if (error) throw error;

        const { error: memberError } = await supabaseClient
            .from("company_members")
            .insert({

                company_id: data.id,
                profile_id: user.id,
                role: Roles.CEO

            });

        if (memberError) throw memberError;

        // Salva o contexto da empresa na sessão
        localStorage.setItem("company_id", data.id);
        localStorage.setItem("company_name", data.name);

        showMessage("Empresa criada com sucesso! Redirecionando...", "success");

        setTimeout(() => {

            window.location.href = "../store/create.html";

        }, 800);

    } catch (err) {

        console.error(err);

        showMessage(err.message);

    } finally {

        resetButton("btnCreate");

    }

});