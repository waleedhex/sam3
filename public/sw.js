const CACHE_NAME = 'abu-masamea-game-v3';

// إنشاء قائمة الملفات للتخزين المؤقت
const generateFilesToCache = () => {
  const files = [
    '/',
    '/src/main.tsx',
    '/src/index.css',
    '/src/App.tsx',
    '/src/App.css',
    '/assets/codes.json',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.json',
    // الستيكرات - في مجلد src/assets ولكن تُخدم من assets
    '/src/assets/welcome-sticker.png',
    '/src/assets/countdown-sticker.png',
    '/src/assets/victory-sticker.png',
    '/src/assets/waiting-sticker.png',
    '/src/assets/results-sticker.png'
  ];

// إضافة الملفات الصوتية للمستوى السهل (29 ملف)
  for (let i = 1; i <= 29; i++) {
    files.push(`/assets/easy/audio${i}.mp3`);
    files.push(`/assets/easy/image${i}.webp`);
  }

  // إضافة الملفات الصوتية للمستوى الصعب (66 ملف)
  for (let i = 1; i <= 66; i++) {
    files.push(`/assets/hard/audio${i}.mp3`);
    files.push(`/assets/hard/image${i}.webp`);
  }

  return files;
};

const urlsToCache = generateFilesToCache();

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files...');
        // تخزين الملفات الأساسية أولاً
        const essentialFiles = [
          '/',
          '/src/main.tsx',
          '/src/index.css',
          '/src/App.tsx',
          '/assets/codes.json',
          '/icon-192.png',
          '/icon-512.png',
          '/manifest.json',
          '/src/assets/welcome-sticker.png',
          '/src/assets/countdown-sticker.png',
          '/src/assets/victory-sticker.png',
          '/src/assets/waiting-sticker.png',
          '/src/assets/results-sticker.png'
        ];
        
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Files cached successfully');
        // فرض تفعيل الـ service worker الجديد فوراً
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: Caching failed:', err);
      })
  );
});

// Fetch event - serve cached files when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // 👇 معالجة الطلبات الفاشلة أثناء وضع الطيران
        if (event.request.destination === 'image') {
          return new Response('', { status: 404 });
        }
        if (event.request.destination === 'audio') {
          return new Response('', { status: 404 });
        }
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }

        return new Response('المحتوى غير متاح في وضع عدم الاتصال', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain; charset=utf-8'
          })
        });
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      // السيطرة على جميع العملاء فوراً
      return self.clients.claim();
    })
  );
});

// رسالة عند تحديث service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// التحقق من تحديثات الذاكرة التخزينية دورياً
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // تحديث الملفات في الخلفية
      caches.open(CACHE_NAME).then(cache => {
        return cache.keys().then(requests => {
          return Promise.allSettled(
            requests.map(request => fetch(request).then(response => {
              if (response.status === 200) {
                return cache.put(request, response);
              }
            }))
          );
        });
      })
    );
  }
});