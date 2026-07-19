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
      
      <!-- Шапка с изображением (если есть) -->
      <div 
        v-if="imageUrl"
        class="h-48 bg-cover bg-center relative"
        :style="{ backgroundImage: `url(${imageUrl})` }"
      >
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
      </div>
      
      <!-- Контент -->
      <div class="p-6 overflow-y-auto" :class="{ 'max-h-[80vh]': !imageUrl, 'max-h-[calc(80vh-12rem)]': imageUrl }">
        <!-- Заголовок и кнопка закрытия -->
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-2xl font-bold text-white pr-8">{{ event?.title }}</h2>
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 text-white/60 hover:text-white transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Дата и время -->
        <div class="flex items-center gap-2 text-white/70 mb-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ displayDateTime }}</span>
        </div>
        
        <!-- Состояние загрузки -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          <p class="text-white/80 mt-4">Загрузка события...</p>
        </div>
        
        <!-- Описание -->
        <div v-else-if="event?.description" class="text-white/80 mb-4">
          {{ event.description }}
        </div>
        
        <!-- Контент (HTML) -->
        <div v-if="event?.content" class="text-white/80 prose prose-invert max-w-none" v-html="event.content"></div>
        
        <!-- Доп. информация -->
        <div v-if="event?.info" class="text-white/80 prose prose-invert max-w-none" v-html="event.info"></div>
        
        <!-- Кнопка перехода на полную страницу -->
        <div class="mt-6 text-center">
          <NuxtLink 
            :to="`/events/${event?.slug}`"
            class="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
            @click="$emit('close')"
          >
            Открыть полностью
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  event: any
  loading?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

// Получение URL изображения из S3
const imageUrl = computed(() => {
  if (!props.event?.thumbnail) return null
  
  if (props.event.thumbnail.startsWith('http')) {
    return props.event.thumbnail
  }
  
  if (props.event.thumbnail.startsWith('events/thumbnails/')) {
    return `https://storage.yandexcloud.net/wotgospel-media/${props.event.thumbnail}`
  }
  
  if (props.event.thumbnail.startsWith('public/')) {
    return `https://wotgospel.ru/storage/${props.event.thumbnail.replace('public/', '')}`
  }
  
  return `https://wotgospel.ru/storage/${props.event.thumbnail}`
})

// Форматирование даты
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

// ⭐ Отображаемая дата и время
const displayDateTime = computed(() => {
  if (!props.event) return ''
  
  const parts = []
  
  // Дата
  const dateStr = props.event?.display_date_time || formatDate(props.event?.event_date) || formatDate(props.event?.startDate)
  if (dateStr) {
    parts.push(dateStr)
  }
  
  // Время из поля time (уже локальное)
  if (props.event?.time && props.event.time !== '') {
    parts.push(props.event.time)
  }
  
  return parts.join(' • ') || 'Дата уточняется'
})
</script>

<style scoped>
.prose {
  color: rgba(255, 255, 255, 0.9);
}
.prose p {
  margin-bottom: 1rem;
  line-height: 1.7;
}
.prose h1, .prose h2, .prose h3, .prose h4 {
  color: white;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}
.prose a {
  color: #93c5fd;
  text-decoration: underline;
}
.prose a:hover {
  color: #bfdbfe;
}
.prose ul, .prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}
.prose li {
  margin-bottom: 0.25rem;
}
</style>