// ======================================
// UI HELPERS
// Nekko OS
// ======================================

function showMessage(text, type = "error") {

    const box = document.getElementById("message");

    if (!box) return;

    box.textContent = text;

    box.classList.remove("hidden");

    const styles = {

        success: "border-green-500 bg-green-500/10 text-green-400",

        error: "border-red-500 bg-red-500/10 text-red-400",

        warning: "border-yellow-500 bg-yellow-500/10 text-yellow-400",

        info: "border-blue-500 bg-blue-500/10 text-blue-400"

    };

    box.className =
        `rounded-xl border p-4 mb-6 text-sm font-medium transition-all duration-300 ${styles[type] || styles.error}`;

}

function hideMessage() {

    const box = document.getElementById("message");

    if (!box) return;

    box.classList.add("hidden");

    box.textContent = "";

}

function setButtonLoading(buttonId, text = "Carregando...") {

    const btn = document.getElementById(buttonId);

    if (!btn) return;

    btn.dataset.originalText = btn.innerHTML;

    btn.disabled = true;

    btn.innerHTML = text;

}

function resetButton(buttonId) {

    const btn = document.getElementById(buttonId);

    if (!btn) return;

    btn.disabled = false;

    btn.innerHTML = btn.dataset.originalText;

}