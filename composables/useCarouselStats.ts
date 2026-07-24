import { useApi } from '~/composables/useApi'
import type { CarouselStatsResponse } from '~/types/event'

export const useCarouselStats = () => {
    const { $api } = useApi()
    const config = useRuntimeConfig()
    
    const defaultLimit = Number(config.public.carouselLimit) || 6

    const stats = ref({
        total: 0,
        in_carousel: 0,
        limit: defaultLimit,
        available: 0
    })
    const loading = ref(false)
    const error = ref<string | null>(null)

    const loadStats = async () => {
        loading.value = true
        error.value = null
        
        try {
            // ✅ Типизируем ответ
            const response = await $api<CarouselStatsResponse>('/events/carousel-stats')
            
            const inCarousel = response.in_carousel ?? 0
            const limit = response.limit ?? defaultLimit
            const available = response.available ?? (limit - inCarousel)
            
            stats.value = {
                total: response.total ?? 0,
                in_carousel: inCarousel,
                limit: limit,
                available: available < 0 ? 0 : available
            }
            
        } catch (err: any) {
            console.error('❌ Error loading carousel stats:', err)
            error.value = 'Не удалось загрузить статистику'
            
            stats.value = {
                total: 0,
                in_carousel: 0,
                limit: defaultLimit,
                available: defaultLimit
            }
        } finally {
            loading.value = false
        }
    }

    return {
        stats,
        loading,
        error,
        loadStats
    }
}