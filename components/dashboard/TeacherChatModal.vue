<template>
  <div v-if="visible" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-white/20">
      <div class="flex justify-between items-center p-4 border-b border-white/20 flex-shrink-0">
        <h3 class="text-xl font-bold text-white">
          <span v-if="selectedConversationId">💬 Чат с {{ selectedStudent?.full_name }}</span>
          <span v-else>💬 Чаты с учениками</span>
        </h3>
        <button @click="closeModal" class="text-white/60 hover:text-white text-2xl">&times;</button>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Список чатов -->
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

        <!-- Окно чата -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- Если есть выбранная беседа -->
          <ChatWindow
            v-if="selectedConversationId"
            :conversation-id="selectedConversationId"
          />

          <!-- Если выбран ученик, но беседы ещё нет -->
          <div v-else-if="selectedStudent" class="flex-1 flex flex-col">
            <div class="flex items-center gap-3 p-3 border-b border-white/10 flex-shrink-0">
              <img
                :src="selectedStudent.avatar_url || '/images/default-avatar.png'"
                class="w-8 h-8 rounded-full object-cover"
              >
              <span class="text-white font-semibold">{{ selectedStudent.full_name }}</span>
            </div>
            <div class="flex-1 flex items-center justify-center text-white/40">
              <div class="text-center">
                <p class="text-2xl mb-3">💬</p>
                <p>Напишите первое сообщение</p>
                <p class="text-xs mt-1">Беседа создастся автоматически</p>
              </div>
            </div>
            <div class="border-t border-white/20 p-4 flex-shrink-0">
              <form @submit.prevent="sendFirstMessage" class="flex gap-3">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Напишите сообщение..."
                  class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                >
                <button
                  type="submit"
                  :disabled="!newMessage.trim() || sending"
                  class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {{ sending ? '...' : 'Отправить' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Ничего не выбрано -->
          <div v-else class="flex-1 flex items-center justify-center text-white/40">
            <div class="text-center">
              <p class="text-4xl mb-3">💬</p>
              <p>Выберите ученика для чата</p>
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
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'  // ✅ ДОБАВЛЕН ИМПОРТ
import ChatList from '~/components/chat/ChatList.vue'
import ChatWindow from '~/components/chat/ChatWindow.vue'

const props = defineProps<{
  visible: boolean
  student?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const chatStore = useChatStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const { $api } = useApi()  // ✅ ДОБАВЛЕНО

const selectedConversationId = ref<number | null>(null)
const selectedStudent = ref<any | null>(null)
const newMessage = ref('')
const sending = ref(false)
const showNewChatModal = ref(false)

const openNewChat = () => {
  showNewChatModal.value = true
}

const startNewConversation = async (userId: number) => {
  try {
    const response = await $api('/bible-school/chat/conversations/find-or-create', {
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
    notificationStore.error('Ошибка', 'Не удалось создать чат')
  }
}

const selectConversation = (id: number) => {
  selectedConversationId.value = id
  selectedStudent.value = null
}

// ============================================
// ВЫБОР УЧЕНИКА И СОЗДАНИЕ БЕСЕДЫ
// ============================================
const selectStudent = async (student: any) => {
  if (!student) return

  selectedStudent.value = student
  
  // Проверяем, есть ли уже беседа с этим учеником
  const existingConversation = chatStore.conversations.find(
    c => c.other_user?.id === student.id
  )
  
  if (existingConversation) {
    selectedConversationId.value = existingConversation.id
    selectedStudent.value = null
    await chatStore.loadMessages(existingConversation.id)
  }
}

// ============================================
// ОТПРАВКА ПЕРВОГО СООБЩЕНИЯ
// ============================================
const sendFirstMessage = async () => {
  if (!newMessage.value.trim() || sending.value || !selectedStudent.value) return

  sending.value = true
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api('/bible-school/chat/send', {
      method: 'POST',
      body: {
        receiver_id: selectedStudent.value.id,
        message: newMessage.value.trim()
      }
    })

    if (response.success) {
      notificationStore.success('Сообщение отправлено', 'Беседа создана')
      newMessage.value = ''
      
      // Обновить список бесед
      await chatStore.loadConversations()
      
      // Найти созданную беседу
      const conversation = chatStore.conversations.find(
        c => c.other_user?.id === selectedStudent.value.id
      )
      
      if (conversation) {
        selectedConversationId.value = conversation.id
        const studentName = selectedStudent.value.full_name
        selectedStudent.value = null
        await chatStore.loadMessages(conversation.id)
        notificationStore.success('Чат открыт', `Чат с ${studentName}`)
      }
    }
  } catch (error) {
    console.error('Error sending message:', error)
    notificationStore.error('Ошибка', 'Не удалось отправить сообщение')
  } finally {
    sending.value = false
  }
}

const closeModal = () => {
  selectedConversationId.value = null
  selectedStudent.value = null
  newMessage.value = ''
  emit('close')
}

// ============================================
// СЛУШАЕМ ВЫБОР УЧЕНИКА ИЗ TeacherPanel
// ============================================
watch(() => props.student, (newStudent) => {
  if (newStudent) {
    selectStudent(newStudent)
  }
}, { immediate: true })

watch(() => props.visible, (val) => {
  if (!val) {
    selectedConversationId.value = null
    selectedStudent.value = null
  }
})

// ============================================
// ЗАГРУЗКА БЕСЕД ПРИ ОТКРЫТИИ
// ============================================
watch(() => props.visible, async (val) => {
  if (val) {
    await chatStore.loadConversations()
  }
}, { immediate: true })
</script>