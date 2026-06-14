/* ===== AUDIO ===== */
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
function load(){try{var d=localStorage.getItem('pou3d');if(d){var o=JSON.parse(d);for(var k in o)if(o.hasOwnProperty(k))S[k]=o[k]}}catch(e){}}
load();

/* ===== CORES ===== */
function htr(h){h=h.replace('#','');return[parseInt(h.substring(0,2),16),parseInt(h.substring(2,4),16),parseInt(h.substring(4,6),16)]}
function rth(r,g,b){return'#'+[r,g,b].map(function(x){return Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')}).join('')}
function lighten(h,p){var c=htr(h);return rth(c[0]+(255-c[0])*p/100,c[1]+(255-c[1])*p/100,c[2]+(255-c[2])*p/100)}
function darken(h,p){var c=htr(h);return rth(c[0]*(1-p/100),c[1]*(1-p/100),c[2]*(1-p/100))}

/* ===== UI ===== */
var _tt;
function toast(m){var e=document.getElementById('toast');e.textContent=m;e.classList.add('on');clearTimeout(_tt);_tt=setTimeout(function(){e.classList.remove('on')},2200)}
var _st;
function showSp(t){var e=document.getElementById('sp');e.textContent=t;e.style.display='block';clearTimeout(_st);_st=setTimeout(function(){e.style.display='none'},2200)}
function particle(x,y,em){var e=document.createElement('div');e.className='ptc';e.textContent=em;e.style.left=x+'px';e.style.top=y+'px';document.getElementById('rw').appendChild(e);setTimeout(function(){e.remove()},850)}

/* ===== CANVAS ===== */
var cvs=document.getElementById('pc'),ctx=cvs.getContext('2d');
var CW,CH,PX,PY,PS,tX=null,tY=null,isBlink=false,animT=0,aState='idle',aTimer=0,squish=0,mouthOpen=0,bubbles=[],currentRoom='hall',showerOn=false,showerAnimT=0,soapActive=false,soapTimer=0,waterDrops=[];
function resizeC(){
  var w=document.getElementById('rw').getBoundingClientRect(),d=window.devicePixelRatio||1;
  CW=w.width;CH=w.height;cvs.width=CW*d;cvs.height=CH*d;
  cvs.style.width=CW+'px';cvs.style.height=CH+'px';ctx.setTransform(d,0,0,d,0,0);
  PS=Math.max(Math.min(CW*.5,240),Math.min(CH*.55,240));
  PX=CW/2;PY=CH/2-PS*.05;
  var dt=document.getElementById('drag-target');
  dt.style.width=PS*.75+'px';dt.style.height=PS*.75+'px';
  dt.style.left=(PX-PS*.375)+'px';dt.style.top=(PY-PS*.375)+'px';
}
window.addEventListener('resize',resizeC);resizeC();

/* ===== CENARIO BANHO ===== */
function drawBathScene(){
  var bg=ctx.createLinearGradient(0,0,0,CH);
  bg.addColorStop(0,'#1a2a3a');bg.addColorStop(.5,'#0d1f2d');bg.addColorStop(1,'#162a38');
  ctx.fillStyle=bg;ctx.fillRect(0,0,CW,CH);
  var tileW=40,tileH=40;
  for(var r=0;r<Math.ceil(CH/tileH)+1;r++)for(var c=0;c<Math.ceil(CW/tileW)+1;c++){
    ctx.fillStyle=(r+c)%2===0?'rgba(100,160,200,.06)':'rgba(80,140,180,.03)';
    ctx.fillRect(c*tileW,r*tileH,tileW,tileH);
    ctx.strokeStyle='rgba(100,160,200,.08)';ctx.lineWidth=.5;ctx.strokeRect(c*tileW,r*tileH,tileW,tileH);
  }
  var wallH=CH*.35,wbg=ctx.createLinearGradient(0,0,0,wallH);
  wbg.addColorStop(0,'#1e3040');wbg.addColorStop(1,'#162530');
  ctx.fillStyle=wbg;ctx.fillRect(0,0,CW,wallH);
  for(var r=0;r<Math.ceil(wallH/35);r++)for(var c=0;c<Math.ceil(CW/35)+1;c++){ctx.strokeStyle='rgba(120,180,220,.07)';ctx.lineWidth=.5;ctx.strokeRect(c*35,r*35,35,35)}
  var tubW=CW*.65,tubH=CH*.28,tubX=(CW-tubW)/2,tubY=CH*.52;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(tubX+tubW/2,tubY+tubH+8,tubW/2+10,14,0,0,Math.PI*2);ctx.fill();
  var tubGrad=ctx.createLinearGradient(tubX,tubY,tubX,tubY+tubH);
  tubGrad.addColorStop(0,'#e8e8e8');tubGrad.addColorStop(.5,'#d0d0d0');tubGrad.addColorStop(1,'#b8b8b8');
  ctx.fillStyle=tubGrad;ctx.beginPath();ctx.roundRect(tubX,tubY,tubW,tubH,18);ctx.fill();
  ctx.fillStyle='#f0f0f0';ctx.beginPath();ctx.roundRect(tubX-4,tubY-6,tubW+8,16,8);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.08)';ctx.lineWidth=1;ctx.stroke();
  var waterY=tubY+10,waterH=tubH-14;
  var wGr=ctx.createLinearGradient(tubX,waterY,tubX,waterY+waterH);
  wGr.addColorStop(0,'rgba(100,200,255,.35)');wGr.addColorStop(.5,'rgba(70,170,240,.4)');wGr.addColorStop(1,'rgba(50,140,220,.5)');
  ctx.fillStyle=wGr;ctx.beginPath();ctx.roundRect(tubX+6,waterY,tubW-12,waterH,12);ctx.fill();
  ctx.fillStyle='rgba(180,230,255,.15)';ctx.beginPath();ctx.ellipse(tubX+tubW*.35,waterY+waterH*.3,tubW*.15,6,-.1,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(180,230,255,.2)';ctx.lineWidth=1;
  for(var w=0;w<3;w++){ctx.beginPath();for(var x=tubX+10;x<tubX+tubW-10;x+=2){var wy=waterY+waterH*.2+w*12+Math.sin(x*.04+animT*.06+w)*3;if(x===tubX+10)ctx.moveTo(x,wy);else ctx.lineTo(x,wy)}ctx.stroke()}
  var shX=CW*.78,shY=CH*.12;
  ctx.strokeStyle='#a0a8b0';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(shX,0);ctx.lineTo(shX,shY);ctx.stroke();
  ctx.strokeStyle='#b0b8c0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(shX,0);ctx.lineTo(shX,shY);ctx.stroke();
  ctx.strokeStyle='#a0a8b0';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(shX,shY);ctx.quadraticCurveTo(shX,shY+20,shX-25,shY+20);ctx.stroke();
  ctx.strokeStyle='#b0b8c0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(shX,shY);ctx.quadraticCurveTo(shX,shY+20,shX-25,shY+20);ctx.stroke();
  ctx.fillStyle=showerOn?'#c0d0e0':'#90989e';ctx.beginPath();ctx.roundRect(shX-45,shY+16,24,12,4);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=1;ctx.stroke();
  for(var h=0;h<4;h++){ctx.fillStyle=showerOn?'rgba(150,210,255,.8)':'#70787e';ctx.beginPath();ctx.arc(shX-42+h*6,shY+22,1.5,0,Math.PI*2);ctx.fill()}
  if(showerOn){
    showerAnimT++;ctx.save();
    for(var d=0;d<12;d++){var dx=shX-33+Math.sin(animT*.08+d*1.3)*8,dy=shY+28+d*18+Math.sin(animT*.1+d*.7)*4,dr=2+Math.random()*2,da=Math.max(.05,.3-d*.02);ctx.fillStyle='rgba(140,210,255,'+da+')';ctx.beginPath();ctx.ellipse(dx,dy,dr,dr*1.8,.2,0,Math.PI*2);ctx.fill()}
    for(var d=0;d<6;d++){var dx=shX-33+Math.sin(animT*.12+d*2)*12,dy=shY+28+d*8+Math.random()*6;ctx.fillStyle='rgba(160,220,255,'+(0.15+Math.random()*.15)+')';ctx.beginPath();ctx.arc(dx,dy,1+Math.random()*1.5,0,Math.PI*2);ctx.fill()}
    ctx.restore();
    if(animT%3===0)waterDrops.push({x:shX-33+Math.random()*20-10,y:shY+30+Math.random()*40,vy:1+Math.random()*2,life:30+Math.random()*20});
  }else{showerAnimT=0}
  for(var i=waterDrops.length-1;i>=0;i--){var wd=waterDrops[i];wd.y+=wd.vy;wd.vy+=.15;wd.life--;if(wd.life<=0||wd.y>CH){waterDrops.splice(i,1);continue}ctx.fillStyle='rgba(140,210,255,'+(wd.life/50*.4)+')';ctx.beginPath();ctx.ellipse(wd.x,wd.y,1.5,3,0,0,Math.PI*2);ctx.fill()}
  var btnX=shX+20,btnY=shY-5;
  ctx.fillStyle=showerOn?'#4ECDC4':'#556677';ctx.beginPath();ctx.arc(btnX,btnY,10,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='bold 9px Nunito';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(showerOn?'ON':'OFF',btnX,btnY);
  var soapX=CW*.18,soapY=CH*.18;
  ctx.fillStyle='#8a7060';ctx.fillRect(soapX-30,soapY+12,60,5);ctx.fillStyle='#9a8070';ctx.fillRect(soapX-28,soapY+10,56,4);
  ctx.fillStyle=soapActive?'rgba(255,200,100,.9)':'rgba(255,180,80,.85)';ctx.beginPath();ctx.roundRect(soapX-12,soapY-2,24,14,6);ctx.fill();
  ctx.strokeStyle='rgba(200,140,50,.4)';ctx.lineWidth=.8;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(soapX-4,soapY+2,6,3,-.2,0,Math.PI*2);ctx.fill();
  if(soapActive){soapTimer--;if(soapTimer<=0)soapActive=false;for(var fb=0;fb<8;fb++){var fx=PX-30+Math.sin(animT*.05+fb*1.1)*35,fy=PY-20+Math.cos(animT*.04+fb*.9)*25,fr=4+Math.sin(animT*.06+fb)*2;ctx.fillStyle='rgba(255,255,255,'+(0.25+Math.sin(animT*.08+fb)*.1)+')';ctx.beginPath();ctx.arc(fx,fy,Math.max(1,fr),0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=.5;ctx.stroke()}}
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.roundRect(CW*.05,CH*.15,25,60,4);ctx.fill();
  ctx.strokeStyle='rgba(78,205,196,.15)';ctx.lineWidth=2;for(var tl=0;tl<4;tl++){ctx.beginPath();ctx.moveTo(CW*.05+5,CH*.15+12+tl*14);ctx.lineTo(CW*.05+20,CH*.15+12+tl*14);ctx.stroke()}
}

/* ===== DESENHAR POU ===== */
function drawPou(){
  ctx.clearRect(0,0,CW,CH);
  if(currentRoom==='bath'){drawBathScene()}else{
    var bg2=ctx.createRadialGradient(CW/2,CH/2,0,CW/2,CH/2,CW*.7);bg2.addColorStop(0,'#1a2233');bg2.addColorStop(1,'#0d1117');ctx.fillStyle=bg2;ctx.fillRect(0,0,CW,CH);
    ctx.fillStyle='rgba(78,205,196,.015)';for(var p=0;p<6;p++){ctx.beginPath();ctx.arc(CW*(.15+p*.14),CH*(.3+Math.sin(p)*.2),40+Math.sin(animT*.01+p)*10,0,Math.PI*2);ctx.fill()}
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
  ctx.beginPath();ctx.ellipse(0,78,40,10,0,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fill();
  if(S.shoes){
    var sc=S.shoes==='red'?'#E53935':S.shoes==='blue'?'#1E88E5':S.shoes==='green'?'#43A047':S.shoes==='gold'?'#FFB300':S.shoes==='pink'?'#EC407A':'#8D6E63';
    ctx.fillStyle=sc;ctx.beginPath();ctx.ellipse(-16,74,15,8,-.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(16,74,15,8,.12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=darken(sc,20);ctx.beginPath();ctx.ellipse(-16,76,10,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(16,76,10,4,0,0,Math.PI*2);ctx.fill();
  }else{
    ctx.fillStyle='#E8973F';ctx.beginPath();ctx.ellipse(-16,72,14,7,-.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(16,72,14,7,.12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#D4822F';ctx.beginPath();ctx.ellipse(-16,75,10,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(16,75,10,4,0,0,Math.PI*2);ctx.fill();
  }
  ctx.beginPath();ctx.ellipse(0,16,42,56,0,0,Math.PI*2);
  var cbg=ctx.createRadialGradient(-14,-14,5,2,12,75);cbg.addColorStop(0,lighten(col,20));cbg.addColorStop(.5,col);cbg.addColorStop(1,darken(col,18));ctx.fillStyle=cbg;ctx.fill();
  ctx.save();ctx.translate(-42,8);ctx.rotate(.12+Math.sin(animT*.06)*.05);ctx.beginPath();ctx.ellipse(0,0,12,34,0,0,Math.PI*2);ctx.fillStyle=darken(col,12);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(42,8);ctx.rotate(-.12-Math.sin(animT*.06)*.05);ctx.beginPath();ctx.ellipse(0,0,12,34,0,0,Math.PI*2);ctx.fillStyle=darken(col,12);ctx.fill();ctx.restore();
  ctx.beginPath();ctx.ellipse(0,22,24,38,0,0,Math.PI*2);
  var wbg=ctx.createRadialGradient(-4,14,3,-2,18,30);wbg.addColorStop(0,'#FFFFFF');wbg.addColorStop(1,'#E8EDF2');ctx.fillStyle=wbg;ctx.fill();
  var hl=ctx.createRadialGradient(-20,-22,3,-12,-12,38);hl.addColorStop(0,'rgba(255,255,255,.18)');hl.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=hl;ctx.beginPath();ctx.ellipse(0,16,42,56,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(-11,-24);ctx.lineTo(0,-12);ctx.lineTo(11,-24);ctx.closePath();ctx.fillStyle='#E8973F';ctx.fill();
  ctx.beginPath();ctx.moveTo(-8,-24);ctx.lineTo(0,-16);ctx.lineTo(8,-24);ctx.closePath();ctx.fillStyle='#F4A84B';ctx.fill();
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
  if(S.mood==='happy'||S.mood==='excited'){ctx.fillStyle='rgba(255,120,140,.2)';ctx.beginPath();ctx.ellipse(-24,-26,6,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(24,-26,6,4,0,0,Math.PI*2);ctx.fill()}
  var mo=mouthOpen;ctx.strokeStyle='#2a1a0a';ctx.lineWidth=2.5;ctx.lineCap='round';
  if(mo>.1){ctx.beginPath();ctx.ellipse(0,-16,7*mo,5*mo,0,0,Math.PI*2);ctx.fillStyle='#8B0000';ctx.fill();ctx.stroke()}
  else if(S.mood==='happy'){ctx.beginPath();ctx.moveTo(-7,-16);ctx.quadraticCurveTo(0,-10,7,-16);ctx.stroke()}
  else if(S.mood==='sad'){ctx.beginPath();ctx.moveTo(-6,-14);ctx.quadraticCurveTo(0,-18,6,-14);ctx.stroke()}
  else if(S.mood==='hungry'){ctx.beginPath();ctx.arc(0,-14,4,0,Math.PI*2);ctx.stroke()}
  else if(S.mood==='sleepy'){ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(4,-14);ctx.stroke()}
  else if(S.mood==='excited'){ctx.beginPath();ctx.moveTo(-9,-14);ctx.quadraticCurveTo(0,-7,9,-14);ctx.stroke()}
  else if(S.mood==='sick'){ctx.beginPath();ctx.moveTo(-5,-13);ctx.quadraticCurveTo(0,-17,5,-13);ctx.stroke()}
  else{ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(4,-14);ctx.stroke()}
  if(S.hat==='party'){ctx.fillStyle='#E91E63';ctx.beginPath();ctx.moveTo(0,-82);ctx.lineTo(-18,-50);ctx.lineTo(18,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#FFD54F';ctx.beginPath();ctx.arc(0,-82,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#E91E63';ctx.beginPath();ctx.ellipse(0,-50,22,5,0,0,Math.PI*2);ctx.fill()}
  if(S.hat==='crown'){ctx.fillStyle='#FFD54F';ctx.beginPath();ctx.moveTo(-20,-50);ctx.lineTo(-20,-70);ctx.lineTo(-10,-60);ctx.lineTo(0,-74);ctx.lineTo(10,-60);ctx.lineTo(20,-70);ctx.lineTo(20,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#EF5350';ctx.beginPath();ctx.arc(0,-74,3.5,0,Math.PI*2);ctx.fill()}
  if(S.hat==='cap'){ctx.fillStyle=darken(col,10);ctx.beginPath();ctx.ellipse(0,-46,22,13,0,Math.PI,0);ctx.fill();ctx.fillStyle=darken(col,20);ctx.beginPath();ctx.ellipse(17,-46,15,4,-.2,0,Math.PI*2);ctx.fill()}
  if(S.hat==='bow'){ctx.fillStyle='#E91E63';ctx.beginPath();ctx.ellipse(-9,-52,9,6,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(9,-52,9,6,.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(0,-52,3.5,0,0,Math.PI*2);ctx.fill()}
  if(S.hat==='tophat'){ctx.fillStyle='#1a1a1a';ctx.fillRect(-15,-86,30,38);ctx.beginPath();ctx.ellipse(0,-48,22,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#E91E63';ctx.fillRect(-15,-55,30,5)}
  if(S.hat==='santa'){ctx.fillStyle='#E53935';ctx.beginPath();ctx.ellipse(0,-50,24,6,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-18,-50);ctx.quadraticCurveTo(-5,-80,20,-65);ctx.lineTo(18,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(20,-65,5,0,Math.PI*2);ctx.fill()}
  if(S.hat==='flower'){ctx.strokeStyle='#388E3C';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-50);ctx.lineTo(0,-62);ctx.stroke();var fc=['#FF6B9D','#FFB347','#FF6B9D','#FFB347','#FF6B9D'];for(var i=0;i<5;i++){var a=i*Math.PI*2/5-Math.PI/2;ctx.beginPath();ctx.ellipse(Math.cos(a)*6,-62+Math.sin(a)*6,4,4,0,0,Math.PI*2);ctx.fillStyle=fc[i];ctx.fill()}ctx.beginPath();ctx.arc(0,-62,3,0,Math.PI*2);ctx.fillStyle='#FFE66D';ctx.fill()}
  if(S.hat==='antenna'){ctx.strokeStyle='#78909C';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-50);ctx.quadraticCurveTo(10,-70,5,-80);ctx.stroke();ctx.fillStyle='#EF5350';ctx.beginPath();ctx.arc(5,-80,4,0,Math.PI*2);ctx.fill()}
  if(S.hat==='wizard'){ctx.fillStyle='#5C6BC0';ctx.beginPath();ctx.moveTo(-20,-50);ctx.quadraticCurveTo(-15,-90,0,-95);ctx.quadraticCurveTo(15,-90,20,-50);ctx.closePath();ctx.fill();ctx.fillStyle='#FFD54F';ctx.beginPath();ctx.arc(0,-68,3,0,Math.PI*2);ctx.fill()}
  if(S.acc==='glasses'){ctx.strokeStyle='#37474F';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(-14,-36,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(14,-36,9,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-5,-36);ctx.lineTo(5,-36);ctx.stroke()}
  if(S.acc==='sunglasses'){ctx.fillStyle='rgba(15,25,40,.78)';ctx.strokeStyle='#37474F';ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(-24,-44,18,14,4);ctx.fill();ctx.stroke();ctx.beginPath();ctx.roundRect(6,-44,18,14,4);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-6,-37);ctx.lineTo(6,-37);ctx.stroke()}
  if(S.acc==='blush'){ctx.fillStyle='rgba(255,80,120,.35)';ctx.beginPath();ctx.ellipse(-24,-24,8,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(24,-24,8,5,0,0,Math.PI*2);ctx.fill()}
  if(S.acc==='mustache'){ctx.fillStyle='#3E2723';ctx.beginPath();ctx.ellipse(-7,-6,8,4,-.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(7,-6,8,4,.2,0,Math.PI*2);ctx.fill()}
  if(S.acc==='scarf'){ctx.fillStyle='#E91E63';ctx.beginPath();ctx.ellipse(0,-4,32,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#C2185B';ctx.beginPath();ctx.roundRect(10,-4,9,20,4);ctx.fill()}
  if(S.acc==='tie'){ctx.fillStyle='#1565C0';ctx.beginPath();ctx.moveTo(-6,-6);ctx.lineTo(6,-6);ctx.lineTo(4,0);ctx.lineTo(0,18);ctx.lineTo(-4,0);ctx.closePath();ctx.fill()}
  if(S.acc==='necklace'){ctx.strokeStyle='#FFB300';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-8,20,.2,Math.PI-.2);ctx.stroke();ctx.fillStyle='#FFB300';ctx.beginPath();ctx.arc(0,10,4,0,Math.PI*2);ctx.fill()}
  if(S.acc==='bowtie'){ctx.fillStyle='#7B1FA2';ctx.beginPath();ctx.ellipse(-7,-6,7,5,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(7,-6,7,5,.3,0,Math.PI*2);ctx.fill()}
  if(S.acc==='eyepatch'){ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(14,-36,12,14,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#1a1a1a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(26,-36);ctx.quadraticCurveTo(35,-50,30,-55);ctx.stroke()}
  if(aState==='sleep'){var a=Math.abs(Math.sin(animT*.05));ctx.font=(12+a*5)+'px Nunito';ctx.fillStyle='rgba(180,200,255,'+a+')';ctx.fillText('z',44,-52);ctx.font=(9+a*3)+'px Nunito';ctx.fillText('z',54,-64);ctx.fillText('z',60,-72)}
  if(showerOn){ctx.save();for(var d=0;d<6;d++){var dx=-20+Math.sin(animT*.1+d*1.5)*25,dy=-50+d*20+Math.sin(animT*.08+d)*5;ctx.fillStyle='rgba(140,210,255,'+(0.2+Math.random()*.15)+')';ctx.beginPath();ctx.ellipse(dx,dy,1.5,3,.3,0,0,Math.PI*2);ctx.fill()}ctx.fillStyle='rgba(140,210,255,.08)';ctx.beginPath();ctx.ellipse(0,16,42,56,0,0,Math.PI*2);ctx.fill();ctx.restore()}
  ctx.restore();
  for(var i=bubbles.length-1;i>=0;i--){
    var b=bubbles[i];b.y-=b.sp;b.x+=Math.sin(animT*.05+b.off)*.5;b.life--;
    if(b.life<=0){bubbles.splice(i,1);continue}
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle='rgba(150,220,255,'+(b.life/b.ml)*.4+')';ctx.fill();
    ctx.strokeStyle='rgba(200,240,255,'+(b.life/b.ml)*.3+')';ctx.lineWidth=.5;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,'+(b.life/b.ml)*.2+')';ctx.beginPath();ctx.arc(b.x-b.r*.3,b.y-b.r*.3,b.r*.25,0,Math.PI*2);ctx.fill();
  }
  if(mouthOpen>0)mouthOpen=Math.max(0,mouthOpen-.06);
}

setInterval(function(){isBlink=true;setTimeout(function(){isBlink=false},150)},3500+Math.random()*2000);
function animLoop(){animT++;if(aTimer>0){aTimer--;if(aTimer<=0)aState='idle'}drawPou();updateMood();requestAnimationFrame(animLoop)}
animLoop();

cvs.addEventListener('touchstart',function(e){var t=e.touches[0],r=cvs.getBoundingClientRect();tX=t.clientX-r.left;tY=t.clientY-r.top;handleBathTap(t.clientX-r.left,t.clientY-r.top)},{passive:true});
cvs.addEventListener('touchmove',function(e){var t=e.touches[0],r=cvs.getBoundingClientRect();tX=t.clientX-r.left;tY=t.clientY-r.top},{passive:true});
cvs.addEventListener('touchend',function(){tX=null;tY=null},{passive:true});
cvs.addEventListener('mousemove',function(e){var r=cvs.getBoundingClientRect();tX=e.clientX-r.left;tY=e.clientY-r.top});
cvs.addEventListener('mouseleave',function(){tX=null;tY=null});
cvs.addEventListener('click',function(e){var r=cvs.getBoundingClientRect();handleBathTap(e.clientX-r.left,e.clientY-r.top)});

function handleBathTap(mx,my){
  if(currentRoom!=='bath')return;
  var shX=CW*.78,shY=CH*.12,btnX=shX+20,btnY=shY-5;
  if(Math.abs(mx-btnX)<15&&Math.abs(my-btnY)<15){
    showerOn=!showerOn;
    if(showerOn){sndShower();toast('Chuveiro ligado!');S.clean=Math.min(100,S.clean+5)}
    else{toast('Chuveiro desligado!')}
    updateUI();save();return;
  }
  var soapX=CW*.18,soapY=CH*.18;
  if(Math.abs(mx-soapX)<18&&Math.abs(my-soapY)<14){
    soapActive=true;soapTimer=90;sndSoap();
    S.clean=Math.min(100,S.clean+8);squish=.5;
    for(var i=0;i<12;i++)bubbles.push({x:PX-40+Math.random()*80,y:PY-10+Math.random()*40,r:3+Math.random()*7,sp:.4+Math.random()*1,life:50+Math.random()*40,ml:90,off:Math.random()*6.28});
    showSp('Espuma!');gainXP(2);updateUI();save();return;
  }
}

function updateMood(){var m='happy';if(S.health<25)m='sick';else if(S.hunger<18)m='hungry';else if(S.energy<18)m='sleepy';else if(S.clean<18)m='sad';else if(S.fun>78&&S.energy>55)m='excited';else if(S.hunger<35||S.energy<35||S.fun<35||S.clean<35)m='sad';S.mood=m;document.getElementById('mf').textContent={happy:'😊',sad:'😢',hungry:'😣',sleepy:'😴',sick:'🤒',excited:'🤩'}[m]||'😊'}

setInterval(function(){
  if(S.energy>8||S.mood!=='sleep'){S.hunger=Math.max(0,S.hunger-.7);S.energy=Math.max(0,S.energy-.35);S.fun=Math.max(0,S.fun-.45);S.clean=Math.max(0,S.clean-.28)}
  var avg=(S.hunger+S.energy+S.clean)/3;if(avg<38)S.health=Math.max(0,S.health-.45);else S.health=Math.min(100,S.health+.18);
  if(showerOn&&currentRoom==='bath'){S.clean=Math.min(100,S.clean+.3);updateUI()}
  updateUI();save();
},5000);

function updateUI(){
  var ids=['bH','bE','bF','bC','bHp'],lids=['lH','lE','lF','lC','lHp'],vals=[S.hunger,S.energy,S.fun,S.clean,S.health];
  for(var i=0;i<5;i++){document.getElementById(ids[i]).style.width=Math.round(vals[i])+'%';document.getElementById(lids[i]).textContent=Math.round(vals[i])}
  document.getElementById('sC').textContent=S.coins;document.getElementById('sG').textContent=S.gems;
  document.getElementById('sL').textContent=S.level;document.getElementById('xpf').style.width=(S.xp/S.xpN*100)+'%';
}
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
    if(r==='bath')buildBath();
    if(r==='food')buildFood();if(r==='games')buildGames();if(r==='lab')buildLab();if(r==='closet')buildCloset();
  });
});

/* ===== COMIDA ===== */
var foods=[{e:'🍔',n:'Hamburger',h:32,f:8,c:8},{e:'🍕',n:'Pizza',h:28,f:12,c:10},{e:'🍟',n:'Batata',h:18,f:6,c:5},{e:'🌮',n:'Taco',h:22,f:8,c:7},{e:'🍎',n:'Maca',h:14,f:4,c:3},{e:'🍌',n:'Banana',h:16,f:4,c:3},{e:'🍓',n:'Morango',h:10,f:8,c:4},{e:'🍉',n:'Melancia',h:18,f:10,c:5},{e:'🍇',n:'Uva',h:11,f:6,c:4},{e:'🎂',n:'Bolo',h:22,f:18,c:12},{e:'🍦',n:'Sorvete',h:18,f:22,c:10},{e:'🍫',n:'Chocolate',h:14,f:16,c:8},{e:'🥛',n:'Leite',h:11,f:4,c:3},{e:'🥤',n:'Refri',h:7,f:12,c:4},{e:'🧃',n:'Suco',h:9,f:10,c:4},{e:'☕',n:'Cafe',h:4,f:6,c:5},{e:'🐟',n:'Peixe',h:20,f:5,c:6},{e:'🍰',n:'Torta',h:24,f:15,c:11},{e:'🥗',n:'Salada',h:12,f:3,c:4},{e:'🍗',n:'Frango',h:26,f:5,c:7},{e:'🥐',n:'Croissant',h:15,f:8,c:6},{e:'🍩',n:'Rosquinha',h:16,f:14,c:7}];
function buildFood(){var g=document.getElementById('fg'),h='';for(var i=0;i<foods.length;i++){var f=foods[i];h+='<div class="fi" data-fi="'+i+'"><div>'+f.e+'</div><div class="fn">'+f.n+'</div><div class="fp">🪙'+f.c+'</div></div>'}g.innerHTML=h;g.querySelectorAll('.fi').forEach(function(el){var fi=parseInt(el.dataset.fi);el.addEventListener('touchstart',function(e){startDrag(e,fi,'food')},{passive:false});el.addEventListener('mousedown',function(e){startDrag(e,fi,'food')})})}

/* ===== BANHO ===== */
var bathItems=[{e:'🧴',n:'Shampoo',clean:25,snd:'soap'},{e:'🧽',n:'Esponja',clean:20,snd:'soap'},{e:'🫧',n:'Bolha',clean:10,snd:'bath'},{e:'🪣',n:'Balde',clean:15,snd:'bath'},{e:'🪥',n:'Escova',clean:20,snd:'soap'}];
function buildBath(){var g=document.getElementById('bath-items'),h='<div style="color:var(--t);font-size:11px;padding:6px 10px;background:rgba(78,205,196,.08);border-radius:8px;margin-bottom:8px;text-align:center">Toque no <b>sabonete</b> e <b>ON/OFF</b> no cenario!</div>';for(var i=0;i<bathItems.length;i++){var b=bathItems[i];h+='<div class="fi" data-bi="'+i+'"><div>'+b.e+'</div><div class="fn">'+b.n+'</div><div class="fb">+'+b.clean+'%</div></div>'}g.innerHTML=h;g.querySelectorAll('.fi').forEach(function(el){var bi=parseInt(el.dataset.bi);el.addEventListener('touchstart',function(e){startDrag(e,bi,'bath')},{passive:false});el.addEventListener('mousedown',function(e){startDrag(e,bi,'bath')})})}

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

/* --- G_fooddrop --- */
function G_fooddrop(){
  var W=320,H=440,px=W/2,it=[],t=0,ms=0,gd=['🍎','🍌','🍓','🍇','🍕','🍔','🐟','🍊'],bd=['💣','🪨'];
  gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();px=Math.max(15,Math.min(W-15,e.touches[0].clientX-r.left))};
  gc.ontouchstart=gc.ontouchmove;
  gc.onmousemove=function(e){var r=gc.getBoundingClientRect();px=Math.max(15,Math.min(W-15,e.clientX-r.left))};
  (function f(){if(!gRun){gc.ontouchmove=gc.ontouchstart=gc.onmousemove=null;return}t++;
    var rt=Math.max(18,30-t*.008);if(t%Math.floor(rt)===0){var b=Math.random()<.18;it.push({x:20+Math.random()*(W-40),y:-20,e:b?bd[0|Math.random()*2]:gd[0|Math.random()*8],bad:b,sp:1.5+Math.random()*.7+t*.002})}
    cGC();dMP(px,H-25,40);var ni=[];
    for(var i=0;i<it.length;i++){var o=it[i];o.y+=2.2*o.sp;gx.font='24px serif';gx.textAlign='center';gx.fillText(o.e,o.x,o.y);
      if(o.y>H-48&&Math.abs(o.x-px)<28){if(o.bad){gSc=Math.max(0,gSc-15);ms++;sndLose()}else{gSc+=10;earn(1);sndGP()}document.getElementById('gsc').textContent=gSc}else if(o.y<H+20)ni.push(o);else if(!o.bad)ms++}
    it=ni;if(ms>=5){toast('Errou muita comida!');endGame();return}
    gx.fillStyle='#4ECDC4';gx.font='bold 12px Nunito';gx.textAlign='left';gx.fillText('Pts: '+gSc,10,20);gx.fillStyle='#EF5350';gx.fillText('Erros: '+ms+'/5',10,36);
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_skyjump --- */
function G_skyjump(){
  var W=320,H=440,py=300,pvy=0,px=W/2,pvx=0,pl=[],cy=0,t=0,ks={},tx=null;
  for(var i=0;i<8;i++)pl.push({x:Math.random()*(W-50),y:55+i*50,w:50+Math.random()*15,mv:i>3,dx:i>3?(.4+Math.random())*(Math.random()>.5?1:-1):0});
  function kd(e){ks[e.key]=true;if(e.key===' ')e.preventDefault()}function ku(e){ks[e.key]=false}
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  gc.ontouchstart=function(e){e.preventDefault();tx=e.touches[0].clientX};
  gc.ontouchmove=function(e){e.preventDefault();if(tx!==null){pvx+=(e.touches[0].clientX-tx)*.15;tx=e.touches[0].clientX}};
  gc.ontouchend=function(){tx=null};
  (function f(){if(!gRun){document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);gc.ontouchstart=gc.ontouchmove=gc.ontouchend=null;return}t++;
    if(ks.ArrowLeft||ks.a)pvx-=.9;if(ks.ArrowRight||ks.d)pvx+=.9;pvx*=.87;pvy+=.38;py+=pvy;px+=pvx;
    if(px<-10)px=W+10;if(px>W+10)px=-10;cGC();
    for(var i=0;i<pl.length;i++){var p=pl[i],ry=p.y-cy;if(p.mv)p.x+=p.dx;if(p.x<0||p.x+p.w>W)p.dx*=-.8;
      gx.fillStyle=p.mv?'#FF6B9D':'#4ECDC4';gx.beginPath();gx.roundRect(p.x,ry,p.w,9,4);gx.fill();
      if(pvy>0&&py+12>ry&&py+12<ry+14&&px>p.x-5&&px<p.x+p.w+5){pvy=-10.5;sndGP()}}
    if(py-cy<H/2){cy-=3;for(var i=0;i<pl.length;i++)if(pl[i].y-cy>H+20){pl[i].y=cy-10-Math.random()*30;pl[i].x=Math.random()*(W-50);pl[i].mv=t>200;pl[i].dx=pl[i].mv?(.4+Math.random())*(Math.random()>.5?1:-1):0}gSc+=2;document.getElementById('gsc').textContent=gSc}
    dMP(px,py-cy,28);if(py-cy>H+30){toast('Caiu!');endGame();return}gLoop=requestAnimationFrame(f)})();
}

/* --- G_jetpou --- */
function G_jetpou(){
  var W=320,H=440,py=H/2,px=60,ob=[],t=0,st=[];
  for(var i=0;i<30;i++)st.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.5,sp:Math.random()*2+1});
  gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();py=Math.max(15,Math.min(H-15,e.touches[0].clientY-r.top));px=Math.max(15,Math.min(W-15,e.touches[0].clientX-r.left))};
  gc.ontouchstart=gc.ontouchmove;
  gc.onmousemove=function(e){var r=gc.getBoundingClientRect();py=Math.max(15,Math.min(H-15,e.clientY-r.top));px=Math.max(15,Math.min(W-15,e.clientX-r.left))};
  (function f(){if(!gRun){gc.ontouchmove=gc.ontouchstart=gc.onmousemove=null;return}t++;
    var rt=Math.max(18,35-t*.012);if(t%Math.floor(rt)===0)ob.push({x:W+10,y:20+Math.random()*(H-40),w:16+Math.random()*14,h:28+Math.random()*28,sp:3.5+t*.003});
    gx.fillStyle='#0a0e1a';gx.fillRect(0,0,W,H);
    for(var i=0;i<st.length;i++){var s=st[i];s.x-=s.sp;if(s.x<0){s.x=W;s.y=Math.random()*H}gx.fillStyle='rgba(255,255,255,'+(s.s/3)+')';gx.beginPath();gx.arc(s.x,s.y,s.s,0,Math.PI*2);gx.fill()}
    for(var i=0;i<ob.length;i++){var o=ob[i];o.x-=o.sp;gx.fillStyle='#EF5350';gx.beginPath();gx.roundRect(o.x-o.w/2,o.y-o.h/2,o.w,o.h,4);gx.fill();
      if(Math.abs(px-o.x)<o.w/2+10&&Math.abs(py-o.y)<o.h/2+10){toast('Bateu!');endGame();return}}
    ob=ob.filter(function(o){return o.x>-30});
    gx.save();gx.translate(px,py);dMP(0,0,28);gx.fillStyle='#FF6B35';gx.beginPath();gx.moveTo(-8,8);gx.lineTo(-16-Math.random()*4,12+Math.sin(t*.3)*4);gx.lineTo(-8,14);gx.closePath();gx.fill();gx.restore();
    gSc++;if(t%8===0)document.getElementById('gsc').textContent=gSc;gLoop=requestAnimationFrame(f)})();
}

/* --- G_cliffjump --- */
function G_cliffjump(){
  var W=320,H=440,px=W/2,py=H-80,pvy=0,cl=[],t=0,gr=true;
  for(var i=0;i<8;i++)cl.push({x:40+Math.random()*(W-80),y:340-i*55,w:55+Math.random()*35});
  function jmp(){if(gr){pvy=-11;gr=false;sndGP()}}
  gc.ontouchstart=function(e){e.preventDefault();jmp()};gc.onclick=jmp;
  (function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;pvy+=.45;py+=pvy;cGC();
    for(var i=0;i<cl.length;i++){var c=cl[i];gx.fillStyle='#4a5268';gx.beginPath();gx.roundRect(c.x-c.w/2,c.y,c.w,16,5);gx.fill();
      if(!gr&&pvy>0&&py>=c.y-8&&py<=c.y+12&&Math.abs(px-c.x)<c.w/2){pvy=0;gr=true;py=c.y-8;gSc+=15;sndGP();document.getElementById('gsc').textContent=gSc}}
    if(py>H+20){toast('Caiu!');endGame();return}dMP(px,py,28);
    gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)})();
}

/* --- G_colortap --- */
function G_colortap(){
  var W=320,H=440,cls=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A'],cn=['Vermelho','Teal','Laranja','Roxo','Verde'],tg=0,bk=[];
  for(var i=0;i<12;i++)bk.push({x:18+(i%4)*76,y:65+Math.floor(i/4)*120,w:68,h:105,c:0|Math.random()*5});
  tg=0|Math.random()*5;var tl=20,t=0;
  function ht(mx,my){for(var i=0;i<bk.length;i++){var b=bk[i];if(mx>b.x&&mx<b.x+b.w&&my>b.y&&my<b.y+b.h){if(b.c===tg){gSc+=10;sndGP();bk[i].c=0|Math.random()*5;tg=0|Math.random()*5}else{gSc=Math.max(0,gSc-5);sndLose()}document.getElementById('gsc').textContent=gSc;break}}}
  gc.onclick=function(e){var r=gc.getBoundingClientRect();ht(e.clientX-r.left,e.clientY-r.top)};
  gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ht(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};
  (function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}t++;if(t%60===0){tl--;if(tl<=0){toast('Tempo!');endGame();return}}
    cGC();gx.fillStyle=cls[tg];gx.beginPath();gx.roundRect(W/2-50,8,100,26,12);gx.fill();
    gx.fillStyle='#fff';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText(cn[tg],W/2,26);
    gx.fillStyle='#8B949E';gx.fillText('Tempo: '+tl+'s',W/2,52);
    for(var i=0;i<bk.length;i++){var b=bk[i];gx.fillStyle=cls[b.c];gx.beginPath();gx.roundRect(b.x,b.y,b.w,b.h,10);gx.fill()}gLoop=requestAnimationFrame(f)})();
}

/* --- G_hilldrive --- */
function G_hilldrive(){
  var W=320,H=440,cx=W/2,cy=300,vl=0,tn2=[],t=0,cn=[];
  for(var i=0;i<300;i++)tn2.push(80+Math.sin(i*.05)*35+Math.sin(i*.12)*18+Math.sin(i*.02)*50);
  gc.ontouchstart=function(e){e.preventDefault();vl=-9};gc.ontouchend=function(){vl=0};gc.onmousedown=function(){vl=-9};gc.onmouseup=function(){vl=0};
  (function f(){if(!gRun){gc.ontouchstart=gc.ontouchend=gc.onmousedown=gc.onmouseup=null;return}t++;var sc=t*2;
    if(t%40===0)cn.push({x:W+10,y:tn2[((W+sc)%300+300)%300]-25});
    vl+=.4;cy+=vl;var ti=((cx+sc)%300+300)%300;var ty=tn2[ti];
    if(cy>ty-5){cy=ty-5;vl=0}if(cy>H+30){toast('Caiu!');endGame();return}
    cGC();gx.beginPath();gx.moveTo(0,H);for(var i=0;i<=W;i+=2){var idx=((i+sc)%300+300)%300;gx.lineTo(i,tn2[idx])}gx.lineTo(W,H);gx.closePath();gx.fillStyle='#1a3a2e';gx.fill();
    for(var i=cn.length-1;i>=0;i--){var c=cn[i];c.x-=2;gx.font='14px serif';gx.textAlign='center';gx.fillText('🪙',c.x,c.y);if(Math.abs(c.x-cx)<18&&Math.abs(c.y-cy)<18){gSc+=5;earn(1);sndGP();cn.splice(i,1);document.getElementById('gsc').textContent=gSc}else if(c.x<-20)cn.splice(i,1)}
    gx.fillStyle='#EF5350';gx.beginPath();gx.roundRect(cx-10,cy-18,20,18,4);gx.fill();gSc++;if(t%10===0)document.getElementById('gsc').textContent=gSc;gLoop=requestAnimationFrame(f)})();
}

/* --- G_skyhop --- */
function G_skyhop(){
  var W=320,H=440,py=H-60,px=W/2,cd=[],t=0;
  for(var i=0;i<6;i++)cd.push({x:Math.random()*(W-50),y:H-70-i*70,w:50+Math.random()*25,dr:Math.random()>.5?1:-1,sp:.5+Math.random()*.8});
  gc.ontouchstart=function(e){e.preventDefault();py-=65;sndGP()};gc.onclick=function(){py-=65;sndGP()};
  (function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;py+=2.5;
    for(var i=0;i<cd.length;i++){var c=cd[i];c.x+=c.dr*c.sp;if(c.x<0||c.x+c.w>W)c.dr*=-1;
      if(py>=c.y-10&&py<=c.y+8&&px>c.x&&px<c.x+c.w){py=c.y-10;gSc+=5;sndGP();document.getElementById('gsc').textContent=gSc}}
    if(py>H+20){toast('Caiu!');endGame();return}cGC();
    for(var i=0;i<cd.length;i++){var c=cd[i];gx.fillStyle='rgba(255,255,255,.15)';gx.beginPath();gx.ellipse(c.x+c.w/2,c.y,c.w/2,12,0,0,Math.PI*2);gx.fill()}
    dMP(px,py,26);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)})();
}

/* --- G_waterhop --- */
function G_waterhop(){
  var W=320,H=440,py=H-60,px=W/2,lg=[],t=0;
  for(var i=0;i<6;i++)lg.push({x:Math.random()*W,y:H-60-i*65,w:45+Math.random()*25,sp:(.4+Math.random()*.8)*(Math.random()>.5?1:-1)});
  gc.ontouchstart=function(e){e.preventDefault();py-=60;sndGP()};gc.onclick=function(){py-=60;sndGP()};
  (function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;py+=2;
    for(var i=0;i<lg.length;i++){var l=lg[i];l.x+=l.sp;if(l.x<-l.w)l.x=W;if(l.x>W)l.x=-l.w;
      if(py>=l.y-8&&py<=l.y+8&&px>l.x&&px<l.x+l.w){py=l.y-8;gSc+=5;sndGP();document.getElementById('gsc').textContent=gSc}}
    if(py>H+20){toast('Afundou!');endGame();return}cGC();
    for(var i=0;i<lg.length;i++){var l=lg[i];gx.fillStyle='#6D4C41';gx.beginPath();gx.roundRect(l.x,l.y,l.w,12,6);gx.fill()}
    dMP(px,py,26);gx.fillStyle='#42A5F5';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)})();
}

/* --- G_goal --- */
function G_goal(){
  var W=320,H=440,bx=W/2,by=H-60,bvx=0,bvy=0,kk=false,gl=0;
  gc.ontouchstart=function(e){e.preventDefault();if(!kk){kk=true;bvy=-13;bvx=(Math.random()-.3)*6;sndGP()}};
  gc.onclick=function(){if(!kk){kk=true;bvy=-13;bvx=(Math.random()-.3)*6;sndGP()}};
  (function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}
    if(kk){bvy+=.3;bx+=bvx;by+=bvy;
      if(bx>W-45&&bx<W+10&&by>30&&by<130){gSc+=25;earn(2);gl++;sndWin();toast('GOL! '+gl);document.getElementById('gsc').textContent=gSc;kk=false;bx=W/2;by=H-60}
      if(by>H+20||bx<-20||bx>W+20){kk=false;bx=W/2;by=H-60}}
    cGC();gx.fillStyle='#1a5a2e';gx.fillRect(0,0,W,H);gx.strokeStyle='rgba(255,255,255,.3)';gx.lineWidth=2;gx.strokeRect(W-45,30,45,100);
    gx.font='28px serif';gx.textAlign='center';gx.fillText('⚽',bx,by);
    gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.fillText('TOQUE para chutar! Gols: '+gl,W/2,20);gLoop=requestAnimationFrame(f)})();
}

/* --- G_pool --- */
function G_pool(){
  var W=320,H=440,bl=[],ax=W/2,ay=H/2,sh=false;
  var bc=['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A','#FF6B9D','#42A5F5','#FFE66D'];
  for(var i=0;i<8;i++)bl.push({x:80+Math.random()*160,y:70+Math.random()*140,vx:0,vy:0,r:10,c:bc[i],out:false});
  var pk=[[18,18],[W-18,18],[18,H-18],[W-18,H-18],[W/2,12],[W/2,H-12]];
  gc.onmousemove=function(e){var r=gc.getBoundingClientRect();ax=e.clientX-r.left;ay=e.clientY-r.top};
  gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();ax=e.touches[0].clientX-r.left;ay=e.touches[0].clientY-r.top};
  function sht(){if(sh)return;sh=true;sndGP();var dx=ax-W/2,dy=ay-H/2,d=Math.sqrt(dx*dx+dy*dy)||1;
    for(var i=0;i<bl.length;i++)if(!bl[i].out){var bx2=bl[i].x-W/2,by2=bl[i].y-H/2,bd=Math.sqrt(bx2*bx2+by2*by2)||1;bl[i].vx=dx/d*6*(1/(bd/50+1));bl[i].vy=dy/d*6*(1/(bd/50+1))}
    setTimeout(function(){sh=false},500)}
  gc.onclick=sht;
  gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ax=e.touches[0].clientX-r.left;ay=e.touches[0].clientY-r.top;sht()};
  (function f(){if(!gRun){gc.onclick=gc.onmousemove=gc.ontouchmove=gc.ontouchstart=null;return}
    cGC();gx.fillStyle='#0a3a1a';gx.fillRect(0,0,W,H);
    for(var p=0;p<pk.length;p++){gx.beginPath();gx.arc(pk[p][0],pk[p][1],12,0,Math.PI*2);gx.fillStyle='#000';gx.fill()}
    for(var i=0;i<bl.length;i++){var b=bl[i];if(b.out)continue;
      b.x+=b.vx;b.y+=b.vy;b.vx*=.96;b.vy*=.96;
      if(Math.abs(b.vx)<.01)b.vx=0;if(Math.abs(b.vy)<.01)b.vy=0;
      if(b.x<b.r+10||b.x>W-b.r-10){b.vx*=-.85;b.x=Math.max(b.r+10,Math.min(W-b.r-10,b.x))}
      if(b.y<b.r+10||b.y>H-b.r-10){b.vy*=-.85;b.y=Math.max(b.r+10,Math.min(H-b.r-10,b.y))}
      for(var p=0;p<pk.length;p++)if(Math.abs(b.x-pk[p][0])<14&&Math.abs(b.y-pk[p][1])<14){b.out=true;gSc+=15;earn(1);sndGP();document.getElementById('gsc').textContent=gSc;break}
      for(var j=i+1;j<bl.length;j++){var b2=bl[j];if(b2.out)continue;
        var dx=b.x-b2.x,dy=b.y-b2.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<b.r+b2.r&&d>0){var nx=dx/d,ny=dy/d,rv=(b.vx-b2.vx)*nx+(b.vy-b2.vy)*ny;b.vx-=rv*nx;b.vy-=rv*ny;b2.vx+=rv*nx;b2.vy+=rv*ny;var ov=(b.r+b2.r-d)/2;b.x+=nx*ov;b.y+=ny*ov;b2.x-=nx*ov;b2.y-=ny*ov}}}
    for(var i=0;i<bl.length;i++)if(!bl[i].out){gx.beginPath();gx.arc(bl[i].x,bl[i].y,bl[i].r,0,Math.PI*2);gx.fillStyle=bl[i].c;gx.fill();gx.strokeStyle='rgba(0,0,0,.3)';gx.lineWidth=1;gx.stroke()}
    gx.strokeStyle='rgba(255,255,255,.1)';gx.lineWidth=2;gx.strokeRect(10,10,W-20,H-20);
    if(bl.every(function(b){return b.out})){toast('Todas na cesta!');endGame();return}
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_beachvolley --- */
function G_beachvolley(){
  var W=320,H=440,bx=W/2,by=H-50,bvx=0,bvy=0,t=0,ps=0,ai=0,py=H-40;
  gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();py=Math.max(H-80,Math.min(H-10,e.touches[0].clientY-r.top))};
  gc.ontouchstart=gc.ontouchmove;
  gc.onmousemove=function(e){var r=gc.getBoundingClientRect();py=Math.max(H-80,Math.min(H-10,e.clientY-r.top))};
  (function f(){if(!gRun){gc.ontouchmove=gc.ontouchstart=gc.onmousemove=null;return}t++;
    if(bvy===0&&bvx===0){bx=W/2;by=H-80;bvy=-8;bvx=(Math.random()-.5)*4}
    bvy+=.15;bx+=bvx;by+=bvy;
    if(bx<10){bx=10;bvx=Math.abs(bvx)}if(bx>W-10){bx=W-10;bvx=-Math.abs(bvx)}
    if(by>H-25&&Math.abs(bx-W/2)<40){bvy=-Math.abs(bvy)-.5;bvx+=(bx-W/2)*.05;gSc+=5;sndGP();document.getElementById('gsc').textContent=gSc}
    if(by<25){bvy=Math.abs(bvy)}
    var aiX=W/2+Math.sin(t*.03)*30;
    if(by<60&&Math.abs(bx-aiX)<35){bvy=Math.abs(bvy)+.5;bvx+=(bx-aiX)*.08;ai++;sndGP()}
    if(by>H+10){toast('Bola caiu! AI: '+ai);endGame();return}
    if(by<-10){toast('Ponto!');gSc+=10;document.getElementById('gsc').textContent=gSc;bvy=0;bvx=0}
    cGC();gx.fillStyle='#C2956B';gx.fillRect(0,H-10,W,10);
    gx.strokeStyle='rgba(255,255,255,.3)';gx.setLineDash([5,5]);gx.beginPath();gx.moveTo(W/2,0);gx.lineTo(W/2,H);gx.stroke();gx.setLineDash([]);
    gx.font='20px serif';gx.textAlign='center';gx.fillText('🏐',bx,by);
    gx.fillStyle='#4ECDC4';gx.beginPath();gx.roundRect(W/2-40,H-30,80,10,5);gx.fill();
    gx.fillStyle='#EF5350';gx.beginPath();gx.roundRect(aiX-20,20,40,10,5);gx.fill();
    gx.fillStyle='#fff';gx.font='bold 11px Nunito';gx.fillText('Voce: '+gSc+' | AI: '+ai,W/2,H-45);
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_matchtap --- */
function G_matchtap(){
  var W=320,H=440,ems=['🌟','🔥','💎','🎯','🌈','⚡'],grid=[],t=0,tl=25,sel=null,matched=0;
  for(var i=0;i<12;i++)grid.push({e:ems[i%6],x:18+(i%4)*76,y:70+Math.floor(i/4)*125,w:68,h:105,done:false,show:false});
  for(var i=grid.length-1;i>0;i--){var j=0|Math.random()*(i+1);var tmp=grid[i];grid[i]=grid[j];grid[j]=tmp}
  function ht(mx,my){for(var i=0;i<grid.length;i++){var g=grid[i];if(g.done)continue;if(mx>g.x&&mx<g.x+g.w&&my>g.y&&my<g.y+g.h){
    if(sel===null){sel=i;g.show=true}
    else if(sel===i){sel=null;g.show=false}
    else{grid[sel].show=true;g.show=true;
      if(grid[sel].e===g.e){grid[sel].done=true;g.done=true;gSc+=15;sndGP();matched++;document.getElementById('gsc').textContent=gSc;sel=null;
        if(matched>=6){toast('Parabens!');setTimeout(endGame,500)}}
      else{var s2=sel;sel=null;sndLose();setTimeout(function(){grid[s2].show=false;g.show=false},400)}}break}}}
  gc.onclick=function(e){var r=gc.getBoundingClientRect();ht(e.clientX-r.left,e.clientY-r.top)};
  gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ht(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};
  (function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}t++;if(t%60===0){tl--;if(tl<=0){toast('Tempo!');endGame();return}}
    cGC();gx.fillStyle='#8B949E';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Tempo: '+tl+'s | Pares: '+matched+'/6',W/2,30);
    for(var i=0;i<grid.length;i++){var g=grid[i];
      if(g.done){gx.fillStyle='rgba(78,205,196,.15)';gx.beginPath();gx.roundRect(g.x,g.y,g.w,g.h,10);gx.fill();gx.font='28px serif';gx.textAlign='center';gx.fillText(g.e,g.x+g.w/2,g.y+g.h/2+10);continue}
      gx.fillStyle=g.show?'rgba(255,255,255,.1)':'rgba(255,255,255,.05)';gx.beginPath();gx.roundRect(g.x,g.y,g.w,g.h,10);gx.fill();gx.strokeStyle='rgba(255,255,255,.1)';gx.lineWidth=1;gx.stroke();
      if(g.show){gx.font='28px serif';gx.textAlign='center';gx.fillText(g.e,g.x+g.w/2,g.y+g.h/2+10)}else{gx.font='20px serif';gx.fillText('?',g.x+g.w/2,g.y+g.h/2+8)}}
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_poupopper --- */
function G_poupopper(){
  var W=320,H=440,bbs=[],t=0,tl=20;
  gc.onclick=function(e){var r=gc.getBoundingClientRect();var mx=e.clientX-r.left,my=e.clientY-r.top;popAt(mx,my)};
  gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();popAt(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top);e.preventDefault()};
  function popAt(mx,my){for(var i=bbs.length-1;i>=0;i--){var b=bbs[i];var dx=mx-b.x,dy=my-b.y;if(dx*dx+dy*dy<b.r*b.r){gSc+=5;bbs.splice(i,1);sndGP();document.getElementById('gsc').textContent=gSc;return}}}
  (function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}t++;
    if(t%60===0){tl--;if(tl<=0){toast('Tempo!');endGame();return}}
    if(t%12===0)bbs.push({x:30+Math.random()*(W-60),y:H+20,r:18+Math.random()*16,sp:1.2+Math.random()*1.2,c:['#EF5350','#4ECDC4','#FFB347','#7E57C2','#66BB6A'][0|Math.random()*5]});
    for(var i=bbs.length-1;i>=0;i--){bbs[i].y-=bbs[i].sp;if(bbs[i].y<-30){bbs.splice(i,1)}}
    cGC();gx.fillStyle='#8B949E';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Tempo: '+tl+'s',W/2,25);
    for(var i=0;i<bbs.length;i++){var b=bbs[i];gx.beginPath();gx.arc(b.x,b.y,b.r,0,Math.PI*2);gx.fillStyle=b.c;gx.globalAlpha=.7;gx.fill();gx.globalAlpha=1;gx.strokeStyle='rgba(255,255,255,.3)';gx.lineWidth=1.5;gx.stroke();gx.font=(b.r*.8)+'px serif';gx.textAlign='center';gx.fillText('😊',b.x,b.y+b.r*.3)}
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_freefall --- */
function G_freefall(){
  var W=320,H=440,py=50,px=W/2,pvx=0,pl=[],t=0,sc=0;
  for(var i=0;i<20;i++)pl.push({x:Math.random()*(W-60)+30,y:100+i*35,w:40+Math.random()*40,sp:1.5+Math.random()});
  gc.ontouchstart=function(e){e.preventDefault();pvx=(e.touches[0].clientX>px?-4:4)};gc.ontouchend=function(){pvx*=.5};
  gc.onmousedown=function(){pvx=-4};gc.onmouseup=function(){pvx*=.5};
  (function f(){if(!gRun){gc.ontouchstart=gc.ontouchend=gc.onmousedown=gc.onmouseup=null;return}t++;sc+=2;
    py+=3;px+=pvx;pvx*=.95;if(px<15)px=15;if(px>W-15)px=W-15;
    for(var i=0;i<pl.length;i++){var p=pl[i],ry=p.y-sc%H;if(p.x<p.x+p.w)px;
      if(Math.abs(py-ry)<15&&px>p.x-10&&px<p.x+p.w+10){gSc+=10;sndGP();pl[i].y=pl[i].y+1000;document.getElementById('gsc').textContent=gSc}}
    if(py>H+20){toast('Caiu!');endGame();return}cGC();
    for(var i=0;i<pl.length;i++){var p=pl[i],ry=((p.y-sc%H)+H)%H;gx.fillStyle='#4a5268';gx.beginPath();gx.roundRect(p.x,ry,p.w,10,5);gx.fill()}
    dMP(px,py,26);gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE lateral!',W/2,20);gLoop=requestAnimationFrame(f)})();
}

/* --- G_cloudpass --- */
function G_cloudpass(){
  var W=320,H=440,py=H/2,px=60,cls=[],t=0;
  for(var i=0;i<15;i++)cls.push({x:W+50+i*120,y:40+Math.random()*(H-80),w:60+Math.random()*40,h:35+Math.random()*25,sp:2+Math.random()*1.5,gap:80+Math.random()*40});
  gc.ontouchstart=function(e){e.preventDefault();py-=35;sndGP()};gc.onclick=function(){py-=35;sndGP()};
  (function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;py+=2;
    for(var i=cls.length-1;i>=0;i--){var c=cls[i];c.x-=c.sp;
      if(c.x+c.w<-10){cls.splice(i,1);gSc+=10;earn(1);sndGP();document.getElementById('gsc').textContent=gSc;continue}
      gx.fillStyle='rgba(200,220,240,.25)';gx.beginPath();gx.roundRect(c.x,c.y,c.w,c.h,15);gx.fill();
      gx.beginPath();gx.roundRect(c.x,c.y+c.h+c.gap,c.w,c.h,15);gx.fill();
      if(px>c.x-10&&px<c.x+c.w+10&&(py<c.y+5||py>c.y+c.h+c.gap-5)){toast('Bateu!');endGame();return}}
    if(py<0||py>H){toast('Saiu!');endGame();return}cGC();dMP(px,py,24);
    gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para subir!',W/2,20);gLoop=requestAnimationFrame(f)})();
}

/* --- G_findpou --- */
function G_findpou(){
  var W=320,H=440,cells=[],t=0,tl=15,target={r:0|Math.random()*5,c:0|Math.random()*5},found=false;
  for(var r=0;r<5;r++)for(var c=0;c<5;c++)cells.push({r:r,c:c,x:c*64+2,y:r*64+52,w:60,h:60,has:r===target.r&&c===target.c,rev:false});
  function ht(mx,my){for(var i=0;i<cells.length;i++){var cl=cells[i];if(!cl.rev&&mx>cl.x&&mx<cl.x+cl.w&&my>cl.y&&my<cl.y+cl.h){cl.rev=true;if(cl.has){gSc+=20;sndWin();found=true;document.getElementById('gsc').textContent=gSc;setTimeout(function(){toast('Acertou!');endGame()},600)}else{sndLose();gSc=Math.max(0,gSc-3);document.getElementById('gsc').textContent=gSc}break}}}
  gc.onclick=function(e){var r=gc.getBoundingClientRect();ht(e.clientX-r.left,e.clientY-r.top)};
  gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ht(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};
  (function f(){if(!gRun||found){gc.onclick=gc.ontouchstart=null;return}t++;if(t%60===0){tl--;if(tl<=0){toast('Tempo!');endGame();return}}
    cGC();gx.fillStyle='#8B949E';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Encontre o Pou! Tempo: '+tl+'s',W/2,25);
    gx.fillStyle='rgba(78,205,196,.1)';gx.font='bold 10px Nunito';gx.fillText('Linha '+(target.r+1)+', Col '+(target.c+1),W/2,42);
    for(var i=0;i<cells.length;i++){var cl=cells[i];gx.fillStyle=cl.rev?(cl.has?'rgba(78,205,196,.3)':'rgba(239,83,80,.15)'):'rgba(255,255,255,.06)';gx.beginPath();gx.roundRect(cl.x,cl.y,cl.w,cl.h,8);gx.fill();gx.strokeStyle='rgba(255,255,255,.08)';gx.lineWidth=1;gx.stroke();
      if(cl.rev){gx.font='22px serif';gx.textAlign='center';gx.fillText(cl.has?'😊':'❌',cl.x+cl.w/2,cl.y+cl.h/2+8)}}
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_memory --- */
function G_memory(){
  var W=320,H=440,pairs=8,seq=[],inp=[],t=0,phase='show',si=0;
  var ems=['🌟','🔥','💎','🎯','🌈','⚡','🚀','🎵'];
  for(var i=0;i<pairs;i++){var e=ems[i%ems.length];seq.push(e);seq.push(e)}
  for(var i=seq.length-1;i>0;i--){var j=0|Math.random()*(i+1);var tmp=seq[i];seq[i]=seq[j];seq[j]=tmp}
  var revealed=new Array(seq.length).fill(false);
  (function f(){if(!gRun)return;t++;
    if(phase==='show'&&t%40===0){if(si<seq.length){revealed[si]=true;si++}else{phase='input';for(var i=0;i<seq.length;i++)revealed[i]=false}}
    cGC();gx.fillStyle='#8B949E';gx.font='bold 11px Nunito';gx.textAlign='center';
    gx.fillText(phase==='show'?'Memorize!':'Sua vez! ('+inp.length+'/'+seq.length+')',W/2,25);
    for(var i=0;i<seq.length;i++){var col=i%4,row=Math.floor(i/4);var cx=20+col*76,cy=50+row*100,cw=68,ch=85;
      gx.fillStyle=revealed[i]?'rgba(255,255,255,.12)':'rgba(255,255,255,.04)';gx.beginPath();gx.roundRect(cx,cy,cw,ch,10);gx.fill();
      if(revealed[i]){gx.font='30px serif';gx.textAlign='center';gx.fillText(seq[i],cx+cw/2,cy+ch/2+12)}}
    if(phase==='input'){
      function ht(mx,my){for(var i=0;i<seq.length;i++){var col=i%4,row=Math.floor(i/4);var cx=20+col*76,cy=50+row*100;if(mx>cx&&mx<cx+68&&my>cy&&my<cy+85){
        if(seq[i]===seq[inp.length]){revealed[i]=true;inp.push(i);gSc+=10;sndGP();document.getElementById('gsc').textContent=gSc;if(inp.length>=seq.length){toast('Perfeito!');setTimeout(endGame,500)}}else{sndLose();toast('Errou!');endGame()}return}}}
      gc.onclick=function(e){var r=gc.getBoundingClientRect();ht(e.clientX-r.left,e.clientY-r.top)};
      gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ht(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top);e.preventDefault()};
    }else{gc.onclick=gc.ontouchstart=null}
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_tictacpou --- */
function G_tictacpou(){
  var W=320,H=440,board=[0,0,0,0,0,0,0,0,0],turn=1,t=0,over=false;
  function check(b,p){var w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(var i=0;i<w.length;i++)if(b[w[i][0]]===p&&b[w[i][1]]===p&&b[w[i][2]]===p)return true;return false}
  function aiMove(){var empty=[];for(var i=0;i<9;i++)if(board[i]===0)empty.push(i);
    if(empty.length===0)return;for(var i=0;i<empty.length;i++){board[empty[i]]=2;if(check(board,2)){board[empty[i]]=0;return empty[i]}board[empty[i]]=0}
    for(var i=0;i<empty.length;i++){board[empty[i]]=1;if(check(board,1)){board[empty[i]]=0;return empty[i]}board[empty[i]]=0}
    if(board[4]===0)return 4;var corners=[0,2,6,8].filter(function(i){return board[i]===0});if(corners.length)return corners[0|Math.random()*corners.length];return empty[0|Math.random()*empty.length]}
  function ht(mx,my){if(over||turn!==1)return;for(var i=0;i<9;i++){var col=i%3,row=Math.floor(i/3),cx=40+col*90,cy=80+row*90;if(mx>cx&&mx<cx+80&&my>cy&&my<cy+80&&board[i]===0){
    board[i]=1;sndGP();if(check(board,1)){over=true;gSc+=30;sndWin();document.getElementById('gsc').textContent=gSc;toast('Voce venceu!');return}
    var empty=0;for(var j=0;j<9;j++)if(board[j]===0)empty++;if(empty===0){over=true;toast('Empate!');return}
    turn=2;var mv=aiMove();if(mv!==undefined){board[mv]=2;sndClick();if(check(board,2)){over=true;sndLose();toast('AI venceu!');return}empty=0;for(var j=0;j<9;j++)if(board[j]===0)empty++;if(empty===0){over=true;toast('Empate!');return}}turn=1;return}}}
  gc.onclick=function(e){var r=gc.getBoundingClientRect();ht(e.clientX-r.left,e.clientY-r.top)};
  gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ht(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top);e.preventDefault()};
  (function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}cGC();
    gx.fillStyle='#4ECDC4';gx.font='bold 12px Nunito';gx.textAlign='center';gx.fillText(over?'Fim!':turn===1?'Sua vez (O)':'AI pensando... (X)',W/2,40);
    for(var i=0;i<9;i++){var col=i%3,row=Math.floor(i/3),cx=40+col*90,cy=80+row*90;
      gx.strokeStyle='rgba(255,255,255,.15)';gx.lineWidth=2;gx.strokeRect(cx,cy,80,80);
      if(board[i]===1){gx.fillStyle='#4ECDC4';gx.font='bold 36px Nunito';gx.textAlign='center';gx.fillText('O',cx+40,cy+52)}
      if(board[i]===2){gx.fillStyle='#EF5350';gx.font='bold 36px Nunito';gx.textAlign='center';gx.fillText('X',cx+40,cy+52)}}
    if(over){gx.fillStyle='rgba(78,205,196,.8)';gx.font='bold 11px Nunito';gx.fillText('Toque Sair para continuar',W/2,H-20)}
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_fourpous --- */
function G_fourpous(){
  var W=320,H=440,cols=7,rows=6,board=[],turn=1,over=false,winCells=[];
  for(var r=0;r<rows;r++){board[r]=[];for(var c=0;c<cols;c++)board[r][c]=0}
  var cw=42,ch=42,ox=(W-cols*cw)/2,oy=80;
  function drop(c){for(var r=rows-1;r>=0;r--){if(board[r][c]===0){board[r][c]=turn;
    var w=checkWin(r,c,turn);if(w){over=true;winCells=w;gSc+=turn===1?40:0;sndWin();document.getElementById('gsc').textContent=gSc;toast(turn===1?'Voce venceu!':'AI venceu!');return true}
    var full=true;for(var cc=0;cc<cols;cc++)for(var rr=0;rr<rows;rr++)if(board[rr][cc]===0)full=false;
    if(full){over=true;toast('Empate!');return true}turn=turn===1?2:1;
    if(turn===2&&!over){var ac=aiCol();if(ac>=0)drop(ac)}return true}}return false}
  function checkWin(r,c,p){var dirs=[[0,1],[1,0],[1,1],[1,-1]];for(var d=0;d<dirs.length;d++){var cells=[[r,c]];for(var s=1;s<4;s++){var nr=r+dirs[d][0]*s,nc=c+dirs[d][1]*s;if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&board[nr][nc]===p)cells.push([nr,nc]);else break}for(var s=1;s<4;s++){var nr=r-dirs[d][0]*s,nc=c-dirs[d][1]*s;if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&board[nr][nc]===p)cells.push([nr,nc]);else break}if(cells.length>=4)return cells}return null}
  function aiCol(){for(var c=0;c<cols;c++){for(var r=rows-1;r>=0;r--)if(board[r][c]===0){board[r][c]=2;if(checkWin(r,c,2))return c;board[r][c]=0;break}}
    for(var c=0;c<cols;c++){for(var r=rows-1;r>=0;r--)if(board[r][c]===0){board[r][c]=1;if(checkWin(r,c,1)){board[r][c]=0;return c}board[r][c]=0;break}}
    var valid=[];for(var c=0;c<cols;c++)if(board[0][c]===0)valid.push(c);return valid.length?valid[0|Math.random()*valid.length]:-1}
  function ht(mx,my){if(over||turn!==1)return;for(var c=0;c<cols;c++){var cx=ox+c*cw;if(mx>cx&&mx<cx+cw&&my>oy-20&&my<oy+rows*ch){drop(c);return}}}
  gc.onclick=function(e){var r=gc.getBoundingClientRect();ht(e.clientX-r.left,e.clientY-r.top)};
  gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ht(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top);e.preventDefault()};
  (function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}cGC();
    gx.fillStyle='#4ECDC4';gx.font='bold 12px Nunito';gx.textAlign='center';gx.fillText(over?'Fim!':turn===1?'Sua vez (Azul)':'AI (Vermelho)',W/2,30);
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var cx=ox+c*cw,cy=oy+r*ch;
      var isWin=winCells.some(function(w){return w[0]===r&&w[1]===c});
      gx.fillStyle=isWin?'rgba(255,255,255,.1)':'rgba(255,255,255,.03)';gx.beginPath();gx.roundRect(cx,cy,cw-2,ch-2,6);gx.fill();gx.strokeStyle='rgba(255,255,255,.06)';gx.lineWidth=1;gx.stroke();
      if(board[r][c]===1){gx.fillStyle='#4ECDC4';gx.beginPath();gx.arc(cx+cw/2-1,cy+ch/2-1,cw/2-6,0,Math.PI*2);gx.fill()}
      if(board[r][c]===2){gx.fillStyle='#EF5350';gx.beginPath();gx.arc(cx+cw/2-1,cy+ch/2-1,cw/2-6,0,Math.PI*2);gx.fill()}}
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_goldrush --- */
function G_goldrush(){
  var W=320,H=440,py=H-50,px=W/2,glds=[],rks=[],t=0;
  gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();px=Math.max(15,Math.min(W-15,e.touches[0].clientX-r.left))};
  gc.ontouchstart=gc.ontouchmove;
  gc.onmousemove=function(e){var r=gc.getBoundingClientRect();px=Math.max(15,Math.min(W-15,e.clientX-r.left))};
  (function f(){if(!gRun){gc.ontouchmove=gc.ontouchstart=gc.onmousemove=null;return}t++;
    if(t%25===0){var b=Math.random()<.2;rks.push({x:20+Math.random()*(W-40),y:-15,sp:2+Math.random()*1.5+t*.002,bad:b})}
    if(t%35===0)glds.push({x:20+Math.random()*(W-40),y:-15,sp:1.5+Math.random()+t*.001});
    for(var i=rks.length-1;i>=0;i--){rks[i].y+=rks[i].sp;
      if(rks[i].y>py-10&&Math.abs(rks[i].x-px)<20){if(rks[i].bad){gSc=Math.max(0,gSc-10);sndLose();document.getElementById('gsc').textContent=gSc}else{gSc+=3;sndGP();document.getElementById('gsc').textContent=gSc}rks.splice(i,1);continue}if(rks[i].y>H)rks.splice(i,1)}
    for(var i=glds.length-1;i>=0;i--){glds[i].y+=glds[i].sp;
      if(glds[i].y>py-10&&Math.abs(glds[i].x-px)<18){gSc+=15;earn(1);sndCoin();glds.splice(i,1);document.getElementById('gsc').textContent=gSc;continue}if(glds[i].y>H)glds.splice(i,1)}
    cGC();gx.fillStyle='#1a1a0a';gx.fillRect(0,H-15,W,15);
    for(var i=0;i<glds.length;i++){gx.font='18px serif';gx.textAlign='center';gx.fillText('🪙',glds[i].x,glds[i].y)}
    for(var i=0;i<rks.length;i++){gx.font='18px serif';gx.textAlign='center';gx.fillText(rks[i].bad?'💣':'🪨',rks[i].x,rks[i].y)}
    dMP(px,py,30);gx.fillStyle='#FFD54F';gx.font='bold 11px Nunito';gx.textAlign='left';gx.fillText('Pts: '+gSc,10,20);gLoop=requestAnimationFrame(f)})();
}

/* --- G_herorun --- */
function G_herorun(){
  var W=320,H=440,py=H-60,px=80,pvy=0,onG=true,obs=[],coins=[],t=0,sc=0;
  gc.ontouchstart=function(e){e.preventDefault();if(onG){pvy=-12;onG=false;sndGP()}};gc.onclick=function(){if(onG){pvy=-12;onG=false;sndGP()}};
  (function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;sc=t*2;
    pvy+=.5;py+=pvy;if(py>=H-60){py=H-60;pvy=0;onG=true}
    if(t%50===0)obs.push({x:W+10,w:20+Math.random()*15,h:25+Math.random()*30,y:H-60-Math.random()*20});
    if(t%70===0)coins.push({x:W+10,y:H-100-Math.random()*60});
    for(var i=obs.length-1;i>=0;i--){obs[i].x-=3.5;
      if(px+12>obs[i].x&&px-12<obs[i].x+obs[i].w&&py+12>obs[i].y&&py-12<obs[i].y+obs[i].h){toast('Bateu!');endGame();return}
      if(obs[i].x<-30)obs.splice(i,1)}
    for(var i=coins.length-1;i>=0;i--){coins[i].x-=3.5;
      if(Math.abs(coins[i].x-px)<18&&Math.abs(coins[i].y-py)<18){gSc+=10;earn(1);sndCoin();coins.splice(i,1);document.getElementById('gsc').textContent=gSc;continue}
      if(coins[i].x<-20)coins.splice(i,1)}
    cGC();gx.fillStyle='#2a1a0a';gx.fillRect(0,H-15,W,15);
    for(var i=0;i<obs.length;i++){gx.fillStyle='#EF5350';gx.beginPath();gx.roundRect(obs[i].x,obs[i].y,obs[i].w,obs[i].h,3);gx.fill()}
    for(var i=0;i<coins.length;i++){gx.font='16px serif';gx.textAlign='center';gx.fillText('🪙',coins[i].x,coins[i].y)}
    dMP(px,py,28);gx.fillStyle='#FF6B35';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('TOQUE para pular!',W/2,20);gLoop=requestAnimationFrame(f)})();
}

/* --- G_timerush --- */
function G_timerush(){
  var W=320,H=440,tgts=[],t=0,tl=20;
  gc.onclick=function(e){var r=gc.getBoundingClientRect();hitAt(e.clientX-r.left,e.clientY-r.top)};
  gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();hitAt(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top);e.preventDefault()};
  function hitAt(mx,my){for(var i=tgts.length-1;i>=0;i--){var tg=tgts[i];var dx=mx-tg.x,dy=my-tg.y;if(dx*dx+dy*dy<tg.r*tg.r){gSc+=tg.r;tgts.splice(i,1);sndGP();document.getElementById('gsc').textContent=gSc;return}}}
  (function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}t++;
    if(t%60===0){tl--;if(tl<=0){toast('Tempo!');endGame();return}}
    if(t%15===0)tgts.push({x:30+Math.random()*(W-60),y:50+Math.random()*(H-100),r:12+Math.random()*20,life:60+Math.random()*40});
    for(var i=tgts.length-1;i>=0;i--){tgts[i].life--;if(tgts[i].life<=0)tgts.splice(i,1)}
    cGC();gx.fillStyle='#8B949E';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Tempo: '+tl+'s',W/2,25);
    for(var i=0;i<tgts.length;i++){var tg=tgts[i];var a=tg.life/100;
      gx.beginPath();gx.arc(tg.x,tg.y,tg.r,0,Math.PI*2);gx.fillStyle='rgba(255,107,53,'+a+')';gx.fill();
      gx.strokeStyle='rgba(255,255,255,.2)';gx.lineWidth=1.5;gx.stroke();
      gx.fillStyle='#fff';gx.font='bold '+(tg.r*.7)+'px Nunito';gx.textAlign='center';gx.fillText(Math.round(tg.r),tg.x,tg.y+tg.r*.25)}
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_snakerun --- */
function G_snakerun(){
  var W=320,H=440,sn=[{x:160,y:220}],dir={x:1,y:0},ndir={x:1,y:0},food=null,t=0,spd=6;
  function placeFood(){food={x:20+Math.random()*(W-40),y:50+Math.random()*(H-80)}}
  placeFood();
  function chdir(dx,dy){if(dir.x!==-dx||dir.y!==-dy)ndir={x:dx,y:dy}}
  document.addEventListener('keydown',function kd(e){if(e.key==='ArrowLeft')chdir(-1,0);if(e.key==='ArrowRight')chdir(1,0);if(e.key==='ArrowUp')chdir(0,-1);if(e.key==='ArrowDown')chdir(0,1);if(e.key===' ')e.preventDefault()});
  var lastTx=null;
  gc.ontouchstart=function(e){e.preventDefault();lastTx=e.touches[0].clientX};
  gc.ontouchmove=function(e){e.preventDefault();if(lastTx!==null){var dx=e.touches[0].clientX-lastTx;if(Math.abs(dx)>10){chdir(dx>0?1:-1,0);lastTx=e.touches[0].clientX}}};
  gc.ontouchend=function(){lastTx=null};
  (function f(){if(!gRun){document.removeEventListener('keydown',arguments.callee);gc.ontouchstart=gc.ontouchmove=gc.ontouchend=null;return}t++;
    if(t%spd===0){dir={x:ndir.x,y:ndir.y};var head={x:sn[0].x+dir.x*10,y:sn[0].y+dir.y*10};
      if(head.x<5||head.x>W-5||head.y<40||head.y>H-5){toast('Bateu na parede!');endGame();return}
      for(var i=0;i<sn.length;i++)if(Math.abs(head.x-sn[i].x)<8&&Math.abs(head.y-sn[i].y)<8){toast('Bateu em si!');endGame();return}
      sn.unshift(head);
      if(food&&Math.abs(head.x-food.x)<15&&Math.abs(head.y-food.y)<15){gSc+=10;sndGP();placeFood();document.getElementById('gsc').textContent=gSc;if(spd>3)spd--}else{sn.pop()}}
    cGC();if(food){gx.font='16px serif';gx.textAlign='center';gx.fillText('🍎',food.x,food.y)}
    for(var i=0;i<sn.length;i++){var s=sn[i];gx.fillStyle=i===0?'#4ECDC4':'rgba(78,205,196,'+(1-i/sn.length*.6)+')';gx.beginPath();gx.roundRect(s.x-5,s.y-5,10,10,3);gx.fill()}
    gx.fillStyle='#4ECDC4';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Pts: '+gSc,W/2,25);
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_fruitninja --- */
function G_fruitninja(){
  var W=320,H=440,frs=[],sp=[],t=0,ms=0;
  var ems=['🍎','🍊','🍋','🍇','🍓','🍉','🍑'];
  gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();slashAt(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top)};
  gc.onmousemove=function(e){var r=gc.getBoundingClientRect();slashAt(e.clientX-r.left,e.clientY-r.top)};
  function slashAt(mx,my){for(var i=frs.length-1;i>=0;i--){var f=frs[i];var dx=mx-f.x,dy=my-f.y;if(dx*dx+dy*dy<900){gSc+=10;sndGP();document.getElementById('gsc').textContent=gSc;
      for(var j=0;j<4;j++)sp.push({x:f.x,y:f.y,vx:(Math.random()-.5)*6,vy:-2-Math.random()*4,life:20,e:f.e});frs.splice(i,1);return}}}
  (function f(){if(!gRun){gc.ontouchmove=gc.onmousemove=null;return}t++;
    if(t%30===0)frs.push({x:40+Math.random()*(W-80),y:H+10,vy:-8-Math.random()*4,vx:(Math.random()-.5)*3,e:ems[0|Math.random()*ems.length]});
    for(var i=frs.length-1;i>=0;i--){frs[i].y+=frs[i].vy;frs[i].vy+=.2;frs[i].x+=frs[i].vx;if(frs[i].y>H+20){frs.splice(i,1);ms++;if(ms>=5){toast('Perdeu muita fruta!');endGame();return}}}
    for(var i=sp.length-1;i>=0;i--){sp[i].x+=sp[i].vx;sp[i].y+=sp[i].vy;sp[i].vy+=.3;sp[i].life--;if(sp[i].life<=0)sp.splice(i,1)}
    cGC();for(var i=0;i<frs.length;i++){gx.font='26px serif';gx.textAlign='center';gx.fillText(frs[i].e,frs[i].x,frs[i].y)}
    for(var i=0;i<sp.length;i++){gx.globalAlpha=sp[i].life/20;gx.font='16px serif';gx.textAlign='center';gx.fillText(sp[i].e,sp[i].x,sp[i].y);gx.globalAlpha=1}
    gx.fillStyle='#EF5350';gx.font='bold 11px Nunito';gx.textAlign='left';gx.fillText('Erros: '+ms+'/5',10,20);gLoop=requestAnimationFrame(f)})();
}

/* --- G_flappy --- */
function G_flappy(){
  var W=320,H=440,py=H/2,pvy=0,px=80,pipes=[],t=0;
  gc.ontouchstart=function(e){e.preventDefault();pvy=-6;sndGP()};gc.onclick=function(){pvy=-6;sndGP()};
  (function f(){if(!gRun){gc.ontouchstart=gc.onclick=null;return}t++;pvy+=.3;py+=pvy;
    if(t%90===0){var gap=110+Math.random()*30,gy=60+Math.random()*(H-gap-120);pipes.push({x:W+20,gy:gy,gap:gap,sc:false})}
    for(var i=pipes.length-1;i>=0;i--){pipes[i].x-=2.5;
      if(!pipes[i].sc&&pipes[i].x+40<px){pipes[i].sc=true;gSc+=10;sndGP();document.getElementById('gsc').textContent=gSc}
      if(px+10>pipes[i].x&&px-10<pipes[i].x+40){if(py-10<pipes[i].gy||py+10>pipes[i].gy+pipes[i].gap){toast('Bateu!');endGame();return}}
      if(pipes[i].x<-50)pipes.splice(i,1)}
    if(py<0||py>H){toast('Caiu!');endGame();return}
    cGC();for(var i=0;i<pipes.length;i++){var p=pipes[i];gx.fillStyle='#4ECDC4';gx.beginPath();gx.roundRect(p.x,0,40,p.gy,0);gx.fill();gx.beginPath();gx.roundRect(p.x,p.gy+p.gap,40,H-p.gy-p.gap,0);gx.fill()}
    dMP(px,py,22);gx.fillStyle='#FFD54F';gx.font='bold 14px Nunito';gx.textAlign='center';gx.fillText(gSc,W/2,30);
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_connectpipes --- */
function G_connectpipes(){
  var W=320,H=440,grid=[],t=0,moves=30,matched=0;
  var types=['h','v','bend_tr','bend_tl','bend_br','bend_bl','cross'];
  for(var r=0;r<5;r++){grid[r]=[];for(var c=0;c<5;c++){
    var tp=types[0|Math.random()*types.length];
    var rot=0|Math.random()*4;
    grid[r][c]={type:tp,rot:rot,x:10+c*62,y:60+r*76,w:58,h:72,matched:false}}}
  function getConn(cell){
    var r=cell.rot%4,cn={top:false,right:false,bottom:false,left:false};
    if(cell.type==='h')cn={top:false,right:true,bottom:false,left:true};
    else if(cell.type==='v')cn={top:true,right:false,bottom:true,left:false};
    else if(cell.type==='bend_tr')cn={top:true,right:true,bottom:false,left:false};
    else if(cell.type==='bend_tl')cn={top:true,right:false,bottom:false,left:true};
    else if(cell.type==='bend_br')cn={top:false,right:true,bottom:true,left:false};
    else if(cell.type==='bend_bl')cn={top:false,right:false,bottom:true,left:true};
    else if(cell.type==='cross')cn={top:true,right:true,bottom:true,left:true};
    for(var i=0;i<r;i++){var tmp=cn.top;cn.top=cn.left;cn.left=cn.bottom;cn.bottom=cn.right;cn.right=tmp}
    return cn}
  function ht(mx,my){if(moves<=0)return;for(var r=0;r<5;r++)for(var c=0;c<5;c++){var cl=grid[r][c];if(mx>cl.x&&mx<cl.x+cl.w&&my>cl.y&&my<cl.y+cl.h&&!cl.matched){
    cl.rot=(cl.rot+1)%4;moves--;sndClick();var cn=getConn(cl);
    if(cn.top&&r>0){var nb=getConn(grid[r-1][c]);if(nb.bottom){cl.matched=true;grid[r-1][c].matched=true;gSc+=15;sndGP();document.getElementById('gsc').textContent=gSc}}
    if(cn.right&&c<4){var nb=getConn(grid[r][c+1]);if(nb.left){cl.matched=true;grid[r][c+1].matched=true;gSc+=15;sndGP();document.getElementById('gsc').textContent=gSc}}
    if(cn.bottom&&r<4){var nb=getConn(grid[r+1][c]);if(nb.top){cl.matched=true;grid[r+1][c].matched=true;gSc+=15;sndGP();document.getElementById('gsc').textContent=gSc}}
    if(cn.left&&c>0){var nb=getConn(grid[r][c-1]);if(nb.right){cl.matched=true;grid[r][c-1].matched=true;gSc+=15;sndGP();document.getElementById('gsc').textContent=gSc}}
    return}}}
  gc.onclick=function(e){var r=gc.getBoundingClientRect();ht(e.clientX-r.left,e.clientY-r.top)};
  gc.ontouchstart=function(e){var r=gc.getBoundingClientRect();ht(e.touches[0].clientX-r.left,e.touches[0].clientY-r.top);e.preventDefault()};
  (function f(){if(!gRun){gc.onclick=gc.ontouchstart=null;return}t++;
    if(moves<=0){var allMatched=grid.every(function(row){return row.every(function(c){return c.matched})});if(!allMatched){toast('Sem movimentos!');endGame();return}}
    cGC();gx.fillStyle='#8B949E';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Movimentos: '+moves,W/2,30);
    for(var r=0;r<5;r++)for(var c=0;c<5;c++){var cl=grid[r][c],cn=getConn(cl);
      gx.fillStyle=cl.matched?'rgba(78,205,196,.2)':'rgba(255,255,255,.04)';gx.beginPath();gx.roundRect(cl.x,cl.y,cl.w,cl.h,6);gx.fill();gx.strokeStyle=cl.matched?'rgba(78,205,196,.4)':'rgba(255,255,255,.08)';gx.lineWidth=1;gx.stroke();
      var cx2=cl.x+cl.w/2,cy2=cl.y+cl.h/2;gx.strokeStyle=cl.matched?'#4ECDC4':'#8B949E';gx.lineWidth=3;
      if(cn.top){gx.beginPath();gx.moveTo(cx2,cy2);gx.lineTo(cx2,cl.y+4);gx.stroke()}
      if(cn.bottom){gx.beginPath();gx.moveTo(cx2,cy2);gx.lineTo(cx2,cl.y+cl.h-4);gx.stroke()}
      if(cn.left){gx.beginPath();gx.moveTo(cx2,cy2);gx.lineTo(cl.x+4,cy2);gx.stroke()}
      if(cn.right){gx.beginPath();gx.moveTo(cx2,cy2);gx.lineTo(cl.x+cl.w-4,cy2);gx.stroke()}
      gx.beginPath();gx.arc(cx2,cy2,4,0,Math.PI*2);gx.fillStyle=cl.matched?'#4ECDC4':'#555';gx.fill()}
    gLoop=requestAnimationFrame(f)})();
}

/* --- G_brickbreak --- */
function G_brickbreak(){
  var W=320,H=440,bx=W/2,by=H-30,bvx=3,bvy=-3,pw=50,bricks=[],t=0;
  var bclrs=['#EF5350','#FF6B35','#FFB347','#FFE66D','#66BB6A','#4ECDC4','#42A5F5','#7E57C2'];
  for(var r=0;r<6;r++)for(var c=0;c<7;c++)bricks.push({x:c*44+6,y:r*22+50,w:40,h:18,alive:true,color:bclrs[r%bclrs.length]});
  gc.ontouchmove=function(e){e.preventDefault();var r=gc.getBoundingClientRect();bx=Math.max(pw/2,Math.min(W-pw/2,e.touches[0].clientX-r.left))};
  gc.ontouchstart=gc.ontouchmove;
  gc.onmousemove=function(e){var r=gc.getBoundingClientRect();bx=Math.max(pw/2,Math.min(W-pw/2,e.clientX-r.left))};
  (function f(){if(!gRun){gc.ontouchmove=gc.ontouchstart=gc.onmousemove=null;return}t++;
    bx+=bvx;by+=bvy;if(bx<5||bx>W-5)bvx*=-1;if(by<5)bvy*=-1;
    if(by>H-15&&by<H-5&&bx>bx-pw/2-5&&bx<bx+pw/2+5){bvy=-Math.abs(bvy);bvx+=(bx-(bx))*0}
    if(by>H+10){toast('Perdeu a bola!');endGame();return}
    var pbx=Math.max(bx-pw/2,0),pby=H-20;
    if(by>pby-5&&by<pby+5&&bx>pbx&&bx<pbx+pw){bvy=-Math.abs(bvy);bvx+=(bx-(pbx+pw/2))*.05}
    for(var i=0;i<bricks.length;i++){var br=bricks[i];if(!br.alive)continue;
      if(bx>br.x&&bx<br.x+br.w&&by>br.y&&by<br.y+br.h){br.alive=false;bvy*=-1;gSc+=5;sndGP();document.getElementById('gsc').textContent=gSc;break}}
    if(bricks.every(function(b){return!b.alive})){toast('Todos destruidos!');endGame();return}
    cGC();
    for(var i=0;i<bricks.length;i++){var br=bricks[i];if(!br.alive)continue;gx.fillStyle=br.color;gx.beginPath();gx.roundRect(br.x,br.y,br.w,br.h,3);gx.fill()}
    gx.fillStyle='#4ECDC4';gx.beginPath();gx.roundRect(pbx,pby,pw,10,5);gx.fill();
    gx.fillStyle='#fff';gx.beginPath();gx.arc(bx,by,5,0,Math.PI*2);gx.fill();
    gx.fillStyle='#FFD54F';gx.font='bold 11px Nunito';gx.textAlign='center';gx.fillText('Pts: '+gSc,W/2,30);gLoop=requestAnimationFrame(f)})();
}

/* ===== BUILD GAMES ===== */
var gameList=[
  {id:'fooddrop',e:'🍎',n:'Pegue Comida',t:'Desvie das bombas!'},
  {id:'skyjump',e:'☁️',n:'Pulo no Ceu',t:'Pule nas plataformas!'},
  {id:'jetpou',e:'🚀',n:'Jet Pou',t:'Desvie dos obstaculos!'},
  {id:'cliffjump',e:'🧗',n:'Pulo no Penhasco',t:'Toque para pular!'},
  {id:'colortap',e:'🎨',n:'Toque na Cor',t:'Encontre a cor certa!'},
  {id:'hilldrive',e:'🚗',n:'Descida da Colina',t:'Segure para frear!'},
  {id:'skyhop',e:'🌙',n:'Pulo Lunar',t:'Toque para pular!'},
  {id:'waterhop',e:'🌊',n:'Pulo na Agua',t:'Toque para pular!'},
  {id:'goal',e:'⚽',n:'Chute ao Gol',t:'Toque para chutar!'},
  {id:'pool',e:'🎱',n:'Sinuca',t:'Mire e atire!'},
  {id:'beachvolley',e:'🏐',n:'Volei de Praia',t:'Mova para rebater!'},
  {id:'matchtap',e:'🃏',n:'Memoria',t:'Encontre os pares!'},
  {id:'poupopper',e:'🫧',n:'Estourar Bolhas',t:'Toque nas bolhas!'},
  {id:'freefall',e:'🪂',n:'Queda Livre',t:'Toque lateral!'},
  {id:'cloudpass',e:'⛅',n:'Passar Nuvens',t:'Toque para subir!'},
  {id:'findpou',e:'🔍',n:'Encontre o Pou',t:'Dica: linha e coluna!'},
  {id:'memory',e:'🧠',n:'Sequencia',t:'Memorize a ordem!'},
  {id:'tictacpou',e:'❌',n:'Jogo da Velha',t:'Venca a AI!'},
  {id:'fourpous',e:'🔴',n:'Lig 4',t:'Conecte 4!'},
  {id:'goldrush',e:'💰',n:'Corrida do Ouro',t:'Pegue moedas!'},
  {id:'herorun',e:'🏃',n:'Heroi Correndo',t:'Pule obstaculos!'},
  {id:'timerush',e:'⏱️',n:'Corrida do Tempo',t:'Toque nos alvos!'},
  {id:'snakerun',e:'🐍',n:'Cobra',t:'Deslize para virar!'},
  {id:'fruitninja',e:'🍉',n:'Fruta Ninja',t:'Deslize para cortar!'},
  {id:'flappy',e:'🐦',n:'Flappy Pou',t:'Toque para voar!'},
  {id:'connectpipes',e:'🔧',n:'Conecte Canos',t:'Gire para conectar!'},
  {id:'brickbreak',e:'🧱',n:'Quebra Tijolos',t:'Mova para rebater!'}
];
function buildGames(){
  var g=document.getElementById('ui-games'),h='';
  h+='<div class="gs"><h3>Classicos</h3><div class="gg">';
  for(var i=0;i<8;i++){var gm=gameList[i];h+='<div class="gi" onclick="launchGame(\''+gm.id+'\')"><div class="ge">'+gm.e+'</div><div class="gn">'+gm.n+'</div><div class="gt">'+gm.t+'</div></div>'}
  h+='</div></div>';
  h+='<div class="gs"><h3>Acao</h3><div class="gg">';
  for(var i=8;i<16;i++){var gm=gameList[i];h+='<div class="gi" onclick="launchGame(\''+gm.id+'\')"><div class="ge">'+gm.e+'</div><div class="gn">'+gm.n+'</div><div class="gt">'+gm.t+'</div></div>'}
  h+='</div></div>';
  h+='<div class="gs"><h3>Puzzle</h3><div class="gg">';
  for(var i=16;i<24;i++){var gm=gameList[i];h+='<div class="gi" onclick="launchGame(\''+gm.id+'\')"><div class="ge">'+gm.e+'</div><div class="gn">'+gm.n+'</div><div class="gt">'+gm.t+'</div></div>'}
  h+='</div></div>';
  h+='<div class="gs"><h3>Retro</h3><div class="gg">';
  for(var i=24;i<gameList.length;i++){var gm=gameList[i];h+='<div class="gi" onclick="launchGame(\''+gm.id+'\')"><div class="ge">'+gm.e+'</div><div class="gn">'+gm.n+'</div><div class="gt">'+gm.t+'</div></div>'}
  h+='</div></div>';
  g.innerHTML=h;
}

/* ===== LABORATORIO ===== */
var pots=[
  {e:'🧪',n:'Energia',cost:5,fx:function(){S.energy=Math.min(100,S.energy+30);showSp('+30 Energia!')}},
  {e:'💊',n:'Vida',cost:8,fx:function(){S.health=Math.min(100,S.health+40);showSp('+40 Vida!')}},
  {e:'🧬',n:'XP Boost',cost:3,fx:function(){gainXP(25);showSp('+25 XP!')}},
  {e:'⚗️',n:'Comida',cost:4,fx:function(){S.hunger=Math.min(100,S.hunger+35);showSp('+35 Fome!')}},
  {e:'🫧',n:'Limpeza',cost:4,fx:function(){S.clean=Math.min(100,S.clean+35);showSp('+35 Limpo!')}},
  {e:'🎭',n:'Diversao',cost:4,fx:function(){S.fun=Math.min(100,S.fun+35);showSp('+35 Fun!')}},
  {e:'🌈',n:'Arco-iris',cost:10,fx:function(){S.rainbow=!S.rainbow;showSp(S.rainbow?'Arco-iris ON!':'Arco-iris OFF!')}},
  {e:'🪄',n:'Cura Total',cost:15,fx:function(){S.hunger=100;S.energy=100;S.fun=100;S.clean=100;S.health=100;showSp('Totalmente curado!')}}
];
function buildLab(){
  var g=document.getElementById('ui-lab'),h='';
  for(var i=0;i<pots.length;i++){var p=pots[i];h+='<div class="pb" data-pi="'+i+'"><div class="pi">'+p.e+'</div><div class="pn">'+p.n+'</div><div class="pc">💎'+p.cost+'</div></div>'}
  g.innerHTML=h;
  g.querySelectorAll('.pb').forEach(function(el){
    var pi=parseInt(el.dataset.pi);
    el.addEventListener('touchstart',function(e){startDrag(e,pi,'potion')},{passive:false});
    el.addEventListener('mousedown',function(e){startDrag(e,pi,'potion')});
  });
}
function usePotion(pi){
  var p=pots[pi];
  if(S.gems<p.cost){toast('Sem gemas!');return}
  S.gems-=p.cost;S.potC++;sndPotion();p.fx();squish=.8;gainXP(3);toast(p.e+' '+p.n+'!');updateUI();save();
  var r=cvs.getBoundingClientRect();particle(PX+r.left,PY+r.top-PS*.3,p.e);
}

/* ===== CLOSET ===== */
var colors=[
  {n:'Azul',c:'#1a3a6a'},{n:'Verde',c:'#2E7D32'},{n:'Vermelho',c:'#C62828'},{n:'Roxo',c:'#6A1B9A'},
  {n:'Rosa',c:'#AD1457'},{n:'Laranja',c:'#E65100'},{n:'Amarelo',c:'#F9A825'},{n:'Cinza',c:'#455A64'},
  {n:'Marrom',c:'#4E342E'},{n:'Teal',c:'#00695C'},{n:'Indigo',c:'#283593'},{n:'Coral',c:'#FF7043'}
];
var hats=[
  {id:'party',n:'Festa'},{id:'crown',n:'Coroa'},{id:'cap',n:'Bone'},{id:'bow',n:'Laco'},
  {id:'tophat',n:'Chapeu'},{id:'santa',n:'Papai Noel'},{id:'flower',n:'Flor'},{id:'antenna',n:'Antena'},{id:'wizard',n:'Mago'}
];
var accs=[
  {id:'glasses',n:'Oculos'},{id:'sunglasses',n:'Oculos Escuros'},{id:'blush',n:'Blush'},
  {id:'mustache',n:'Bigode'},{id:'scarf',n:'Cachecol'},{id:'tie',n:'Gravata'},
  {id:'necklace',n:'Colar'},{id:'bowtie',n:'Papo'},{id:'eyepatch',n:'Pirata'}
];
var shoesList=[
  {id:'red',n:'Vermelho'},{id:'blue',n:'Azul'},{id:'green',n:'Verde'},
  {id:'gold',n:'Dourado'},{id:'pink',n:'Rosa'},{id:'brown',n:'Marrom'}
];

function buildCloset(){
  var g=document.getElementById('ui-closet'),h='';

  // Cores
  h+='<div class="cs"><h4>Cor do Pou</h4><div class="crow">';
  for(var i=0;i<colors.length;i++){
    var c=colors[i];
    h+='<div class="cd'+(S.color===c.c?' on':'')+'" style="background:'+c.c+'" data-col="'+c.c+'" title="'+c.n+'"></div>';
  }
  h+='</div></div>';

  // Chapeus
  h+='<div class="cs"><h4>Chapeus</h4><div class="crow">';
  h+='<div class="ho'+(S.hat===null?' on':'')+'" data-hat="none" title="Nenhum"><i class="fas fa-xmark"></i></div>';
  for(var i=0;i<hats.length;i++){
    var ht2=hats[i];
    h+='<div class="ho'+(S.hat===ht2.id?' on':'')+'" data-hat="'+ht2.id+'" title="'+ht2.n+'"><i class="fas fa-hat-wizard"></i></div>';
  }
  h+='</div></div>';

  // Acessorios
  h+='<div class="cs"><h4>Acessorios</h4><div class="crow">';
  h+='<div class="ho'+(S.acc===null?' on':'')+'" data-acc="none" title="Nenhum"><i class="fas fa-xmark"></i></div>';
  for(var i=0;i<accs.length;i++){
    var ac=accs[i];
    h+='<div class="ho'+(S.acc===ac.id?' on':'')+'" data-acc="'+ac.id+'" title="'+ac.n+'"><i class="fas fa-glasses"></i></div>';
  }
  h+='</div></div>';

  // Sapatos
  h+='<div class="cs"><h4>Sapatos</h4><div class="crow">';
  h+='<div class="cd'+(S.shoes===null?' on':'')+'" data-shoe="none" style="background:#E8973F" title="Padrao"></div>';
  for(var i=0;i<shoesList.length;i++){
    var sh=shoesList[i];
    var shCol=sh.id==='red'?'#E53935':sh.id==='blue'?'#1E88E5':sh.id==='green'?'#43A047':sh.id==='gold'?'#FFB300':sh.id==='pink'?'#EC407A':'#8D6E63';
    h+='<div class="cd'+(S.shoes===sh.id?' on':'')+'" data-shoe="'+sh.id+'" style="background:'+shCol+'" title="'+sh.n+'"></div>';
  }
  h+='</div></div>';

  g.innerHTML=h;

  // Eventos de cor
  g.querySelectorAll('[data-col]').forEach(function(el){
    el.addEventListener('click',function(){
      sndClick();S.color=el.dataset.col;buildCloset();updateUI();save();
    });
  });

  // Eventos de chapeu
  g.querySelectorAll('[data-hat]').forEach(function(el){
    el.addEventListener('click',function(){
      sndClick();S.hat=el.dataset.hat==='none'?null:el.dataset.hat;buildCloset();save();
    });
  });

  // Eventos de acessorio
  g.querySelectorAll('[data-acc]').forEach(function(el){
    el.addEventListener('click',function(){
      sndClick();S.acc=el.dataset.acc==='none'?null:el.dataset.acc;buildCloset();save();
    });
  });

  // Eventos de sapato
  g.querySelectorAll('[data-shoe]').forEach(function(el){
    el.addEventListener('click',function(){
      sndClick();S.shoes=el.dataset.shoe==='none'?null:el.dataset.shoe;buildCloset();save();
    });
  });
}

/* ===== INIT ===== */
updateUI();
buildGames();