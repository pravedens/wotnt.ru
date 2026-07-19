<!-- components/NotificationSettings.vue -->
<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 mb-8">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div>
        <h3 class="text-xl font-bold text-white">🔔 Настройки уведомлений</h3>
        <p class="text-white/60 text-sm mt-1">
          Получайте уведомления о новых событиях и напоминания
        </p>
      </div>
      
      <button 
        v-if="!hasConsent"
        @click="openConsentModal"
        class="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-200 rounded-lg hover:bg-green-500/30 transition text-sm whitespace-nowrap"
      >
        Дать согласие
      </button>
      <span v-else class="text-green-400 text-sm flex items-center gap-1 whitespace-nowrap">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Согласие получено
      </span>
    </div>
    
    <div v-if="!notificationsAvailable" class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
      <div class="flex items-start gap-3">
        <div class="text-2xl">⚠️</div>
        <div>
          <h4 class="text-white font-semibold">Требуется подтверждение email</h4>
          <p class="text-white/80 text-sm">
            Для настройки уведомлений необходимо подтвердить ваш email адрес.
          </p>
          <button 
            @click="resendVerification"
            class="mt-2 px-3 py-1 bg-yellow-500/30 text-yellow-200 rounded-lg hover:bg-yellow-500/40 transition text-sm"
          >
            Отправить письмо повторно
          </button>
        </div>
      </div>
    </div>
    
    <div v-else-if="!hasConsent" class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
      <div class="flex items-start gap-3">
        <div class="text-2xl">⚠️</div>
        <div>
          <h4 class="text-white font-semibold">Требуется ваше согласие</h4>
          <p class="text-white/80 text-sm">
            Для получения уведомлений о событиях необходимо дать согласие на обработку данных.
          </p>
        </div>
      </div>
    </div>
    
    <div v-else class="space-y-6">
      <!-- Контактный телефон для SMS -->
      <div>
        <label class="block text-white/80 mb-2 text-sm sm:text-base">
          📱 Телефон для SMS-уведомлений
          <span class="text-white/40 text-xs ml-2">(необязательно)</span>
        </label>
        <input 
          v-model="phoneForNotifications"
          type="tel"
          placeholder="+7 (999) 999-99-99"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
        >
        <p class="text-white/40 text-xs mt-1">
          Укажите номер, чтобы получать SMS-уведомления о событиях
        </p>
      </div>
      
      <!-- Настройки уведомлений -->
      <div>
        <h4 class="text-white font-semibold mb-3">Получать уведомления:</h4>
        
        <!-- Новые события -->
        <div class="bg-white/5 rounded-lg p-3 sm:p-4 mb-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex-1">
              <span class="text-white font-medium">🆕 О новых событиях</span>
              <p class="text-white/40 text-xs hidden sm:block">Уведомление при добавлении нового события</p>
            </div>
            <div class="flex flex-wrap gap-3 sm:gap-4">
              <label class="flex items-center gap-2">
                <span class="text-white/60 text-sm">Email</span>
                <input type="checkbox" v-model="settings.notify_new_events_email" class="toggle">
              </label>
              <label class="flex items-center gap-2">
                <span class="text-white/60 text-sm">SMS</span>
                <input type="checkbox" v-model="settings.notify_new_events_push" class="toggle" :disabled="!hasPhone">
              </label>
              <label class="flex items-center gap-2">
                <span class="text-white/60 text-sm">Push</span>
                <input type="checkbox" v-model="settings.notify_new_events_webpush" class="toggle">
              </label>
            </div>
          </div>
          <p class="text-white/40 text-xs mt-2 sm:hidden">Уведомление при добавлении нового события</p>
        </div>
        
        <!-- Напоминание за день -->
        <div class="bg-white/5 rounded-lg p-3 sm:p-4 mb-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex-1">
              <span class="text-white font-medium">📅 За день до события</span>
              <p class="text-white/40 text-xs hidden sm:block">Напоминание за 24 часа до начала</p>
            </div>
            <div class="flex flex-wrap gap-3 sm:gap-4">
              <label class="flex items-center gap-2">
                <span class="text-white/60 text-sm">Email</span>
                <input type="checkbox" v-model="settings.notify_event_day_email" class="toggle">
              </label>
              <label class="flex items-center gap-2">
                <span class="text-white/60 text-sm">SMS</span>
                <input type="checkbox" v-model="settings.notify_event_day_push" class="toggle" :disabled="!hasPhone">
              </label>
              <label class="flex items-center gap-2">
                <span class="text-white/60 text-sm">Push</span>
                <input type="checkbox" v-model="settings.notify_event_day_webpush" class="toggle">
              </label>
            </div>
          </div>
          <p class="text-white/40 text-xs mt-2 sm:hidden">Напоминание за 24 часа до начала</p>
        </div>
        
        <!-- В день события -->
        <div class="bg-white/5 rounded-lg p-3 sm:p-4 mb-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex-1">
              <span class="text-white font-medium">🔔 За 2 часа</span>
              <p class="text-white/40 text-xs hidden sm:block">Уведомление за 2 часа до начала</p>
            </div>
            <div class="flex flex-wrap gap-3 sm:gap-4">
              <label class="flex items-center gap-2">
                <span class="text-white/60 text-sm">Email</span>
                <input type="checkbox" v-model="settings.notify_event_reminder_email" class="toggle">
              </label>
              <label class="flex items-center gap-2">
                <span class="text-white/60 text-sm">SMS</span>
                <input type="checkbox" v-model="settings.notify_event_reminder_push" class="toggle" :disabled="!hasPhone">
              </label>
              <label class="flex items-center gap-2">
                <span class="text-white/60 text-sm">Push</span>
                <input type="checkbox" v-model="settings.notify_event_reminder_webpush" class="toggle">
              </label>
            </div>
          </div>
          <p class="text-white/40 text-xs mt-2 sm:hidden">Уведомление за 2 часа до начала</p>
        </div>
      </div>
      
      <!-- Web Push статус -->
      <div class="bg-white/5 rounded-lg p-4 border border-white/10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 class="text-white font-medium">🌐 Web Push уведомления</h4>
            <p class="text-white/40 text-xs">Всплывающие уведомления в браузере</p>
            <p v-if="!isPushSupported" class="text-red-400 text-xs mt-1">
              ⚠️ Ваш браузер не поддерживает Web Push уведомления
            </p>
            <p v-if="pushPermissionDenied" class="text-red-400 text-xs mt-1">
              ⚠️ Разрешение на уведомления заблокировано. Проверьте настройки браузера.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <button 
              v-if="!isPushSubscribed && isPushSupported && !pushPermissionDenied"
              @click="enablePushNotifications"
              :disabled="pushLoading"
              class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition disabled:opacity-50 w-full sm:w-auto"
            >
              {{ pushLoading ? 'Включение...' : 'Включить' }}
            </button>
            <button 
              v-else-if="isPushSubscribed"
              @click="disablePushNotifications"
              :disabled="pushLoading"
              class="px-4 py-2 bg-red-500/20 text-red-200 text-sm rounded-lg hover:bg-red-500/30 transition disabled:opacity-50 w-full sm:w-auto"
            >
              {{ pushLoading ? 'Отключение...' : 'Отключить' }}
            </button>
            <button 
              v-else-if="pushPermissionDenied"
              @click="openBrowserSettings"
              class="px-4 py-2 bg-yellow-500/20 text-yellow-200 text-sm rounded-lg hover:bg-yellow-500/30 transition w-full sm:w-auto"
            >
              Настроить в браузере
            </button>
            <button 
              v-else
              disabled
              class="px-4 py-2 bg-gray-500/20 text-gray-400 text-sm rounded-lg cursor-not-allowed w-full sm:w-auto"
            >
              Не поддерживается
            </button>
          </div>
        </div>
        <div v-if="isPushSubscribed" class="mt-2 text-green-400 text-xs">
          ✓ Уведомления активны
        </div>
        <div v-if="!isPushSubscribed && isPushSupported && !pushPermissionDenied" class="mt-2 text-yellow-400 text-xs">
          ⚡ Нажмите "Включить" чтобы получать уведомления в браузере
        </div>
      </div>
      
      <!-- Кнопки действий -->
      <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <button 
          @click="testNotification('email')"
          class="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition text-sm"
          :disabled="testing"
        >
          📧 Тест Email
        </button>
        <button 
          v-if="hasPhone"
          @click="testNotification('push')"
          class="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition text-sm"
          :disabled="testing"
        >
          📱 Тест SMS
        </button>
        <button 
          v-if="isPushSubscribed"
          @click="testNotification('webpush')"
          class="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition text-sm"
          :disabled="testing"
        >
          🌐 Тест Web Push
        </button>
        <button 
          @click="saveSettings"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </div>
    
    <!-- Модальное окно согласия -->
    <div v-if="showConsentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h3 class="text-2xl font-bold text-white mb-4">Согласие на уведомления</h3>
        <p class="text-white/80 mb-6 text-sm">
          Я даю согласие на получение информационных сообщений о событиях церкви
          по электронной почте, SMS (при указании номера телефона) и Web Push.
        </p>
        <div class="mb-6">
          <label class="flex items-start gap-3">
            <input type="checkbox" v-model="consentChecked" class="mt-1">
            <span class="text-white/80 text-sm">
              Я согласен на обработку моих контактных данных для целей информирования о событиях
            </span>
          </label>
        </div>
        <div class="flex gap-2">
          <button 
            @click="submitConsent"
            :disabled="!consentChecked"
            class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
          >
            Подтвердить
          </button>
          <button 
            @click="closeConsentModal"
            class="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const API_BASE = 'https://wotgospel.ru/api'

const settings = ref({
  notify_new_events_email: false,
  notify_new_events_push: false,
  notify_new_events_webpush: false,
  notify_event_reminder_email: false,
  notify_event_reminder_push: false,
  notify_event_reminder_webpush: false,
  notify_event_day_email: false,
  notify_event_day_push: false,
  notify_event_day_webpush: false,
})

const phoneForNotifications = ref('')
const hasConsent = ref(false)
const saving = ref(false)
const testing = ref(false)
const showConsentModal = ref(false)
const consentChecked = ref(false)
const isPushSubscribed = ref(false)
const isPushSupported = ref(true)
const pushPermissionDenied = ref(false)
const pushLoading = ref(false)
const notificationsAvailable = ref(true)
const userRole = ref('user')

const hasPhone = computed(() => !!phoneForNotifications.value?.trim())

// Повторная отправка верификации
const resendVerification = async () => {
  if (!authStore.isAuthenticated) {
    notificationStore.error('Ошибка', 'Необходимо авторизоваться')
    return
  }
  
  try {
    await $fetch(`${API_BASE}/email/verification-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    notificationStore.success('Письмо отправлено', 'Проверьте вашу почту')
  } catch (err) {
    notificationStore.error('Ошибка', 'Не удалось отправить письмо')
  }
}

// Загрузка настроек
const loadSettings = async () => {
  if (!authStore.isAuthenticated) {
    console.log('NotificationSettings: user not authenticated, skipping load')
    return
  }
  
  try {
    const response = await $fetch(`${API_BASE}/user/notification-settings`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.success) {
      settings.value = {
        notify_new_events_email: response.settings.notify_new_events_email || false,
        notify_new_events_push: response.settings.notify_new_events_push || false,
        notify_new_events_webpush: response.settings.notify_new_events_webpush || false,
        notify_event_reminder_email: response.settings.notify_event_reminder_email || false,
        notify_event_reminder_push: response.settings.notify_event_reminder_push || false,
        notify_event_reminder_webpush: response.settings.notify_event_reminder_webpush || false,
        notify_event_day_email: response.settings.notify_event_day_email || false,
        notify_event_day_push: response.settings.notify_event_day_push || false,
        notify_event_day_webpush: response.settings.notify_event_day_webpush || false,
        notify_enrollment_rejected_email: response.settings.notify_enrollment_rejected_email || false,
        notify_enrollment_rejected_webpush: response.settings.notify_enrollment_rejected_webpush || false,
        notify_certificate_issued_email: response.settings.notify_certificate_issued_email || false,
        notify_certificate_issued_webpush: response.settings.notify_certificate_issued_webpush || false,
      }
      phoneForNotifications.value = response.settings.phone_for_notifications || ''
      hasConsent.value = response.settings.has_consent
      notificationsAvailable.value = response.settings.notifications_available !== false
      userRole.value = response.settings.user_role || 'user'
    }
  } catch (err) {
    console.error('Failed to load notification settings:', err)
  }
}

// Сохранение настроек
const saveSettings = async () => {
  if (!authStore.isAuthenticated) {
    notificationStore.error('Ошибка', 'Необходимо авторизоваться')
    return
  }
  
  saving.value = true
  
  try {
    const response = await $fetch(`${API_BASE}/user/notification-settings`, {
      method: 'PUT',
      body: {
        ...settings.value,
        phone_for_notifications: phoneForNotifications.value,
        consent_given: hasConsent.value
      },
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success) {
      hasConsent.value = true
      notificationStore.success('Настройки сохранены', 'Настройки уведомлений обновлены')
    }
  } catch (err: any) {
    notificationStore.error('Ошибка', err?.data?.message || 'Не удалось сохранить настройки')
  } finally {
    saving.value = false
  }
}

// Тестовое уведомление
const testNotification = async (channel: 'email' | 'push' | 'webpush') => {
  if (!authStore.isAuthenticated) {
    notificationStore.error('Ошибка', 'Необходимо авторизоваться')
    return
  }
  
  if (channel === 'push' && !hasPhone.value) {
    notificationStore.warning('Нет номера', 'Укажите номер телефона для теста SMS')
    return
  }
  
  testing.value = true
  
  try {
    const response = await $fetch(`${API_BASE}/user/test-notification`, {
      method: 'POST',
      body: { channel, type: 'reminder' },
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success) {
      notificationStore.success('Тест отправлен', response.message)
    } else {
      notificationStore.error('Ошибка', response.message)
    }
  } catch (err: any) {
    notificationStore.error('Ошибка', 'Не удалось отправить тестовое уведомление')
  } finally {
    testing.value = false
  }
}

// Проверка статуса разрешения
const checkPermissionStatus = () => {
  if (!('Notification' in window)) {
    isPushSupported.value = false
    return
  }
  
  const permission = Notification.permission
  console.log('Notification permission:', permission)
  
  if (permission === 'denied') {
    pushPermissionDenied.value = true
    isPushSupported.value = true
  } else if (permission === 'granted') {
    pushPermissionDenied.value = false
    isPushSupported.value = true
  } else {
    pushPermissionDenied.value = false
    isPushSupported.value = true
  }
}

// Проверка существующей подписки (реальная проверка в браузере)
const checkExistingSubscription = async () => {
  if (!isPushSupported.value || !('serviceWorker' in navigator)) return
  
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    const hasSubscription = !!subscription
    
    // Принудительно обновляем состояние
    isPushSubscribed.value = hasSubscription
    
    console.log('checkExistingSubscription - isPushSubscribed:', isPushSubscribed.value)
  } catch (err) {
    console.error('Error checking subscription:', err)
    isPushSubscribed.value = false
  }
}

// Web Push - регистрация
const enablePushNotifications = async () => {
  console.log('enablePushNotifications called')
  
  if (!authStore.isAuthenticated) {
    notificationStore.error('Ошибка', 'Необходимо авторизоваться')
    return
  }
  
  pushLoading.value = true
  
  if (!('serviceWorker' in navigator)) {
    notificationStore.warning('Не поддерживается', 'Service Worker не поддерживается')
    pushLoading.value = false
    return
  }
  
  if (!('PushManager' in window)) {
    notificationStore.warning('Не поддерживается', 'Push Manager не поддерживается')
    isPushSupported.value = false
    pushLoading.value = false
    return
  }
  
  try {
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      console.log('Permission result:', permission)
      
      if (permission !== 'granted') {
        if (permission === 'denied') {
          pushPermissionDenied.value = true
          notificationStore.warning('Разрешение отклонено', 'Включите уведомления в настройках браузера')
        } else {
          notificationStore.warning('Разрешение не получено', 'Не удалось включить Web Push')
        }
        pushLoading.value = false
        return
      }
    }
    
    pushPermissionDenied.value = false
    
    let registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      console.log('Registering Service Worker...')
      registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      console.log('Service Worker registered')
    }
    
    const publicKey = 'BHI-yFDLo4lx0oNdXlMD2PmGi7cZWGYpK5NilsPdOHSUk3ELnqze--Sh1Hj4j690-M1TRivckGbJlVmFvLaN_qM'
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })
    
    console.log('Subscription created:', subscription)
    
    const response = await $fetch(`${API_BASE}/push-subscription`, {
      method: 'POST',
      body: {
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys
      },
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Server response:', response)
    
    if (response.success) {
      isPushSubscribed.value = true
      notificationStore.success('Web Push включены', 'Теперь вы будете получать уведомления в браузере')
      await saveSettings()
    } else {
      notificationStore.error('Ошибка', response.message || 'Не удалось сохранить подписку')
    }
  } catch (err: any) {
    console.error('Push subscription error:', err)
    
    if (err?.message?.includes('permission')) {
      pushPermissionDenied.value = true
      notificationStore.warning('Нет разрешения', 'Проверьте настройки уведомлений в браузере')
    } else {
      notificationStore.error('Ошибка', err.message || 'Не удалось включить Web Push')
    }
  } finally {
    pushLoading.value = false
  }
}

// Отключение Web Push
const disablePushNotifications = async () => {
  console.log('disablePushNotifications called')
  
  if (!authStore.isAuthenticated) {
    notificationStore.error('Ошибка', 'Необходимо авторизоваться')
    return
  }
  
  pushLoading.value = true
  
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    console.log('Current subscription:', subscription ? 'exists' : 'none')
    
    if (subscription) {
      const unsubscribed = await subscription.unsubscribe()
      console.log('Unsubscribed from browser:', unsubscribed)
      
      if (unsubscribed) {
        isPushSubscribed.value = false
        
        try {
          await $fetch('https://wotgospel.ru/api/push-subscription', {
            method: 'DELETE',
            body: { endpoint: subscription.endpoint },
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            }
          })
          console.log('Server unsubscribed')
        } catch (serverErr: any) {
          if (serverErr.status === 401) {
            console.log('Server unsubscribe skipped (not authenticated)')
          } else {
            console.warn('Server unsubscribe error:', serverErr.message)
          }
        }
        
        notificationStore.success('Web Push отключены', 'Уведомления выключены')
        await saveSettings()
      } else {
        notificationStore.warning('Не удалось отключить', 'Попробуйте еще раз')
      }
    } else {
      isPushSubscribed.value = false
      notificationStore.info('Web Push не активны', 'Уведомления уже выключены')
    }
  } catch (err: any) {
    console.error('Unsubscribe error:', err)
    notificationStore.error('Ошибка', err.message || 'Не удалось отключить Web Push')
  } finally {
    pushLoading.value = false
  }
}

const openBrowserSettings = () => {
  notificationStore.info('Настройки браузера', 'Разрешите уведомления для этого сайта в настройках браузера')
}

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const openConsentModal = () => {
  showConsentModal.value = true
}

const closeConsentModal = () => {
  showConsentModal.value = false
  consentChecked.value = false
}

const submitConsent = async () => {
  if (!consentChecked.value) return
  
  if (!authStore.isAuthenticated) {
    notificationStore.error('Ошибка', 'Необходимо авторизоваться')
    return
  }
  
  hasConsent.value = true
  await saveSettings()
  closeConsentModal()
  
  if (isPushSupported.value && !isPushSubscribed.value && !pushPermissionDenied.value) {
    setTimeout(() => {
      enablePushNotifications()
    }, 500)
  }
}

onMounted(async () => {
  // ✅ Проверка авторизации
  if (!authStore.isAuthenticated) {
    console.log('NotificationSettings: user not authenticated, skipping')
    return
  }
  
  // Проверка поддержки браузера
  isPushSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
  
  // Проверка статуса разрешения
  checkPermissionStatus()
  
  // Загрузка настроек с сервера
  await loadSettings()
  
  // Проверка реальной подписки в браузере (это главное!)
  await checkExistingSubscription()
  
  // Слушаем изменение разрешения в браузере
  if (isPushSupported.value) {
    navigator.permissions.query({ name: 'notifications' as PermissionName }).then((permissionStatus) => {
      permissionStatus.onchange = () => {
        console.log('Notification permission changed:', permissionStatus.state)
        checkPermissionStatus()
        checkExistingSubscription()
      }
    })
  }
})
</script>

<style scoped>
.toggle {
  appearance: none;
  width: 36px;
  height: 20px;
  background-color: rgba(255,255,255,0.2);
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.toggle:checked {
  background-color: #3b82f6;
}

.toggle::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle:checked::before {
  transform: translateX(16px);
}

.toggle:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .toggle {
    width: 36px;
    height: 20px;
  }
  .toggle::before {
    width: 16px;
    height: 16px;
  }
  .toggle:checked::before {
    transform: translateX(16px);
  }
}
</style>