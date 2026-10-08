/* Pure workflow contracts: no browser, network, or production storage required. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const memory=new Map();
const context=vm.createContext({console,Date,Math,JSON,Number,String,Object,Array,Map,Set,Promise,
  localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)},
  fmt:(v,d=1)=>Number(v).toFixed(d),money:v=>(v/10000).toFixed(2)});
vm.runInContext(fs.readFileSync(path.join(__dirname,'src/model.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'src/workflow-model.js'),'utf8'),context);
const model=vm.runInContext('({numeric,newProject,blankRule,ruleErrors,blockingIssues,costTotals,makeDemo,evaluateProject,sanitizeProject,touch,rulesOf,csvParse,csvWrite,tableRecords,RULE_FIELDS})',context);
const plain=x=>JSON.parse(JSON.stringify(x));
const confirm=p=>{for(const role of Object.values(p.roles))for(const r of role.rules){r.status='已确认';r.confirmer='演示责任人';r.confirmedAt=new Date().toISOString();}return p;};
function task(){return confirm(model.makeDemo('tasks','task'));}
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}

test('空值、布尔值与数组不是数字；真实零保留',()=>{
  for(const value of ['', '  ',null,undefined,true,false,[],[1],'NaN','Infinity'])assert.equal(model.numeric(value),null);
  assert.equal(model.numeric(0),0);assert.equal(model.numeric('0'),0);assert.equal(model.numeric('1.25'),1.25);
});
test('空白空间无默认有效规则或分数',()=>{
  const p=model.newProject('outcomes');assert.equal(model.rulesOf(p).length,0);assert.equal(p.report,null);
  assert.equal(p.budget,'');assert.equal(p.baseline,'');assert.equal(p.target,'');
  assert.throws(()=>model.evaluateProject(p),/暂不能执行/);
});
test('执行API同样拦截未确认与不完整规则',()=>{
  const p=model.makeDemo('tasks','task');assert.throws(()=>model.evaluateProject(p),/待确认/);
  confirm(p);const r=p.roles.center.rules[0];r.max='';assert.throws(()=>model.evaluateProject(p),/字段不完整/);
  r.max='15';r.scope='标志性成果';assert.throws(()=>model.evaluateProject(p),/不匹配/);
});
test('比例规则要求正目标、单位与合法满分',()=>{
  const r=task().roles.center.rules.find(r=>r.method==='比例达成');
  r.target='0';assert(model.ruleErrors(r).some(s=>s.includes('目标须为正数')));
  r.target='3';r.max='-1';assert(model.ruleErrors(r).some(s=>s.includes('非负数')));
  r.max='10';r.unit='';assert(model.ruleErrors(r).some(s=>s.includes('单位')));
});
test('确认的930样例输出分项原因、公式和四档任务等级',()=>{
  const result=model.evaluateProject(task());assert.equal(result.rows.length,12);assert.equal(result.pending,0);
  assert(Math.abs(result.score-(100-10/3-1-2))<1e-9);assert.equal(result.status,'差');
  for(const r of result.rows){assert(r.reason);assert(r.calc);assert(r.evidence);assert(r.location);assert(r.rule.version);}
});
test('Excel模板的中心一级任务枚举与页面中心任务兼容',()=>{
  const p=task();for(const r of p.roles.center.rules)r.scope='中心一级任务';
  assert.equal(model.blockingIssues(p).length,0);assert(model.evaluateProject(p).score>0);
  p.roles.center.rules[0].rid='';assert(model.ruleErrors(p.roles.center.rules[0]).some(x=>x.includes('规则ID')));
});
test('缺证据与缺实际值为待核验，不自动零分',()=>{
  const p=task(),r=p.roles.center.rules.find(r=>r.method==='比例达成');
  p.facts[r._id].actual='';let result=model.evaluateProject(p);assert.equal(result.rows.find(x=>x.id===r._id).score,null);assert.equal(result.score,null);
  p.facts[r._id].actual='0';p.facts[r._id].evidence='';result=model.evaluateProject(p);assert.equal(result.rows.find(x=>x.id===r._id).score,null);
  p.facts[r._id].evidence='截至节点验收数量确为0';p.facts[r._id].actual=0;result=model.evaluateProject(p);
  assert.equal(result.rows.find(x=>x.id===r._id).score,0);assert.equal(result.rows.find(x=>x.id===r._id).fact,0);
});
test('超目标封顶且未通过验收可以零分',()=>{
  const p=task(),r=p.roles.center.rules.find(r=>r.method==='比例达成'),g=p.roles.center.rules.find(r=>r.method==='是否达成');
  p.facts[r._id].actual='1000';p.facts[g._id].actual='未通过';const result=model.evaluateProject(p);
  assert.equal(result.rows.find(x=>x.id===r._id).score,Number(r.max));assert.equal(result.rows.find(x=>x.id===g._id).score,0);
});
test('任意定性文字与公式不会冒充模型结果',()=>{
  const p=task(),r=p.roles.center.rules[0];p.demoKey=null;r.method='人工评议';r.criteria='凭直觉给满分';
  const result=model.evaluateProject(p);assert.equal(result.rows.find(x=>x.id===r._id).score,null);assert.equal(result.score,null);
  assert.match(result.rows.find(x=>x.id===r._id).reason,/不解读任意公式/);
});
test('优差演示确认后复现90与19.096；成本包含API',()=>{
  const good=confirm(model.makeDemo('outcomes','good')),poor=confirm(model.makeDemo('outcomes','poor'));
  assert.equal(model.evaluateProject(good).score,90);assert(Math.abs(model.evaluateProject(poor).score-19.096)<1e-9);
  assert.equal(model.costTotals(good).known,1000000);assert.equal(model.costTotals(poor).known,1500000);
});
test('成本缺项保留未知，零费用必须显式填写',()=>{
  const p=model.newProject('outcomes');p.hr=[{category:'正式员工',months:'1',rate:'',allocation:'1'}];
  let total=model.costTotals(p);assert.equal(total.unknown,1);assert.equal(total.complete,false);assert.equal(total.lines[0].amount,null);
  p.hr[0].rate='0';total=model.costTotals(p);assert.equal(total.complete,true);assert.equal(total.lines[0].amount,0);
  p.resources=[{category:'API',quantity:'1',rate:'50',allocation:'',equivalent:'1'}];assert.equal(model.costTotals(p).unknown,1);
});
test('完整备份重映射事实而不继承审批、旧报告或演示开关',()=>{
  const original=task();original.report=model.evaluateProject(original);const old=original.roles.center.rules[0];
  original.facts[old._id].actual=0;const imported=model.sanitizeProject(plain(original)),r=imported.roles.center.rules[0];
  assert.notEqual(imported.id,original.id);assert.notEqual(r._id,old._id);assert.equal(imported.facts[r._id].actual,'0');
  assert.equal(imported.facts[r._id].evidence,original.facts[old._id].evidence);assert.equal(imported.facts[r._id].location,original.facts[old._id].location);
  assert.equal(r.status,'待确认');assert.equal(r.confirmedAt,'');assert.equal(imported.report,null);assert.equal(imported.demoKey,null);
  assert.equal(imported.facts[old._id],undefined);assert.throws(()=>model.evaluateProject(imported),/待确认/);
});
test('重复旧规则ID不将证据错误绑定到两个新指标',()=>{
  const raw=plain(task()),first=raw.roles.center.rules[0];raw.roles.center.rules[1]._id=first._id;
  const imported=model.sanitizeProject(raw);assert.equal(imported.facts[imported.roles.center.rules[0]._id],undefined);assert.equal(imported.facts[imported.roles.center.rules[1]._id],undefined);
});
test('修改使历史报告失效且不会回写历史事实和分数',()=>{
  const p=task();p.report=model.evaluateProject(p);const score=p.report.score,oldRevision=p.report.revision,oldSnapshot=JSON.stringify(p.report.snapshot);
  p.facts[p.roles.center.rules[0]._id].actual='未通过';model.touch(p,'更新验收结果');
  assert(p.revision>oldRevision);assert.equal(p.demoKey,null);assert.equal(p.report.score,score);assert.equal(JSON.stringify(p.report.snapshot),oldSnapshot);
  assert.equal(p.report.invalidatedReason,'更新验收结果');assert.equal(p.report.invalidatedByRevision,p.revision);
});
test('CSV中文多行引号往返和公式注入防护',()=>{
  const rows=[['指标','说明'],['科学创新','首行\n次行含"引号",逗号'],['=HYPERLINK("url")','普通内容']];
  const out=model.csvParse(model.csvWrite(rows));assert.equal(out[1][1],rows[1][1]);assert.equal(out[2][0],"'"+rows[2][0]);
  assert.throws(()=>model.csvParse('"未闭合'),/引号未闭合/);
});


test('四档依据条件判定，高档复核不能覆盖缺口或缺证据',()=>{
  const p=task();
  for(const r of p.roles.center.rules)p.facts[r._id].actual=r.method==='是否达成'?'通过':r.target;
  assert.equal(model.evaluateProject(p).status,'中');
  p.taskRating='优';assert.equal(model.evaluateProject(p).status,'中');
  p.taskRatingReason='已达到确认规则中的优秀锚点，模拟证据 §2';p.taskRatingConfirmer='演示科管';
  assert.equal(model.evaluateProject(p).status,'优');
  p.taskRating='良';assert.equal(model.evaluateProject(p).status,'良');
  const rule=p.roles.center.rules.find(r=>r.method==='比例达成');p.facts[rule._id].actual='0';
  assert.equal(model.evaluateProject(p).status,'差');
  p.facts[rule._id].evidence='';assert.equal(model.evaluateProject(p).status,'待核验');
});
test('等级依据进入快照，改变复核会使旧报告失效',()=>{
  const p=task();p.taskRating='中';p.taskRatingReason='模拟等级依据';p.taskRatingConfirmer='科管';
  p.report=model.evaluateProject(p);assert.equal(p.report.snapshot.taskRatingReason,'模拟等级依据');
  p.taskRatingReason='新依据';model.touch(p,'调整任务分档依据');
  assert.equal(p.report.snapshot.taskRatingReason,'模拟等级依据');assert(p.report.invalidatedAt);
});

test('schema3旧报告仅迁移一次，保留旧快照和角色key',()=>{
  const old=plain(task());delete old.taskRatingVersion;
  old.report=model.evaluateProject(old);delete old.report.ratingBasis;old.report.status='不合格（模拟）';
  const snapshot=JSON.stringify(old.report.snapshot),originalRevision=old.revision;
  const storage=new Map([['lab-evaluation-workbench-v3',JSON.stringify({schema:3,projects:[old],active:{tasks:old.id},kind:'tasks',role:'center'})]]);
  const source=['model.js','workflow-model.js'].map(f=>fs.readFileSync(path.join(__dirname,'src',f),'utf8')).join('\n');
  function load(){const c=vm.createContext({console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});vm.runInContext(source+'\npersist();',c);return vm.runInContext('project("tasks")',c);}
  const first=load();assert.equal(first.revision,originalRevision+1);assert(first.report.invalidatedAt);assert(first.roles.center);
  assert.equal(JSON.stringify(first.report.snapshot),snapshot);assert.equal(load().revision,first.revision);
});
console.log('Workflow verification complete: '+passed+' checks passed.');
