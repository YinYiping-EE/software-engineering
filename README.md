# 算数记 · 前端

这是前后端分离计算器的 Vue 网页。提供算式输入、按钮和键盘操作、结果展示、历史查询、指定记录删除及算式复用。所有计算结果来自后端；网页不执行核心计算，也不使用 LocalStorage 保存历史。

## 在线演示与仓库

**[前后端页面公开演示：https://47.117.170.115/](https://47.117.170.115/)**

本仓库：[https://github.com/YinYiping-EE/software-engineering](https://github.com/YinYiping-EE/software-engineering)。

## 环境和启动

Node.js 24.12 或更高版本，npm。克隆本仓库后，在仓库根目录执行：

```powershell
npm ci
npm run dev
```

访问 `http://127.0.0.1:5173/`。后端应同时运行在 `http://127.0.0.1:3001`。保存前端代码后，Vite 自动更新页面。

在包含前后端的父工作区中，也可在父目录运行 `npm install` 和 `npm run dev` 一起启动两个服务。

## 配置和接口连接

`vite.config.js` 中配置本机端口 5173 和 `/api` 代理，目标为后端 3001 端口。前端始终请求相对 `/api` 地址；修改后端端口时，要同步修改该代理配置。

| 方法 | 地址 | 用途 |
|---|---|---|
| POST | `/api/calculations` | 发送 `{ "expression": "(1+2)*3" }`，由后端计算并保存 |
| GET | `/api/calculations?limit=20&offset=0` | 获取历史及总数 |
| DELETE | `/api/calculations/{id}` | 删除指定记录，之后重新查询历史 |

本仓库无需数据库初始化。SQLite 初始化、读写与删除由后端负责。页面刷新时会重新读取数据库记录。

## 使用

可输入数字、加减乘除、小数和括号。键盘支持 `*`、`/`、`-`；按钮显示 `×`、`÷`、`−`。输入框内按 Enter 计算、Escape 清空。未聚焦输入框时，也可用数字和运算符键输入、Backspace 退格。每次成功计算自动保存。

历史列表每页 20 条，可加载更多。点击历史算式可复用；垃圾桶按钮删除对应记录。后台不可用时显示连接错误，不会在前端自行计算。

每条新记录显示提交时的访问地、IP、设备、操作系统和浏览器；这些信息随历史保存在后端。本机预览显示“本机访问”，公网 IP 归属地标明“估算”；旧记录没有采集来源时显示“来源未记录”，不会补写当前访问者的信息。当前没有账号登录，访问地代表计算请求的来源。

界面包含按键波纹及按压反馈、结果切换、记录新增和删除过渡、列表移动、保存和复用提示、加载旋转及服务状态呼吸效果。动效遵循系统 `prefers-reduced-motion` 设置；选择减少动态效果时保留功能和静态反馈。

背景使用从 [Hero Patterns](https://heropatterns.com/) 获取的 Plus SVG 纹理，结合流动光晕和漂浮运算符。点击页面或按钮会出现扩散光圈和运算符粒子。页脚可暂停 / 开启背景及点击动效；网页隐藏时暂停背景并清理点击粒子。素材已存入本地并随构建打包，不依赖远程素材请求。作者、授权和修改说明见 [素材来源](docs/asset-sources.md)，页面页脚也保留署名。

右下角的“算数鲸”使用原项目的鲸鱼娘形象，可点击提示、Q 弹按压、拖动贴边及收起。它显示后端结果、保存状态、记录数量和错误原因，并提供示例算式入口。鼠标 / 触摸可以拖动，聚焦后方向键也可移动；位置和收起偏好刷新后保留。按用户要求，用原版图片进行非商业作业演示，图片文件保持原样；来源及原作者的许可范围说明见 [算数鲸说明](docs/whale-widget.md)。

## 构建与部署

```powershell
npm run build
npm run preview
```

构建文件在 `dist/`，本机构建预览端口为 4173，需后端保持运行。公网部署时，将 `dist/` 交由静态服务器托管，同时为 `/api` 配置反向代理。`vite preview` 仅用于本机检查构建结果。

## 主要文件

- `src/App.vue`：计算器交互、API 请求、记录展示与删除。
- `src/AmbientEffects.vue`：动态背景、点击粒子及动效生命周期管理。
- `src/MusicPlayer.vue`：专注电台、进度、音量、自动切歌与播放模式。
- `src/music-library.js`：歌曲配置和独立封面；音频位于 `public/music/`。
- `src/CalculatorWhale.vue`：原版形象展示、计算器提示与拖拽交互。
- `src/assets/original-whale.png`：原项目 `assets/DSniang1.png` 的原样副本。
- `src/assets/hero-plus.svg`：网上获取的背景纹理素材。
- `src/style.css`：桌面和手机样式。
- `vite.config.js`：开发地址、接口代理。
- `codestyle.md`：代码规范与参考来源。

本目录作为独立前端仓库维护，远程地址为 https://github.com/YinYiping-EE/software-engineering 。

历史使用服务器签名的浏览器身份隔离，同源标签页共享记录；换浏览器或清除 Cookie 后无法访问原身份记录。写请求由页面自动添加校验请求头，生产用同源 HTTPS 接口。

挂件按可视窗口宽度和高度连续自动缩放（原版形象 72–160 CSS 像素），支持调整窗口和横竖屏；气泡限制宽高并在必要时滚动，拖动和贴边位置随尺寸重新计算。已核对手机、平板、桌面与短横屏的挂件和气泡边界。

专注电台内置三首带独立封面缩略图的轻音乐，点击一次播放后按歌单自动连播。支持列表循环、单曲循环、随机与顺序播放，音量和模式保存在本机；刷新不自动播放。素材署名见 `public/music/credits.md`，添加歌曲说明见 [音乐播放器说明](docs/music-player.md)。

顶部 English / 中文按钮切换整页语言，包括按钮可访问名称、错误提示、来源标签、音乐歌单、算数鲸和服务器状态。语言保存在 `calculator-language`，切换不重载页面、不清空算式或中断音乐。翻译集中在 `src/locale.js`。

同站集成 ScriptChisel 项目展示，顶部页面切换栏可在算数记 `/` 和 `/scriptchisel/` 间切换。导入副本在 `public/scriptchisel/`，支持原有动画、工作流程、硬件模块和图片预览。详情与更新方式见 [项目展示整合说明](docs/scriptchisel-integration.md)。

顶部使用用户提供的 MU / FZU 原始 Logo，点击在新标签页打开学院官网。`src/ServerStatus.vue` 展示阿里云部署说明及 `/api/status` 的真实指标，每 30 秒更新，可手动刷新；离线时标注状态不可用和旧数据，隐藏页面停止轮询。开发环境明确显示本机指标。背景光晕、纹理、漂浮符号周期除以 1.3（速度提升 30%），点击动效与音乐动画不受影响。

## 作业博客与安全检查

[中文博客](docs/assignment/blog-zh.md) · [English blog](docs/assignment/blog-en.md) · [公开前安全检查](docs/security-review.md)。博客包含公网地址、PSP、17 张实际演示截图和两张结构图。
