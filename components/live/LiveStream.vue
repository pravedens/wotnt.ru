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
        <div v-if="streamData && streamUrl" class="relative video-player-wrapper">
          <iframe
            ref="playerIframe"
            :src="streamUrl"
            class="w-full aspect-video"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            :title="streamTitle"
            referrerpolicy="strict-origin-when-cross-origin"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
            loading="lazy"
            @load="onPlayerLoad"
          ></iframe>
          
          <!-- Кнопка обновления трансляции -->
          <button
            @click="refreshStream"
            class="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition z-10"
            title="Обновить трансляцию"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
        
        <!-- Нет активной трансляции (заглушка, но компонент не показывается, если нет трансляции) -->
        <div v-else class="aspect-video bg-gradient-to-br from-blue-800 to-purple-800 flex items-center justify-center">
          <div class="text-center p-8">
            <svg class="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p class="text-white/80 text-lg mb-2">Сейчас нет активной трансляции</p>
            <p class="text-white/60 text-sm">
              Ближайшая трансляция: воскресенье в 11:00
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveStream, LiveStreamResponse } from '~/types/live'

// ============================================
// РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ
// ============================================
const streamData = ref<LiveStream | null>(null)
const hasActiveStream = ref(false)
const streamUrl = ref<string | null>(null)
const streamTitle = ref('')
const isLiveActive = ref(false)
const playerIframe = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)

let refreshInterval: NodeJS.Timeout | null = null
let saveProgressInterval: NodeJS.Timeout | null = null

// ============================================
// ЗАГРУЗКА СТАТУСА ТРАНСЛЯЦИИ (ТОЛЬКО НА КЛИЕНТЕ)
// ============================================
const loadStreamStatus = async () => {
  try {
    const response = await $fetch<LiveStreamResponse>('/api/live/current')
    
    if (response.success && response.data) {
      streamData.value = response.data
      hasActiveStream.value = true
      isLiveActive.value = response.data.isActive
      streamTitle.value = response.data.title || ''
      
      if (response.data.isActive && response.data.embedUrl) {
        const savedTime = getSavedProgress()
        streamUrl.value = buildStreamUrl(response.data.embedUrl, savedTime)
      } else {
        streamUrl.value = null
      }
    } else {
      streamData.value = null
      hasActiveStream.value = false
      isLiveActive.value = false
      streamUrl.value = null
    }
  } catch (err) {
    console.error('Error loading live stream status:', err)
    hasActiveStream.value = false
  } finally {
    loading.value = false
  }
}

// ============================================
// РАБОТА С ПРОГРЕССОМ ПРОСМОТРА
// ============================================
const getStorageKey = (): string => {
  return 'live_stream_progress'
}

const saveProgress = (time: number) => {
  if (process.client && time > 0) {
    localStorage.setItem(getStorageKey(), time.toString())
  }
}

const getSavedProgress = (): number => {
  if (process.client) {
    const saved = localStorage.getItem(getStorageKey())
    return saved ? parseInt(saved, 10) : 0
  }
  return 0
}

const clearProgress = () => {
  if (process.client) {
    localStorage.removeItem(getStorageKey())
  }
}

// ============================================
// ФОРМИРОВАНИЕ URL ПЛЕЕРА
// ============================================
const buildStreamUrl = (baseUrl: string, savedTime: number = 0): string => {
  let url = baseUrl
  
  const params = new URLSearchParams()
  params.set('autoplay', '1')
  
  if (savedTime > 0) {
    params.set('start', savedTime.toString())
    params.set('startTime', savedTime.toString())
  }
  
  const paramString = params.toString()
  if (paramString) {
    url += (url.includes('?') ? '&' : '?') + paramString
  }
  
  return url
}

// ============================================
// ОБРАБОТЧИКИ ПЛЕЕРА
// ============================================
const onPlayerLoad = () => {
  if (saveProgressInterval) {
    clearInterval(saveProgressInterval)
  }
  
  saveProgressInterval = setInterval(() => {
    const iframe = playerIframe.value
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'player:getCurrentTime' }, '*')
    }
  }, 5000)
}

const refreshStream = () => {
  if (streamUrl.value && streamData.value?.embedUrl) {
    const savedTime = getSavedProgress()
    streamUrl.value = buildStreamUrl(streamData.value.embedUrl, savedTime)
  }
}

// ============================================
// ОБНОВЛЕНИЕ СТАТУСА
// ============================================
const startStatusRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = setInterval(() => {
    loadStreamStatus()
  }, 30000)
}

// ============================================
// СОХРАНЕНИЕ ПРОГРЕССА ПРИ ЗАКРЫТИИ
// ============================================
const handleBeforeUnload = () => {
  if (playerIframe.value && playerIframe.value.contentWindow) {
    playerIframe.value.contentWindow.postMessage({ type: 'player:getCurrentTime' }, '*')
  }
}

// ============================================
// СЛУШАТЕЛИ СООБЩЕНИЙ ОТ ПЛЕЕРА
// ============================================
if (process.client) {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'player:currentTime') {
      const time = Math.floor(event.data.time)
      if (time > 0) {
        saveProgress(time)
      }
    }
  })
}

// ============================================
// ЖИЗНЕННЫЙ ЦИКЛ
// ============================================
onMounted(async () => {
  await loadStreamStatus()
  startStatusRefresh()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (saveProgressInterval) {
    clearInterval(saveProgressInterval)
  }
  window.removeEventListener('beforeunload', handleBeforeUnload)
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