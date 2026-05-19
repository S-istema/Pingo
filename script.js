/* ===== ESTADO ===== */
var S={hunger:80,energy:90,fun:70,clean:85,health:90,coins:120,gems:5,level:1,xp:0,xpN:100,color:'#1a3a6a',hat:null,acc:null,scale:1,rainbow:false,mood:'happy',feedC:0,bathC:0,gameW:0,coinT:120,lastD:0,potC:0,usedRb:false,hi:{}};
function save(){localStorage.setItem('pou3d',JSON.stringify(S))}
function load(){var d=localStorage.getItem('pou3d');if(d){var o=JSON.parse(d);for(var k in o)S[k]=o[k]}}load();

/* ===== CORES ===== */
function htr(h){h=h.replace('#','');return[parseInt(h.substring(0,2),16),parseInt(h.substring(2,4),16),parseInt(h.substring(4,6),16)]}
function rth(r,g,b){return'#'+[r,g,b].map(function(x){return Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')}).join('')}
function lighten(h,p){var c=htr(h);return rth(c[0]+(255-c[0])*p/100,c[1]+(255-c[1])*p/100,c[2]+(255-c[2])*p/100)}
function darken(h,p){var c=htr(h);return rth(c[0]*(1-p/100),c[1]*(1-p/100),c[2]*(1-p/100))}

/* ===== TOAST/SPEECH/PARTICLE ===== */
var _tt;function toast(m){var e=document.getElementById('toast');e.textContent=m;e.classList.add('on');clearTimeout(_tt);_tt=setTimeout(function(){e.classList.remove('on')},2200)}
var _st;function showSp(t){var e=document.getElementById('sp');e.textContent=t;e.style.display='block';clearTimeout(_st);_st=setTimeout(function(){e.style.display='none'},2000)}
function particle(x,y,em){var e=document.createElement('div');e.className='ptc';e.textContent=em;e.style.left=x+'px';e.style.top=y+'px';document.getElementById('rw').appendChild(e);setTimeout(function(){e.remove()},800)}

/* ===== CANVAS ===== */
var cvs=document.getElementById('pc'),ctx=cvs.getContext('2d');
var CW,CH,PX,PY,PS,tX=null,tY=null,blinkT=0,isBlink=false,animT=0,aState='idle',aTimer=0,squish=0;
var mouthOpen=0; /* 0-1 para animacao de comer */
function resizeC(){
    var w=document.getElementById('rw').getBoundingClientRect();
    var d=window.devicePixelRatio||1;
    CW=w.width;CH=w.height;
    cvs.width=CW*d;cvs.height=CH*d;
    cvs.style.width=CW+'px';cvs.style.height=CH+'px';
    ctx.setTransform(d,0,0,d,0,0);
    PS=Math.max(Math.min(CW*.55, 260), Math.min(CH*.6, 260));
    PX=CW/2;
    PY=CH/2 - PS*0.05;
}
window.addEventListener('resize',resizeC);resizeC();

/* ===== DESENHAR PINGUIM GRANDE ===== */
function drawPou(){
    ctx.clearRect(0,0,CW,CH);
    var s=PS/150;var col=S.color;
    if(S.rainbow)col='hsl('+((animT*3)%360)+',55%,45%)';
    ctx.save();ctx.translate(PX,PY);
    var br=1+Math.sin(animT*.04)*.01;
    var sx=1+squish*.1,sy=1-squish*.07;squish*=.85;
    var by=0;
    if(aState==='bounce')by=Math.sin(animT*.25)*8;
    if(aState==='sleep')by=Math.sin(animT*.04)*2;
    if(aState==='dance')by=Math.abs(Math.sin(animT*.15))*10;
    if(aState==='eating')by=Math.sin(animT*.4)*3;
    ctx.translate(0,by);ctx.scale(s*sx*br,s*sy*br);

    /* Sombra */
    ctx.beginPath();ctx.ellipse(0,78,40,10,0,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fill();

    /* Pes */
    ctx.fillStyle='#E8973F';
    ctx.beginPath();ctx.ellipse(-16,72,14,7,-.12,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(16,72,14,7,.12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#D4822F';
    ctx.beginPath();ctx.ellipse(-16,75,10,4,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(16,75,10,4,0,0,Math.PI*2);ctx.fill();

    /* Corpo oval grande */
    ctx.beginPath();ctx.ellipse(0,16,42,56,0,0,Math.PI*2);
    var bg=ctx.createRadialGradient(-14,-14,5,2,12,75);
    bg.addColorStop(0,lighten(col,20));bg.addColorStop(0.5,col);bg.addColorStop(1,darken(col,18));
    ctx.fillStyle=bg;ctx.fill();

    /* Asas */
    ctx.save();ctx.translate(-42,8);ctx.rotate(.12+Math.sin(animT*.06)*.05);
    ctx.beginPath();ctx.ellipse(0,0,12,34,0,0,Math.PI*2);ctx.fillStyle=darken(col,12);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(42,8);ctx.rotate(-.12-Math.sin(animT*.06)*.05);
    ctx.beginPath();ctx.ellipse(0,0,12,34,0,0,Math.PI*2);ctx.fillStyle=darken(col,12);ctx.fill();ctx.restore();

    /* Barriga branca grande */
    ctx.beginPath();ctx.ellipse(0,22,24,38,0,0,Math.PI*2);
    var wbg=ctx.createRadialGradient(-4,14,3,-2,18,30);
    wbg.addColorStop(0,'#FFFFFF');wbg.addColorStop(1,'#E8EDF2');
    ctx.fillStyle=wbg;ctx.fill();

    /* Brilho corpo */
    var hl=ctx.createRadialGradient(-20,-22,3,-12,-12,38);
    hl.addColorStop(0,'rgba(255,255,255,.18)');hl.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=hl;ctx.beginPath();ctx.ellipse(0,16,42,56,0,0,Math.PI*2);ctx.fill();

    /* Bico */
    ctx.beginPath();ctx.moveTo(-11,-24);ctx.lineTo(0,-12);ctx.lineTo(11,-24);ctx.closePath();
    ctx.fillStyle='#E8973F';ctx.fill();
    ctx.beginPath();ctx.moveTo(-8,-24);ctx.lineTo(0,-16);ctx.lineTo(8,-24);ctx.closePath();
    ctx.fillStyle='#F4A84B';ctx.fill();

    /* Olhos grandes */
    var ey=aState==='sleep'?2:0;
    [-14,14].forEach(function(ox){
        ctx.beginPath();ctx.ellipse(ox,-36+ey,11,13,0,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,.06)';ctx.lineWidth=.8;ctx.stroke();
        if(!isBlink&&aState!=='sleep'){
            var px2=ox,py2=-36+ey;
            if(tX!==null){px2=ox+Math.max(-3,Math.min(3,(tX-PX)*.01));py2=-36+ey+Math.max(-2,Math.min(2,(tY-PY)*.008))}
            ctx.beginPath();ctx.ellipse(px2,py2,6,8,0,0,Math.PI*2);ctx.fillStyle='#0a0a1e';ctx.fill();
            ctx.beginPath();ctx.ellipse(px2-2,py2-3,2.2,2.2,0,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
            ctx.beginPath();ctx.ellipse(px2+1.5,py2+1.5,1,1,0,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fill();
        }else{ctx.strokeStyle='#0a0a1e';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ox-7,-36+ey);ctx.quadraticCurveTo(ox,-32+ey,ox+7,-36+ey);ctx.stroke()}
    });

    /* Bochechas */
    if(S.mood==='happy'||S.mood==='excited'){ctx.fillStyle='rgba(255,120,140,.2)';ctx.beginPath();ctx.ellipse(-24,-26,6,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(24,-26,6,4,0,0,Math.PI*2);ctx.fill()}

    /* Boca - abre ao comer */
    var mo=mouthOpen;
    ctx.strokeStyle='#2a1a0a';ctx.lineWidth=2.5;ctx.lineCap='round';
    if(mo>.1){
        ctx.beginPath();ctx.ellipse(0,-16,7*mo,5*mo,0,0,Math.PI*2);ctx.fillStyle='#8B0000';ctx.fill();ctx.stroke();
    }else if(S.mood==='happy'){ctx.beginPath();ctx.moveTo(-7,-16);ctx.quadraticCurveTo(0,-10,7,-16);ctx.stroke()}
    else if(S.mood==='sad'){ctx.beginPath();ctx.moveTo(-6,-14);ctx.quadraticCurveTo(0,-18,6,-14);ctx.stroke()}
    else if(S.mood==='hungry'){ctx.beginPath();ctx.arc(0,-14,4,0,Math.PI*2);ctx.stroke()}
    else if(S.mood==='sleepy'){ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(4,-14);ctx.stroke()}
    else if(S.mood==='excited'){ctx.beginPath();ctx.moveTo(-9,-14);ctx.quadraticCurveTo(0,-7,9,-14);ctx.stroke()}
    else if(S.mood==='sick'){ctx.beginPath();ctx.moveTo(-5,-13);ctx.quadraticCurveTo(0,-17,5,-13);ctx.stroke()}
    else{ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(4,-14);ctx.stroke()}

    /* Chapeus */
    if(S.hat==='party'){ctx.fillStyle='#E91E63';ctx.beginPath();ctx.moveTo(0,-82);ctx.lineTo(-18,-50);ctx.lineTo(18,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#FFD54F';ctx.beginPath();ctx.arc(0,-82,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#E91E63';ctx.beginPath();ctx.ellipse(0,-50,22,5,0,0,Math.PI*2);ctx.fill()}
    if(S.hat==='crown'){ctx.fillStyle='#FFD54F';ctx.beginPath();ctx.moveTo(-20,-50);ctx.lineTo(-20,-70);ctx.lineTo(-10,-60);ctx.lineTo(0,-74);ctx.lineTo(10,-60);ctx.lineTo(20,-70);ctx.lineTo(20,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#EF5350';ctx.beginPath();ctx.arc(0,-74,3.5,0,Math.PI*2);ctx.fill()}
    if(S.hat==='cap'){ctx.fillStyle=darken(col,10);ctx.beginPath();ctx.ellipse(0,-46,22,13,0,Math.PI,0);ctx.fill();ctx.fillStyle=darken(col,20);ctx.beginPath();ctx.ellipse(17,-46,15,4,-.2,0,Math.PI*2);ctx.fill()}
    if(S.hat==='bow'){ctx.fillStyle='#E91E63';ctx.beginPath();ctx.ellipse(-9,-52,9,6,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(9,-52,9,6,.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(0,-52,3.5,0,0,Math.PI*2);ctx.fill()}
    if(S.hat==='tophat'){ctx.fillStyle='#1a1a1a';ctx.fillRect(-15,-86,30,38);ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(0,-48,22,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#E91E63';ctx.fillRect(-15,-55,30,5)}

    /* Acessorios */
    if(S.acc==='glasses'){ctx.strokeStyle='#37474F';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(-14,-36,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(14,-36,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-5,-36);ctx.lineTo(5,-36);ctx.stroke()}
    if(S.acc==='sunglasses'){ctx.fillStyle='rgba(15,25,40,.75)';ctx.strokeStyle='#37474F';ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(-24,-44,18,14,4);ctx.fill();ctx.stroke();ctx.beginPath();ctx.roundRect(6,-44,18,14,4);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-6,-37);ctx.lineTo(6,-37);ctx.stroke()}
    if(S.acc==='blush'){ctx.fillStyle='rgba(255,80,120,.35)';ctx.beginPath();ctx.ellipse(-24,-24,8,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(24,-24,8,5,0,0,Math.PI*2);ctx.fill()}
    if(S.acc==='mustache'){ctx.fillStyle='#3E2723';ctx.beginPath();ctx.ellipse(-7,-6,8,4,-.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(7,-6,8,4,.2,0,Math.PI*2);ctx.fill()}
    if(S.acc==='scarf'){ctx.fillStyle='#E91E63';ctx.beginPath();ctx.ellipse(0,-4,32,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#C2185B';ctx.beginPath();ctx.roundRect(10,-4,9,20,4);ctx.fill()}

    /* Zzz */
    if(aState==='sleep'){var a=Math.abs(Math.sin(animT*.05));ctx.font=(12+a*5)+'px Nunito';ctx.fillStyle='rgba(180,200,255,'+a+')';ctx.fillText('z',44,-52);ctx.font=(9+a*3)+'px Nunito';ctx.fillText('z',54,-64);ctx.fillText('z',60,-72)}
    ctx.restore();
    /* Diminuir mouthOpen */
    if(mouthOpen>0)mouthOpen=Math.max(0,mouthOpen-.06);
}

setInterval(function(){isBlink=true;setTimeout(function(){isBlink=false},150)},3500+Math.random()*2000);
function animLoop(){animT++;if(aTimer>0){aTimer--;if(aTimer<=0)aState='idle'}drawPou();updateMood();requestAnimationFrame(animLoop)}animLoop();

/* Touch olhos */
cvs.addEventListener('touchstart',function(e){var t=e.touches[0];var r=cvs.getBoundingClientRect();tX=t.clientX-r.left;tY=t.clientY-r.top},{passive:true});
cvs.addEventListener('touchmove',function(e){var t=e.touches[0];var r=cvs.getBoundingClientRect();tX=t.clientX-r.left;tY=t.clientY-r.top},{passive:true});
cvs.addEventListener('touchend',function(){tX=null;tY=null},{passive:true});
cvs.addEventListener('mousemove',function(e){var r=cvs.getBoundingClientRect();tX=e.clientX-r.left;tY=e.clientY-r.top});
cvs.addEventListener('mouseleave',function(){tX=null;tY=null});

function updateMood(){var m='happy';if(S.health<25)m='sick';else if(S.hunger<18)m='hungry';else if(S.energy<18)m='sleepy';else if(S.clean<18)m='sad';else if(S.fun>78&&S.energy>55)m='excited';else if(S.hunger<35||S.energy<35||S.fun<35||S.clean<35)m='sad';S.mood=m;document.getElementById('mf').textContent={happy:'😊',sad:'😢',hungry:'😣',sleepy:'😴',sick:'🤒',excited:'🤩'}[m]||'😊'}

setInterval(function(){if(S.energy>8||S.mood!=='sleep'){S.hunger=Math.max(0,S.hunger-.7);S.energy=Math.max(0,S.energy-.35);S.fun=Math.max(0,S.fun-.45);S.clean=Math.max(0,S.clean-.28)}var avg=(S.hunger+S.energy+S.clean)/3;if(avg<38)S.health=Math.max(0,S.health-.45);else S.health=Math.min(100,S.health+.18);updateUI();save()},5000);

function updateUI(){var ids=['bH','bE','bF','bC','bHp'];var vals=[S.hunger,S.energy,S.fun,S.clean,S.health];for(var i=0;i<5;i++)document.getElementById(ids[i]).style.width=Math.round(vals[i])+'%';document.getElementById('sC').textContent=S.coins;document.getElementById('sG').textContent=S.gems;document.getElementById('sL').textContent=S.level;document.getElementById('xpf').style.width=(S.xp/S.xpN*100)+'%'}
function gainXP(a){S.xp+=a;while(S.xp>=S.xpN){S.xp-=S.xpN;S.level++;S.xpN=Math.floor(S.xpN*1.35);S.coins+=50;toast('Nivel '+S.level+'! +50 moedas')}updateUI();save()}
function earn(n){S.coins+=n;S.coinT+=n;updateUI();save()}

/* ===== ACOES ===== */
function petPou(){S.fun=Math.min(100,S.fun+6);squish=1;aState='bounce';aTimer=24;gainXP(2);showSp(['Oi!','Hehe!','Mais!','Obrigado!'][Math.floor(Math.random()*4)]);var r=cvs.getBoundingClientRect();particle(PX+r.left-15,PY+r.top-40,'❤️');updateUI()}
function pouSleep(){if(S.energy>=93){toast('Sem sono!');return}aState='sleep';aTimer=999;toast('Dormindo...');var t=0;var iv=setInterval(function(){S.energy=Math.min(100,S.energy+7);updateUI();t++;if(t>=8||S.energy>=93){clearInterval(iv);aState='idle';aTimer=0;toast('Acordou!');gainXP(10);save()}},600)}
function pouDance(){if(S.energy<12){toast('Cansado!');return}aState='dance';aTimer=120;S.fun=Math.min(100,S.fun+22);S.energy=Math.max(0,S.energy-8);gainXP(5);toast('Dancando!');showSp('La la la!');updateUI();save()}

/* ===== SALAS ===== */
var roomUI={hall:'ui-hall',food:'fg',bath:'bath-items',games:'ui-games',lab:'ui-lab',closet:'ui-closet'};
document.querySelectorAll('.tab').forEach(function(t){t.addEventListener('click',function(){document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on')});t.classList.add('on');var r=t.dataset.r;document.querySelectorAll('.rm').forEach(function(x){x.classList.remove('on')});document.getElementById('r-'+r).classList.add('on');for(var k in roomUI){var el=document.getElementById(roomUI[k]);if(el)el.style.display='none'}var ui=document.getElementById(roomUI[r]);if(ui&&r!=='bath')ui.style.display='';if(r==='bath'){buildBath();document.getElementById('cbw').style.display='none'}if(r==='food')buildFood();if(r==='games')buildGames();if(r==='lab')buildLab();if(r==='closet')buildCloset()})});

/* ===== COMIDA - ARRASTAR ATE BOCA ===== */
var foods=[{e:'🍔',n:'Hamburger',h:32,f:8,c:8},{e:'🍕',n:'Pizza',h:28,f:12,c:10},{e:'🍟',n:'Batata',h:18,f:6,c:5},{e:'🌮',n:'Taco',h:22,f:8,c:7},{e:'🍎',n:'Maca',h:14,f:4,c:3},{e:'🍌',n:'Banana',h:16,f:4,c:3},{e:'🍓',n:'Morango',h:10,f:8,c:4},{e:'🍉',n:'Melancia',h:18,f:10,c:5},{e:'🍇',n:'Uva',h:11,f:6,c:4},{e:'🎂',n:'Bolo',h:22,f:18,c:12},{e:'🍦',n:'Sorvete',h:18,f:22,c:10},{e:'🍫',n:'Chocolate',h:14,f:16,c:8},{e:'🥛',n:'Leite',h:11,f:4,c:3},{e:'🥤',n:'Refri',h:7,f:12,c:4},{e:'🧃',n:'Suco',h:9,f:10,c:4},{e:'☕',n:'Cafe',h:4,f:6,c:5},{e:'🐟',n:'Peixe',h:20,f:5,c:6},{e:'🍰',n:'Torta',h:24,f:15,c:11}];

function buildFood(){var g=document.getElementById('fg');var h='';for(var i=0;i<foods.length;i++){var f=foods[i];h+='<div class="fi" data-fi="'+i+'"><div>'+f.e+'</div><div class="fn">'+f.n+'</div><div class="fp">🪙'+f.c+'</div></div>'}g.innerHTML=h;g.querySelectorAll('.fi').forEach(function(el){var fi=parseInt(el.dataset.fi);el.addEventListener('touchstart',function(e){startDrag(e,fi,'food')},{passive:false});el.addEventListener('mousedown',function(e){startDrag(e,fi,'food')})})}

/* ===== BANHO - ARRASTAR ITENS NO POUCanvas ===== */
var bathItems=[{e:'🧼',n:'Sabao',clean:30},{e:'🪥',n:'Escova',clean:20},{e:'🧴',n:'Shampoo',clean:25},{e:'💦',n:'Agua',clean:15},{e:'🧽',n:'Esponja',clean:20},{e:'🫧',n:'Bolha',clean:10},{e:'🪣',n:'Balde',clean:15},{e:'🚿',n:'Chuveiro',clean:35}];
function buildBath(){var g=document.getElementById('bath-items');var h='';for(var i=0;i<bathItems.length;i++){var b=bathItems[i];h+='<div class="fi" data-bi="'+i+'"><div>'+b.e+'</div><div class="fn">'+b.n+'</div></div>'}g.innerHTML=h;g.querySelectorAll('.fi').forEach(function(el){var bi=parseInt(el.dataset.bi);el.addEventListener('touchstart',function(e){startDrag(e,bi,'bath')},{passive:false});el.addEventListener('mousedown',function(e){startDrag(e,bi,'bath')})})}

/* ===== SISTEMA DE DRAG UNIFICADO ===== */
var dc=document.getElementById('dc'),dragging=false,dragType='',dragIdx=-1;
function startDrag(e,idx,type){e.preventDefault();dragging=true;dragType=type;dragIdx=idx;var item=type==='food'?foods[idx]:bathItems[idx];dc.textContent=item.e;dc.style.display='block';moveDrag(e)}
function moveDrag(e){if(!dragging)return;e.preventDefault();var t=e.touches?e.touches[0]:e;dc.style.left=(t.clientX-18)+'px';dc.style.top=(t.clientY-18)+'px'}
function endDrag(e){if(!dragging)return;dragging=false;dc.style.display='none';var t=e.changedTouches?e.changedTouches[0]:e;var r=cvs.getBoundingClientRect();if(t.clientX>r.left&&t.clientX<r.right&&t.clientY>r.top&&t.clientY<r.bottom){if(dragType==='food')feedPou(dragIdx);else if(dragType==='bath')bathPou(dragIdx)}dragType='';dragIdx=-1}
document.addEventListener('touchmove',moveDrag,{passive:false});document.addEventListener('mousemove',moveDrag);document.addEventListener('touchend',endDrag);document.addEventListener('mouseup',endDrag);

/* ===== ANIMACAO DE COMER ===== */
function feedPou(fi){var f=foods[fi];if(S.coins<f.c){toast('Sem moedas!');return}S.coins-=f.c;S.hunger=Math.min(100,S.hunger+f.h);S.fun=Math.min(100,S.fun+f.f);S.feedC++;squish=1;aState='eating';aTimer=30;mouthOpen=1;gainXP(5);showSp(f.e+' Delicia!');toast(f.e+' '+f.n+'!');var r=cvs.getBoundingClientRect();particle(PX+r.left,PY+r.top-PS*.25,f.e);cvs.classList.add('chomping');setTimeout(function(){cvs.classList.remove('chomping')},400);updateUI();save()}

function bathPou(bi){var b=bathItems[bi];S.clean=Math.min(100,S.clean+b.clean);S.bathC++;squish=1;aState='eating';aTimer=20;mouthOpen=.6;gainXP(5);showSp(b.e+' Limpo!');toast(b.e+' '+b.n+'!');var r=cvs.getBoundingClientRect();particle(PX+r.left,PY+r.top-PS*.25,'✨');updateUI();save()}

/* ===== MINIGAMES ===== */
var gc=document.getElementById('gc'),gx=gc.getContext('2d');var gRun=false,gLoop=null,gCur=null,gSc=0;
function launchGame(n){document.getElementById('gov').classList.add('on');gSc=0;gRun=true;gCur=n;document.getElementById('gsc').textContent='0';if(gLoop)cancelAnimationFrame(gLoop);S.energy=Math.max(0,S.energy-3);S.fun=Math.min(100,S.fun+3);updateUI();save();var fn={fooddrop:G_fooddrop,skyjump:G_skyjump,jetpou:G_jetpou,cliffjump:G_cliffjump,colortap:G_colortap,hilldrive:G_hilldrive,skyhop:G_skyhop,waterhop:G_waterhop,goal:G_goal,pool:G_pool,beachvolley:G_beachvolley,matchtap:G_matchtap,poupopper:G_poupopper,freefall:G_freefall,cloudpass:G_cloudpass,findpou:G_findpou,memory:G_memory,tictacpou:G_tictacpou,fourpous:G_fourpous,goldrush:G_goldrush,herorun:G_herorun,timerush:G_timerush};if(fn[n])fn[n]()}
function endGame(){gRun=false;if(gLoop)cancelAnimationFrame(gLoop);document.getElementById('gov').classList.remove('on');gc.onclick=gc.ontouchstart=gc.ontouchmove=gc.ontouchend=gc.onmousemove=null;if(gSc>0){var c=Math.floor(gSc/8)+1;earn(c);gainXP(gSc+3);S.gameW++;if(!S.hi[gCur]||gSc>S.hi[gCur])S.hi[gCur]=gSc;toast('Fim! '+gSc+' pts +'+c+' moedas');updateUI();save()}}
function restartGame(){if(gCur)launchGame(gCur)}

/* HELPERS DE JOGO */
function drawMiniPou(x,y,sz){gx.save();gx.translate(x,y);gx.fillStyle='#1a3a6a';gx.beginPath();gx.ellipse(0,0,sz*.4,sz*.55,0,0,Math.PI*2);gx.fill();gx.fillStyle='#E8EDF2';gx.beginPath();gx.ellipse(0,sz*.1,sz*.22,sz*.35,0,0,Math.PI*2);gx.fill();gx.restore()}

/* FOOD DROP */
function G_fooddrop(){var W=320,H=440,px=W/2,items=[],t=0;var good=['🍎','🍌','🍓','🍇','🍕','🍔','🐟'];var bad=['💣','🪨'];gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();px=e.touches[0].clientX-r.left};gc.ontouchstart=gc.ontouchmove;gc.onmousemove=function(e){var r=gc.getBoundingClientRect();px=e.clientX-r.left};function f(){if(!gRun){gc.ontouchmove=gc.ontouchstart=gc.onmousemove=null;return}t++;if(t%28===0){var b=Math.random()<.2;items.push({x:15+Math.random()*(W-30),y:-20,e:b?bad[0|Math.random()*2]:good[0|Math.random()*7],bad:b,sp:1+Math.random()*.6})}gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);drawMiniPou(px,H-25,40);var ni=[];for(var i=0;i<items.length;i++){var it=items[i];it.y+=2.5*it.sp;gx.font='22px serif';gx.textAlign='center';gx.fillText(it.e,it.x,it.y);if(it.y>H-48&&Math.abs(it.x-px)<26){if(it.bad)gSc=Math.max(0,gSc-12);else{gSc+=10;earn(1)}document.getElementById('gsc').textContent=gSc}else if(it.y<H+20)ni.push(it)}items=ni;gx.fillStyle='#4ECDC4';gx.font='bold 12px Nunito';gx.textAlign='left';gx.fillText('Pontos: '+gSc,10,20);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* SKY JUMP */
function G_skyjump(){var W=320,H=440,py=300,pvy=0,px=W/2,pvx=0,plats=[];for(var i=0;i<7;i++)plats.push({x:Math.random()*(W-50),y:55+i*50,w:50});var camY=0,keys={},tx=null;function kd(e){keys[e.key]=true;if(e.key===' ')e.preventDefault()}function ku(e){keys[e.key]=false}document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);gc.ontouchstart=function(e){e.preventDefault();tx=e.touches[0].clientX};gc.ontouchmove=function(e){e.preventDefault();if(tx!==null){pvx+=(e.touches[0].clientX-tx)*.13;tx=e.touches[0].clientX}};gc.ontouchend=function(){tx=null};function f(){if(!gRun){document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);gc.ontouchstart=gc.ontouchmove=gc.ontouchend=null;return}if(keys.ArrowLeft||keys.a)pvx-=.8;if(keys.ArrowRight||keys.d)pvx+=.8;pvx*=.87;pvy+=.35;py+=pvy;px+=pvx;if(px<12)px=12;if(px>W-12)px=W-12;gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);for(var i=0;i<plats.length;i++){var p=plats[i],ry=p.y-camY;gx.fillStyle='#4ECDC4';gx.beginPath();gx.roundRect(p.x,ry,p.w,9,4);gx.fill();if(pvy>0&&py-camY+12>ry&&py-camY+12<ry+14&&px>p.x-3&&px<p.x+p.w+3)pvy=-10}if(py-camY<H/2){camY-=3;for(var i=0;i<plats.length;i++){if(plats[i].y-camY>H){plats[i].y=camY-10;plats[i].x=Math.random()*(W-50)}}gSc+=2;document.getElementById('gsc').textContent=gSc}drawMiniPou(px,py-camY,28);if(py-camY>H+30){toast('Caiu!');endGame();return}gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* JET POU */
function G_jetpou(){var W=320,H=440,py=H/2,px=60,obs=[],t=0;gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();py=e.touches[0].clientY-r.top;px=Math.min(W-15,Math.max(15,e.touches[0].clientX-r.left))};gc.ontouchstart=gc.ontouchmove;gc.onmousemove=function(e){var r=gc.getBoundingClientRect();py=e.clientY-r.top;px=Math.min(W-15,Math.max(15,e.clientX-r.left))};function f(){if(!gRun){gc.ontouchmove=gc.ontouchstart=gc.onmousemove=null;return}t++;if(t%35===0)obs.push({x:W,y:20+Math.random()*(H-40),w:16+Math.random()*14,h:28+Math.random()*28});gx.fillStyle='#0a0e1a';gx.fillRect(0,0,W,H);for(var i=0;i<obs.length;i++){var o=obs[i];o.x-=3.5;gx.fillStyle='#EF5350';gx.fillRect(o.x,o.y-o.h/2,o.w,o.h);if(Math.abs(px-o.x)<o.w/2+10&&Math.abs(py-o.y)<o.h/2+10){toast('Bateu!');endGame();return}}obs=obs.filter(function(o){return o.x>-30});gx.save();gx.translate(px,py);drawMiniPou(0,0,28);gx.fillStyle='#FF6B35';gx.beginPath();gx.moveTo(-8,8);gx.lineTo(-16,12+Math.sin(t*.3)*4);gx.lineTo(-8,14);gx.closePath();gx.fill();gx.restore();gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* CLIFF JUMP */
function G_cliffjump(){var W=320,H=440,px=W/2,py=H-80,pvy=0,cliffs=[],t=0,grounded=true;for(var i=0;i<6;i++)cliffs.push({x:40+Math.random()*(W-80),y:340-i*65,w:55+Math.random()*35});function jump(){if(grounded){pvy=-11;grounded=false}}gc.ontouchstart=function(e){e.preventDefault();jump()};gc.onclick=jump;function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;pvy+=.45;py+=pvy;gx.fillStyle='#1a3a2e';gx.fillRect(0,0,W,H);for(var i=0;i<cliffs.length;i++){var c=cliffs[i];gx.fillStyle='#4a5268';gx.fillRect(c.x-c.w/2,c.y,c.w,18);gx.fillStyle='#5a6278';gx.fillRect(c.x-c.w/2,c.y,c.w,5);if(!grounded&&pvy>0&&py>=c.y-5&&py<=c.y+10&&Math.abs(px-c.x)<c.w/2){pvy=0;grounded=true;py=c.y;gSc+=15;document.getElementById('gsc').textContent=gSc}}if(py>H+20){toast('Caiu!');endGame();return}drawMiniPou(px,py,28);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* COLOR TAP */
function G_colortap(){var W=320,H=440,cols=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A'],target=0,blocks=[];for(var i=0;i<12;i++)blocks.push({x:18+(i%4)*76,y:55+Math.floor(i/4)*115,w:68,h:100,c:0|Math.random()*5});target=0|Math.random()*5;var timeLeft=15,t=0;gc.onclick=function(e){var r=gc.getBoundingClientRect();var mx=e.clientX-r.left,my=e.clientY-r.top;for(var i=0;i<blocks.length;i++){var b=blocks[i];if(mx>b.x&&mx<b.x+b.w&&my>b.y&&my<b.y+b.h){if(b.c===target){gSc+=10;blocks[i].c=0|Math.random()*5;target=0|Math.random()*5}else gSc=Math.max(0,gSc-5);document.getElementById('gsc').textContent=gSc;break}}};function f(){if(!gRun){gc.onclick=null;return}t++;if(t%60===0){timeLeft--;if(timeLeft<=0){toast('Tempo!');endGame();return}}gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);gx.fillStyle=cols[target];gx.beginPath();gx.roundRect(W/2-40,8,80,22,10);gx.fill();gx.fillStyle='#fff';gx.font='bold 12px Nunito';gx.textAlign='center';gx.fillText('Tempo: '+timeLeft+'s',W/2,50);for(var i=0;i<blocks.length;i++){var b=blocks[i];gx.fillStyle=cols[b.c];gx.beginPath();gx.roundRect(b.x,b.y,b.w,b.h,10);gx.fill()}gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* HILL DRIVE */
function G_hilldrive(){var W=320,H=440,carX=W/2,carY=300,vel=0,terrain=[],t=0,coins=[];for(var i=0;i<W;i+=3)terrain.push(H-80+Math.sin(i*.03)*40+Math.sin(i*.07)*20);gc.ontouchstart=function(e){e.preventDefault();vel=-8};gc.ontouchend=function(){vel=0};gc.onmousedown=function(){vel=-8};gc.onmouseup=function(){vel=0};function f(){if(!gRun){gc.ontouchstart=gc.ontouchend=gc.onmousedown=gc.onmouseup=null;return}t++;if(t%45===0)coins.push({x:W+10,y:terrain[(W+t*2)%terrain.length]-25});vel+=.35;carY+=vel;var ti=Math.floor((carX+t*2)/3)%terrain.length;if(ti<0)ti+=terrain.length;var ty=terrain[Math.abs(ti)];if(carY>ty-5){carY=ty-5;vel=0}gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);gx.beginPath();gx.moveTo(0,H);for(var i=0;i<=W;i+=3){var idx=Math.floor((i+t*2)/3)%terrain.length;if(idx<0)idx+=terrain.length;gx.lineTo(i,terrain[Math.abs(idx)])}gx.lineTo(W,H);gx.closePath();gx.fillStyle='#1a3a2e';gx.fill();for(var i=coins.length-1;i>=0;i--){var c=coins[i];c.x-=2;gx.font='14px serif';gx.textAlign='center';gx.fillText('🪙',c.x,c.y);if(Math.abs(c.x-carX)<18&&Math.abs(c.y-carY)<18){gSc+=5;earn(1);coins.splice(i,1);document.getElementById('gsc').textContent=gSc}else if(c.x<-20)coins.splice(i,1)}gx.fillStyle='#EF5350';gx.beginPath();gx.roundRect(carX-10,carY-18,20,18,4);gx.fill();gx.fillStyle='#FFB347';gx.fillRect(carX-7,carY-25,14,9);gSc++;if(t%10===0)document.getElementById('gsc').textContent=gSc;gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* SKY HOP */
function G_skyhop(){var W=320,H=440,py=H-60,px=W/2,clouds=[],t=0;for(var i=0;i<5;i++)clouds.push({x:Math.random()*W,y:H-75-i*80,w:45+Math.random()*25,dir:Math.random()>.5?1:-1,sp:.4+Math.random()});gc.ontouchstart=function(e){e.preventDefault();py-=60};gc.onclick=function(){py-=60};function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;py+=2.5;for(var i=0;i<clouds.length;i++){var c=clouds[i];c.x+=c.dir*c.sp;if(c.x<0||c.x+c.w>W)c.dir*=-1;if(py>=c.y-10&&py<=c.y+6&&px>c.x&&px<c.x+c.w){py=c.y-10;gSc+=5;document.getElementById('gsc').textContent=gSc}}if(py>H+20){toast('Caiu!');endGame();return}gx.fillStyle='#1a1a2e';gx.fillRect(0,0,W,H);for(var i=0;i<clouds.length;i++){var c=clouds[i];gx.fillStyle='rgba(255,255,255,.12)';gx.beginPath();gx.ellipse(c.x+c.w/2,c.y,c.w/2,11,0,0,Math.PI*2);gx.fill()}drawMiniPou(px,py,26);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* WATER HOP */
function G_waterhop(){var W=320,H=440,py=H-60,px=W/2,logs=[],t=0;for(var i=0;i<5;i++)logs.push({x:Math.random()*W,y:H-65-i*75,w:42+Math.random()*22,sp:(.4+Math.random())*(Math.random()>.5?1:-1)});gc.ontouchstart=function(e){e.preventDefault();py-=58};gc.onclick=function(){py-=58};function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;py+=2;px+=.3;for(var i=0;i<logs.length;i++){var l=logs[i];l.x+=l.sp;if(l.x<0)l.x=W;if(l.x+l.w>W)l.x=-l.w;if(py>=l.y-8&&py<=l.y+6&&px>l.x&&px<l.x+l.w){py=l.y-8;gSc+=5;document.getElementById('gsc').textContent=gSc}}if(py>H+20){toast('Afundou!');endGame();return}gx.fillStyle='#0a2e4a';gx.fillRect(0,0,W,H);for(var i=0;i<logs.length;i++){var l=logs[i];gx.fillStyle='#6D4C41';gx.beginPath();gx.roundRect(l.x,l.y,l.w,12,6);gx.fill()}drawMiniPou(px,py,26);gx.fillStyle='#42A5F5';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* GOAL */
function G_goal(){var W=320,H=440,bx=W/2,by=H-60,bvx=0,bvy=0,kicked=false;gc.ontouchstart=function(e){e.preventDefault();if(!kicked){kicked=true;bvy=-12;bvx=3+Math.random()*3}};gc.onclick=function(){if(!kicked){kicked=true;bvy=-12;bvx=3+Math.random()*3}};function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}if(kicked){bvy+=.3;bx+=bvx;by+=bvy;if(bx>W-40&&bx<W+10&&by>40&&by<120){gSc+=25;earn(2);toast('GOL!');document.getElementById('gsc').textContent=gSc;kicked=false;bx=W/2;by=H-60}if(by>H+20){kicked=false;bx=W/2;by=H-60}}gx.fillStyle='#1a3a2e';gx.fillRect(0,0,W,H);gx.strokeStyle='#fff';gx.lineWidth=3;gx.strokeRect(W-40,40,40,80);gx.font='28px serif';gx.textAlign='center';gx.fillText('⚽',bx,by);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.fillText('TOQUE para chutar!',W/2,20);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* POOL */
function G_pool(){var W=320,H=440,balls=[],aimX=W/2,aimY=H/2,shooting=false;var bcols=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A','#FF6B9D','#42A5F5','#FFE66D'];for(var i=0;i<8;i++)balls.push({x:90+Math.random()*140,y:80+Math.random()*120,vx:0,vy:0,r:9,c:bcols[i],out:false});var pockets=[[18,18],[W-18,18],[18,H-18],[W-18,H-18],[W/2,8],[W/2,H-8]];gc.onmousemove=function(e){var r=gc.getBoundingClientRect();aimX=e.clientX-r.left;aimY=e.clientY-r.top};gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();aimX=e.touches[0].clientX-r.left;aimY=e.touches[0].clientY-r.top};gc.onclick=function(){if(shooting)return;shooting=true;var dx=aimX-W/2,dy=aimY-H/2,d=Math.sqrt(dx*dx+dy*dy)||1;for(var i=0;i<balls.length;i++){if(!balls[i].out){var bx2=balls[i].x-W/2,by2=balls[i].y-H/2,bd=Math.sqrt(bx2*bx2+by2*by2)||1;balls[i].vx=dx/d*5*(1/(bd/45+1));balls[i].vy=dy/d*5*(1/(bd/45+1))}}setTimeout(function(){shooting=false},400)};function f(){if(!gRun){gc.onclick=gc.onmousemove=gc.ontouchmove=null;return}gx.fillStyle='#0a3a1a';gx.fillRect(0,0,W,H);for(var p=0;p<pockets.length;p++){gx.beginPath();gx.arc(pockets[p][0],pockets[p][1],11,0,Math.PI*2);gx.fillStyle='#000';gx.fill()}for(var i=0;i<balls.length;i++){var b=balls[i];if(b.out)continue;b.x+=b.vx;b.y+=b.vy;b.vx*=.96;b.vy*=.96;if(b.x<b.r+8||b.x>W-b.r-8)b.vx*=-.8;if(b.y<b.r+8||b.y>H-b.r-8)b.vy*=-.8;for(var p=0;p<pockets.length;p++){if(Math.abs(b.x-pockets[p][0])<13&&Math.abs(b.y-pockets[p][1])<13){b.out=true;gSc+=15;earn(1);document.getElementById('gsc').textContent=gSc;break}}for(var j=i+1;j<balls.length;j++){var b2=balls[j];if(b2.out)continue;var dx=b.x-b2.x,dy=b.y-b2.y,d=Math.sqrt(dx*dx+dy*dy);if(d<b.r+b2.r&&d>0){var nx=dx/d,ny=dy/d;b.vx+=nx*1.2;b.vy+=ny*1.2;b2.vx-=nx*1.2;b2.vy-=ny*1.2}}}for(var i=0;i<balls.length;i++){var b=balls[i];if(!b.out){gx.beginPath();gx.arc(b.x,b.y,b.r,0,Math.PI*2);gx.fillStyle=b.c;gx.fill()}}if(!shooting){gx.strokeStyle='rgba(255,255,255,.25)';gx.lineWidth=1;gx.setLineDash([3,3]);gx.beginPath();gx.moveTo(W/2,H/2);gx.lineTo(aimX,aimY);gx.stroke();gx.setLineDash([])}var done=true;for(var i=0;i<balls.length;i++)if(!balls[i].out)done=false;if(done){toast('Todas na caçapa!');endGame();return}gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* BEACH VOLLEY */
function G_beachvolley(){var W=320,H=440,myX=W/4,myY=H-50,ballX=W/2,ballY=H/2,bvx=2,bvy=-3,oppX=W*3/4,t=0;gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();myX=Math.max(12,Math.min(W/2-12,e.touches[0].clientX-r.left))};gc.onmousemove=function(e){var r=gc.getBoundingClientRect();myX=Math.max(12,Math.min(W/2-12,e.clientX-r.left))};function f(){if(!gRun){gc.ontouchmove=gc.onmousemove=null;return}t++;ballX+=bvx;ballY+=bvy;bvy+=.14;oppX+=(ballX-oppX)*.04;if(ballY>H-55&&ballX>W/2){bvy=-5.5-Math.random()*2;bvx=(myX-ballX)*.04+Math.random()*2-1}if(ballY>H-55&&Math.abs(ballX-myX)<22){bvy=-5.5-Math.random()*2;bvx=(ballX-W/2)*.03+Math.random()*2-1;gSc+=5;document.getElementById('gsc').textContent=gSc}if(ballX<8||ballX>W-8)bvx*=-1;if(ballY<8)bvy=Math.abs(bvy);if(ballY>H+10){toast('Caiu!');endGame();return}gx.fillStyle='#1a3a1a';gx.fillRect(0,0,W,H);gx.fillRect(0,H-25,W,25);gx.strokeStyle='rgba(255,255,255,.25)';gx.lineWidth=2;gx.beginPath();gx.moveTo(W/2,0);gx.lineTo(W/2,H-25);gx.stroke();gx.font='20px serif';gx.textAlign='center';gx.fillText('🏐',ballX,ballY);drawMiniPou(myX,myY-10,24);gx.save();gx.translate(oppX,myY-10);gx.fillStyle='#EF5350';gx.beginPath();gx.ellipse(0,0,10,14,0,0,Math.PI*2);gx.fill();gx.fillStyle='#E8EDF2';gx.beginPath();gx.ellipse(0,2,6,8,0,0,Math.PI*2);gx.fill();gx.restore();gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* MATCH TAP */
function G_matchtap(){var W=320,H=440,cols=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A'],grid=[],SZ=38,ROWS=10,COLS=8;for(var r=0;r<ROWS;r++){grid[r]=[];for(var c=0;c<COLS;c++)grid[r][c]=0|Math.random()*5}var ox=(W-COLS*SZ)/2,oy=45;gc.onclick=function(e){var r=gc.getBoundingClientRect();var mx=e.clientX-r.left-ox,my=e.clientY-r.top-oy;var c2=0|mx/SZ,r2=0|my/SZ;if(r2>=0&&r2<ROWS&&c2>=0&&c2<COLS){var col=grid[r2][c2],matched=[[r2,c2]],q=[[r2,c2]];while(q.length){var cur=q.shift(),nb=[[cur[0]-1,cur[1]],[cur[0]+1,cur[1]],[cur[0],cur[1]-1],[cur[0],cur[1]+1]];for(var n=0;n<4;n++){var nr=nb[n][0],nc=nb[n][1];if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&grid[nr][nc]===col){var found=false;for(var m=0;m<matched.length;m++)if(matched[m][0]===nr&&matched[m][1]===nc)found=true;if(!found){matched.push([nr,nc]);q.push([nr,nc])}}}}if(matched.length>=3){gSc+=matched.length*2;document.getElementById('gsc').textContent=gSc;for(var m=0;m<matched.length;m++)grid[matched[m][0]][matched[m][1]]=-1;for(var c3=0;c3<COLS;c3++){var empty=[];for(var r3=ROWS-1;r3>=0;r3--)if(grid[r3][c3]===-1)empty.push(r3);else if(empty.length){grid[empty[0]][c3]=grid[r3][c3];grid[r3][c3]=-1;empty.push(r3);empty.shift()}}}}};function f(){if(!gRun){gc.onclick=null;return}gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){if(grid[r][c]>=0){gx.fillStyle=cols[grid[r][c]];gx.beginPath();gx.roundRect(ox+c*SZ+1,oy+r*SZ+1,SZ-2,SZ-2,5);gx.fill()}}gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* POU POPPER */
function G_poupopper(){var W=320,H=440,grid=[],SZ=30,ROWS=13,COLS=10,aimCol=5;var cols=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A'];for(var r=0;r<ROWS;r++){grid[r]=[];for(var c=0;c<COLS;c++)grid[r][c]=r<5?0|Math.random()*5:-1}var ox=(W-COLS*SZ)/2,oy=8;gc.onclick=function(e){var r=gc.getBoundingClientRect();var my=e.clientY-r.top-oy;for(var r2=ROWS-1;r2>=0;r2--)if(grid[r2][aimCol]>=0){grid[r2][aimCol]=-1;break}for(var r3=0;r3<ROWS-1;r3++)for(var c2=0;c2<COLS;c2++){if(grid[r3][c2]>=0){var nb=[[r3+1,c2-1],[r3+1,c2],[r3+1,c2+1]];for(var n=0;n<3;n++){var nr=nb[n][0],nc=nb[n][1];if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&grid[nr][nc]===grid[r3][c2]){grid[r3][c2]=-1;grid[nr][nc]=-1;gSc+=5;document.getElementById('gsc').textContent=gSc}}}}};gc.onmousemove=function(e){var r=gc.getBoundingClientRect();aimCol=Math.max(0,Math.min(COLS-1,0|((e.clientX-r.left-ox)/SZ)))};gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();aimCol=Math.max(0,Math.min(COLS-1,0|((e.touches[0].clientX-r.left-ox)/SZ)))};function f(){if(!gRun){gc.onclick=gc.onmousemove=gc.ontouchmove=null;return}gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){if(grid[r][c]>=0){gx.fillStyle=cols[grid[r][c]];gx.beginPath();gx.arc(ox+c*SZ+SZ/2,oy+r*SZ+SZ/2,SZ/2-2,0,Math.PI*2);gx.fill()}}gx.strokeStyle='rgba(255,255,255,.2)';gx.lineWidth=1;gx.setLineDash([3,3]);gx.beginPath();gx.moveTo(ox+aimCol*SZ+SZ/2,oy);gx.lineTo(ox+aimCol*SZ+SZ/2,H);gx.stroke();gx.setLineDash([]);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* FREE FALL */
function G_freefall(){var W=320,H=440,px=W/2,py=30,clouds=[],t=0;for(var i=0;i<18;i++)clouds.push({x:Math.random()*W,y:50+i*22,w:28+Math.random()*38,h:12+Math.random()*10,gray:Math.random()<.3});gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();px=Math.max(12,Math.min(W-12,e.touches[0].clientX-r.left))};gc.onmousemove=function(e){var r=gc.getBoundingClientRect();px=Math.max(12,Math.min(W-12,e.clientX-r.left))};function f(){if(!gRun){gc.ontouchmove=gc.onmousemove=null;return}t++;py+=2.5;for(var i=0;i<clouds.length;i++){var c=clouds[i];c.y-=2.5;if(c.y<-25)c.y=H+25;if(c.gray&&Math.abs(px-c.x-c.w/2)<c.w/2+10&&Math.abs(py-c.y-c.h/2)<c.h/2+10){toast('Bateu!');endGame();return}}gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gx.fillStyle='#3a7abf';gx.fillRect(0,0,W,H);for(var i=0;i<clouds.length;i++){var c=clouds[i];gx.fillStyle=c.gray?'rgba(120,120,120,.5)':'rgba(255,255,255,.4)';gx.beginPath();gx.ellipse(c.x+c.w/2,c.y+c.h/2,c.w/2,c.h/2,0,0,Math.PI*2);gx.fill()}drawMiniPou(px,py,26);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* CLOUD PASS */
function G_cloudpass(){var W=320,H=440,py=H/2,px=60,clouds=[],t=0;for(var i=0;i<14;i++)clouds.push({x:W+Math.random()*200,y:Math.random()*(H-35)+18,w:35+Math.random()*45,h:18+Math.random()*12});gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();py=Math.max(12,Math.min(H-12,e.touches[0].clientY-r.top))};gc.onmousemove=function(e){var r=gc.getBoundingClientRect();py=Math.max(12,Math.min(H-12,e.clientY-r.top))};function f(){if(!gRun){gc.ontouchmove=gc.onmousemove=null;return}t++;for(var i=0;i<clouds.length;i++){var c=clouds[i];c.x-=2.8-t*.004;if(c.x<-55)c.x=W+40+Math.random()*100;if(Math.abs(px-c.x-c.w/2)<c.w/2+10&&Math.abs(py-c.y-c.h/2)<c.h/2+10){toast('Bateu!');endGame();return}}gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gx.fillStyle='#5a9fd4';gx.fillRect(0,0,W,H);for(var i=0;i<clouds.length;i++){var c=clouds[i];gx.fillStyle='rgba(255,255,255,.5)';gx.beginPath();gx.ellipse(c.x+c.w/2,c.y+c.h/2,c.w/2,c.h/2,0,0,Math.PI*2);gx.fill()}drawMiniPou(px,py,26);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* FIND POU */
function G_findpou(){var W=320,H=440,cups=3,pouUnder=0,swapT=0,phase='show',showT=0,revealT=0;var cx=[W/2-55,W/2,W/2+55],cy=H/2;function shuffle(){var a=0|Math.random()*3,b;do{b=0|Math.random()*3}while(b===a);var tmp=cx[a];cx[a]=cx[b];cx[b]=tmp}gc.onclick=function(e){if(phase!=='guess')return;var r=gc.getBoundingClientRect();var mx=e.clientX-r.left;for(var i=0;i<3;i++){if(Math.abs(mx-cx[i])<28){if(i===pouUnder){gSc+=20;document.getElementById('gsc').textContent=gSc;toast('Acertou!');phase='show';showT=50;pouUnder=0|Math.random()*3}else{gSc=Math.max(0,gSc-5);document.getElementById('gsc').textContent=gSc}break}}};function f(){if(!gRun){gc.onclick=null;return}if(phase==='show'){showT++;if(showT>70){phase='hide';revealT=0}}else if(phase==='hide'){revealT++;if(revealT>25){phase='swap';swapT=0}}else if(phase==='swap'){swapT++;if(swapT%18===0)shuffle();if(swapT>100)phase='guess'}gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);if(phase==='show'||phase==='guess'){gx.font='26px serif';gx.textAlign='center';gx.fillText('🐧',cx[pouUnder],cy+8)}for(var i=0;i<3;i++){if(phase!=='show'){gx.fillStyle='rgba(78,205,196,.25)';gx.beginPath();gx.moveTo(cx[i],cy-28);gx.lineTo(cx[i]-22,cy+18);gx.lineTo(cx[i]+22,cy+18);gx.closePath();gx.fill();gx.strokeStyle='rgba(78,205,196,.5)';gx.lineWidth=2;gx.stroke()}}gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText(phase==='guess'?'Onde esta?':phase==='show'?'Memorize!':'Observem...',W/2,35);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* MEMORY */
function G_memory(){var W=320,H=440,em=['🐧','🌟','🎈','🍕','🎮','🦄','🌈','🔥'],cards=[],sel=[],lock=false,mv=0;var all=em.concat(em);for(var i=all.length-1;i>0;i--){var j=0|Math.random()*(i+1);var tmp=all[i];all[i]=all[j];all[j]=tmp}for(var i=0;i<all.length;i++)cards.push({e:all[i],x:(i%4)*73+16,y:0|Math.floor(i/4)*88+50,fl:false,mt:false});gc.onclick=function(e){if(lock)return;var r=gc.getBoundingClientRect();var mx=e.clientX-r.left,my=e.clientY-r.top;for(var i=0;i<cards.length;i++){var c=cards[i];if(mx>c.x&&mx<c.x+60&&my>c.y&&my<c.y+70&&!c.fl&&!c.mt){c.fl=true;sel.push(c);mv++;if(sel.length===2){lock=true;if(sel[0].e===sel[1].e){sel[0].mt=true;sel[1].mt=true;sel=[];lock=false;gSc+=20;earn(1);document.getElementById('gsc').textContent=gSc;var done=true;for(var j=0;j<cards.length;j++)if(!cards[j].mt){done=false;break}if(done){toast('Parabens!');setTimeout(endGame,500)}}else{(function(s){setTimeout(function(){s[0].fl=false;s[1].fl=false;sel=[];lock=false},700)})(sel)}}break}}};function f(){if(!gRun){gc.onclick=null;return}gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);gx.fillStyle='#8B949E';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Mov: '+mv+'  Pts: '+gSc,W/2,28);for(var i=0;i<cards.length;i++){var c=cards[i];if(c.mt){gx.fillStyle='rgba(76,175,80,.12)';gx.beginPath();gx.roundRect(c.x,c.y,60,70,7);gx.fill();gx.font='24px serif';gx.textAlign='center';gx.fillText(c.e,c.x+30,c.y+44)}else if(c.fl){gx.fillStyle='rgba(78,205,196,.12)';gx.beginPath();gx.roundRect(c.x,c.y,60,70,7);gx.fill();gx.font='24px serif';gx.textAlign='center';gx.fillText(c.e,c.x+30,c.y+44)}else{gx.fillStyle='rgba(255,255,255,.04)';gx.beginPath();gx.roundRect(c.x,c.y,60,70,7);gx.fill();gx.strokeStyle='rgba(78,205,196,.25)';gx.lineWidth=1.5;gx.stroke();gx.font='18px serif';gx.textAlign='center';gx.fillText('?',c.x+30,c.y+42)}}gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* TIC TAC POU */
function G_tictacpou(){var W=320,H=440,board=[0,0,0,0,0,0,0,0,0],turn=1,over=false,SZ=82,ox=(W-SZ*3)/2,oy=70;function check(){var w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(var i=0;i<8;i++)if(board[w[i][0]]&&board[w[i][0]]===board[w[i][1]]&&board[w[i][1]]===board[w[i][2]])return board[w[i][0]];return 0}function aiMove(){var empty=[];for(var i=0;i<9;i++)if(!board[i])empty.push(i);if(!empty.length)return;for(var i=0;i<empty.length;i++){board[empty[i]]=2;if(check()===2){board[empty[i]]=0;return empty[i]}board[empty[i]]=0}for(var i=0;i<empty.length;i++){board[empty[i]]=1;if(check()===1){board[empty[i]]=0;return empty[i]}board[empty[i]]=0}if(!board[4])return 4;return empty[0|Math.random()*empty.length]}gc.onclick=function(e){if(over||turn!==1)return;var r=gc.getBoundingClientRect();var mx=e.clientX-r.left-ox,my=e.clientY-r.top-oy;var c=0|mx/SZ,r2=0|my/SZ;if(c>=0&&c<3&&r2>=0&&r2<3&&!board[r2*3+c]){board[r2*3+c]=1;if(check()){gSc+=20;document.getElementById('gsc').textContent=gSc;toast('Venceu!');over=true}else{var full=true;for(var i=0;i<9;i++)if(!board[i])full=false;if(full){toast('Empate!');over=true}else{turn=2;setTimeout(function(){var m=aiMove();if(m!==undefined){board[m]=2;if(check()){toast('CPU venceu!');over=true}else turn=1}},350)}}}};function f(){if(!gRun){gc.onclick=null;return}gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);gx.fillStyle='#4ECDC4';gx.font='bold 13px Nunito';gx.textAlign='center';gx.fillText(over?'Fim!':(turn===1?'Sua vez (X)':'CPU...'),W/2,35);for(var r=0;r<3;r++)for(var c=0;c<3;c++){var v=board[r*3+c];gx.fillStyle='rgba(255,255,255,.04)';gx.beginPath();gx.roundRect(ox+c*SZ+2,oy+r*SZ+2,SZ-4,SZ-4,7);gx.fill();gx.strokeStyle='rgba(255,255,255,.08)';gx.lineWidth=1;gx.stroke();if(v===1){gx.strokeStyle='#4ECDC4';gx.lineWidth=3;gx.beginPath();gx.moveTo(ox+c*SZ+18,oy+r*SZ+18);gx.lineTo(ox+c*SZ+SZ-18,oy+r*SZ+SZ-18);gx.moveTo(ox+c*SZ+SZ-18,oy+r*SZ+18);gx.lineTo(ox+c*SZ+18,oy+r*SZ+SZ-18);gx.stroke()}else if(v===2){gx.strokeStyle='#FF6B9D';gx.lineWidth=3;gx.beginPath();gx.arc(ox+c*SZ+SZ/2,oy+r*SZ+SZ/2,SZ/2-18,0,Math.PI*2);gx.stroke()}}gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* FOUR POUS */
function G_fourpous(){var W=320,H=440,grid=[],COLS=7,ROWS=6,SZ=38,ox=(W-COLS*SZ)/2,oy=55,turn=1,over=false;for(var r=0;r<ROWS;r++){grid[r]=[];for(var c=0;c<COLS;c++)grid[r][c]=0}function drop(col,p){for(var r=ROWS-1;r>=0;r--)if(!grid[r][col]){grid[r][col]=p;return r}return-1}function check4(){for(var r=0;r<ROWS;r++)for(var c=0;c<COLS-3;c++)if(grid[r][c]&&grid[r][c]===grid[r][c+1]&&grid[r][c+1]===grid[r][c+2]&&grid[r][c+2]===grid[r][c+3])return grid[r][c];for(var r=0;r<ROWS-3;r++)for(var c=0;c<COLS;c++)if(grid[r][c]&&grid[r][c]===grid[r+1][c]&&grid[r+1][c]===grid[r+2][c]&&grid[r+2][c]===grid[r+3][c])return grid[r][c];for(var r=0;r<ROWS-3;r++)for(var c=0;c<COLS-3;c++)if(grid[r][c]&&grid[r][c]===grid[r+1][c+1]&&grid[r+1][c+1]===grid[r+2][c+2]&&grid[r+2][c+2]===grid[r+3][c+3])return grid[r][c];for(var r=3;r<ROWS;r++)for(var c=0;c<COLS-3;c++)if(grid[r][c]&&grid[r][c]===grid[r-1][c+1]&&grid[r-1][c+1]===grid[r-2][c+2]&&grid[r-2][c+2]===grid[r-3][c+3])return grid[r][c];return 0}gc.onclick=function(e){if(over||turn!==1)return;var r=gc.getBoundingClientRect();var c=0|((e.clientX-r.left-ox)/SZ);if(c>=0&&c<COLS&&drop(c,1)>=0){if(check4()){gSc+=25;document.getElementById('gsc').textContent=gSc;toast('Venceu!');over=true}else{turn=2;setTimeout(function(){var ac=0|Math.random()*COLS;drop(ac,2);if(check4()){toast('CPU venceu!');over=true}else turn=1},350)}}};function f(){if(!gRun){gc.onclick=null;return}gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText(over?'Fim!':(turn===1?'Sua vez':'CPU...'),W/2,25);for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){var v=grid[r][c];gx.fillStyle='rgba(255,255,255,.03)';gx.beginPath();gx.roundRect(ox+c*SZ+1,oy+r*SZ+1,SZ-2,SZ-2,5);gx.fill();if(v){gx.fillStyle=v===1?'#4ECDC4':'#FF6B9D';gx.beginPath();gx.arc(ox+c*SZ+SZ/2,oy+r*SZ+SZ/2,SZ/2-4,0,Math.PI*2);gx.fill()}}gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* ===== 3 RUNNERS ===== */
function G_goldrush(){var W=320,H=440,px=W/2,lane=1,lanes=[H*.3,H*.5,H*.7],obs=[],coins=[],t=0,speed=3;gc.ontouchstart=function(e){e.preventDefault();var r=gc.getBoundingClientRect();var my=e.clientY-r.top;if(my<H/3&&lane>0)lane--;else if(my>H*2/3&&lane<2)lane++;else{var mx=e.clientX-r.left;if(mx<W/2&&lane>0)lane--;else if(mx>=W/2&&lane<2)lane++}px=W/2;for(var i=obs.length-1;i>=0;i--)if(Math.abs(obs[i].y-lanes[lane])<25&&obs[i].x>W-60){toast('Bateu!');endGame();return}};function f(){if(!gRun){gc.ontouchstart=null;return}t++;speed=3+t*.003;var ty=lanes[lane];px+=(W/2-px)*.15;if(t%25===0)obs.push({x:W+20,y:lanes[0|Math.random()*3],w:30+Math.random()*20,h:30});if(t%18===0)coins.push({x:W+20,y:lanes[0|Math.random()*3]});gx.fillStyle='#2a1a0a';gx.fillRect(0,0,W,H);for(var i=0;i<3;i++){gx.strokeStyle='rgba(255,200,50,.15)';gx.lineWidth=1;gx.beginPath();gx.moveTo(0,lanes[i]);gx.lineTo(W,lanes[i]);gx.stroke()}for(var i=obs.length-1;i>=0;i--){obs[i].x-=speed;gx.fillStyle='#8B4513';gx.fillRect(obs[i].x-obs[i].w/2,obs[i].y-obs[i].h/2,obs[i].w,obs[i].h);if(obs[i].x<-40)obs.splice(i,1)}for(var i=coins.length-1;i>=0;i--){coins[i].x-=speed;gx.font='16px serif';gx.textAlign='center';gx.fillText('🪙',coins[i].x,coins[i].y);if(Math.abs(coins[i].x-px)<18&&Math.abs(coins[i].y-ty)<18){gSc+=10;earn(1);document.getElementById('gsc').textContent=gSc;coins.splice(i,1)}else if(coins[i].x<-20)coins.splice(i,1)}drawMiniPou(px,ty,30);gx.fillStyle='#FFD700';gx.font='bold 12px Nunito';gx.textAlign='left';gx.fillText('🪙 '+gSc,10,20);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

function G_herorun(){var W=320,H=440,px=W/2,lane=1,lanes=[H*.3,H*.5,H*.7],obs=[],t=0,speed=3,boost=0;gc.ontouchstart=function(e){e.preventDefault();if(boost<=0){boost=30;speed=6}var r=gc.getBoundingClientRect();var my=e.clientY-r.top;if(my<H/3&&lane>0)lane--;else if(my>H*2/3&&lane<2)lane++};function f(){if(!gRun){gc.ontouchstart=null;return}t++;if(boost>0){boost--;speed=6}else speed=3+t*.002;var ty=lanes[lane];px+=(W/2-px)*.15;if(t%22===0)obs.push({x:W+20,y:lanes[0|Math.random()*3],w:25,h:25});gx.fillStyle='#1a0a2e';gx.fillRect(0,0,W,H);for(var i=0;i<3;i++){gx.strokeStyle='rgba(160,80,255,.15)';gx.lineWidth=1;gx.beginPath();gx.moveTo(0,lanes[i]);gx.lineTo(W,lanes[i]);gx.stroke()}for(var i=obs.length-1;i>=0;i--){obs[i].x-=speed;gx.fillStyle='#4a1a6a';gx.fillRect(obs[i].x-obs[i].w/2,obs[i].y-obs[i].h/2,obs[i].w,obs[i].h);if(Math.abs(obs[i].x-px)<obs[i].w/2+10&&Math.abs(obs[i].y-ty)<obs[i].h/2+10){toast('Bateu!');endGame();return}if(obs[i].x<-30)obs.splice(i,1)}drawMiniPou(px,ty,30);if(boost>0){gx.fillStyle='rgba(160,80,255,.3)';gx.beginPath();gx.arc(px,ty,20,0,Math.PI*2);gx.fill()}gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gx.fillStyle='#B388FF';gx.font='bold 11px Nunito';gx.textAlign='left';gx.fillText('TOQUE: boost + trocar pista',10,20);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

function G_timerush(){var W=320,H=440,px=W/2,lane=1,lanes=[H*.3,H*.5,H*.7],obs=[],t=0,speed=3,era=0,eraNames=['Egito','Dinos','Oeste'],eraCols=['rgba(200,170,50,.12)','rgba(50,150,50,.12)','rgba(150,100,50,.12)'];gc.ontouchstart=function(e){e.preventDefault();var r=gc.getBoundingClientRect();var my=e.clientY-r.top;if(my<H/3&&lane>0)lane--;else if(my>H*2/3&&lane<2)lane++};function f(){if(!gRun){gc.ontouchstart=null;return}t++;speed=3+t*.003;if(t%300===0)era=(era+1)%3;var ty=lanes[lane];px+=(W/2-px)*.15;if(t%20===0)obs.push({x:W+20,y:lanes[0|Math.random()*3],w:28,h:28});gx.fillStyle='#0D1117';gx.fillRect(0,0,W,H);gx.fillStyle=eraCols[era];gx.fillRect(0,0,W,H);for(var i=0;i<3;i++){gx.strokeStyle='rgba(255,255,255,.1)';gx.lineWidth=1;gx.beginPath();gx.moveTo(0,lanes[i]);gx.lineTo(W,lanes[i]);gx.stroke()}for(var i=obs.length-1;i>=0;i--){obs[i].x-=speed;gx.fillStyle=era===0?'#C4A035':era===1?'#2E7D32':'#8D6E63';gx.fillRect(obs[i].x-obs[i].w/2,obs[i].y-obs[i].h/2,obs[i].w,obs[i].h);if(Math.abs(obs[i].x-px)<obs[i].w/2+10&&Math.abs(obs[i].y-ty)<obs[i].h/2+10){toast('Bateu!');endGame();return}if(obs[i].x<-30)obs.splice(i,1)}drawMiniPou(px,ty,30);gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gx.fillStyle=era===0?'#FFD54F':era===1?'#66BB6A':'#FFB347';gx.font='bold 12px Nunito';gx.textAlign='left';gx.fillText(eraNames[era]+' | Pts: '+gSc,10,20);gLoop=requestAnimationFrame(f)}gLoop=requestAnimationFrame(f)}

/* ===== GAMES PANEL ===== */
var gameList=[
{s:'Acao e Reflexo',g:[{e:'🍕',n:'Food Drop',k:'fooddrop',t:'Pegue comidas!'},{e:'☁️',n:'Sky Jump',k:'skyjump',t:'Pule nas plataformas'},{e:'🚀',n:'Jet Pou',k:'jetpou',t:'Desvie dos obstaculos'},{e:'⛰️',n:'Cliff Jump',k:'cliffjump',t:'Pule os penhascos'},{e:'🎨',n:'Color Tap',k:'colortap',t:'Toque na cor certa'}]},
{s:'Corrida e Esporte',g:[{e:'🚗',n:'Hill Drive',k:'hilldrive',t:'Dirija nas colinas'},{e:'☁️',n:'Sky Hop',k:'skyhop',t:'Pule nas nuvens'},{e:'🪵',n:'Water Hop',k:'waterhop',t:'Atravesse o rio'},{e:'⚽',n:'Goal',k:'goal',t:'Chute no gol!'},{e:'🎱',n:'Pool',k:'pool',t:'Bilhar com Pou'},{e:'🏐',n:'Beach Volley',k:'beachvolley',t:'Volei de praia'}]},
{s:'Logica e Quebra-cabeca',g:[{e:'🟦',n:'Match Tap',k:'matchtap',t:'Grupos de cores'},{e:'🔮',n:'Pou Popper',k:'poupopper',t:'Estoure bolhas'},{e:'🪂',n:'Free Fall',k:'freefall',t:'Queda livre'},{e:'☁️',n:'Cloud Pass',k:'cloudpass',t:'Desvie das nuvens'},{e:'🔍',n:'Find Pou',k:'findpou',t:'Onde esta o Pou?'},{e:'🧩',n:'Memory',k:'memory',t:'Encontre os pares'}]},
{s:'Estrategia',g:[{e:'❌',n:'Tic Tac Pou',k:'tictacpou',t:'Jogo da velha'},{e:'🔴',n:'Four Pous',k:'fourpous',t:'Conecta 4'}]},
{s:'Corridas Infinitas',g:[{e:'🪙',n:'Gold Rush',k:'goldrush',t:'Corrida do Ouro!'},{e:'⚡',n:'Hero Run',k:'herorun',t:'Corrida Heroica!'},{e:'⏰',n:'Time Rush',k:'timerush',t:'Viajem no tempo!'}]}
];
function buildGames(){var p=document.getElementById('ui-games');var h='';for(var s=0;s<gameList.length;s++){var sec=gameList[s];h+='<div class="gs"><h3>'+sec.s+'</h3><div class="gg">';for(var g=0;g<sec.g.length;g++){var gm=sec.g[g];var hi=S.hi[gm.k]?S.hi[gm.k]:0;h+='<div class="gi" data-gk="'+gm.k+'"><div class="ge">'+gm.e+'</div><div class="gn">'+gm.n+'</div><div class="gt">'+gm.t+(hi?' 🏅'+hi:'')+'</div></div>'}h+='</div></div>'}p.innerHTML=h;p.querySelectorAll('.gi').forEach(function(el){el.addEventListener('click',function(){launchGame(el.dataset.gk)})})}

/* LAB */
var pots=[{e:'🧪',n:'Crescer',gem:2,fn:function(){S.scale=1.4;setTimeout(function(){S.scale=1},6000)}},{e:'🫧',n:'Encolher',gem:1,fn:function(){S.scale=.7;setTimeout(function(){S.scale=1},6000)}},{e:'🌈',n:'Arco-iris',gem:2,fn:function(){S.rainbow=true;S.usedRb=true;setTimeout(function(){S.rainbow=false;S.color='#1a3a6a'},8000)}},{e:'⚡',n:'Energia',gem:1,fn:function(){S.energy=100}},{e:'😜',n:'Engrecado',gem:1,fn:function(){showSp('HAHAHA!');aState='dance';aTimer=120}},{e:'💊',n:'Saude',gem:2,fn:function(){S.health=100;S.hunger=Math.min(100,S.hunger+25)}}];
function buildLab(){var g=document.getElementById('ui-lab');var h='';for(var i=0;i<pots.length;i++){var p=pots[i];h+='<div class="pb" data-pi="'+i+'"><div class="pi">'+p.e+'</div><div class="pn">'+p.n+'</div><div class="pc">💎'+p.gem+'</div></div>'}g.innerHTML=h;g.querySelectorAll('.pb').forEach(function(el){el.addEventListener('click',function(){var p=pots[parseInt(el.dataset.pi)];if(S.gems<p.gem){toast('Gemas insuficientes!');return}S.gems-=p.gem;S.potC++;p.fn();squish=1;gainXP(8);toast(p.e+' '+p.n+'!');updateUI();save()})})}

/* CLOSET */
var colors=['#1a3a6a','#F44336','#E91E63','#9C27B0','#3F51B5','#00BCD4','#FF9800','#FFEB3B','#66BB6A','#795548','#607D8B','#212121'];
var hats=[{e:'🎉',k:'party',n:'Festa'},{e:'👑',k:'crown',n:'Coroa'},{e:'🧢',k:'cap',n:'Bone'},{e:'🎀',k:'bow',n:'Laco'},{e:'🎩',k:'tophat',n:'Chapeu'}];
var accs=[{e:'👓',k:'glasses',n:'Oculos'},{e:'🕶️',k:'sunglasses',n:'Escuros'},{e:'😳',k:'blush',n:'Rubor'},{e:'🥸',k:'mustache',n:'Bigode'},{e:'🧣',k:'scarf',n:'Cachecol'}];
function buildCloset(){var p=document.getElementById('ui-closet');var h='<div class="cs"><h4>Cor</h4><div class="crow">';for(var i=0;i<colors.length;i++){var c=colors[i];h+='<div class="cd'+(S.color===c?' on':'')+'" style="background:'+c+'" data-c="'+c+'"></div>'}h+='</div></div><div class="cs"><h4>Chapeus</h4><div class="crow">';for(var i=0;i<hats.length;i++){var ht=hats[i];h+='<div class="ho'+(S.hat===ht.k?' on':'')+'" data-h="'+ht.k+'">'+ht.e+'</div>'}h+='</div></div><div class="cs"><h4>Acessorios</h4><div class="crow">';for(var i=0;i<accs.length;i++){var a=accs[i];h+='<div class="ho'+(S.acc===a.k?' on':'')+'" data-a="'+a.k+'">'+a.e+'</div>'}h+='</div></div>';p.innerHTML=h;p.querySelectorAll('.cd').forEach(function(el){el.addEventListener('click',function(){S.color=el.dataset.c;S.rainbow=false;buildCloset();save()})});p.querySelectorAll('[data-h]').forEach(function(el){el.addEventListener('click',function(){var k=el.dataset.h;S.hat=S.hat===k?null:k;buildCloset();save()})});p.querySelectorAll('[data-a]').forEach(function(el){el.addEventListener('click',function(){var k=el.dataset.a;S.acc=S.acc===k?null:k;buildCloset();save()})})}

/* DAILY */
function checkDaily(){var now=Date.now();if(now-S.lastD>86400000){S.lastD=now;var c=25+0|Math.random()*25;var g=Math.random()<.25?1:0;earn(c);if(g)S.gems+=g;gainXP(15);toast('Diaria! +'+c+' moedas'+(g?' +1 gema':''));save()}}
setTimeout(checkDaily,2000);
var sps=['Ei!','Me cuida!','Que fome...','Brinque!','Zzzz...','Ola!','Fish!'];
setInterval(function(){if(Math.random()<.2)showSp(sps[0|Math.random()*sps.length])},20000);
updateUI();