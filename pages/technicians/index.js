document.addEventListener("DOMContentLoaded", async () => {

    try {

        const result = await Bootstrap.init();

        if (result.status !== "READY") {

            window.location.href = "../login/login.html";
            return;

        }

        console.log("✅ Tela de Técnicos carregada.");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
