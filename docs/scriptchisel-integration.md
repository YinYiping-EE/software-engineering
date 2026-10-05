# ScriptChisel 与算数记

两个页面在同一网站使用顶部切换栏：算数记为 `/`，ScriptChisel 项目展示为 `/scriptchisel/`。同源部署共用 HTTPS 和历史身份 Cookie；返回算数记会从原后端读取记录。项目展示保留原有中文内容、GIF 动画、流程 / 硬件切换、键盘操作和图片放大。导航文案跟随算数记已保存的语言选择。

来源工程：`E:/keshe/upper_machine/website`。其 `dist/` 是独立静态交付目录，已经复制到 `frontend/public/scriptchisel/`；原工程没有修改。仅给复制后的 index.html 加入同站页面导航。原来的 styles.css、main.js 和所有 assets 原样保留。素材来源说明及原始 README 位于本目录的 `scriptchisel/`。

公共导航样式和静态页脚本位于 `public/navigation/`，计算器对应 Vue 组件为 `src/PageSwitcher.vue`。没有将两个工程的主体样式混用。Nginx 对 `/scriptchisel` 重定向到带斜杠的地址，以确保相对资源路径正确；此目录和 `/navigation/` 的缺失资源严格返回 404，不返回计算器 HTML。

本机打开 `http://127.0.0.1:5173/` 或 `http://127.0.0.1:5173/scriptchisel/`，不需要另开预览服务。线上为 `https://47.117.170.115/` 和 `https://47.117.170.115/scriptchisel/`。新版仍用原发布脚本整体打包、校验上传和切换目录。

原工程更新后，在当前工程根目录运行 `./deploy/import-scriptchisel.ps1`，重新导入已更新的 dist；默认来源可通过 SourceDirectory 参数改变。先在本地检查页面和资源，再运行 `./deploy/publish.ps1` 发布。直接编辑导入副本的 index.html 会在重新导入时被覆盖，应在导入脚本中维护整合部分。源工程的辅助 Python、检查脚本、截图、日志与 zip 不作为服务器网站部署内容。

已验证双向页面切换、当前页面高亮、手机宽度布局、动画暂停 / 播放、流程方向键切换、硬件模块切换及图片预览 Esc 关闭。导入后 21 个资源文件与原工程 SHA256 相同，index.html 仅加入共享导航。Vite 配置给开发和 preview 服务增加静态目录首页解析，避免 /scriptchisel/ 落入计算器的 SPA 回退。
