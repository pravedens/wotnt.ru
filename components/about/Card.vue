<template>
  <div 
    class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group h-full flex flex-col"
    @click="$emit('click')"
  >
    <!-- Изображение -->
    <div class="h-48 relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600">
      <!-- Само изображение -->
      <img 
        v-if="imageUrl"
        :src="imageUrl"
        :alt="about.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        @error="handleImageError"
        loading="lazy"
      >
      
      <!-- Заглушка если нет изображения -->
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <!-- Затемнение -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      
      <!-- Категория -->
      <div class="absolute bottom-4 left-4 z-10">
        <span class="px-3 py-1 bg-blue-500/80 text-white text-sm rounded-full backdrop-blur-sm">
          {{ about.denomination?.title || 'Без категории' }}
        </span>
      </div>
    </div>
    
    <!-- Контент -->
    <div class="p-6 flex-1 flex flex-col">
      <h3 class="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition line-clamp-2">
        {{ about.title }}
      </h3>
      
      <p class="text-white/70 line-clamp-3 mb-4 flex-1">
        {{ about.description }}
      </p>
      
      <div class="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
        <span class="text-white/40 text-sm">
          {{ formatDate(about.created_at || about.updated_at) }}
        </span>
        
        <span class="text-blue-400 group-hover:text-blue-300 transition flex items-center gap-1">
          Читать далее
          <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { About } from '~/types/about'
import { useImageUrl } from '~/composables/useImageUrl'

const props = defineProps<{
  about: About
}>()

defineEmits<{
  (e: 'click'): void
}>()

const { getImageUrl } = useImageUrl()
const imageError = ref(false)

// Формируем URL изображения
const imageUrl = computed(() => {
  if (!props.about.thumbnail) return null
  return getImageUrl(props.about.thumbnail, 'abouts')
})

// Обработчик ошибки загрузки изображения
const handleImageError = (e: Event) => {
  imageError.value = true
  const img = e.target as HTMLImageElement
  console.error('❌ Ошибка загрузки изображения:', img.src)
  console.log('📁 Путь в базе:', props.about.thumbnail)
}

// Форматирование даты
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Дата неизвестна'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}
</script>