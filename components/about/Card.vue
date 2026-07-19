<template>
  <div 
    class="about-card bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group h-full flex flex-col"
    @click="$emit('click')"
  >
    <div class="relative h-48 overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600">
      <img 
        v-if="imageUrl"
        :src="imageUrl"
        :alt="about.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        @error="handleImageError"
        loading="lazy"
      >
      <div v-else class="w-full h-full flex items-center justify-center text-6xl">
        {{ getIcon(about.title) }}
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      
      <div class="absolute bottom-4 left-4 z-10">
        <span class="px-3 py-1 bg-blue-500/80 text-white text-sm rounded-full backdrop-blur-sm flex items-center gap-1">
          <span class="text-sm">{{ getCategoryIcon(about.denomination?.title) }}</span>
          {{ about.denomination?.title || 'Без категории' }}
        </span>
      </div>
    </div>
    
    <div class="p-6 flex-1 flex flex-col">
      <h3 class="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition line-clamp-2">
        {{ about.title }}
      </h3>
      
      <p class="text-white/70 line-clamp-3 mb-4 flex-1">
        {{ about.description }}
      </p>
      
      <div class="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
        <span class="text-white/40 text-sm flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDate(about.created_at || about.updated_at) }}
        </span>
        
        <span class="text-blue-400 group-hover:text-blue-300 transition flex items-center gap-1">
          Читать далее
          <svg class="w-4 h-4 group-hover:translate-x-1 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const props = defineProps<{ about: About }>()
defineEmits<{ (e: 'click'): void }>()

const { getImageUrl } = useImageUrl()

const imageUrl = computed(() => props.about.thumbnail ? getImageUrl(props.about.thumbnail, 'abouts') : null)

const getIcon = (title: string): string => {
  const icons: Record<string, string> = {
    'История церкви': '📜',
    'Наша миссия': '🎯',
    'Наши ценности': '💎',
    'Пастор': '👨‍💼'
  }
  return icons[title] || '📖'
}

const getCategoryIcon = (title?: string): string => {
  const icons: Record<string, string> = {
    'История': '📜',
    'Миссия': '🎯',
    'Ценности': '💎',
    'Пасторы': '👨‍💼',
    'Команда': '🤝'
  }
  return icons[title || ''] || '📄'
}

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).style.display = 'none'
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Дата неизвестна'
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.about-card {
  animation: cardSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes cardSlideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>