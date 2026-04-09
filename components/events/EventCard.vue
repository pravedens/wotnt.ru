<template>
  <div 
    class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-start gap-4">
      <!-- Изображение -->
        <img 
            v-if="event.thumbnail"
            :src="imageUrl"
            :alt="event.title || 'Изображение события'"
            class="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            loading="lazy"
        />
      
      <!-- Контент -->
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <!-- Цветной индикатор -->
          <div 
            class="w-3 h-3 rounded-full" 
            :style="{ backgroundColor: event.color || '#3b82f6' }"
          ></div>
          
          <!-- Дата -->
          <span class="text-sm text-white/60">
            {{ event.display_date_time || formatDate(event.event_date) }}
          </span>
        </div>
        
        <!-- Заголовок -->
        <h3 class="text-xl font-bold text-white mb-2">{{ event.title }}</h3>
        
        <!-- Описание -->
        <p v-if="event.description" class="text-white/80 line-clamp-2">
          {{ event.description }}
        </p>
      </div>
      
      <!-- Стрелка -->
      <svg class="w-5 h-5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  event: any
}>()

defineEmits<{
  (e: 'click'): void
}>()

// Получение URL изображения из S3
const imageUrl = computed(() => {
  if (!props.event.thumbnail) return null
  
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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>