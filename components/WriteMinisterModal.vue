<template>
  <div v-if="visible" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="close">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-gray-900/95 p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 class="text-xl font-bold text-white">✉️ Написать {{ minister.full_name || minister.name || 'Служителю' }}</h3>
        <button @click="close" class="text-gray-400 hover:text-white text-2xl">&times;</button>
      </div>
      
      <div class="p-6">
        <form @submit.prevent="submitMessage">
          <!-- Для неавторизованных показываем поля -->
          <template v-if="!isAuthenticated">
            <div class="mb-4">
              <label class="block text-white/80 mb-2">Ваше имя</label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div class="mb-4">
              <label class="block text-white/80 mb-2">Ваш Email</label>
              <input v-model="form.email" type="email" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
          </template>
          
          <div class="mb-4">
            <label class="block text-white/80 mb-2">Сообщение</label>
            <textarea v-model="form.message" required rows="4" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none"></textarea>
          </div>
          
          <!-- Капча (только для неавторизованных) -->
          <div v-if="!isAuthenticated" class="mb-4 flex justify-center">
            <div
              id="captcha-container"
              class="smart-captcha"
              :data-sitekey="siteKey"
              data-hl="ru"
              style="height: 80px;"
            ></div>
          </div>
          
          <button type="submit" :disabled="sending" class="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            {{ sending ? 'Отправка...' : 'Отправить' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'
import { useApi } from '~/composables/useApi'  // ✅ ДОБАВЛЕН ИМПОРТ

// Интерфейсы
interface User {
  id: number
  name: string
  full_name?: string
  last_name?: string
  middle_name?: string
  email: string
  email_verified_at: string | null
  phone?: string
  city?: string
}

interface Minister {
  id: number
  full_name?: string
  name?: string
  last_name?: string
  email?: string
}

const props = defineProps<{
  visible: boolean
  minister: Minister
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'sent'): void
}>()

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { $api } = useApi()  // ✅ ДОБАВЛЕНО

const isAuthenticated = computed(() => authStore.isAuthenticated)
const siteKey = useRuntimeConfig().public.yandexCaptchaSiteKey

// Геттер для полного имени пользователя
const userFullName = computed(() => {
  const user = authStore.user as User | null
  if (!user) return ""
  
  if (user.full_name) return user.full_name
  
  const parts = []
  if (user.last_name) parts.push(user.last_name)
  if (user.name) parts.push(user.name)
  if (user.middle_name) parts.push(user.middle_name)
  
  return parts.join(" ").trim() || user.name || ""
})

const form = ref({ name: '', email: '', message: '', captchaToken: '' })
const sending = ref(false)

const getCaptchaToken = (): string | null => {
  const container = document.getElementById('captcha-container')
  if (!container) return null
  const input = container.querySelector('input[name="smart-token"]') as HTMLInputElement
  return input?.value || null
}

const initCaptcha = () => {
  if (isAuthenticated.value) return
  if (document.querySelector('#yandex-captcha-script')) return
  
  const script = document.createElement('script')
  script.id = 'yandex-captcha-script'
  script.src = 'https://smartcaptcha.cloud.yandex.ru/captcha.js'
  script.defer = true
  document.head.appendChild(script)
}

const submitMessage = async () => {
  sending.value = true
  
  try {
    let body: any = { message: form.value.message }
    
    if (!isAuthenticated.value) {
      const captchaToken = getCaptchaToken()
      
      if (!captchaToken) {
        notificationStore.error('Ошибка', 'Пожалуйста, подтвердите, что вы не робот')
        sending.value = false
        return
      }
      
      body.sender_name = form.value.name
      body.sender_email = form.value.email
      body.captcha_token = captchaToken
    } else {
      const user = authStore.user as User | null
      body.sender_name = userFullName.value || user?.name || 'Пользователь'
      body.sender_email = user?.email || ''
    }
    
    // ✅ Используем $api вместо $fetch с baseURL
    await $api(`/ministers/${props.minister.id}/message`, {
      method: 'POST',
      body
    })
    
    notificationStore.success('Успешно', 'Сообщение отправлено')
    emit('sent')
    close()
  } catch (error: any) {
    console.error('Send error:', error)
    notificationStore.error('Ошибка', error?.data?.message || 'Не удалось отправить')
  } finally {
    sending.value = false
  }
}

const close = () => {
  form.value = { name: '', email: '', message: '', captchaToken: '' }
  emit('close')
}

watch(() => props.visible, (val) => {
  if (val && !isAuthenticated.value) {
    setTimeout(initCaptcha, 100)
  } else if (!val) {
    const container = document.getElementById('captcha-container')
    if (container) container.innerHTML = ''
  }
})
</script>

<style scoped>
.smart-captcha {
  min-height: 80px;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>