<template>
  <div>
    <NuxtLayout name="default">
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <CookieBanner />
      <IOSInstallGuide />
      <PWAInstallButton />
      <NotificationContainer />
    </ClientOnly>

    <noscript>
      <div>
        <img src="https://mc.yandex.ru/watch/95320948" style="position:absolute; left:-9999px;" alt="" />
      </div>
    </noscript>

    <div v-if="needRefresh" class="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <p class="mb-2">Доступна новая версия сайта!</p>
      <button
        @click="refreshApp"
        class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition w-full"
      >
        Обновить
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRuntimeConfig } from '#app'

// ============================================
// ПОЛУЧАЕМ КОНФИГУРАЦИЮ
// ============================================
const config = useRuntimeConfig()
const { siteUrl, storageUrl } = config.public

// ============================================
// АСИНХРОННЫЕ ИМПОРТЫ
// ============================================
const CookieBanner = defineAsyncComponent(() => import('~/components/CookieBanner.vue'))
const IOSInstallGuide = defineAsyncComponent(() => import('~/components/IOSInstallGuide.vue'))
const PWAInstallButton = defineAsyncComponent(() => import('~/components/PWAInstallButton.vue'))
const NotificationContainer = defineAsyncComponent(() => import('~/components/NotificationContainer.vue'))

// ============================================
// COMPOSABLES
// ============================================
const { needRefresh, checkVersion, refreshApp, startPeriodicCheck, stopPeriodicCheck } = useVersionCheck()
const router = useRouter()

// ============================================
// PWA INSTALL PROMPT
// ============================================
let deferredPrompt = null

const handleBeforeInstallPrompt = (e) => {
  e.preventDefault()
  deferredPrompt = e
  const event = new CustomEvent('pwa-install-ready', { detail: { deferredPrompt: e } })
  window.dispatchEvent(event)
}

// ============================================
// PROTOCOL HANDLER
// ============================================
const registerProtocolHandler = () => {
  if (process.client && 'registerProtocolHandler' in navigator) {
    try {
      navigator.registerProtocolHandler('web+wotnt', `${siteUrl}/?from=%s`)
    } catch (e) {
      // Ошибка регистрации protocol handler
    }
  }
}

const handleProtocolHandler = () => {
  if (process.client) {
    const urlParams = new URLSearchParams(window.location.search)
    const fromProtocol = urlParams.get('from')

    if (fromProtocol) {
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)

      if (fromProtocol.startsWith('event/')) {
        const eventSlug = fromProtocol.replace('event/', '')
        setTimeout(() => router.push(`/events/${eventSlug}`), 100)
      } else if (fromProtocol.startsWith('post/')) {
        const postSlug = fromProtocol.replace('post/', '')
        setTimeout(() => router.push(`/posts/${postSlug}`), 100)
      } else if (fromProtocol === 'events') {
        setTimeout(() => router.push('/events'), 100)
      } else if (fromProtocol === 'contacts') {
        setTimeout(() => router.push('/contacts'), 100)
      }
    }
  }
}

// ============================================
// SERVICE WORKER
// ============================================
if (process.client && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

const handleAppUpdate = (event) => {
  needRefresh.value = true
}

// ============================================
// ВАЛИДАЦИЯ ВЕРСИИ
// ============================================
const isValidVersion = (version) => {
  if (!version) return false
  return /^\d+$/.test(version) || /^\d+\.\d+\.\d+$/.test(version)
}

const cleanupInvalidVersion = () => {
  if (process.client) {
    const savedVersion = localStorage.getItem('app_version')
    if (!isValidVersion(savedVersion)) {
      localStorage.removeItem('app_version')
    }
  }
}

const forceVersionCheck = async () => {
  if (process.client) {
    await checkVersion()
  }
}

const restoreScroll = () => {
  if (process.client) {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.documentElement.style.overflow = ''
  }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
if (process.client) {
  cleanupInvalidVersion()

  onMounted(async () => {
    registerProtocolHandler()
    handleProtocolHandler()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('app-update-available', handleAppUpdate)

    await forceVersionCheck()
    startPeriodicCheck(5 * 60 * 1000)

    restoreScroll()
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) restoreScroll()
    })
    window.addEventListener('error', () => restoreScroll())
  })

  onUnmounted(() => {
    stopPeriodicCheck()
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('app-update-available', handleAppUpdate)
  })
}

router.afterEach(() => {
  setTimeout(() => restoreScroll(), 100)
})

// ============================================
// SEO META ТЕГИ
// ============================================
useHead({
  title: 'Церковь Слово Истины',
  meta: [
    { name: 'description', content: 'Проповеди и события церкви Слово Истины' },
    { property: 'og:title', content: 'Церковь Слово Истины' },
    { property: 'og:description', content: 'Проповеди и события церкви Слово Истины' },
    { property: 'og:image', content: `${storageUrl}/og-images/default-og-image.png` },
    { property: 'og:type', content: 'website' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'WoTNT' },
    { name: 'theme-color', content: '#4f46e5' },
    { name: 'msapplication-TileColor', content: '#4f46e5' }
  ],
  link: [
    { rel: 'manifest', href: '/manifest.webmanifest' },
    { rel: 'apple-touch-icon', href: '/favicon/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32.png' }
  ]
})
</script>

<style>
body {
  overflow: auto !important;
  position: relative !important;
  top: auto !important;
  width: auto !important;
}

html {
  scroll-behavior: smooth;
}
</style>