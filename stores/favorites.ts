import { defineStore } from 'pinia'
import type { Post } from '~/types/sermon'
import { useApi } from '~/composables/useApi'  // ✅ ДОБАВЛЕН ИМПОРТ

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: [] as Post[],
    loading: false,
    error: null as string | null,
    favoriteIds: new Set<number>() // Для быстрой проверки
  }),

  getters: {
    isFavorite: (state) => (postId: number) => {
      return state.favoriteIds.has(postId)
    },
    favoritesCount: (state) => state.favorites.length
  },

  actions: {
    // Получение $api внутри действий
    getApi() {
      const { $api } = useApi()
      return $api
    },

    // Загрузка избранных проповедей
    async loadFavorites() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        this.favorites = []
        this.favoriteIds.clear()
        return
      }

      this.loading = true
      this.error = null

      try {
        const $api = this.getApi()
        // ✅ Исправлено: используем $api вместо $fetch
        const response = await $api<Post[]>('/favorites')

        this.favorites = response || []
        this.favoriteIds = new Set(this.favorites.map(f => f.id))
        
      } catch (err: any) {
        console.error('Error loading favorites:', err)
        this.error = err.message || 'Ошибка загрузки избранного'
      } finally {
        this.loading = false
      }
    },

    // Добавление в избранное
    async addToFavorites(postId: number) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        await navigateTo('/auth/login')
        return { success: false }
      }

      try {
        const $api = this.getApi()
        // ✅ Исправлено: используем $api вместо $fetch
        await $api('/favorites', {
          method: 'POST',
          body: { post_id: postId }
        })

        // Обновляем список избранного
        await this.loadFavorites()
        
        return { success: true }
        
      } catch (err: any) {
        console.error('Error adding to favorites:', err)
        return { success: false, error: err.message }
      }
    },

    // Удаление из избранного
    async removeFromFavorites(postId: number) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        return { success: false }
      }

      try {
        const $api = this.getApi()
        // ✅ Исправлено: используем $api вместо $fetch
        await $api(`/favorites/${postId}`, {
          method: 'DELETE'
        })

        // Обновляем список избранного
        await this.loadFavorites()
        
        return { success: true }
        
      } catch (err: any) {
        console.error('Error removing from favorites:', err)
        return { success: false, error: err.message }
      }
    },

    // Переключение статуса
    async toggleFavorite(postId: number) {
      if (this.isFavorite(postId)) {
        return await this.removeFromFavorites(postId)
      } else {
        return await this.addToFavorites(postId)
      }
    }
  }
})