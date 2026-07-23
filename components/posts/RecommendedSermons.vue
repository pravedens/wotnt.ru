<template>
  <div class="w-full max-w-7xl mx-auto mb-12 px-4">
    <!-- Заголовок -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 class="text-2xl sm:text-3xl font-bold text-white">
        📖 Рекомендуемые проповеди
      </h2>
      <NuxtLink 
        to="/sermons" 
        class="text-white/70 hover:text-white transition flex items-center gap-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 text-sm sm:text-base whitespace-nowrap"
      >
        Все проповеди
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
    
    <!-- Состояние загрузки -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
    </div>
    
    <!-- Ошибка -->
    <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center">
      <p class="text-red-200">{{ error }}</p>
    </div>
    
    <!-- Нет проповедей -->
    <div v-else-if="sermons.length === 0" class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
      <p class="text-white/80 text-lg">Нет рекомендуемых проповедей</p>
    </div>
    
    <!-- Сетка проповедей -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="sermon in sermons"
        :key="sermon.id"
        class="h-full"
      >
        <h3 class="sr-only">{{ sermon.title }}</h3>
        <PostCard :post="sermon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStatsStore } from '~/stores/stats'
import PostCard from '~/components/posts/PostCard.vue'
import { useApi } from '~/composables/useApi'
import type { Post } from '~/types/sermon'

const props = defineProps<{
  limit?: number
}>()

const statsStore = useStatsStore()
const { $api } = useApi()

const sermons = ref<Post[]>([]) 
const loading = ref(true)
const error = ref<string | null>(null)

// Загрузка рекомендуемых проповедей
const loadRecommendedSermons = async () => {
  loading.value = true
  error.value = null
  
  try {
    // ✅ Указываем тип ответа
    const response = await $api<Post[]>('/posts/random', {
      query: {
        limit: props.limit || 4
      }
    })
    
    // ✅ Проверяем, что response - это массив
    sermons.value = Array.isArray(response) ? response : []
    
    // Загружаем статистику для каждой проповеди
    await Promise.all(
      sermons.value.map(async (sermon) => {
        await statsStore.fetchPostStats(sermon.id)
      })
    )
    
  } catch (err: any) {
    console.error('❌ Error loading recommended sermons:', err)
    error.value = 'Не удалось загрузить проповеди'
    sermons.value = [] // ✅ Сбрасываем на пустой массив при ошибке
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecommendedSermons()
})
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>