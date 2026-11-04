const CONFIG = window.MAR_CONFIG;
const supabaseClient = window.marSupabase;
const money = value => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(value)||0);
const placeholder = "assets/images/product-placeholder.svg";
const sampleProducts = [
 {id:"sample-1",name:"T-shirt Essencial",description:"Uma peça versátil para compor looks leves e cheios de personalidade.",price:59.90,sale_price:null,category:"Feminino",sizes:["P","M","G","GG"],images:[placeholder],featured:true,active:true},
 {id:"sample-2",name:"T-shirt Leveza",description:"Conforto e estilo para acompanhar você em todos os momentos.",price:59.90,sale_price:54.90,category:"Feminino",sizes:["P","M","G","GG"],images:[placeholder],featured:true,active:true},
 {id:"sample-3",name:"T-shirt Casual",description:"Um clássico para criar combinações práticas e cheias de atitude.",price:59.90,sale_price:null,category:"Masculino",sizes:["P","M","G","GG"],images:[placeholder],featured:true,active:true},
 {id:"sample-4",name:"T-shirt Todo Dia",description:"Uma escolha confortável e atemporal para o seu dia a dia.",price:59.90,sale_price:null,category:"Unissex",sizes:["P","M","G","GG"],images:[placeholder],featured:false,active:true},
 {id:"sample-5",name:"T-shirt Pequenos Encantos",description:"Uma camiseta infantil confortável e cheia de alegria para os pequenos.",price:45.90,sale_price:null,category:"Infantil",sizes:["2","4","6","8","10","12"],images:[placeholder],featured:false,active:true},
 {id:"sample-6",name:"T-shirt Mini Aventura",description:"Cor, diversão e conforto para acompanhar as descobertas da infância.",price:45.90,sale_price:null,category:"Infantil",sizes:["2","4","6","8","10","12"],images:[placeholder],featured:false,active:true}
];
let products=[...sampleProducts],cart=JSON.parse(localStorage.getItem("marCart")||"[]"),activeCategory="all";
const $=id=>document.getElementById(id);
function safeImage(url){return url||placeholder}
function toast(message){const el=$("toast");if(!el)return;el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function productPrice(p){return Number(p.sale_price)>0?Number(p.sale_price):Number(p.price)}
async function loadProducts(){
 products=[...sampleProducts];
 if(supabaseClient){
  const {data,error}=await supabaseClient.from("products").select("*").eq("active",true).order("featured",{ascending:false}).order("created_at",{ascending:false});
  if(!error&&data&&data.length>0)products=data.map(p=>({...p,images:p.images||[]}));
  if(error)console.error("Erro ao carregar produtos:",error);
 }
 renderProducts();
}

function renderProducts(){
 const grid=$("productGrid");if(!grid)return;
 const term=$("productSearch").value.trim().toLocaleLowerCase("pt-BR"),cat=$("categoryFilter").value,sort=$("sortFilter").value;
 let list=products.filter(p=>p.active!==false&&(activeCategory==="all"||p.category===activeCategory)&&(cat==="all"||p.category===cat)&&(`${p.name} ${p.description} ${p.category}`).toLocaleLowerCase("pt-BR").includes(term));
 if(sort==="price-asc")list.sort((a,b)=>productPrice(a)-productPrice(b));if(sort==="price-desc")list.sort((a,b)=>productPrice(b)-productPrice(a));if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
 grid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-image"><img src="${safeImage(p.images?.[0])}" alt="${escapeHtml(p.name)}" loading="lazy"><span class="product-badge">${p.featured?"Queridinho MAR":escapeHtml(p.category||"MAR")}</span><button class="quick-add" data-add="${p.id}" aria-label="Adicionar ${escapeHtml(p.name)} à sacola">+</button></div><div class="product-info"><span class="product-category">${escapeHtml(p.category||"Coleção")}</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||"Uma peça especial da MAR.")}</p><strong class="price">${money(productPrice(p))}</strong>${Number(p.sale_price)>0?`<span class="old-price">${money(p.price)}</span>`:""}</div></article>`).join("");
 $("emptyProducts").classList.toggle("hidden",list.length>0);
 grid.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>addToCart(b.dataset.add)));
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function saveCart(){localStorage.setItem("marCart",JSON.stringify(cart));renderCart()}
function addToCart(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;const item=cart.find(x=>String(x.id)===String(id));if(item)item.quantity++;else cart.push({id:p.id,quantity:1});saveCart();toast("Adicionado à sua sacola! ♡");openCart()}
function renderCart(){
 $("cartCount").textContent=cart.reduce((n,x)=>n+x.quantity,0);
 const items=$("cartItems");if(!items)return;
 items.innerHTML=cart.map(i=>{const p=products.find(x=>String(x.id)===String(i.id))||sampleProducts.find(x=>String(x.id)===String(i.id));if(!p)return"";return `<div class="cart-item"><img src="${safeImage(p.images?.[0])}" alt=""><div><h4>${escapeHtml(p.name)}</h4><small>${money(productPrice(p))} cada</small><div class="qty-controls"><button data-qty="${i.id}" data-delta="-1" aria-label="Diminuir">−</button><span>${i.quantity}</span><button data-qty="${i.id}" data-delta="1" aria-label="Aumentar">+</button></div></div><button class="remove-item" data-remove="${i.id}" aria-label="Remover">×</button></div>`}).join("")||'<p class="empty-state">Sua sacola ainda está vazia. ♡</p>';
 items.querySelectorAll("[data-qty]").forEach(b=>b.addEventListener("click",()=>{const i=cart.find(x=>String(x.id)===b.dataset.qty);if(i){i.quantity+=Number(b.dataset.delta);if(i.quantity<1)cart=cart.filter(x=>x!==i);saveCart()}}));
 items.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{cart=cart.filter(x=>String(x.id)!==b.dataset.remove);saveCart()}));
 const total=cart.reduce((sum,i)=>{const p=products.find(x=>String(x.id)===String(i.id))||sampleProducts.find(x=>String(x.id)===String(i.id));return sum+(p?productPrice(p)*i.quantity:0)},0);$("cartSubtotal").textContent=money(total);
}
function openCart(){$("cartDrawer").classList.add("open");$("cartOverlay").classList.add("open");$("cartDrawer").setAttribute("aria-hidden","false")}
function closeCart(){$("cartDrawer").classList.remove("open");$("cartOverlay").classList.remove("open");$("cartDrawer").setAttribute("aria-hidden","true")}
async function checkout(){
 if(!cart.length){toast("Sua sacola está vazia.");return}
 const lines=cart.map(i=>{const p=products.find(x=>String(x.id)===String(i.id))||sampleProducts.find(x=>String(x.id)===String(i.id));return p?`• ${p.name} | Qtd: ${i.quantity} | ${money(productPrice(p)*i.quantity)}`:""}).filter(Boolean);
 const total=cart.reduce((s,i)=>{const p=products.find(x=>String(x.id)===String(i.id))||sampleProducts.find(x=>String(x.id)===String(i.id));return s+(p?productPrice(p)*i.quantity:0)},0);
 const orderText=`Olá, MAR! 💜 Gostaria de fazer este pedido:\n\n${lines.join("\n")}\n\n*Subtotal: ${money(total)}*\n\nPodem confirmar a disponibilidade, os tamanhos e o valor do envio?`;
 if(supabaseClient){try{await supabaseClient.from("orders").insert({items:cart,total,status:"pending_whatsapp",customer_note:"Pedido iniciado pelo site"})}catch(e){console.warn("Não foi possível registrar o pedido no banco:",e)}}
 window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(orderText)}`,"_blank","noopener");
}
async function loadSiteContent(){
 if(!supabaseClient)return;
 const {data,error}=await supabaseClient.from("site_content").select("key,value");
 if(error||!data){console.warn("Não foi possível carregar o conteúdo do site:",error);return;}
 const c=Object.fromEntries(data.map(x=>[x.key,x.value]));
 if(c.founder_image){const photo=$("founderPhoto");if(photo)photo.innerHTML=`<img src="${escapeHtml(c.founder_image)}" alt="Carol Hottis, fundadora da MAR T-Shirts Store" loading="lazy">`;}
 if(c.about_text){const about=$("aboutTextDisplay");if(about)about.innerHTML=String(c.about_text).split(/\n+/).map(line=>`<p>${escapeHtml(line)}</p>`).join("");}
 if(c.club_url){const club=$("clubLink");if(club)club.href=c.club_url;const footerClub=$("footerClub");if(footerClub){footerClub.href=c.club_url;footerClub.target="_blank";footerClub.rel="noopener noreferrer";}}
 const instagram=c.instagram_url||"https://www.instagram.com/mar.tshirtstore/";
 ["instagramNav","instagramNewsletter","footerInstagram"].forEach(id=>{const link=$(id);if(link)link.href=instagram;});
 if(c.logo_image){["headerLogo","footerLogo"].forEach(id=>{const logo=$(id);if(logo){logo.src=c.logo_image;logo.classList.remove("hidden");}});["headerBrandText","footerBrandText"].forEach(id=>{const text=$(id);if(text)text.classList.add("hidden");});}
 const number=String(c.whatsapp_number||CONFIG.whatsappNumber||"").replace(/\D/g,"");
 if(number){const wa=`https://wa.me/${number}`;const contact=$("contactLink"),footer=$("footerWhatsapp");if(contact)contact.href=wa;if(footer)footer.href=wa;}
}

function init(){
 $("year").textContent=new Date().getFullYear();
 const wa=`https://wa.me/${String(CONFIG.whatsappNumber||"").replace(/\D/g,"")}`;$("contactLink").href=wa;$("footerWhatsapp").href=wa;
 $("clubLink").href=CONFIG.clubUrl||"#";
 $("menuToggle").addEventListener("click",()=>{$("mainNav").classList.toggle("open");$("menuToggle").setAttribute("aria-expanded",$("mainNav").classList.contains("open"))});
 document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
 $("openCart").addEventListener("click",openCart);$("closeCart").addEventListener("click",closeCart);$("cartOverlay").addEventListener("click",closeCart);$("continueShopping").addEventListener("click",closeCart);$("checkoutButton").addEventListener("click",checkout);
 ["productSearch","categoryFilter","sortFilter"].forEach(id=>$(id).addEventListener("input",renderProducts));
 $("categoryPills").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.category;$("categoryFilter").value="all";$("categoryPills").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderProducts()}));
 renderCart();loadProducts();loadSiteContent();
}
document.addEventListener("DOMContentLoaded",init);