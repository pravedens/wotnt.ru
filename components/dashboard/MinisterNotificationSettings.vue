<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
    <h3 class="text-xl font-bold text-white mb-4">🔔 Уведомления о новых сообщениях</h3>
    <p class="text-white/60 text-sm mb-4">
      Настройте получение уведомлений, когда прихожане отправляют вам сообщения
    </p>
    
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      <p class="text-white/60 mt-2">Загрузка...</p>
    </div>
    
    <div v-else class="space-y-4">
      <!-- Email уведомления -->
      <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span class="text-white font-medium">Email уведомления</span>
          </div>
          <p class="text-white/40 text-xs mt-1">Получать уведомления о новых сообщениях на почту</p>
        </div>
        <button 
          @click="toggleSetting('email')"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="settings.email ? 'bg-blue-500' : 'bg-white/20'"
        >
          <span 
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="settings.email ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
      
      <!-- Web Push уведомления (через браузер) -->
      <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span class="text-white font-medium">Push-уведомления (браузер)</span>
          </div>
          <p class="text-white/40 text-xs mt-1">Получать уведомления прямо в браузере</p>
        </div>
        <button 
          @click="toggleSetting('webpush')"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="settings.webpush ? 'bg-blue-500' : 'bg-white/20'"
        >
          <span 
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="settings.webpush ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
      
      <!-- Кнопка сохранения -->
      <div class="flex justify-end pt-4">
        <button 
          @click="saveSettings"
          :disabled="saving"
          class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          {{ saving ? 'Сохранение...' : 'Сохранить настройки' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'  // ✅ ДОБАВЛЕН ИМПОРТ

// Интерфейсы для ответов API
interface SettingsResponse {
  success: boolean
  settings: {
    email: boolean
    webpush: boolean
  }
}

interface SaveSettingsResponse {
  success: boolean
  message?: string
}

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const { $api } = useApi()  // ✅ ДОБАВЛЕНО

const loading = ref(true)
const saving = ref(false)

const settings = ref({
  email: true,
  webpush: false
})

const loadSettings = async () => {
  loading.value = true
  try {
    // ✅ Используем $api вместо $fetch с baseURL
    const response = await $api<SettingsResponse>('/user/minister-notification-settings')
    if (response.success) {
      settings.value = response.settings
    }
  } catch (error) {
    console.error('Failed to load minister notification settings:', error)
    settings.value = { email: true, webpush: false }
  } finally {
    loading.value = false
  }
}

const toggleSetting = (key: 'email' | 'webpush') => {
  settings.value[key] = !settings.value[key]
}

const saveSettings = async () => {
  saving.value = true
  try {
    // ✅ Используем $api вместо $fetch с baseURL
    const response = await $api<SaveSettingsResponse>('/user/minister-notification-settings', {
      method: 'PUT',
      body: { settings: settings.value }
    })
    
    if (response.success) {
      notificationStore.success('Успешно', 'Настройки уведомлений сохранены')
    }
  } catch (error: any) {
    notificationStore.error('Ошибка', error?.data?.message || 'Не удалось сохранить настройки')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>