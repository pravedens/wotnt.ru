<template>
  <div v-if="showBanner" class="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-white/20 p-4 shadow-lg">
    <div class="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-white/80 text-sm">
        <p>
          Мы используем cookie-файлы и сервисы аналитики (Яндекс.Метрика) 
          для улучшения работы сайта. Продолжая использовать сайт, вы соглашаетесь с 
          <NuxtLink to="/privacy" class="text-blue-400 hover:text-blue-300 underline">Политикой обработки персональных данных</NuxtLink>.
        </p>
      </div>
      <div class="flex gap-3 flex-shrink-0">
        <button 
          @click="acceptAll"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Принять все
        </button>
        <button 
          @click="acceptNecessary"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Только необходимые
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ✅ Расширяем интерфейс Window
declare global {
  interface Window {
    resetCookieConsent?: () => void
    ym?: (counterId: number, action: 'init', params: {
      clickmap?: boolean
      trackLinks?: boolean
      accurateTrackBounce?: boolean
      webvisor?: boolean
      trackHash?: boolean
    }) => void
  }
}

const COOKIE_CONSENT_KEY = 'cookie_consent'
const YM_COUNTER_ID = 95320948

const showBanner = ref(false)
let ymLoaded = false

// Настройки cookie по умолчанию
const cookieSettings = ref({
  necessary: true,
  analytics: false,
  marketing: false
})

// Проверяем, было ли уже дано согласие
const checkConsent = () => {
  if (import.meta.client) {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        cookieSettings.value = parsed
        showBanner.value = false
        // Применяем сохранённые настройки
        if (cookieSettings.value.analytics) {
          loadYandexMetrika()
        }
      } catch (e) {
        // Если сохранённые данные повреждены, показываем баннер
        showBanner.value = true
      }
    } else {
      showBanner.value = true
    }
  }
}

// Загрузка Яндекс.Метрики
const loadYandexMetrika = () => {
  if (ymLoaded || typeof window === 'undefined') return
  
  ymLoaded = true
  
  // Загружаем скрипт Яндекс.Метрики
  const script = document.createElement('script')
  script.src = 'https://mc.yandex.ru/metrika/tag.js'
  script.async = true
  document.head.appendChild(script)
  
  script.onload = () => {
    if (typeof window !== 'undefined' && window.ym) {
      // ✅ Правильный синтаксис: counterId, 'init', { ...options }
      window.ym(YM_COUNTER_ID, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        trackHash: true
      })
    }
  }
}

// Применить согласие (сохранить и загрузить трекеры если нужно)
const applyConsent = () => {
  if (import.meta.client) {
    // Сохраняем настройки
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(cookieSettings.value))
    
    // Если согласие на аналитику есть — загружаем Яндекс.Метрику
    if (cookieSettings.value.analytics) {
      loadYandexMetrika()
    }
  }
}

// Принять все (включая аналитику)
const acceptAll = () => {
  cookieSettings.value = {
    necessary: true,
    analytics: true,
    marketing: true
  }
  applyConsent()
  showBanner.value = false
}

// Только необходимые (без аналитики)
const acceptNecessary = () => {
  cookieSettings.value = {
    necessary: true,
    analytics: false,
    marketing: false
  }
  applyConsent()
  showBanner.value = false
}

// Сброс согласия (для использования в настройках профиля)
const resetConsent = () => {
  if (import.meta.client) {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    cookieSettings.value = {
      necessary: true,
      analytics: false,
      marketing: false
    }
    showBanner.value = true
  }
}

// ✅ Теперь TypeScript знает о window.resetCookieConsent
if (import.meta.client) {
  window.resetCookieConsent = resetConsent
}

onMounted(() => {
  checkConsent()
})
</script>