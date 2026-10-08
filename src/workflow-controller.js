function downloadFile(name,data,type='application/json;charset=utf-8'){const blob=data instanceof Blob?data:new Blob([data],{type});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function jsonDownload(name,data){downloadFile(name,JSON.stringify(data,null,2));}
function showNotice(message){WF_NOTICE=message;render(false);}
function addProject(p){STORE.projects.push(p);STORE.active[p.kind]=p.id;STORE.kind=p.kind;WF_EDIT=null;IMPORT_PREVIEW=null;persist();}
function render(scroll=true){
  normalizeLocation();
  const parts=routePart(),route=parts[0]||'overview';
  const work=route==='workbench'||route==='intake'||(['tasks','outcomes'].includes(route)&&['input','rules','run'].includes(parts[1]));
  if(work&&['tasks','outcomes'].includes(route))STORE.kind=route;
  if(route==='intake'&&['tasks','outcomes'].includes(parts[2]))STORE.kind=parts[2];
  $('#top-section').textContent=work?'填报与评测':'评价汇报';
  $('#display-period').textContent=work?'本机草稿':'评估节点 2026.09.30';
  if(work){
    document.querySelectorAll('[data-nav]').forEach(a=>{const on=a.dataset.nav==='workbench';a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    $('#breadcrumb').textContent=route==='workbench'?'填报与评测入口':route==='intake'?'规则与材料填报':route==='tasks'?'中心任务工作台':'成果评价工作台';
    $('#main').innerHTML=presentationHtml(route==='workbench'?workbenchPage(parts[1]==='rules'):route==='intake'?intakePage(parts[1]):workflowPage(route,parts[1]));
    persist();if(scroll){window.scrollTo(0,0);if(route==='workbench'&&parts[1]==='rules')document.getElementById('scoring-reference')?.scrollIntoView({block:'start'});}
  }else renderLegacy();
}

function navigate(hash){const href=routeHref(hash);if(location.hash===href)render();else location.hash=href;}
function updateDraftHints(p,keys){const mode=document.querySelector('.wf-package>.btn-row>.pill');if(mode){mode.textContent=p.demoKey?'预设方案':'本机填报草稿';mode.className='pill '+(p.demoKey?'amber':'blue');}if(keys[0]==='rule'){const pill=document.querySelector('.rule-editor>.panel-head>.pill');if(pill){pill.textContent='草稿';pill.className='pill amber';}const edit=document.querySelector('.rule-intake-table [data-id="'+keys[2]+'"]');const status=edit?.closest('tr')?.querySelector('.pill');if(status){status.textContent='草稿';status.className='pill amber';}}}
function onFieldInput(el){const bind=el.dataset.bind;if(!bind)return;const p=project(),keys=bind.split('.'),value=el.value;let previous,keepDemo=false;
  if(keys[0]==='project'){previous=p[keys[1]];p[keys[1]]=value;if(keys[1]==='reviewNotes'){persist();return;}}
  else if(keys[0]==='role'){previous=p.roles[keys[1]].note;p.roles[keys[1]].note=value;}
  else if(keys[0]==='rule'){const r=p.roles[keys[1]].rules.find(r=>r._id===keys[2]);if(!r)return;previous=r[keys[3]];r[keys[3]]=value;r.status='草稿';r.confirmedAt='';keepDemo=keys[3]==='confirmer';}
  else if(keys[0]==='cost'){const row=p[keys[1]][Number(keys[2])];if(!row)return;previous=row[keys[3]];row[keys[3]]=value;}
  else if(keys[0]==='fact'){const f=p.facts[keys[1]]||(p.facts[keys[1]]={});previous=f[keys[2]];f[keys[2]]=value;}else return;
  if(previous!==value){touch(p,'更新填报：'+bind,keepDemo);updateDraftHints(p,keys);const box=document.querySelector('.rule-validation');if(box&&keys[0]==='rule'){const r=p.roles[keys[1]].rules.find(r=>r._id===keys[2]),errors=ruleErrors(r);box.textContent=errors.length?'待补充 '+errors.length+' 项：'+errors.join('；'):'字段完整，可以记录责任方的本地确认。';}const tally=document.querySelector('.cost-tally');if(tally&&keys[0]==='cost'){const t=costTotals(p);tally.textContent='全部已填投入的可计算金额：'+money(t.known)+'万元；'+(t.unknown?t.unknown+'行参数待补全，非完整总成本。':'录入金额已重算，凭证待业务方复核。');}const note=document.querySelector('.wf-notice');if(note)note.textContent=storageOK?'修改已保存在本机；规则或输入变更后需重新执行。':'本机保存失败，请导出填报包。';}
}
function proposeRules(p){if(p.demoKey&&rulesOf(p).length){showNotice('预设方案已包含建议规则，请查看各项权重、条件与证据后确认。');return;}const material=Object.values(p.roles).flatMap(x=>x.materials).filter(m=>m.text);const source=p.description.trim()?p.description:material.map(m=>m.text).join('\n');if(!source.trim())throw Error('请先输入作战图 / 成果正文，或上传可提取文字的材料。');let lines=source.split(/[\n。；]/).map(s=>s.trim()).filter(s=>s.length>4&&(/\d|目标|完成|达到|建设|验证|交付|突破/.test(s)));if(!lines.length)lines=[source.slice(0,180)];lines=[...new Set(lines)].slice(0,8);let added=0;const role=p.kind==='tasks'?'center':'chief';for(const [i,line]of lines.entries()){if(p.roles[role].rules.some(r=>r.definition===line))continue;const r=blankRule(p,role);Object.assign(r,{rid:'SUG-'+(i+1),applies:p.center+(p.title?' / '+p.title:''),indicator:line.slice(0,36),definition:line,source:'文本候选提取（本地计算）',status:'待补全',notes:'候选文本来自：'+(p.description.trim()?'填报正文 / 摘要':material.map(m=>m.name).join('；'))+'。请核对评价周期；不自动认定数字为目标，不自动分配权重。'});p.roles[role].rules.push(r);added++;}touch(p,'生成 '+added+' 条文本候选规则');showNotice('已新增 '+added+' 条建议草稿。目标、满分、分档、证据要求及确认人需业务方填写；其他责任方请在各自入口补充。');}
async function executeEvaluation(p){const issues=blockingIssues(p);if(issues.length)throw Error('尚不能执行：'+issues.slice(0,3).join('；'));if(EXECUTION)return;const snapshot=clone(p);EXECUTION={projectId:p.id,stage:0};render(false);try{for(let i=1;i<4;i++){await new Promise(resolve=>setTimeout(resolve,420));EXECUTION.stage=i;render(false);}p.report=evaluateProject(snapshot);p.audit.unshift({at:new Date().toISOString(),action:'完成本地计算评测，绑定输入版本 r'+snapshot.revision});persist();WF_NOTICE=p.revision===snapshot.revision?'评测已完成。请展开各指标查看计算、原因和证据定位。':'执行期间输入已变化；生成报告对应旧输入，请重新评测。';}finally{EXECUTION=null;render(false);}}
async function handleAction(el){const action=el.dataset.action,p=project(),role=el.dataset.role||STORE.role,r=p.roles[role]?.rules.find(x=>x._id===el.dataset.id);WF_NOTICE='';
  switch(action){
    case 'new-project':addProject(newProject(p.kind));navigate(p.kind+'/input');break;
    case 'demo-task':case 'demo-good':case 'demo-poor':{const kind=action==='demo-task'?'tasks':'outcomes',key=action.replace('demo-','');addProject(makeDemo(kind,key));WF_NOTICE='已新建评价，原草稿保留。评分规则尚待确认。';navigate(kind+'/input');break;}
    case 'save':persist();showNotice(storageOK?'草稿已保存在此浏览器。跨电脑使用请导出填报包。':'本机存储不可用，请导出填报包。');break;
    case 'export-project':jsonDownload((p.title||'未命名评价')+'-填报包.json',{schema:3,exportedAt:new Date().toISOString(),...p,report:null});showNotice('填报包已导出，包含文本、规则与投入明细；不包含原始附件二进制。重新导入后需再次确认规则。');break;
    case 'kind-tasks':case 'kind-outcomes':STORE.kind=action==='kind-tasks'?'tasks':'outcomes';WF_EDIT=null;IMPORT_PREVIEW=null;persist();if(routePart()[0]==='intake')navigate('intake/'+STORE.role+'/'+STORE.kind);else render(false);break;
    case 'download-xlsx':{const binary=atob(TEMPLATE_XLSX_BASE64),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));downloadFile('evaluation-template.xlsx',new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));showNotice('Excel模板已下载。请由各责任方填报对应工作表，再导入预览。');break;}
    case 'download-csv':downloadFile(ROLE_META[role].name+'-规则模板.csv',csvWrite([RULE_FIELDS.map(f=>f[1]),RULE_FIELDS.map(([k])=>k==='owner'?ROLE_META[role].name:'')]),'text/csv;charset=utf-8');break;
    case 'export-rules':jsonDownload(ROLE_META[role].name+'-规则.json',{schema:3,rules:p.roles[role].rules});break;
    case 'add-rule':{const row=blankRule(p,role);p.roles[role].rules.push(row);WF_EDIT=row._id;touch(p,'新增'+ROLE_META[role].name+'规则');render(false);document.getElementById('rule-editor')?.scrollIntoView({block:'start',behavior:'smooth'});break;}
    case 'edit-rule':WF_EDIT=el.dataset.id;render(false);document.getElementById('rule-editor')?.scrollIntoView({block:'start',behavior:'smooth'});break;
    case 'goto-edit':WF_EDIT=el.dataset.id;STORE.role=role;navigate('intake/'+role);break;
    case 'close-editor':WF_EDIT=null;render(false);break;
    case 'remove-rule':p.roles[role].rules=p.roles[role].rules.filter(x=>x._id!==el.dataset.id);delete p.facts[el.dataset.id];touch(p,'移除一条规则');render(false);break;
    case 'confirm-rule':{if(!r)return;const errors=ruleErrors(r);if(errors.length)throw Error('规则尚不能确认：'+errors.join('；'));r.status='已确认';r.confirmedAt=new Date().toISOString();touch(p,ROLE_META[role].name+'规则本地确认：'+r.indicator,true);showNotice('已记录本地确认。离线版不验证填写者身份，正式审批需接入账号与权限。');break;}
    case 'confirm-demo':if(!p.demoKey)throw Error('只有未修改的内置预设方案支持批量确认。');for(const data of Object.values(p.roles))for(const rule of data.rules){rule.confirmer='预设规则确认';rule.status='已确认';rule.confirmedAt=new Date().toISOString();}touch(p,'预设规则批量确认（责任方）',true);showNotice('预设规则已确认，可以执行。此按钮仅用于内置预设方案，不是正式审批。');break;
    case 'apply-import':{if(!IMPORT_PREVIEW||IMPORT_PREVIEW.projectId!==p.id)throw Error('评价对象已变化，请重新导入预览。');for(const b of IMPORT_PREVIEW.batches){if(b.costType)p[b.costType].push(...b.rows);else p.roles[b.role].rules.push(...b.rules);}touch(p,'导入规则与投入：'+IMPORT_PREVIEW.name);IMPORT_PREVIEW=null;showNotice('已追加导入，请按责任方核对字段并确认规则。');break;}
    case 'cancel-import':IMPORT_PREVIEW=null;render(false);break;
    case 'add-cost':{const type=el.dataset.cost,fields=type==='hr'?HR_FIELDS:RES_FIELDS;p[type].push(Object.fromEntries(fields.map(([k])=>[k,''])));touch(p,'新增投入明细');render(false);break;}
    case 'remove-cost':p[el.dataset.cost].splice(Number(el.dataset.index),1);touch(p,'移除投入明细');render(false);break;
    case 'export-cost':{const type=el.dataset.cost,fields=type==='hr'?HR_FIELDS:RES_FIELDS;downloadFile((type==='hr'?'人力':'资源')+'投入.csv',csvWrite([fields.map(f=>f[1]),...p[type].map(row=>fields.map(([k])=>row[k]))]),'text/csv;charset=utf-8');break;}
    case 'remove-material':p.roles[role].materials=p.roles[role].materials.filter(m=>m.id!==el.dataset.id);touch(p,'移除材料登记');render(false);break;
    case 'propose':proposeRules(p);break;
    case 'execute':await executeEvaluation(p);break;
    case 'export-report':if(p.report)jsonDownload((p.title||'评价')+'-报告.json',{...p.report,currentRevision:p.revision,stale:p.report.revision!==p.revision,reviewNotes:p.reviewNotes,disclaimer:'本地计算结果，非正式绩效认定；本地确认不验证身份。'});break;
    case 'export-report-csv':if(p.report)downloadFile((p.title||'评价')+'-得分.csv',csvWrite([['报告状态','责任方','维度','指标','得分','满分','事实','规则','计算','得分原因','证据','定位','规则版本'],...p.report.rows.map(r=>[p.report.revision!==p.revision?'旧版本报告':'本地计算',ROLE_META[r.role].name,r.dimension,r.name,r.score===null?'待核验':r.score,r.max,r.fact,r.rule.criteria,r.calc,r.reason,r.evidence,r.location,r.rule.version])]),'text/csv;charset=utf-8');break;
  }
}
async function handleUpload(input){const p=project(),role=STORE.role,files=Array.from(input.files||[]),type=input.dataset.upload;if(!files.length)return;WF_NOTICE='正在本机读取文件…';render(false);try{for(const file of files){if(file.size>15*1024*1024)throw Error('单文件上限15MB，请拆分。');if(type==='project-import'){const raw=JSON.parse(await file.text()),imported=sanitizeProject(raw);addProject(imported);WF_NOTICE='已导入填报包；规则需重新确认，旧报告与标识不会带入。';navigate(imported.kind+'/input');}
    else if(type==='rubric-import'){const batches=await parseRuleImport(file,p,role);if(project().id!==p.id)throw Error('读取期间评价对象发生变化，请重新导入。');IMPORT_PREVIEW={name:file.name,projectId:p.id,batches};WF_NOTICE='规则表已读取，请检查预览后追加。';}
    else if(type.startsWith('cost-')){const costType=type.slice(5),fields=costType==='hr'?HR_FIELDS:RES_FIELDS,rows=tableRecords(csvParse(await file.text()),fields);if(!rows)throw Error('未找到投入表头，请先导出本页CSV使用相同列名。');const valid=rows.filter(r=>present(r.category));if(!valid.length)throw Error('未发现已填写的投入行。');if(valid.length>200)throw Error('单次最多导入200行。');p[costType].push(...valid);touch(p,'导入投入明细：'+file.name);WF_NOTICE='已追加 '+valid.length+' 行投入，请核对数量、单价、分摊与凭证。';}
    else if(type.startsWith('material-')){const who=type.slice(9),content=await materialText(file);p.roles[who].materials.push({id:uid('material'),name:file.name,size:file.size,...content,source:'本机选择',at:new Date().toISOString()});touch(p,'读取材料：'+file.name);WF_NOTICE='材料已在本机登记。'+content.status+'；保存文字副本与文件信息，不保存原始附件。';}
  }}catch(e){WF_NOTICE='读取失败：'+e.message;}render(false);}
document.addEventListener('input',event=>{if(event.target.dataset.bind)onFieldInput(event.target);});
document.addEventListener('change',event=>{const el=event.target;if(el.dataset.upload){handleUpload(el);return;}if(el.dataset.action==='select-project'){STORE.active[STORE.kind]=el.value;WF_EDIT=null;IMPORT_PREVIEW=null;WF_NOTICE='';persist();render(false);}else if(el.tagName==='SELECT'&&el.dataset.bind)onFieldInput(el);});
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.tagName==='SELECT'||el.disabled)return;event.preventDefault();handleAction(el).catch(e=>showNotice('操作未完成：'+e.message));});
window.addEventListener('hashchange',()=>{WF_NOTICE='';IMPORT_PREVIEW=null;render();});
render();


