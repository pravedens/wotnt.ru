<template>
  <div v-if="visible" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-white/20">
      <div class="flex justify-between items-center p-4 border-b border-white/20 flex-shrink-0">
        <h3 class="text-xl font-bold text-white">
          <span v-if="selectedConversationId">💬 Чат</span>
          <span v-else>💬 Чаты с учителями</span>
        </h3>
        <button @click="closeModal" class="text-white/60 hover:text-white text-2xl">&times;</button>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <div
          v-show="!selectedConversationId"
          class="w-full md:w-1/3 border-r border-white/10 overflow-y-auto p-2 flex-shrink-0"
        >
          <ChatList @select="selectConversation" @new-chat="openNewChat"/>
          <NewChatModal
            v-if="showNewChatModal"
            :visible="showNewChatModal"
            @close="showNewChatModal = false"
            @select="startNewConversation"
          />
        </div>

        <div class="flex-1 flex flex-col min-w-0">
          <ChatWindow
            v-if="selectedConversationId"
            :conversation-id="selectedConversationId"
          />
          <div v-else class="flex-1 flex items-center justify-center text-white/40">
            <div class="text-center">
              <p class="text-4xl mb-3">💬</p>
              <p>Выберите учителя для чата</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
import { useNotificationStore } from '~/stores/notification'
import { useApi } from '~/composables/useApi'
import ChatList from '~/components/chat/ChatList.vue'
import ChatWindow from '~/components/chat/ChatWindow.vue'
import NewChatModal from '~/components/chat/NewChatModal.vue'

// ✅ Добавляем интерфейсы
interface FindOrCreateResponse {
  success: boolean
  data: {
    conversation_id: number
  }
  message?: string
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { $api } = useApi()
const chatStore = useChatStore()
const notificationStore = useNotificationStore()

const selectedConversationId = ref<number | null>(null)
const showNewChatModal = ref(false)

const openNewChat = () => {
  showNewChatModal.value = true
}

const startNewConversation = async (userId: number) => {
  try {
    // ✅ Типизируем ответ
    const response = await $api<FindOrCreateResponse>('/bible-school/chat/conversations/find-or-create', {
      method: 'POST',
      body: { user_id: userId }
    })
    
    if (response.success) {
      const conversationId = response.data.conversation_id
      await chatStore.loadConversations()
      selectConversation(conversationId)
      notificationStore.success('Чат создан', 'Беседа начата')
    }
  } catch (error) {
    console.error('Start conversation error:', error)
    notificationStore.error('Ошибка', 'Не удалось создать чат')
  }
}

const selectConversation = (id: number) => {
  selectedConversationId.value = id
}

const closeModal = () => {
  selectedConversationId.value = null
  emit('close')
}

watch(() => props.visible, (val) => {
  if (!val) {
    selectedConversationId.value = null
  }
})
</script>