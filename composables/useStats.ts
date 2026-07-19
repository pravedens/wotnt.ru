import { useApi } from '~/composables/useApi'

export const useStats = () => {
    const { $api } = useApi()
    
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Отслеживание просмотра
    const trackView = async (postId: number) => {
        try {
            const response = await $api(`/posts/${postId}/view`, {
                method: 'POST'
            })
            return response
        } catch (err) {
            console.error('Error tracking view:', err)
            return null
        }
    }

    // Переключение лайка
    const toggleLike = async (postId: number) => {
        loading.value = true
        error.value = null

        try {
            const response = await $api(`/posts/${postId}/like`, {
                method: 'POST'
            })
            return response
        } catch (err: any) {
            error.value = err.message
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    // Получение статистики
    const getStats = async (postId: number) => {
        try {
            const response = await $api(`/posts/${postId}/stats`)
            return response
        } catch (err) {
            console.error('Error getting stats:', err)
            return null
        }
    }

    return {
        loading,
        error,
        trackView,
        toggleLike,
        getStats
    }
}