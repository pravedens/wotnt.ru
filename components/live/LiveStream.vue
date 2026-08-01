<template>
  <div v-if="hasActiveStream" class="live-stream-wrapper">
    <div class="live-stream-container">
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20">
        <!-- Заголовок с информацией о трансляции -->
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-3">
              <!-- Индикатор LIVE -->
              <div class="relative" v-if="isLiveActive">
                <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div class="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </div>
              
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-2xl font-bold text-white">
                  Прямая трансляция
                </h2>
                
                <span 
                  v-if="streamTitle && streamTitle !== 'Прямая трансляция'" 
                  class="text-white/80 text-lg font-medium"
                >
                  —
                </span>
                <span 
                  v-if="streamTitle && streamTitle !== 'Прямая трансляция'" 
                  class="text-white/80 text-lg font-medium"
                >
                  {{ streamTitle }}
                </span>
                
                <span 
                  v-if="isLiveActive" 
                  class="ml-2 text-sm bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full"
                >
                  LIVE
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-2 text-white/60 text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Богослужение каждое воскресенье в 11:00</span>
            </div>
          </div>
        </div>
        
        <!-- Видео плеер -->
        <ClientOnly>
          <div class="relative video-player-wrapper">
            <iframe
              v-if="streamUrl"
              ref="playerIframe"
              :src="streamUrl"
              class="w-full aspect-video"
              frameborder="0"
              allow="clipboard-write; autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowfullscreen
              :title="streamTitle"
              referrerpolicy="strict-origin-when-cross-origin"
              loading="lazy"
            ></iframe>
            
            <!-- Кнопка обновления трансляции -->
            <button
              v-if="streamUrl"
              @click="refreshStream"
              class="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition z-10"
              title="Обновить трансляцию"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveStream } from '~/types/live'

// ============================================
// ПРОПСЫ
// ============================================
const props = defineProps<{
  streamData: LiveStream | null
}>()

// ============================================
// ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
// ============================================
const hasActiveStream = computed(() => !!props.streamData)
const streamData = computed(() => props.streamData)
const isLiveActive = computed(() => props.streamData?.isActive ?? false)
const streamTitle = computed(() => props.streamData?.title || 'Прямая трансляция')

// ============================================
// СОСТОЯНИЕ
// ============================================
const streamUrl = ref<string | null>(null)
const playerIframe = ref<HTMLIFrameElement | null>(null)

// ============================================
// ФОРМИРОВАНИЕ URL ПЛЕЕРА (ДЛЯ RUTUBE)
// ============================================
const buildStreamUrl = (baseUrl: string): string => {
  if (!import.meta.client) {
    return baseUrl
  }

  try {
    const url = new URL(baseUrl, window.location.origin)

    // Только autoplay для Rutube
    url.searchParams.set('autoplay', '1')

    // Удаляем параметры прогресса (для live они не нужны)
    url.searchParams.delete('start')
    url.searchParams.delete('startTime')
    url.searchParams.delete('t')

    return url.href
  } catch {
    return baseUrl
  }
}

// ============================================
// ОБНОВЛЕНИЕ ТРАНСЛЯЦИИ
// ============================================
const refreshStream = async () => {
  if (!streamData.value?.embedUrl) {
    return
  }

  streamUrl.value = null
  await nextTick()
  streamUrl.value = buildStreamUrl(streamData.value.embedUrl)
}

// ============================================
// ЖИЗНЕННЫЙ ЦИКЛ
// ============================================
onMounted(() => {
  if (streamData.value?.embedUrl) {
    streamUrl.value = buildStreamUrl(streamData.value.embedUrl)
  }
})

// ============================================
// ОЧИСТКА ПРИ РАЗМОНТИРОВАНИИ
// ============================================
onUnmounted(() => {
  streamUrl.value = null
})
</script>

<style scoped>
.live-stream-wrapper {
  width: 100%;
  margin: 0 auto;
}

.live-stream-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 768px) {
  .live-stream-wrapper {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
  
  .live-stream-container {
    padding: 0;
  }
  
  .live-stream-container :deep(.bg-white\/10) {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  
  .live-stream-container :deep(.p-6) {
    padding: 1rem;
  }
  
  .live-stream-container :deep(.text-2xl) {
    font-size: 1.25rem;
  }
  
  .live-stream-container :deep(.text-lg) {
    font-size: 1rem;
  }
  
  .video-player-wrapper :deep(.aspect-video) {
    aspect-ratio: 16 / 9;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .live-stream-wrapper {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
  
  .live-stream-container {
    max-width: 90%;
    padding: 0;
  }
  
  .live-stream-container :deep(.bg-white\/10) {
    border-radius: 1rem;
  }
}

@media (min-width: 1025px) {
  .live-stream-wrapper {
    display: flex;
    justify-content: center;
  }
}
</style>