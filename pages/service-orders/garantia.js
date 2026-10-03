let order = null;
let context = null;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await Bootstrap.init();
        context = Bootstrap.getContext ? Bootstrap.getContext() : {};
        const id = new URLSearchParams(window.location.search).get("id");
        if (!id) return showError("OS não informada.");
        order = await Api.getServiceOrder(id);
        if (!order) return showError("Ordem de serviço não encontrada.");
        if (String(order.status || "").trim().toLowerCase() !== "pronta") return showError("O termo de garantia só pode ser emitido para uma OS com status Pronta.");
        try { await Api.getServiceOrderItems(id); } catch (e) { console.warn("Itens da OS:", e); }
        preencherGarantia();
        setTimeout(() => window.print(), 300);
    } catch (e) { console.error(e); showError("Não foi possível carregar o termo de garantia."); }
});

function preencherGarantia() {
    const company = context?.company || {}; const store = context?.store || {};
    setText("companyName", company.name || "EMPRESA"); setText("storeName", store.name || "Loja"); setText("storePhone", formatPhone(store.phone));
    setText("osNumber", order.os_number || order.id || "-"); setText("createdAt", formatDate(order.created_at));
    setText("customerName", order.customer_name || "-"); setText("customerPhone", formatPhone(order.customer_phone)); setText("customerAddress", order.customer_address || order.address || "-");
    setText("device", order.device || order.device_model || order.model || "-"); setText("defect", order.defect || order.reported_problem || "-"); setText("notes", order.notes || order.observations || "-");
    renderDeviceLock();
    const items = getServiceItems(); renderServiceItems(items); renderWarrantyTerms(items);
    setText("printedAt", new Date().toLocaleString("pt-BR"));
}

function getServiceItems() {
    const items = Array.isArray(order?.service_order_items) ? order.service_order_items : [];
    if (items.length) return items.map(i => ({ name: i.service_name || i.service || i.name || "Serviço", price: Number(i.unit_price ?? i.price ?? 0) }));
    if (order?.service) return [{ name: order.service, price: Number(order.price ?? 0) }];
    return [];
}

function renderServiceItems(items) {
    const c=document.getElementById("serviceItemsList"), t=document.getElementById("serviceTotal"); if(!c)return;
    if(!items.length){c.innerHTML="<p>Nenhum serviço informado.</p>";if(t)t.textContent=formatMoney(0);return;}
    let total=0; c.innerHTML=items.map(i=>{const p=Number(i.price||0);total+=p;return `<div class="row"><span>${escapeHtml(i.name)}</span><span>${formatMoney(p)}</span></div>`;}).join(""); if(t)t.textContent=formatMoney(total);
}

const WARRANTY_RULES={
    screen:{key:"screen",title:"TROCA DE TELA — 90 DIAS DE GARANTIA",paragraphs:["Não cobrimos a garantia caso o defeito tenha sido causado por mau uso, incluindo rachaduras, LCD manchado, manchas, oxidação, marcas de água, gotículas ou gotas de água."]},
    premiumBattery:{key:"premium-battery",title:"BATERIA PREMIUM — 1 ANO DE GARANTIA",paragraphs:[]},
    parallelBattery:{key:"parallel-battery",title:"BATERIA PARALELA — 90 DIAS DE GARANTIA",paragraphs:[]},
    boardRepair:{key:"board-repair",title:"REPARO DE PLACA / MEMÓRIA / CPU",paragraphs:["Não garantimos problemas futuros, pois o serviço realizado consiste em um reparo e não na troca de um componente."]},
    componentReplacement:{key:"component-replacement",title:"TROCA DE COMPONENTE — 90 DIAS DE GARANTIA",paragraphs:[]}
};

function getWarrantyRule(name){
    const text=normalizeText(name); if(!text)return null;
    if(text.includes("bateria")&&text.includes("premium"))return WARRANTY_RULES.premiumBattery;
    if(text.includes("bateria")&&text.includes("paralela"))return WARRANTY_RULES.parallelBattery;
    if(/(troca|substituicao)/i.test(text)&&/(tela|display|lcd)/i.test(text))return WARRANTY_RULES.screen;
    if(/(reparo|conserto|manutencao)/i.test(text)&&/(placa|memoria|cpu)/i.test(text))return WARRANTY_RULES.boardRepair;
    if(/(troca|substituicao)/i.test(text))return WARRANTY_RULES.componentReplacement;
    return null;
}

function renderWarrantyTerms(items){
    const c=document.getElementById("warrantyTerms"); if(!c)return; const rules=[];
    for(const item of items){const rule=getWarrantyRule(item.name);if(rule&&!rules.some(r=>r.key===rule.key))rules.push(rule);}
    if(!rules.length){c.innerHTML="<p>As condições de garantia devem ser verificadas de acordo com o serviço realizado.</p>";return;}
    c.innerHTML=rules.map(r=>`<div><p><strong>${escapeHtml(r.title)}</strong></p>${r.paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join("")}</div>`).join("<br>");
}

function renderDeviceLock(){
    const s=document.getElementById("deviceLockSection"),v=document.getElementById("deviceLock");if(!s||!v)return;
    const lock=order?.device_password||order?.device_pattern||order?.password||order?.pattern||order?.unlock_code||"";
    if(lock){v.textContent=lock;s.style.display="block";}else{s.style.display="none";}
}

function showError(message){document.body.innerHTML=`<div style="width:72mm;margin:20px auto;font-family:Arial,sans-serif;font-size:12px;text-align:center"><strong>NEKKO OS</strong><p>${escapeHtml(message)}</p></div>`;}
function setText(id,value){const e=document.getElementById(id);if(e)e.textContent=value??"-";}
function formatMoney(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}
function formatDate(v){if(!v)return "-";const d=new Date(v);return Number.isNaN(d.getTime())?v:d.toLocaleString("pt-BR");}
function formatPhone(phone){if(!phone)return "-";const d=String(phone).replace(/\D/g,"");if(d.length===11)return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;if(d.length===10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;return phone;}
function normalizeText(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();}
function escapeHtml(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
