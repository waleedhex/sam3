const CACHE_NAME = 'abu-masamea-game-v1';

// إنشاء قائمة الملفات للتخزين المؤقت
const generateFilesToCache = () => {
  const files = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/assets/codes.json',
    '/icon-192.png',
    '/icon-512.png',
    // الستيكرات - في مجلد src/assets ولكن تُخدم من assets
    '/assets/welcome-sticker.png',
    '/assets/countdown-sticker.png',
    '/assets/victory-sticker.png',
    '/assets/waiting-sticker.png'
  ];

  // إضافة الملفات الصوتية للمستوى السهل (30 ملف)
  for (let i = 1; i <= 30; i++) {
    files.push(`/assets/easy/audio${i}.mp3`);
    files.push(`/assets/easy/image${i}.webp`);
  }

  // إضافة الملفات الصوتية للمستوى الصعب (70 ملف)
  for (let i = 1; i <= 70; i++) {
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
          '/static/js/bundle.js',
          '/static/css/main.css',
          '/assets/codes.json',
          '/icon-192.png',
          '/icon-512.png',
          '/assets/welcome-sticker.png',
          '/assets/countdown-sticker.png',
          '/assets/victory-sticker.png',
          '/assets/waiting-sticker.png'
        ];
        
        return cache.addAll(essentialFiles)
          .then(() => {
            // ثم تخزين ملفات اللعبة تدريجياً
            return Promise.allSettled(
              urlsToCache.slice(essentialFiles.length).map(url => 
                cache.add(url).catch(err => {
                  console.warn(`Failed to cache ${url}:`, err);
                  return null;
                })
              )
            );
          });
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
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // إرجاع النسخة المحفوظة في الذاكرة التخزينية
          return response;
        }
        
        // محاولة جلب الملف من الشبكة
        return fetch(event.request)
          .then((response) => {
            // التحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // نسخ الاستجابة لحفظها في الذاكرة التخزينية
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // في حالة عدم توفر الشبكة، إرجاع صفحة افتراضية للملفات الأساسية
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