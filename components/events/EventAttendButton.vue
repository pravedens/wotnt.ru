<template>
  <div>
    <button
      v-if="!loading"
      @click="handleClick"
      :disabled="isPastEvent || !canAttend"
      :class="[
        'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200',
        isAttending
          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30'
          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg',
        (isPastEvent || !canAttend) && 'opacity-50 cursor-not-allowed'
      ]"
    >
      <svg 
        v-if="isAttending"
        class="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg 
        v-else
        class="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>
        {{ buttonText }}
      </span>
    </button>
    
    <button
      v-else
      disabled
      class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white/10 text-white/50 cursor-wait"
    >
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      <span>Загрузка...</span>
    </button>
    
    <!-- Количество участников -->
    <div v-if="attendeesCount > 0" class="mt-3 text-sm text-white/60 flex items-center gap-2 justify-center">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span>{{ attendeesCount }} {{ getDeclension(attendeesCount) }}</span>
    </div>
    
    <!-- Сообщение об авторизации -->
    <div v-if="!isAuthenticated" class="mt-3 text-sm text-yellow-300/80">
      <NuxtLink to="/auth/login" class="underline hover:text-yellow-200">
        Войдите
      </NuxtLink>
      , чтобы записаться на событие
    </div>
    
    <!-- Сообщение о доступе -->
    <div v-else-if="!canAttend && !isPastEvent" class="mt-3 text-sm text-yellow-300/80">
      {{ accessMessage }}
    </div>
    
    <!-- Уведомление -->
    <div 
      v-if="notification.show" 
      :class="[
        'fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all',
        notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      ]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useEvents } from '~/composables/useEvents'

const props = defineProps<{
  eventId: number
  eventSlug: string
  initialAttending?: boolean
  initialCount?: number
  isPastEvent?: boolean
  membersOnly?: boolean
  ministersOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', attending: boolean, count: number): void
}>()

const authStore = useAuthStore()
const { attendEvent, unattendEvent } = useEvents()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isMember = computed(() => authStore.userRoles.includes('member'))
const isMinister = computed(() => authStore.userRoles.includes('minister'))
const isAdmin = computed(() => authStore.isAdmin)

const isAttending = ref(props.initialAttending || false)
const attendeesCount = ref(props.initialCount || 0)
const loading = ref(false)
const notification = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

// Проверка, может ли пользователь записаться
const canAttend = computed(() => {
  if (isAdmin.value) return true
  if (props.membersOnly && !isMember.value) return false
  if (props.ministersOnly && !isMinister.value) return false
  return true
})

const accessMessage = computed(() => {
  if (props.membersOnly) return 'Это событие только для прихожан'
  if (props.ministersOnly) return 'Это событие только для служителей'
  return ''
})

const buttonText = computed(() => {
  if (isAttending.value) return '✅ Я иду!'
  return '👤 Я приду'
})

const showNotification = (message: string, type: 'success' | 'error') => {
  notification.message = message
  notification.type = type
  notification.show = true
  setTimeout(() => {
    notification.show = false
  }, 3000)
}

const getDeclension = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return 'человек идёт'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'человека идут'
  return 'человек идут'
}

const handleClick = async () => {
  if (!isAuthenticated.value) {
    showNotification('Необходимо авторизоваться', 'error')
    return
  }
  
  if (!canAttend.value) {
    showNotification(accessMessage.value, 'error')
    return
  }
  
  if (props.isPastEvent) {
    showNotification('Нельзя записаться на прошедшее событие', 'error')
    return
  }
  
  loading.value = true
  
  try {
    let result
    if (isAttending.value) {
      result = await unattendEvent(props.eventSlug)
    } else {
      result = await attendEvent(props.eventSlug)
    }
    
    if (result.success) {
      isAttending.value = result.attending
      attendeesCount.value = result.count
      emit('update', result.attending, result.count)
      showNotification(result.message || (result.attending ? 'Вы записаны!' : 'Запись отменена'), 'success')
    } else {
      showNotification(result.message || 'Ошибка', 'error')
    }
  } catch (err: any) {
    showNotification(err?.message || 'Ошибка при выполнении запроса', 'error')
  } finally {
    loading.value = false
  }
}
</script>