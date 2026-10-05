# 背景素材来源

## 用户指定的标识

学院 Logo 使用用户提供的 `logo-MU&FZU.png`，原样复制到 `src/assets/branding/mu-fzu.png`；页面链接到 https://miec.fzu.edu.cn/。阿里云图标使用用户提供的 `alibabacloud-color.svg`，原样复制到同目录的 `alibabacloud.svg`。两者只用于本站标识和部署说明，没有重新绘制或调整原文件内容。

背景光晕、Plus 纹理和漂浮符号的动画周期及时间偏移除以 1.3，以保持相位关系并把速度提升 30%；暂停、后台暂停与减少动态效果规则仍生效。

## 专注电台

预置 Carefree、Dream Culture、Easy Lemon 三首轻音乐，作者 Kevin MacLeod，来自 incompetech.com，采用 CC BY 4.0 署名授权。音频原样保存在 `public/music/`，页面提供音乐署名链接；逐曲官方来源、许可证和变更说明见 `public/music/credits.md`，文件校验见 `public/music/manifest.json`。每曲独立的原创 SVG 插画封面在 `src/assets/music/`，不使用第三方专辑图片。播放器及歌单缩略图随当前曲目更新。

- 素材：Plus（可平铺 SVG 加号纹理）。
- 作者：Steve Schoger。
- 官方来源：https://heropatterns.com/。
- 原始下载：https://heropatterns.com/svg/plus.zip。
- 本地文件：`src/assets/hero-plus.svg`。
- 授权：Creative Commons Attribution 4.0 International（CC BY 4.0），https://creativecommons.org/licenses/by/4.0/。
- 获取日期：2026-10-04。
- 修改：填充颜色由黑色改为 `#8492c8`；在页面中降低透明度并加入 CSS 平移，SVG 图形路径保持不变。

官网脚本 `https://heropatterns.com/js/app.js` 提供该纹理的原始 SVG，本地素材从对应的 Plus 条目提取；没有执行网站脚本。页面页脚保留作者、来源、授权链接及调色说明。

流动光晕、漂浮运算符、扩散光圈与点击粒子为本项目自行实现的 Vue / CSS 效果，不依赖远程脚本、图片热链或收费素材。装饰层不接收指针事件，不影响按钮和输入框操作；点击粒子最多同时保留六组，850 毫秒后清理。支持系统减少动态效果设置、页面隐藏时暂停和页面按钮手动暂停。

## 算数鲸挂件

算数鲸按用户要求改用 MeteorNOX 的 DeepSeek-Balance-Whale-Widget 原版 `assets/DSniang1.png`，本地为 `src/assets/original-whale.png`，文件内容保持原样。用于用户指定的非商业作业演示，计算器交互由本项目的 Vue 挂件实现。作者的代码 LICENSE 与素材 PROVENANCE.md 一并保留在 `public/third-party/whale-widget/`；来源、固定版本和原作者的许可范围说明见 [算数鲸说明](whale-widget.md)。
