const CACHE_NAME = 'zedideaarena-v3'

const STATIC_CACHE = 'zedideaarena-static-v3'
const IMAGE_CACHE = 'zedideaarena-images-v3'
const API_CACHE = 'zedideaarena-api-v3'
const PAGE_CACHE = 'zedideaarena-pages-v3'

const PRECACHE_URLS = ['/', '/arena', '/auth/login', '/offline']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== IMAGE_CACHE && name !== API_CACHE && name !== PAGE_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

const isImage = (url) => /\.(png|jpg|jpeg|gif|webp|avif|svg|ico)$/i.test(url) || url.includes('supabase.co') || url.includes('img.youtube.com') || url.includes('ytimg.com')
const isStatic = (url) => url.includes('/_next/static') || url.includes('/fonts') || url.endsWith('.js') || url.endsWith('.css')
const isApi = (url) => url.includes('/api/')
const isPage = (url) => {
  const path = new URL(url).pathname
  return !isStatic(url) && !isApi(url) && !isImage(url) && !path.includes('.')
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = request.url

  if (isImage(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  if (isStatic(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  if (isApi(url)) {
    event.respondWith(networkOnly(request))
    return
  }

  if (isPage(url)) {
    event.respondWith(networkFirst(request, PAGE_CACHE))
    return
  }

  event.respondWith(networkFirst(request, PAGE_CACHE))
})

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const clone = response.clone()
      caches.open(cacheName).then((cache) => cache.put(request, clone))
    }
    return response
  } catch (error) {
    return caches.match('/offline')
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const clone = response.clone()
      caches.open(cacheName).then((cache) => cache.put(request, clone))
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    return cached || caches.match('/offline')
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request)
  } catch {
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
