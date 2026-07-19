<script setup>
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const route = useRoute()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  privacy_accepted: false
})

const loading = ref(false)
const error = ref('')
const privacyError = ref(false)
const redirectPath = ref('/')
const showResetModal = ref(false)

const passwordMismatch = computed(() => {
  return form.value.password && 
         form.value.password_confirmation && 
         form.value.password !== form.value.password_confirmation
})

onMounted(async () => {
  await authStore.init()
  
  if (authStore.isAuthenticated) {
    router.push('/')
    return
  }
  
  if (route.query.redirect) {
    redirectPath.value = route.query.redirect
  } else {
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

const handleRegister = async () => {
  error.value = ''
  privacyError.value = false
  showResetModal.value = false
  
  if (!form.value.privacy_accepted) {
    privacyError.value = true
    notificationStore.warning(
      'Необходимо согласие',
      'Для регистрации необходимо согласиться на обработку персональных данных'
    )
    return
  }
  
  if (passwordMismatch.value) {
    notificationStore.error('Ошибка', 'Пароли не совпадают')
    return
  }
  
  loading.value = true
  
  try {
    let registrationSource = 'wotnt.ru'
    if (process.client) {
      const hostname = window.location.hostname
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        registrationSource = 'wotnt.ru'
      } else {
        registrationSource = hostname
      }
    }
    
    const result = await authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
      privacy_accepted: form.value.privacy_accepted,
      registration_source: registrationSource
    })
    
    if (result.success) {
      notificationStore.success('Регистрация успешна!', result.message)
      await router.push({
        path: '/auth/verify',
        query: { registered: '1', email: form.value.email }
      })
    } else {
      // ✅ Обработка случая, когда пользователь уже существует
      if (result.error_code === 'user_exists') {
        showResetModal.value = true
        notificationStore.warning(
          'Аккаунт уже существует',
          result.message
        )
      } else {
        error.value = result.error
        if (result.error?.includes('email') || result.error?.includes('уже')) {
          notificationStore.warning(
            'Email уже зарегистрирован',
            'Попробуйте войти или восстановить пароль'
          )
        } else {
          notificationStore.error('Ошибка регистрации', result.error)
        }
      }
    }
  } catch (err) {
    console.error('Register error:', err)
    error.value = err.message || 'Произошла неизвестная ошибка'
    notificationStore.error('Ошибка', error.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
      <h1 class="text-3xl font-bold text-white mb-8 text-center">Регистрация</h1>
      
      <div v-if="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-white/80 mb-2">Имя <span class="text-red-300">*</span></label>
          <input 
            v-model="form.name" 
            type="text" 
            required
            autocomplete="name"
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
            placeholder="Иван"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-white/80 mb-2">Email <span class="text-red-300">*</span></label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            autocomplete="email"
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
            placeholder="ivan@example.com"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-white/80 mb-2">Пароль <span class="text-red-300">*</span></label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            minlength="8"
            autocomplete="new-password"
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
            placeholder="********"
          >
          <p class="text-white/40 text-xs mt-1">Минимум 8 символов</p>
        </div>
        
        <div class="mb-6">
          <label class="block text-white/80 mb-2">Подтверждение пароля <span class="text-red-300">*</span></label>
          <input 
            v-model="form.password_confirmation" 
            type="password" 
            required
            autocomplete="new-password"
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
            :class="{ 'border-red-500': passwordMismatch }"
            placeholder="********"
          >
          <p v-if="passwordMismatch" class="text-red-300 text-xs mt-1">
            Пароли не совпадают
          </p>
        </div>
        
        <div class="mb-6">
          <div class="flex items-start gap-3">
            <div class="flex items-center h-6">
              <input
                id="privacy"
                v-model="form.privacy_accepted"
                type="checkbox"
                class="w-4 h-4 bg-white/10 border border-white/20 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                :class="{ 'border-red-500': privacyError }"
              >
            </div>
            <div class="flex-1">
              <label for="privacy" class="text-white/80 text-sm">
                Я согласен на 
                <NuxtLink 
                  to="/privacy" 
                  target="_blank"
                  class="text-blue-300 hover:text-blue-200 underline transition"
                >
                  обработку персональных данных
                </NuxtLink>
                <span class="text-red-300 ml-1">*</span>
              </label>
              <p v-if="privacyError" class="text-red-300 text-xs mt-1">
                Необходимо согласие на обработку персональных данных
              </p>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 rounded-lg hover:from-green-600 hover:to-teal-600 transition disabled:opacity-50 mb-4"
        >
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
        
        <div class="mt-4 text-center text-white/60">
          <NuxtLink to="/auth/login" class="hover:text-white transition">
            Уже есть аккаунт? Войти
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
  
  <!-- Модальное окно для существующего пользователя -->
  <div v-if="showResetModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-full max-w-md border border-white/20">
      <h3 class="text-xl font-bold text-white mb-4">Аккаунт уже существует</h3>
      <p class="text-white/80 mb-4">
        Пользователь с email <strong>{{ form.email }}</strong> уже зарегистрирован.
      </p>
      <p class="text-white/60 mb-6">
        Если вы забыли пароль, вы можете его сбросить.
      </p>
      <div class="flex flex-col gap-3">
        <NuxtLink 
          to="/auth/forgot-password" 
          class="w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          @click="showResetModal = false"
        >
          Восстановить пароль
        </NuxtLink>
        <button 
          @click="showResetModal = false" 
          class="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>