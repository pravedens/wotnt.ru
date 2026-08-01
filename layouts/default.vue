<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader 
      :mobile-menu-open="mobileMenuOpen"
      @toggle-mobile-menu="mobileMenuOpen = true"
    />
    
    <main class="flex-grow">
      <slot />
    </main>
    
    <!-- Добавляем футер -->
    <AppFooter />
    
    <AppMobileMenu 
      v-model="mobileMenuOpen" 
      :user="user"
      :is-in-dashboard="isInDashboard"
      @logout="handleLogout"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppMobileMenu from '~/components/layout/AppMobileMenu.vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

// ============================================
// ПОЛУЧАЕМ КОНФИГУРАЦИЮ
// ============================================
const config = useRuntimeConfig()
const { siteUrl, apiBase } = config.public

// Мета-теги и фавиконки
useHead({
  title: `${siteUrl} - Проповеди и события`,
  meta: [
    { name: 'description', content: 'Проповеди, события церкви, община верующих' },
    { name: 'theme-color', content: '#4f46e5' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes' },
    
    // Для iOS (Apple)
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'wotnt' },
    
    // Для Android
    { name: 'mobile-web-app-capable', content: 'yes' }
  ],
  link: [
    // Фавиконки
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg', sizes: 'any' },
    { rel: 'icon', type: 'image/png', href: '/favicon/favicon-32.png', sizes: '32x32' },
    { rel: 'apple-touch-icon', href: '/favicon/apple-touch-icon.png', sizes: '180x180' },
    
    // Для Windows
    { rel: 'msapplication-TileImage', href: '/favicon/favicon-96x96.png' },
    { rel: 'msapplication-TileColor', content: '#4f46e5' },
    
    // PWA манифест
    { rel: 'manifest', href: '/manifest.webmanifest' }
  ]
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// ============================================
// ✅ ВОССТАНОВЛЕНИЕ ТОКЕНА ИЗ LOCALSTORAGE
// ============================================
if (import.meta.client) {
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('auth_user')
  const rolesStr = localStorage.getItem('auth_roles')
  
  if (token && userStr && !authStore.token) {
    authStore.token = token
    authStore.user = JSON.parse(userStr)
    authStore.roles = rolesStr ? JSON.parse(rolesStr) : []
  }
}

// ============================================
// ✅ ИНИЦИАЛИЗАЦИЯ АВТОРИЗАЦИИ
// ============================================
if (route.path !== '/') {
  // На страницах, кроме главной - проверяем токен
  authStore.init()
} else {
  // На главной - только восстановили токен, без запросов
  authStore.initialized = true
}

const { user } = storeToRefs(authStore)

// Состояние мобильного меню
const mobileMenuOpen = ref(false)

// Проверяем, находится ли пользователь в личном кабинете
const isInDashboard = computed(() => {
  return route.path.startsWith('/dashboard') || 
         route.path.startsWith('/account') ||
         route.path.startsWith(`${apiBase}/admin`)
})

// ✅ Функция восстановления скролла
const restoreScroll = () => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.documentElement.style.overflow = ''
  }
}

// Обработка выхода
const handleLogout = async () => {
  await authStore.logout()
  mobileMenuOpen.value = false
  restoreScroll()
  await router.push('/')
}

// Закрываем мобильное меню при смене маршрута
watch(route, () => {
  mobileMenuOpen.value = false
  restoreScroll()
})

// ✅ Глобальное восстановление скролла после каждой навигации
router.afterEach(() => {
  restoreScroll()
})

// Инициализация авторизации при загрузке
onMounted(() => {
  restoreScroll()
})

// ✅ Очищаем при размонтировании
onUnmounted(() => {
  restoreScroll()
})
</script>

<style>
/* Для растягивания контента на всю высоту */
html, body {
  height: 100%;
}

#__nuxt {
  height: 100%;
}

/* ✅ Глобальное восстановление скролла для любых модальных окон */
body.modal-open {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
}

/* ✅ Плавный скролл для всей страницы */
html {
  scroll-behavior: smooth;
}
</style>