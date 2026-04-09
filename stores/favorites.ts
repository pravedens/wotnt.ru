import { defineStore } from 'pinia'
import type { Post } from '~/types/sermon'

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
    // Вспомогательная функция для получения CSRF токена
    getCookie(name: string): string | null {
      if (process.client) {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) {
          return decodeURIComponent(parts.pop()?.split(';').shift() || '')
        }
      }
      return null
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
        const response = await $fetch<Post[]>('/api/favorites', {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Accept': 'application/json'
          }
        })

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
        const xsrfToken = this.getCookie('XSRF-TOKEN')
        
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }

        if (xsrfToken) {
          headers['X-XSRF-TOKEN'] = xsrfToken
        }

        await $fetch('/api/favorites', {
          method: 'POST',
          body: { post_id: postId },
          headers,
          credentials: 'include'
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
        const xsrfToken = this.getCookie('XSRF-TOKEN')
        
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/json'
        }

        if (xsrfToken) {
          headers['X-XSRF-TOKEN'] = xsrfToken
        }

        await $fetch(`/api/favorites/${postId}`, {
          method: 'DELETE',
          headers,
          credentials: 'include'
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