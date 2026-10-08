/* ASCII hash routes work under both file URLs and GitHub Pages repository paths. */
function routePart(hash=location.hash){
  const p=String(hash||'').replace(/^#?\/?/,'').split('/').filter(Boolean);
  if(!p.length)return ['overview'];
  if(p[0]==='workspace')return p[1]==='intake'?['intake',...p.slice(2)]:['tasks','outcomes'].includes(p[1])?[p[1],...p.slice(2)]:['workbench',...p.slice(1)];
  if(p[0]==='centers')return ['center',...p.slice(1)];
  if(p[0]==='tasks'&&p[1]&&!['input','rules','run'].includes(p[1]))return ['task',...p.slice(1)];
  if(p[0]==='outcomes'&&p[1]&&!['input','rules','run'].includes(p[1]))return ['outcome',...p.slice(1)];
  if(p[0]==='cases')return ['case',...p.slice(1)];
  if(['case-study','featured'].includes(p[0]))return ['overview'];
  if(p[0]==='reports')return [p[1]==='tasks'?'task-report':'outcome-report'];
  return p;
}
function routeHref(route){
  const p=routePart(route),[name,...tail]=p;
  let path;
  if(name==='center')path=['centers',...tail];
  else if(name==='task')path=['tasks',...tail];
  else if(name==='outcome')path=['outcomes',...tail];
  else if(name==='case')path=['cases',...tail];
  else if(name==='workbench')path=['workspace',...tail];
  else if(name==='intake')path=['workspace','intake',...tail];
  else if(['tasks','outcomes'].includes(name))path=tail.length?['workspace',name,...tail]:['overview'];
  else if(name==='task-report')path=['reports','tasks'];
  else if(name==='outcome-report')path=['reports','outcomes'];
  else if(name==='rules')path=['workspace','rules'];
  else if(name==='roi')path=['cases','good','cost'];
  else path=p;
  return '#/'+path.join('/');
}
function presentationHtml(html){return html.replace(/href="#([^"\s]*)"/g,(_,route)=>'href="'+routeHref(route)+'"');}
function normalizeLocation(){if(typeof history!=='undefined'){const href=routeHref(location.hash);if(location.hash!==href)history.replaceState(null,'',href);}}

// Legacy preset snapshots retain their original text in storage. Only their view is relabeled.
function displayLabel(value){return String(value??'').replace(/（(?:模拟|演示|演示内置|模拟占位|演示口径|离线模拟)）/g,'').replace(/演示包/g,'预设方案').replace(/演示规则/g,'预设规则').replace(/模拟[:：]?|演示/g,'').replace(/DEMO\s*0\.1/gi,'R1').replace(/\s*·\s*$/,'');}
function presentationProject(p){
  if(!p?.demoKey)return p;
  const structural=new Set(['id','_id','demoKey','kind','method','scope']);
  function copy(value,key=''){
    if(typeof value==='string')return structural.has(key)?value:displayLabel(value);
    if(Array.isArray(value))return value.map(v=>copy(v));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copy(v,k)]));
    return value;
  }
  const view=copy(p);if(view.report)view.report.status=displayLabel(view.report.status);return view;
}
