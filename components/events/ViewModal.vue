<template>
  <Teleport to="body">
    <div 
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <!-- Затемнение -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <!-- Модальное окно -->
      <div class="relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl">
        
        <!-- Шапка с изображением (если есть) -->
        <div 
          v-if="imageUrl"
          class="h-48 bg-cover bg-center relative"
          :style="{ backgroundImage: `url(${imageUrl})` }"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        </div>
        
        <!-- Контент -->
        <div class="p-6 overflow-y-auto" :class="{ 'max-h-[calc(90vh-12rem)]': imageUrl, 'max-h-[90vh]': !imageUrl }">
          <!-- Заголовок и кнопка закрытия -->
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-white pr-8">{{ event?.title || 'Событие' }}</h2>
            <button
              @click="$emit('close')"
              class="absolute top-4 right-4 text-white/60 hover:text-white transition z-10"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Дата и время -->
          <div class="flex items-center gap-2 text-white/70 mb-4 flex-wrap">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formattedDateTime }}</span>
            
            <!-- Индикатор "только для членов" -->
            <span 
              v-if="event?.members_only && !canEdit"
              class="ml-2 text-xs px-2 py-0.5 bg-yellow-500/30 text-yellow-200 rounded-full"
            >
              🔒 Только для членов церкви
            </span>
            
            <!-- Индикатор статуса (для админов) -->
            <span 
              v-if="canEdit && !event?.is_published"
              class="ml-2 text-xs px-2 py-0.5 bg-yellow-500/30 text-yellow-200 rounded-full"
            >
              📝 Черновик
            </span>
            
            <span 
              v-if="event?.is_past"
              class="ml-2 text-xs px-2 py-0.5 bg-gray-500/30 text-gray-200 rounded-full"
            >
              📅 Прошедшее
            </span>
          </div>
          
          <!-- Местоположение -->
          <div v-if="event?.location" class="flex items-center gap-2 text-white/60 mb-4">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ event.location }}</span>
          </div>
          
          <!-- Описание -->
          <div v-if="event?.description" class="text-white/80 mb-6">
            <div class="prose prose-invert max-w-none">
              <p class="whitespace-pre-line">{{ event.description }}</p>
            </div>
          </div>
          
          <!-- Кнопки действий -->
          <div class="mt-6 flex justify-end gap-4">
            <button
              v-if="canEdit"
              @click="handleEdit"
              class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition"
            >
              ✏️ Редактировать
            </button>
            <NuxtLink 
              :to="`/events/${event?.slug}`"
              class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition text-center"
              @click="$emit('close')"
            >
              📖 Подробнее
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useScrollLock } from '~/composables/useScrollLock'

const { lockScroll, unlockScroll } = useScrollLock()

const props = defineProps<{
  visible: boolean
  event: any
  canEdit?: boolean
}>()

const emit = defineEmits<{
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
  
  // Fallback
  return `https://wotgospel.ru/storage/${props.event.thumbnail}`
})

// Форматированная дата и время
const formattedDateTime = computed(() => {
  if (!props.event) return ''
  
  const parts: string[] = []
  
  // Дата
  if (props.event.startDate) {
    const date = new Date(props.event.startDate)
    parts.push(date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }))
  } else if (props.event.event_date) {
    const date = new Date(props.event.event_date)
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
  
  return parts.join(' ') || 'Дата не указана'
})

// Обработчик редактирования с закрытием модалки
const handleEdit = () => {
  emit('edit')
  emit('close')
}

// Блокировка скролла body при открытом модальном окне
watch(() => props.visible, (isVisible) => {
    if (isVisible) {
        lockScroll()
    } else {
        unlockScroll()
    }
}, { immediate: true })

// ✅ Дополнительная очистка при размонтировании
onUnmounted(() => {
    unlockScroll()
})
</script>

<style scoped>
/* Плавное появление */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Стили для текста */
.prose {
  line-height: 1.6;
}

.prose p {
  margin-bottom: 1rem;
}

.prose p:last-child {
  margin-bottom: 0;
}
</style>