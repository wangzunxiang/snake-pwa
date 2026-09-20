package com.ntsec.snake;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

/**
 * 贪吃蛇 APK 壳：全屏 WebView 加载内置 assets 中的纯本地游戏。
 *
 * 安全设计（硬性约束）：
 * - 清单不申请任何权限（含 INTERNET），系统层面无网络能力；
 * - WebView 仅允许 file:///android_asset/ 与 content=about:blank，
 *   其余一切导航一律拦截；
 * - 禁用文件外部访问、禁用地理定位 JS 接口、禁用 DOM storage 之外的本地访问；
 * - 不向 JS 注入任何桥（addJavascriptInterface 未调用），
 *   页面 JS 无法触达 Android 原生能力。
 */
public class SnakeActivity extends Activity {

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 屏幕常亮（游戏场景）
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        FrameLayout root = new FrameLayout(this);
        webView = new WebView(this);
        root.addView(webView,
                new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // 最高分/声音偏好的 localStorage
        s.setAllowFileAccess(false);           // 禁止读手机本地文件
        s.setAllowContentAccess(false);        // 禁止 content:// 外部内容
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setTextZoom(100);
        // 不开放地理/权限 JS 接口
        s.setGeolocationEnabled(false);

        webView.setBackgroundColor(Color.parseColor("#0b1120"));
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // 只放行内置资源；其它一律拦截（本应用也没有网络权限，双保险）
                if (url.startsWith("file:///android_asset/") || "about:blank".equals(url)) {
                    return false;
                }
                return true;
            }
        });

        // 全屏沉浸
        immersive();

        webView.loadUrl("file:///android_asset/index.html");
    }

    private void immersive() {
        WindowInsetsController c = getWindow().getInsetsController();
        if (c != null) {
            c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
            c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) immersive();
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
