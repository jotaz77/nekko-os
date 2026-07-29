// =========================================
// NEKKO OS
// Login
// =========================================

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    const button = document.querySelector(
        "#loginForm button[type='submit']"
    );

    try {

        button.disabled = true;
        button.textContent = "Entrando...";

        // ---------------------------------
        // Login
        // ---------------------------------
        
        await Auth.login(email, password);
        
        // Limpa o contexto da sessão anterior
        Storage.clear();
        
        // ---------------------------------
        // Bootstrap
        // ---------------------------------
        
        const result = await Bootstrap.init();

        switch (result.status) {

            case "LOGIN":

                window.location.href =
                    "../login/login.html";
                break;

            case "COMPANY":

                window.location.href =
                    "../company/create.html";
                break;

            case "STORE":

                window.location.href =
                    "../store/create.html";
                break;

            case "MODE_SELECT":

                sessionStorage.setItem(
                    "nekko_mode_context",
                    JSON.stringify({
                        user: result.user,
                        company: result.company,
                        membership: result.membership,
                        stores: result.stores
                    })
                );

                window.location.href =
                    "../mode/index.html";
                break;

            case "READY":

                window.location.href =
                    "../menu/index.html";
                break;

            default:

                throw new Error(
                    "Estado de inicialização inválido."
                );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Não foi possível realizar o login."
        );

    }

    finally {

        button.disabled = false;
        button.textContent = "Entrar";

    }

});

// =========================================
// Criar conta
// =========================================

document
    .getElementById("registerLink")
    .addEventListener("click", (event) => {

        event.preventDefault();

        window.location.href = "register.html";

    });
