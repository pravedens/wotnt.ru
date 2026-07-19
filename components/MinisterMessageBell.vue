<template>
  <div class="relative" v-if="isMinister">
    <button @click="openMessages" class="relative p-2 text-white/80 hover:text-white transition">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
      <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>
    
    <div v-if="showDropdown" class="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50">
      <div class="p-3 border-b border-gray-700">
        <h4 class="text-white font-semibold">Сообщения</h4>
      </div>
      <div v-if="recentMessages.length === 0" class="p-4 text-center text-white/40">
        Нет новых сообщений
      </div>
      <div v-else class="max-h-96 overflow-y-auto">
        <div v-for="msg in recentMessages" :key="msg.id" class="p-3 hover:bg-white/5 cursor-pointer border-b border-gray-700" @click="goToMessages">
          <div class="flex justify-between">
            <span class="text-white font-medium">{{ msg.sender_name }}</span>
            <span class="text-white/40 text-xs">{{ formatTime(msg.created_at) }}</span>
          </div>
          <p class="text-white/60 text-sm truncate">{{ msg.message }}</p>
        </div>
      </div>
      <div class="p-2 border-t border-gray-700">
        <button @click="goToMessages" class="w-full text-center text-blue-400 text-sm py-1 hover:text-blue-300">
          Все сообщения →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

const authStore = useAuthStore()
const { $api } = useApi()

const isMinister = computed(() => authStore.isMinister)
const unreadCount = ref(0)
const recentMessages = ref<any[]>([])
const showDropdown = ref(false)
let intervalId: NodeJS.Timeout | null = null

const formatTime = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч`
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const loadUnreadCount = async () => {
  if (!authStore.isAuthenticated) return
  
  try {
    const response = await $api('/my-messages/unread-count')
    unreadCount.value = response.count || 0
  } catch (error) {
    // Ошибка не критична
  }
}

const loadRecentMessages = async () => {
  if (!authStore.isAuthenticated) return
  
  try {
    const response = await $api('/my-messages?page=1')
    recentMessages.value = response.messages?.data?.slice(0, 5) || []
  } catch (error) {
    // Ошибка не критична
  }
}

const openMessages = () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    loadRecentMessages()
  }
}

const goToMessages = () => {
  showDropdown.value = false
  navigateTo('/dashboard?tab=messages')
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    loadUnreadCount()
    intervalId = setInterval(() => {
      if (authStore.isAuthenticated) loadUnreadCount()
    }, 30000)
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>