const CACHE_NAME = 'abu-masamea-game-v4-offline';

// إنشاء قائمة الملفات للتخزين المؤقت
const generateFilesToCache = () => {
  const files = [
    '/',
    '/assets/codes.json',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.json'
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
        console.log('Service Worker: Caching all files...');
        console.log('Total files to cache:', urlsToCache.length);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All files cached successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: Caching failed:', err);
      })
  );
});

// Fetch event - Cache First Strategy للملفات الثابتة
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache-first للملفات الثابتة (صوت، صور، assets)
  if (url.pathname.includes('/assets/') || 
      url.pathname.includes('.mp3') || 
      url.pathname.includes('.webp') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.json')) {
    
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Serving from cache:', url.pathname);
          return cachedResponse;
        }
        
        console.log('Cache miss, fetching:', url.pathname);
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch((error) => {
          console.error('Fetch failed for:', url.pathname, error);
          
          // في حالة فشل تحميل الملفات، إرجاع استجابة فارغة بدلاً من خطأ
          if (url.pathname.includes('.mp3')) {
            return new Response(new ArrayBuffer(0), {
              status: 200,
              headers: { 'Content-Type': 'audio/mpeg' }
            });
          }
          
          if (url.pathname.includes('.webp') || url.pathname.includes('.png')) {
            // إنشاء صورة شفافة 1x1 pixel
            const transparentPixel = new Uint8Array([
              137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 11, 73, 68, 65, 84, 120, 218, 99, 248, 15, 0, 1, 1, 1, 0, 24, 221, 219, 165, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
            ]);
            return new Response(transparentPixel, {
              status: 200,
              headers: { 'Content-Type': 'image/png' }
            });
          }
          
          return new Response('', { status: 404 });
        });
      })
    );
  } else {
    // Network-first للملفات الأخرى
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
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
  }
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