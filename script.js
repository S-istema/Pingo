/* ===== SOM REALISTA ===== */
var AC=null;
function initAudio(){if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)}catch(e){}}
function nz(dur,vol,freq,q){if(!AC)return null;try{var sz=AC.sampleRate*dur,buf=AC.createBuffer(1,sz,AC.sampleRate),dt=buf.getChannelData(0);for(var i=0;i<sz;i++)dt[i]=(Math.random()*2-1)*vol;var s=AC.createBufferSource();s.buffer=buf;var g=AC.createGain();g.gain.setValueAtTime(vol,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur);var f=AC.createBiquadFilter();f.type='bandpass';if(freq)f.frequency.setValueAtTime(freq,AC.currentTime);if(q)f.Q.setValueAtTime(q,AC.currentTime);s.connect(f);f.connect(g);g.connect(AC.destination);s.start();s.stop(AC.currentTime+dur);return f}catch(e){return null}}
function tn(fr,dur,tp,vol,dl){if(!AC)return;try{var o=AC.createOscillator(),g=AC.createGain();o.type=tp||'sine';o.frequency.setValueAtTime(fr,AC.currentTime+(dl||0));g.gain.setValueAtTime(vol||.1,AC.currentTime+(dl||0));g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+(dl||0)+dur);o.connect(g);g.connect(AC.destination);o.start(AC.currentTime+(dl||0));o.stop(AC.currentTime+(dl||0)+dur)}catch(e){}}
function sndPet(){tn(523,.1,'sine',.12);tn(659,.1,'sine',.1,.07);tn(784,.15,'sine',.08,.14)}
function sndEat(){for(var i=0;i<4;i++)(function(i){setTimeout(function(){nz(.06,.15,800+i*200,2);tn(250+i*50,.04,'square',.04)},i*90)})(i)}
function sndBath(){nz(1.2,.08,3000,1);tn(1200,.15,'sine',.04);tn(1800,.2,'sine',.03,.1);for(var i=0;i<5;i++)tn(800+Math.random()*2000,.08,'sine',.015,.1+i*.12)}
function sndShower(){var n=nz(1.5,.12,4500,.5);if(n)n.type='highpass';tn(300,.8,'sine',.02);tn(450,.6,'sine',.015,.2)}
function sndSoap(){for(var i=0;i<6;i++)(function(i){setTimeout(function(){tn(600+Math.random()*800,.12,'sine',.04);nz(.05,.06,5000+Math.random()*3000,5)},i*70)})(i)}
function sndCoin(){tn(880,.06,'square',.06);tn(1320,.12,'square',.05,.05)}
function sndClick(){tn(500,.03,'sine',.08)}
function sndWin(){tn(523,.1,'sine',.1);tn(659,.1,'sine',.1,.1);tn(784,.1,'sine',.1,.2);tn(1047,.25,'sine',.08,.3)}
function sndLose(){tn(350,.2,'sawtooth',.07);tn(250,.2,'sawtooth',.07,.15);tn(180,.35,'sawtooth',.05,.3)}
function sndPotion(){tn(200,.15,'sine',.06);nz(.3,.05,1000,8);tn(400,.1,'sine',.05,.15);tn(600,.1,'sine',.05,.25);tn(900,.15,'triangle',.06,.35);tn(1200,.2,'sine',.04,.45)}
function sndGP(){tn(700,.04,'square',.05)}
function sndLvl(){for(var i=0;i<6;i++)tn(400+i*100,.1,'sine',.07,i*.07)}
document.addEventListener('touchstart',initAudio,{once:true});
document.addEventListener('mousedown',initAudio,{once:true});

/* ===== ESTADO ===== */
var S={hunger:80,energy:90,fun:70,clean:85,health:90,coins:120,gems:5,level:1,xp:0,xpN:100,color:'#1a3a6a',hat:null,acc:null,shoes:null,scale:1,rainbow:false,mood:'happy',feedC:0,bathC:0,gameW:0,coinT:120,lastD:0,potC:0,hi:{}};
function save(){try{localStorage.setItem('pou3d',JSON.stringify(S))}catch(e){}}
function load(){try{var d=localStorage.getItem('pou3d');if(d){var o=JSON.parse(d);for(var k in o)if(o.hasOwnProperty(k))S[k]=o[k]}}catch(e){}}load();

/* ===== CORES ===== */
function htr(h){h=h.replace('#','');return[parseInt(h.substring(0,2),16),parseInt(h.substring(2,4),16),parseInt(h.substring(4,6),16)]}
function rth(r,g,b){return'#'+[r,g,b].map(function(x){return Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')}).join('')}
function lighten(h,p){var c=htr(h);return rth(c[0]+(255-c[0])*p/100,c[1]+(255-c[1])*p/100,c[2]+(255-c[2])*p/100)}
function darken(h,p){var c=htr(h);return rth(c[0]*(1-p/100),c[1]*(1-p/100),c[2]*(1-p/100))}

/* ===== UI ===== */
var _tt;function toast(m){var e=document.getElementById('toast');e.textContent=m;e.classList.add('on');clearTimeout(_tt);_tt=setTimeout(function(){e.classList.remove('on')},2200)}
var _st;function showSp(t){var e=document.getElementById('sp');e.textContent=t;e.style.display='block';clearTimeout(_st);_st=setTimeout(function(){e.style.display='none'},2200)}
function particle(x,y,em){var e=document.createElement('div');e.className='ptc';e.textContent=em;e.style.left=x+'px';e.style.top=y+'px';document.getElementById('rw').appendChild(e);setTimeout(function(){e.remove()},850)}

/* ===== CANVAS ===== */
var cvs=document.getElementById('pc'),ctx=cvs.getContext('2d');
var CW,CH,PX,PY,PS,tX=null,tY=null,isBlink=false,animT=0,aState='idle',aTimer=0,squish=0,mouthOpen=0,bubbles=[],currentRoom='hall',showerOn=false,showerAnimT=0,soapActive=false,soapTimer=0,foamBubbles=[],waterDrops=[];
function resizeC(){var w=document.getElementById('rw').getBoundingClientRect(),d=window.devicePixelRatio||1;CW=w.width;CH=w.height;cvs.width=CW*d;cvs.height=CH*d;cvs.style.width=CW+'px';cvs.style.height=CH+'px';ctx.setTransform(d,0,0,d,0,0);PS=Math.max(Math.min(CW*.5,240),Math.min(CH*.55,240));PX=CW/2;PY=CH/2-PS*.05;var dt=document.getElementById('drag-target');dt.style.width=PS*.75+'px';dt.style.height=PS*.75+'px';dt.style.left=(PX-PS*.375)+'px';dt.style.top=(PY-PS*.375)+'px'}
window.addEventListener('resize',resizeC);resizeC();

/* ===== DESENHAR CENARIO BANHO ===== */
function drawBathScene(){
    // Fundo do banheiro - azulado suave
    var bg=ctx.createLinearGradient(0,0,0,CH);
    bg.addColorStop(0,'#1a2a3a');
    bg.addColorStop(0.5,'#0d1f2d');
    bg.addColorStop(1,'#162a38');
    ctx.fillStyle=bg;
    ctx.fillRect(0,0,CW,CH);

    // Piso com azulejos
    var tileW=40,tileH=40;
    for(var r=0;r<Math.ceil(CH/tileH)+1;r++){
        for(var c=0;c<Math.ceil(CW/tileW)+1;c++){
            var tx=c*tileW,ty=r*tileH;
            ctx.fillStyle=(r+c)%2===0?'rgba(100,160,200,.06)':'rgba(80,140,180,.03)';
            ctx.fillRect(tx,ty,tileW,tileH);
            ctx.strokeStyle='rgba(100,160,200,.08)';
            ctx.lineWidth=.5;
            ctx.strokeRect(tx,ty,tileW,tileH);
        }
    }

    // Parede de azulejos (topo)
    var wallH=CH*.35;
    var wbg=ctx.createLinearGradient(0,0,0,wallH);
    wbg.addColorStop(0,'#1e3040');
    wbg.addColorStop(1,'#162530');
    ctx.fillStyle=wbg;
    ctx.fillRect(0,0,CW,wallH);
    for(var r=0;r<Math.ceil(wallH/35);r++){
        for(var c=0;c<Math.ceil(CW/35)+1;c++){
            ctx.strokeStyle='rgba(120,180,220,.07)';
            ctx.lineWidth=.5;
            ctx.strokeRect(c*35,r*35,35,35);
        }
    }

    // Banheira
    var tubW=CW*.65,tubH=CH*.28,tubX=(CW-tubW)/2,tubY=CH*.52;
    // Sombra da banheira
    ctx.fillStyle='rgba(0,0,0,.25)';
    ctx.beginPath();ctx.ellipse(tubX+tubW/2,tubY+tubH+8,tubW/2+10,14,0,0,Math.PI*2);ctx.fill();
    // Parte externa
    var tubGrad=ctx.createLinearGradient(tubX,tubY,tubX,tubY+tubH);
    tubGrad.addColorStop(0,'#e8e8e8');
    tubGrad.addColorStop(.5,'#d0d0d0');
    tubGrad.addColorStop(1,'#b8b8b8');
    ctx.fillStyle=tubGrad;
    ctx.beginPath();ctx.roundRect(tubX,tubY,tubW,tubH,18);ctx.fill();
    // Borda superior
    ctx.fillStyle='#f0f0f0';
    ctx.beginPath();ctx.roundRect(tubX-4,tubY-6,tubW+8,16,8);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.08)';ctx.lineWidth=1;ctx.stroke();
    // Água dentro da banheira
    var waterY=tubY+10,waterH=tubH-14;
    var wGrad=ctx.createLinearGradient(tubX,waterY,tubX,waterY+waterH);
    wGrad.addColorStop(0,'rgba(100,200,255,.35)');
    wGrad.addColorStop(.5,'rgba(70,170,240,.4)');
    wGrad.addColorStop(1,'rgba(50,140,220,.5)');
    ctx.fillStyle=wGrad;
    ctx.beginPath();ctx.roundRect(tubX+6,waterY,tubW-12,waterH,12);ctx.fill();
    // Reflexo na água
    ctx.fillStyle='rgba(180,230,255,.15)';
    ctx.beginPath();ctx.ellipse(tubX+tubW*.35,waterY+waterH*.3,tubW*.15,6,-.1,0,Math.PI*2);ctx.fill();
    // Ondulações na água
    ctx.strokeStyle='rgba(180,230,255,.2)';ctx.lineWidth=1;
    for(var w=0;w<3;w++){
        ctx.beginPath();
        for(var x=tubX+10;x<tubX+tubW-10;x+=2){
            var wy=waterY+waterH*.2+w*12+Math.sin(x*.04+animT*.06+w)*3;
            if(x===tubX+10)ctx.moveTo(x,wy);else ctx.lineTo(x,wy);
        }
        ctx.stroke();
    }

    // Torneira / chuveiro na parede
    var shX=CW*.78,shY=CH*.12;
    // Cano da parede
    ctx.strokeStyle='#a0a8b0';ctx.lineWidth=6;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(shX,0);ctx.lineTo(shX,shY);ctx.stroke();
    ctx.strokeStyle='#b0b8c0';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(shX,0);ctx.lineTo(shX,shY);ctx.stroke();
    // Curva do chuveiro
    ctx.strokeStyle='#a0a8b0';ctx.lineWidth=6;
    ctx.beginPath();ctx.moveTo(shX,shY);ctx.quadraticCurveTo(shX,shY+20,shX-25,shY+20);ctx.stroke();
    ctx.strokeStyle='#b0b8c0';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(shX,shY);ctx.quadraticCurveTo(shX,shY+20,shX-25,shY+20);ctx.stroke();
    // Cabeça do chuveiro
    ctx.fillStyle=showerOn?'#c0d0e0':'#90989e';
    ctx.beginPath();ctx.roundRect(shX-45,shY+16,24,12,4);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=1;ctx.stroke();
    // Furos do chuveiro
    for(var h=0;h<4;h++){
        ctx.fillStyle=showerOn?'rgba(150,210,255,.8)':'#70787e';
        ctx.beginPath();ctx.arc(shX-42+h*6,shY+22,1.5,0,Math.PI*2);ctx.fill();
    }

    // Jato de água do chuveiro (se ligado)
    if(showerOn){
        showerAnimT++;
        ctx.save();
        for(var d=0;d<12;d++){
            var dx=shX-33+Math.sin(animT*.08+d*1.3)*8;
            var dy=shY+28+d*18+Math.sin(animT*.1+d*.7)*4;
            var dr=2+Math.random()*2;
            var da=Math.max(.05,.3-d*.02);
            ctx.fillStyle='rgba(140,210,255,'+da+')';
            ctx.beginPath();ctx.ellipse(dx,dy,dr,dr*1.8,.2,0,Math.PI*2);ctx.fill();
        }
        // Spray mais denso perto da cabeça
        for(var d=0;d<6;d++){
            var dx=shX-33+Math.sin(animT*.12+d*2)*12;
            var dy=shY+28+d*8+Math.random()*6;
            ctx.fillStyle='rgba(160,220,255,'+(0.15+Math.random()*.15)+')';
            ctx.beginPath();ctx.arc(dx,dy,1+Math.random()*1.5,0,Math.PI*2);ctx.fill();
        }
        ctx.restore();
        // Gotículas caindo
        if(animT%3===0){
            waterDrops.push({x:shX-33+Math.random()*20-10,y:shY+30+Math.random()*40,vy:1+Math.random()*2,life:30+Math.random()*20});
        }
    }else{
        showerAnimT=0;
    }

    // Desenhar gotas de água
    for(var i=waterDrops.length-1;i>=0;i--){
        var wd=waterDrops[i];
        wd.y+=wd.vy;wd.vy+=.15;wd.life--;
        if(wd.life<=0||wd.y>CH){waterDrops.splice(i,1);continue}
        ctx.fillStyle='rgba(140,210,255,'+(wd.life/50*.4)+')';
        ctx.beginPath();ctx.ellipse(wd.x,wd.y,1.5,3,0,0,Math.PI*2);ctx.fill();
    }

    // Botão do chuveiro na parede
    var btnX=shX+20,btnY=shY-5;
    ctx.fillStyle=showerOn?'#4ECDC4':'#556677';
    ctx.beginPath();ctx.arc(btnX,btnY,10,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 9px Nunito';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(showerOn?'ON':'OFF',btnX,btnY);

    // Sabonete no prateleira
    var soapX=CW*.18,soapY=CH*.18;
    // Prateleira
    ctx.fillStyle='#8a7060';
    ctx.fillRect(soapX-30,soapY+12,60,5);
    ctx.fillStyle='#9a8070';
    ctx.fillRect(soapX-28,soapY+10,56,4);
    // Sabonete
    var soapCol=soapActive?'rgba(255,200,100,.9)':'rgba(255,180,80,.85)';
    ctx.fillStyle=soapCol;
    ctx.beginPath();ctx.roundRect(soapX-12,soapY-2,24,14,6);ctx.fill();
    ctx.strokeStyle='rgba(200,140,50,.4)';ctx.lineWidth=.8;ctx.stroke();
    // Brilho do sabonete
    ctx.fillStyle='rgba(255,255,255,.3)';
    ctx.beginPath();ctx.ellipse(soapX-4,soapY+2,6,3,-.2,0,Math.PI*2);ctx.fill();
    // Textura do sabonete
    ctx.fillStyle='rgba(255,255,255,.15)';
    for(var sb=0;sb<3;sb++){
        ctx.beginPath();ctx.arc(soapX-6+sb*8,soapY+5,1.5,0,Math.PI*2);ctx.fill();
    }

    // Espuma do sabonete ativo
    if(soapActive){
        soapTimer--;
        if(soapTimer<=0)soapActive=false;
        for(var fb=0;fb<8;fb++){
            var fx=PX-30+Math.sin(animT*.05+fb*1.1)*35;
            var fy=PY-20+Math.cos(animT*.04+fb*.9)*25;
            var fr=4+Math.sin(animT*.06+fb)*2;
            ctx.fillStyle='rgba(255,255,255,'+(0.25+Math.sin(animT*.08+fb)*.1)+')';
            ctx.beginPath();ctx.arc(fx,fy,Math.max(1,fr),0,Math.PI*2);ctx.fill();
            ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=.5;ctx.stroke();
        }
    }

    // Frasco de shampoo na prateleira
    var shampX=CW*.28,shampY=CH*.2;
    ctx.fillStyle='#66BB6A';
    ctx.beginPath();ctx.roundRect(shampX-6,shampY,12,18,3);ctx.fill();
    ctx.fillStyle='#43A047';
    ctx.fillRect(shampX-4,shampY-4,8,6);
    ctx.fillStyle='rgba(255,255,255,.3)';
    ctx.fillRect(shampX-3,shampY+4,2,10);

    // Toalha na parede
    ctx.fillStyle='rgba(255,255,255,.12)';
    ctx.beginPath();ctx.roundRect(CW*.05,CH*.15,25,60,4);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.stroke();
    // Listras da toalha
    ctx.strokeStyle='rgba(78,205,196,.15)';ctx.lineWidth=2;
    for(var tl=0;tl<4;tl++){
        ctx.beginPath();ctx.moveTo(CW*.05+5,CH*.15+12+tl*14);ctx.lineTo(CW*.05+20,CH*.15+12+tl*14);ctx.stroke();
    }

    // Armário pequeno
    ctx.fillStyle='rgba(80,100,120,.3)';
    ctx.beginPath();ctx.roundRect(CW*.02,CH*.4,50,70,5);ctx.fill();
    ctx.strokeStyle='rgba(120,150,180,.2)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(150,180,200,.15)';
    ctx.beginPath();ctx.arc(CW*.02+35,CH*.4+35,3,0,Math.PI*2);ctx.fill();
}

/* ===== DESENHAR POU ===== */
function drawPou(){
    ctx.clearRect(0,0,CW,CH);

    // Se na sala de banho, desenhar cenário
    if(currentRoom==='bath'){
        drawBathScene();
    }else{
        // Fundo padrão das outras salas
        var bg2=ctx.createRadialGradient(CW/2,CH/2,0,CW/2,CH/2,CW*.7);
        bg2.addColorStop(0,'#1a2233');
        bg2.addColorStop(1,'#0d1117');
        ctx.fillStyle=bg2;
        ctx.fillRect(0,0,CW,CH);
        // Padrão sutil
        ctx.fillStyle='rgba(78,205,196,.015)';
        for(var p=0;p<6;p++){
            ctx.beginPath();ctx.arc(CW*(.15+p*.14),CH*(.3+Math.sin(p)*.2),40+Math.sin(animT*.01+p)*10,0,Math.PI*2);ctx.fill();
        }
    }

    var s=PS/150,col=S.color;
    if(S.rainbow)col='hsl('+((animT*3)%360)+',55%,45%)';
    ctx.save();ctx.translate(PX,PY);
    var br=1+Math.sin(animT*.04)*.01,sx=1+squish*.1,sy=1-squish*.07;squish*=.85;
    var by=0;
    if(aState==='bounce')by=Math.sin(animT*.25)*8;
    if(aState==='sleep')by=Math.sin(animT*.04)*2;
    if(aState==='dance')by=Math.abs(Math.sin(animT*.15))*10;
    if(aState==='eating')by=Math.sin(animT*.4)*3;
    ctx.translate(0,by);ctx.scale(s*sx*br,s*sy*br);

    // Sombra
    ctx.beginPath();ctx.ellipse(0,78,40,10,0,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fill();

    // Sapatos
    if(S.shoes){
        var sc=S.shoes==='red'?'#E53935':S.shoes==='blue'?'#1E88E5':S.shoes==='green'?'#43A047':S.shoes==='gold'?'#FFB300':S.shoes==='pink'?'#EC407A':'#8D6E63';
        ctx.fillStyle=sc;ctx.beginPath();ctx.ellipse(-16,74,15,8,-.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(16,74,15,8,.12,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=darken(sc,20);ctx.beginPath();ctx.ellipse(-16,76,10,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(16,76,10,4,0,0,Math.PI*2);ctx.fill();
    }else{
        ctx.fillStyle='#E8973F';ctx.beginPath();ctx.ellipse(-16,72,14,7,-.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(16,72,14,7,.12,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#D4822F';ctx.beginPath();ctx.ellipse(-16,75,10,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(16,75,10,4,0,0,Math.PI*2);ctx.fill();
    }

    // Corpo
    ctx.beginPath();ctx.ellipse(0,16,42,56,0,0,Math.PI*2);
    var bg=ctx.createRadialGradient(-14,-14,5,2,12,75);bg.addColorStop(0,lighten(col,20));bg.addColorStop(.5,col);bg.addColorStop(1,darken(col,18));ctx.fillStyle=bg;ctx.fill();

    // Braços
    ctx.save();ctx.translate(-42,8);ctx.rotate(.12+Math.sin(animT*.06)*.05);ctx.beginPath();ctx.ellipse(0,0,12,34,0,0,Math.PI*2);ctx.fillStyle=darken(col,12);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(42,8);ctx.rotate(-.12-Math.sin(animT*.06)*.05);ctx.beginPath();ctx.ellipse(0,0,12,34,0,0,Math.PI*2);ctx.fillStyle=darken(col,12);ctx.fill();ctx.restore();

    // Barriga
    ctx.beginPath();ctx.ellipse(0,22,24,38,0,0,Math.PI*2);
    var wbg=ctx.createRadialGradient(-4,14,3,-2,18,30);wbg.addColorStop(0,'#FFFFFF');wbg.addColorStop(1,'#E8EDF2');ctx.fillStyle=wbg;ctx.fill();

    // Brilho
    var hl=ctx.createRadialGradient(-20,-22,3,-12,-12,38);hl.addColorStop(0,'rgba(255,255,255,.18)');hl.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=hl;ctx.beginPath();ctx.ellipse(0,16,42,56,0,0,Math.PI*2);ctx.fill();

    // Orelhas
    ctx.beginPath();ctx.moveTo(-11,-24);ctx.lineTo(0,-12);ctx.lineTo(11,-24);ctx.closePath();ctx.fillStyle='#E8973F';ctx.fill();
    ctx.beginPath();ctx.moveTo(-8,-24);ctx.lineTo(0,-16);ctx.lineTo(8,-24);ctx.closePath();ctx.fillStyle='#F4A84B';ctx.fill();

    // Olhos
    var ey=aState==='sleep'?2:0;
    [-14,14].forEach(function(ox){
        ctx.beginPath();ctx.ellipse(ox,-36+ey,11,13,0,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
        if(!isBlink&&aState!=='sleep'){
            var px2=ox,py2=-36+ey;
            if(tX!==null){px2=ox+Math.max(-3,Math.min(3,(tX-PX)*.01));py2=-36+ey+Math.max(-2,Math.min(2,(tY-PY)*.008))}
            ctx.beginPath();ctx.ellipse(px2,py2,6,8,0,0,Math.PI*2);ctx.fillStyle='#0a0a1e';ctx.fill();
            ctx.beginPath();ctx.ellipse(px2-2,py2-3,2.2,2.2,0,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
            ctx.beginPath();ctx.ellipse(px2+1.5,py2+1.5,1,1,0,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fill();
        }else{
            ctx.strokeStyle='#0a0a1e';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ox-7,-36+ey);ctx.quadraticCurveTo(ox,-32+ey,ox+7,-36+ey);ctx.stroke();
        }
    });

    // Bochechas
    if(S.mood==='happy'||S.mood==='excited'){ctx.fillStyle='rgba(255,120,140,.2)';ctx.beginPath();ctx.ellipse(-24,-26,6,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(24,-26,6,4,0,0,Math.PI*2);ctx.fill()}

    // Boca
    var mo=mouthOpen;ctx.strokeStyle='#2a1a0a';ctx.lineWidth=2.5;ctx.lineCap='round';
    if(mo>.1){ctx.beginPath();ctx.ellipse(0,-16,7*mo,5*mo,0,0,Math.PI*2);ctx.fillStyle='#8B0000';ctx.fill();ctx.stroke()}
    else if(S.mood==='happy'){ctx.beginPath();ctx.moveTo(-7,-16);ctx.quadraticCurveTo(0,-10,7,-16);ctx.stroke()}
    else if(S.mood==='sad'){ctx.beginPath();ctx.moveTo(-6,-14);ctx.quadraticCurveTo(0,-18,6,-14);ctx.stroke()}
    else if(S.mood==='hungry'){ctx.beginPath();ctx.arc(0,-14,4,0,Math.PI*2);ctx.stroke()}
    else if(S.mood==='sleepy'){ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(4,-14);ctx.stroke()}
    else if(S.mood==='excited'){ctx.beginPath();ctx.moveTo(-9,-14);ctx.quadraticCurveTo(0,-7,9,-14);ctx.stroke()}
    else if(S.mood==='sick'){ctx.beginPath();ctx.moveTo(-5,-13);ctx.quadraticCurveTo(0,-17,5,-13);ctx.stroke()}
    else{ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(4,-14);ctx.stroke()}

    // Chapeus
    if(S.hat==='party'){ctx.fillStyle='#E91E63';ctx.beginPath();ctx.moveTo(0,-82);ctx.lineTo(-18,-50);ctx.lineTo(18,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#FFD54F';ctx.beginPath();ctx.arc(0,-82,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#E91E63';ctx.beginPath();ctx.ellipse(0,-50,22,5,0,0,Math.PI*2);ctx.fill()}
    if(S.hat==='crown'){ctx.fillStyle='#FFD54F';ctx.beginPath();ctx.moveTo(-20,-50);ctx.lineTo(-20,-70);ctx.lineTo(-10,-60);ctx.lineTo(0,-74);ctx.lineTo(10,-60);ctx.lineTo(20,-70);ctx.lineTo(20,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#EF5350';ctx.beginPath();ctx.arc(0,-74,3.5,0,Math.PI*2);ctx.fill()}
    if(S.hat==='cap'){ctx.fillStyle=darken(col,10);ctx.beginPath();ctx.ellipse(0,-46,22,13,0,Math.PI,0);ctx.fill();ctx.fillStyle=darken(col,20);ctx.beginPath();ctx.ellipse(17,-46,15,4,-.2,0,Math.PI*2);ctx.fill()}
    if(S.hat==='bow'){ctx.fillStyle='#E91E63';ctx.beginPath();ctx.ellipse(-9,-52,9,6,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(9,-52,9,6,.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(0,-52,3.5,0,0,Math.PI*2);ctx.fill()}
    if(S.hat==='tophat'){ctx.fillStyle='#1a1a1a';ctx.fillRect(-15,-86,30,38);ctx.beginPath();ctx.ellipse(0,-48,22,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#E91E63';ctx.fillRect(-15,-55,30,5)}
    if(S.hat==='santa'){ctx.fillStyle='#E53935';ctx.beginPath();ctx.ellipse(0,-50,24,6,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-18,-50);ctx.quadraticCurveTo(-5,-80,20,-65);ctx.lineTo(18,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(20,-65,5,0,Math.PI*2);ctx.fill()}
    if(S.hat==='flower'){ctx.strokeStyle='#388E3C';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-50);ctx.lineTo(0,-62);ctx.stroke();var fc=['#FF6B9D','#FFB347','#FF6B9D','#FFB347','#FF6B9D'];for(var i=0;i<5;i++){var a=i*Math.PI*2/5-Math.PI/2;ctx.beginPath();ctx.ellipse(Math.cos(a)*6,-62+Math.sin(a)*6,4,4,0,0,Math.PI*2);ctx.fillStyle=fc[i];ctx.fill()}ctx.beginPath();ctx.arc(0,-62,3,0,Math.PI*2);ctx.fillStyle='#FFE66D';ctx.fill()}
    if(S.hat==='antenna'){ctx.strokeStyle='#78909C';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-50);ctx.quadraticCurveTo(10,-70,5,-80);ctx.stroke();ctx.fillStyle='#EF5350';ctx.beginPath();ctx.arc(5,-80,4,0,Math.PI*2);ctx.fill()}
    if(S.hat==='wizard'){ctx.fillStyle='#5C6BC0';ctx.beginPath();ctx.moveTo(-20,-50);ctx.quadraticCurveTo(-15,-90,0,-95);ctx.quadraticCurveTo(15,-90,20,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#FFD54F';ctx.beginPath();ctx.arc(0,-68,3,0,Math.PI*2);ctx.fill()}

    // Acessórios
    if(S.acc==='glasses'){ctx.strokeStyle='#37474F';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(-14,-36,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(14,-36,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-5,-36);ctx.lineTo(5,-36);ctx.stroke()}
    if(S.acc==='sunglasses'){ctx.fillStyle='rgba(15,25,40,.78)';ctx.strokeStyle='#37474F';ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(-24,-44,18,14,4);ctx.fill();ctx.stroke();ctx.beginPath();ctx.roundRect(6,-44,18,14,4);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-6,-37);ctx.lineTo(6,-37);ctx.stroke()}
    if(S.acc==='blush'){ctx.fillStyle='rgba(255,80,120,.35)';ctx.beginPath();ctx.ellipse(-24,-24,8,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(24,-24,8,5,0,0,Math.PI*2);ctx.fill()}
    if(S.acc==='mustache'){ctx.fillStyle='#3E2723';ctx.beginPath();ctx.ellipse(-7,-6,8,4,-.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(7,-6,8,4,.2,0,Math.PI*2);ctx.fill()}
    if(S.acc==='scarf'){ctx.fillStyle='#E91E63';ctx.beginPath();ctx.ellipse(0,-4,32,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#C2185B';ctx.beginPath();ctx.roundRect(10,-4,9,20,4);ctx.fill()}
    if(S.acc==='tie'){ctx.fillStyle='#1565C0';ctx.beginPath();ctx.moveTo(-6,-6);ctx.lineTo(6,-6);ctx.lineTo(4,0);ctx.lineTo(0,18);ctx.lineTo(-4,0);ctx.closePath();ctx.fill()}
    if(S.acc==='necklace'){ctx.strokeStyle='#FFB300';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-8,20,.2,Math.PI-.2);ctx.stroke();ctx.fillStyle='#FFB300';ctx.beginPath();ctx.arc(0,10,4,0,Math.PI*2);ctx.fill()}
    if(S.acc==='bowtie'){ctx.fillStyle='#7B1FA2';ctx.beginPath();ctx.ellipse(-7,-6,7,5,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(7,-6,7,5,.3,0,Math.PI*2);ctx.fill()}
    if(S.acc==='eyepatch'){ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(14,-36,12,14,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#1a1a1a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(26,-36);ctx.quadraticCurveTo(35,-50,30,-55);ctx.stroke()}

    // Zzz dormindo
    if(aState==='sleep'){var a=Math.abs(Math.sin(animT*.05));ctx.font=(12+a*5)+'px Nunito';ctx.fillStyle='rgba(180,200,255,'+a+')';ctx.fillText('z',44,-52);ctx.font=(9+a*3)+'px Nunito';ctx.fillText('z',54,-64);ctx.fillText('z',60,-72)}

    // Se chuveiro ligado, gotas caindo no Pou
    if(showerOn){
        ctx.save();
        for(var d=0;d<6;d++){
            var dx=-20+Math.sin(animT*.1+d*1.5)*25;
            var dy=-50+d*20+Math.sin(animT*.08+d)*5;
            ctx.fillStyle='rgba(140,210,255,'+(0.2+Math.random()*.15)+')';
            ctx.beginPath();ctx.ellipse(dx,dy,1.5,3,.3,0,Math.PI*2);ctx.fill();
        }
        // Brilho molhado no corpo
        ctx.fillStyle='rgba(140,210,255,.08)';
        ctx.beginPath();ctx.ellipse(0,16,42,56,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
    }

    ctx.restore();

    // Bolhas fora do Pou
    for(var i=bubbles.length-1;i>=0;i--){
        var b=bubbles[i];b.y-=b.sp;b.x+=Math.sin(animT*.05+b.off)*.5;b.life--;
        if(b.life<=0){bubbles.splice(i,1);continue}
        ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle='rgba(150,220,255,'+(b.life/b.ml)*.4+')';ctx.fill();
        ctx.strokeStyle='rgba(200,240,255,'+(b.life/b.ml)*.3+')';ctx.lineWidth=.5;ctx.stroke();
        // Brilho na bolha
        ctx.fillStyle='rgba(255,255,255,'+(b.life/b.ml)*.2+')';
        ctx.beginPath();ctx.arc(b.x-b.r*.3,b.y-b.r*.3,b.r*.25,0,Math.PI*2);ctx.fill();
    }
    if(mouthOpen>0)mouthOpen=Math.max(0,mouthOpen-.06);
}

// Piscar
setInterval(function(){isBlink=true;setTimeout(function(){isBlink=false},150)},3500+Math.random()*2000);

// Loop de animação
function animLoop(){animT++;if(aTimer>0){aTimer--;if(aTimer<=0)aState='idle'}drawPou();updateMood();requestAnimationFrame(animLoop)}animLoop();

// Input tracking
cvs.addEventListener('touchstart',function(e){var t=e.touches[0],r=cvs.getBoundingClientRect();tX=t.clientX-r.left;tY=t.clientY-r.top;handleBathTap(t.clientX-r.left,t.clientY-r.top)},{passive:true});
cvs.addEventListener('touchmove',function(e){var t=e.touches[0],r=cvs.getBoundingClientRect();tX=t.clientX-r.left;tY=t.clientY-r.top},{passive:true});
cvs.addEventListener('touchend',function(){tX=null;tY=null},{passive:true});
cvs.addEventListener('mousemove',function(e){var r=cvs.getBoundingClientRect();tX=e.clientX-r.left;tY=e.clientY-r.top});
cvs.addEventListener('mouseleave',function(){tX=null;tY=null});
cvs.addEventListener('click',function(e){var r=cvs.getBoundingClientRect();handleBathTap(e.clientX-r.left,e.clientY-r.top)});

// Toque no banheiro (chuveiro e sabonete)
function handleBathTap(mx,my){
    if(currentRoom!=='bath')return;
    // Verificar clique no botão do chuveiro
    var shX=CW*.78,shY=CH*.12,btnX=shX+20,btnY=shY-5;
    if(Math.abs(mx-btnX)<15&&Math.abs(my-btnY)<15){
        showerOn=!showerOn;
        if(showerOn){sndShower();toast('Chuveiro ligado!');S.clean=Math.min(100,S.clean+5)}
        else{toast('Chuveiro desligado!')}
        updateUI();save();return;
    }
    // Verificar clique no sabonete
    var soapX=CW*.18,soapY=CH*.18;
    if(Math.abs(mx-soapX)<18&&Math.abs(my-soapY)<14){
        soapActive=true;soapTimer=90;sndSoap();
        S.clean=Math.min(100,S.clean+8);squish=.5;
        for(var i=0;i<12;i++)bubbles.push({x:PX-40+Math.random()*80,y:PY-10+Math.random()*40,r:3+Math.random()*7,sp:.4+Math.random()*1,life:50+Math.random()*40,ml:90,off:Math.random()*6.28});
        showSp('Espuma!');gainXP(2);updateUI();save();return;
    }
}

function updateMood(){var m='happy';if(S.health<25)m='sick';else if(S.hunger<18)m='hungry';else if(S.energy<18)m='sleepy';else if(S.clean<18)m='sad';else if(S.fun>78&&S.energy>55)m='excited';else if(S.hunger<35||S.energy<35||S.fun<35||S.clean<35)m='sad';S.mood=m;document.getElementById('mf').textContent={happy:'😊',sad:'😢',hungry:'😣',sleepy:'😴',sick:'🤒',excited:'🤩'}[m]||'😊'}

// Decaimento de stats
setInterval(function(){
    if(S.energy>8||S.mood!=='sleep'){S.hunger=Math.max(0,S.hunger-.7);S.energy=Math.max(0,S.energy-.35);S.fun=Math.max(0,S.fun-.45);S.clean=Math.max(0,S.clean-.28)}
    var avg=(S.hunger+S.energy+S.clean)/3;if(avg<38)S.health=Math.max(0,S.health-.45);else S.health=Math.min(100,S.health+.18);
    // Se chuveiro ligado e na sala de banho, limpa continuamente
    if(showerOn&&currentRoom==='bath'){S.clean=Math.min(100,S.clean+.3);updateUI()}
    updateUI();save()
},5000);

function updateUI(){var ids=['bH','bE','bF','bC','bHp'],lids=['lH','lE','lF','lC','lHp'],vals=[S.hunger,S.energy,S.fun,S.clean,S.health];for(var i=0;i<5;i++){document.getElementById(ids[i]).style.width=Math.round(vals[i])+'%';document.getElementById(lids[i]).textContent=Math.round(vals[i])}document.getElementById('sC').textContent=S.coins;document.getElementById('sG').textContent=S.gems;document.getElementById('sL').textContent=S.level;document.getElementById('xpf').style.width=(S.xp/S.xpN*100)+'%'}
function gainXP(a){S.xp+=a;while(S.xp>=S.xpN){S.xp-=S.xpN;S.level++;S.xpN=Math.floor(S.xpN*1.35);S.coins+=50;sndLvl();toast('Nivel '+S.level+'! +50 moedas')}updateUI();save()}
function earn(n){S.coins+=n;S.coinT+=n;sndCoin();updateUI();save()}

/* ===== ACOES ===== */
function petPou(){sndPet();S.fun=Math.min(100,S.fun+6);squish=1;aState='bounce';aTimer=24;gainXP(2);showSp(['Oi!','Hehe!','Mais!','Obrigado!','Ahee!'][Math.floor(Math.random()*5)]);var r=cvs.getBoundingClientRect();particle(PX+r.left-15,PY+r.top-40,'❤️');updateUI()}
function pouSleep(){if(S.energy>=93){toast('Sem sono!');return}sndClick();aState='sleep';aTimer=999;toast('Dormindo...');var t=0;var iv=setInterval(function(){S.energy=Math.min(100,S.energy+7);updateUI();t++;if(t>=8||S.energy>=93){clearInterval(iv);aState='idle';aTimer=0;sndPet();toast('Acordou!');gainXP(10);save()}},600)}
function pouDance(){if(S.energy<12){toast('Cansado!');return}sndPet();aState='dance';aTimer=120;S.fun=Math.min(100,S.fun+22);S.energy=Math.max(0,S.energy-8);gainXP(5);toast('Dancando!');showSp('La la la!');updateUI();save()}

/* ===== SALAS ===== */
var roomUI={hall:'ui-hall',food:'fg',bath:'bath-items',games:'ui-games',lab:'ui-lab',closet:'ui-closet'};
document.querySelectorAll('.tab').forEach(function(t){
    t.addEventListener('click',function(){
        sndClick();
        document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on')});t.classList.add('on');
        var r=t.dataset.r;currentRoom=r;
        document.querySelectorAll('.rm').forEach(function(x){x.classList.remove('on')});document.getElementById('r-'+r).classList.add('on');
        for(var k in roomUI){var el=document.getElementById(roomUI[k]);if(el)el.style.display='none'}
        var ui=document.getElementById(roomUI[r]);if(ui&&r!=='bath')ui.style.display='';
        if(r==='bath'){
            buildBath();
            document.getElementById('cbw').style.display='none';
        }
        if(r==='food')buildFood();if(r==='games')buildGames();if(r==='lab')buildLab();if(r==='closet')buildCloset();
    })
});

/* ===== COMIDA ===== */
var foods=[{e:'🍔',n:'Hamburger',h:32,f:8,c:8},{e:'🍕',n:'Pizza',h:28,f:12,c:10},{e:'🍟',n:'Batata',h:18,f:6,c:5},{e:'🌮',n:'Taco',h:22,f:8,c:7},{e:'🍎',n:'Maca',h:14,f:4,c:3},{e:'🍌',n:'Banana',h:16,f:4,c:3},{e:'🍓',n:'Morango',h:10,f:8,c:4},{e:'🍉',n:'Melancia',h:18,f:10,c:5},{e:'🍇',n:'Uva',h:11,f:6,c:4},{e:'🎂',n:'Bolo',h:22,f:18,c:12},{e:'🍦',n:'Sorvete',h:18,f:22,c:10},{e:'🍫',n:'Chocolate',h:14,f:16,c:8},{e:'🥛',n:'Leite',h:11,f:4,c:3},{e:'🥤',n:'Refri',h:7,f:12,c:4},{e:'🧃',n:'Suco',h:9,f:10,c:4},{e:'☕',n:'Cafe',h:4,f:6,c:5},{e:'🐟',n:'Peixe',h:20,f:5,c:6},{e:'🍰',n:'Torta',h:24,f:15,c:11},{e:'🥗',n:'Salada',h:12,f:3,c:4},{e:'🍗',n:'Frango',h:26,f:5,c:7},{e:'🥐',n:'Croissant',h:15,f:8,c:6},{e:'🍩',n:'Rosquinha',h:16,f:14,c:7}];
function buildFood(){var g=document.getElementById('fg'),h='';for(var i=0;i<foods.length;i++){var f=foods[i];h+='<div class="fi" data-fi="'+i+'"><div>'+f.e+'</div><div class="fn">'+f.n+'</div><div class="fp">🪙'+f.c+'</div></div>'}g.innerHTML=h;g.querySelectorAll('.fi').forEach(function(el){var fi=parseInt(el.dataset.fi);el.addEventListener('touchstart',function(e){startDrag(e,fi,'food')},{passive:false});el.addEventListener('mousedown',function(e){startDrag(e,fi,'food')})})}

/* ===== BANHO ===== */
var bathItems=[{e:'🧴',n:'Shampoo',clean:25,snd:'soap'},{e:'🧽',n:'Esponja',clean:20,snd:'soap'},{e:'🫧',n:'Bolha',clean:10,snd:'bath'},{e:'🪣',n:'Balde',clean:15,snd:'bath'},{e:'🪥',n:'Escova',clean:20,snd:'soap'}];
function buildBath(){var g=document.getElementById('bath-items'),h='<div class="bath-hint" style="color:var(--t);font-size:11px;padding:6px 10px;background:rgba(78,205,196,.08);border-radius:8px;margin-bottom:8px;text-align:center">💡 Toque no <b>sabonete</b> e no <b>botao ON/OFF</b> do chuveiro no cenario!</div>';for(var i=0;i<bathItems.length;i++){var b=bathItems[i];h+='<div class="fi" data-bi="'+i+'"><div>'+b.e+'</div><div class="fn">'+b.n+'</div><div class="fp" style="color:var(--t)">+'+b.clean+'%</div></div>'}g.innerHTML=h;g.querySelectorAll('.fi').forEach(function(el){var bi=parseInt(el.dataset.bi);el.addEventListener('touchstart',function(e){startDrag(e,bi,'bath')},{passive:false});el.addEventListener('mousedown',function(e){startDrag(e,bi,'bath')})})}

/* ===== DRAG ===== */
var dc=document.getElementById('dc'),dragTarget=document.getElementById('drag-target'),dragging=false,dragType='',dragIdx=-1;
function startDrag(e,idx,type){e.preventDefault();initAudio();dragging=true;dragType=type;dragIdx=idx;var item=type==='food'?foods[idx]:type==='bath'?bathItems[idx]:pots[idx];dc.textContent=item.e;dc.style.display='block';dc.style.transform='scale(1.25)';moveDrag(e);dragTarget.classList.add('show')}
function moveDrag(e){if(!dragging)return;e.preventDefault();var t=e.touches?e.touches[0]:e;dc.style.left=(t.clientX-22)+'px';dc.style.top=(t.clientY-22)+'px'}
function endDrag(e){if(!dragging)return;dragging=false;dc.style.display='none';dc.style.transform='scale(1)';dragTarget.classList.remove('show');var t=e.changedTouches?e.changedTouches[0]:e;var r=cvs.getBoundingClientRect();if(t.clientX>r.left&&t.clientX<r.right&&t.clientY>r.top&&t.clientY<r.bottom){if(dragType==='food')feedPou(dragIdx);else if(dragType==='bath')bathPou(dragIdx);else if(dragType==='potion')usePotion(dragIdx)}dragType='';dragIdx=-1}
document.addEventListener('touchmove',moveDrag,{passive:false});document.addEventListener('mousemove',moveDrag);document.addEventListener('touchend',endDrag);document.addEventListener('mouseup',endDrag);
function feedPou(fi){var f=foods[fi];if(S.coins<f.c){toast('Sem moedas!');return}S.coins-=f.c;S.hunger=Math.min(100,S.hunger+f.h);S.fun=Math.min(100,S.fun+f.f);S.feedC++;squish=1;aState='eating';aTimer=30;mouthOpen=1;sndEat();gainXP(5);showSp(f.e+' Delicia!');toast(f.e+' '+f.n+'!');var r=cvs.getBoundingClientRect();particle(PX+r.left,PY+r.top-PS*.25,f.e);cvs.classList.add('chomping');setTimeout(function(){cvs.classList.remove('chomping')},400);updateUI();save()}
function bathPou(bi){var b=bathItems[bi];S.clean=Math.min(100,S.clean+b.clean);S.bathC++;squish=1;aState='eating';aTimer=20;mouthOpen=.5;if(b.snd==='shower')sndShower();else if(b.snd==='soap')sndSoap();else sndBath();gainXP(5);showSp(b.e+' Limpo!');toast(b.e+' '+b.n+'! +'+b.clean+'% limpo');for(var i=0;i<8;i++)bubbles.push({x:PX-35+Math.random()*70,y:PY+20,r:3+Math.random()*6,sp:.5+Math.random()*1.2,life:45+Math.random()*35,ml:80,off:Math.random()*6.28});var r=cvs.getBoundingClientRect();particle(PX+r.left,PY+r.top-PS*.25,'✨');updateUI();save()}

/* ===== MINIGAMES ===== */
var gc=document.getElementById('gc'),gx=gc.getContext('2d'),gRun=false,gLoop=null,gCur=null,gSc=0;
function launchGame(n){initAudio();document.getElementById('gov').classList.add('on');gSc=0;gRun=true;gCur=n;document.getElementById('gsc').textContent='0';if(gLoop)cancelAnimationFrame(gLoop);S.energy=Math.max(0,S.energy-3);S.fun=Math.min(100,S.fun+3);updateUI();save();var fn={fooddrop:G_fooddrop,skyjump:G_skyjump,jetpou:G_jetpou,cliffjump:G_cliffjump,colortap:G_colortap,hilldrive:G_hilldrive,skyhop:G_skyhop,waterhop:G_waterhop,goal:G_goal,pool:G_pool,beachvolley:G_beachvolley,matchtap:G_matchtap,poupopper:G_poupopper,freefall:G_freefall,cloudpass:G_cloudpass,findpou:G_findpou,memory:G_memory,tictacpou:G_tictacpou,fourpous:G_fourpous,goldrush:G_goldrush,herorun:G_herorun,timerush:G_timerush,snakerun:G_snakerun,fruitninja:G_fruitninja,flappy:G_flappy,connectpipes:G_connectpipes,brickbreak:G_brickbreak};if(fn[n])fn[n]()}
function endGame(){gRun=false;if(gLoop)cancelAnimationFrame(gLoop);document.getElementById('gov').classList.remove('on');gc.onclick=gc.ontouchstart=gc.ontouchmove=gc.ontouchend=gc.onmousemove=null;if(gSc>0){sndWin();var c=Math.floor(gSc/8)+1;earn(c);gainXP(gSc+3);S.gameW++;if(!S.hi[gCur]||gSc>S.hi[gCur])S.hi[gCur]=gSc;toast('Fim! '+gSc+' pts +'+c+' moedas')}else sndLose();updateUI();save()}
function restartGame(){if(gCur)launchGame(gCur)}
function dMP(x,y,sz){gx.save();gx.translate(x,y);gx.fillStyle='#1a3a6a';gx.beginPath();gx.ellipse(0,0,sz*.4,sz*.55,0,0,Math.PI*2);gx.fill();gx.fillStyle='#E8EDF2';gx.beginPath();gx.ellipse(0,sz*.1,sz*.22,sz*.35,0,0,Math.PI*2);gx.fill();gx.restore()}
function cGC(){gx.fillStyle='#0D1117';gx.fillRect(0,0,320,440)}

function G_fooddrop(){var W=320,H=440,px=W/2,it=[],t=0,ms=0,gd=['🍎','🍌','🍓','🍇','🍕','🍔','🐟','🍊'],bd=['💣','🪨'];gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();px=Math.max(15,Math.min(W-15,e.touches[0].clientX-r.left))};gc.ontouchstart=gc.ontouchmove;gc.onmousemove=function(e){var r=gc.getBoundingClientRect();px=Math.max(15,Math.min(W-15,e.clientX-r.left))};(function f(){if(!gRun){gc.ontouchmove=gc.ontouchstart=gc.onmousemove=null;return}t++;var rt=Math.max(18,30-t*.008);if(t%Math.floor(rt)===0){var b=Math.random()<.18;it.push({x:20+Math.random()*(W-40),y:-20,e:b?bd[0|Math.random()*2]:gd[0|Math.random()*8],bad:b,sp:1.5+Math.random()*.7+t*.002})}cGC();dMP(px,H-25,40);var ni=[];for(var i=0;i<it.length;i++){var o=it[i];o.y+=2.2*o.sp;gx.font='24px serif';gx.textAlign='center';gx.fillText(o.e,o.x,o.y);if(o.y>H-48&&Math.abs(o.x-px)<28){if(o.bad){gSc=Math.max(0,gSc-15);ms++;sndLose()}else{gSc+=10;earn(1);sndGP()}document.getElementById('gsc').textContent=gSc}else if(o.y<H+20)ni.push(o);else if(!o.bad)ms++}it=ni;if(ms>=5){toast('Errou muita comida!');endGame();return}gx.fillStyle='#4ECDC4';gx.font='bold 12px Nunito';gx.textAlign='left';gx.fillText('Pts: '+gSc,10,20);gx.fillStyle='#EF5350';gx.fillText('Erros: '+ms+'/5',10,36);gLoop=requestAnimationFrame(f)})()}
function G_skyjump(){var W=320,H=440,py=300,pvy=0,px=W/2,pvx=0,pl=[],cy=0,t=0,ks={},tx=null;for(var i=0;i<8;i++)pl.push({x:Math.random()*(W-50),y:55+i*50,w:50+Math.random()*15,mv:i>3,dx:i>3?(.4+Math.random())*(Math.random()>.5?1:-1):0});function kd(e){ks[e.key]=true;if(e.key===' ')e.preventDefault()}function ku(e){ks[e.key]=false}document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);gc.ontouchstart=function(e){e.preventDefault();tx=e.touches[0].clientX};gc.ontouchmove=function(e){e.preventDefault();if(tx!==null){pvx+=(e.touches[0].clientX-tx)*.15;tx=e.touches[0].clientX}};gc.ontouchend=function(){tx=null};(function f(){if(!gRun){document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);gc.ontouchstart=gc.ontouchmove=gc.ontouchend=null;return}t++;if(ks.ArrowLeft||ks.a)pvx-=.9;if(ks.ArrowRight||ks.d)pvx+=.9;pvx*=.87;pvy+=.38;py+=pvy;px+=pvx;if(px<-10)px=W+10;if(px>W+10)px=-10;cGC();for(var i=0;i<pl.length;i++){var p=pl[i],ry=p.y-cy;if(p.mv)p.x+=p.dx;if(p.x<0||p.x+p.w>W)p.dx*=-.8;gx.fillStyle=p.mv?'#FF6B9D':'#4ECDC4';gx.beginPath();gx.roundRect(p.x,ry,p.w,9,4);gx.fill();if(pvy>0&&py+12>ry&&py+12<ry+14&&px>p.x-5&&px<p.x+p.w+5){pvy=-10.5;sndGP()}}if(py-cy<H/2){cy-=3;for(var i=0;i<pl.length;i++)if(pl[i].y-cy>H+20){pl[i].y=cy-10-Math.random()*30;pl[i].x=Math.random()*(W-50);pl[i].mv=t>200;pl[i].dx=pl[i].mv?(.4+Math.random())*(Math.random()>.5?1:-1):0}gSc+=2;document.getElementById('gsc').textContent=gSc}dMP(px,py-cy,28);if(py-cy>H+30){toast('Caiu!');endGame();return}gLoop=requestAnimationFrame(f)})()}
function G_jetpou(){var W=320,H=440,py=H/2,px=60,ob=[],t=0,st=[];for(var i=0;i<30;i++)st.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.5,sp:Math.random()*2+1});gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();py=Math.max(15,Math.min(H-15,e.touches[0].clientY-r.top));px=Math.max(15,Math.min(W-15,e.touches[0].clientX-r.left))};gc.ontouchstart=gc.ontouchmove;gc.onmousemove=function(e){var r=gc.getBoundingClientRect();py=Math.max(15,Math.min(H-15,e.clientY-r.top));px=Math.max(15,Math.min(W-15,e.clientX-r.left))};(function f(){if(!gRun){gc.ontouchmove=gc.ontouchstart=gc.onmousemove=null;return}t++;var rt=Math.max(18,35-t*.012);if(t%Math.floor(rt)===0)ob.push({x:W+10,y:20+Math.random()*(H-40),w:16+Math.random()*14,h:28+Math.random()*28,sp:3.5+t*.003});gx.fillStyle='#0a0e1a';gx.fillRect(0,0,W,H);for(var i=0;i<st.length;i++){var s=st[i];s.x-=s.sp;if(s.x<0){s.x=W;s.y=Math.random()*H}gx.fillStyle='rgba(255,255,255,'+(s.s/3)+')';gx.beginPath();gx.arc(s.x,s.y,s.s,0,Math.PI*2);gx.fill()}for(var i=0;i<ob.length;i++){var o=ob[i];o.x-=o.sp;gx.fillStyle='#EF5350';gx.beginPath();gx.roundRect(o.x-o.w/2,o.y-o.h/2,o.w,o.h,4);gx.fill();if(Math.abs(px-o.x)<o.w/2+10&&Math.abs(py-o.y)<o.h/2+10){toast('Bateu!');endGame();return}}ob=ob.filter(function(o){return o.x>-30});gx.save();gx.translate(px,py);dMP(0,0,28);gx.fillStyle='#FF6B35';gx.beginPath();gx.moveTo(-8,8);gx.lineTo(-16-Math.random()*4,12+Math.sin(t*.3)*4);gx.lineTo(-8,14);gx.closePath();gx.fill();gx.restore();gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gLoop=requestAnimationFrame(f)})()}
function G_cliffjump(){var W=320,H=440,px=W/2,py=H-80,pvy=0,cl=[],t=0,gr=true;for(var i=0;i<8;i++)cl.push({x:40+Math.random()*(W-80),y:340-i*55,w:55+Math.random()*35});function jmp(){if(gr){pvy=-11;gr=false;sndGP()}}gc.ontouchstart=function(e){e.preventDefault();jmp()};gc.onclick=jmp;(function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;pvy+=.45;py+=pvy;px=Math.max(15,Math.min(W-15,px));cGC();for(var i=0;i<cl.length;i++){var c=cl[i];gx.fillStyle='#4a5268';gx.beginPath();gx.roundRect(c.x-c.w/2,c.y,c.w,16,5);gx.fill();if(!gr&&pvy>0&&py>=c.y-8&&py<=c.y+12&&Math.abs(px-c.x)<c.w/2){pvy=0;gr=true;py=c.y-8;gSc+=15;sndGP();document.getElementById('gsc').textContent=gSc}}if(py>H+20){toast('Caiu!');endGame();return}dMP(px,py,28);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)})()}
function G_colortap(){var W=320,H=440,cls=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A'],cn=['Vermelho','Teal','Laranja','Roxo','Verde'],tg=0,bk=[];for(var i=0;i<12;i++)bk.push({x:18+(i%4)*76,y:65+Math.floor(i/4)*120,w:68,h:105,c:0|Math.random()*5});tg=0|Math.random()*5;var tl=20,t=0;function ht(mx,my){for(var i=0;i<bk.length;i++){var b=bk[i];if(mx>b.x&&mx<b.x+b.w&&my>b.y&&my<b.y+b.h){if(b.c===tg){gSc+=10;sndGP();bk[i].c=0|Math.random()*5;tg=0|Math.random()*5}else{gSc=Math.max(0,gSc-5);sndLose()}document.getElementById('gsc').textContent=gSc;break}}}gc.onclick=function(e){var r=gc.getBoundingClientRect();ht(e.clientX-r.left,e.clientY-r.top)};gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ht(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};(function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}t++;if(t%60===0){tl--;if(tl<=0){toast('Tempo!');endGame();return}}cGC();gx.fillStyle=cls[tg];gx.beginPath();gx.roundRect(W/2-50,8,100,26,12);gx.fill();gx.fillStyle='#fff';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText(cn[tg],W/2,26);gx.fillStyle='#8B949E';gx.fillText('Tempo: '+tl+'s',W/2,52);for(var i=0;i<bk.length;i++){var b=bk[i];gx.fillStyle=cls[b.c];gx.beginPath();gx.roundRect(b.x,b.y,b.w,b.h,10);gx.fill()}gLoop=requestAnimationFrame(f)})()}
function G_hilldrive(){var W=320,H=440,cx=W/2,cy=300,vl=0,tn=[],t=0,cn=[];for(var i=0;i<300;i++)tn.push(80+Math.sin(i*.05)*35+Math.sin(i*.12)*18+Math.sin(i*.02)*50);gc.ontouchstart=function(e){e.preventDefault();vl=-9};gc.ontouchend=function(){vl=0};gc.onmousedown=function(){vl=-9};gc.onmouseup=function(){vl=0};(function f(){if(!gRun){gc.ontouchstart=gc.ontouchend=gc.onmousedown=gc.onmouseup=null;return}t++;var sc=t*2;if(t%40===0)cn.push({x:W+10,y:tn[((W+sc)%300+300)%300]-25});vl+=.4;cy+=vl;var ti=((cx+sc)%300+300)%300;var ty=tn[ti];if(cy>ty-5){cy=ty-5;vl=0}if(cy>H+30){toast('Caiu!');endGame();return}cGC();gx.beginPath();gx.moveTo(0,H);for(var i=0;i<=W;i+=2){var idx=((i+sc)%300+300)%300;gx.lineTo(i,tn[idx])}gx.lineTo(W,H);gx.closePath();gx.fillStyle='#1a3a2e';gx.fill();for(var i=cn.length-1;i>=0;i--){var c=cn[i];c.x-=2;gx.font='14px serif';gx.textAlign='center';gx.fillText('🪙',c.x,c.y);if(Math.abs(c.x-cx)<18&&Math.abs(c.y-cy)<18){gSc+=5;earn(1);sndGP();cn.splice(i,1);document.getElementById('gsc').textContent=gSc}else if(c.x<-20)cn.splice(i,1)}gx.fillStyle='#EF5350';gx.beginPath();gx.roundRect(cx-10,cy-18,20,18,4);gx.fill();gSc++;if(t%10===0)document.getElementById('gsc').textContent=gSc;gLoop=requestAnimationFrame(f)})()}
function G_skyhop(){var W=320,H=440,py=H-60,px=W/2,cd=[],t=0;for(var i=0;i<6;i++)cd.push({x:Math.random()*(W-50),y:H-70-i*70,w:50+Math.random()*25,dr:Math.random()>.5?1:-1,sp:.5+Math.random()*.8});gc.ontouchstart=function(e){e.preventDefault();py-=65;sndGP()};gc.onclick=function(){py-=65;sndGP()};(function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;py+=2.5;for(var i=0;i<cd.length;i++){var c=cd[i];c.x+=c.dr*c.sp;if(c.x<0||c.x+c.w>W)c.dr*=-1;if(py>=c.y-10&&py<=c.y+8&&px>c.x&&px<c.x+c.w){py=c.y-10;gSc+=5;sndGP();document.getElementById('gsc').textContent=gSc}}if(py>H+20){toast('Caiu!');endGame();return}cGC();for(var i=0;i<cd.length;i++){var c=cd[i];gx.fillStyle='rgba(255,255,255,.15)';gx.beginPath();gx.ellipse(c.x+c.w/2,c.y,c.w/2,12,0,0,Math.PI*2);gx.fill()}dMP(px,py,26);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)})()}
function G_waterhop(){var W=320,H=440,py=H-60,px=W/2,lg=[],t=0;for(var i=0;i<6;i++)lg.push({x:Math.random()*W,y:H-60-i*65,w:45+Math.random()*25,sp:(.4+Math.random()*.8)*(Math.random()>.5?1:-1)});gc.ontouchstart=function(e){e.preventDefault();py-=60;sndGP()};gc.onclick=function(){py-=60;sndGP()};(function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;py+=2;for(var i=0;i<lg.length;i++){var l=lg[i];l.x+=l.sp;if(l.x<-l.w)l.x=W;if(l.x>W)l.x=-l.w;if(py>=l.y-8&&py<=l.y+8&&px>l.x&&px<l.x+l.w){py=l.y-8;gSc+=5;sndGP();document.getElementById('gsc').textContent=gSc}}if(py>H+20){toast('Afundou!');endGame();return}cGC();for(var i=0;i<lg.length;i++){var l=lg[i];gx.fillStyle='#6D4C41';gx.beginPath();gx.roundRect(l.x,l.y,l.w,12,6);gx.fill()}dMP(px,py,26);gx.fillStyle='#42A5F5';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)})()}
function G_goal(){var W=320,H=440,bx=W/2,by=H-60,bvx=0,bvy=0,kk=false,gl=0;gc.ontouchstart=function(e){e.preventDefault();if(!kk){kk=true;bvy=-13;bvx=(Math.random()-.3)*6;sndGP()}};gc.onclick=function(){if(!kk){kk=true;bvy=-13;bvx=(Math.random()-.3)*6;sndGP()}};(function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}if(kk){bvy+=.3;bx+=bvx;by+=bvy;if(bx>W-45&&bx<W+10&&by>30&&by<130){gSc+=25;earn(2);gl++;sndWin();toast('GOL! '+gl);document.getElementById('gsc').textContent=gSc;kk=false;bx=W/2;by=H-60}if(by>H+20||bx<-20||bx>W+20){kk=false;bx=W/2;by=H-60}}cGC();gx.fillStyle='#1a5a2e';gx.fillRect(0,0,W,H);gx.strokeStyle='rgba(255,255,255,.3)';gx.lineWidth=2;gx.strokeRect(W-45,30,45,100);gx.font='28px serif';gx.textAlign='center';gx.fillText('⚽',bx,by);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.fillText('TOQUE para chutar! Gols: '+gl,W/2,20);gLoop=requestAnimationFrame(f)})()}
function G_pool(){var W=320,H=440,bl=[],ax=W/2,ay=H/2,sh=false;var bc=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A','#FF6B9D','#42A5F5','#FFE66D'];for(var i=0;i<8;i++)bl.push({x:80+Math.random()*160,y:70+Math.random()*140,vx:0,vy:0,r:10,c:bc[i],out:false});var pk=[[18,18],[W-18,18],[18,H-18],[W-18,H-18],[W/2,12],[W/2,H-12]];gc.onmousemove=function(e){var r=gc.getBoundingClientRect();ax=e.clientX-r.left;ay=e.clientY-r.top};gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();ax=e.touches[0].clientX-r.left;ay=e.touches[0].clientY-r.top};function sht(){if(sh)return;sh=true;sndGP();var dx=ax-W/2,dy=ay-H/2,d=Math.sqrt(dx*dx+dy*dy)||1;for(var i=0;i<bl.length;i++)if(!bl[i].out){var bx2=bl[i].x-W/2,by2=bl[i].y-H/2,bd=Math.sqrt(bx2*bx2+by2*by2)||1;bl[i].vx=dx/d*6*(1/(bd/50+1));bl[i].vy=dy/d*6*(1/(bd/50+1))}setTimeout(function(){sh=false},500)}gc.onclick=sht;gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ax=e.touches[0].clientX-r.left;ay=e.touches[0].clientY-r.top;sht()};(function f(){if(!gRun){gc.onclick=gc.onmousemove=gc.ontouchmove=gc.ontouchstart=null;return}cGC();gx.fillStyle='#0a3a1a';gx.fillRect(0,0,W,H);for(var p=0;p<pk.length;p++){gx.beginPath();gx.arc(pk[p][0],pk[p][1],12,0,Math.PI*2);gx.fillStyle='#000';gx.fill()}for(var i=0;i<bl.length;i++){var b=bl[i];if(b.out)continue;b.x+=b.vx;b.y+=b.vy;b.vx*=.96;b.vy*=.96;if(Math.abs(b.vx)<.01)b.vx=0;if(Math.abs(b.vy)<.01)b.vy=0;if(b.x<b.r+10||b.x>W-b.r-10){b.vx*=-.85;b.x=Math.max(b.r+10,Math.min(W-b.r-10,b.x))}if(b.y<b.r+10||b.y>H-b.r-10){b.vy*=-.85;b.y=Math.max(b.r+10,Math.min(H-b.r-10,b.y))}for(var p=0;p<pk.length;p++)if(Math.abs(b.x-pk[p][0])<14&&Math.abs(b.y-pk[p][1])<14){b.out=true;gSc+=15;earn(1);sndGP();document.getElementById('gsc').textContent=gSc;break}for(var j=i+1;j<bl.length;j++){var b2=bl[j];if(b2.out)continue;var dx=b.x-b2.x,dy=b.y-b2.y,d=Math.sqrt(dx*dx+dy*dy);if(d<b.r+b2.r&&d>0){var nx=dx/d,ny=dy/d,rv=(b.vx-b2.vx)*nx+(b.vy-b2.vy)*ny;b.vx-=rv*nx;b.vy-=rv*ny;b2.vx+=rv*nx;b2.vy+=rv*ny;var ov=(b.r+b2.r-d)/2;b.x+=nx*ov;b.y+=ny*ov;b2.x-=nx*ov;b2.y-=ny*ov}}}for(var i=0;i<bl.length;i++)if(!bl[i].out){gx.beginPath();gx.arc(bl[i].x,bl[i].y,bl[i].r,0,Math.PI*2);gx.fillStyle=bl[i].c;gx.fill()}if(!sh){gx.strokeStyle='rgba(255,255,255,.25)';gx.lineWidth=1;gx.setLineDash([3,3]);gx.beginPath();gx.moveTo(W/2,H/2);gx.lineTo(ax,ay);gx.stroke();gx.setLineDash([])}var dn=true;for(var i=0;i<bl.length;i++)if(!bl[i].out)dn=false;if(dn){toast('Todas na cacapa!');endGame();return}gLoop=requestAnimationFrame(f)})()}
function G_beachvolley(){var W=320,H=440,mx=W/4,my=H-50,bx=W/2,by=H/2,bvx=2,bvy=-4,ox=W*3/4,t=0;gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();mx=Math.max(15,Math.min(W/2-15,e.touches[0].clientX-r.left))};gc.onmousemove=function(e){var r=gc.getBoundingClientRect();mx=Math.max(15,Math.min(W/2-15,e.clientX-r.left))};(function f(){if(!gRun){gc.ontouchmove=gc.onmousemove=null;return}t++;bx+=bvx;by+=bvy;bvy+=.15;ox+=(bx>W/2?bx:W*.75-ox)*.05;if(by>H-55&&bx>W/2){bvy=-6-Math.random()*2;bvx=(Math.random()-.5)*4+1;sndGP()}if(by>H-55&&Math.abs(bx-mx)<25){bvy=-6-Math.random()*2;bvx=(bx-W/2)*.03+(Math.random()-.5)*3;gSc+=5;sndGP();document.getElementById('gsc').textContent=gSc}if(bx<10||bx>W-10)bvx*=-1;if(by<10)bvy=Math.abs(bvy);if(by>H+10){toast('Caiu!');endGame();return}cGC();gx.fillStyle='#1a3a1a';gx.fillRect(0,0,W,H);gx.fillStyle='#D4A76A';gx.fillRect(0,H-25,W,25);gx.strokeStyle='rgba(255,255,255,.2)';gx.lineWidth=2;gx.beginPath();gx.moveTo(W/2,0);gx.lineTo(W/2,H-25);gx.stroke();gx.font='22px serif';gx.textAlign='center';gx.fillText('🏐',bx,by);dMP(mx,my-10,24);gx.save();gx.translate(ox,my-10);gx.fillStyle='#EF5350';gx.beginPath();gx.ellipse(0,0,10,14,0,0,Math.PI*2);gx.fill();gx.fillStyle='#E8EDF2';gx.beginPath();gx.ellipse(0,2,6,8,0,0,Math.PI*2);gx.fill();gx.restore();gLoop=requestAnimationFrame(f)})()}
function G_matchtap(){var W=320,H=440,cls=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A'],gd=[],SZ=38,RO=10,CO=8;for(var r=0;r<RO;r++){gd[r]=[];for(var c=0;c<CO;c++)gd[r][c]=0|Math.random()*5}var ox=(W-CO*SZ)/2,oy=45;function ht(mx,my){var c2=0|((mx-ox)/SZ),r2=0|((my-oy)/SZ);if(r2<0||r2>=RO||c2<0||c2>=CO)return;var cl=gd[r2][c2],md=[[r2,c2]],q=[[r2,c2]],vs={};vs[r2+','+c2]=true;while(q.length){var cu=q.shift(),nb=[[cu[0]-1,cu[1]],[cu[0]+1,cu[1]],[cu[0],cu[1]-1],[cu[0],cu[1]+1]];for(var n=0;n<4;n++){var nr=nb[n][0],nc=nb[n][1],ky=nr+','+nc;if(nr>=0&&nr<RO&&nc>=0&&nc<CO&&!vs[ky]&&gd[nr][nc]===cl){vs[ky]=true;md.push([nr,nc]);q.push([nr,nc])}}}if(md.length>=3){gSc+=md.length*2;sndGP();document.getElementById('gsc').textContent=gSc;for(var m=0;m<md.length;m++)gd[md[m][0]][md[m][1]]=-1;for(var c3=0;c3<CO;c3++){var wr=RO-1;for(var r3=RO-1;r3>=0;r3--)if(gd[r3][c3]!==-1){if(wr!==r3){gd[wr][c3]=gd[r3][c3];gd[r3][c3]=-1}wr--}for(var r3=wr;r3>=0;r3--)gd[r3][c3]=0|Math.random()*5}}}gc.onclick=function(e){var r=gc.getBoundingClientRect();ht(e.clientX-r.left,e.clientY-r.top)};gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ht(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};(function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}cGC();for(var r=0;r<RO;r++)for(var c=0;c<CO;c++)if(gd[r][c]>=0){gx.fillStyle=cls[gd[r][c]];gx.beginPath();gx.roundRect(ox+c*SZ+1,oy+r*SZ+1,SZ-2,SZ-2,6);gx.fill()}gLoop=requestAnimationFrame(f)})()}
function G_poupopper(){var W=320,H=440,gd=[],SZ=30,RO=13,CO=10,ac=5;var cls=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A'];for(var r=0;r<RO;r++){gd[r]=[];for(var c=0;c<CO;c++)gd[r][c]=r<5?0|Math.random()*5:-1}var ox=(W-CO*SZ)/2,oy=8;function sht2(){for(var r2=RO-1;r2>=0;r2--)if(gd[r2][ac]>=0){gd[r2][ac]=-1;break}for(var r=0;r<RO-1;r++)for(var c=0;c<CO;c++)if(gd[r][c]>=0){var nb=[[r+1,c-1],[r+1,c],[r+1,c+1]];for(var n=0;n<3;n++){var nr=nb[n][0],nc=nb[n][1];if(nr>=0&&nr<RO&&nc>=0&&nc<CO&&gd[nr][nc]===gd[r][c]){gd[r][c]=-1;gd[nr][nc]=-1;gSc+=5;sndGP();document.getElementById('gsc').textContent=gSc}}}}gc.onclick=sht2;gc.onmousemove=function(e){var r=gc.getBoundingClientRect();ac=Math.max(0,Math.min(CO-1,0|((e.clientX-r.left-ox)/SZ)))};gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();ac=Math.max(0,Math.min(CO-1,0|((e.touches[0].clientX-r.left-ox)/SZ)))};gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ac=Math.max(0,Math.min(CO-1,0|((e.touches[0].clientX-r.left-ox)/SZ)));sht2()};(function f(){if(!gRun){gc.onclick=gc.onmousemove=gc.ontouchmove=gc.ontouchstart=null;return}cGC();for(var r=0;r<RO;r++)for(var c=0;c<CO;c++)if(gd[r][c]>=0){gx.fillStyle=cls[gd[r][c]];gx.beginPath();gx.arc(ox+c*SZ+SZ/2,oy+r*SZ+SZ/2,SZ/2-2,0,Math.PI*2);gx.fill()}gx.strokeStyle='rgba(255,255,255,.2)';gx.lineWidth=1;gx.setLineDash([3,3]);gx.beginPath();gx.moveTo(ox+ac*SZ+SZ/2,oy);gx.lineTo(ox+ac*SZ+SZ/2,H);gx.stroke();gx.setLineDash([]);gLoop=requestAnimationFrame(f)})()}
function G_freefall(){var W=320,H=440,px=W/2,py=30,cd=[],t=0;for(var i=0;i<20;i++)cd.push({x:Math.random()*W,y:50+i*22,w:28+Math.random()*40,h:12+Math.random()*12,gr:Math.random()<.25});gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();px=Math.max(15,Math.min(W-15,e.touches[0].clientX-r.left))};gc.onmousemove=function(e){var r=gc.getBoundingClientRect();px=Math.max(15,Math.min(W-15,e.clientX-r.left))};(function f(){if(!gRun){gc.ontouchmove=gc.onmousemove=null;return}t++;py+=2.5;for(var i=0;i<cd.length;i++){var c=cd[i];c.y-=2.5;if(c.y<-30){c.y=H+30;c.x=Math.random()*W;c.gr=Math.random()<.25}if(c.gr&&Math.abs(px-c.x-c.w/2)<c.w/2+10&&Math.abs(py-c.y-c.h/2)<c.h/2+10){toast('Bateu!');endGame();return}}gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gx.fillStyle='#3a7abf';gx.fillRect(0,0,W,H);for(var i=0;i<cd.length;i++){var c=cd[i];gx.fillStyle=c.gr?'rgba(120,120,120,.5)':'rgba(255,255,255,.35)';gx.beginPath();gx.ellipse(c.x+c.w/2,c.y+c.h/2,c.w/2,c.h/2,0,0,Math.PI*2);gx.fill()}dMP(px,py,26);gLoop=requestAnimationFrame(f)})()}
function G_cloudpass(){var W=320,H=440,py=H/2,px=60,cd=[],t=0;for(var i=0;i<16;i++)cd.push({x:W+Math.random()*250,y:Math.random()*(H-40)+20,w:35+Math.random()*50,h:18+Math.random()*14});gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();py=Math.max(15,Math.min(H-15,e.touches[0].clientY-r.top))};gc.onmousemove=function(e){var r=gc.getBoundingClientRect();py=Math.max(15,Math.min(H-15,e.clientY-r.top))};(function f(){if(!gRun){gc.ontouchmove=gc.onmousemove=null;return}t++;var sp=2.8+t*.003;for(var i=0;i<cd.length;i++){var c=cd[i];c.x-=sp;if(c.x<-60){c.x=W+50+Math.random()*100;c.y=Math.random()*(H-40)+20}if(Math.abs(px-c.x-c.w/2)<c.w/2+10&&Math.abs(py-c.y-c.h/2)<c.h/2+10){toast('Bateu!');endGame();return}}gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gx.fillStyle='#5a9fd4';gx.fillRect(0,0,W,H);for(var i=0;i<cd.length;i++){var c=cd[i];gx.fillStyle='rgba(255,255,255,.45)';gx.beginPath();gx.ellipse(c.x+c.w/2,c.y+c.h/2,c.w/2,c.h/2,0,0,Math.PI*2);gx.fill()}dMP(px,py,26);gLoop=requestAnimationFrame(f)})()}
function G_findpou(){var W=320,H=440,cx=[W/2-55,W/2,W/2+55],cy=H/2,pu=0,ph='show',sT=0,hT=0;function shf(){var a=0|Math.random()*3,b;do{b=0|Math.random()*3}while(b===a);var tmp=cx[a];cx[a]=cx[b];cx[b]=tmp}function hg(mx){if(ph!=='guess')return;for(var i=0;i<3;i++)if(Math.abs(mx-cx[i])<30){if(i===pu){gSc+=20;sndWin();document.getElementById('gsc').textContent=gSc;toast('Acertou!')}else{gSc=Math.max(0,gSc-5);sndLose();document.getElementById('gsc').textContent=gSc}ph='show';sT=0;pu=0|Math.random()*3;break}}gc.onclick=function(e){var r=gc.getBoundingClientRect();hg(e.clientX-r.left)};gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();hg(e.touches[0].clientX-r.left)};(function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}if(ph==='show'){sT++;if(sT>80){ph='hide';hT=0}}else if(ph==='hide'){hT++;if(hT>30){ph='swap';sT=0}}else if(ph==='swap'){sT++;if(sT%15===0)shf();if(sT>90)ph='guess'}cGC();if(ph==='show'||ph==='guess'){gx.font='28px serif';gx.textAlign='center';gx.fillText('🐧',cx[pu],cy+8)}for(var i=0;i<3;i++)if(ph!=='show'){gx.fillStyle='rgba(78,205,196,.2)';gx.beginPath();gx.moveTo(cx[i],cy-30);gx.lineTo(cx[i]-24,cy+20);gx.lineTo(cx[i]+24,cy+20);gx.closePath();gx.fill();gx.strokeStyle='rgba(78,205,196,.5)';gx.lineWidth=2;gx.stroke()}gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText(ph==='guess'?'Onde esta?':ph==='show'?'Memorize!':'Observem...',W/2,35);gLoop=requestAnimationFrame(f)})()}
function G_memory(){var W=320,H=440,em=['🐧','🌟','🎈','🍕','🎮','🦄','🌈','🔥'],cd=[],sl=[],lk=false,mv=0;var al=em.concat(em);for(var i=al.length-1;i>0;i--){var j=0|Math.random()*(i+1);var tmp=al[i];al[i]=al[j];al[j]=tmp}for(var i=0;i<al.length;i++)cd.push({e:al[i],x:(i%4)*73+16,y:0|Math.floor(i/4)*88+50,fl:false,mt:false});function hc(mx,my){if(lk)return;for(var i=0;i<cd.length;i++){var c=cd[i];if(mx>c.x&&mx<c.x+60&&my>c.y&&my<c.y+70&&!c.fl&&!c.mt){c.fl=true;sndClick();sl.push(c);mv++;if(sl.length===2){lk=true;if(sl[0].e===sl[1].e){sl[0].mt=true;sl[1].mt=true;sl=[];lk=false;gSc+=20;earn(1);sndGP();document.getElementById('gsc').textContent=gSc;var dn=true;for(var j=0;j<cd.length;j++)if(!cd[j].mt)dn=false;if(dn){toast('Parabens!');setTimeout(endGame,500)}}else{(function(s){setTimeout(function(){s[0].fl=false;s[1].fl=false;sl=[];lk=false},700)})(sl)}}break}}}gc.onclick=function(e){var r=gc.getBoundingClientRect();hc(e.clientX-r.left,e.clientY-r.top)};gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();hc(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};(function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}cGC();gx.fillStyle='#8B949E';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Mov: '+mv+'  Pts: '+gSc,W/2,28);for(var i=0;i<cd.length;i++){var c=cd[i];if(c.mt){gx.fillStyle='rgba(76,175,80,.15)';gx.beginPath();gx.roundRect(c.x,c.y,60,70,7);gx.fill();gx.font='24px serif';gx.textAlign='center';gx.fillText(c.e,c.x+30,c.y+44)}else if(c.fl){gx.fillStyle='rgba(78,205,196,.15)';gx.beginPath();gx.roundRect(c.x,c.y,60,70,7);gx.fill();gx.font='24px serif';gx.textAlign='center';gx.fillText(c.e,c.x+30,c.y+44)}else{gx.fillStyle='rgba(255,255,255,.05)';gx.beginPath();gx.roundRect(c.x,c.y,60,70,7);gx.fill();gx.strokeStyle='rgba(78,205,196,.3)';gx.lineWidth=1.5;gx.stroke();gx.font='18px serif';gx.textAlign='center';gx.fillText('?',c.x+30,c.y+42)}}gLoop=requestAnimationFrame(f)})()}
function G_tictacpou(){var W=320,H=440,bd=[0,0,0,0,0,0,0,0,0],tn=1,ov=false,SZ=82,ox=(W-SZ*3)/2,oy=70;function ck(){var w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(var i=0;i<8;i++)if(bd[w[i][0]]&&bd[w[i][0]]===bd[w[i][1]]&&bd[w[i][1]]===bd[w[i][2]])return bd[w[i][0]];return 0}function ai(){var em=[];for(var i=0;i<9;i++)if(!bd[i])em.push(i);if(!em.length)return;for(var i=0;i<em.length;i++){bd[em[i]]=2;if(ck()===2){bd[em[i]]=0;return em[i]}bd[em[i]]=0}for(var i=0;i<em.length;i++){bd[em[i]]=1;if(ck()===1){bd[em[i]]=0;return em[i]}bd[em[i]]=0}if(!bd[4])return 4;return em[0|Math.random()*em.length]}function hb(mx,my){if(ov||tn!==1)return;var c=0|((mx-ox)/SZ),r=0|((my-oy)/SZ);if(c>=0&&c<3&&r>=0&&r<3&&!bd[r*3+c]){bd[r*3+c]=1;sndClick();if(ck()){gSc+=20;sndWin();document.getElementById('gsc').textContent=gSc;toast('Venceu!');ov=true}else{var fl=true;for(var i=0;i<9;i++)if(!bd[i])fl=false;if(fl){toast('Empate!');ov=true}else{tn=2;setTimeout(function(){var m=ai();if(m!==undefined){bd[m]=2;if(ck()){sndLose();toast('CPU venceu!');ov=true}else tn=1}},350)}}}}gc.onclick=function(e){var r=gc.getBoundingClientRect();hb(e.clientX-r.left,e.clientY-r.top)};gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();hb(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};(function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}cGC();gx.fillStyle='#4ECDC4';gx.font='bold 13px Nunito';gx.textAlign='center';gx.fillText(ov?'Fim!':(tn===1?'Sua vez (X)':'CPU...'),W/2,35);for(var r=0;r<3;r++)for(var c=0;c<3;c++){var v=bd[r*3+c];gx.fillStyle='rgba(255,255,255,.04)';gx.beginPath();gx.roundRect(ox+c*SZ+2,oy+r*SZ+2,SZ-4,SZ-4,7);gx.fill();if(v===1){gx.strokeStyle='#4ECDC4';gx.lineWidth=3;gx.beginPath();gx.moveTo(ox+c*SZ+18,oy+r*SZ+18);gx.lineTo(ox+c*SZ+SZ-18,oy+r*SZ+SZ-18);gx.moveTo(ox+c*SZ+SZ-18,oy+r*SZ+18);gx.lineTo(ox+c*SZ+18,oy+r*SZ+SZ-18);gx.stroke()}else if(v===2){gx.strokeStyle='#FF6B9D';gx.lineWidth=3;gx.beginPath();gx.arc(ox+c*SZ+SZ/2,oy+r*SZ+SZ/2,SZ/2-18,0,Math.PI*2);gx.stroke()}}gLoop=requestAnimationFrame(f)})()}
function G_fourpous(){var W=320,H=440,gd=[],CO=7,RO=6,SZ=38,ox=(W-CO*SZ)/2,oy=55,tn=1,ov=false;for(var r=0;r<RO;r++){gd[r]=[];for(var c=0;c<CO;c++)gd[r][c]=0}function dp(co,p){for(var r=RO-1;r>=0;r--)if(!gd[r][co]){gd[r][co]=p;return r}return-1}function ck4(){for(var r=0;r<RO;r++)for(var c=0;c<CO-3;c++)if(gd[r][c]&&gd[r][c]===gd[r][c+1]&&gd[r][c+1]===gd[r][c+2]&&gd[r][c+2]===gd[r][c+3])return gd[r][c];for(var r=0;r<RO-3;r++)for(var c=0;c<CO;c++)if(gd[r][c]&&gd[r][c]===gd[r+1][c]&&gd[r+1][c]===gd[r+2][c]&&gd[r+2][c]===gd[r+3][c])return gd[r][c];for(var r=0;r<RO-3;r++)for(var c=0;c<CO-3;c++)if(gd[r][c]&&gd[r][c]===gd[r+1][c+1]&&gd[r+1][c+1]===gd[r+2][c+2]&&gd[r+2][c+2]===gd[r+3][c+3])return gd[r][c];for(var r=3;r<RO;r++)for(var c=0;c<CO-3;c++)if(gd[r][c]&&gd[r][c]===gd[r-1][c+1]&&gd[r-1][c+1]===gd[r-2][c+2]&&gd[r-2][c+2]===gd[r-3][c+3])return gd[r][c];return 0}function hc(mx){if(ov||tn!==1)return;var c=0|((mx-ox)/SZ);if(c>=0&&c<CO&&dp(c,1)>=0){sndClick();if(ck4()){gSc+=25;sndWin();document.getElementById('gsc').textContent=gSc;toast('Venceu!');ov=true}else{tn=2;setTimeout(function(){var em=[];for(var i=0;i<CO;i++)if(!gd[0][i])em.push(i);if(em.length){dp(em[0|Math.random()*em.length],2);if(ck4()){sndLose();toast('CPU venceu!');ov=true}else tn=1}},400)}}}gc.onclick=function(e){var r=gc.getBoundingClientRect();hc(e.clientX-r.left)};gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();hc(e.touches[0].clientX-r.left)};(function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}cGC();gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText(ov?'Fim!':(tn===1?'Sua vez':'CPU...'),W/2,25);for(var r=0;r<RO;r++)for(var c=0;c<CO;c++){var v=gd[r][c];gx.fillStyle='rgba(255,255,255,.03)';gx.beginPath();gx.roundRect(ox+c*SZ+1,oy+r*SZ+1,SZ-2,SZ-2,5);gx.fill();if(v){gx.fillStyle=v===1?'#4ECDC4':'#FF6B9D';gx.beginPath();gx.arc(ox+c*SZ+SZ/2,oy+r*SZ+SZ/2,SZ/2-4,0,Math.PI*2);gx.fill()}}gLoop=requestAnimationFrame(f)})()}
function G_goldrush(){var W=320,H=440,px=W/2,ln=1,lns=[H*.3,H*.5,H*.7],ob=[],cn=[],t=0,sp=3;gc.ontouchstart=function(e){e.preventDefault();var r=gc.getBoundingClientRect();var my=e.clientY-r.top;if(my<H/3&&ln>0)ln--;else if(my>H*2/3&&ln<2)ln++;else{var mx=e.clientX-r.left;if(mx<W/2&&ln>0)ln--;else if(mx>=W/2&&ln<2)ln++}};(function f(){if(!gRun){gc.ontouchstart=null;return}t++;sp=3+t*.003;var ty=lns[ln];px+=(W/2-px)*.15;if(t%22===0)ob.push({x:W+20,y:lns[0|Math.random()*3],w:30+Math.random()*20,h:30});if(t%16===0)cn.push({x:W+20,y:lns[0|Math.random()*3]});cGC();gx.fillStyle='#2a1a0a';gx.fillRect(0,0,W,H);for(var i=ob.length-1;i>=0;i--){ob[i].x-=sp;gx.fillStyle='#8B4513';gx.beginPath();gx.roundRect(ob[i].x-ob[i].w/2,ob[i].y-ob[i].h/2,ob[i].w,ob[i].h,4);gx.fill();if(Math.abs(ob[i].x-px)<ob[i].w/2+10&&Math.abs(ob[i].y-ty)<ob[i].h/2+10){toast('Bateu!');endGame();return}if(ob[i].x<-40)ob.splice(i,1)}for(var i=cn.length-1;i>=0;i--){cn[i].x-=sp;gx.font='16px serif';gx.textAlign='center';gx.fillText('🪙',cn[i].x,cn[i].y);if(Math.abs(cn[i].x-px)<18&&Math.abs(cn[i].y-ty)<18){gSc+=10;earn(1);sndGP();cn.splice(i,1);document.getElementById('gsc').textContent=gSc}else if(cn[i].x<-20)cn.splice(i,1)}dMP(px,ty,30);gx.fillStyle='#FFD700';gx.font='bold 12px Nunito';gx.textAlign='left';gx.fillText('🪙 '+gSc,10,20);gLoop=requestAnimationFrame(f)})()}
function G_herorun(){var W=320,H=440,px=W/2,ln=1,lns=[H*.3,H*.5,H*.7],ob=[],t=0,sp=3,bt=0;gc.ontouchstart=function(e){e.preventDefault();if(bt<=0){bt=30;sp=6}sndGP();var r=gc.getBoundingClientRect();var my=e.clientY-r.top;if(my<H/3&&ln>0)ln--;else if(my>H*2/3&&ln<2)ln++};(function f(){if(!gRun){gc.ontouchstart=null;return}t++;if(bt>0){bt--;sp=6}else sp=3+t*.002;var ty=lns[ln];px+=(W/2-px)*.15;if(t%20===0)ob.push({x:W+20,y:lns[0|Math.random()*3],w:25,h:25});cGC();gx.fillStyle='#1a0a2e';gx.fillRect(0,0,W,H);for(var i=ob.length-1;i>=0;i--){ob[i].x-=sp;gx.fillStyle='#4a1a6a';gx.beginPath();gx.roundRect(ob[i].x-ob[i].w/2,ob[i].y-ob[i].h/2,ob[i].w,ob[i].h,4);gx.fill();if(Math.abs(ob[i].x-px)<ob[i].w/2+10&&Math.abs(ob[i].y-ty)<ob[i].h/2+10){toast('Bateu!');endGame();return}if(ob[i].x<-30)ob.splice(i,1)}dMP(px,ty,30);if(bt>0){gx.fillStyle='rgba(160,80,255,.3)';gx.beginPath();gx.arc(px,ty,20,0,Math.PI*2);gx.fill()}gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gLoop=requestAnimationFrame(f)})()}
function G_timerush(){var W=320,H=440,px=W/2,ln=1,lns=[H*.3,H*.5,H*.7],ob=[],t=0,sp=3,er=0;var en=['Egito','Dinos','Oeste','Futuro'],ec=['rgba(200,170,50,.12)','rgba(50,150,50,.12)','rgba(150,100,50,.12)','rgba(50,50,200,.12)'],eo=['#C4A035','#2E7D32','#8D6E63','#1565C0'];gc.ontouchstart=function(e){e.preventDefault();var r=gc.getBoundingClientRect();var my=e.clientY-r.top;if(my<H/3&&ln>0)ln--;else if(my>H*2/3&&ln<2)ln++};(function f(){if(!gRun){gc.ontouchstart=null;return}t++;sp=3+t*.003;if(t%250===0)er=(er+1)%4;var ty=lns[ln];px+=(W/2-px)*.15;if(t%18===0)ob.push({x:W+20,y:lns[0|Math.random()*3],w:28,h:28});cGC();gx.fillStyle=ec[er];gx.fillRect(0,0,W,H);for(var i=ob.length-1;i>=0;i--){ob[i].x-=sp;gx.fillStyle=eo[er];gx.beginPath();gx.roundRect(ob[i].x-ob[i].w/2,ob[i].y-ob[i].h/2,ob[i].w,ob[i].h,4);gx.fill();if(Math.abs(ob[i].x-px)<ob[i].w/2+10&&Math.abs(ob[i].y-ty)<ob[i].h/2+10){toast('Bateu!');endGame();return}if(ob[i].x<-30)ob.splice(i,1)}dMP(px,ty,30);gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gx.fillStyle=er===0?'#FFD54F':er===1?'#66BB6A':er===2?'#FFB347':'#64B5F6';gx.font='bold 12px Nunito';gx.textAlign='left';gx.fillText(en[er]+' | Pts: '+gSc,10,20);gLoop=requestAnimationFrame(f)})()}
function G_snakerun(){var W=320,H=440,px=W/2,py=H/2,dr=0,sg=[{x:W/2,y:H/2}],fd={x:100+Math.random()*120,y:100+Math.random()*240},t=0,rt=8;gc.ontouchstart=function(e){e.preventDefault();var r=gc.getBoundingClientRect();var dx=e.touches[0].clientX-r.left-px,dy=e.touches[0].clientY-r.top-py;if(Math.abs(dx)>Math.abs(dy))dr=dx>0?0:2;else dr=dy>0?1:3};gc.onclick=function(e){var r=gc.getBoundingClientRect();var dx=e.clientX-r.left-px,dy=e.clientY-r.top-py;if(Math.abs(dx)>Math.abs(dy))dr=dx>0?0:2;else dr=dy>0?1:3};(function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;if(t%rt===0){var dx=[1,0,-1,0][dr],dy=[0,1,0,-1][dr];px+=dx*12;py+=dy*12;sg.unshift({x:px,y:py});if(Math.abs(px-fd.x)<14&&Math.abs(py-fd.y)<14){gSc+=10;sndGP();earn(1);fd={x:30+Math.random()*(W-60),y:30+Math.random()*(H-60)};if(rt>4)rt--}else sg.pop()}if(px<0||px>W||py<0||py>H){toast('Bateu!');endGame();return}for(var i=1;i<sg.length;i++)if(Math.abs(px-sg[i].x)<8&&Math.abs(py-sg[i].y)<8){toast('Bateu em si!');endGame();return}cGC();gx.font='16px serif';gx.textAlign='center';gx.fillText('🍎',fd.x,fd.y);for(var i=sg.length-1;i>=0;i--){var s=sg[i];gx.fillStyle=i===0?'#4ECDC4':'rgba(78,205,196,'+(1-i/sg.length*.6)+')';gx.beginPath();gx.arc(s.x,s.y,6,0,Math.PI*2);gx.fill()}document.getElementById('gsc').textContent=gSc;gLoop=requestAnimationFrame(f)})()}
function G_fruitninja(){var W=320,H=440,fr=[],t=0,ms=0,sl=[];var ft=[{e:'🍎',c:'#EF5350'},{e:'🍊',c:'#FF9800'},{e:'🍋',c:'#FFEB3B'},{e:'🍉',c:'#4CAF50'},{e:'🍇',c:'#9C27B0'}];function hs(mx,my){for(var i=fr.length-1;i>=0;i--){var f=fr[i];if(Math.abs(mx-f.x)<22&&Math.abs(my-f.y)<22&&!f.sl){f.sl=true;gSc+=10;sndGP();document.getElementById('gsc').textContent=gSc;for(var s=0;s<3;s++)sl.push({x:f.x+(Math.random()-.5)*24,y:f.y+(Math.random()-.5)*24,life:12,c:f.c});fr.splice(i,1);break}}}gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();hs(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};gc.onmousemove=function(e){var r=gc.getBoundingClientRect();hs(e.clientX-r.left,e.clientY-r.top)};(function f(){if(!gRun){gc.ontouchmove=gc.onmousemove=null;return}t++;if(t%25===0){var ft2=ft[0|Math.random()*ft.length];fr.push({x:40+Math.random()*(W-80),y:H+10,vy:-10-Math.random()*3,vx:(Math.random()-.5)*3,e:ft2.e,c:ft2.c,sl:false})}cGC();for(var i=sl.length-1;i>=0;i--){var s=sl[i];s.life--;if(s.life<=0){sl.splice(i,1);continue}gx.fillStyle=s.c;gx.globalAlpha=s.life/12;gx.font='14px serif';gx.textAlign='center';gx.fillText('✦',s.x,s.y);gx.globalAlpha=1}for(var i=fr.length-1;i>=0;i--){var f=fr[i];f.vy+=.3;f.x+=f.vx;f.y+=f.vy;gx.font='24px serif';gx.textAlign='center';gx.fillText(f.e,f.x,f.y);if(f.y>H+30&&!f.sl){ms++;fr.splice(i,1);if(ms>=5){toast('Errou muitas!');endGame();return}}}gx.fillStyle='#4ECDC4';gx.font='bold 12px Nunito';gx.textAlign='left';gx.fillText('Pts: '+gSc+'  Erros: '+ms+'/5',10,20);gLoop=requestAnimationFrame(f)})()}
function G_flappy(){var W=320,H=440,py=H/2,pvy=0,pp=[],t=0;function flp(){pvy=-7;sndGP()}gc.ontouchstart=function(e){e.preventDefault();flp()};gc.onclick=flp;(function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;pvy+=.35;py+=pvy;if(t%90===0){var gy=80+Math.random()*(H-160);pp.push({x:W+10,gy:gy})}cGC();gx.fillStyle='#1a3a4a';gx.fillRect(0,0,W,H);for(var i=pp.length-1;i>=0;i--){var p=pp[i];p.x-=2.5;gx.fillStyle='#4ECDC4';gx.beginPath();gx.roundRect(p.x,0,45,p.gy-120,0);gx.fill();gx.beginPath();gx.roundRect(p.x,p.gy+120,45,H-p.gy-120,0);gx.fill();if(Math.abs(40-p.x)<45/2+8&&(py<p.gy-120||py>p.gy+120)){toast('Bateu!');endGame();return}if(p.x<-55){pp.splice(i,1);gSc+=10;sndGP();document.getElementById('gsc').textContent=gSc}}if(py<0||py>H){toast('Caiu!');endGame();return}dMP(40,py,24);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para voar!',W/2,20);gLoop=requestAnimationFrame(f)})()}
function G_connectpipes(){var W=320,H=440,gd=[],SZ=60,RO=6,CO=5;var tp=['h','v','tr','tl','br','bl','cross'];for(var r=0;r<RO;r++){gd[r]=[];for(var c=0;c<CO;c++)gd[r][c]={type:tp[0|Math.random()*tp.length],rot:0|Math.random()*4,con:false}}var ox=(W-CO*SZ)/2,oy=(H-RO*SZ)/2;function gc2(type,rot){var base={h:[0,2],v:[1,3],tr:[0,1],tl:[1,2],br:[0,3],bl:[2,3],cross:[0,1,2,3]}[type]||[];return base.map(function(d){return(d+rot)%4})}function ckf(){var vs={},q=[['0','0']];vs['0,0']=true;while(q.length){var cu=q[0].split(',');q.shift();var cr=+cu[0],cc=+cu[1],cell=gd[cr][cc],cn=gc2(cell.type,cell.rot),dirs=[[0,1,0],[0,-1,2],[-1,0,1],[1,0,3]];for(var d=0;d<4;d++){if(cn.indexOf(d)===-1)continue;var dir=dirs[d],nr=cr+dir[0],nc=cc+dir[1];if(nr<0||nr>=RO||nc<0||nc>=CO)continue;var ky=nr+','+nc;if(vs[ky])continue;var nc2=gd[nr][nc],ncon=gc2(nc2.type,nc2.rot),opp=[2,3,0,1][d];if(ncon.indexOf(opp)!==-1){vs[ky]=true;q.push([nr+','+nc])}}}for(var r=0;r<RO;r++)for(var c=0;c<CO;c++)gd[r][c].con=!!vs[r+','+c];if(vs[(RO-1)+','+(CO-1)]){gSc+=50;sndWin();document.getElementById('gsc').textContent=gSc;toast('Conectou!');for(var r=0;r<RO;r++)for(var c=0;c<CO;c++){gd[r][c].type=tp[0|Math.random()*tp.length];gd[r][c].rot=0|Math.random()*4}}}function hp(mx,my){var c=0|((mx-ox)/SZ),r=0|((my-oy)/SZ);if(r>=0&&r<RO&&c>=0&&c<CO){gd[r][c].rot=(gd[r][c].rot+1)%4;sndClick();ckf()}}gc.onclick=function(e){var r=gc.getBoundingClientRect();hp(e.clientX-r.left,e.clientY-r.top)};gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();hp(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};(function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}cGC();for(var r=0;r<RO;r++)for(var c=0;c<CO;c++){var cell=gd[r][c],x=ox+c*SZ,y=oy+r*SZ;gx.fillStyle=cell.con?'rgba(78,205,196,.15)':'rgba(255,255,255,.04)';gx.beginPath();gx.roundRect(x+2,y+2,SZ-4,SZ-4,6);gx.fill();gx.strokeStyle=cell.con?'#4ECDC4':'rgba(255,255,255,.1)';gx.lineWidth=1.5;gx.stroke();var cn=gc2(cell.type,cell.rot),cx2=x+SZ/2,cy2=y+SZ/2,ln=SZ/2-4;gx.strokeStyle=cell.con?'#4ECDC4':'#8B949E';gx.lineWidth=3;gx.lineCap='round';for(var d=0;d<cn.length;d++){var dx=[1,0,-1,0][cn[d]]*ln,dy=[0,1,0,-1][cn[d]]*ln;gx.beginPath();gx.moveTo(cx2,cy2);gx.lineTo(cx2+dx,cy2+dy);gx.stroke()}gx.beginPath();gx.arc(cx2,cy2,5,0,Math.PI*2);gx.fillStyle=cell.con?'#4ECDC4':'#8B949E';gx.fill()}gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Gire para conectar!',W/2,20);gLoop=requestAnimationFrame(f)})()}
function G_brickbreak(){var W=320,H=440,px=W/2,py=H-40,bvx=3,bvy=-3,bk=[],pw=50,t=0;var bc=['#EF5350','#FF9800','#FFE66D','#66BB6A','#42A5F5','#7E57C2'];for(var r=0;r<5;r++)for(var c=0;c<7;c++)bk.push({x:c*44+6,y:r*20+40,w:40,h:16,al:true,c:bc[r]});gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();px=Math.max(pw/2,Math.min(W-pw/2,e.touches[0].clientX-r.left))};gc.onmousemove=function(e){var r=gc.getBoundingClientRect();px=Math.max(pw/2,Math.min(W-pw/2,e.clientX-r.left))};(function f(){if(!gRun){gc.ontouchmove=gc.onmousemove=null;return}t++;bvx*=1.0001;bvy*=1.0001;var bx2=px+bvx,by2=py+bvy;if(bx2<6||bx2>W-6)bvx*=-1;if(by2<6)bvy*=-1;if(by2>H-25&&Math.abs(bx2-px)<pw/2){bvy=-Math.abs(bvy);bvx+=(bx2-px)*.1}if(by2>H+10){toast('Perdeu a bola!');endGame();return}for(var i=0;i<bk.length;i++){var b=bk[i];if(!b.al)continue;if(bx2>b.x&&bx2<b.x+b.w&&by2>b.y&&by2<b.y+b.h){b.al=false;bvy*=-1;gSc+=5;sndGP();document.getElementById('gsc').textContent=gSc;break}}px=bx2;py=by2;cGC();for(var i=0;i<bk.length;i++){var b=bk[i];if(!b.al)continue;gx.fillStyle=b.c;gx.beginPath();gx.roundRect(b.x,b.y,b.w,b.h,3);gx.fill()}gx.fillStyle='#4ECDC4';gx.beginPath();gx.roundRect(px-pw/2,H-22,pw,8,4);gx.fill();gx.fillStyle='#fff';gx.beginPath();gx.arc(px,py,6,0,Math.PI*2);gx.fill();var ad=true;for(var i=0;i<bk.length;i++)if(bk[i].al)ad=false;if(ad){toast('Todos destruidos!');endGame();return}gLoop=requestAnimationFrame(f)})()}

/* ===== PAINEL JOGOS ===== */
var gameList=[{s:'Acao e Reflexo',g:[{e:'🍕',n:'Food Drop',k:'fooddrop',t:'Pegue comidas!'},{e:'☁️',n:'Sky Jump',k:'skyjump',t:'Pule nas plataformas'},{e:'🚀',n:'Jet Pou',k:'jetpou',t:'Desvie dos obstaculos'},{e:'⛰️',n:'Cliff Jump',k:'cliffjump',t:'Pule os penhascos'},{e:'🎨',n:'Color Tap',k:'colortap',t:'Toque na cor certa'}]},{s:'Corrida e Esporte',g:[{e:'🚗',n:'Hill Drive',k:'hilldrive',t:'Dirija nas colinas'},{e:'☁️',n:'Sky Hop',k:'skyhop',t:'Pule nas nuvens'},{e:'🪵',n:'Water Hop',k:'waterhop',t:'Atravesse o rio'},{e:'⚽',n:'Goal',k:'goal',t:'Chute no gol!'},{e:'🎱',n:'Pool',k:'pool',t:'Bilhar com Pou'},{e:'🏐',n:'Beach Volley',k:'beachvolley',t:'Volei de praia'}]},{s:'Logica e Quebra-cabeca',g:[{e:'🟦',n:'Match Tap',k:'matchtap',t:'Grupos de cores'},{e:'🔮',n:'Pou Popper',k:'poupopper',t:'Estoure bolhas'},{e:'🪂',n:'Free Fall',k:'freefall',t:'Queda livre'},{e:'☁️',n:'Cloud Pass',k:'cloudpass',t:'Desvie das nuvens'},{e:'🔍',n:'Find Pou',k:'findpou',t:'Onde esta o Pou?'},{e:'🧩',n:'Memory',k:'memory',t:'Encontre os pares'}]},{s:'Estrategia',g:[{e:'❌',n:'Tic Tac Pou',k:'tictacpou',t:'Jogo da velha'},{e:'🔴',n:'Four Pous',k:'fourpous',t:'Conecta 4'},{e:'🔧',n:'Connect Pipes',k:'connectpipes',t:'Conecte os canos'}]},{s:'Corridas Infinitas',g:[{e:'🪙',n:'Gold Rush',k:'goldrush',t:'Corrida do Ouro!'},{e:'⚡',n:'Hero Run',k:'herorun',t:'Corrida Heroica!'},{e:'⏰',n:'Time Rush',k:'timerush',t:'Viajem no tempo!'}]},{s:'Arcade Classico',g:[{e:'🐍',n:'Snake Run',k:'snakerun',t:'Cobra!'},{e:'🍉',n:'Fruit Ninja',k:'fruitninja',t:'Corte frutas!'},{e:'🐦',n:'Flappy Pou',k:'flappy',t:'Voar!'},{e:'🧱',n:'Brick Break',k:'brickbreak',t:'Quebre os tijolos!'}]}];
function buildGames(){var p=document.getElementById('ui-games'),h='';for(var s=0;s<gameList.length;s++){var sec=gameList[s];h+='<div class="gs"><h3>'+sec.s+'</h3><div class="gg">';for(var g=0;g<sec.g.length;g++){var gm=sec.g[g];var hi=S.hi[gm.k]?S.hi[gm.k]:0;h+='<div class="gi" data-gk="'+gm.k+'"><div class="ge">'+gm.e+'</div><div class="gn">'+gm.n+'</div><div class="gt">'+gm.t+(hi?' 🏅'+hi:'')+'</div></div>'}h+='</div></div>'}p.innerHTML=h;p.querySelectorAll('.gi').forEach(function(el){el.addEventListener('click',function(){sndClick();launchGame(el.dataset.gk)})})}

/* ===== LAB ===== */
var pots=[{e:'🧪',n:'Crescer',gem:2,fn:function(){S.scale=1.4;setTimeout(function(){S.scale=1},6000)}},{e:'🫧',n:'Encolher',gem:1,fn:function(){S.scale=.7;setTimeout(function(){S.scale=1},6000)}},{e:'🌈',n:'Arco-iris',gem:2,fn:function(){S.rainbow=true;setTimeout(function(){S.rainbow=false},8000)}},{e:'⚡',n:'Energia',gem:1,fn:function(){S.energy=100}},{e:'😜',n:'Engrecado',gem:1,fn:function(){showSp('HAHAHA!');aState='dance';aTimer=120}},{e:'💊',n:'Saude Total',gem:2,fn:function(){S.health=100;S.hunger=Math.min(100,S.hunger+25)}},{e:'🧹',n:'Limpeza',gem:1,fn:function(){S.clean=100}},{e:'🎭',n:'Diversao',gem:1,fn:function(){S.fun=100}},{e:'💤',n:'Sono Leve',gem:1,fn:function(){S.energy=Math.min(100,S.energy+40)}},{e:'❤️',n:'Vida Extra',gem:3,fn:function(){S.health=100;S.hunger=Math.min(100,S.hunger+50);S.energy=Math.min(100,S.energy+50);S.clean=Math.min(100,S.clean+50);S.fun=Math.min(100,S.fun+50)}}];
function usePotion(pi){var p=pots[pi];if(S.gems<p.gem){toast('Gemas insuficientes!');return}S.gems-=p.gem;S.potC++;sndPotion();p.fn();squish=1;gainXP(8);toast(p.e+' '+p.n+'!');var r=cvs.getBoundingClientRect();particle(PX+r.left,PY+r.top-PS*.3,p.e);updateUI();save()}
function buildLab(){var g=document.getElementById('ui-lab'),h='';for(var i=0;i<pots.length;i++){var p=pots[i];h+='<div class="fi" data-pi="'+i+'"><div>'+p.e+'</div><div class="fn">'+p.n+'</div><div class="fp" style="color:#CE93D8">💎'+p.gem+'</div></div>'}g.innerHTML=h;g.querySelectorAll('.fi').forEach(function(el){var pi=parseInt(el.dataset.pi);el.addEventListener('touchstart',function(e){startDrag(e,pi,'potion')},{passive:false});el.addEventListener('mousedown',function(e){startDrag(e,pi,'potion')})})}

/* ===== GUARDA-ROUPA ===== */
var colors=['#1a3a6a','#E53935','#D81B60','#8E24AA','#5E35B1','#0097A7','#FF8F00','#F9A825','#43A047','#6D4C41','#546E7A','#212121','#F48FB1','#80DEEA','#A5D6A7','#FFCC80'];
var hats=[{e:'🎉',k:'party',n:'Festa'},{e:'👑',k:'crown',n:'Coroa'},{e:'🧢',k:'cap',n:'Bone'},{e:'🎀',k:'bow',n:'Laco'},{e:'🎩',k:'tophat',n:'Chapeu'},{e:'🎅',k:'santa',n:'Papai Noel'},{e:'🌸',k:'flower',n:'Flor'},{e:'📡',k:'antenna',n:'Antena'},{e:'🧙',k:'wizard',n:'Mago'}];
var accs=[{e:'👓',k:'glasses',n:'Oculos'},{e:'🕶️',k:'sunglasses',n:'Escuros'},{e:'😳',k:'blush',n:'Rubor'},{e:'🥸',k:'mustache',n:'Bigode'},{e:'🧣',k:'scarf',n:'Cachecol'},{e:'👔',k:'tie',n:'Gravata'},{e:'📿',k:'necklace',n:'Colar'},{e:'🎀',k:'bowtie',n:'Laco Gravata'},{e:'🩹',k:'eyepatch',n:'Pirata'}];
var shoesList=[{e:'👟',k:null,n:'Padrao'},{e:'🔴',k:'red',n:'Vermelho'},{e:'🔵',k:'blue',n:'Azul'},{e:'🟢',k:'green',n:'Verde'},{e:'🟡',k:'gold',n:'Dourado'},{e:'🩷',k:'pink',n:'Rosa'},{e:'🟤',k:'brown',n:'Marrom'}];
function buildCloset(){var p=document.getElementById('ui-closet'),h='<div class="cs"><h4>Cor</h4><div class="crow">';for(var i=0;i<colors.length;i++)h+='<div class="cd'+(S.color===colors[i]?' on':'')+'" style="background:'+colors[i]+'" data-c="'+colors[i]+'"></div>';h+='</div></div><div class="cs"><h4>Chapeus</h4><div class="crow">';for(var i=0;i<hats.length;i++)h+='<div class="ho'+(S.hat===hats[i].k?' on':'')+'" data-h="'+hats[i].k+'">'+hats[i].e+'</div>';h+='</div></div><div class="cs"><h4>Acessorios</h4><div class="crow">';for(var i=0;i<accs.length;i++)h+='<div class="ho'+(S.acc===accs[i].k?' on':'')+'" data-a="'+accs[i].k+'">'+accs[i].e+'</div>';h+='</div></div><div class="cs"><h4>Sapatos</h4><div class="crow">';for(var i=0;i<shoesList.length;i++)h+='<div class="ho'+(S.shoes===shoesList[i].k?' on':'')+'" data-sh="'+(shoesList[i].k||'')+'">'+shoesList[i].e+'</div>';h+='</div></div>';p.innerHTML=h;p.querySelectorAll('.cd').forEach(function(el){el.addEventListener('click',function(){sndClick();S.color=el.dataset.c;S.rainbow=false;buildCloset();save()})});p.querySelectorAll('[data-h]').forEach(function(el){el.addEventListener('click',function(){sndClick();var k=el.dataset.h;S.hat=S.hat===k?null:k;buildCloset();save()})});p.querySelectorAll('[data-a]').forEach(function(el){el.addEventListener('click',function(){sndClick();var k=el.dataset.a;S.acc=S.acc===k?null:k;buildCloset();save()})});p.querySelectorAll('[data-sh]').forEach(function(el){el.addEventListener('click',function(){sndClick();var k=el.dataset.sh||null;S.shoes=S.shoes===k?null:k;buildCloset();save()})})}

/* ===== DIARIA ===== */
function checkDaily(){var now=Date.now();if(now-S.lastD>86400000){S.lastD=now;var c=25+0|Math.random()*25;var g=Math.random()<.25?1:0;earn(c);if(g)S.gems+=g;gainXP(15);toast('Diaria! +'+c+' moedas'+(g?' +1 gema':''));save()}}
setTimeout(checkDaily,2000);
var sps=['Ei!','Me cuida!','Que fome...','Brinca!','Zzzz...','Ola!','Fish!','Tchau!','Hehe!'];
setInterval(function(){if(Math.random()<.2&&aState!=='sleep')showSp(sps[0|Math.random()*sps.length])},20000);
updateUI();