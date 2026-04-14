<template>
  <Teleport to="body">
    <div 
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <!-- Затемнение -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"></div>
      
      <!-- Модальное окно -->
      <div class="relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white/20 shadow-2xl animate-slideUp">
        
        <!-- Заголовок -->
        <div class="p-4 sm:p-6 border-b border-white/10 bg-white/5">
          <h2 class="text-xl sm:text-2xl font-bold text-white">
            События {{ formattedDate }}
          </h2>
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 text-white/60 hover:text-white transition p-2 rounded-lg hover:bg-white/10"
            aria-label="Закрыть"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Список событий -->
        <div class="p-4 sm:p-6 overflow-y-auto max-h-[55vh] sm:max-h-[60vh]">
          <div v-if="events.length" class="space-y-3 sm:space-y-4">
            <div
              v-for="event in sortedEvents"
              :key="event.id"
              class="bg-white/5 hover:bg-white/10 rounded-xl p-3 sm:p-4 transition-all cursor-pointer group"
              @click="handleEventClick(event)"
            >
              <div class="flex gap-3 sm:gap-4">
                <!-- Миниатюра события -->
                <div v-if="event.thumbnail" class="flex-shrink-0">
                  <img 
                    :src="getImageUrl(event.thumbnail)"
                    :alt="event.title"
                    class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                    loading="lazy"
                    @error="handleImageError"
                  />
                </div>
                
                <!-- Заглушка без изображения -->
                <div 
                  v-else
                  class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0"
                >
                  <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <!-- Контент -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <div 
                      class="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                      :style="{ backgroundColor: event.color || '#3b82f6' }"
                    ></div>
                    <span class="text-xs sm:text-sm text-white/60">
                      {{ event.time || 'Весь день' }}
                    </span>
                    
                    <!-- Индикатор "только для членов" -->
                    <span 
                      v-if="event.members_only"
                      class="text-xs px-1.5 py-0.5 bg-yellow-500/30 text-yellow-200 rounded-full"
                    >
                      🔒
                    </span>
                  </div>
                  <h3 class="text-sm sm:text-lg font-semibold text-white group-hover:text-blue-300 transition line-clamp-2">
                    {{ event.title }}
                  </h3>
                  <p v-if="event.description" class="text-white/60 text-xs sm:text-sm line-clamp-1 mt-1">
                    {{ event.description }}
                  </p>
                </div>
                
                <!-- Стрелка -->
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white/40 flex-shrink-0 group-hover:text-white/70 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 sm:py-12 text-white/60">
            <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Нет событий в этот день</p>
          </div>
        </div>
        
        <!-- Кнопка закрытия внизу (для мобильных) -->
        <div class="p-4 border-t border-white/10 bg-white/5 sm:hidden">
          <button
            @click="$emit('close')"
            class="w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Event {
  id: number
  title: string
  slug: string
  thumbnail?: string
  color?: string
  time?: string
  description?: string
  members_only?: boolean
}

const props = defineProps<{
  visible: boolean
  date: string
  events: Event[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-event', slug: string): void
}>()

// Сортировка событий по времени
const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => {
    if (!a.time && !b.time) return 0
    if (!a.time) return 1
    if (!b.time) return -1
    return a.time.localeCompare(b.time)
  })
})

// Форматированная дата
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
  
  if (thumbnail.startsWith('http')) {
    return thumbnail
  }
  
  if (thumbnail.startsWith('events/thumbnails/')) {
    return `https://storage.yandexcloud.net/wotgospel-media/${thumbnail}`
  }
  
  if (thumbnail.startsWith('public/')) {
    return `https://wotgospel.ru/storage/${thumbnail.replace('public/', '')}`
  }
  
  return `https://wotgospel.ru/storage/${thumbnail}`
}

// Обработка ошибки изображения
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Обработчик клика по событию
const handleEventClick = (event: Event) => {
  if (event.slug) {
    emit('select-event', event.slug)
    emit('close')
  }
}

// Блокировка скролла при открытом модальном окне
watch(() => props.visible, (isVisible) => {
  if (process.client) {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
}, { immediate: true })
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>