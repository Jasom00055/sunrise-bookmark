
javascript:(()=>{
try{
const old=document.getElementById('sunrise-admin');
if(old){old.remove();return;}

const SUNRISE_BUILD='2026-11-07T18:33:00+08:00';
const CURRENCY_CAP=4503599627370495;
window.__sunriseBuildTimestamp=SUNRISE_BUILD;

const p=document.createElement('div');
p.id='sunrise-admin';
p.style='position:fixed;z-index:2147483647;top:12px;left:4%;width:92%;max-width:420px;box-sizing:border-box;background:#211b27;color:#ffe7ad;border:2px solid #bd914d;border-radius:14px;padding:14px;box-shadow:0 8px 40px #000;max-height:85vh;overflow:auto;font:16px sans-serif;';

p.innerHTML=`
<div id="sun-drag-handle" style="display:flex;justify-content:space-between;align-items:center;gap:6px;touch-action:none;user-select:none;cursor:grab">
<b style="font-size:19px">🌅 日出之國管理面板</b>
<div style="display:flex;gap:4px;flex-shrink:0">
<button id="sun-pin" title="釘選" style="width:auto;padding:5px 9px;margin:0">📌</button>
<button id="sun-min" title="縮小／展開" style="width:auto;padding:5px 10px;margin:0">－</button>
<button id="sun-close" title="關閉" style="width:auto;padding:5px 10px;margin:0">✕</button>
</div>
</div>
<div id="sun-content">
<hr style="border-color:#80613c">
<div id="sun-status" style="color:#a7f3d0;margin:10px 0">等待操作</div>
<button id="sun-diamond">💎 龍之鑽石 MAX</button>
<button id="sun-gold">🪙 金幣 MAX</button>
<button id="sun-items">🎒 背包物品數量 MAX</button>
<button id="sun-stats">📊 六項能力值 MAX（100）</button>
<button id="sun-equip">⚔️ 武器／防具強化 +15</button>
<button id="sun-acc">💍 飾品強化 +5</button>
<button id="sun-time">⏩ 全域時間 +24 小時</button>
<div style="font-size:12px;color:#bbb;margin-top:12px">
目標版本 v3.8.34<br>
背包數量 900,000,000｜武防 +15｜飾品 +5<br>
能力值 100｜時間調整 24 小時<br>
金幣／龍鑽上限：${CURRENCY_CAP}<br>
建置時間：${SUNRISE_BUILD}
</div>
</div>
<style>
#sunrise-admin button{
display:block;width:100%;padding:12px;margin:7px 0;
border:1px solid #98774c;border-radius:8px;
background:#393044;color:#ffe7ad;font-weight:bold;font-size:15px;
}
#sunrise-admin button:active{background:#685035}
#sunrise-admin #sun-drag-handle button{
touch-action:manipulation;
}
</style>`;
document.body.appendChild(p);

const $=id=>document.getElementById(id);
const status=t=>{
const el=$('sun-status');
if(el)el.textContent=t;
};

// 拖曳、觸控及釘選
let sunPinned=false;
let sunDragging=false;
let startX=0,startY=0,startLeft=0,startTop=0;

const handle=$('sun-drag-handle');

$('sun-pin').onclick=e=>{
e.stopPropagation();
sunPinned=!sunPinned;
$('sun-pin').textContent=sunPinned?'📍':'📌';
$('sun-pin').title=sunPinned?'解除釘選':'釘選';
handle.style.cursor=sunPinned?'default':'grab';
status(sunPinned?'📌 面板已釘選':'📍 已解除釘選');
};

$('sun-close').onclick=e=>{
e.stopPropagation();
p.remove();
};

handle.addEventListener('pointerdown',e=>{
if(sunPinned||e.target.closest('button'))return;

sunDragging=true;
const r=p.getBoundingClientRect();

startX=e.clientX;
startY=e.clientY;
startLeft=r.left;
startTop=r.top;

p.style.left=r.left+'px';
p.style.top=r.top+'px';
p.style.right='auto';
p.style.bottom='auto';

try{handle.setPointerCapture(e.pointerId);}catch(_){}
e.preventDefault();
});

handle.addEventListener('pointermove',e=>{
if(!sunDragging)return;

const maxLeft=Math.max(0,window.innerWidth-p.offsetWidth);
const maxTop=Math.max(0,window.innerHeight-p.offsetHeight);

p.style.left=Math.min(maxLeft,Math.max(0,startLeft+e.clientX-startX))+'px';
p.style.top=Math.min(maxTop,Math.max(0,startTop+e.clientY-startY))+'px';
});

const stopDrag=()=>{sunDragging=false;};
handle.addEventListener('pointerup',stopDrag);
handle.addEventListener('pointercancel',stopDrag);

// 縮小／展開
$('sun-min').onclick=e=>{
e.stopPropagation();
const c=$('sun-content');
const hidden=c.style.display==='none';
c.style.display=hidden?'block':'none';
$('sun-min').textContent=hidden?'－':'＋';
};

// 原有遊戲刷新及儲存功能
const done=()=>{
try{if(typeof calcStats==='function')calcStats();}catch(e){}
try{if(typeof renderTabs==='function')renderTabs();}catch(e){}
try{if(typeof updateUI==='function')updateUI();}catch(e){}
try{if(typeof saveGame==='function')saveGame();}catch(e){}
};

// 龍鑽 MAX
$('sun-diamond').onclick=()=>{
try{
if(typeof pandoraRestoreSharedDiamonds!=='function')
throw Error('找不到龍鑽修改函式');

const r=pandoraRestoreSharedDiamonds(CURRENCY_CAP);
if(!r||!r.ok)throw Error(r?.error||'修改失敗');

status('✅ 龍鑽 MAX 完成');
}catch(e){status('❌ '+e.message);}
};

// 金幣 MAX
$('sun-gold').onclick=()=>{
try{
if(typeof player==='undefined'||!player||
typeof player.gold!=='number')
throw Error('找不到角色金幣資料');

player.gold=CURRENCY_CAP;
done();
status('✅ 金幣 MAX 完成');
}catch(e){status('❌ '+e.message);}
};

// 背包物品 MAX
$('sun-items').onclick=()=>{
try{
if(typeof player==='undefined'||!Array.isArray(player.inv))
throw Error('找不到背包資料');

let n=0;
player.inv.forEach(item=>{
if(!item||typeof item!=='object')return;
item.cnt=900000000;
n++;
});

done();
status('✅ 背包修改完成：'+n+' 種物品');
}catch(e){status('❌ '+e.message);}
};

// 六項能力值
$('sun-stats').onclick=()=>{
try{
if(typeof player==='undefined'||!player.base)
throw Error('找不到角色能力值');

['str','dex','con','int','wis','cha'].forEach(k=>{
player.base[k]=100;
});

done();
status('✅ 六項基礎能力值已設定為 100');
}catch(e){status('❌ '+e.message);}
};

// 裝備清單
const getEquipList=()=>{
const all=[...(player.inv||[]),...Object.values(player.eq||{})];
return [...new Set(all.filter(x=>x&&typeof x==='object'&&x.id))];
};

const canEnhance=d=>{
if(!d)return false;
if(d.slot==='petwpn'||d.slot==='petarm'||d.noEnhance)return false;
if(typeof isRelic==='function'&&isRelic(d))return false;
return true;
};

// 武器／防具 +15
$('sun-equip').onclick=()=>{
try{
if(typeof player==='undefined'||!Array.isArray(player.inv)||
typeof DB==='undefined'||!DB.items)
throw Error('找不到裝備資料');

let n=0,skip=0;

getEquipList().forEach(item=>{
const d=DB.items[item.id];
if(!d||!['wpn','arm'].includes(d.type))return;
if(!canEnhance(d)){skip++;return;}
if(typeof enhanceCap==='function'&&enhanceCap(d)<15){skip++;return;}
item.en=15;
n++;
});

done();
status('✅ 武器／防具 +15：'+n+' 件，略過 '+skip+' 件');
}catch(e){status('❌ '+e.message);}
};

// 飾品 +5
$('sun-acc').onclick=()=>{
try{
if(typeof player==='undefined'||!Array.isArray(player.inv)||
typeof DB==='undefined'||!DB.items)
throw Error('找不到裝備資料');

let n=0,skip=0;

getEquipList().forEach(item=>{
const d=DB.items[item.id];
if(!d)return;

const type=String(d.type||'').toLowerCase();
const slot=String(d.slot||'').toLowerCase();

const isAcc=['acc','accessory'].includes(type)||
['ring','necklace','earring','accessory','acc'].includes(slot);

if(!isAcc)return;
if(!canEnhance(d)){skip++;return;}
if(typeof enhanceCap==='function'&&enhanceCap(d)<5){skip++;return;}

item.en=5;
n++;
});

done();
status('✅ 飾品 +5：'+n+' 件，略過 '+skip+' 件');
}catch(e){status('❌ '+e.message);}
};

// 全域時間 +24 小時
$('sun-time').onclick=()=>{
try{
if(!window.__sunriseNativeDateNow){
window.__sunriseNativeDateNow=Date.now.bind(Date);
window.__sunriseDateOffsetMs=0;

Date.now=function(){
return window.__sunriseNativeDateNow()+window.__sunriseDateOffsetMs;
};
}

window.__sunriseDateOffsetMs+=86400000;

status('⏩ 全域時間已累加 +24 小時，目前偏移 '+
Math.floor(window.__sunriseDateOffsetMs/3600000)+' 小時');

try{
if(typeof pandoraRelicBindBoardCountdowns==='function')
pandoraRelicBindBoardCountdowns();
}catch(e){}

}catch(e){status('❌ '+e.message);}
};

}catch(e){
alert('管理面板啟動失敗：'+e.message);
}
})();
