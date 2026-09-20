# 贪吃蛇 · 安卓手机安装与使用说明

纯本地离线游戏：零网络请求、零数据采集、零权限申请、无第三方依赖、无账号、无广告。

两种形态：
- **APK（推荐）**：`snake-release-v1.0.apk`，装到手机就是独立 App，彻底离线
- **PWA**：同套代码的网页版，Chrome「添加到主屏幕」也能装（附录）

## 一、APK 安装（推荐）
1. 把 `snake-release-v1.0.apk` 传到手机（微信「文件传输助手」/数据线/QQ 均可，
   注意微信传文件选「文件」而非「图片」，避免被压缩）。
   校验（可选）：SHA-256 = 2b8639c0e14a78e925c8187bad50620c595aa21734a2d18e18f72485e1a2c8b6
2. 手机上点击该 apk 文件 → 提示「不允许安装未知来源应用」时点「设置」→
   允许对应来源（微信/文件管理器）→ 返回继续安装。
3. 安装完成，主屏幕出现「贪吃蛇」图标，点击即玩，全程不需要网络。

## 二、玩法
- 控制：在棋盘上滑动（上/下/左/右），或用屏幕下方方向键。
- 吃食物 +10 分，蛇身变长、速度渐快。
- 撞墙或撞到自己 = 游戏结束；「最高分」只保存在你手机本地。
- ⏸ 暂停，🔊 静音。切到后台自动暂停，屏幕游戏时常亮。

## 三、隐私与安全说明（APK）
- **零权限**：AndroidManifest 未申请任何权限（连 INTERNET 都没有），
  操作系统层面即无联网通道，数据外传在原理上不可能。
  验证方法：设置 → 应用 → 贪吃蛇 → 权限，列表为空。
- 不采集任何数据：无账号、无统计、无广告、无遥测、无 PII。
- 唯一本地存储：最高分与声音开关（应用内 localStorage，卸载即清除）。
- WebView 加固：禁文件访问、禁 content 访问、禁地理定位、
  未注入任何 JS 桥（页面 JS 触达不到 Android 原生能力）、
  一切外部导航被拦截。
- 页面另启用严格 CSP：default-src 'self'。
- release 签名（自签证书 CN=NTSec，可 apksigner verify 校验）。

## 四、版本与升级
- 包名：com.ntsec.snake，versionCode 1，versionName 1.0
- 升级必须用同一 keystore 签名（不同签名 = 卸载重装，最高分会丢失）。
- keystore 位置与口令见交付记录，务必妥善保管，丢失则无法再发升级版本。

## 五、重新构建（开发用）
```
cd /mnt/e/workspace/snake-pwa/android
export JAVA_HOME=$HOME/android-toolchain/jdk-17.0.20.1+1
$HOME/android-toolchain/gradle-8.7/bin/gradle assembleRelease
# 产物: app/build/outputs/apk/release/app-release.apk
```
工具链位于 WSL ~/android-toolchain/（JDK 17 / Android SDK 34 / build-tools 34 / Gradle 8.7）。
改动游戏代码后需同步：cp index.html style.css game.js app/src/main/assets/

## 六、文件清单
- snake-release-v1.0.apk        最终安装包
- android/                      Android 构建工程（壳工程 + 签名配置）
- index.html / style.css / game.js   游戏本体（PWA 与 APK 共用）
- sw.js + manifest.webmanifest  PWA 专用（APK 内不使用，离线靠内置 assets 实现）
- icon-192.png / icon-512.png   图标

## 附录：PWA 方式（备选）
1. WSL 起服务：`cd /mnt/e/workspace/snake-pwa && python3 -m http.server 8200`
2. 手机与电脑同 WiFi，浏览器打开 `http://<电脑局域网IP>:8200/`
3. Chrome 菜单 → 「添加到主屏幕」→ 首次联网一次缓存，之后离线可玩。
   缺点：依赖 Chrome 与局域网/服务器，不如 APK 彻底。
