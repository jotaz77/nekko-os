// NEKKO OS — Página de planos e contratação
// Não altera a tela de Configurações nem grava assinaturas diretamente.
// A criação do checkout e a proteção contra duplicidade permanecem no Edge Function.

(() => {
    const ACTIVE_OR_BLOCKING_STATUSES = new Set([
        "active", "pending", "past_due", "trialing",
        "incomplete", "unpaid", "paused"
    ]);

    const $ = id => document.getElementById(id);
    let appContext = null;
    let currentSubscription = null;
    let plans = [];

    function setState(message, type = "info") {
        const el = $("pageState");
        if (!el) return;
        el.textContent = message;
        el.className = "panel rounded-2xl p-5 text-sm " +
            (type === "error" ? "text-red-300 border-red-500/30" : "text-slate-300");
        el.classList.remove("hidden");
    }

    function money(value, currency = "BRL") {
        const amount = Number(value);
        if (!Number.isFinite(amount)) return "Valor indisponível";
        return new Intl.NumberFormat("pt-BR", {
            style: "currency", currency
        }).format(amount);
    }

    function statusLabel(status) {
        const labels = {
            active: "Ativa", pending: "Pendente", past_due: "Pagamento pendente",
            trialing: "Em avaliação", incomplete: "Incompleta",
            unpaid: "Não paga", paused: "Pausada"
        };
        return labels[String(status || "").toLowerCase()] || status || "Indefinida";
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        }[char]));
    }

    async function loadContext() {
        const result = await Bootstrap.init();
        if (result.status !== "READY" || !result.context) {
            window.location.href = "../login/login.html";
            return false;
        }
        appContext = result.context;
        if (appContext.role !== Roles.CEO) {
            setState("Somente o CEO da empresa pode consultar e contratar planos.", "error");
            return false;
        }
        return true;
    }

    async function loadSubscription() {
        const { data, error } = await supabaseClient
            .from("company_subscriptions")
            .select("id, plan_id, status, amount, currency, created_at, next_payment_at, cancel_at_period_end")
            .eq("company_id", appContext.company.id)
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) throw error;

        const rows = data || [];
        // A assinatura mais recente que esteja em estado ativo/bloqueante prevalece.
        currentSubscription = rows.find(row =>
            ACTIVE_OR_BLOCKING_STATUSES.has(String(row.status || "").toLowerCase())
        ) || null;

        if (!currentSubscription) return;

        let plan = null;
        if (currentSubscription.plan_id) {
            const result = await supabaseClient
                .from("subscription_plans")
                .select("name, code, amount, currency, billing_interval")
                .eq("id", currentSubscription.plan_id)
                .maybeSingle();
            if (result.error) throw result.error;
            plan = result.data;
        }

        $("currentPlanName").textContent = plan?.name || "Assinatura vinculada";
        const interval = (plan?.billing_interval || "month") === "year" ? "ano" : "mês";
        $("currentPlanDetails").textContent =
            `${money(currentSubscription.amount, currentSubscription.currency || plan?.currency || "BRL")} / ${interval}` +
            (currentSubscription.next_payment_at
                ? ` • Próxima cobrança: ${new Date(currentSubscription.next_payment_at).toLocaleDateString("pt-BR")}`
                : "");
        $("currentStatus").textContent = statusLabel(currentSubscription.status);
        $("currentSubscription").classList.remove("hidden");

        const isActive = String(currentSubscription.status).toLowerCase() === "active";
        $("subscriptionLockMessage").textContent = isActive
            ? "Sua assinatura está ativa. Por segurança, não é possível trocar de plano nem iniciar outra contratação enquanto esta assinatura estiver ativa. Entre em contato com o atendimento NEKKO para tratar de qualquer solicitação."
            : "Já existe uma assinatura em andamento ou com pendência para esta empresa. Aguarde a confirmação ou regularize a situação antes de iniciar outra contratação.";
    }

    async function loadPlans() {
        const { data, error } = await supabaseClient
            .from("subscription_plans")
            .select("id, code, name, description, amount, currency, billing_interval, active")
            .eq("active", true)
            .order("amount", { ascending: true });
        if (error) throw error;
        plans = data || [];
    }

    function renderPlans() {
        const grid = $("plansGrid");
        grid.innerHTML = "";

        if (!plans.length) {
            setState("Nenhum plano está disponível para contratação no momento.", "error");
            return;
        }

        plans.forEach((plan, index) => {
            const blocked = Boolean(currentSubscription);
            const interval = plan.billing_interval === "year" ? "ano" : "mês";
            const featured = index === 1 && plans.length === 3;
            const card = document.createElement("article");
            card.className = `plan-card rounded-3xl p-6 md:p-7 flex flex-col ${featured ? "featured" : ""}`;
            card.innerHTML = `
                ${featured ? '<span class="absolute top-4 right-4 text-[9px] uppercase tracking-wider font-extrabold text-green-300 bg-green-500/10 border border-green-500/25 rounded-full px-3 py-1">Mais escolhido</span>' : ""}
                <p class="text-[10px] tracking-[.2em] uppercase text-green-400 font-extrabold">NEKKO OS</p>
                <h2 class="text-2xl font-black mt-3">${escapeHtml(plan.name)}</h2>
                <p class="muted text-sm mt-2 min-h-10">${escapeHtml(plan.description || "Plano mensal NEKKO OS")}</p>
                <p class="text-3xl font-black mt-7">${money(plan.amount, plan.currency || "BRL")}<span class="text-sm font-medium text-slate-400"> / ${interval}</span></p>
                <div class="h-px bg-[#26342B] my-6"></div>
                <p class="text-xs text-slate-400 mb-6">Cobrança recorrente processada pelo Mercado Pago.</p>
                <button type="button" class="primary-btn w-full rounded-xl py-3.5 mt-auto" data-plan-code="${escapeHtml(plan.code)}" ${blocked ? "disabled" : ""}>
                    ${blocked ? "Assinatura já vinculada" : "Assinar este plano"}
                </button>
            `;
            grid.appendChild(card);
        });

        grid.querySelectorAll("[data-plan-code]").forEach(button => {
            button.addEventListener("click", () => startCheckout(button.dataset.planCode, button));
        });

        if (currentSubscription) {
            setState("Os planos estão visíveis para consulta, mas a contratação está bloqueada porque esta empresa já possui uma assinatura em andamento.");
        } else {
            setState("Selecione um plano para iniciar a contratação segura pelo Mercado Pago.");
        }
    }

    async function startCheckout(planCode, button) {
        if (!appContext?.company?.id || !planCode || currentSubscription) return;

        const confirmed = window.confirm(
            "Você será direcionado ao Mercado Pago para autorizar a assinatura mensal. Deseja continuar?"
        );
        if (!confirmed) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = '<span class="spinner" aria-hidden="true"></span> Preparando checkout...';

        try {
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session?.access_token) throw new Error("Sua sessão expirou. Entre novamente no NEKKO OS.");

            const response = await fetch(
                `${CONFIG.SUPABASE_URL}/functions/v1/create-subscription-checkout`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session.access_token}`,
                        "apikey": CONFIG.SUPABASE_ANON_KEY
                    },
                    body: JSON.stringify({
                        company_id: appContext.company.id,
                        plan_code: planCode
                    })
                }
            );

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result.error || result.message || `Não foi possível iniciar o checkout (HTTP ${response.status}).`);
            }
            if (!result.checkout_url || typeof result.checkout_url !== "string") {
                throw new Error("O Mercado Pago não retornou um endereço de checkout válido.");
            }

            window.location.assign(result.checkout_url);
        } catch (error) {
            console.error("[NEKKO OS] Erro ao iniciar checkout:", error);
            window.alert(error.message || "Não foi possível iniciar a contratação. Tente novamente.");
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    document.addEventListener("DOMContentLoaded", async () => {
        try {
            if (!(await loadContext())) return;
            await Promise.all([loadSubscription(), loadPlans()]);
            renderPlans();
            if (window.lucide) window.lucide.createIcons();
        } catch (error) {
            console.error("[NEKKO OS] Erro na página de planos:", error);
            setState(error.message || "Não foi possível carregar os planos. Tente novamente mais tarde.", "error");
        }
    });
})();
