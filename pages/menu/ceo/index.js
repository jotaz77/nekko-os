// ======================================================
// NEKKO OS
// Menu CEO — Executive Control Center
// ======================================================

let context = null;

const MONTHS = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const MODULES = [
    {
        title: "Dashboard",
        description: "Visão geral da empresa",
        icon: "layout-dashboard",
        href: "../../dashboard/index.html"
    },
    {
        title: "Registrar Venda",
        description: "Registrar uma nova venda",
        icon: "shopping-cart",
        href: "../../sales/create.html"
    },
    {
        title: "Nova OS",
        description: "Criar uma ordem de serviço",
        icon: "clipboard-plus",
        href: "../../service-orders/create.html"
    },
    {
        title: "OS Clientes",
        description: "Consultar ordens de serviço de clientes",
        icon: "clipboard-list",
        href: "../../service-orders/index.html"
    },
    {
        title: "OS Lojistas",
        description: "Ordens de serviço para lojistas",
        icon: "store",
        href: "../../dealer-service-orders/index.html"
    },
    {
        title: "Técnicos",
        description: "Cadastrar e acompanhar produtividade",
        icon: "wrench",
        href: "../../technicians/index.html"
    },
    {
        title: "Estoque",
        description: "Peças e produtos",
        icon: "package",
        href: "../../inventory/index.html"
    },
    {
        title: "Trocar Loja",
        description: "Entrar em outra unidade",
        icon: "repeat",
        action: "change-store"
    },
    {
        title: "Importar OS",
        description: "Migrar ordens de serviço de outro sistema",
        icon: "file-up",
        href: "../../import-service-orders/index.html"
    },
    {
        title: "Configurações",
        description: "Preferências do sistema",
        icon: "settings",
        href: "../../settings/index.html"
    }
];

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const result = await Bootstrap.init();

        if (result.status !== "READY") {
            window.location.href = "../../login/login.html";
            return;
        }

        context = result.context;

        if (context.role !== Roles.CEO) {
            window.location.href = "../index.html";
            return;
        }

        renderUser(context);
        renderCeoMenu();

        await loadCeoIndicators();

        if (window.lucide) {
            lucide.createIcons();
        }

    }

    catch (error) {

        console.error("Erro ao iniciar menu CEO:", error);

        const status = document.getElementById("chartStatus");

        if (status) {
            status.textContent = "Não foi possível carregar os indicadores.";
        }

    }

});


// ======================================================
// USUÁRIO
// ======================================================

function renderUser(ctx) {

    const userName = document.getElementById("userName");
    const avatar = document.getElementById("userAvatar");
    const store = document.getElementById("currentStore");

    const name =
        ctx.user?.name ||
        ctx.user?.full_name ||
        ctx.user?.email ||
        "CEO";

    if (userName) {
        userName.textContent = name;
    }

    if (avatar) {
        avatar.textContent =
            String(name).trim().charAt(0).toUpperCase() || "C";
    }

    if (store) {
        store.textContent =
            ctx.store?.name ||
            "Todas as Lojas";
    }

}


// ======================================================
// MENU CEO
// ======================================================

function renderCeoMenu() {

    const grid = document.getElementById("menuGrid");

    if (!grid)
        return;

    grid.innerHTML = MODULES.map(module => {

        const href = module.href || "#";
        const action = module.action
            ? `data-action="${module.action}"`
            : "";

        return `
            <a
                href="${href}"
                ${action}
                class="
                    ceo-card
                    menu-card
                    block
                    p-5
                    no-underline
                    text-white
                "
            >

                <div class="menu-icon mb-4">
                    <i data-lucide="${module.icon}" class="w-[18px] h-[18px]"></i>
                </div>

                <div class="text-[14px] font-extrabold">
                    ${module.title}
                </div>

                <div class="text-[11px] text-[#687379] mt-1 leading-relaxed">
                    ${module.description}
                </div>

            </a>
        `;

    }).join("");

    grid.querySelectorAll('[data-action="change-store"]')
        .forEach(button => {

            button.addEventListener("click", async event => {

                event.preventDefault();

                await changeStore();

            });

        });

}


// ======================================================
// MENU NORMAL
// ======================================================
// Mantém o acesso dos demais perfis funcionando.
// Para CEO, o layout acima é utilizado.

function renderNormalMenu() {

    const grid = document.getElementById("menuGrid");

    if (!grid)
        return;

    grid.innerHTML = MODULES.map(module => {

        const href = module.href || "#";
        const action = module.action
            ? `data-action="${module.action}"`
            : "";

        return `
            <a
                href="${href}"
                ${action}
                class="ceo-card menu-card block p-5 text-white no-underline"
            >

                <div class="menu-icon mb-4">
                    <i data-lucide="${module.icon}" class="w-[18px] h-[18px]"></i>
                </div>

                <div class="text-[14px] font-extrabold">
                    ${module.title}
                </div>

                <div class="text-[11px] text-[#687379] mt-1">
                    ${module.description}
                </div>

            </a>
        `;

    }).join("");

    grid.querySelectorAll('[data-action="change-store"]')
        .forEach(button => {

            button.addEventListener("click", async event => {

                event.preventDefault();

                await changeStore();

            });

        });

}


// ======================================================
// TROCAR LOJA
// ======================================================

async function changeStore() {

    const currentContext = Storage.getContext();

    if (currentContext?.role === Roles.CEO) {

        window.location.href = "../../mode/index.html";
        return;

    }

    await Auth.logout();

    Storage.clear();
    sessionStorage.clear();

    window.location.href = "../../login/login.html";

}


// ======================================================
// INDICADORES
// ======================================================

async function loadCeoIndicators() {

    const year = new Date().getFullYear();

    document.getElementById("chartYear").textContent = year;

    document.getElementById("monthLabels").innerHTML =
        MONTHS.map(month => `<span>${month}</span>`).join("");

    const data = await getYearProfitData(year);

    renderProfitChart(data.months);

    renderMonthlyResult(
        data.current,
        data.previous
    );

    document.getElementById("chartStatus").textContent =
        "OS entregues + líquido de vendas";

}


// ======================================================
// BUSCAR LUCRO DO ANO
// ======================================================

async function getYearProfitData(year) {

    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const previousStart = new Date(year, -1, 1);
    const previousEnd = new Date(year, 0, 1);

    const companyId = context.company.id;

    const storeId =
        context.store?.id ||
        null;


    // --------------------------------------------------
    // OS
    // --------------------------------------------------

    let osQuery = supabaseClient
        .from("service_orders")
        .select("price,status,created_at,store_id")
        .eq("company_id", companyId)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString());

    if (storeId) {
        osQuery = osQuery.eq("store_id", storeId);
    }

    const {
        data: orders,
        error: osError
    } = await osQuery;

    if (osError)
        throw osError;


    // --------------------------------------------------
    // VENDAS
    // --------------------------------------------------

    let salesQuery = supabaseClient
        .from("sales")
        .select("id,total_price,created_at,store_id")
        .eq("company_id", companyId)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString());

    if (storeId) {
        salesQuery = salesQuery.eq("store_id", storeId);
    }

    const {
        data: sales,
        error: salesError
    } = await salesQuery;

    if (salesError)
        throw salesError;


    // --------------------------------------------------
    // CUSTOS DOS ITENS
    // --------------------------------------------------

    const saleIds = (sales || []).map(sale => sale.id);

    let items = [];

    // Evita uma requisição .in() gigantesca quando existem muitas vendas.
    // O carregamento é feito em lotes menores.
    const SALE_ID_BATCH_SIZE = 50;

    for (
        let offset = 0;
        offset < saleIds.length;
        offset += SALE_ID_BATCH_SIZE
    ) {

        const batch = saleIds.slice(
            offset,
            offset + SALE_ID_BATCH_SIZE
        );

        const {
            data,
            error
        } = await supabaseClient
            .from("sale_items")
            .select("sale_id,quantity,unit_cost")
            .in("sale_id", batch);

        if (error)
            throw error;

        items.push(...(data || []));

    }


    const costsBySale = {};

    items.forEach(item => {

        const saleId = item.sale_id;

        const quantity = Number(item.quantity || 0);
        const unitCost = Number(item.unit_cost || 0);

        costsBySale[saleId] =
            (costsBySale[saleId] || 0) +
            (quantity * unitCost);

    });


    // --------------------------------------------------
    // AGREGAR
    // --------------------------------------------------

    const months = Array.from(
        { length: 12 },
        () => ({
            os: 0,
            salesNet: 0,
            total: 0
        })
    );


    (orders || []).forEach(order => {

        if (order.status !== "Entregue")
            return;

        const date = new Date(order.created_at);

        const month = date.getMonth();

        const value = Number(order.price || 0);

        months[month].os += value;
        months[month].total += value;

    });


    (sales || []).forEach(sale => {

        const date = new Date(sale.created_at);

        const month = date.getMonth();

        const revenue =
            Number(sale.total_price || 0);

        const cost =
            Number(costsBySale[sale.id] || 0);

        const net =
            revenue - cost;

        months[month].salesNet += net;
        months[month].total += net;

    });


    // --------------------------------------------------
    // MÊS ATUAL
    // --------------------------------------------------

    const now = new Date();

    const currentMonth =
        now.getMonth();

    const current =
        months[currentMonth];


    // --------------------------------------------------
    // MÊS ANTERIOR
    // --------------------------------------------------

    const previousMonth =
        currentMonth === 0
            ? 11
            : currentMonth - 1;

    let previous = months[previousMonth];

    // Janeiro compara com dezembro do ano anterior.
    if (currentMonth === 0) {

        previous =
            await getPreviousDecember(
                previousStart,
                previousEnd
            );

    }


    return {
        months,
        current,
        previous
    };

}


// ======================================================
// DEZEMBRO DO ANO ANTERIOR
// ======================================================

async function getPreviousDecember(start, end) {

    const companyId = context.company.id;

    const storeId =
        context.store?.id ||
        null;


    let osQuery = supabaseClient
        .from("service_orders")
        .select("price,status,created_at,store_id")
        .eq("company_id", companyId)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString());

    if (storeId)
        osQuery = osQuery.eq("store_id", storeId);


    let salesQuery = supabaseClient
        .from("sales")
        .select("id,total_price,created_at,store_id")
        .eq("company_id", companyId)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString());

    if (storeId)
        salesQuery = salesQuery.eq("store_id", storeId);


    const [
        { data: orders, error: osError },
        { data: sales, error: salesError }
    ] = await Promise.all([
        osQuery,
        salesQuery
    ]);

    if (osError)
        throw osError;

    if (salesError)
        throw salesError;


    const saleIds =
        (sales || []).map(sale => sale.id);

    let items = [];

    const SALE_ID_BATCH_SIZE = 50;

    for (
        let offset = 0;
        offset < saleIds.length;
        offset += SALE_ID_BATCH_SIZE
    ) {

        const batch = saleIds.slice(
            offset,
            offset + SALE_ID_BATCH_SIZE
        );

        const {
            data,
            error
        } = await supabaseClient
            .from("sale_items")
            .select("sale_id,quantity,unit_cost")
            .in("sale_id", batch);

        if (error)
            throw error;

        items.push(...(data || []));

    }


    const costsBySale = {};

    items.forEach(item => {

        costsBySale[item.sale_id] =
            (costsBySale[item.sale_id] || 0) +
            Number(item.quantity || 0) *
            Number(item.unit_cost || 0);

    });


    let total = 0;
    let os = 0;
    let salesNet = 0;


    (orders || []).forEach(order => {

        if (order.status !== "Entregue")
            return;

        const value =
            Number(order.price || 0);

        os += value;
        total += value;

    });


    (sales || []).forEach(sale => {

        const revenue =
            Number(sale.total_price || 0);

        const cost =
            Number(costsBySale[sale.id] || 0);

        const net =
            revenue - cost;

        salesNet += net;
        total += net;

    });


    return {
        os,
        salesNet,
        total
    };

}


// ======================================================
// RESULTADO MENSAL
// ======================================================

function renderMonthlyResult(current, previous) {

    const total =
        Number(current.total || 0);

    const os =
        Number(current.os || 0);

    const sales =
        Number(current.salesNet || 0);

    document.getElementById("monthlyProfit").textContent =
        formatCurrency(total);

    document.getElementById("monthlyOs").textContent =
        formatCurrency(os);

    document.getElementById("monthlySales").textContent =
        formatCurrency(sales);

    document.getElementById("monthlyTotal").textContent =
        formatCurrency(total);


    const currentValue =
        Number(current.total || 0);

    const previousValue =
        Number(previous?.total || 0);


    const delta =
        document.getElementById("monthlyDelta");


    if (!delta)
        return;


    if (previousValue === 0) {

        delta.textContent =
            "Sem base comparativa no mês anterior.";

        delta.className =
            "text-[11px] text-[#7F8A90] mt-2";

        return;

    }


    const percent =
        ((currentValue - previousValue) /
            Math.abs(previousValue)) * 100;


    const direction =
        percent >= 0
            ? "↑"
            : "↓";


    delta.textContent =
        `${direction} ${Math.abs(percent).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }
        )}% em relação ao mês anterior`;

    delta.className =
        percent >= 0
            ? "text-[11px] text-[#19D37B] mt-2"
            : "text-[11px] text-[#F87171] mt-2";

}


// ======================================================
// GRÁFICO
// ======================================================

function renderProfitChart(months) {

    const values =
        months.map(month =>
            Number(month.total || 0)
        );

    const svgWidth = 1000;
    const svgHeight = 205;

    const paddingX = 18;
    const paddingY = 17;

    const max =
        Math.max(
            ...values.map(value => Math.abs(value)),
            1
        );


    const min =
        Math.min(
            ...values,
            0
        );


    const range =
        Math.max(max - min, 1);


    const points =
        values.map((value, index) => {

            const x =
                paddingX +
                (index * (svgWidth - paddingX * 2) / 11);

            const y =
                svgHeight -
                paddingY -
                ((value - min) / range) *
                (svgHeight - paddingY * 2);

            return {
                x,
                y,
                value
            };

        });


    const line =
        points.map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
        ).join(" ");


    const area =
        `${line}
         L ${points[points.length - 1].x} ${svgHeight}
         L ${points[0].x} ${svgHeight}
         Z`;


    document.getElementById("profitLine").setAttribute(
        "d",
        line
    );

    document.getElementById("profitArea").setAttribute(
        "d",
        area
    );


    document.getElementById("profitPoints").innerHTML =
        points.map(
            (point, index) => `
                <circle
                    data-index="${index}"
                    cx="${point.x}"
                    cy="${point.y}"
                    r="4"
                    fill="#0A0F0C"
                    stroke="#19D37B"
                    stroke-width="2"
                    style="cursor:pointer"
                ></circle>
            `
        ).join("");


    const circles =
        document.querySelectorAll(
            "#profitPoints circle"
        );


    const chartArea =
        document.getElementById("chartArea");

    const tooltip =
        document.getElementById("chartTooltip");


    circles.forEach(circle => {

        circle.addEventListener("mouseenter", () => {

            const index =
                Number(circle.dataset.index);

            const point =
                points[index];

            const rect =
                chartArea.getBoundingClientRect();

            const x =
                (point.x / svgWidth) *
                rect.width;


            const y =
                (point.y / svgHeight) *
                rect.height;


            tooltip.style.left =
                `${x}px`;

            tooltip.style.top =
                `${y}px`;

            tooltip.innerHTML = `
                <div class="text-[9px] text-[#7F8A90]">
                    ${MONTHS[index]}
                </div>
                <div class="text-[11px] font-bold text-white mt-1">
                    ${formatCurrency(point.value)}
                </div>
            `;

            tooltip.style.opacity = "1";

        });


        circle.addEventListener("mouseleave", () => {

            tooltip.style.opacity = "0";

        });

    });

}


// ======================================================
// HELPERS
// ======================================================

function formatCurrency(value) {

    return Number(value || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}
