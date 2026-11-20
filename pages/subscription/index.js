// NEKKO OS — Página de planos e contratação

(() => {
    const ACTIVE_OR_BLOCKING_STATUSES = new Set([
        "active", "pending", "past_due", "trialing",
        "incomplete", "unpaid", "paused"
    ]);

    const PLAN_PROFILES = {
        baixa_demanda: "Para assistências com menor volume de atendimentos.",
        media_demanda: "Para assistências com volume intermediário de atendimentos.",
        alta_demanda: "Para assistências com alto volume de atendimentos."
    };
    const PLAN_FEATURES = {
        baixa_demanda: ["Até 10 ordens de serviço por semana", "1 loja por empresa"],
        media_demanda: ["Até 15 ordens de serviço por semana", "Até 2 lojas por empresa"],
        alta_demanda: ["Ordens de serviço ilimitadas", "Até 4 filiais", "Todos os recursos dos outros planos", "Emissão de nota fiscal"]
    };
    const PLATFORM_FEATURES = ["Registro de vendas", "Dashboard de gestão"];
    const DAILY_TEST_COMPANY_ID = "39a3915a-9c0d-449c-9776-b93c650f222d";

    const $ = id => document.getElementById(id);
    let appContext = null;
    let currentSubscription = null;
    let plans = [];
    let checkoutInProgress = false;

    function setState(message, type = "info") {
        const el = $("pageState");
        if (!el) return;
        el.textContent = message;
        el.className = "panel page-state" + (type === "error" ? " is-error" : "");
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
            .select("id, plan_id, status, amount, currency, created_at, next_payment_at, cancel_at_period_end, billing_provider, external_subscription_id, last_paid_at, environment:metadata->>environment")
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

        const canManagePending = currentSubscription.status === "pending" &&
            currentSubscription.billing_provider === "mercadopago" &&
            currentSubscription.environment === "test" &&
            currentSubscription.external_subscription_id &&
            !currentSubscription.last_paid_at;
        $("pendingActions").hidden = !canManagePending;

        const isActive = String(currentSubscription.status).toLowerCase() === "active";
        $("subscriptionLockMessage").textContent = isActive
            ? "Sua assinatura está ativa. Por segurança, não é possível trocar de plano nem iniciar outra contratação enquanto esta assinatura estiver ativa. Entre em contato com o atendimento NEKKO para tratar de qualquer solicitação."
            : canManagePending
                ? "Retome o checkout ou cancele a tentativa antes de escolher outro plano."
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

        plans.forEach(plan => {
            const blocked = Boolean(currentSubscription);
            const interval = plan.billing_interval === "year" ? "ano" : "mês";
            const featured = plan.code === "alta_demanda";
            const showDailyTest = plan.code === "baixa_demanda" &&
                appContext.company.id === DAILY_TEST_COMPANY_ID &&
                new URLSearchParams(window.location.search).get("teste_diario") === "1";
            const features = [...(PLAN_FEATURES[plan.code] ?? []), ...PLATFORM_FEATURES];
            const description = plan.description?.trim();
            const profile = description && description !== "Plano mensal NEKKO OS"
                ? description
                : PLAN_PROFILES[plan.code] ?? "Assinatura NEKKO OS";
            const card = document.createElement("article");
            card.className = `plan-card ${featured ? "featured" : ""}`;
            card.innerHTML = `
                <div class="plan-kicker">
                    <p class="eyebrow">NEKKO OS</p>
                    ${featured ? '<span class="plan-badge">Mais escolhido</span>' : ""}
                </div>
                <h2 class="plan-title">${escapeHtml(plan.name)}</h2>
                <p class="muted plan-profile">${escapeHtml(profile)}</p>
                <p class="plan-price">${money(plan.amount, plan.currency || "BRL")}<span class="price-interval"> / ${interval}</span></p>
                <div class="plan-benefits">
                    <p class="plan-benefits-title">O que inclui</p>
                    <ul>${features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
                </div>
                <button type="button" class="primary-btn" data-plan-code="${escapeHtml(plan.code)}" ${blocked ? "disabled" : ""}>
                    ${blocked ? "Assinatura já vinculada" : "Assinar este plano"}
                </button>
                ${showDailyTest && !blocked ? `<button type="button" class="primary-btn" style="margin-top:.65rem" data-plan-code="${escapeHtml(plan.code)}" data-daily-test="true">Testar ONE diário · Sandbox</button>` : ""}
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
        if (!appContext?.company?.id || !planCode || currentSubscription || checkoutInProgress) return;

        const dailyTest = button.dataset.dailyTest === "true";
        const confirmed = window.confirm(
            dailyTest
                ? "Você será direcionado ao Mercado Pago para autorizar a assinatura diária no Sandbox. Deseja continuar?"
                : "Você será direcionado ao Mercado Pago para autorizar a assinatura mensal. Deseja continuar?"
        );
        if (!confirmed) return;

        checkoutInProgress = true;
        const planButtons = $("plansGrid").querySelectorAll("[data-plan-code]");
        planButtons.forEach(planButton => { planButton.disabled = true; });
        const originalText = button.textContent;
        button.innerHTML = '<span class="spinner" aria-hidden="true"></span> Preparando checkout...';

        try {
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session?.access_token) throw new Error("Sua sessão expirou. Entre novamente no NEKKO OS.");

            const response = await fetch(
                `${CONFIG.SUPABASE_URL}/functions/v1/${dailyTest ? "create-daily-test-checkout" : "create-subscription-checkout"}`,
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
            checkoutInProgress = false;
            planButtons.forEach(planButton => { planButton.disabled = false; });
            button.textContent = originalText;
        }
    }

    async function managePending(action) {
        if (checkoutInProgress || currentSubscription?.status !== "pending") return;
        if (action === "cancel" && !window.confirm("Cancelar esta tentativa de pagamento? Você poderá contratar novamente após a confirmação.")) return;

        const buttons = [$("resumePending"), $("cancelPending")];
        checkoutInProgress = true;
        buttons.forEach(button => { button.disabled = true; });
        const message = $("pendingActionMessage");
        message.textContent = "Consultando o Mercado Pago…";
        let leaving = false;

        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error || !session?.access_token) throw new Error("Sua sessão expirou. Entre novamente.");
            const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/manage-pending-subscription`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                    "apikey": CONFIG.SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    action,
                    company_id: appContext.company.id,
                    subscription_id: currentSubscription.id
                })
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "Não foi possível concluir a solicitação.");
            if (action === "resume" && result.checkout_url) {
                window.location.assign(result.checkout_url);
            } else if (action === "cancel" && result.status === "canceled") {
                window.location.reload();
            } else {
                throw new Error("O servidor ainda não confirmou a operação.");
            }
            leaving = true;
        } catch (error) {
            message.textContent = error.message || "Tente novamente.";
        } finally {
            if (!leaving) {
                checkoutInProgress = false;
                buttons.forEach(button => { button.disabled = false; });
            }
        }
    }

    window.addEventListener("pageshow", event => {
        if (event.persisted && checkoutInProgress) window.location.reload();
    });

    document.addEventListener("DOMContentLoaded", async () => {
        $("resumePending").addEventListener("click", () => managePending("resume"));
        $("cancelPending").addEventListener("click", () => managePending("cancel"));
        document.querySelectorAll(".device-screen img").forEach(preview => {
            const showPreview = () => {
                if (preview.naturalWidth > 0) preview.closest(".device-screen").classList.add("has-preview");
            };
            preview.addEventListener("load", showPreview, { once: true });
            if (preview.complete) showPreview();
        });

        try {
            if (!(await loadContext())) return;
            await Promise.all([loadSubscription(), loadPlans()]);
            renderPlans();
        } catch (error) {
            console.error("[NEKKO OS] Erro na página de planos:", error);
            setState(error.message || "Não foi possível carregar os planos. Tente novamente mais tarde.", "error");
        }
    });
})();
