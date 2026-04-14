<template>
  <div 
    class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition cursor-pointer group"
    @click="$emit('click')"
  >
    <div class="flex items-start gap-4">
      <!-- Изображение -->
      <div v-if="event.thumbnail" class="relative flex-shrink-0">
        <img 
          :src="imageUrl"
          :alt="event.title || 'Изображение события'"
          class="w-24 h-24 rounded-lg object-cover"
          loading="lazy"
          @error="handleImageError"
        />
        <!-- Индикатор "только для членов" -->
        <div 
          v-if="event.members_only && !userCanEdit"
          class="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full"
          title="Только для членов церкви"
        >
          🔒
        </div>
        <!-- ✅ Индикатор "только для служителей" -->
        <div 
          v-if="event.ministers_only && !userCanEdit"
          class="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full"
          title="Только для служителей"
        >
          👔
        </div>
      </div>
      
      <!-- Заглушка, если нет изображения -->
      <div 
        v-else
        class="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0"
      >
        <svg class="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <!-- Контент -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <!-- Цветной индикатор -->
          <div 
            class="w-3 h-3 rounded-full" 
            :style="{ backgroundColor: event.color || '#3b82f6' }"
          ></div>
          
          <!-- Дата -->
          <span class="text-sm text-white/60">
            {{ displayDate }}
          </span>
          
          <!-- Время -->
          <span v-if="formattedTime" class="text-sm text-white/60">
            • {{ formattedTime }}
          </span>
          
          <!-- Статус публикации (только для админов) -->
          <span 
            v-if="userCanEdit && !event.is_published"
            class="text-xs px-2 py-0.5 bg-yellow-500/30 text-yellow-200 rounded-full"
          >
            Черновик
          </span>
          
          <!-- Прошедшее событие -->
          <span 
            v-if="event.is_past"
            class="text-xs px-2 py-0.5 bg-gray-500/30 text-gray-200 rounded-full"
          >
            Прошедшее
          </span>
        </div>
        
        <!-- Заголовок -->
        <h3 class="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition">
          {{ event.title }}
          <span v-if="event.members_only && !userCanEdit" class="text-sm font-normal text-yellow-400 ml-1">
            (только для членов)
          </span>
          <span v-if="event.ministers_only && !userCanEdit" class="text-sm font-normal text-purple-400 ml-1">
            (только для служителей)
          </span>
        </h3>
        
        <!-- Описание -->
        <p v-if="event.description" class="text-white/80 line-clamp-2">
          {{ event.description }}
        </p>
        
        <!-- Местоположение (если есть) -->
        <p v-if="event.location" class="text-white/40 text-sm mt-2 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ event.location }}
        </p>
      </div>
      
      <!-- Стрелка -->
      <svg class="w-5 h-5 text-white/40 flex-shrink-0 group-hover:text-white/80 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  event: any
}>()

defineEmits<{
  (e: 'click'): void
  (e: 'edit', event: any): void
}>()

const authStore = useAuthStore()
const userCanEdit = computed(() => authStore.isAdmin)

// Функция для извлечения времени из любого формата
const extractTime = (timeString?: string): string | null => {
  if (!timeString) return null
  
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return timeString
  }
  
  if (timeString.includes('T')) {
    const match = timeString.match(/(\d{2}:\d{2})/)
    if (match) {
      return match[1]
    }
  }
  
  if (timeString.includes(':')) {
    const parts = timeString.split(':')
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
    }
  }
  
  return null
}

// Форматированное время
const formattedTime = computed(() => {
  const timeSource = props.event.startTime || props.event.time
  
  if (timeSource) {
    return extractTime(timeSource)
  }
  
  return null
})

// URL изображения
const imageUrl = computed(() => {
  if (!props.event.thumbnail) return null
  
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

// Отображаемая дата
const displayDate = computed(() => {
  if (props.event.display_date_time) {
    return props.event.display_date_time
  }
  
  if (props.event.event_date) {
    return formatDate(props.event.event_date)
  }
  
  if (props.event.startDate) {
    return formatDate(props.event.startDate)
  }
  
  return ''
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

// Обработчик ошибки загрузки изображения
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
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