import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

// Assets estáticos: CacheFirst via precache (carga rápida con señal débil)
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// API: NetworkFirst — intenta red primero, cae a caché si está offline
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-cache' })
)
