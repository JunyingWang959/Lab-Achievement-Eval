'use strict';
const DEMO = {
  asOf:'2026-09-30', version:'R1',
  tasks:[
    {id:'peak',name:'高峰垂直能力评测',owner:'张子澄',max:25,next:'1230：≥5项薄弱能力清单回流高原基模；≥6个科学场景。',items:[
      {name:'高峰能力评测体系',goal:'1套高峰能力评测体系（科学智能评测能力原子维度）',target:1,actual:1,unit:'套',weight:15,type:'gate',proof:'评测体系文档、原子能力维度定义及验收记录',method:'体系成型且原子能力维度完整，经验收通过计满分。',note:'形成1套，原子维度完整，验收通过。'},
      {name:'科学场景覆盖',goal:'≥3个科学场景',target:3,actual:2,unit:'个',weight:10,type:'ratio',proof:'场景清单、各场景评测结果和验收记录',method:'只计截至930验收通过的独立场景，超额封顶。',note:'2个场景完成验收，第3个尚未通过。'}]},
    {id:'plateau',name:'高原评训一体化反馈',owner:'贾琪',max:25,next:'1230：失败案例≥500例、根因分析≥10份、≥1个评训闭环验证、各方向增强样本累计≥2万条。',items:[
      {name:'错误类型与归因分类体系',goal:'1套错误类型与归因分类体系',target:1,actual:1,unit:'套',weight:8,type:'gate',proof:'分类体系文档、标注规范与验收记录',method:'类型定义、归因标准和使用规范均经验收通过。',note:'体系与标注规范齐备，验收通过。'},
      {name:'错误轨迹分析方法',goal:'1套多样化场景（科学、代码、安全等）错误轨迹分析方法',target:1,actual:1,unit:'套',weight:10,type:'gate',proof:'方法文档、科学/代码/安全覆盖矩阵及分析样例',method:'一套方法覆盖约定场景，并完成验收。具体场景口径待确认。',note:'科学、代码、安全三类场景覆盖并通过验收。'},
      {name:'数据收集管线',goal:'≥1个开源/自研数据收集管线',target:1,actual:1,unit:'个',weight:7,type:'ratio',proof:'可运行代码、版本记录、运行日志及验收记录',method:'按可运行且通过验收的管线数量计分。',note:'1个自研管线可运行并通过验收。'}]},
    {id:'data',name:'科学数据能力评测',owner:'张驰',max:30,next:'1230：≥100个案例的数据评测集；支撑研发数据智能体；≥100个数据skill回流端砚。',items:[
      {name:'数据能力评测集',goal:'1套包含20个数据能力评测集',target:20,actual:18,unit:'个',weight:10,type:'ratio',proof:'评测集目录、质量检查及验收记录',method:'按已验收的评测集数/20计分；完整套件需20个均通过。',note:'20个已整理，18个通过验收，2个仍待修订。'},
      {name:'全学科科学数据治理平台',goal:'1套全学科科学数据治理平台',target:1,actual:1,unit:'套',weight:8,type:'gate',proof:'平台、学科覆盖矩阵与验收记录',method:'平台验收通过且约定学科覆盖矩阵齐备；“全学科”范围待确认。',note:'1套平台及约定学科覆盖矩阵通过验收。'},
      {name:'数据线索规模',goal:'8000条数据线索',target:8000,actual:8000,unit:'条',weight:8,type:'ratio',proof:'去重后的线索清单与有效性抽检记录',method:'以去重且有效的线索数计分；有效性判据为拟定口径。',note:'去重后的有效线索8000条。'},
      {name:'分类分级',goal:'数据线索分类分级',target:1,actual:1,unit:'项',weight:4,type:'gate',proof:'分类分级规范、实施结果及抽检记录',method:'规范及实施结果经验收通过计满分。',note:'完成分类分级并通过抽检。'}]},
    {id:'platform',name:'司南评测平台建设',owner:'董鉴欣',max:20,next:'1230：月度主观榜单；反馈数据资产库1万条；8家行业主流机构生态合作。',items:[
      {name:'主观体验及价值评测体系',goal:'1套主观体验及价值评测体系',target:1,actual:1,unit:'套',weight:8,type:'gate',proof:'评价维度、评分规范和验收记录',method:'体系及评分规范经验收通过计满分。',note:'1套体系与评分规范通过验收。'},
      {name:'定时评测报告响应机制',goal:'建立定时评测报告响应机制',target:1,actual:1,unit:'项',weight:6,type:'gate',proof:'机制文件、报告周期、响应责任与运行记录',method:'机制建立且具备完整运行记录，经验收通过。',note:'机制已建立，周期和责任明确，已试运行。'},
      {name:'主流模型厂商主动送测',goal:'3家主流模型厂商主动送测',target:3,actual:2,unit:'家',weight:6,type:'ratio',proof:'厂商去重清单、主动送测函或登记记录',method:'按符合约定“主流厂商”口径的主动送测主体去重计数。',note:'2家有主动送测记录，第3家尚未送测。'}]}
  ],
  science:[
    {name:'新增科学认识',weight:20,levels:['未提出明确科学问题；或提交材料不足以支持科学认识。','完成检索、预测或benchmark改善，尚未证明新增科学认识。','提出具体可证伪假设并有初步支持，但与已有工作的差异不清。','形成新关联或机理解释，有对照支持，并说明与已有工作的区别。','新认识在多条件下成立，关键替代解释被排除，明确推进现有理解。']},
    {name:'实证质量与效果',weight:20,levels:['当前提交材料不包含可判断核心科学结论的证据。','只有计算预测、展示性样例或零散实验，效果无法确认。','有可追溯实验与对照，但重复、统计或关键条件仍有缺口。','按预定方案完成独立样本重复、合理对照与不确定性报告。','完整对照、多批次及稳健性检验，效果及不确定性均满足预定条件。']},
    {name:'独立验证与可复现',weight:20,levels:['原始数据、代码或步骤不完整，当前材料不足以复查核心结论。','提供部分材料，仅作者团队成功。','团队内部可从原始数据复现，版本与步骤基本完整。','独立人员在洁净环境复现关键分析或实验，差异已记录解释。','独立合作团队按冻结方案复现核心科学结论，证据链完整。']},
    {name:'需求价值与适用边界',weight:20,levels:['没有明确需求或使用对象。','用途停留在设想，关键使用条件未验证。','证明一个环节有用，但应用链条、适用范围或失败条件不清。','目标场景验证完成，交付物可用，适用范围与主要失败条件明确。','多个代表场景显示稳定价值，使用方验证完成，形成可复用能力。']}
  ],
  common:{budget:1200000,base:60,target:80,hourRate:25.2,formalRate:50000,internRate:10000},
  cases:[
    {id:'good',label:'优例',title:'形成可验证、可复现的科学成果',performance:82,hours:20000,formal:6,intern:8,api:116000,levels:[3,4,4,3],
      verdict:'建议进入总师复核与下一阶段验证',summary:'在预算内达到流程能力目标；材料支持一个材料体系中的科学新关联，并完成独立复现。',
      evidence:[
        {fact:'提出局部结构与催化活性关联的可证伪假设，设计配对对照并完成同类工作差异分析。',reason:'对照支持新关联，达到3档。仅一个材料体系，不支持普适机理结论。',gap:'扣5分：尚未在更多体系排除关键替代解释。'},
        {fact:'12个候选中选择C7，在3个独立制备批次验证；相对基准活性提升32%，95%置信区间23%–42%。冻结验收条件为提升≥20%且区间下限>10%，对照与稳健性检查通过。',reason:'在同温度、同负载与同测量流程下比较；预定对照、重复和不确定性均满足评价条件，达到4档。',gap:'本项不扣分。'},
        {fact:'独立合作组按冻结方案复验，提升29%，95%置信区间22%–36%；材料包含原始记录、实验步骤与分析版本。',reason:'核心科学结论经独立合作组复验，证据链可追溯，达到4档。',gap:'本项不扣分；正式评价须取得真实复验材料。'},
        {fact:'交付候选、验证流程与失败条件，可用于下一轮筛选；尚无长周期运行与跨材料体系验证。',reason:'目标情景可用且边界明确，达到3档。',gap:'扣5分：未完成多情景迁移与长周期验证。'}],
      actions:['总师组织新颖性、机理与证据复核。','保持小规模验证投入，补齐跨体系与长周期验证。'],
      stages:[{label:'起点',cost:0,p:60},{label:'阶段1',cost:20,p:68},{label:'阶段2',cost:55,p:76},{label:'930',cost:100,p:82}]},
    {id:'poor',label:'差例',title:'能力未达标，科学结论证据不足',performance:68,hours:30000,formal:9,intern:12,api:174000,levels:[1,1,0,1],
      verdict:'补齐关键证据后复评，暂缓扩大投入',summary:'成本超预算25%，只完成目标增益的40%；当前提交材料不足以支持科学新认识和独立复现。',
      evidence:[
        {fact:'模型生成更多候选，冻结盲测成功率由60%升至68%，主要展示预测排序与两个材料样例。',reason:'流程能力改善不等于科学发现；未证明超出已有认识，按1档。',gap:'扣15分：缺少新科学认识及与已有工作的实质差异证据。'},
        {fact:'一个样例自述活性提升约8%，只有单批制备和技术重复，无独立制备批次；未报告可靠的不确定性。',reason:'不能排除批次差异或测量波动，无法确认科学效果，按1档。',gap:'扣15分：缺少独立重复、完整对照与不确定性分析。'},
        {fact:'对当前提交包的清点已完成，原始记录、完整环境和独立复验材料均未交付。',reason:'当前提交包不足以复查核心结论，按0档；不据此断言项目没有价值。',gap:'扣20分：提交证据不足。正式材料未到位时应标待核验，不自动认定为0档。'},
        {fact:'提出用于下一轮筛选的设想，但未验证目标场景、适用边界与失败条件。',reason:'应用价值仍为设想，按1档。',gap:'扣15分：缺少目标场景验证与适用范围证据。'}],
      actions:['补齐原始数据与版本环境，完成独立制备重复和合理对照。','由独立人员复现核心结果，更新边界后重新评审。','核查超预算原因；复评前不按本分数自动作资源决策。'],
      stages:[{label:'起点',cost:0,p:60},{label:'阶段1',cost:30,p:64},{label:'阶段2',cost:85,p:66},{label:'930',cost:150,p:68}]}
  ]
};
function itemScore(i){if(i.actual===null)return null;return i.weight*(i.type==='gate'?(i.actual>=i.target?1:0):Math.min(Math.max(i.actual,0)/i.target,1));}
function taskResult(t){const known=t.items.filter(i=>i.actual!==null);const pass=known.filter(i=>i.actual>=i.target).length;const fail=known.length-pass;const unknown=t.items.length-known.length;const score=known.reduce((s,i)=>s+itemScore(i),0);return{score,upper:score+t.items.filter(i=>i.actual===null).reduce((s,i)=>s+i.weight,0),pass,fail,unknown,status:unknown?'待核验':fail?'差':(t.demoRating||'中')};}
function centerResult(){return taskResult({items:DEMO.tasks.flatMap(t=>t.items)});}
function resourceResult(c,k=DEMO.common){if(![c.hours,c.formal,c.intern,c.api,c.performance].every(x=>Number.isFinite(x)&&x>=0)||c.performance>100||![k.budget,k.base,k.target,k.hourRate,k.formalRate,k.internRate].every(Number.isFinite)||k.base<0||k.target>100||k.hourRate<=0||k.formalRate<=0||k.internRate<=0)return null;const compute=c.hours*k.hourRate;const labor=c.formal*k.formalRate+c.intern*k.internRate;const cost=compute+labor+c.api;if(cost<=0||k.budget<=0||k.target<=k.base)return null;const delta=Math.max(0,c.performance-k.base);const q=Math.max(0,Math.min(1,delta/(k.target-k.base)));const roi=delta/(cost/1e8);const targetRoi=(k.target-k.base)/(k.budget/1e8);const budgetScore=8*q*Math.min(1,k.budget/cost);const roiScore=12*q*Math.min(1,roi/targetRoi);return{compute,labor,cost,delta,q,roi,targetRoi,budgetScore,roiScore,score:budgetScore+roiScore,weightedMonths:c.formal+.2*c.intern};}
function caseResult(c){const resource=resourceResult(c);const complete=Array.isArray(c.levels)&&c.levels.length===4&&c.levels.every(x=>Number.isInteger(x)&&x>=0&&x<=4);const science=complete?c.levels.reduce((s,x)=>s+5*x,0):null;const total=resource&&complete?science+resource.score:null;const excellent=total!==null&&total>=85&&science>=60&&c.levels.every(x=>x>=3)&&c.performance>=DEMO.common.target;return{science,resource,total,excellent,grade:total===null?'待核验':excellent?'优':total<60?'差':'待复核'};}
