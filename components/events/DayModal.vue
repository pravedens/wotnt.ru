<template>
  <div 
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    
    <!-- Модальное окно -->
    <div class="relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/20">
      <!-- Заголовок -->
      <div class="p-6 border-b border-white/10">
        <h2 class="text-2xl font-bold text-white">
          События {{ formattedDate }}
        </h2>
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-white/60 hover:text-white transition"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Список событий -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <div v-if="events.length" class="space-y-4">
          <div
            v-for="event in events"
            :key="event.id"
            class="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition cursor-pointer flex gap-4"
            @click="$emit('select-event', event.slug)"
          >
            <!-- Миниатюра события (если есть) -->
            <div v-if="event.thumbnail" class="flex-shrink-0">
              <img 
                :src="getImageUrl(event.thumbnail)"
                :alt="event.title"
                class="w-16 h-16 rounded-lg object-cover"
                loading="lazy"
              />
            </div>
            
            <!-- Контент -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div 
                  class="w-3 h-3 rounded-full" 
                  :style="{ backgroundColor: event.color || '#3b82f6' }"
                ></div>
                <span class="text-sm text-white/60">
                  {{ event.time || 'Весь день' }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-white">{{ event.title }}</h3>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-white/60">
          Нет событий в этот день
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  date: string
  events: any[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-event', slug: string): void
}>()

const formattedDate = computed(() => {
  if (!props.date) return ''
  const d = new Date(props.date)
  return d.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
})

// Получение URL изображения из S3
const getImageUrl = (thumbnail: string) => {
  if (!thumbnail) return null
  
  // Если уже полный URL
  if (thumbnail.startsWith('http')) {
    return thumbnail
  }
  
  // Если путь начинается с events/thumbnails/ (новый формат S3)
  if (thumbnail.startsWith('events/thumbnails/')) {
    return `https://storage.yandexcloud.net/wotgospel-media/${thumbnail}`
  }
  
  // Если путь начинается с public/ (старый формат)
  if (thumbnail.startsWith('public/')) {
    return `https://wotgospel.ru/storage/${thumbnail.replace('public/', '')}`
  }
  
  // Fallback для старого формата
  return `https://wotgospel.ru/storage/${thumbnail.replace('public/', '')}`
}
</script>