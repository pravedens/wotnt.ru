<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
      <h1 class="text-3xl font-bold text-white mb-2 text-center">Восстановление пароля</h1>
      <p class="text-white/60 text-center mb-8">
        Введите ваш email, и мы отправим ссылку для сброса пароля
      </p>
      
      <!-- Сообщение об успехе -->
      <div v-if="success" class="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
        {{ success }}
      </div>
      
      <!-- Сообщение об ошибке -->
      <div v-if="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
        {{ error }}
      </div>
      
      <!-- Поле для email -->
      <div v-if="!success" class="mb-6">
        <label class="block text-white/80 mb-2">Email</label>
        <input 
          v-model="email" 
          type="email" 
          required
          placeholder="ваш@email.ru"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
          :disabled="loading"
        >
      </div>
      
      <!-- Кнопка отправки -->
      <button 
        v-if="!success"
        @click="sendResetLink"
        :disabled="loading || !email"
        class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50 mb-4"
      >
        {{ loading ? 'Отправка...' : 'Отправить ссылку' }}
      </button>
      
      <!-- Кнопка вернуться к логину -->
      <NuxtLink 
        :to="loginLink"
        class="block text-center text-white/60 hover:text-white transition"
      >
        ← Вернуться к входу
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

// Сохраняем URL для возврата после восстановления
const redirectPath = ref('/dashboard')

onMounted(() => {
  // Если уже авторизован, перенаправляем
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
    return
  }
  
  // Сохраняем redirect из query параметра
  if (route.query.redirect) {
    redirectPath.value = route.query.redirect
  } else {
    // Проверяем referrer (откуда пришли)
    const referrer = document.referrer
    if (referrer && referrer.includes(window.location.hostname)) {
      try {
        const url = new URL(referrer)
        if (!url.pathname.includes('/auth/')) {
          redirectPath.value = url.pathname + url.search
        }
      } catch (e) {
        console.error('Error parsing referrer:', e)
      }
    }
  }
})

// Ссылка для возврата к логину с сохранением redirect
const loginLink = computed(() => ({
  path: '/auth/login',
  query: redirectPath.value !== '/dashboard' ? { redirect: redirectPath.value } : undefined
}))

const sendResetLink = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  
  const result = await authStore.forgotPassword(email.value)
  
  if (result.success) {
    success.value = result.message
    email.value = ''
  } else {
    error.value = result.error
  }
  
  loading.value = false
}
</script>