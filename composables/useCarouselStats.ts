export const useCarouselStats = () => {
  const config = useRuntimeConfig()
  // 👇 Используем CAROUSEL_LIMIT=6 из .env
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
      const response = await $fetch('/api/events/carousel-stats')
      
      stats.value = {
        total: response.total || 0,
        in_carousel: response.in_carousel || 0,
        limit: response.limit || defaultLimit,
        available: response.available || 0
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