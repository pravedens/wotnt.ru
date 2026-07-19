<template>
  <div v-if="visible" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="close">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-gray-900/95 p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 class="text-xl font-bold text-white">✉️ Написать {{ minister.full_name || minister.name }}</h3>
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

const props = defineProps({
  visible: { type: Boolean, default: false },
  minister: { type: Object, required: true }
})

const emit = defineEmits(['close', 'sent'])

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const siteKey = useRuntimeConfig().public.yandexCaptchaSiteKey

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
      // ✅ Для авторизованных пользователей передаём данные из профиля
      body.sender_name = authStore.user?.full_name || authStore.user?.name
      body.sender_email = authStore.user?.email
    }
    
    await $fetch(`/api/ministers/${props.minister.id}/message`, {
      method: 'POST',
      baseURL: 'https://wotgospel.ru',
      headers: isAuthenticated.value ? { 'Authorization': `Bearer ${authStore.token}` } : {},
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