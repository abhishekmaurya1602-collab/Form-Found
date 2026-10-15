const $ = id => document.getElementById(id);
const ICONS = {
  spark:'<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6"/>',
  search:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  bookmark:'<path d="M6 4h12v17l-6-4-6 4z"/>',
  grid:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  shuffle:'<path d="M3 6h2c5 0 9 12 14 12h2M17 14l4 4-4 4M3 18h2c2.1 0 4.1-2.2 6-5M14 8c1.7-1.5 3.3-2 5-2h2M17 2l4 4-4 4"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.2"/>',
  sliders:'<path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  layout:'<rect x="4" y="4" width="6" height="16" rx="1"/><rect x="14" y="4" width="6" height="9" rx="1"/><rect x="14" y="17" width="6" height="3" rx="1"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  'arrow-up':'<path d="M12 20V4m-6 6 6-6 6 6"/>',
  arrow:'<path d="M5 19 19 5M5 5h14v14"/>',
  check:'<path d="m5 12 4 4L19 6"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.arrow}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el => el.outerHTML = icon(el.dataset.icon));
const escapeHtml = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories = ['All finds','Furniture','Lighting','Objects','Tech & audio','Watches','Footwear'];
const ids = new Set(PRODUCTS.map(p=>p.id));
let saved = new Set();
try { const stored=JSON.parse(localStorage.getItem('form-found-saved') || '[]');if(Array.isArray(stored)) saved=new Set(stored.filter(id=>ids.has(id))); } catch { /* Browsing still works when storage is unavailable. */ }
const state = {view:'discover',category:'All finds',query:'',palette:'all',material:'all',sort:'curated',visible:16,order:PRODUCTS.map(p=>p.id)};
let currentProduct=null, lastProductTrigger=null, toastTimeout, layoutFrame, loading=false;
const prefersReducedMotion = ()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const goTop=()=>window.scrollTo({top:0,behavior:prefersReducedMotion()?'instant':'smooth'});
const find = id=>PRODUCTS.find(p=>p.id===id);
function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('visible'),2400);}
function filteredProducts(){
  const term=state.query.trim().toLowerCase();
  const list=PRODUCTS.filter(p=>(state.view!=='saved'||saved.has(p.id))&&(state.category==='All finds'||p.category===state.category)&&(state.palette==='all'||p.palette===state.palette)&&(state.material==='all'||p.material===state.material)&&(!term||[p.title,p.category,p.material,p.note,p.description].join(' ').toLowerCase().includes(term)));
  if(state.sort==='az')return list.sort((a,b)=>a.title.localeCompare(b.title));
  if(state.sort==='newest')return list.reverse();
  const order=new Map(state.order.map((id,i)=>[id,i]));return list.sort((a,b)=>order.get(a.id)-order.get(b.id));
}
function updateSavedControls(){
  document.querySelectorAll('.saved-number').forEach(el=>el.textContent=saved.size);
  document.querySelectorAll('[data-save]').forEach(el=>{
    const selected=saved.has(el.dataset.save), p=find(el.dataset.save);
    el.classList.toggle('saved',selected);el.setAttribute('aria-pressed',selected);
    el.setAttribute('aria-label',`${selected?'Remove':'Save'} ${p.title}${selected?' from your collection':' to your collection'}`);
    el.innerHTML=el.classList.contains('detail-save')?`${icon(selected?'check':'bookmark')} ${selected?'Saved to my collection':'Save to my collection'}`:icon('bookmark');
  });
}
function toggleSaved(id){
  const wasSaved=saved.has(id);wasSaved?saved.delete(id):saved.add(id);
  let persisted=true;try{localStorage.setItem('form-found-saved',JSON.stringify([...saved]));}catch{persisted=false;}
  updateSavedControls();
  if(state.view==='saved')renderGallery();
  notify(persisted?(wasSaved?'Removed from your collection':'A good find. Saved to your collection.'):'Saved for this visit. Browser storage is unavailable.');
}
function renderCategories(){
  const focusedCategory=document.activeElement?.dataset.category;
  $('categories').innerHTML=categories.map((c,i)=>`<button class="category ${state.category===c?'active':''}" data-category="${escapeHtml(c)}" aria-pressed="${state.category===c}">${i===0?'<span class="category-mark" aria-hidden="true">'+icon('spark')+'</span>':''}${escapeHtml(c)}</button>`).join('');
  if(focusedCategory){[...$('categories').children].find(button=>button.dataset.category===focusedCategory)?.focus({preventScroll:true});}
}
function cardMarkup(p,index){
  return `<article class="card product-card" data-product="${p.id}" style="--ratio:${p.ratio};--tile-bg:${p.bg};animation-delay:${Math.min(index,7)*25}ms"><div class="card-content"><div class="photo"><button class="product-open" data-open="${p.id}" aria-label="Explore ${escapeHtml(p.title)}"><img class="product-image ${p.image.endsWith('.jpg')?'photograph':''} ${p.fullBleed?'full-bleed':''}" src="${p.image}" alt="${escapeHtml(p.title)}" loading="${index<5?'eager':'lazy'}" decoding="async" width="400" height="400"><span class="open-label">Take a closer look ${icon('arrow')}</span></button>${p.tag?`<span class="card-badge ${p.tag==='CURATOR’S PICK'?'pick':''}">${p.tag}</span>`:''}<button class="save-button ${saved.has(p.id)?'saved':''}" data-save="${p.id}" aria-pressed="${saved.has(p.id)}" aria-label="${saved.has(p.id)?'Remove':'Save'} ${escapeHtml(p.title)} ${saved.has(p.id)?'from':'to'} your collection">${icon('bookmark')}</button></div><div class="card-info"><div class="card-heading"><h2 class="card-title"><button data-open="${p.id}">${escapeHtml(p.title)}</button></h2><span class="card-number">F—${String(PRODUCTS.indexOf(p)+1).padStart(3,'0')}</span></div><p class="card-subtitle">${escapeHtml(p.note)}<span>·</span>${escapeHtml(p.category)}</p></div></div></article>`;
}
function editorialMarkup(){return `<article class="card editorial-card"><div class="card-content"><div class="editorial-top"><span>THE ART OF EVERYDAY</span><span>01 /</span></div><span class="editorial-flower" aria-hidden="true">${icon('spark')}</span><h2>Ordinary things.<br>Extraordinary<br>little details.</h2><p>A good object doesn't ask for attention. It quietly earns it.</p><button data-editorial>Find your everyday favorite ${icon('arrow')}</button></div></article>`;}
function masonry(){
  cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>{
    $('gallery').querySelectorAll('.card').forEach(card=>{const height=card.querySelector('.card-content').getBoundingClientRect().height;card.style.gridRowEnd=`span ${Math.ceil(height+24)}`;});
  });
}
const resizeObserver=new ResizeObserver(masonry);resizeObserver.observe($('gallery'));
function renderGallery(append=false){
  const list=filteredProducts(),visible=list.slice(0,state.visible);
  const hasEditorial=state.view==='discover'&&state.category==='All finds'&&!state.query&&state.palette==='all'&&state.material==='all'&&state.sort==='curated';
  if(append){
    const existing=new Set([...$('gallery').querySelectorAll('[data-product]')].map(c=>c.dataset.product));
    $('gallery').insertAdjacentHTML('beforeend',visible.filter(p=>!existing.has(p.id)).map((p,i)=>cardMarkup(p,i)).join(''));
  }else{
    $('gallery').innerHTML=visible.map((p,i)=>cardMarkup(p,i)+(hasEditorial&&i===6?editorialMarkup():'')).join('');
  }
  $('result-count').innerHTML=state.query?`<strong>${list.length} ${list.length===1?'find':'finds'}</strong> for “${escapeHtml(state.query)}”`:`<strong>${String(list.length).padStart(2,'0')} ${list.length===1?'considered object':'considered objects'}</strong><span aria-hidden="true"> &nbsp; / &nbsp; </span>${state.view==='saved'?'Your personal collection':'Independently collected'}`;
  const empty=list.length===0;$('empty-state').hidden=!empty;
  const trulyEmptySaved=state.view==='saved'&&saved.size===0;
  $('empty-title').textContent=trulyEmptySaved?'Your good finds go here.':'Nothing here. Yet.';
  $('empty-copy').textContent=trulyEmptySaved?'See something you love? Tap the bookmark on any object to start your own little collection.':'Try another search or loosen the filters. Your next favorite might be one click away.';
  $('empty-action').textContent=trulyEmptySaved?'Discover something good ↗':'Clear search & filters ↺';
  $('load-zone').hidden=empty||state.visible>=list.length;
  $('end-note').hidden=empty||state.visible<list.length||state.view==='saved';
  $('page-title').innerHTML=state.view==='saved'?'Your very own <em>good things.</em>':'Find your next <em>obsession.</em>';
  $('intro-copy').textContent=state.view==='saved'?'A little collection of things that caught your eye. Saved on this browser.':'Considered objects. Unexpected finds. A place to get a little lost.';
  document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===state.view));
  document.querySelector('.filter-dot').hidden=state.palette==='all'&&state.material==='all';
  masonry();
}
function resetFilters(){state.category='All finds';state.query='';state.palette='all';state.material='all';state.visible=16;$('search').value='';$('palette').value='all';$('material').value='all';renderCategories();}
function setView(view){state.view=view;resetFilters();renderGallery();goTop();}
function loadMore(){
  if(loading||state.visible>=filteredProducts().length)return;
  loading=true;state.visible+=12;renderGallery(true);requestAnimationFrame(()=>{loading=false});
}
const loadObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!$('load-zone').hidden)loadMore();},{rootMargin:'300px'});loadObserver.observe($('load-zone'));
function mixItUp(){
  state.view='discover';resetFilters();state.sort='curated';$('sort').value='curated';
  const order=PRODUCTS.map(p=>p.id);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}state.order=order;
  renderGallery();goTop();notify('Same good taste. A fresh perspective.');
}
function openProduct(id,trigger){
  const p=find(id);if(!p)return;currentProduct=id;
  if(!$('product-dialog').open)lastProductTrigger=trigger||document.activeElement;
  const related=PRODUCTS.filter(o=>o.id!==id&&o.category===p.category).slice(0,3);
  $('product-detail').innerHTML=`<div class="detail-layout"><div class="detail-image" style="--tile-bg:${p.bg}"><img src="${p.image}" alt="${escapeHtml(p.title)}" width="450" height="450"></div><div class="detail-copy"><span class="detail-category">THE FIND / ${escapeHtml(p.category)}</span><h2 id="detail-title">${escapeHtml(p.title)}</h2><p class="detail-description">${escapeHtml(p.description)}</p><dl class="detail-facts"><div><dt>In the collection</dt><dd>${escapeHtml(p.category)}</dd></div><div><dt>Material study</dt><dd>${escapeHtml(p.material==='mixed'?'Mixed materials':p.material[0].toUpperCase()+p.material.slice(1))}</dd></div><div><dt>Object reference</dt><dd>F—${String(PRODUCTS.indexOf(p)+1).padStart(3,'0')}</dd></div></dl><button class="solid-button detail-save" data-save="${p.id}"></button><a class="detail-source" href="${p.image}" target="_blank" rel="noopener">View original photograph ${icon('arrow')}</a></div></div>${related.length?`<div class="detail-related"><h3>A few more things you might like</h3><div class="related-grid">${related.map(r=>`<button class="related-object" data-open="${r.id}"><img src="${r.image}" alt="" width="150" height="110"><span>${escapeHtml(r.title)}</span></button>`).join('')}</div></div>`:''}`;
  updateSavedControls();
  if(!$('product-dialog').open){$('product-dialog').showModal();document.body.style.overflow='hidden';}
  $('product-dialog').scrollTop=0;$('product-dialog').querySelector('[data-close]').focus();
}
function showInfo(type){
  $('info-content').innerHTML=type==='credits'?`<span class="eyebrow">BEHIND THE PHOTOGRAPHS</span><h2 id="info-title">Real objects. Real images.</h2><p>The gallery uses product photographs stored with this site. No generated product imagery or placeholder images.</p><ul><li>Furniture, lighting & tabletop: <a href="https://github.com/codewithsadee/woodex" target="_blank" rel="noopener">Woodex image collection</a></li><li>Footwear: <a href="https://github.com/codewithsadee/footcap" target="_blank" rel="noopener">Footcap image collection</a></li><li>Headphones: <a href="https://github.com/bedimcode/responsive-landing-page-headphones" target="_blank" rel="noopener">Bedimcode headphones collection</a></li><li>Watches: <a href="https://github.com/bedimcode/responsive-watches-website" target="_blank" rel="noopener">Bedimcode watches collection</a></li></ul><p>Editorial titles describe the photographed objects. They are not manufacturer model names. Brand names belong to their respective owners.</p><a class="text-link" href="assets/image-credits.json" target="_blank" rel="noopener">Full image source list ↗</a>`:`<span class="eyebrow">A COLLECTION, NOT A CHECKOUT</span><h2 id="info-title">For the endlessly curious.</h2><p>Form & Found is an independent gallery of objects worth a second look. Furniture, everyday essentials, wearable details, and the small things that make life more interesting.</p><p>Wander through ${PRODUCTS.length} photographed finds. Follow a material, fall for a color, or save a few favorites. Your collection stays in this browser. There are no accounts and nothing to buy here.</p><button class="solid-button" data-close>Back to the good things ↗</button>`;
  $('info-dialog').showModal();document.body.style.overflow='hidden';
}
document.addEventListener('click',event=>{
  const save=event.target.closest('[data-save]');if(save){toggleSaved(save.dataset.save);return;}
  const open=event.target.closest('[data-open]');if(open){openProduct(open.dataset.open,open);return;}
  const view=event.target.closest('[data-view]');if(view){setView(view.dataset.view);return;}
  const category=event.target.closest('[data-category]');if(category){state.category=category.dataset.category;state.visible=16;renderCategories();renderGallery();return;}
  const close=event.target.closest('[data-close]');if(close){close.closest('dialog').close();return;}
  if(event.target.closest('[data-editorial]')){state.category='Objects';state.visible=16;renderCategories();renderGallery();$('categories').scrollIntoView({block:'nearest',behavior:prefersReducedMotion()?'instant':'smooth'});}
});
document.querySelector('.search').addEventListener('submit',e=>e.preventDefault());
$('search').addEventListener('input',e=>{state.query=e.target.value;state.visible=16;renderGallery();});
['palette','material','sort'].forEach(key=>$(key).addEventListener('change',e=>{state[key]=e.target.value;state.visible=16;renderGallery();}));
$('refine-toggle').addEventListener('click',()=>{const open=$('refine-panel').hidden;$('refine-panel').hidden=!open;$('refine-toggle').setAttribute('aria-expanded',open);});
$('reset-filters').addEventListener('click',()=>{resetFilters();renderGallery();});
$('empty-action').addEventListener('click',()=>{if(state.view==='saved'&&saved.size===0)setView('discover');else{resetFilters();renderGallery();}});
$('density-toggle').addEventListener('click',()=>{const compact=$('gallery').classList.toggle('compact');$('density-toggle').setAttribute('aria-pressed',compact);$('density-toggle').setAttribute('aria-label',`Use ${compact?'comfortable':'compact'} gallery layout`);masonry();});
$('shuffle').addEventListener('click',mixItUp);$('remix').addEventListener('click',mixItUp);$('load-more').addEventListener('click',loadMore);
$('about-open').addEventListener('click',()=>showInfo('about'));$('credits-open').addEventListener('click',()=>showInfo('credits'));
$('back-top').addEventListener('click',goTop);window.addEventListener('scroll',()=>{$('back-top').hidden=scrollY<700;},{passive:true});
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow='';if(dialog.id==='product-dialog'){currentProduct=null;if(lastProductTrigger?.isConnected)lastProductTrigger.focus({preventScroll:true});else $('gallery').focus({preventScroll:true});}});
});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!document.querySelector('dialog[open]')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}});
window.addEventListener('storage',event=>{if(event.key!=='form-found-saved')return;try{const data=JSON.parse(event.newValue||'[]');if(!Array.isArray(data))return;saved=new Set(data.filter(id=>ids.has(id)));updateSavedControls();if(state.view==='saved')renderGallery();}catch{}});
document.fonts.ready.then(masonry);renderCategories();renderGallery();updateSavedControls();
