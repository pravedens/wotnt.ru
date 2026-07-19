<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
      <h1 class="text-3xl font-bold text-white mb-8 text-center">Вход</h1>
      
      <div v-if="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-white/80 mb-2">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
            placeholder="ваш@email.ru"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-white/80 mb-2">Пароль</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
            placeholder="********"
          >
        </div>
        
        <div class="mb-6 flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="form.remember"
              class="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            >
            <span class="text-white/70 text-sm">Запомнить меня</span>
          </label>
          
          <NuxtLink 
            to="/auth/forgot-password" 
            class="text-white/50 hover:text-white text-sm transition"
          >
            Забыли пароль?
          </NuxtLink>
        </div>
        
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
        >
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
        
        <div class="mt-4 text-center">
          <NuxtLink to="/auth/register" class="text-white/60 hover:text-white transition">
            Нет аккаунта? Зарегистрироваться
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

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
  email: '',
  password: '',
  remember: false,
})
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await authStore.login(
      form.value.email, 
      form.value.password, 
      form.value.remember
    )
    
    if (result.success) {
      notificationStore.success('Успешный вход', 'Добро пожаловать!')
      
      if (!result.isVerified) {
        notificationStore.warning('Требуется подтверждение', 'Пожалуйста, подтвердите email для доступа к личному кабинету')
        await router.push('/auth/verify')
      } else {
        const redirect = route.query.redirect?.toString() || '/dashboard'
        await router.push(redirect)
      }
    } else {
      error.value = result.error || 'Ошибка входа'
    }
  } catch (err) {
    console.error('❌ Login error:', err)
    error.value = err.message || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>