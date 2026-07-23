import { defineStore } from 'pinia'
import type { Conversation, Message } from '~/types/chat'

// ✅ Добавляем интерфейсы для ответов API
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

interface ConversationsResponse extends ApiResponse<Conversation[]> {}
interface MessagesResponse extends ApiResponse<Message[]> {}
interface SendMessageResponse extends ApiResponse<Message> {}

export const useChatStore = defineStore('chat', {
    state: () => ({
        conversations: [] as Conversation[],
        messages: {} as Record<number, Message[]>,
        currentConversationId: null as number | null,
        loading: false,
        initialized: false,
    }),

    getters: {
        currentMessages: (state) => {
            if (!state.currentConversationId) return []
            return state.messages[state.currentConversationId] || []
        },
        currentConversation: (state) => {
            if (!state.currentConversationId) return null
            return state.conversations.find(c => c.id === state.currentConversationId) || null
        },
        totalUnreadCount: (state) => {
            return state.conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
        }
    },

    actions: {
        async loadConversations() {
            if (this.loading) return
            this.loading = true
            try {
                const { $api } = useApi()
                // ✅ Типизируем ответ
                const response = await $api<ConversationsResponse>('/bible-school/chat/conversations')
                if (response.success) {
                    this.conversations = response.data || []
                }
            } catch (error) {
                console.error('Load conversations error:', error)
            } finally {
                this.loading = false
                this.initialized = true
            }
        },

        async loadMessages(conversationId: number, limit = 50) {
            try {
                const { $api } = useApi()
                // ✅ Типизируем ответ
                const response = await $api<MessagesResponse>(`/bible-school/chat/conversations/${conversationId}/messages?limit=${limit}`)
                if (response.success) {
                    this.messages[conversationId] = response.data || []
                    this.currentConversationId = conversationId
                }
            } catch (error) {
                console.error('Load messages error:', error)
            }
        },

        async sendMessage(receiverId: number, message: string): Promise<Message | null> {
            try {
                const { $api } = useApi()
                // ✅ Типизируем ответ
                const response = await $api<SendMessageResponse>('/bible-school/chat/send', {
                    method: 'POST',
                    body: { receiver_id: receiverId, message }
                })
                if (response.success && response.data) {
                    return response.data
                }
                return null
            } catch (error) {
                console.error('Send message error:', error)
                throw error
            }
        },

        async markConversationAsRead(conversationId: number) {
            try {
                const { $api } = useApi()
                // ✅ Типизируем ответ (можно использовать ApiResponse)
                await $api<ApiResponse>(`/bible-school/chat/conversations/${conversationId}/read`, { method: 'PUT' })
                const conversation = this.conversations.find(c => c.id === conversationId)
                if (conversation) {
                    conversation.unread_count = 0
                }
                if (this.messages[conversationId]) {
                    this.messages[conversationId] = this.messages[conversationId].map(m => ({
                        ...m,
                        is_read: true
                    }))
                }
            } catch (error) {
                console.error('Mark as read error:', error)
            }
        },

        addNewMessage(message: Message) {
            const conversationId = message.conversation_id

            if (this.messages[conversationId]?.some(m => m.id === message.id)) {
                return
            }

            if (!this.messages[conversationId]) {
                this.messages[conversationId] = []
            }
            this.messages[conversationId].push(message)

            const conversation = this.conversations.find(c => c.id === conversationId)
            if (conversation) {
                conversation.last_message = message
                conversation.last_message_at = message.created_at
                if (conversationId !== this.currentConversationId) {
                    conversation.unread_count = (conversation.unread_count || 0) + 1
                }
            }
        },

        reset() {
            this.conversations = []
            this.messages = {}
            this.currentConversationId = null
            this.loading = false
            this.initialized = false
        }
    }
})