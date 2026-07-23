<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <!-- Хлебные крошки -->
      <nav class="flex items-center gap-2 text-white/70 mb-6">
        <NuxtLink to="/" class="hover:text-white transition">Главная</NuxtLink>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-white">Контакты</span>
      </nav>
      
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
                <p class="text-white/80">г. Нижний Тагил, ул. Чехова, 10</p>
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
                <a href="tel:+79991234567" class="text-white/80 hover:text-white transition block">+7 (999) ...</a>
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
                <a href="mailto:admin@wotgospel.ru" class="text-white/80 hover:text-white transition block">admin@wotgospel.ru</a>
              </div>
            </div>
          </div>
          
          <!-- Социальные сети -->
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
        
        <!-- Карта -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 h-[500px] lg:h-auto min-h-[500px]">
          <iframe
            class="w-full h-full"
            src="https://yandex.ru/map-widget/v1/?ll=60.008460%2C57.899827&mode=whatshere&whatshere%5Bpoint%5D=60.009365%2C57.900183&whatshere%5Bzoom%5D=17&z=16.8"
            frameborder="0"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            title="Церковь Слово Истины — Нижний Тагил, ул. Чехова, 10"
          ></iframe>
        </div>
      </div>
      
      <!-- Форма обратной связи -->
      <div class="max-w-2xl mx-auto mt-12">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 class="text-2xl font-bold text-white text-center mb-6">Напишите нам</h2>
          
          <form @submit.prevent="sendMessage" class="space-y-4">
            <!-- Для неавторизованных — поля имени и email -->
            <template v-if="!isAuthenticated">
              <div>
                <label class="block text-white/80 mb-2 text-sm">
                  Ваше имя <span class="text-red-300">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                  placeholder="Иван Петров"
                />
              </div>
              
              <div>
                <label class="block text-white/80 mb-2 text-sm">
                  Ваш Email <span class="text-red-300">*</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                  placeholder="ivan@example.com"
                />
              </div>
            </template>
            
            <!-- Для авторизованных — показываем данные из профиля -->
            <div v-else class="bg-white/5 rounded-lg p-3 text-white/70 text-sm">
              <p>📧 От: <strong>{{ userEmail }}</strong></p>
              <p>👤 Имя: <strong>{{ userName }}</strong></p>
            </div>
            
            <!-- Выбор получателя -->
            <div>
              <label class="block text-white/80 mb-2 text-sm">
                Кому отправить <span class="text-red-300">*</span>
              </label>
              
              <select
                v-model="form.recipientRole"
                required
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                @change="onRecipientChange"
              >
                <option value="" disabled>Выберите получателя</option>
                <option 
                  v-for="recipient in recipients" 
                  :key="recipient.role"
                  :value="recipient.role"
                  :disabled="!recipient.has_recipients"
                  :class="{ 'opacity-50': !recipient.has_recipients }"
                >
                  {{ recipient.name }} 
                  ({{ recipient.count }} {{ getRecipientWord(recipient.count) }})
                  <span v-if="!recipient.has_recipients"> - нет получателей</span>
                </option>
              </select>
              
              <!-- Описание выбранного получателя -->
              <div v-if="selectedRecipientDescription" class="mt-2 text-sm text-blue-300 bg-blue-500/10 p-2 rounded-lg">
                <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ selectedRecipientDescription }}
              </div>
            </div>
            
            <!-- Сообщение -->
            <div>
              <label class="block text-white/80 mb-2 text-sm">Сообщение <span class="text-red-300">*</span></label>
              <textarea
                v-model="form.message"
                required
                rows="4"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition resize-none"
                placeholder="Ваше сообщение..."
                @input="sanitizeMessage"
              ></textarea>
            </div>
            
            <!-- Капча (только для неавторизованных) -->
            <div v-if="!isAuthenticated" class="flex justify-center">
              <div
                id="contacts-captcha-container"
                class="smart-captcha"
                :data-sitekey="siteKey"
                data-hl="ru"
                style="height: 80px;"
              ></div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'

// ============================================
// INTERFACES
// ============================================

interface Recipient {
  role: string
  name: string
  emails: string[]
  count: number
  description: string
  has_recipients: boolean
}

interface ContactsResponse {
  success: boolean
  recipients: Recipient[]
  message?: string
}

interface SendMessageResponse {
  success: boolean
  message?: string
}

// ============================================
// COMPOSABLES
// ============================================

const route = useRoute()
const authStore = useAuthStore()
const { $api } = useApi()

// ============================================
// STATE
// ============================================

const isAuthenticated = computed(() => authStore.isAuthenticated)
const token = computed(() => authStore.token)
const siteKey = useRuntimeConfig().public.yandexCaptchaSiteKey

const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Пользователь')
const userEmail = computed(() => authStore.user?.email || '')

const recipients = ref<Recipient[]>([])
const loadingRecipients = ref(false)
const selectedRecipientDescription = ref('')

// ============================================
// FORM STATE
// ============================================

const form = reactive({
  name: '',
  email: '',
  message: '',
  recipientRole: '',
  captchaToken: ''
})

const sending = ref(false)
const formSuccess = ref(false)
const formError = ref('')

// ============================================
// METHODS
// ============================================

const getRecipientWord = (count: number) => {
  if (count === 1) return 'получатель'
  if (count >= 2 && count <= 4) return 'получателя'
  return 'получателей'
}

const loadRecipients = async () => {
  loadingRecipients.value = true
  
  try {
    const url = isAuthenticated.value ? '/contacts/recipients' : '/contacts/recipients-public'
    // ✅ Типизируем ответ
    const response = await $api<ContactsResponse>(url)
    
    if (response.success) {
      recipients.value = response.recipients || []
    }
  } catch (err) {
    console.error('Error loading recipients:', err)
  } finally {
    loadingRecipients.value = false
  }
}

const onRecipientChange = () => {
  const selected = recipients.value.find(r => r.role === form.recipientRole)
  selectedRecipientDescription.value = selected?.description || ''
}

const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === 'XSRF-TOKEN' && value) {
      return decodeURIComponent(value)
    }
  }
  return null
}

const sanitizeMessage = () => {
  form.message = form.message.replace(/<[^>]*>/g, '')
  form.message = form.message.replace(/javascript:/gi, '')
  form.message = form.message.replace(/on\w+=/gi, '')
}

const getCaptchaToken = (): string | null => {
  if (typeof document === 'undefined') return null
  const container = document.getElementById('contacts-captcha-container')
  if (!container) return null
  const input = container.querySelector('input[name="smart-token"]') as HTMLInputElement
  return input?.value || null
}

const initCaptcha = () => {
  if (isAuthenticated.value) return
  if (typeof document === 'undefined') return
  if (document.querySelector('#yandex-captcha-script')) return
  
  const script = document.createElement('script')
  script.id = 'yandex-captcha-script'
  script.src = 'https://smartcaptcha.cloud.yandex.ru/captcha.js'
  script.defer = true
  document.head.appendChild(script)
}

const sendMessage = async () => {
  sending.value = true
  formSuccess.value = false
  formError.value = ''
  
  sanitizeMessage()
  
  if (!form.message.trim()) {
    formError.value = 'Сообщение не может быть пустым'
    sending.value = false
    return
  }
  
  if (!form.recipientRole) {
    formError.value = 'Пожалуйста, выберите получателя сообщения'
    sending.value = false
    return
  }
  
  const body: Record<string, any> = {
    message: form.message.trim(),
    recipient_role: form.recipientRole
  }
  
  if (!isAuthenticated.value) {
    if (!form.name.trim() || !form.email.trim()) {
      formError.value = 'Пожалуйста, заполните имя и email'
      sending.value = false
      return
    }
    
    const captchaToken = getCaptchaToken()
    if (!captchaToken) {
      formError.value = 'Пожалуйста, подтвердите, что вы не робот'
      sending.value = false
      return
    }
    
    body.name = form.name.trim()
    body.email = form.email.trim()
    body.captcha_token = captchaToken
  }
  
  try {
    // ✅ Типизируем ответ
    const response = await $api<SendMessageResponse>('/contacts', {
      method: 'POST',
      body
    })
    
    if (response.success) {
      formSuccess.value = true
      form.message = ''
      form.recipientRole = ''
      selectedRecipientDescription.value = ''
      if (!isAuthenticated.value) {
        form.name = ''
        form.email = ''
        const container = document.getElementById('contacts-captcha-container')
        if (container) container.innerHTML = ''
        initCaptcha()
      }
      
      setTimeout(() => {
        formSuccess.value = false
      }, 5000)
    } else {
      formError.value = response.message || 'Ошибка отправки'
    }
  } catch (err: any) {
    console.error('Error sending message:', err)
    formError.value = err.data?.message || 'Ошибка отправки. Попробуйте позже.'
  } finally {
    sending.value = false
  }
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(() => {
  loadRecipients()
  if (!isAuthenticated.value) {
    setTimeout(initCaptcha, 100)
  }
})

watch(isAuthenticated, (newVal) => {
  loadRecipients()
  if (!newVal) {
    setTimeout(initCaptcha, 100)
  }
}, { immediate: true })
</script>

<style scoped>
.smart-captcha {
  min-height: 80px;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>