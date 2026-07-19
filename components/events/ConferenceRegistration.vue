<template>
  <div v-if="event.is_conference">
    <!-- Кнопка регистрации для авторизованных пользователей -->
    <div v-if="!isRegistered" class="mb-6">
      <button
        v-if="authStore.isAuthenticated"
        @click="openModal"
        :disabled="loading"
        class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition disabled:opacity-50 text-lg font-semibold"
      >
        <span v-if="loading">Загрузка...</span>
        <span v-else>📝 Зарегистрироваться на конференцию</span>
      </button>
      
      <div v-else class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-center">
        <p class="text-yellow-200 mb-2">Для регистрации на конференцию необходимо войти в аккаунт</p>
        <NuxtLink to="/auth/login" class="inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
          Войти
        </NuxtLink>
      </div>
    </div>
    
    <div v-else class="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-2 text-green-200">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Вы зарегистрированы! Статус: {{ getStatusText(registrationStatus) }}</span>
      </div>
    </div>
    
    <Teleport to="body">
      <div v-if="modalVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="modalVisible = false">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden border border-white/20">
          <div class="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
            <h3 class="text-xl font-bold text-white mb-2">Регистрация на конференцию</h3>
            <p class="text-white/60 text-sm mb-6">{{ event.title }}</p>
            
            <div class="text-white/80 mb-4">
              <p class="mb-2">Выберите служения, на которых будете присутствовать:</p>
            </div>
            
            <div class="space-y-3 mb-6">
              <label
                v-for="service in event.conference_services"
                :key="service.id"
                class="flex items-start gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition"
              >
                <input
                  type="checkbox"
                  :value="service.id"
                  v-model="selectedServiceIds"
                  class="w-5 h-5 mt-0.5 flex-shrink-0"
                />
                <div class="flex-1">
                  <div class="font-medium text-white">{{ service.title }}</div>
                  <div class="text-white/60 text-sm">
                    {{ formatDateOnly(service.service_date) }}
                    <span v-if="service.start_time"> в {{ formatTimeOnly(service.start_time) }}</span>
                  </div>
                  <div v-if="service.description" class="text-white/40 text-xs mt-1">{{ service.description }}</div>
                  <div class="text-white/40 text-xs mt-1">
                    🪑 Мест: {{ service.available_count }} из {{ service.capacity || '∞' }}
                  </div>
                </div>
              </label>
            </div>
            
            <div class="bg-white/5 rounded-lg p-3 mb-6">
              <div class="flex justify-between text-white">
                <span>Выбрано служений:</span>
                <span class="font-bold">{{ selectedServiceIds.length }}</span>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button @click="modalVisible = false" class="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition">Отмена</button>
              <button @click="submitRegistration" :disabled="selectedServiceIds.length === 0 || submitting" class="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition disabled:opacity-50">
                {{ submitting ? 'Отправка...' : 'Отправить заявку' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'

const props = defineProps<{
  event: {
    id: number
    title: string
    is_conference?: boolean
    conference_services?: Array<{
      id: number
      service_date: string
      title: string
      description: string | null
      start_time?: string | null
      capacity: number
      available_count: number
    }>
  }
}>()

const emit = defineEmits(['registered'])

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const submitting = ref(false)
const modalVisible = ref(false)
const selectedServiceIds = ref<number[]>([])
const isRegistered = ref(false)
const registrationStatus = ref('')

// Форматирование только даты
const formatDateOnly = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

// Форматирование только времени
const formatTimeOnly = (timeStr: string) => {
  if (!timeStr) return ''
  return timeStr.substring(0, 5) // "11:00:00" → "11:00"
}

const getStatusText = (status: string) => {
  const statuses: Record<string, string> = {
    pending: 'ожидает подтверждения',
    confirmed: 'подтверждена',
    cancelled: 'отменена',
    waiting: 'в листе ожидания'
  }
  return statuses[status] || status
}

const checkRegistration = async () => {
  if (!authStore.isAuthenticated) return
  
  try {
    const data = await $fetch(`/api/events/${props.event.id}/my-registration`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (data.registered) {
      isRegistered.value = true
      registrationStatus.value = data.registration.status
    }
  } catch (err) {
    console.error('Check registration error:', err)
  }
}

const openModal = () => {
  if (!authStore.isEmailVerified) {
    notificationStore.warning('Подтвердите email', 'Для регистрации необходимо подтвердить email')
    return
  }
  
  selectedServiceIds.value = []
  modalVisible.value = true
}

const submitRegistration = async () => {
  if (selectedServiceIds.value.length === 0) {
    notificationStore.warning('Выберите служения', 'Отметьте хотя бы одно служение')
    return
  }
  
  submitting.value = true
  
  try {
    const data = await $fetch(`/api/events/${props.event.id}/register`, {
      method: 'POST',
      body: { selected_service_ids: selectedServiceIds.value },
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data.success) {
      modalVisible.value = false
      isRegistered.value = true
      registrationStatus.value = 'pending'
      emit('registered')
      notificationStore.success('Заявка отправлена', data.message)
    }
  } catch (err: any) {
    notificationStore.error('Ошибка', err.data?.message || 'Не удалось отправить заявку')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  checkRegistration()
})
</script>