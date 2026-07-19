<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-bold text-white">📬 Сообщения от прихожан</h3>
      <div class="flex gap-2">
        <span v-if="unreadCount > 0" class="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
          {{ unreadCount }} новых
        </span>
        <button @click="refreshMessages" class="text-white/60 hover:text-white transition">
          🔄
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
    </div>
    
    <div v-else-if="messages.length === 0" class="text-center text-white/60 py-8">
      Нет сообщений от прихожан
    </div>
    
    <div v-else class="space-y-3">
      <div 
        v-for="msg in messages" 
        :key="msg.id"
        class="bg-white/5 rounded-lg p-4 border transition"
        :class="msg.is_read ? 'border-white/10' : 'border-blue-500/50 bg-blue-500/5'"
      >
        <div class="flex flex-wrap justify-between items-start gap-2 mb-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-white">{{ msg.sender_name }}</span>
              <span class="text-white/40 text-sm">{{ msg.sender_email }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-white/40 text-xs">{{ formatDate(msg.created_at) }}</span>
            
            <!-- Кнопка удаления -->
            <button 
              @click.stop="deleteMessage(msg.id)"
              class="text-red-400 hover:text-red-300 transition"
              title="Удалить сообщение"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div 
          class="cursor-pointer"
          @click="toggleMessage(msg.id)"
        >
          <p class="text-white/80 text-sm whitespace-pre-wrap" :class="{ 'line-clamp-2': !expandedMessages[msg.id] }">
            {{ msg.message }}
          </p>
        </div>
        
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
          <button 
            @click.stop="toggleExpand(msg.id)"
            class="text-white/40 hover:text-white text-xs"
          >
            {{ expandedMessages[msg.id] ? 'Свернуть' : 'Развернуть' }}
          </button>
          
          <a 
            :href="`mailto:${msg.sender_email}`"
            target="_blank"
            class="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            @click.stop
          >
            📧 Ответить
          </a>
        </div>
      </div>
    </div>
    
    <!-- Пагинация -->
    <div v-if="pagination && pagination.last_page > 1" class="flex justify-center gap-2 mt-4">
      <button 
        v-for="page in pagination.last_page" 
        :key="page"
        @click="goToPage(page)"
        class="px-3 py-1 rounded-lg transition"
        :class="pagination.current_page === page ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const { $api } = useApi()

const messages = ref<any[]>([])
const unreadCount = ref(0)
const loading = ref(true)
const expandedMessages = ref<Record<number, boolean>>({})
const pagination = ref<any>(null)
const emit = defineEmits(['unread-count-update'])
let intervalId: NodeJS.Timeout | null = null

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  })
}

const loadMessages = async (page = 1) => {
  loading.value = true
  try {
    const response = await $api(`/my-messages?page=${page}`)
    messages.value = response.messages?.data || []
    pagination.value = response.messages
    await loadUnreadCount()
    emit('unread-count-update', unreadCount.value)
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    loading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const response = await $api('/my-messages/unread-count')
    unreadCount.value = response.count || 0
    emit('unread-count-update', unreadCount.value)
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

const markAsRead = async (messageId: number) => {
  try {
    await $api(`/my-messages/${messageId}/read`, {
      method: 'PUT'
    })
    await loadUnreadCount()
    await loadMessages(pagination.value?.current_page || 1)
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}

const deleteMessage = async (messageId: number) => {
  if (!confirm('Вы уверены, что хотите удалить это сообщение?')) return
  
  try {
    await $api(`/my-messages/${messageId}`, {
      method: 'DELETE'
    })
    notificationStore.success('Успешно', 'Сообщение удалено')
    await loadMessages(pagination.value?.current_page || 1)
  } catch (error: any) {
    notificationStore.error('Ошибка', error?.data?.message || 'Не удалось удалить сообщение')
  }
}

const toggleMessage = (messageId: number) => {
  const msg = messages.value.find(m => m.id === messageId)
  if (msg && !msg.is_read) {
    msg.is_read = true
    markAsRead(messageId)
  }
  toggleExpand(messageId)
}

const toggleExpand = (messageId: number) => {
  expandedMessages.value[messageId] = !expandedMessages.value[messageId]
}

const refreshMessages = () => {
  loadMessages(pagination.value?.current_page || 1)
}

const goToPage = (page: number) => {
  loadMessages(page)
}

onMounted(() => {
  loadMessages()
  loadUnreadCount()
  emit('unread-count-update', unreadCount.value)
  
  intervalId = setInterval(() => {
    loadUnreadCount()
  }, 30000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})
</script>