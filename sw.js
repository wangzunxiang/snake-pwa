'use strict';
/* Service Worker：全本地缓存，同源校验，离线可玩 */
const CACHE = 'snake-pwa-v4';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'game.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
];

// 白名单：仅拦截/缓存导航请求与上述静态资源，
// 其余同源 URL 交还浏览器处理，避免把未知响应写入缓存（缓存投毒/污染）
const ASSET_PATHS = new Set(ASSETS.map(p => new URL(p, self.location).pathname));

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 仅处理同源请求
  // 只拦截导航或白名单资源；未知同源请求不拦截、不写缓存
  if (req.mode !== 'navigate' && !ASSET_PATHS.has(url.pathname)) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      if (req.mode === 'navigate') {
        return fetch(req)
          .then(res => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then(c => c.put(req, copy));
            }
            return res;
          })
          .catch(() => caches.match('./index.html').then(f => f || Response.error()));
      }
      // 资源请求未命中缓存：联网获取后回填（仅 ok），离线时返回错误
      // 注意：不得回退到 index.html，否则 404/资源缺失会被错误内容掩盖
      return fetch(req)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => Response.error());
    })
  );
});
