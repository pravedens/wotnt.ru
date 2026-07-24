<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
    <div class="flex items-center gap-3 mb-4">
      <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <h2 class="text-xl font-bold text-white">Стих дня</h2>
    </div>
    
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
    </div>
    
    <div v-else-if="error" class="text-center py-4 text-red-300">
      {{ error }}
    </div>
    
    <div v-else-if="verse" class="space-y-4">
      <div class="text-center">
        <h3 class="text-lg font-semibold text-blue-200 mb-2">{{ verse.title }}</h3>
        <div class="text-white/90 text-lg leading-relaxed italic prose prose-invert max-w-none">
          <div v-html="cleanDescription"></div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-8 text-white/60">
      Стих дня будет добавлен позже
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'  
import type { BibleVerse } from '~/types/bible'

// ✅ ПОЛУЧАЕМ $api
const { $api } = useApi()

const verse = ref<BibleVerse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Очищаем HTML от лишних тегов, оставляя только текст
const cleanDescription = computed(() => {
  if (!verse.value?.description) return ''
  // Удаляем HTML-теги, но сохраняем переносы строк
  return verse.value.description.replace(/<[^>]*>/g, '')
})

const fetchVerseOfTheDay = async () => {
  loading.value = true
  error.value = null
  
  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api<{ success: boolean; data: BibleVerse | null; message: string }>('/bible/verse-of-the-day')
    verse.value = response.data
  } catch (err: any) {
    console.error('Error fetching verse:', err)
    error.value = 'Не удалось загрузить стих дня'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVerseOfTheDay()
})
</script>