# 贪吃蛇 · 安卓手机安装与使用说明

纯本地离线 PWA：零网络请求、零数据采集、无第三方依赖、无账号、无广告。
安卓 Chrome 可直接安装为独立 App。

## 一、准备
本项目目录（snake-pwa/）需通过 HTTP 服务暴露给手机（PWA 安装要求同源 http/https）。

方案 A（同 WiFi，推荐）：
1. 电脑（WSL）已起服务：
   cd /mnt/e/workspace/snake-pwa && python3 -m http.server 8200
2. 查 WSL 电脑在局域网的 IP（Windows 侧 ipconfig 看 eth0/局域网 IPv4，
   或 WSL 内 cat /etc/resolv.conf 里的 nameserver 通常是 Windows 主机 IP）。
3. 手机连同一 WiFi，浏览器打开 http://<电脑IP>:8200/
   （注意：手机要用电脑在局域网的 IP，不能用 127.0.0.1）
   若打不开：在 Windows 防火墙放行该端口，或把目录拷到手机用本地 HTTP 服务器 App。

方案 B（零局域网，最简）：
1. 手机装任一"本地 HTTP 服务器"类 App（如 AweHTTP / Simple HTTP Server）。
2. 把 snake-pwa 整个文件夹拷进手机任意目录。
3. 启动该 App 服务器（默认端口按 App 提示）。
4. 手机浏览器打开 http://localhost:<端口>/

## 二、安装为 App（安卓 Chrome）
1. 打开游戏页面，确认出现"开始游戏"按钮且能滑动/按键控制。
2. 点 Chrome 右上角 ⋮ → 「添加到主屏幕」/「安装应用」
   （若选项叫「创建快捷方式」，勾选「打开方式：应用窗口」）。
3. 主屏幕出现「贪吃蛇」图标，点击即全屏独立窗口运行，无地址栏。
4. 首次安装前请连网一次（Service Worker 缓存全部资源）；之后断网、飞行模式均可玩。

## 三、玩法
- 控制：在棋盘上滑动（上/下/左/右），或用屏幕下方方向键；电脑可用方向键/WASD，空格暂停。
- 吃食物 +10 分，蛇身变长、速度渐快。
- 撞墙或撞到自己 = 游戏结束；「最高分」只保存在你手机本地。
- ⏸ 暂停，🔊 静音。切到后台会自动暂停。

## 四、隐私与安全说明
- 本游戏不发起任何网络请求（首次安装缓存时除外），代码内无 fetch 外部资源。
- 不采集任何数据：无账号、无统计、无广告、无遥测。
- 唯一本地存储：最高分与声音开关（localStorage，仅存本机，卸载即清除）。
- 无相机/定位/通讯录/麦克风等任何权限请求。
- 页面启用严格 CSP：default-src 'self'，禁止加载任何外部资源。
- 不请求、不存储任何个人身份信息（PII）。

## 五、文件清单
- index.html      页面 + CSP 策略
- style.css       样式
- game.js         游戏逻辑（含本地测试钩子 window.__snake，仅测试用）
- sw.js           Service Worker（全本地缓存，离线可玩）
- manifest.webmanifest  PWA 清单
- icon-192.png / icon-512.png  图标
