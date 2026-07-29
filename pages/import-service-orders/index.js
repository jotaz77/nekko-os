document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons();

    const dropArea = document.getElementById("dropArea");
    const fileInput = document.getElementById("fileInput");
    const statusText = document.getElementById("statusText");
    const importButton = document.getElementById("importButton");

    let selectedFile = null;
    let spreadsheetData = [];

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

                const firstSheet = workbook.Sheets[
                    workbook.SheetNames[0]
                ];

                spreadsheetData = XLSX.utils.sheet_to_json(firstSheet, {
                    defval: ""
                });

                console.clear();

                console.log("Planilha:", spreadsheetData);

                const columns = Object.keys(
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
    // Seleção pelo Input
    // ---------------------------------

    fileInput.addEventListener("change", (event) => {

        const file = event.target.files[0];

        if (!file) return;

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

        if (!file) return;

        fileInput.files = event.dataTransfer.files;

        updateUI(file);

    });

    // ---------------------------------
    // Importar
    // ---------------------------------

    importButton.addEventListener("click", () => {

        if (!selectedFile) return;

        if (spreadsheetData.length === 0) {

            readSpreadsheet(selectedFile);

            return;

        }

        console.log("Dados prontos para importar:");

        console.table(spreadsheetData);

        alert(
            `Tudo pronto!\n\n${spreadsheetData.length} registros carregados.\n\nPróximo passo: importar para o Supabase.`
        );

    });

});
