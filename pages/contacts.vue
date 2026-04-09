<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <!-- Хлебные крошки -->
      <div class="mb-6">
        <nav class="flex items-center gap-2 text-white/70">
          <NuxtLink to="/" class="hover:text-white transition">Главная</NuxtLink>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span class="text-white">Контакты</span>
        </nav>
      </div>
      
      <!-- Заголовок -->
      <h1 class="text-4xl md:text-5xl font-bold text-white text-center mb-12">
        Контакты
      </h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <!-- Контактная информация -->
        <div class="space-y-6">
          <!-- Адрес -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-white mb-2">Адрес</h2>
                <p class="text-white/80">
                  г. Нижний Тагил, ул. Чехова, 10
                </p>
              </div>
            </div>
          </div>
          
          <!-- Телефон -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-white mb-2">Телефон</h2>
                <a href="tel:+79991234567" class="text-white/80 hover:text-white transition block">
                  +7 (999) ....
                </a>
              </div>
            </div>
          </div>
          
          <!-- Email -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-white mb-2">Email</h2>
                <a href="mailto:admin@wotgospel.ru" class="text-white/80 hover:text-white transition block">
                  admin@wotgospel.ru
                </a>
              </div>
            </div>
          </div>
          
          <!-- Социальные сети (только ВКонтакте) -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.485 7.097c.139-.445-.05-.678-.526-.678h-1.966c-.43 0-.646.24-.756.505 0 0-.89 2.131-2.155 3.514-.398.418-.58.55-.797.55-.109 0-.27-.132-.27-.577V7.097c0-.459-.134-.678-.522-.678h-3.119c-.294 0-.473.226-.473.44 0 .46.668.567.735 1.862v2.815c0 .617-.112.73-.357.73-.658 0-2.257-2.386-3.207-5.115-.187-.544-.373-.733-.806-.733H4.827c-.478 0-.574.24-.574.505 0 .473.627 2.842 2.915 5.97 1.526 2.181 3.676 3.37 5.634 3.37 1.174 0 1.32-.26 1.32-.712v-1.642c0-.495.104-.594.453-.594.257 0 .698.129 1.727 1.126 1.175 1.175 1.368 1.703 2.03 1.703h1.966c.478 0 .719-.237.58-.707-.151-.479-.694-1.172-1.414-1.994-.398-.472-.995-.981-1.176-1.235-.253-.33-.18-.477 0-.771 0 0 2.074-2.896 2.29-3.876z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-white mb-2">Социальные сети</h2>
                <div class="flex flex-wrap gap-3 mt-2">
                  <a 
                    href="https://vk.com/truechurch" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg text-white transition flex items-center gap-2"
                  >
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.485 7.097c.139-.445-.05-.678-.526-.678h-1.966c-.43 0-.646.24-.756.505 0 0-.89 2.131-2.155 3.514-.398.418-.58.55-.797.55-.109 0-.27-.132-.27-.577V7.097c0-.459-.134-.678-.522-.678h-3.119c-.294 0-.473.226-.473.44 0 .46.668.567.735 1.862v2.815c0 .617-.112.73-.357.73-.658 0-2.257-2.386-3.207-5.115-.187-.544-.373-.733-.806-.733H4.827c-.478 0-.574.24-.574.505 0 .473.627 2.842 2.915 5.97 1.526 2.181 3.676 3.37 5.634 3.37 1.174 0 1.32-.26 1.32-.712v-1.642c0-.495.104-.594.453-.594.257 0 .698.129 1.727 1.126 1.175 1.175 1.368 1.703 2.03 1.703h1.966c.478 0 .719-.237.58-.707-.151-.479-.694-1.172-1.414-1.994-.398-.472-.995-.981-1.176-1.235-.253-.33-.18-.477 0-.771 0 0 2.074-2.896 2.29-3.876z"/>
                    </svg>
                    ВКонтакте
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Режим работы -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-white mb-2">Режим работы</h2>
                <div class="space-y-1 text-white/80">
                  <p>🗓️ Воскресное служение: <strong>11:00</strong></p>
                  <p>🙏 Молитвенная встреча: среда <strong>18:30</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Карта (Яндекс.Карты) -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 h-[500px] lg:h-auto min-h-[500px]">
          <iframe
            class="w-full h-full"
            src="https://yandex.ru/map-widget/v1/?ll=60.008460%2C57.899827&mode=whatshere&whatshere%5Bpoint%5D=60.009365%2C57.900183&whatshere%5Bzoom%5D=17&z=16.8"
            frameborder="0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
            title="Церковь Слово Истины — Нижний Тагил, ул. Чехова, 10"
        ></iframe>
        </div>
      </div>
      
      <!-- Форма обратной связи (только для авторизованных) -->
      <div v-if="isAuthenticated" class="max-w-2xl mx-auto mt-12">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 class="text-2xl font-bold text-white text-center mb-6">Напишите нам</h2>
          
          <form @submit.prevent="sendMessage" class="space-y-4">
            <!-- Имя и Email скрыты, так как данные берутся из профиля -->
            <div class="bg-white/5 rounded-lg p-3 text-white/70 text-sm">
              <p>📧 От: <strong>{{ userEmail }}</strong></p>
              <p>👤 Имя: <strong>{{ userName }}</strong></p>
            </div>
            
            <div>
              <label class="block text-white/80 mb-2 text-sm">Сообщение</label>
              <textarea
                v-model="form.message"
                required
                rows="4"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                placeholder="Ваше сообщение..."
                @input="sanitizeMessage"
              ></textarea>
            </div>
            <div class="text-center">
              <button
                type="submit"
                :disabled="sending"
                class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
              >
                {{ sending ? 'Отправка...' : 'Отправить' }}
              </button>
            </div>
            <div v-if="formSuccess" class="text-green-300 text-sm text-center">
              Сообщение отправлено! Мы свяжемся с вами.
            </div>
            <div v-if="formError" class="text-red-300 text-sm text-center">
              {{ formError }}
            </div>
          </form>
        </div>
      </div>
      
      <!-- Сообщение для неавторизованных -->
      <div v-else class="max-w-2xl mx-auto mt-12 text-center">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <p class="text-white/80">
            🔒 Чтобы написать сообщение, пожалуйста, 
            <NuxtLink :to="loginLink" class="text-blue-300 hover:text-blue-200 underline">
              войдите
            </NuxtLink> 
            в свой аккаунт.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRoute } from 'vue-router'

// ============================================
// РОУТИНГ
// ============================================

const route = useRoute()

// Ссылка на логин с сохранением текущего URL
const loginLink = computed(() => ({
  path: '/auth/login',
  query: { redirect: route.fullPath }
}))

// ============================================
// SEO МЕТА-ТЕГИ
// ============================================

useServerSeoMeta({
  title: 'Контакты | Церковь Слово Истины',
  description: 'Адрес, телефон, email и карта проезда церкви Слово Истины. Режим работы, социальные сети и форма обратной связи.',
  ogTitle: 'Контакты | Церковь Слово Истины',
  ogDescription: 'Адрес, телефон, email и карта проезда церкви Слово Истины. Режим работы, социальные сети и форма обратной связи.',
  ogType: 'website',
  ogUrl: 'https://wotnt.ru/contacts',
  ogSiteName: 'Церковь Слово Истины',
  ogLocale: 'ru_RU',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Контакты | Церковь Слово Истины',
  twitterDescription: 'Адрес, телефон, email и карта проезда церкви Слово Истины.'
})

useHead({
  meta: [
    { 
      name: 'description', 
      content: 'Адрес, телефон, email и карта проезда церкви Слово Истины. Режим работы, социальные сети и форма обратной связи.' 
    },
    { 
      name: 'keywords', 
      content: 'контакты, адрес, телефон, email, карта проезда, режим работы, обратная связь, церковь, слово истины' 
    }
  ],
  link: [
    { rel: 'canonical', href: 'https://wotnt.ru/contacts' }
  ]
})

// ============================================
// АВТОРИЗАЦИЯ
// ============================================

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const token = computed(() => authStore.token)

// Данные пользователя из стора
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Пользователь')
const userEmail = computed(() => authStore.user?.email || '')

// ============================================
// ФОРМА ОБРАТНОЙ СВЯЗИ
// ============================================

const form = reactive({
  message: ''
})

const sending = ref(false)
const formSuccess = ref(false)
const formError = ref('')

// Получение CSRF-токена из cookies
const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value)
    }
  }
  return null
}

// Санитизация сообщения (удаление HTML-тегов и скриптов)
const sanitizeMessage = () => {
  // Удаляем HTML-теги
  form.message = form.message.replace(/<[^>]*>/g, '')
  // Удаляем потенциально опасные конструкции
  form.message = form.message.replace(/javascript:/gi, '')
  form.message = form.message.replace(/on\w+=/gi, '')
  form.message = form.message.replace(/&lt;script.*?&gt;.*?&lt;\/script&gt;/gi, '')
}

const sendMessage = async () => {
  sending.value = true
  formSuccess.value = false
  formError.value = ''
  
  // Дополнительная санитизация перед отправкой
  sanitizeMessage()
  
  if (!form.message.trim()) {
    formError.value = 'Сообщение не может быть пустым'
    sending.value = false
    return
  }
  
  // Получаем CSRF-токен
  const xsrfToken = getCsrfToken()
  
  try {
    const response = await $fetch('/api/contacts', {
      method: 'POST',
      body: {
        message: form.message.trim()
      },
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'X-XSRF-TOKEN': xsrfToken || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    })
    
    if (response.success) {
      formSuccess.value = true
      form.message = ''
      
      setTimeout(() => {
        formSuccess.value = false
      }, 5000)
    } else {
      formError.value = response.message || 'Ошибка отправки'
    }
  } catch (err: any) {
    console.error('Error sending message:', err)
    
    if (err.response?.status === 419) {
      formError.value = 'Сессия истекла. Пожалуйста, обновите страницу и попробуйте снова.'
    } else if (err.response?.status === 401) {
      formError.value = 'Пожалуйста, войдите в систему заново.'
    } else {
      formError.value = err.data?.message || 'Ошибка отправки. Попробуйте позже.'
    }
  } finally {
    sending.value = false
  }
}
</script>