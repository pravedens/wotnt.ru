import type { Post } from '~/types/sermon'

export const useFavorites = () => {
  const { getHeaders } = useApi()
  
  const favorites = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()
  const router = useRouter()

  // Загрузка избранных проповедей пользователя
  const loadFavorites = async () => {
    if (!authStore.isAuthenticated) {
      favorites.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<Post[]>('/api/favorites', {
        headers: getHeaders(true)
      })

      favorites.value = response || []
      
    } catch (err: any) {
      console.error('Error loading favorites:', err)
      error.value = err.message || 'Ошибка загрузки избранного'
    } finally {
      loading.value = false
    }
  }

  // Добавление в избранное
  const addToFavorites = async (postId: number) => {
    if (!authStore.isAuthenticated) {
      await router.push('/auth/login')
      return { success: false, error: 'Требуется авторизация' }
    }

    try {
      await $fetch('/api/favorites', {
        method: 'POST',
        body: { post_id: postId },
        headers: getHeaders(true)
      })

      await loadFavorites()
      
      return { success: true }
      
    } catch (err: any) {
      console.error('Error adding to favorites:', err)
      return { success: false, error: err.message }
    }
  }

  // Удаление из избранного
  const removeFromFavorites = async (postId: number) => {
    if (!authStore.isAuthenticated) {
      return { success: false }
    }

    try {
      await $fetch(`/api/favorites/${postId}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      })

      await loadFavorites()
      
      return { success: true }
      
    } catch (err: any) {
      console.error('Error removing from favorites:', err)
      return { success: false, error: err.message }
    }
  }

  // Переключение статуса избранного
  const toggleFavorite = async (postId: number) => {
    if (!authStore.isAuthenticated) {
      await router.push('/auth/login')
      return { success: false }
    }

    const isFav = favorites.value.some(f => f.id === postId)
    
    if (isFav) {
      return await removeFromFavorites(postId)
    } else {
      return await addToFavorites(postId)
    }
  }

  // Проверка, находится ли пост в избранном
  const checkFavoriteStatus = async (postId: number): Promise<boolean> => {
    if (!authStore.isAuthenticated) {
      return false
    }

    try {
      const response = await $fetch<{ is_favorite: boolean }>(`/api/favorites/check/${postId}`, {
        headers: getHeaders(true)
      })

      return response.is_favorite
      
    } catch (err) {
      console.error('Error checking favorite status:', err)
      return false
    }
  }

  return {
    favorites,
    loading,
    error,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    checkFavoriteStatus
  }
}