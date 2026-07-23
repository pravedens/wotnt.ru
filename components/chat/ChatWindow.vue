<template>
  <div class="flex flex-col h-full">
    <!-- Заголовок -->
    <div v-if="conversation" class="flex items-center gap-3 p-3 border-b border-white/10 flex-shrink-0">
      <img
        :src="conversation.other_user?.avatar_url || '/images/default-avatar.png'"
        class="w-8 h-8 rounded-full object-cover"
      >
      <div>
        <p class="text-white font-semibold">{{ conversation.other_user?.full_name || 'Чат' }}</p>
        <p v-if="isOnline" class="text-green-400 text-xs">● Онлайн</p>
      </div>
    </div>

    <!-- Сообщения -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
      <div v-if="loadingMessages" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex"
        :class="msg.is_mine ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[70%] rounded-lg p-3"
          :class="msg.is_mine ? 'bg-blue-500 text-white' : 'bg-white/10 text-white'"
        >
          <div v-if="!msg.is_mine" class="text-xs text-white/60 mb-1">
            {{ msg.sender_name }}
          </div>
          <p class="text-sm break-words">{{ msg.message }}</p>
          <p class="text-xs opacity-50 mt-1">{{ formatTime(msg.created_at) }}</p>
        </div>
      </div>

      <!-- Индикатор "печатает" -->
      <div v-if="typingUser" class="text-white/60 text-sm p-2">
        {{ typingUser.name }} печатает...
      </div>

      <div v-if="!loadingMessages && messages.length === 0" class="text-center py-8 text-white/60">
        <p class="text-2xl mb-2">💬</p>
        <p>Нет сообщений</p>
      </div>
    </div>

    <!-- Поле ввода -->
    <div class="border-t border-white/20 p-4 flex-shrink-0">
      <form @submit.prevent="sendMessage" class="flex gap-3">
        <textarea
          v-model="newMessage"
          rows="2"
          placeholder="Введите сообщение..."
          class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 resize-none"
          @input="onMessageInput"
          @keydown.ctrl.enter="sendMessage"
        ></textarea>
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
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
import { useNotificationStore } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'  // ✅ ДОБАВЛЕН ИМПОРТ

const props = defineProps<{
  conversationId: number
}>()

const chatStore = useChatStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const { $api } = useApi()  // ✅ ДОБАВЛЕНО

const messagesContainer = ref<HTMLElement | null>(null)
const newMessage = ref('')
const sending = ref(false)
const loadingMessages = ref(false)
const isOnline = ref(false)
const typingUser = ref<{ id: number; name: string } | null>(null)

let typingStopTimer: NodeJS.Timeout | null = null
let typingClearTimer: NodeJS.Timeout | null = null
let typingStartedSent = false
let echoSubscription: any = null
let presenceSubscription: any = null

const conversation = computed(() => chatStore.currentConversation)

const messages = computed(() => {
  const myUserId = Number(authStore.user?.id)
  
  return chatStore.currentMessages.map((msg: any) => ({
    ...msg,
    is_mine: Number(msg.sender_id) === myUserId,
  }))
})

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 50)
}

// ============================================
// ОТПРАВКА СООБЩЕНИЯ
// ============================================
const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value || !props.conversationId) return

  await sendTypingStopped()

  sending.value = true
  try {
    const receiverId = conversation.value?.other_user?.id
    if (!receiverId) {
      notificationStore.error('Ошибка', 'Не найден получатель')
      return
    }

    await chatStore.sendMessage(receiverId, newMessage.value.trim())
    newMessage.value = ''
    typingStartedSent = false
    scrollToBottom()
  } catch (error) {
    notificationStore.error('Ошибка', 'Не удалось отправить сообщение')
  } finally {
    sending.value = false
  }
}

// ============================================
// ТИПИНГ (печатает)
// ============================================
const sendTypingStarted = async () => {
  if (!props.conversationId || !authStore.isAuthenticated) return

  try {
    // ✅ Используем $api вместо $fetch
    await $api(`/bible-school/chat/conversations/${props.conversationId}/typing/start`, {
      method: 'POST'
    })
  } catch (error) {
    // Ошибка типинга не критична
  }
}

const sendTypingStopped = async () => {
  if (!props.conversationId || !authStore.isAuthenticated || !typingStartedSent) return

  typingStartedSent = false

  if (typingStopTimer) {
    clearTimeout(typingStopTimer)
    typingStopTimer = null
  }

  try {
    // ✅ Используем $api вместо $fetch
    await $api(`/bible-school/chat/conversations/${props.conversationId}/typing/stop`, {
      method: 'POST'
    })
  } catch (error) {
    // Ошибка типинга не критична
  }
}

const onMessageInput = () => {
  const text = newMessage.value.trim()

  if (!props.conversationId) return

  if (!text) {
    sendTypingStopped()
    return
  }

  if (!typingStartedSent) {
    sendTypingStarted()
    typingStartedSent = true
  }

  if (typingStopTimer) {
    clearTimeout(typingStopTimer)
  }

  typingStopTimer = setTimeout(() => {
    sendTypingStopped()
  }, 3000)
}

// ============================================
// ОБРАБОТЧИКИ ТИПИНГА
// ============================================
const handleTypingStarted = (event: any) => {
  const myUserId = Number(authStore.user?.id)
  const eventUserId = Number(event.user_id ?? event.userId ?? event.user?.id)
  const eventConversationId = Number(event.conversation_id ?? event.conversationId)
  const currentConversationId = Number(props.conversationId)

  if (eventUserId === myUserId) return
  if (eventConversationId !== currentConversationId) return

  typingUser.value = {
    id: eventUserId,
    name: event.user_name ?? event.userName ?? event.name ?? 'Собеседник',
  }

  scrollToBottom()

  if (typingClearTimer) {
    clearTimeout(typingClearTimer)
  }

  typingClearTimer = setTimeout(() => {
    if (typingUser.value?.id === eventUserId) {
      typingUser.value = null
    }
  }, 4000)
}

const handleTypingStopped = (event: any) => {
  const myUserId = Number(authStore.user?.id)
  const eventUserId = Number(event.user_id ?? event.userId ?? event.user?.id)
  const eventConversationId = Number(event.conversation_id ?? event.conversationId)
  const currentConversationId = Number(props.conversationId)

  if (eventUserId === myUserId) return
  if (eventConversationId !== currentConversationId) return

  if (typingUser.value?.id === eventUserId) {
    typingUser.value = null
  }

  if (typingClearTimer) {
    clearTimeout(typingClearTimer)
    typingClearTimer = null
  }
}

// ============================================
// ECHO ПОДПИСКА
// ============================================
const setupEcho = () => {
  const { $echo } = useNuxtApp()
  if (!$echo || !props.conversationId) return

  const channel = `conversation.${props.conversationId}`

  if (echoSubscription) {
    $echo.leave(channel)
    echoSubscription = null
  }
  if (presenceSubscription) {
    $echo.leave(channel)
    presenceSubscription = null
  }

  echoSubscription = $echo.private(channel)
    .subscribed(() => {
      // Подписка успешна
    })
    .listen('.chat.message.sent', (message: any) => {
      const myUserId = Number(authStore.user?.id)
      
      const normalizedMessage = {
        ...message,
        is_mine: Number(message.sender_id) === myUserId,
      }

      if (Number(message.sender_id) !== myUserId) {
        typingUser.value = null
      }

      chatStore.addNewMessage(normalizedMessage)
      scrollToBottom()
    })
    .listen('.chat.typing.started', (event: any) => {
      handleTypingStarted(event)
    })
    .listen('.chat.typing.stopped', (event: any) => {
      handleTypingStopped(event)
    })
    .error((err: any) => {
      // Ошибка подписки
    })

  presenceSubscription = $echo.join(channel)
    .here((users: any[]) => {
      isOnline.value = users.some((user: any) => {
        return Number(user.id) !== Number(authStore.user?.id)
      })
    })
    .joining((user: any) => {
      if (Number(user.id) !== Number(authStore.user?.id)) {
        isOnline.value = true
      }
    })
    .leaving((user: any) => {
      if (Number(user.id) !== Number(authStore.user?.id)) {
        isOnline.value = false
      }
    })
    .error((err: any) => {
      // Ошибка presence подписки
    })
}

// ============================================
// ЖИЗНЕННЫЙ ЦИКЛ
// ============================================
onMounted(async () => {
  if (!props.conversationId) return

  loadingMessages.value = true
  await chatStore.loadMessages(props.conversationId)
  await chatStore.markConversationAsRead(props.conversationId)
  loadingMessages.value = false

  setupEcho()
  scrollToBottom()
})

watch(() => props.conversationId, async (newId, oldId) => {
  if (!newId) return

  const { $echo } = useNuxtApp()

  if ($echo && oldId) {
    $echo.leave(`conversation.${oldId}`)
    echoSubscription = null
    presenceSubscription = null
  }

  typingUser.value = null
  typingStartedSent = false
  if (typingStopTimer) {
    clearTimeout(typingStopTimer)
    typingStopTimer = null
  }
  if (typingClearTimer) {
    clearTimeout(typingClearTimer)
    typingClearTimer = null
  }

  loadingMessages.value = true
  await chatStore.loadMessages(newId)
  await chatStore.markConversationAsRead(newId)
  loadingMessages.value = false

  setupEcho()
  scrollToBottom()
})

onUnmounted(() => {
  const { $echo } = useNuxtApp()

  if ($echo && props.conversationId) {
    $echo.leave(`conversation.${props.conversationId}`)
  }

  if (typingStopTimer) {
    clearTimeout(typingStopTimer)
  }
  if (typingClearTimer) {
    clearTimeout(typingClearTimer)
  }
})
</script>