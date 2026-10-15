import {writeFileSync} from 'node:fs';
import {createSite} from './helpers.mjs';
import axe from 'axe-core';
const reports=[];
function setup(file='index.html'){const site=createSite({file});site.w.eval(axe.source);return site;}

async function audit(w,name,selector='body'){
 const result=await w.axe.run(w.document.querySelector(selector),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']},rules:{'color-contrast':{enabled:false}}});
 const entry={name,passes:result.passes.length,violations:result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))};
 reports.push(entry);console.log(name,entry.violations.length?'FAIL '+JSON.stringify(entry.violations):'PASS');
}
const site=setup();const {dom,w}=site;
await audit(w,'Discover');
w.setView('makers');await audit(w,'Maker directory');
w.setView('saved');await audit(w,'Empty saved objects');
site.evaluate("state.collection='makers';renderGallery()");await audit(w,'Empty followed makers');
w.setView('discover');w.document.querySelector('#search').value='no-such-object';w.document.querySelector('#search').dispatchEvent(new w.Event('input'));await audit(w,'Search empty state');
w.setView('discover');w.document.querySelector('#refine-toggle').click();await audit(w,'Expanded filters');
const objects=site.evaluate('PRODUCTS');
for(const p of objects){w.navigate('object',p.id);await audit(w,'Object: '+p.id,'#product-dialog');}
const makers=site.evaluate('DESIGNERS');
for(const d of makers){w.navigate('maker',d.id);await audit(w,'Maker: '+d.id,'#product-dialog');}
w.closeExplorer();w.showInfo('about');await audit(w,'About dialog','#info-dialog');w.document.querySelector('#info-dialog').close();w.showInfo('credits');await audit(w,'Credits dialog','#info-dialog');
dom.window.close();
for(const file of ['assets/classics/credits.html','assets/portraits/credits.html','accessibility.html']){const d=setup(file);await audit(d.w,file);d.dom.window.close();}
if(process.env.AXE_REPORT_PATH)writeFileSync(process.env.AXE_REPORT_PATH,JSON.stringify({engine:axe.version,scope:'WCAG 2.2 A/AA tagged rules and best practices in JSDOM. Contrast and rendered layout require separate checks.',reports},null,2));
const violations=reports.reduce((n,r)=>n+r.violations.length,0);
console.log(JSON.stringify({states:reports.length,violations,incomplete:reports.filter(r=>r.incomplete.length).map(r=>({name:r.name,rules:r.incomplete}))}));
process.exitCode=violations?1:0;
