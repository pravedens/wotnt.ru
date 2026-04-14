<template>
  <div>
    <NuxtLayout name="default">
      <NuxtPage />
    </NuxtLayout>
    <noscript>
      <div>
        <img src="https://mc.yandex.ru/watch/95320948" style="position:absolute; left:-9999px;" alt="" />
      </div>
    </noscript>
    <noscript>
      <iframe 
        src="https://www.googletagmanager.com/ns.html?id=G-46QQ5SPH5V"
        height="0" 
        width="0" 
        style="display:none;visibility:hidden"
      ></iframe>
    </noscript>
    
    <!-- Уведомление об обновлении -->
    <div v-if="needRefresh" class="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <p class="mb-2">Доступна новая версия сайта!</p>
      <button 
        @click="refreshApp"
        class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition w-full"
      >
        Обновить
      </button>
    </div>
    
    <NotificationContainer />
  </div>
</template>

<script setup>
import NotificationContainer from '~/components/NotificationContainer.vue'
import { useAuthStore } from '~/stores/auth'
import { useVersionCheck } from '~/composables/useVersionCheck'

const { needRefresh, checkVersion, refreshApp } = useVersionCheck()

// ✅ Проверка версии только на клиенте
if (process.client) {
  onMounted(() => {
    checkVersion()
    // Проверяем каждые 5 минут
    const interval = setInterval(() => {
      checkVersion()
    }, 5 * 60 * 1000)
    
    // Очищаем интервал при размонтировании
    onUnmounted(() => {
      clearInterval(interval)
    })
  })
}

useHead({
  title: 'Церковь Слово Истины',
  meta: [
    { name: 'description', content: 'Проповеди и события церкви Слово Истины' },
    { property: 'og:title', content: 'Церковь Слово Истины' },
    { property: 'og:description', content: 'Проповеди и события церкви Слово Истины' },
    { property: 'og:image', content: 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.png' },
    { property: 'og:type', content: 'website' },
    { property: 'vk:title', content: 'Церковь Слово Истины' },
    { property: 'vk:description', content: 'Проповеди и события церкви Слово Истины' },
    { property: 'vk:image', content: 'https://storage.yandexcloud.net/wotgospel-media/og-images/default-og-image.png' },
  ]
})

// Функция восстановления скролла
const restoreScroll = () => {
  if (process.client) {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.documentElement.style.overflow = ''
  }
}

// Глобальное восстановление скролла после навигации
const router = useRouter()
router.afterEach(() => {
  setTimeout(() => {
    restoreScroll()
  }, 100)
})

// Проверяем валидность токена при загрузке
const checkAuth = async () => {
  const authStore = useAuthStore()
  
  if (!authStore.initialized) {
    await authStore.init()
  }
  
  if (authStore.token && authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      console.error('Auth check failed:', error)
      await authStore.logout()
    }
  }
}

// Жизненный цикл
onMounted(() => {
  restoreScroll()
  checkAuth()
  
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      restoreScroll()
    }
  })
})

// Восстанавливаем скролл при ошибке
if (process.client) {
  window.addEventListener('error', () => {
    restoreScroll()
  })
}
</script>

<style>
/* Глобальные стили для восстановления скролла */
body {
  overflow: auto !important;
  position: relative !important;
  top: auto !important;
  width: auto !important;
}

/* Плавный скролл */
html {
  scroll-behavior: smooth;
}
</style>