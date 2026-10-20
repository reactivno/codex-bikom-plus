const menu=document.querySelector('.menu'),nav=document.querySelector('#navigation');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');menu.focus()}});
document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!menu.contains(e.target)){menu.setAttribute('aria-expanded','false');nav.classList.remove('open')}});
for(const a of nav.querySelectorAll('a'))if(a.pathname===location.pathname)a.setAttribute('aria-current','page');
// Keep short Russian prepositions and conjunctions with their following word.
const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(!['SCRIPT','STYLE'].includes(node.parentElement.tagName))node.nodeValue=node.nodeValue.replace(/(^|\s)([ВвСсКкУуОоИиАа]|[Нн]а|[Пп]о|[Ии]з|[Зз]а|[Оо]т|[Дд]о|[Нн]е) /g,'$1$2\u00a0')}

// Acknowledgement applies across all pages; closing dismisses only for this tab session.
const cookieBanner=document.querySelector('.cookie-banner');
const cookieAccept=document.querySelector('.cookie-accept');
const cookieClose=document.querySelector('.cookie-close');
const cookieReopen=document.querySelector('.cookie-reopen');
function readCookieFlag(store,key){try{return window[store].getItem(key)}catch{return null}}
function writeCookieFlag(store,key,value){try{window[store].setItem(key,value)}catch{/* Remain usable when browser storage is unavailable. */}}
function updateCookieSpace(){document.documentElement.style.setProperty('--cookie-height',`${cookieBanner.hidden?0:cookieBanner.offsetHeight}px`)}
function showCookieNotice(){cookieBanner.hidden=false;document.body.classList.add('cookie-visible');updateCookieSpace()}
function hideCookieNotice(){cookieBanner.hidden=true;document.body.classList.remove('cookie-visible');updateCookieSpace()}
// No analytics or advertising cookies are loaded by this site.
if(!readCookieFlag('localStorage','bikom-cookie-ack-v1')&&!readCookieFlag('sessionStorage','bikom-cookie-dismissed-v1'))showCookieNotice();
cookieAccept.addEventListener('click',()=>{writeCookieFlag('localStorage','bikom-cookie-ack-v1','acknowledged');hideCookieNotice();cookieReopen.focus({preventScroll:true})});
cookieClose.addEventListener('click',()=>{writeCookieFlag('sessionStorage','bikom-cookie-dismissed-v1','dismissed');hideCookieNotice();cookieReopen.focus({preventScroll:true})});
cookieReopen.addEventListener('click',()=>{showCookieNotice();cookieAccept.focus({preventScroll:true})});
if(typeof ResizeObserver!=='undefined')new ResizeObserver(updateCookieSpace).observe(cookieBanner);
window.addEventListener('resize',updateCookieSpace);

const callbackDialog=document.querySelector('#callback-dialog');
const callbackForm=document.querySelector('#callback-form');
let callbackOpener=null;
const isStand=location.hostname.endsWith(".github.io");
if(isStand){callbackForm.querySelector("[type=submit]").disabled=true;callbackForm.querySelector(".callback-status").textContent="Тестовый стенд: отправка формы отключена. Позвоните в салон.";}
document.querySelectorAll('[data-callback]').forEach(button=>button.addEventListener('click',()=>{callbackOpener=button;callbackDialog.showModal();callbackForm.querySelector('[name=phone]').focus()}));
callbackDialog.querySelector('.dialog-close').addEventListener('click',()=>callbackDialog.close());
callbackDialog.addEventListener('click',e=>{if(e.target===callbackDialog){const r=callbackDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)callbackDialog.close()}});
callbackDialog.addEventListener('close',()=>callbackOpener?.focus({preventScroll:true}));
callbackForm.addEventListener('submit',async e=>{
 e.preventDefault();if(isStand||!callbackForm.reportValidity())return;
 const phone=callbackForm.elements.phone;const digits=phone.value.replace(/\D/g,'');
 phone.setCustomValidity(digits.length<10||digits.length>15?'Введите телефон с кодом страны: от 10 до 15 цифр.':'');if(!phone.reportValidity())return;
 const button=callbackForm.querySelector('[type=submit]'),status=callbackForm.querySelector('.callback-status');button.disabled=true;status.textContent='Отправляем заявку…';
 try{
  const body=new FormData(callbackForm);body.set('page',location.pathname);
  const response=await fetch(callbackForm.action,{method:'POST',headers:{Accept:'application/json'},body});
  const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.errors?.join(' ')||data.error||'Не удалось отправить заявку. Позвоните в салон.');
  status.textContent='Заявка получена. Мы свяжемся с вами в рабочее время.';callbackForm.reset();
 }catch(error){status.textContent=error.message||'Не удалось отправить заявку. Попробуйте ещё раз или позвоните в салон.'}finally{button.disabled=false}
});
callbackForm.elements.phone.addEventListener('input',()=>callbackForm.elements.phone.setCustomValidity(''));
