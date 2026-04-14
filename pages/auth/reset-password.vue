<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
      <h1 class="text-3xl font-bold text-white mb-8 text-center">Новый пароль</h1>
      
      <!-- Сообщение об ошибке -->
      <div v-if="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
        {{ error }}
      </div>
      
      <!-- Сообщение об успехе -->
      <div v-if="success" class="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
        {{ success }}
      </div>
      
      <form v-if="!success" @submit.prevent="resetPassword">
        <!-- Email (скрытое поле для формы) -->
        <input type="hidden" v-model="form.email">
        
        <!-- Новый пароль -->
        <div class="mb-4">
          <label class="block text-white/80 mb-2">Новый пароль</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            minlength="8"
            autocomplete="new-password"
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
            :disabled="loading"
          >
          <p class="text-white/40 text-xs mt-1">Минимум 8 символов</p>
        </div>
        
        <!-- Подтверждение пароля -->
        <div class="mb-6">
          <label class="block text-white/80 mb-2">Подтверждение пароля</label>
          <input 
            v-model="form.password_confirmation" 
            type="password" 
            required
            autocomplete="new-password"
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
            :class="{ 'border-red-500': passwordMismatch }"
            :disabled="loading"
          >
          <p v-if="passwordMismatch" class="text-red-300 text-xs mt-1">
            Пароли не совпадают
          </p>
        </div>
        
        <!-- Кнопка сброса -->
        <button 
          type="submit" 
          :disabled="loading || !isFormValid"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50 mb-4"
        >
          {{ loading ? 'Сохранение...' : 'Сохранить новый пароль' }}
        </button>
      </form>
      
      <!-- Кнопка перейти к логину после успеха -->
      <div v-if="success" class="text-center">
        <NuxtLink 
          :to="loginLink"
          class="inline-block bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-teal-600 transition"
        >
          Войти с новым паролем
        </NuxtLink>
      </div>
      
      <!-- Ссылка назад -->
      <NuxtLink 
        v-if="!success"
        :to="loginLink"
        class="block text-center text-white/60 hover:text-white transition mt-4"
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

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Получаем токен и email из URL
const token = route.query.token || ''
const email = route.query.email || ''

// Сохраняем URL для возврата
const redirectPath = ref('/dashboard')

const form = ref({
  email: email,
  token: token,
  password: '',
  password_confirmation: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

// Формируем ссылку на логин с сохранением redirect
const loginLink = computed(() => ({
  path: '/auth/login',
  query: redirectPath.value !== '/dashboard' ? { redirect: redirectPath.value } : undefined
}))

// Проверка совпадения паролей
const passwordMismatch = computed(() => {
  return form.value.password && 
         form.value.password_confirmation && 
         form.value.password !== form.value.password_confirmation
})

// Валидация формы
const isFormValid = computed(() => {
  return form.value.password.length >= 8 &&
         form.value.password === form.value.password_confirmation &&
         form.value.token &&
         form.value.email
})

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
  
  // Если нет токена или email в URL, показываем ошибку
  if (!token || !email) {
    error.value = 'Недействительная ссылка для сброса пароля'
  }
})

const resetPassword = async () => {
  if (!isFormValid.value) {
    error.value = 'Пожалуйста, заполните все поля правильно'
    return
  }
  
  loading.value = true
  error.value = ''
  
  const result = await authStore.resetPassword(form.value)
  
  if (result.success) {
    success.value = result.message
    // Через 3 секунды перенаправляем на логин с сохранением redirect
    setTimeout(() => {
      router.push(loginLink.value)
    }, 3000)
  } else {
    error.value = result.error
  }
  
  loading.value = false
}
</script>