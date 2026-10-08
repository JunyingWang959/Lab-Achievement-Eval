from pathlib import Path
import base64
import argparse

ROOT = Path(__file__).resolve().parent
src = ROOT / 'src'
parser = argparse.ArgumentParser()
parser.add_argument('--output', default='index.html')
args = parser.parse_args()
output = ROOT / args.output
css = '\n'.join((src / f).read_text(encoding='utf-8-sig') for f in ['style.css', 'refine.css', 'workflow.css', 'leader.css', 'centers.css', 'presentation.css'])
template_path = ROOT / 'templates' / 'evaluation-template.xlsx'
template = base64.b64encode(template_path.read_bytes()).decode('ascii')
vendor_license = (src / 'vendor/JSZip-LICENSE.txt').read_text(encoding='utf-8').split('GPL version 3')[0].strip()
js = (src / 'vendor/jszip.min.js').read_text(encoding='utf-8') + '\nconst TEMPLATE_XLSX_BASE64="' + template + '";\n'
js += '\n'.join((src / f).read_text(encoding='utf-8-sig') for f in ['routing.js', 'model.js', 'centers.js', 'app.js', 'views.js', 'featured.js', 'workflow-model.js', 'workflow-ui.js', 'leader-overview.js', 'workflow-controller.js'])

icons = {
    'overview': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><path d="M3 15h7v6H3zM14 14h7v7h-7z"/>',
    'target': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    'award': '<circle cx="12" cy="8" r="5"/><path d="m8 12-2 10 6-3 6 3-2-10"/>',
    'file': '<path d="M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h8"/>',
    'table': '<path d="M4 4h16v16H4zM4 9h16M9 9v11M4 14h16"/>',
    'flow': '<path d="M3 3h7v7H3zM14 14h7v7h-7zM10 6h8v8M6 10v8h8"/>',
}

def nav(key, url, title, icon):
    svg = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' + icons[icon] + '</svg>'
    return f'<a class="nav-link" data-nav="{key}" href="#/{url}">{svg}{title}</a>'

report_nav = nav('overview', 'overview', '中心评价总览', 'overview') + nav('featured', 'case-study', '关键案例 · 建设方案', 'file')
work_nav = nav('workbench', 'workspace', '填报与评测入口', 'table')

html = '<!DOCTYPE html>\n<!-- Third-party notice: JSZip\n' + vendor_license + '\n-->\n' + '''
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>实验室成果评价 · 汇报与评测</title><meta name="description" content="领导汇报得分看板、任务与成果报告，以及业务填报和成果评测。">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2314253f'/%3E%3Cpath d='M7 23V16h4v7m3 0V11h4v12m3 0V6h4v17' fill='%239fc1ff'/%3E%3C/svg%3E"><style>''' + css + '''</style></head>
<body><div class="layout"><aside class="sidebar"><div class="brand"><span class="brand-mark">研</span>实验室成果评价</div><div class="brand-sub">RESEARCH EVALUATION</div>
<div class="nav-caption">评价汇报</div><nav aria-label="评价汇报">''' + report_nav + '''</nav>
<div class="nav-secondary work-nav"><div class="nav-caption">填报与评测</div><nav aria-label="填报与评测">''' + work_nav + '''</nav></div>
<div class="sidebar-foot"><strong>930 里程碑评估</strong>大模型 / 评测 / 智能体</div></aside><div>
<header class="topbar"><span><span id="top-section">评价汇报</span><span style="padding:0 9px;color:#bcc5d0">/</span><strong id="breadcrumb">中心评价总览</strong></span><div class="top-right"><span class="date" id="display-period">评估节点 2026.09.30</span></div></header>
<main class="content" id="main" tabindex="-1"></main></div></div><noscript>请在浏览器中启用 JavaScript，以查看计算结果和任务明细。</noscript><script>''' + js + '''</script></body></html>'''
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(html, encoding='utf-8')
print(str(output))
