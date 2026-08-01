// composables/useHome.ts

import type { Post } from '~/types/sermon'
import type { Event } from '~/types/event'
import type { Friend } from '~/types/friend'
import type { BibleVerse } from '~/types/bible'
import type { LiveStream } from '~/types/live'

interface HomeData {
  random_posts: Post[]
  upcoming_events: Event[]
  friends: Friend[]
  verse_of_day: BibleVerse | null
  live_stream: LiveStream | null
}

interface HomeResponse {
  success: boolean
  data: HomeData
  cached: boolean
}

export const useHome = () => {
  const { $api } = useApi()
  
  const data = ref<HomeData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cached = ref(false)

  const loadHomeData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<HomeResponse>('/home')
      
      if (response.success && response.data) {
        data.value = response.data
        cached.value = response.cached || false
      } else {
        throw new Error('Не удалось загрузить данные')
      }
    } catch (err: any) {
      console.error('❌ Error loading home data:', err)
      error.value = err.message || 'Ошибка загрузки данных'
      data.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    cached,
    loadHomeData
  }
}