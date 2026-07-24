<template>
  <div class="chat-list">
    <!-- Кнопка нового чата -->
    <button
      @click="$emit('new-chat')"
      class="w-full mb-3 p-2 bg-blue-500/20 border border-blue-500/50 text-blue-200 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
    >
      <span class="text-lg">➕</span>
      Новый чат
    </button>
    
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
    </div>

    <div v-else-if="conversations.length === 0" class="text-center py-8 text-white/60">
      <p class="text-2xl mb-2">💬</p>
      <p>Нет чатов</p>
    </div>

    <div
      v-for="conv in conversations"
      :key="conv.id"
      @click="selectConversation(conv.id)"
      class="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition mb-1"
      :class="{
        'bg-white/10': selectedId === conv.id,
        'border-l-4 border-blue-500': conv.unread_count > 0
      }"
    >
      <div class="flex items-center gap-3">
        <img
          :src="conv.other_user?.avatar_url || '/images/default-avatar.png'"
          class="w-10 h-10 rounded-full object-cover flex-shrink-0"
        >
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center">
            <p class="text-white font-semibold truncate">
              {{ conv.other_user?.full_name || 'Групповой чат' }}
            </p>
            <span v-if="conv.last_message_at" class="text-white/40 text-xs flex-shrink-0 ml-2">
              {{ formatTime(conv.last_message_at) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <p class="text-white/60 text-sm truncate">
              {{ conv.last_message?.message || 'Нет сообщений' }}
            </p>
            <span
              v-if="conv.unread_count > 0"
              class="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0 ml-2"
            >
              {{ conv.unread_count > 9 ? '9+' : conv.unread_count }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()
const selectedId = ref<number | null>(null)

const conversations = computed(() => chatStore.conversations)
const loading = computed(() => chatStore.loading)

// ✅ Исправлено: убираем аргумент, так как событие не требует данных
const emit = defineEmits<{
  (e: 'select', conversationId: number): void
  (e: 'new-chat'): void  // ✅ Без аргументов
}>()

const formatTime = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  if (diff < 60000) return 'Только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`
  if (diff < 86400000) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()]
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const selectConversation = (id: number) => {
  selectedId.value = id
  emit('select', id)
}

onMounted(() => {
  chatStore.loadConversations()
})
</script>