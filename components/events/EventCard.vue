<template>
  <div 
    class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition cursor-pointer group"
    :class="{
      'opacity-75': event.is_cancelled,
      'border-red-500/50': event.is_cancelled
    }"
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
        
        <!-- Значок "Отменено" -->
        <div 
          v-if="event.is_cancelled"
          class="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold z-10"
          title="Событие отменено"
        >
          ❌ Отменено
        </div>
        
        <!-- Индикатор "только для прихожан" -->
        <div 
          v-if="event.members_only && !userCanEdit && !event.is_cancelled"
          class="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full"
          title="Только для прихожан"
        >
          🔒
        </div>
        
        <!-- Индикатор "только для служителей" -->
        <div 
          v-if="event.ministers_only && !userCanEdit && !event.is_cancelled"
          class="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full"
          title="Только для служителей"
        >
          👔
        </div>
      </div>
      
      <!-- Заглушка, если нет изображения -->
      <div 
        v-else
        class="relative w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0"
      >
        <svg class="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <!-- Значок "Отменено" для заглушки -->
        <div 
          v-if="event.is_cancelled"
          class="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold z-10"
        >
          ❌ Отменено
        </div>
      </div>
      
      <!-- Контент -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <!-- Цветной индикатор -->
          <div 
            class="w-3 h-3 rounded-full" 
            :style="{ backgroundColor: event.is_cancelled ? '#ef4444' : (event.color || '#3b82f6') }"
          ></div>
          
          <!-- Дата -->
          <span class="text-sm" :class="event.is_cancelled ? 'text-red-400' : 'text-white/60'">
            {{ displayDate }}
          </span>
          
          <!-- Время -->
          <span v-if="displayTime" class="text-sm" :class="event.is_cancelled ? 'text-red-400' : 'text-white/60'">
            • {{ displayTime }}
          </span>
          
          <!-- Статус: Отменено -->
          <span 
            v-if="event.is_cancelled"
            class="text-xs px-2 py-0.5 bg-red-500/30 text-red-200 rounded-full"
          >
            ❌ Отменено
          </span>
          
          <!-- Статус: Прошедшее -->
          <span 
            v-else-if="event.is_past"
            class="text-xs px-2 py-0.5 bg-gray-500/30 text-gray-200 rounded-full"
          >
            📅 Прошедшее
          </span>
          
          <!-- Статус: Актуально -->
          <span 
            v-else-if="event.is_published"
            class="text-xs px-2 py-0.5 bg-green-500/30 text-green-200 rounded-full"
          >
            ✅ Актуально
          </span>
          
          <!-- Счётчик участников (только для активных событий) -->
          <span 
            v-if="!event.is_cancelled && !event.is_past && event.attendees_count > 0"
            class="text-xs px-2 py-0.5 bg-green-500/30 text-green-200 rounded-full flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {{ event.attendees_count }} {{ getDeclension(event.attendees_count) }}
          </span>
          
          <!-- Черновик (только для админов) -->
          <span 
            v-if="userCanEdit && !event.is_published && !event.is_cancelled && !event.is_past"
            class="text-xs px-2 py-0.5 bg-yellow-500/30 text-yellow-200 rounded-full"
          >
            Черновик
          </span>
        </div>
        
        <!-- Заголовок -->
        <h3 
          class="text-xl font-bold mb-2 group-hover:text-blue-300 transition"
          :class="{
            'text-white/50 line-through': event.is_cancelled,
            'text-white': !event.is_cancelled
          }"
        >
          {{ event.title }}
          <span v-if="event.members_only && !userCanEdit && !event.is_cancelled" class="text-sm font-normal text-yellow-400 ml-1">
            (только для прихожан)
          </span>
          <span v-if="event.ministers_only && !userCanEdit && !event.is_cancelled" class="text-sm font-normal text-purple-400 ml-1">
            (только для служителей)
          </span>
        </h3>
        
        <!-- Описание -->
        <p 
          v-if="event.description" 
          class="line-clamp-2"
          :class="event.is_cancelled ? 'text-white/40 line-through' : 'text-white/80'"
        >
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
      <svg class="w-5 h-5 flex-shrink-0 transition" :class="event.is_cancelled ? 'text-white/20' : 'text-white/40 group-hover:text-white/80'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// Склонение слова "человек"
const getDeclension = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) return 'человек'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'человека'
  return 'человек'
}

// Отображаемое время
const displayTime = computed(() => {
  if (props.event.time && props.event.time !== '') {
    return props.event.time
  }
  
  if (props.event.startTime && props.event.startTime.match(/^\d{2}:\d{2}/)) {
    const [hours, minutes] = props.event.startTime.split(':').map(Number)
    let localHours = hours + 5
    if (localHours >= 24) localHours -= 24
    return `${localHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
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