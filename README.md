# 贪吃蛇 · Snake（安卓 APK + PWA）

纯本地离线贪吃蛇：**零权限、零网络、零数据采集**。
安卓原生 WebView 壳 + 纯 HTML/CSS/Canvas/JS 游戏本体，无任何第三方依赖。

## 下载安装

最新 APK 见 [Releases](../../releases)（v1.0）。
传到手机 → 点击安装 → 允许未知来源 → 即玩，全程无需网络。

安装后验证：设置 → 应用 → 贪吃蛇 → 权限 = 空列表（连 INTERNET 都没有）。

APK 校验（可选）：
```
SHA-256  snake-release-v1.0.apk
2b8639c0e14a78e925c8187bad50620c595aa21734a2d18e18f72485e1a2c8b6
```

## 玩法
- 棋盘上滑动（上/下/左/右），或用屏幕方向键。
- 吃食物 +10 分，速度渐快；撞墙或撞自己结束。
- 最高分仅存本机；⏸ 暂停，🔊 静音；切后台自动暂停。

## 安全设计
| 层 | 措施 |
|---|---|
| 操作系统 | AndroidManifest 零权限（无 INTERNET = 系统层面无联网通道） |
| 原生壳 | WebView 禁 file/content 外部访问、禁地理定位 JS 接口、无 JS 桥、外部导航全拦截 |
| 页面 | 严格 CSP `default-src 'self'`、无 eval/innerHTML/动态代码/内联脚本 |
| 数据 | 唯一持久化 = 本机最高分与声音开关（卸载即清），无 PII、无遥测 |

## 目录结构
```
index.html style.css game.js sw.js manifest.webmanifest   游戏本体（PWA 形态）
android/                                                  安卓构建工程（壳）
android/app/src/main/java/.../SnakeActivity.java          WebView 壳
android/app/src/main/assets/                              打进 APK 的游戏文件
snake-release-v1.0.apk                                    发布包
README-安卓安装说明.md                                      详细安装/复现文档
```

## 重新构建
依赖：JDK 17、Android SDK (platform-34, build-tools 34)、Gradle 8.7。
签名：`android/signing.properties`（本机文件，不入库）+ 本地 keystore。

```
cd android
export JAVA_HOME=/path/to/jdk17
/path/to/gradle/bin/gradle assembleRelease
# 产物: app/build/outputs/apk/release/app-release.apk
```

> 升级版本必须使用同一 keystore 签名，否则手机将拒绝覆盖安装。

## License
MIT
