# ScriptChisel 项目介绍网页

这是独立静态介绍页；交付目录为 `website/dist`，不需要运行批改后端，也没有设备控制请求或模型调用。

## 本地预览

在项目根目录运行：

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory website/dist
```

浏览器打开 `http://127.0.0.1:8765/`。若本机 Python 不在 PATH，可使用任意已安装 Python 的完整路径。

## 自行部署

将 `dist` 内的 `index.html`、`styles.css`、`main.js` 与整个 `assets` 文件夹一并复制到服务器网站目录。保留文件相对位置，可部署到域名根目录或子目录。无需 npm 安装或构建，无第三方 CDN、外部视频链接或后端服务依赖。

Nginx 根目录部署参考：

```nginx
server {
    listen 80;
    server_name your-domain.example;
    root /var/www/scriptchisel;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}
```

此处域名与服务器目录需要替换为自己的实际值；HTTPS 按自己的服务器环境配置。

## 素材与内容

- App 同款运动动画来自 `app/src/public/hero-video-lite.mp4`。首页真正加载的是由该素材转换的循环 GIF，不是其他动画；为便于后续替换，也保留了原同源 MP4。
- 图片来自项目已有 App 界面、整机与硬件设计、实物及论文流程图。来源记录见 `asset-sources.json`。
- WebP 图片做了面向网页的缩放和压缩，原始素材未修改。
- `prepare_assets.py` 为重建素材的辅助脚本，需要 Pillow 和 OpenCV。部署时不需要复制该脚本。
- 工作流程、硬件模块可切换；图片可放大；动画可停止或播放。浏览器启用“减少动态效果”时默认显示静态封面。
- 页面明确将错误证据驱动的安全批注列为研究中方向，没有将未完成验证的功能写成既有成果。

这是项目展示页面，截图中的状态属于已有示例，并不代表当前设备的实时状态。
