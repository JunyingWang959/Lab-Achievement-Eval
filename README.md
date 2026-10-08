# Research Evaluation

实验室成果评价前端，包含大模型中心、评测中心、智能体中心的任务与成果报告，以及材料填报、规则确认、评测和报告导出流程。

## 使用

直接打开根目录 `index.html` 即可使用。无需安装运行依赖；页面及 Excel 填报模板均已内嵌。

本地预览也可在此文件夹运行：

```sh
python -m http.server 8765 --bind 127.0.0.1
```

浏览器访问 `http://127.0.0.1:8765/#/overview`。

## 上传 GitHub / 发布页面

1. 新建英文仓库，例如 `research-evaluation`。
2. 上传本文件夹**里面的全部内容**到仓库根目录，确保 `index.html` 位于根目录。
3. 若需要网页访问，在仓库 `Settings → Pages` 中选择 `Deploy from a branch`，再选择上传所用分支和 `/(root)`，保存。
4. 使用 GitHub Pages 返回的站点地址。项目页面一般为 `https://<account>.github.io/research-evaluation/#/overview`。

已提供 `.nojekyll`；无需服务端重写规则。英文哈希路由在 GitHub Pages 的仓库子路径下也可刷新、分享和前进后退。发布配置见 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 页面路径

| 页面 | 路径 |
| --- | --- |
| 中心评价总览 | `#/overview` |
| 大模型中心 | `#/centers/foundation` |
| 评测中心 | `#/centers/evaluation` |
| 智能体中心 | `#/centers/agent` |
| 中心任务 / 关键成果 | `#/centers/<center>/tasks`、`#/centers/<center>/outcomes` |
| 任务详情 | `#/tasks/<task-id>` |
| 成果详情 | `#/outcomes/<outcome-id>` |
| 关键案例 | `#/case-study` |
| 填报与评测 | `#/workspace` |
| 任务流程 | `#/workspace/tasks/input`、`rules`、`run` |
| 成果流程 | `#/workspace/outcomes/input`、`rules`、`run` |
| 责任方填报 | `#/workspace/intake/<role>/<kind>` |

旧版哈希链接保持兼容，打开后自动规范为新路径。界面继续使用中文。

## 修改与验证

修改 `src/`，然后在此目录运行：

```sh
python build.py --output index.html
node verify.cjs
node workflow-verify.cjs
```

构建仅使用 Python 标准库；检查仅使用 Node 内建模块。无需 `npm install`。

## 文件

- `index.html`：可直接部署的完整网页。
- `src/`：页面、计分、工作流和路由源码。
- `templates/evaluation-template.xlsx`：空白填报模板。
- `build.py`：重新生成网页。
- `verify.cjs`、`workflow-verify.cjs`：页面、英文路由、流程和计分检查。
- `THIRD_PARTY_NOTICES.md`：第三方许可说明。

此目录不包含原始会议文档、交接说明、本机依赖、浏览器草稿或账号资料。

## 维护说明

内置汇报和预设方案仍使用合成案例数据，未接入真实大模型或服务端审批；按汇报要求，页面省略了相应展示标签，由汇报者说明。去除标签不改变数据性质、评分算法或证据要求。新建评价保持留白，缺失证据进入待核验。

数据仅保存在当前浏览器，存储 key 为 `lab-evaluation-workbench-v3`，schema 为 `3`。页面汇报与工作台报告彼此独立；输入修改会使旧报告失效。切换域名、浏览器或从本地文件迁往站点前，请导出填报包。GitHub Pages 不会同步本地草稿；上传的文件只在浏览器解析，不会传给服务器。
