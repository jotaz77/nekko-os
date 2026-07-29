document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons();

    const dropArea = document.getElementById("dropArea");
    const fileInput = document.getElementById("fileInput");
    const statusText = document.getElementById("statusText");
    const importButton = document.getElementById("importButton");

    let selectedFile = null;

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

        console.log("Arquivo selecionado:", selectedFile);

        alert(
            "Próximo passo: ler a planilha e importar para o Supabase."
        );

    });

});
