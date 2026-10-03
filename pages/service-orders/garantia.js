let context=null;
let order=null;

document.addEventListener("DOMContentLoaded",init);

async function init(){
    try{
        const result=await Bootstrap.init();
        context=result.context;

        const id=new URLSearchParams(window.location.search).get("id");
        if(!id){showError("Ordem de serviço não encontrada.");return;}

        order=await Api.getServiceOrder(id);
        if(!order){showError("Ordem de serviço não encontrada.");return;}

        if(String(order.status||"").trim().toLowerCase()!=="pronta"){
            showError("O termo de garantia só pode ser emitido para uma OS com status Pronta.");
            return;
        }

        order.service_order_items=await Api.getServiceOrderItems(id);

        preencherGarantia();

        setTimeout(()=>window.print(),300);

    }catch(error){
        console.error(error);
        showError("Não foi possível carregar o termo de garantia.");
    }
}

function preencherGarantia(){
    const company=context?.company||{};
    const store=context?.store||{};

    setText("companyName",company.name||"EMPRESA");
    setText("storeName",store.name||"Loja");
    setText("storePhone",store.phone?`WhatsApp: ${formatPhone(store.phone)}`:"-");

    setText("osNumber",order.os_number);
    setText("createdAt",formatDateTime(order.created_at));

    setText("customerName",order.customer_name);
    setText("customerPhone",formatPhone(order.customer_phone));

    const address=[order.customer_address,order.customer_number].filter(Boolean).join(", ");
    setText("customerAddress",address||"Não informado");

    setText("deviceType",order.device_type);
    setText("deviceBrand",order.brand);
    setText("deviceModel",order.model);

    renderDeviceLock();

    setText("reportedProblem",order.reported_issue||order.problem||"-");
    setText("observations",order.notes||"-");

    const items=getServiceItems();
    renderServiceItems(items);
    renderWarrantyTerms(items);

    setText("printedAt",formatDateTime(new Date()));
}

function getServiceItems(){
    const items=Array.isArray(order.service_order_items)?order.service_order_items:[];
    if(items.length){
        return items.map(item=>({
            name:item.service_name||item.service||item.name||"Serviço",
            price:Number(item.unit_price??item.price??0)
        }));
    }
    if(order.service){
        return [{name:order.service,price:Number(order.price??0)}];
    }
    return [];
}

function renderServiceItems(items){
    const container=document.getElementById("serviceItemsList");
    const totalElement=document.getElementById("serviceTotal");
    if(!container)return;

    if(!items.length){
        container.innerHTML="<p>Nenhum serviço informado.</p>";
        if(totalElement)totalElement.textContent=formatMoney(0);
        return;
    }

    let total=0;
    container.innerHTML=items.map(item=>{
        const price=Number(item.price||0);
        total+=price;
        return `<div class="row"><span>${escapeHtml(item.name)}</span><span>${formatMoney(price)}</span></div>`;
    }).join("");

    if(totalElement)totalElement.textContent=formatMoney(total);
}

const WARRANTY_RULES={
    screen:{
        title:"TROCA DE TELA — 90 DIAS DE GARANTIA",
        paragraphs:["Não cobrimos a garantia caso o defeito tenha sido causado por mau uso, incluindo rachaduras, LCD manchado, manchas, oxidação, marcas de água, gotículas ou gotas de água."]
    },
    premiumBattery:{
        title:"BATERIA PREMIUM — 1 ANO DE GARANTIA",
        paragraphs:[]
    },
    parallelBattery:{
        title:"BATERIA PARALELA — 90 DIAS DE GARANTIA",
        paragraphs:[]
    },
    board:{
        title:"REPARO DE PLACA / MEMÓRIA / CPU",
        paragraphs:["Não garantimos problemas futuros, pois o serviço realizado consiste em um reparo e não na troca de um componente."]
    },
    component:{
        title:"TROCA DE COMPONENTE — 90 DIAS DE GARANTIA",
        paragraphs:[]
    }
};

function renderWarrantyTerms(items){
    const container=document.getElementById("warrantyTerms");
    if(!container)return;

    const rules=[];
    items.forEach(item=>{
        const key=classifyWarranty(item.name);
        if(key&&!rules.includes(key))rules.push(key);
    });

    if(!rules.length){
        container.innerHTML=`<div class="warranty-item"><div class="warranty-title">GARANTIA — 90 DIAS</div></div>`;
        return;
    }

    container.innerHTML=rules.map(key=>{
        const rule=WARRANTY_RULES[key];
        return `<div class="warranty-item">
            <div class="warranty-title">${escapeHtml(rule.title)}</div>
            ${rule.paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join("")}
        </div>`;
    }).join("");
}

function classifyWarranty(serviceName){
    const text=normalizeText(serviceName);

    const hasBattery=text.includes("bateria");
    const hasPremium=text.includes("premium");
    const hasParallel=text.includes("paralela")||text.includes("paralelo");
    const hasScreen=text.includes("tela")||text.includes("display")||text.includes("lcd");
    const hasReplacement=text.includes("troca")||text.includes("substituicao")||text.includes("substituir");
    const hasBoard=text.includes("placa")||text.includes("memoria")||text.includes("cpu");
    const hasBoardRepair=text.includes("reparo")||text.includes("conserto")||text.includes("manutencao");

    if(hasBattery&&hasPremium)return"premiumBattery";
    if(hasBattery&&hasParallel)return"parallelBattery";
    if(hasScreen&&hasReplacement)return"screen";
    if(hasBoard&&hasBoardRepair)return"board";
    if(hasReplacement)return"component";

    return null;
}

function renderDeviceLock(){
    const container=document.getElementById("deviceLockContainer");
    if(!container)return;

    if(!order.lock_type||order.lock_type==="none"){
        container.innerHTML=`<p class="no-lock">SEM SENHA</p>`;
        return;
    }

    const typeMap={pin:"PIN",password:"Senha",pattern:"Padrão",biometric:"Biometria",face:"Face ID"};
    const type=typeMap[order.lock_type]||order.lock_type;
    let value="-";

    switch(order.lock_type){
        case"pin":value=order.lock_pin||"-";break;
        case"password":value=order.lock_password||"-";break;
        case"pattern":value=order.lock_pattern||"-";break;
    }

    container.innerHTML=`<p class="lock-title">Bloqueio: ${escapeHtml(type)}</p><p class="lock-value">${escapeHtml(String(value))}</p>`;
}

function normalizeText(value){
    return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

function escapeHtml(value){
    return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function setText(id,value){
    const element=document.getElementById(id);
    if(element)element.textContent=value||"-";
}

function formatMoney(value){
    return Number(value||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

function formatDateTime(value){
    if(!value)return"-";
    return new Date(value).toLocaleString("pt-BR");
}

function formatPhone(value){
    return value?String(value):"-";
}

function showError(message){
    document.body.innerHTML=`<div class="error-screen"><strong>NEKKO OS</strong><p>${escapeHtml(message)}</p></div>`;
}
