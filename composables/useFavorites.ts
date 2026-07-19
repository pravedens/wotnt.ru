import type { Post } from '~/types/sermon'
import { useApi } from '~/composables/useApi'

interface FavoritesResponse {
    data?: Post[]
    [key: string]: any
}

export const useFavorites = () => {
    const { $api } = useApi()
    const authStore = useAuthStore()
    const router = useRouter()
    
    const favorites = ref<Post[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Загрузка избранных проповедей пользователя
    const loadFavorites = async () => {
        if (!authStore.isAuthenticated) {
            favorites.value = []
            return
        }

        loading.value = true
        error.value = null

        try {
            const response = await $api<Post[] | FavoritesResponse>('/favorites')

            // Обрабатываем ответ в зависимости от формата
            if (Array.isArray(response)) {
                favorites.value = response
            } else if (response?.data && Array.isArray(response.data)) {
                favorites.value = response.data
            } else {
                favorites.value = []
            }
            
        } catch (err: any) {
            console.error('Error loading favorites:', err)
            error.value = err?.data?.message || err?.message || 'Ошибка загрузки избранного'
            favorites.value = []
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
            await $api('/favorites', {
                method: 'POST',
                body: { post_id: postId }
            })

            await loadFavorites()
            
            return { success: true }
            
        } catch (err: any) {
            console.error('Error adding to favorites:', err)
            return { success: false, error: err?.data?.message || err?.message || 'Ошибка добавления' }
        }
    }

    // Удаление из избранного
    const removeFromFavorites = async (postId: number) => {
        if (!authStore.isAuthenticated) {
            return { success: false, error: 'Требуется авторизация' }
        }

        try {
            await $api(`/favorites/${postId}`, {
                method: 'DELETE'
            })

            await loadFavorites()
            
            return { success: true }
            
        } catch (err: any) {
            console.error('Error removing from favorites:', err)
            return { success: false, error: err?.data?.message || err?.message || 'Ошибка удаления' }
        }
    }

    // Переключение статуса избранного
    const toggleFavorite = async (postId: number) => {
        if (!authStore.isAuthenticated) {
            await router.push('/auth/login')
            return { success: false, error: 'Требуется авторизация' }
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
            const response = await $api<{ is_favorite: boolean }>(`/favorites/check/${postId}`)
            return response?.is_favorite === true
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