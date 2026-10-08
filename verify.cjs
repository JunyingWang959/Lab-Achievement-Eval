const fs=require('fs'),vm=require('vm'),assert=require('assert');
const main={innerHTML:''},crumb={textContent:''};
const ctx={console,document:{querySelector:s=>s==='#main'?main:crumb,querySelectorAll:()=>[],addEventListener:()=>{}},window:{addEventListener:()=>{},scrollTo:()=>{}},location:{hash:''}};
vm.createContext(ctx);
vm.runInContext(['routing.js','model.js','centers.js','app.js','views.js','featured.js','leader-overview.js'].map(f=>fs.readFileSync(__dirname+'/src/'+f,'utf8')).join('\n'),ctx);
const run=s=>vm.runInContext(s,ctx);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
assert.equal(run('DEMO.tasks.flatMap(t=>t.items).length'),12);
close(run('centerResult().score'),93+2/3);
assert.equal(run('centerResult().pass'),9);
assert.equal(run('centerResult().status'),'差');
close(run('caseResult(DEMO.cases[0]).total'),90);
close(run('caseResult(DEMO.cases[1]).total'),19.096);
close(run('resourceResult(DEMO.cases[1]).roi'),533+1/3);
close(run('resourceResult(DEMO.cases[0]).cost'),1000000);
close(run('resourceResult(DEMO.cases[1]).cost'),1500000);
assert.equal(run('resourceResult({...DEMO.cases[0],api:null})'),null);
assert.equal(run('resourceResult({...DEMO.cases[0],hours:0,formal:0,intern:0,api:0})'),null);
assert.equal(run('resourceResult({...DEMO.cases[0],hours:-1})'),null);
close(run('resourceResult({...DEMO.cases[0],performance:50}).score'),0);
assert.equal(run('caseResult({...DEMO.cases[0],levels:[3,null,4,3]}).grade'),'待核验');
assert.equal(run('caseResult({...DEMO.cases[0],levels:[4,4,2,4]}).excellent'),false);
run('DEMO.common.target=60');assert.equal(run('resourceResult(DEMO.cases[0])'),null);run('DEMO.common.target=80');
assert.ok(run("taskPage('plateau')").includes('pill amber">中'));
run('DEMO.tasks[0].items[0].actual=null');
close(run('centerResult().score'),78+2/3);close(run('centerResult().upper'),93+2/3);
assert.equal(run('centerResult().status'),'待核验');
assert.ok(run('dashboard()').includes('78.7–93.7'));
assert.ok(run("taskPage('peak')").includes('暂不扣分，分值区间0–15'));
run('DEMO.tasks[0].items[0].actual=1');
run('DEMO.cases[0].api=null');assert.ok(run("casePage('good')").includes('材料待核验'));assert.ok(run('outcomes()').includes('当前数据未齐全'));
run('DEMO.cases[0].api=116000');
const routes=['overview','tasks','task/peak','task/plateau','task/data','task/platform','outcomes','case/good','case/good/science','case/good/cost','case/poor','case/poor/science','case/poor/cost','roi','rules','comparison','task-report','outcome-report','featured','center/evaluation/planning'];
routes.push(...run("CENTERS.flatMap(c=>['overview','tasks','outcomes'].map(v=>'center/'+c.id+'/'+v))"));
routes.push(...run("CENTERS.filter(c=>c.id!=='evaluation').flatMap(c=>c.tasks.map(t=>'task/'+t.id))"));
routes.push(...run("CENTER_OUTCOMES.map(o=>'outcome/'+o.id)"));
for(const route of routes){ctx.location.hash='#'+route;run('renderLegacy()');assert.ok(main.innerHTML.length>500,route);assert.ok(!main.innerHTML.includes('NaN'),route);assert.ok(!main.innerHTML.includes('undefined'),route);assert.ok(!main.innerHTML.includes('不合格'),route);}
for(const id of run('CENTERS.map(c=>c.id)')){
  close(run(`getCenter('${id}').tasks.reduce((s,t)=>s+t.max,0)`),100);
  assert(run(`centerOutcomes(getCenter('${id}')).length`)>=2);
  assert(run(`centerPage('${id}').includes('href="#center/${id}/outcomes"')`));
}
for(const id of run('CENTER_OUTCOMES.map(o=>o.id)')){
  assert.ok(run(`getTask(CENTER_OUTCOMES.find(o=>o.id==='${id}').task)`));
  const r=run(`outcomeResult(CENTER_OUTCOMES.find(o=>o.id==='${id}'))`);
  assert(r.total>=0&&r.total<=100);close(r.total,r.value+r.resource.budgetScore+r.resource.roiScore);
}
assert(run("leaderOverview().includes('93.7') && leaderOverview().includes('86.0')"));
assert.deepEqual(Array.from(run('CENTERS.map(c=>c.id).sort()')),['agent','evaluation','foundation']);
const overview=run('presentationHtml(leaderOverview())');
assert.equal((overview.match(/class="center-card"/g)||[]).length,3);
assert.equal((overview.match(/href=/g)||[]).length,3,'总览仅通过三张中心卡片进入详情');
assert(!overview.includes('催化材料')&&!overview.includes('embedded-rules'));
for(const alias of ['tasks','outcomes']){ctx.location.hash='#'+alias;run('renderLegacy()');assert.equal(main.innerHTML,overview);}
assert(run("centerPage('agent').includes('href=\"#comparison\"')"),'优差案例仍可进入');
assert(run("featuredPage().includes('人力投入及说明') && featuredPage().includes('Context')"));
const html=fs.readFileSync(fs.existsSync(__dirname+'/index.html')?__dirname+'/index.html':__dirname+'/dist/index.html','utf8');
assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));
assert.ok(!/fetch\(|XMLHttpRequest|https?:\/\/.*\.(js|css)["']/.test(html));
assert.deepEqual([...html.matchAll(/data-nav="([^"]+)"/g)].map(m=>m[1]),['overview','featured','workbench']);
ctx.localStorage={getItem:()=>null,setItem:()=>{}};
ctx.document.getElementById=()=>null;
vm.runInContext(['workflow-model.js','workflow-ui.js','workflow-controller.js'].map(f=>fs.readFileSync(__dirname+'/src/'+f,'utf8')).join('\n'),ctx);
const workflowRoutes=['workbench','workbench/rules',...['tasks','outcomes'].flatMap(kind=>['input','rules','run'].map(step=>kind+'/'+step)),...['center','chief','hr','resource'].flatMap(role=>['tasks','outcomes'].map(kind=>'intake/'+role+'/'+kind))];
for(const route of workflowRoutes){ctx.location.hash='#'+route;run('render()');assert(main.innerHTML.length>500,route);assert(!/NaN|undefined/.test(main.innerHTML),route);}
ctx.location.hash='#intake/hr/outcomes';run('render()');assert.equal(run('project().kind'),'outcomes');
ctx.location.hash='#center/evaluation';run('render()');assert.equal(run('project().kind'),'outcomes','查看领导报告不改变当前填报对象');
ctx.location.hash='#workbench';run('render()');assert(main.innerHTML.includes('href="#/workspace/intake/hr/outcomes"'));
ctx.location.hash='#intake/hr/outcomes';run('render()');run("handleAction({dataset:{action:'kind-tasks'}})");run('render()');assert.equal(run('project().kind'),'tasks','角色页切换类型后路由与草稿保持一致');
assert.equal(run('STORE.projects.length'),2,'导航不创建额外评价');
for(const route of [...routes,...workflowRoutes]){
  const canonical=run(`routeHref(${JSON.stringify(route)})`);
  assert(/^#\/[a-z0-9/-]+$/.test(canonical),canonical);
  assert.equal(run(`routeHref(${JSON.stringify(canonical)})`),canonical,'canonical routes are stable');
  ctx.location.hash=canonical;run('render()');
  assert(main.innerHTML.length>500,canonical);
  const visible=main.innerHTML.replace(/<[^>]*>/g,'');
  assert(!/模拟|演示|v0\.4|展示编制|阶段轨迹为。/.test(visible),canonical);
  for(const link of main.innerHTML.matchAll(/href="(#[^"]*)"/g))assert(/^#\/[a-z0-9/-]+$/.test(link[1]),canonical+' '+link[1]);
}
run("const legacyPreset=makeDemo('tasks','task');legacyPreset.title='旧评价（演示）';legacyPreset.report={status:'差（模拟）'};");
assert.equal(run('presentationProject(legacyPreset).title'),'旧评价');
assert.equal(run('presentationProject(legacyPreset).report.status'),'差');
assert.equal(run('legacyPreset.title'),'旧评价（演示）','presentation must not alter saved snapshots');
run("const authoredDraft=newProject('tasks');authoredDraft.title='模拟器技术研究';");
assert.equal(run('presentationProject(authoredDraft).title'),'模拟器技术研究','user-authored content is preserved');
for(const [kind,key] of [['tasks','task'],['outcomes','good'],['outcomes','poor']]){
  run(`addProject(makeDemo('${kind}','${key}'));for(const role of Object.values(project().roles))for(const rule of role.rules){rule.status='已确认';rule.confirmer='责任方';}project().report=evaluateProject(project());`);
  for(const page of ['input','rules','run']){ctx.location.hash=`#/workspace/${kind}/${page}`;run('render()');assert(!/模拟|演示|v0\.4|展示编制/.test(main.innerHTML.replace(/<[^>]*>/g,'')),kind+'/'+key+'/'+page);}
}
console.log(`PASS: task/case totals, center/outcome relationships, evidence gates, ${routes.length} report views, ${workflowRoutes.length} workflow routes, navigation/draft isolation, self-contained HTML.`);

