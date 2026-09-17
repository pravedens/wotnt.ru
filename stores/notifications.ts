// stores/notifications.ts
import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    unreadMessagesCount: 0,
    lastFetchedAt: null as number | null,
  }),

  getters: {
    hasUnreadMessages: (state) => state.unreadMessagesCount > 0,
  },

  actions: {
    async fetchUnreadCount() {
      const { $api } = useApi()
      try {
        const response = await $api<{ count: number }>('/my-messages/unread-count')
        this.unreadMessagesCount = response.count || 0
        this.lastFetchedAt = Date.now()
      } catch {
        // Тихо игнорируем
      }
    },

    reset() {
      this.unreadMessagesCount = 0
      this.lastFetchedAt = null
    },
  },
})