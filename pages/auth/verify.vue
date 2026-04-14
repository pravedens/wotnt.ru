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
          Письмо с подтверждением отправлено на <strong>{{ userEmail || authStore.user?.email || 'указанный email' }}</strong>
        </p>
        <button 
          @click="resendEmail"
          :disabled="resendLoading"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {{ resendLoading ? 'Отправка...' : 'Отправить повторно' }}
        </button>
        <button 
          v-if="authStore.isAuthenticated"
          @click="logout"
          class="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Выйти
        </button>
        <NuxtLink 
          v-else
          to="/auth/login" 
          class="block text-white/60 hover:text-white transition"
        >
          Вернуться к входу
        </NuxtLink>
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
const userEmail = ref('')

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
  
  const { verified, status: urlStatus, message: urlMessage, registered, email } = route.query
  
  // Сохраняем email из query
  if (email) {
    userEmail.value = email
  }
  
  // После регистрации (пользователь не авторизован)
  if (registered === '1') {
    status.value = 'pending'
    title.value = 'Подтвердите email'
    const displayEmail = userEmail.value || authStore.user?.email || 'указанный email'
    message.value = `Письмо с подтверждением отправлено на ${displayEmail}. Перейдите по ссылке в письме для подтверждения.`
    icon.value = '📧'
    return
  }
  
  // Обработка параметров из URL (после редиректа из Laravel)
  if (urlStatus === 'success' || verified === '1') {
    status.value = 'success'
    title.value = 'Email подтвержден!'
    message.value = urlMessage || 'Ваш email успешно подтвержден. Теперь вы можете войти в аккаунт.'
    icon.value = '✅'
    
    // Обновляем данные пользователя в store (если есть)
    if (authStore.isAuthenticated) {
      await authStore.fetchUser()
      
      // Если пользователь уже авторизован, через 2 секунды идем в дашборд
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else {
      // Если не авторизован - показываем кнопку "Войти в аккаунт"
      status.value = 'success'
      // Кнопка "Войти в аккаунт" уже есть в шаблоне
    }
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
      const displayEmail = userEmail.value || authStore.user?.email || 'указанный email'
      message.value = `Для доступа к личному кабинету необходимо подтвердить ваш email адрес. Письмо отправлено на ${displayEmail}.`
    } else {
      // Уже подтвержден - идем в дашборд
      await router.push('/dashboard')
    }
  }
  else {
    // Если нет параметров и не авторизован - показываем информационное сообщение
    status.value = 'pending'
    title.value = 'Подтверждение email'
    message.value = 'Если вы зарегистрировались, проверьте почту и перейдите по ссылке для подтверждения.'
    icon.value = '📧'
  }
})

const resendEmail = async () => {
  // Если не авторизован, пробуем отправить по email из query
  if (!authStore.isAuthenticated) {
    const email = userEmail.value || route.query.email
    if (!email) {
      notificationStore.warning('Внимание', 'Email не указан. Пожалуйста, войдите в аккаунт.')
      await router.push('/auth/login')
      return
    }
    
    resendLoading.value = true
    try {
      await $fetch('https://wotgospel.ru/api/email/verification-notification', {
        method: 'POST',
        body: { email },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      notificationStore.success('Успешно', 'Письмо отправлено повторно. Проверьте вашу почту.')
    } catch (err) {
      notificationStore.error('Ошибка', 'Не удалось отправить письмо')
    } finally {
      resendLoading.value = false
    }
    return
  }
  
  // Авторизованный пользователь
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