const cfg=window.MAR_CONFIG, db=window.marSupabase;
const $=id=>document.getElementById(id);
const defaultAbout="A MAR nasceu do coração de uma mãe, Carol Hottis, que desejava estar mais perto de suas filhas, Maria Alice e Rebeca. Foi desse desejo tão especial que surgiu o nome MAR: a união dos nomes de suas duas maiores inspirações. Mais do que empreender, Carol encontrou na MAR uma oportunidade de construir algo seu, sem abrir mão daquilo que tem de mais precioso: estar presente na vida das filhas. Assim nasceu uma marca que carrega amor em cada detalhe, propósito em cada escolha e o desejo de vestir pessoas com carinho e personalidade.";
let currentProducts=[];
function msg(id,text,isError=false){$(id).textContent=text;$(id).style.color=isError?"#a64c69":"#694477"}
function showLogin(){$("loginView").classList.remove("hidden");$("dashboardView").classList.add("hidden")}
function showDashboard(){$("loginView").classList.add("hidden");$("dashboardView").classList.remove("hidden");loadAdminProducts();loadContent()}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
const money=v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v)||0);
function requireDb(){if(!db){alert("Configure a URL e a chave pública do Supabase no arquivo js/config.js.");return false}return true}
function validHttpUrl(value,label){if(!value)return "";try{const u=new URL(value);if(!["https:","http:"].includes(u.protocol))throw new Error();return u.href}catch{throw new Error(`Confira o endereço informado em: ${label}.`)} }
async function loadAdminProducts(){
 if(!requireDb())return;const {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});
 if(error){$("adminProductList").innerHTML=`<p class="muted">Não foi possível carregar: ${escapeHtml(error.message)}</p>`;return}
 currentProducts=data||[];$("adminProductList").innerHTML=currentProducts.map(p=>`<div class="admin-product-row"><img src="${escapeHtml(p.images?.[0]||"assets/images/product-placeholder.svg")}" alt=""><div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)} • ${money(p.sale_price||p.price)} • ${p.active?"Disponível":"Indisponível"}</p></div><div class="admin-actions"><button class="small-btn" data-edit="${p.id}">Editar</button><button class="small-btn danger" data-delete="${p.id}">Excluir</button></div></div>`).join("")||'<p class="muted">Ainda não há produtos cadastrados. Clique em “Novo produto” para começar.</p>';
 $("adminProductList").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editProduct(b.dataset.edit)));
 $("adminProductList").querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>deleteProduct(b.dataset.delete)));
}
function openProduct(p=null){
 $("productForm").reset();$("productId").value=p?.id||"";$("dialogTitle").textContent=p?"Editar produto":"Novo produto";
 if(p){$("productName").value=p.name;$("productDescription").value=p.description;$("productPrice").value=p.price;$("productSalePrice").value=p.sale_price||"";$("productCategory").value=p.category;$("productSizes").value=(p.sizes||[]).join(", ");$("productFeatured").checked=!!p.featured;$("productActive").checked=!!p.active}
 msg("productMessage",p?.images?.length?`Imagens atuais: ${p.images.length}. Selecione novas imagens para substituí-las.`:"");$("productDialog").showModal();
}
function editProduct(id){const p=currentProducts.find(x=>String(x.id)===String(id));if(p)openProduct(p)}
async function uploadImages(files,productId){const urls=[];for(const file of files){const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");const path=`${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;const {error}=await db.storage.from("products").upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;urls.push(db.storage.from("products").getPublicUrl(path).data.publicUrl)}return urls}
async function saveProduct(e){
 e.preventDefault();if(!requireDb())return;const id=$("productId").value||crypto.randomUUID(),existing=currentProducts.find(p=>String(p.id)===String(id));
 const payload={name:$("productName").value.trim(),description:$("productDescription").value.trim(),price:Number($("productPrice").value),sale_price:$("productSalePrice").value?Number($("productSalePrice").value):null,category:$("productCategory").value,sizes:$("productSizes").value.split(",").map(s=>s.trim()).filter(Boolean),featured:$("productFeatured").checked,active:$("productActive").checked,images:existing?.images||[]};
 try{const chosen=[...$("productImages").files];if(chosen.length)payload.images=await uploadImages(chosen,id);const {error}=await db.from("products").upsert({id,...payload});if(error)throw error;msg("productMessage","Produto salvo com sucesso!");setTimeout(()=>{$("productDialog").close();loadAdminProducts()},650)}catch(err){msg("productMessage",`Erro ao salvar: ${err.message}`,true)}
}
async function deleteProduct(id){if(!confirm("Deseja realmente excluir este produto?"))return;const {error}=await db.from("products").delete().eq("id",id);if(error)alert("Não foi possível excluir: "+error.message);else loadAdminProducts()}
async function uploadSiteImage(file,folder){if(!file)return null;const allowed=["image/jpeg","image/png","image/webp","image/svg+xml"];if(!allowed.includes(file.type))throw new Error("Formato de imagem não permitido. Use JPG, PNG, WebP ou SVG para a logo; JPG, PNG ou WebP para a foto.");const ext=(file.name.split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"");const path=`${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;const {error}=await db.storage.from("site-assets").upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;return db.storage.from("site-assets").getPublicUrl(path).data.publicUrl}
async function loadContent(){
 if(!requireDb())return;const {data,error}=await db.from("site_content").select("key,value");if(error){msg("contentMessage",`Não foi possível carregar o conteúdo: ${error.message}`,true);return}const c=Object.fromEntries((data||[]).map(x=>[x.key,x.value]));
 $("aboutText").value=c.about_text||defaultAbout;$("clubUrl").value=c.club_url||cfg.clubUrl||"";$("whatsappNumber").value=c.whatsapp_number||cfg.whatsappNumber;$("instagramUrl").value=c.instagram_url||"https://www.instagram.com/mar.tshirtstore/";
 if(c.logo_image){$("logoPreview").src=c.logo_image;$("logoPreviewWrap").classList.remove("hidden");}
}
async function saveContent(e){
 e.preventDefault();if(!requireDb())return;msg("contentMessage","Salvando informações e imagens...");
 try{
  const logoFile=$("logoImage").files[0],founderFile=$("founderImage").files[0];
  const [logoUrl,founderUrl]=await Promise.all([uploadSiteImage(logoFile,"logo"),uploadSiteImage(founderFile,"founder")]);
  const values={about_text:$("aboutText").value.trim(),club_url:validHttpUrl($("clubUrl").value.trim(),"link do grupo"),instagram_url:validHttpUrl($("instagramUrl").value.trim(),"Instagram"),whatsapp_number:$("whatsappNumber").value.replace(/\D/g,"")};
  if(logoUrl)values.logo_image=logoUrl;if(founderUrl)values.founder_image=founderUrl;
  const rows=Object.entries(values).map(([key,value])=>({key,value}));const {error}=await db.from("site_content").upsert(rows,{onConflict:"key"});if(error)throw error;
  if(logoUrl){$("logoPreview").src=logoUrl;$("logoPreviewWrap").classList.remove("hidden");$("logoImage").value=""}if(founderUrl)$("founderImage").value="";
  msg("contentMessage","Conteúdo atualizado com sucesso! As alterações já estão salvas. ♡");
 }catch(err){msg("contentMessage",`Erro ao salvar: ${err.message}`,true)}
}
function init(){
 if(!db){msg("loginMessage","O Supabase ainda não está configurado. Consulte o README do projeto.",true);$("loginForm").addEventListener("submit",e=>e.preventDefault());return}
 db.auth.getSession().then(({data:{session}})=>session?showDashboard():showLogin());
 db.auth.onAuthStateChange((_event,session)=>session?showDashboard():showLogin());
 $("loginForm").addEventListener("submit",async e=>{e.preventDefault();msg("loginMessage","Verificando acesso...");const {error}=await db.auth.signInWithPassword({email:$("loginEmail").value,password:$("loginPassword").value});msg("loginMessage",error?error.message:"Acesso autorizado.",!!error)});
 $("logoutButton").addEventListener("click",()=>db.auth.signOut());$("newProductButton").addEventListener("click",()=>openProduct());$("productForm").addEventListener("submit",saveProduct);
 $("closeProductDialog").addEventListener("click",()=>$("productDialog").close());$("cancelProduct").addEventListener("click",()=>$("productDialog").close());$("contentForm").addEventListener("submit",saveContent);
 $("logoImage").addEventListener("change",()=>{const file=$("logoImage").files[0];if(!file)return;const previewUrl=URL.createObjectURL(file);$("logoPreview").src=previewUrl;$("logoPreviewWrap").classList.remove("hidden")});
 document.querySelectorAll(".admin-tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".admin-tab").forEach(x=>x.classList.toggle("active",x===b));["productsTab","contentTab"].forEach(id=>$(id).classList.toggle("hidden",id!==b.dataset.tab))}));
}
document.addEventListener("DOMContentLoaded",init);
