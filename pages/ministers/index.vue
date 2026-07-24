<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold text-white text-center mb-4">Наши служители</h1>
      <p class="text-white/80 text-center mb-8 max-w-2xl mx-auto">
        Команда служителей, которые заботятся о церкви и помогают людям расти в вере
      </p>

      <!-- Фильтр только по категориям, где есть служители -->
      <div v-if="availableCategories.length > 0" class="flex flex-wrap justify-center gap-2 mb-12">
        <button 
          @click="selectedCategory = null" 
          class="px-4 py-2 rounded-full transition-all" 
          :class="!selectedCategory ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'"
        >
          Все ({{ allMinisters.length }})
        </button>
        <button 
          v-for="cat in availableCategories" 
          :key="cat.id" 
          @click="selectedCategory = cat" 
          class="px-4 py-2 rounded-full transition-all flex items-center gap-2" 
          :class="selectedCategory?.id === cat.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
          <span class="text-xs bg-white/20 rounded-full px-2 py-0.5">{{ getCategoryCount(cat.id) }}</span>
        </button>
      </div>

      <!-- Если нет ни одной категории со служителями -->
      <div v-else-if="!loading && allCategories.length > 0" class="text-center text-white/60 py-8 mb-12">
        ⚠️ Нет служителей ни в одной категории
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>

      <div v-else-if="filteredMinisters.length === 0" class="text-center text-white/60 py-12">
        Нет служителей в этой категории
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <MinisterCard v-for="minister in filteredMinisters" :key="minister.id" :minister="minister" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMinister } from '~/composables/useMinister'

const { getMinisters, getAllCategories } = useMinister()

const allMinisters = ref<any[]>([])
const allCategories = ref<any[]>([])  // ✅ Переименовано из categories в allCategories
const loading = ref(true)
const selectedCategory = ref<any>(null)

// ✅ Только категории, в которых есть служители
const availableCategories = computed(() => {
  // Получаем ID категорий, которые есть у служителей
  const usedCategoryIds = new Set<number>()
  
  allMinisters.value.forEach(minister => {
    minister.minister_categories?.forEach((cat: any) => {
      usedCategoryIds.add(cat.id)
    })
  })
  
  // Фильтруем категории
  return allCategories.value.filter(cat => usedCategoryIds.has(cat.id))
})

// ✅ Количество служителей в категории
const getCategoryCount = (categoryId: number) => {
  return allMinisters.value.filter(minister =>
    minister.minister_categories?.some((cat: any) => cat.id === categoryId)
  ).length
}

const filteredMinisters = computed(() => {
  if (!selectedCategory.value) return allMinisters.value
  return allMinisters.value.filter(minister => 
    minister.minister_categories?.some((cat: any) => cat.id === selectedCategory.value.id)
  )
})

onMounted(async () => {
  loading.value = true
  try {
    const [ministers, categories] = await Promise.all([getMinisters(), getAllCategories()])
    allMinisters.value = ministers
    allCategories.value = categories
  } catch (error) {
    console.error('Failed to load ministers:', error)
  } finally {
    loading.value = false
  }
})
</script>