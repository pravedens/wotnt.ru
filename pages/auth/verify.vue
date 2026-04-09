<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 text-center">
      <div class="text-6xl mb-4" :class="iconClass">
        {{ icon }}
      </div>
      <h1 class="text-2xl font-bold text-white mb-4">{{ title }}</h1>
      <p class="text-white/80 mb-6">
        {{ message }}
      </p>
      
      <div v-if="status === 'success'" class="space-y-3">
        <button 
          @click="goToLogin"
          class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          Войти в аккаунт
        </button>
      </div>
      
      <div v-else-if="status === 'error'" class="space-y-3">
        <button 
          @click="resendEmail"
          :disabled="resendLoading"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {{ resendLoading ? 'Отправка...' : 'Отправить письмо повторно' }}
        </button>
        <NuxtLink 
          to="/auth/login" 
          class="block text-white/60 hover:text-white transition"
        >
          Вернуться к входу
        </NuxtLink>
      </div>
      
      <div v-else-if="status === 'pending'" class="space-y-3">
        <p class="text-white/80 mb-4">
          Письмо с подтверждением отправлено на <strong>{{ authStore.user?.email }}</strong>
        </p>
        <button 
          @click="resendEmail"
          :disabled="resendLoading"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {{ resendLoading ? 'Отправка...' : 'Отправить повторно' }}
        </button>
        <button 
          @click="logout"
          class="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Выйти
        </button>
      </div>
      
      <div v-else-if="status === 'loading'" class="space-y-3">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p class="text-white/80">Проверка статуса...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const route = useRoute()
const router = useRouter()

const status = ref('loading')
const title = ref('Подтверждение email')
const message = ref('')
const icon = ref('📧')
const resendLoading = ref(false)

const iconClass = computed(() => {
  switch (status.value) {
    case 'success': return 'text-green-400'
    case 'error': return 'text-red-400'
    default: return 'text-white'
  }
})

onMounted(async () => {
  // Инициализируем store
  if (!authStore.initialized) {
    await authStore.init()
  }
  
  const { verified, status: urlStatus, message: urlMessage } = route.query
  
  console.log('Verify page:', { urlStatus, verified, isAuthenticated: authStore.isAuthenticated })
  
  // Обработка параметров из URL (после редиректа из Laravel)
  if (urlStatus === 'success' || verified === '1') {
    status.value = 'success'
    title.value = 'Email подтвержден!'
    message.value = urlMessage || 'Ваш email успешно подтвержден. Теперь вы можете войти в аккаунт.'
    icon.value = '✅'
    
    // ✅ ВАЖНО: Обновляем данные пользователя в store
    if (authStore.isAuthenticated) {
      await authStore.fetchUser() // Перезагружаем пользователя из API
      console.log('User updated after verification:', {
        email: authStore.user?.email,
        email_verified_at: authStore.user?.email_verified_at,
        isEmailVerified: authStore.isEmailVerified
      })
    }
    
    // Перенаправляем в дашборд через 2 секунды
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } 
  else if (urlStatus === 'error') {
    status.value = 'error'
    title.value = 'Ошибка подтверждения'
    message.value = urlMessage || 'Ссылка для подтверждения недействительна или истекла.'
    icon.value = '❌'
  }
  else if (authStore.isAuthenticated) {
    if (!authStore.user?.email_verified_at) {
      status.value = 'pending'
      title.value = 'Подтвердите email'
      message.value = `Для доступа к личному кабинету необходимо подтвердить ваш email адрес.`
    } else {
      // Уже подтвержден - идем в дашборд
      await router.push('/dashboard')
    }
  }
  else {
    status.value = 'error'
    title.value = 'Требуется авторизация'
    message.value = 'Пожалуйста, войдите в аккаунт для подтверждения email.'
    icon.value = '🔐'
    
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  }
})

const resendEmail = async () => {
  if (!authStore.isAuthenticated) {
    notificationStore.warning('Внимание', 'Необходимо войти в аккаунт')
    await router.push('/auth/login')
    return
  }
  
  resendLoading.value = true
  
  try {
    const result = await authStore.resendVerification()
    
    if (result.success) {
      notificationStore.success('Успешно', result.message)
      message.value = 'Письмо отправлено повторно. Проверьте вашу почту.'
    } else {
      notificationStore.error('Ошибка', result.error)
    }
  } catch (err) {
    notificationStore.error('Ошибка', err.message)
  } finally {
    resendLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/auth/login')
}

const logout = async () => {
  await authStore.logout()
  await router.push('/auth/login')
}
</script>