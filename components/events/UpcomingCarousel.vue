<template>
  <Head>
    <link 
      v-if="events.length && events[0]?.thumbnail"
      rel="preload" 
      as="image" 
      :href="getImageUrl(events[0].thumbnail) ?? undefined"
      fetchpriority="high"
    />
  </Head>

  <div class="upcoming-carousel-wrapper">
    <div class="upcoming-carousel-container">
      <!-- Заголовок -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6 px-4">
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
      <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 sm:p-8 text-center mx-4">
        <p class="text-red-200 text-sm sm:text-base">{{ error }}</p>
        <button
          @click="retryLoad"
          class="mt-4 px-4 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Попробовать снова
        </button>
      </div>

      <!-- Нет событий -->
      <div v-else-if="events.length === 0" class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 sm:p-12 text-center mx-4">
        <p class="text-white/80 text-base sm:text-lg">Нет главных событий</p>
      </div>

      <!-- Карусель с поддержкой свайпа -->
      <div 
        v-else 
        class="carousel-main relative"
        @mouseenter="pauseAutoplay"
        @mouseleave="resumeAutoplay"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Текущий слайд -->
        <div class="transition-all duration-500 ease-out">
          <NuxtLink
            :to="`/events/${currentEvent?.slug || ''}`"
            class="block group"
          >
            <div class="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all">
              
              <!-- Изображение с затемнением -->
              <div class="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                <NuxtImg
                  v-if="currentEvent?.thumbnail"
                  :src="getImageUrl(currentEvent.thumbnail) ?? undefined"
                  :alt="currentEvent?.title || 'Событие'"
                  width="1024"
                  height="768"
                  format="webp"
                  quality="80"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  fetchpriority="high"
                  loading="eager"
                  decoding="async"
                  @error="handleImageError"
                />
                <div v-else class="w-full aspect-video bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
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

              <!-- Индикатор "только для прихожан" -->
              <div 
                v-if="currentEvent?.members_only && !isAdmin"
                class="absolute top-3 left-3 sm:top-4 sm:left-4 bg-yellow-500/80 backdrop-blur-sm px-2 py-1 rounded-full border border-yellow-300/50 text-white text-xs z-10"
              >
                🔒 Только для прихожан
              </div>

              <!-- Контент поверх изображения -->
              <div class="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3 sm:p-6 md:p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                <!-- Дата и время -->
                <div class="flex items-center gap-1 sm:gap-2 text-white/90 text-xs sm:text-sm md:text-base mb-0.5 sm:mb-2">
                  <svg class="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ currentEventDate }}</span>
                </div>

                <!-- Заголовок -->
                <h3 class="text-sm sm:text-xl md:text-2xl font-bold text-white mb-0.5 sm:mb-2 group-hover:text-blue-300 transition line-clamp-1 sm:line-clamp-2">
                  {{ currentEvent?.title || 'Без названия' }}
                </h3>

                <!-- Описание (только на планшетах и выше) -->
                <p v-if="currentEvent?.description && !isMobile" class="text-white/70 text-xs sm:text-sm line-clamp-2 max-w-2xl mb-1 sm:mb-3">
                  {{ currentEvent?.description }}
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
          class="carousel-nav prev absolute top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 border border-white/30 z-20 transition-opacity duration-300"
          :class="{ 
            'left-2 w-8 h-8 text-lg sm:w-10 sm:h-10 sm:text-xl opacity-70': isMobile,
            'left-4 w-10 h-10 text-xl lg:w-12 lg:h-12 lg:text-2xl opacity-0 group-hover:opacity-100': !isMobile
          }"
          aria-label="Предыдущее"
        >
          ←
        </button>

        <button
          @click="nextSlide"
          class="carousel-nav next absolute top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 border border-white/30 z-20 transition-opacity duration-300"
          :class="{ 
            'right-2 w-8 h-8 text-lg sm:w-10 sm:h-10 sm:text-xl opacity-70': isMobile,
            'right-4 w-10 h-10 text-xl lg:w-12 lg:h-12 lg:text-2xl opacity-0 group-hover:opacity-100': !isMobile
          }"
          aria-label="Следующее"
        >
          →
        </button>

        <!-- Пагинация (точки) -->
        <div class="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-4">
          <button
            v-for="(_, index) in events"
            :key="`dot-${index}`"
            @click="goToSlide(index)"
            class="h-1 sm:h-2 rounded-full border border-white/20 transition-colors duration-300"
            :class="currentIndex === index ? 'w-4 sm:w-8 bg-white' : 'w-1 sm:w-2 bg-white/30 hover:bg-white/50'"
            :aria-label="`Перейти к событию ${index + 1}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'
import { useWindowSize } from '@vueuse/core'
import { useApi } from '~/composables/useApi'  // ✅ ДОБАВЛЕН ИМПОРТ

// ============================================
// ПОЛУЧАЕМ КОНФИГУРАЦИЮ
// ============================================
const config = useRuntimeConfig()
const { apiBase, storageUrl, carouselLimit } = config.public
const { $api } = useApi()  // ✅ ДОБАВЛЕНО

// Интерфейсы
interface Event {
  id: number
  title: string
  slug: string
  thumbnail?: string
  description?: string
  startDate?: string
  startTime?: string
  time?: string
  members_only?: boolean
  is_published?: boolean
  is_past?: boolean
}

interface EventsResponse {
  data: Event[]
}

// Props
const props = defineProps<{
  limit?: number
}>()

// Composables
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

// Свайп
const touchStartX = ref(0)
const touchEndX = ref(0)
const minSwipeDistance = 50

// Вычисляемые значения
const limit = computed(() => props.limit || carouselLimit || 6)
const isMobile = computed(() => width.value < 768)

const currentEvent = computed<Event | undefined>(() => {
  return events.value[currentIndex.value]
})

const currentEventDate = computed(() => {
  const event = currentEvent.value
  if (!event) return 'Дата уточняется'
  
  const parts: string[] = []
  if (event.startDate) {
    const date = new Date(event.startDate)
    parts.push(
      date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      })
    )
  }
  const timeValue = event.startTime || event.time
  if (timeValue && timeValue !== '') {
    parts.push(timeValue)
  }
  return parts.join(' • ') || 'Дата уточняется'
})

const getImageUrl = (thumbnail: string | undefined): string | undefined => {
  if (!thumbnail) return undefined

  if (thumbnail.startsWith('http')) {
    return thumbnail
  }

  if (thumbnail.startsWith('events/thumbnails/')) {
    return `${storageUrl}/${thumbnail}`
  }

  if (thumbnail.startsWith('public/')) {
    return `${apiBase}/storage/${thumbnail.replace('public/', '')}`
  }

  return `${apiBase}/storage/${thumbnail}`
}

const handleImageError = (event: any) => {
  try {
    const target = event?.target || event?.currentTarget || event
    if (target && target.tagName && target.tagName === 'IMG') {
      target.style.display = 'none'
    }
  } catch (e) {
    console.debug('Image error handling failed:', e)
  }
}

// Загрузка событий
const loadUpcomingEvents = async () => {
  loading.value = true
  error.value = null

  try {
    // ✅ Используем $api вместо $fetch
    const response = await $api<EventsResponse>('/events/upcoming', {
      query: { limit: limit.value }  // ✅ используем query вместо params
    })

    if (response && Array.isArray(response)) {
      events.value = response as unknown as Event[]
    } else if (response?.data) {
      events.value = response.data
    } else {
      events.value = []
    }

    if (currentIndex.value >= events.value.length && events.value.length > 0) {
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
  if (events.value.length === 0) return
  currentIndex.value = currentIndex.value === 0 
    ? events.value.length - 1 
    : currentIndex.value - 1
  resetAutoplay()
}

const nextSlide = () => {
  if (events.value.length === 0) return
  currentIndex.value = currentIndex.value === events.value.length - 1 
    ? 0 
    : currentIndex.value + 1
  resetAutoplay()
}

const goToSlide = (index: number) => {
  if (index >= 0 && index < events.value.length) {
    currentIndex.value = index
    resetAutoplay()
  }
}

// Свайп
const onTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  if (touch) {
    touchStartX.value = touch.clientX
  }
}

const onTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0]
  if (touch) {
    touchEndX.value = touch.clientX
  }
}

const onTouchEnd = () => {
  const deltaX = touchStartX.value - touchEndX.value
  
  if (Math.abs(deltaX) < minSwipeDistance) return
  
  if (deltaX > 0) {
    nextSlide()
  } else {
    prevSlide()
  }
  
  touchStartX.value = 0
  touchEndX.value = 0
}

// Автопрокрутка
const startAutoplay = () => {
  if (isPaused.value) return
  if (events.value.length === 0) return

  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }

  autoplayInterval = setInterval(() => {
    if (isPaused.value) return
    if (events.value.length === 0) return
    currentIndex.value = (currentIndex.value + 1) % events.value.length
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
  if (!autoplayInterval && events.value.length > 0) {
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
.upcoming-carousel-wrapper {
  width: 100%;
  margin: 0 auto;
}

.upcoming-carousel-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .upcoming-carousel-wrapper {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
  
  .upcoming-carousel-container {
    padding: 0;
  }
  
  .carousel-main {
    padding: 0;
  }
  
  .carousel-main :deep(.rounded-xl) {
    border-radius: 0;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .upcoming-carousel-wrapper {
    width: 100%;
    margin: 0;
  }
  
  .upcoming-carousel-container {
    max-width: 100%;
    padding: 0 20px;
  }
  
  .carousel-nav {
    opacity: 0.7 !important;
  }
  
  .carousel-nav.prev {
    left: 10px !important;
  }
  
  .carousel-nav.next {
    right: 10px !important;
  }
}

@media (min-width: 1025px) {
  .upcoming-carousel-wrapper {
    display: flex;
    justify-content: center;
  }
  
  .carousel-main {
    position: relative;
  }
  
  .carousel-main:hover .carousel-nav {
    opacity: 0.8 !important;
  }
  
  .carousel-main:hover .carousel-nav:hover {
    opacity: 1 !important;
  }
  
  .carousel-nav {
    transition: opacity 0.3s ease, background-color 0.3s ease;
  }
  
  .carousel-nav.prev {
    left: 20px;
  }
  
  .carousel-nav.next {
    right: 20px;
  }
}

img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}

@media (max-width: 768px) {
  img {
    min-height: auto;
    max-height: none;
  }
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

@media (max-width: 768px) {
  .carousel-nav {
    display: none !important;
  }
}
</style>