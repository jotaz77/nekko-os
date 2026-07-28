async function carregarClientes() {
    const tbody = document.getElementById("clientesTable");

    tbody.innerHTML = "<tr><td colspan='4' class='p-4'>Carregando...</td></tr>";

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "../login/login.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);

        tbody.innerHTML =
            "<tr><td colspan='4' class='p-4 text-red-500'>Erro ao carregar clientes.</td></tr>";

        return;
    }

    if (data.length === 0) {
        tbody.innerHTML =
            "<tr><td colspan='4' class='p-4'>Nenhum cliente cadastrado.</td></tr>";

        return;
    }

    tbody.innerHTML = "";

    data.forEach(cliente => {

        tbody.innerHTML += `
            <tr class="border-b hover:bg-slate-50">

                <td class="p-4">${cliente.name}</td>

                <td class="p-4">${cliente.phone ?? "-"}</td>

                <td class="p-4">${cliente.whatsapp ?? "-"}</td>

                <td class="p-4 text-right">

                    <button
                        class="text-blue-600 hover:underline">

                        Editar

                    </button>

                </td>

            </tr>
        `;

    });

}

carregarClientes();