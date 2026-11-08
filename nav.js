(function(){
var SUB=!!document.currentScript&&document.currentScript.hasAttribute("data-sub");
var HOME=SUB?"../":"./";
function el(h){var d=document.createElement("div");d.innerHTML=h.trim();return d.firstChild}
// ---------- image viewer ----------
var LB=null;
function openImg(src,title){
  closeImg(true);
  LB=el('<div class="lb" role="dialog" aria-modal="true"><div class="lb-top"><button type="button" class="lb-x">✕ Закрыть</button><button type="button" class="lb-z">🔍 Крупнее</button></div><div class="lb-sc"><img alt=""></div><div class="lb-hint">Раздвиньте пальцами, чтобы увеличить · жест «назад» закрывает</div></div>');
  LB.querySelector("img").src=src; if(title)LB.querySelector("img").alt=title;
  LB.querySelector(".lb-x").onclick=function(){history.state&&history.state.lb?history.back():closeImg()};
  LB.querySelector(".lb-z").onclick=function(){var z=LB.classList.toggle("zoom");this.textContent=z?"🔍 Мельче":"🔍 Крупнее"};
  LB.querySelector("img").ondblclick=function(){LB.querySelector(".lb-z").click()};
  document.body.appendChild(LB);document.documentElement.style.overflow="hidden";
  try{history.pushState({lb:1},"")}catch(e){}
}
function closeImg(silent){if(!LB)return;LB.remove();LB=null;document.documentElement.style.overflow=""}
window.addEventListener("popstate",function(){if(LB)closeImg();if(SH)closeSheet()});
var IMG=/\.(png|jpe?g|webp|gif)(\?.*)?$/i;
document.addEventListener("click",function(e){
  var a=e.target.closest("a[href]");
  if(a&&IMG.test(a.getAttribute("href"))&&a.origin===location.origin){e.preventDefault();openImg(a.href,a.textContent.trim());return}
  var im=e.target.closest("figure img, .fig img, main img, article img");
  if(SUB&&im&&!a){e.preventDefault();openImg(im.currentSrc||im.src,im.alt)}
},true);
// ---------- sub-pages: top bar ----------
function back(e){e.preventDefault();var r=document.referrer;if(history.length>1&&r&&r.indexOf(location.origin)===0)history.back();else location.href=HOME}
if(SUB){
  var SL="ru";try{SL=localStorage.getItem("dom_lang")||"ru"}catch(e){}
  var ST={back:["← Назад","← Back","← Takaisin"],home:["⌂ Все вещи","⌂ All items","⌂ Kaikki"],nt:["","Translation not available yet — showing Russian.","Käännöstä ei vielä ole — näytetään venäjäksi."]};
  var si=function(){return SL==="en"?1:SL==="fi"?2:0};
  var bar=el('<div class="subbar"><a href="'+HOME+'" class="sb-back"></a><a href="'+HOME+'" class="sb-home"></a><span class="sb-fl"><button type="button" data-lang="ru">🇷🇺</button><button type="button" data-lang="en">🇬🇧</button><button type="button" data-lang="fi">🇫🇮</button></span></div>');
  var applyL=function(){var bl=document.querySelectorAll(".w[data-l]"),has=false;bl.forEach(function(b){if(b.dataset.l===SL)has=true});
    bl.forEach(function(b){b.style.display=(b.dataset.l===(has?SL:"ru"))?"":"none"});
    var nt=document.querySelector(".sb-note");if(!has&&SL!=="ru"&&bl.length){if(!nt){nt=el('<div class="sb-note"></div>');bar.after(nt)}nt.textContent=ST.nt[si()];nt.style.display=""}else if(nt)nt.style.display="none";
    bar.querySelector(".sb-back").textContent=ST.back[si()];bar.querySelector(".sb-home").textContent=ST.home[si()];
    bar.querySelectorAll(".sb-fl button").forEach(function(b){b.classList.toggle("on",b.dataset.lang===SL)});document.documentElement.lang=SL};
  bar.addEventListener("click",function(e){var b=e.target.closest(".sb-fl button");if(!b)return;SL=b.dataset.lang;try{localStorage.setItem("dom_lang",SL)}catch(x){}applyL()});
  bar.querySelector(".sb-back").onclick=back;
  document.body.insertBefore(bar,document.body.firstChild);
  document.querySelectorAll("a.back").forEach(function(x){x.style.display="none"});
  applyL();
  return;
}
// ---------- main page: bottom tab bar + rooms sheet ----------
var SH=null,BG=null;
function q(s){return document.querySelector(s)}
var TL={s:["Поиск","Search","Haku"],r:["Где что","Where is it","Missä mikin"],u:["Наверх","Top","Ylös"]};
function L(){try{return LANG}catch(e){return "ru"}}
function T(k){var l=L();return TL[k][l==="en"?1:l==="fi"?2:0]}
window.navRelabel=function(){document.querySelectorAll(".tabbar button").forEach(function(b){var i=b.querySelector("i");if(i)i.textContent=T(b.dataset.t)})};
function clearSearch(){var i=q("#q");if(i&&i.value){i.value="";i.dispatchEvent(new Event("input"))}}
function closeSheet(){if(SH){SH.remove();BG.remove();SH=BG=null}}
function openSheet(){
  clearSearch();
  var h="",hs=document.querySelectorAll("#browse h2, #browse h3"),n=0;
  hs.forEach(function(x){if(!x.id)x.id="nav-"+(n++);var t=(x.childNodes[0]&&x.childNodes[0].textContent||x.textContent).trim();
    if(x.tagName==="H2")h+=(h?'</div>':'')+'<a class="sz" href="#'+x.id+'">'+t+'</a><div class="rooms">';
    else if(t)h+='<a href="#'+x.id+'">'+t+'</a>'});
  h+='</div>';h=h.replace(/<div class="rooms"><\/div>/g,"");
  BG=el('<div class="sheet-bg"></div>');SH=el('<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div class="sh-h"><b>'+T('r')+'</b><button type="button">✕</button></div>'+h+'</div>');
  BG.onclick=SH.querySelector(".sh-h button").onclick=function(){history.state&&history.state.sh?history.back():closeSheet()};
  SH.addEventListener("click",function(e){var a=e.target.closest("a[href^='#']");if(!a)return;e.preventDefault();var t=document.getElementById(a.getAttribute("href").slice(1));
    closeSheet();if(history.state&&history.state.sh)history.back();setTimeout(function(){t&&t.scrollIntoView({block:"start",behavior:"smooth"})},60)});
  document.body.appendChild(BG);document.body.appendChild(SH);try{history.pushState({sh:1},"")}catch(e){}
}
var tb=el('<nav class="tabbar" aria-label="Меню"><button type="button" data-t="s"><span>🔍</span><i>Поиск</i></button><button type="button" data-t="r"><span>🧭</span><i>Где что</i></button><button type="button" data-t="u"><span>⬆️</span><i>Наверх</i></button></nav>');
tb.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var t=b.dataset.t;
  if(t==="s"){clearSearch();scrollTo({top:0,behavior:"smooth"});setTimeout(function(){var i=q("#q");i&&i.focus()},350)}
  if(t==="r")openSheet();
  if(t==="u"){scrollTo({top:0,behavior:"smooth"})}});
document.body.appendChild(tb);document.body.classList.add("has-tabbar");navRelabel();
})();
