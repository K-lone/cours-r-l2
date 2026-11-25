(()=>{
const cfg=window.NOTES_CONFIG;if(!cfg)return;
const key='cours-r-l2-notes-v1';let state={id:'',ok:{}};
try{state=JSON.parse(localStorage.getItem(key))||state}catch(e){}
state.ok=state.ok||{};
const ids=Object.values(cfg.items).flat();
const root=document.getElementById('bilan-notes');
function save(){try{localStorage.setItem(key,JSON.stringify(state));return true}catch(e){return false}}
function mark(id){if(ids.includes(id)&&!state.ok[id]){state.ok[id]=true;save();render()}}
document.addEventListener('click',e=>{const b=e.target.closest('.quiz button');if(!b)return;const a=b.closest('.quiz').querySelector('input:checked');if(a&&a.value==='1')mark('q-'+a.name)});
function scan(){document.querySelectorAll('.note-r-validee[data-note]').forEach(n=>mark(n.dataset.note))}
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();
function report(){const sessions=Object.values(cfg.items).map(a=>({done:a.filter(x=>state.ok[x]).length,max:a.length}));const scores=sessions.map((a,i)=>cfg.weights[i]*a.done/a.max);return {id:state.id,sessions,scores,total:scores.reduce((a,b)=>a+b,0),done:sessions.reduce((a,b)=>a+b.done,0),max:ids.length}}
function render(){if(!root)return;const r=report();document.getElementById('scores-notes').innerHTML=r.sessions.map((s,i)=>`<p>Séance ${i+1} : ${s.done}/${s.max} réussites — ${r.scores[i].toFixed(2)}/${cfg.weights[i]}</p>`).join('')+`<h3>Note : ${r.total.toFixed(2)}/20</h3><p>${r.done}/${r.max} activités notées réussies</p>`}
if(!root)return;const input=document.getElementById('ident-notes'),status=document.getElementById('status-notes');input.value=state.id||'';input.addEventListener('input',()=>{state.id=input.value.trim();if(!save())status.textContent='Stockage local indisponible.'});render();
function valid(){if(!/^[A-Za-z0-9][A-Za-z0-9_-]{2,39}$/.test(state.id)){status.textContent='Saisissez votre code étudiant valide.';return false}return true}
document.getElementById('export-notes').onclick=()=>{if(!valid())return;const r=report();const csv='identifiant;S1;S2;S3;S4;S5;S6;total;reussites;maximum\n'+[r.id,...r.scores.map(x=>x.toFixed(2)),r.total.toFixed(2),r.done,r.max].join(';');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='bilan-R.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
document.getElementById('send-notes').onclick=()=>{if(!valid())return;if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(cfg.url)){status.textContent='Transmission non configurée. Téléchargez votre bilan.';return}const r=report();const f=document.createElement('form');f.method='POST';f.action=cfg.url;f.target='_blank';const x=document.createElement('input');x.type='hidden';x.name='payload';x.value=JSON.stringify({id:r.id,done:r.sessions.map(s=>s.done)});f.append(x);document.body.append(f);f.submit();f.remove();status.textContent='Vérifiez l’accusé de réception dans le nouvel onglet.'};
})();
