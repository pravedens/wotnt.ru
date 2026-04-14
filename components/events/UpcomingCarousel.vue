<template>
  <div class="w-full max-w-7xl mx-auto mb-12 px-4">
    <!-- Заголовок -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-white">
        📅 Главные события
      </h2>
      <NuxtLink
        to="/events"
        class="text-white/70 hover:text-white transition flex items-center gap-1 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/10 text-sm sm:text-base whitespace-nowrap"
      >
        Все события
        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="flex justify-center py-12 sm:py-20">
      <div class="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-white border-t-transparent"></div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 sm:p-8 text-center">
      <p class="text-red-200 text-sm sm:text-base">{{ error }}</p>
      <button
        @click="retryLoad"
        class="mt-4 px-4 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
      >
        Попробовать снова
      </button>
    </div>

    <!-- Нет событий -->
    <div v-else-if="events.length === 0" class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 sm:p-12 text-center">
      <p class="text-white/80 text-base sm:text-lg">Нет главных событий</p>
    </div>

    <!-- Карусель -->
    <div 
      v-else 
      class="relative group/carousel"
      @mouseenter="pauseAutoplay"
      @mouseleave="resumeAutoplay"
    >
      <!-- Текущий слайд -->
      <div class="transition-all duration-500 ease-out">
        <NuxtLink
          :to="`/events/${events[currentIndex].slug}`"
          class="block group"
        >
          <div class="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all">
            
            <!-- Изображение с затемнением -->
            <div class="relative w-full" :class="imageContainerClass">
              <img
                v-if="events[currentIndex].thumbnail"
                :src="getImageUrl(events[currentIndex].thumbnail)"
                :alt="events[currentIndex].title"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                @error="handleImageError"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <svg class="w-16 h-16 sm:w-24 sm:h-24 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <!-- Градиентное затемнение -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
            </div>

            <!-- Счетчик на картинке -->
            <div class="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/40 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 text-white/90 text-xs sm:text-sm z-10">
              {{ currentIndex + 1 }} / {{ events.length }}
            </div>

            <!-- Индикатор "только для членов" -->
            <div 
              v-if="events[currentIndex].members_only && !isAdmin"
              class="absolute top-3 left-3 sm:top-4 sm:left-4 bg-yellow-500/80 backdrop-blur-sm px-2 py-1 rounded-full border border-yellow-300/50 text-white text-xs z-10"
            >
              🔒 Только для членов
            </div>

            <!-- Контент поверх изображения -->
            <div class="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3 sm:p-6 md:p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <!-- Дата и время -->
              <div class="flex items-center gap-1 sm:gap-2 text-white/90 text-xs sm:text-sm md:text-base mb-0.5 sm:mb-2">
                <svg class="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ formatEventDate(events[currentIndex]) }}</span>
              </div>

              <!-- Заголовок -->
              <h3 class="text-sm sm:text-xl md:text-2xl font-bold text-white mb-0.5 sm:mb-2 group-hover:text-blue-300 transition line-clamp-1 sm:line-clamp-2">
                {{ events[currentIndex].title }}
              </h3>

              <!-- Описание (только на планшетах и выше) -->
              <p v-if="events[currentIndex].description && !isMobile" class="text-white/70 text-xs sm:text-sm line-clamp-2 max-w-2xl mb-1 sm:mb-3">
                {{ events[currentIndex].description }}
              </p>

              <!-- Кнопка подробнее -->
              <div class="inline-flex items-center gap-1 sm:gap-2 text-white bg-white/10 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full w-fit hover:bg-white/20 transition border border-white/20 group-hover:border-white/40 text-xs sm:text-sm">
                <span class="text-[10px] sm:text-sm">Подробнее</span>
                <svg class="w-2 h-2 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Стрелки навигации -->
      <button
        @click="prevSlide"
        :disabled="currentIndex === 0"
        class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-10 sm:h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-xl border border-white/20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-20"
        aria-label="Предыдущее"
      >
        ←
      </button>
      <button
        @click="nextSlide"
        :disabled="currentIndex === events.length - 1"
        class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-10 sm:h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-xl border border-white/20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-20"
        aria-label="Следующее"
      >
        →
      </button>

      <!-- Пагинация (точки) -->
      <div class="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-4">
        <button
          v-for="(event, index) in events"
          :key="`dot-${index}`"
          @click="goToSlide(index)"
          class="h-1 sm:h-2 rounded-full transition-all duration-300 border border-white/20"
          :class="currentIndex === index ? 'w-4 sm:w-8 bg-white' : 'w-1 sm:w-2 bg-white/30 hover:bg-white/50'"
          :aria-label="`Перейти к событию ${index + 1}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'
import { useWindowSize } from '@vueuse/core'

// Типы
interface Event {
  id: number
  title: string
  slug: string
  thumbnail?: string
  description?: string
  startDate?: string
  startTime?: string
  members_only?: boolean
  is_published?: boolean
  is_past?: boolean
}

// Props
const props = defineProps<{
  limit?: number
}>()

// Composables
const config = useRuntimeConfig()
const authStore = useAuthStore()
const { isAdmin } = storeToRefs(authStore)
const { width } = useWindowSize()

// Состояния
const events = ref<Event[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentIndex = ref(0)
const isPaused = ref(false)
let autoplayInterval: ReturnType<typeof setInterval> | null = null

// Вычисляемые значения
const limit = computed(() => props.limit || config.public.carouselLimit || 6)
const isMobile = computed(() => width.value < 640)
const imageContainerClass = computed(() => isMobile.value ? 'h-64' : 'aspect-video')

// Получение URL изображения
const getImageUrl = (thumbnail: string): string | null => {
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

// Форматирование даты события
const formatEventDate = (event: Event): string => {
  const parts: string[] = []

  if (event?.startDate) {
    const date = new Date(event.startDate)
    parts.push(
      date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      })
    )
  } else if (event?.startDate) {
    const date = new Date(event.startDate)
    parts.push(
      date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      })
    )
  }

  if (event?.startTime) {
    parts.push(event.startTime.substring(0, 5))
  }

  return parts.join(' • ') || 'Дата уточняется'
}

// Загрузка событий
const loadUpcomingEvents = async () => {
  loading.value = true
  error.value = null

  try {
    // Используем прокси вместо прямого URL для избежания CORS
    const response = await $fetch('/api/events/upcoming', {
      params: { limit: limit.value }
    })

    if (Array.isArray(response)) {
      events.value = response
    } else if (response?.data) {
      events.value = response.data
    } else {
      events.value = []
    }

    if (currentIndex.value >= events.value.length) {
      currentIndex.value = 0
    }

  } catch (err) {
    console.error('Ошибка загрузки событий:', err)
    error.value = 'Не удалось загрузить события'
    events.value = []
  } finally {
    loading.value = false
  }
}

// Повторная попытка загрузки
const retryLoad = () => {
  loadUpcomingEvents()
}

// Навигация
const prevSlide = () => {
  if (!events.value.length) return
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetAutoplay()
  }
}

const nextSlide = () => {
  if (!events.value.length) return
  if (currentIndex.value < events.value.length - 1) {
    currentIndex.value++
    resetAutoplay()
  }
}

const goToSlide = (index: number) => {
  if (index >= 0 && index < events.value.length) {
    currentIndex.value = index
    resetAutoplay()
  }
}

// Автопрокрутка
const startAutoplay = () => {
  if (isPaused.value) return
  if (!events.value.length) return

  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }

  autoplayInterval = setInterval(() => {
    if (isPaused.value) return
    if (!events.value.length) return

    if (currentIndex.value < events.value.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = 0
    }
  }, 6000)
}

const resetAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    startAutoplay()
  }
}

const pauseAutoplay = () => {
  isPaused.value = true
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

const resumeAutoplay = () => {
  isPaused.value = false
  if (!autoplayInterval && events.value.length) {
    startAutoplay()
  }
}

// Жизненный цикл
onMounted(async () => {
  await loadUpcomingEvents()
  startAutoplay()
})

onUnmounted(() => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
})
</script>

<style scoped>
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