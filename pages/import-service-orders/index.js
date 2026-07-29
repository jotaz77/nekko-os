document.addEventListener("DOMContentLoaded", async () => {

    lucide.createIcons();

    // ---------------------------------
    // Bootstrap
    // ---------------------------------

    const boot = await Bootstrap.init();

    if (boot.status !== "READY") {

        alert("Sua sessão expirou.");

        location.href = "../login/index.html";

        return;

    }

    const context = boot.context;

    // ---------------------------------
    // Elementos
    // ---------------------------------

    const dropArea = document.getElementById("dropArea");
    const fileInput = document.getElementById("fileInput");
    const statusText = document.getElementById("statusText");
    const importButton = document.getElementById("importButton");

    let selectedFile = null;
    let spreadsheetData = [];
    let importing = false;

    // ---------------------------------
    // Atualizar Interface
    // ---------------------------------

    function updateUI(file) {

        selectedFile = file;

        statusText.innerHTML = `
            <span class="text-green-500 font-semibold">
                ✔ ${file.name}
            </span>

            <br>

            <span class="text-slate-400">
                ${(file.size / 1024).toFixed(2)} KB
            </span>

            <br><br>

            <span class="text-yellow-400">
                Clique em "Importar" para analisar a planilha.
            </span>
        `;

        importButton.disabled = false;

        importButton.classList.remove(
            "opacity-50",
            "cursor-not-allowed",
            "bg-green-600/40"
        );

        importButton.classList.add(
            "bg-green-600",
            "hover:bg-green-700"
        );

    }

    // ---------------------------------
    // Ler Planilha
    // ---------------------------------

    function readSpreadsheet(file) {

        const reader = new FileReader();

        reader.onload = (event) => {

            try {

                const data = new Uint8Array(event.target.result);

                const workbook = XLSX.read(data, {

                    type: "array"

                });

                const firstSheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];

                spreadsheetData =
                    XLSX.utils.sheet_to_json(firstSheet, {

                        defval: ""

                    });

                console.clear();

                console.table(spreadsheetData);

                const columns =
                    Object.keys(
                        spreadsheetData[0] || {}
                    );

                statusText.innerHTML = `

                    <div class="space-y-2">

                        <div class="text-green-500 font-semibold">

                            ✔ ${file.name}

                        </div>

                        <div class="text-slate-300">

                            📄 ${spreadsheetData.length} registros encontrados

                        </div>

                        <div class="text-slate-300">

                            📑 ${columns.length} colunas encontradas

                        </div>

                        <div class="text-green-400">

                            ✔ Planilha carregada com sucesso

                        </div>

                    </div>

                `;

                importButton.innerHTML =
                    `Importar ${spreadsheetData.length} Ordens de Serviço`;

            }

            catch (error) {

                console.error(error);

                statusText.innerHTML = `

                    <span class="text-red-500">

                        Erro ao ler a planilha.

                    </span>

                `;

            }

        };

        reader.readAsArrayBuffer(file);

    }

    // ---------------------------------
    // Converter Linha
    // ---------------------------------

    function buildServiceOrder(row) {

        return {

            company_id: context.company.id,

            store_id: context.store
                ? context.store.id
                : null,

            user_id: context.user.id,

            created_by: context.user.id,

            customer_name:
                row["Cliente"] || "",

            customer_phone:
                row["Telefone"] || null,

            customer_cpf:
                row["CPF/CNPJ"] || null,

            brand:
                row["Marca"] || "",

            model:
                row["Modelo"] || "",

            device_type:
                row["Tipo"] || "Celular",

            imei:
                row["IMEI / Serial"] ||
                row["IMEI"] ||
                null,

            service:
                row["Serviço"] ||
                "Importação",

            reported_issue:
                row["Defeito"] || "",

            problem:
                row["Defeito"] || "",

            observations:
                row["Observações"] || null,

            notes:
                row["Observações"] || null,

            technician:
                row["Técnico"] || null,

            lock_password:
                row["Senha"] || null,

            price:
                Number(
                    String(
                        row["Valor"] || 0
                    ).replace(",", ".")
                ) || 0,

            entry_date:
                row["Data de Entrada"] || null,

            delivery_date:
                row["Data de Saída"] || null,

            status:
                row["Status"] ||
                "Aguardando análise"

        };

    }

    // ---------------------------------
    // Salvar Ordem
    // ---------------------------------

    async function saveServiceOrder(order) {

        return await Api.createServiceOrder(order);

    }
    
    // ---------------------------------
    // Importar
    // ---------------------------------

    async function importServiceOrders() {

        if (importing)
            return;

        importing = true;

        importButton.disabled = true;

        let success = 0;
        let failed = 0;

        const errors = [];

        try {

            for (let i = 0; i < spreadsheetData.length; i++) {

                const row = spreadsheetData[i];

                statusText.innerHTML = `

                    <div class="space-y-2">

                        <div class="text-yellow-400 font-semibold">

                            Importando...

                        </div>

                        <div class="text-slate-300">

                            ${i + 1} de ${spreadsheetData.length}

                        </div>

                    </div>

                `;

                try {

                    const order = buildServiceOrder(row);

                    await saveServiceOrder(order);

                    success++;

                }

                catch (error) {

                    console.error(error);

                    failed++;

                    errors.push({

                        linha: i + 2,

                        cliente: row["Cliente"],

                        erro: error.message

                    });

                }

            }

            console.table(errors);

            statusText.innerHTML = `

                <div class="space-y-2">

                    <div class="text-green-500 font-bold">

                        ✔ Importação concluída

                    </div>

                    <div>

                        Sucesso:
                        <strong>${success}</strong>

                    </div>

                    <div>

                        Falhas:
                        <strong>${failed}</strong>

                    </div>

                </div>

            `;

            alert(

                `Importação concluída!

Sucesso: ${success}

Falhas: ${failed}`

            );

        }

        finally {

            importing = false;

            importButton.disabled = false;

        }

    }

    // ---------------------------------
    // Seleção pelo Input
    // ---------------------------------

    fileInput.addEventListener("change", (event) => {

        const file = event.target.files[0];

        if (!file)
            return;

        updateUI(file);

    });

    // ---------------------------------
    // Drag Over
    // ---------------------------------

    dropArea.addEventListener("dragover", (event) => {

        event.preventDefault();

        dropArea.classList.add(

            "border-green-500",

            "bg-[#182019]"

        );

    });

    // ---------------------------------
    // Drag Leave
    // ---------------------------------

    dropArea.addEventListener("dragleave", () => {

        dropArea.classList.remove(

            "border-green-500",

            "bg-[#182019]"

        );

    });

    // ---------------------------------
    // Drop
    // ---------------------------------

    dropArea.addEventListener("drop", (event) => {

        event.preventDefault();

        dropArea.classList.remove(

            "border-green-500",

            "bg-[#182019]"

        );

        const file = event.dataTransfer.files[0];

        if (!file)
            return;

        fileInput.files = event.dataTransfer.files;

        updateUI(file);

    });

    // ---------------------------------
    // Botão Importar
    // ---------------------------------

    importButton.addEventListener("click", async () => {

        if (!selectedFile)
            return;

        if (spreadsheetData.length === 0) {

            readSpreadsheet(selectedFile);

            return;

        }

        await importServiceOrders();

    });

});
