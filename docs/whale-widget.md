# 算数鲸计算助手

参考项目：[MeteorNOX / DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)。参考版本为 `main` 分支提交 `770d3f55ff40284eb244fff33fc9ed4654be8a45`，查看日期 2026-10-04。

原项目用鲸鱼挂件显示 DeepSeek 余额。本项目将这种挂件交互适配为计算器助手：显示计算结果、保存状态、记录数量、错误提示和使用建议；能填入示例算式并回到输入框。计算结果和记录数量直接来自主页面的后端响应，挂件不自行计算，也不自行读写历史。

## 形象与许可

上游 [LICENSE](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget/blob/770d3f55ff40284eb244fff33fc9ed4654be8a45/LICENSE) 将代码按 MIT 许可。

上游 [PROVENANCE.md](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget/blob/770d3f55ff40284eb244fff33fc9ed4654be8a45/PROVENANCE.md) 单独说明美术素材的使用范围，它们不属于代码的 MIT 许可。原作者的 LICENSE 与 PROVENANCE.md 原样保存在 `public/third-party/whale-widget/`，随网页构建保留，页脚提供来源和素材说明入口。

用户要求使用原版形象，用于非商业作业演示。当前 `src/assets/original-whale.png` 为该版本的 `assets/DSniang1.png` 原样副本，没有改色、裁剪、重绘或重新编码；Git blob SHA-1 为 `f46b232152ede43630407f3a38de29c07a91be91`，与上游文件一致。由 Vue 挂件调整网页显示尺寸并提供计算器气泡、Q 弹按压、拖拽吸附与镜像交互。这里记录用户用途与素材来源，不将非商业用途表述成新的素材授权。

## 互动

- 点击鲸鱼打开 / 关闭提示；鼠标按下或触摸时 Q 弹变形。
- 拖动鲸鱼改变位置，靠近边缘时吸附，放在左侧时形象镜像。
- 聚焦鲸鱼后用方向键移动，Shift + 方向键移动更快；Escape 关闭提示。
- 成功计算时显示后端结果及保存状态；非法算式和服务离线时提示对应原因。
- “试一个算式”只填入示例，仍需用户按 Enter 或计算按钮才计算保存。
- “去计算”回到输入框；“收起挂件”保留一个唤醒入口。
- `localStorage` 的 `calculator-whale-layout-v1` 仅保存位置比例和收起偏好；历史记录仍只保存在后端 SQLite。
- 挂件按可见窗口宽度和高度连续缩放，形象宽度在 72–160 CSS 像素之间，保持原图比例。气泡宽度同时自适应，文字保持可读字号；空间不足时限制高度并可滚动。
- 调整窗口、切换横竖屏、可视区域变化时重新计算缩放和拖动边界，按相对位置保持挂件在屏幕内。支持系统减少动态效果和页面动效暂停开关。

页面中挂件独立于内容区，可拖开或收起。未引入第三方账户、插件后台或 API 凭据配置。
