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
          <span>{{ formattedDateTime }}</span>
        </div>
        
        <!-- Описание -->
        <div v-if="event?.description" class="text-white/80 mb-6">
          <p class="whitespace-pre-line">{{ event.description }}</p>
        </div>
        
        <!-- Кнопки действий -->
        <div class="mt-6 flex justify-end gap-4">
          <button
            v-if="canEdit"
            @click="$emit('edit')"
            class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition"
          >
            Редактировать
          </button>
          <NuxtLink 
            :to="`/events/${event?.slug}`"
            class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
            @click="$emit('close')"
          >
            Подробнее
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
  canEdit?: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
}>()

// Получение URL изображения из S3
const imageUrl = computed(() => {
  if (!props.event?.thumbnail) return null
  
  // Если уже полный URL
  if (props.event.thumbnail.startsWith('http')) {
    return props.event.thumbnail
  }
  
  // Если путь начинается с events/thumbnails/ (новый формат S3)
  if (props.event.thumbnail.startsWith('events/thumbnails/')) {
    return `https://storage.yandexcloud.net/wotgospel-media/${props.event.thumbnail}`
  }
  
  // Если путь начинается с public/ (старый формат)
  if (props.event.thumbnail.startsWith('public/')) {
    return `https://wotgospel.ru/storage/${props.event.thumbnail.replace('public/', '')}`
  }
  
  // Fallback для старого формата
  return `https://wotgospel.ru/storage/${props.event.thumbnail.replace('public/', '')}`
})

const formattedDateTime = computed(() => {
  if (!props.event) return ''
  
  const parts = []
  
  // Дата
  if (props.event.startDate) {
    const date = new Date(props.event.startDate)
    parts.push(date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }))
  }
  
  // Время
  if (props.event.startTime) {
    parts.push('в ' + props.event.startTime.substring(0, 5))
  }
  
  return parts.join(' ')
})
</script>