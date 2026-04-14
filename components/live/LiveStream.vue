<template>
  <div class="container mx-auto px-4 mb-16">
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
              
              <!-- Название трансляции (всегда показывается, если есть) -->
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
              
              <!-- Бейдж LIVE -->
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
      
      <!-- Состояние загрузки -->
      <div v-if="initialLoading" class="aspect-video bg-gradient-to-br from-blue-800 to-purple-800 flex items-center justify-center">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <p class="text-white/80">Загрузка трансляции...</p>
        </div>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error && !streamData" class="aspect-video bg-gradient-to-br from-blue-800 to-purple-800 flex items-center justify-center">
        <div class="text-center p-8">
          <svg class="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-white/80 mb-2">{{ error }}</p>
        </div>
      </div>
      
      <!-- Видео плеер -->
      <div v-else-if="streamData && streamUrl" class="relative">
        <iframe
          ref="playerIframe"
          :src="streamUrl"
          class="w-full aspect-video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          :title="streamTitle"
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
      
      <!-- Нет активной трансляции -->
      <div v-else-if="!initialLoading && !streamData" class="aspect-video bg-gradient-to-br from-blue-800 to-purple-800 flex items-center justify-center">
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
</template>

<script setup lang="ts">
import type { LiveStream, LiveStreamResponse } from '~/types/live'

const streamData = ref<LiveStream | null>(null)
const initialLoading = ref(true)
const loading = ref(false)
const error = ref<string | null>(null)

const streamUrl = ref<string | null>(null)
const streamTitle = ref('')
const isLiveActive = ref(false)
const playerIframe = ref<HTMLIFrameElement | null>(null)

let refreshInterval: NodeJS.Timeout | null = null
let saveProgressInterval: NodeJS.Timeout | null = null

// Сохранение времени просмотра
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

// Формирование URL с параметрами
const buildStreamUrl = (baseUrl: string, savedTime: number = 0): string => {
  let url = baseUrl
  
  // Добавляем параметры
  const params = new URLSearchParams()
  params.set('autoplay', '1')
  
  if (savedTime > 0) {
    params.set('start', savedTime.toString())
    params.set('startTime', savedTime.toString()) // для Rutube
  }
  
  const paramString = params.toString()
  if (paramString) {
    url += (url.includes('?') ? '&' : '?') + paramString
  }
  
  return url
}

// Загрузка статуса трансляции
const loadStreamStatus = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const savedTime = getSavedProgress()
    const params = savedTime > 0 ? { startTime: savedTime } : {}
    
    const response = await $fetch<LiveStreamResponse>('/api/live/current', {
      params
    })
    
    if (response.success && response.data) {
      const newStream = response.data
      const wasUrl = streamUrl.value
      
      isLiveActive.value = newStream.isActive
      streamTitle.value = newStream.title || ''
      
      const newUrl = newStream.isActive && newStream.embedUrl
        ? buildStreamUrl(newStream.embedUrl, savedTime)
        : null
      
      if (newUrl && newUrl !== wasUrl) {
        streamUrl.value = newUrl
        streamData.value = newStream
      } else if (!newUrl && wasUrl) {
        streamUrl.value = null
        streamData.value = null
      } else if (newUrl && wasUrl && streamData.value) {
        streamData.value = newStream
      }
      
      error.value = null
    } else {
      if (streamUrl.value) {
        streamUrl.value = null
        streamData.value = null
      }
      isLiveActive.value = false
      streamTitle.value = ''
      
      if (!streamData.value) {
        error.value = response.message || null
      }
    }
  } catch (err: any) {
    console.error('Error loading live stream status:', err)
    if (!streamData.value) {
      error.value = 'Не удалось загрузить информацию о трансляции'
    }
  } finally {
    loading.value = false
    initialLoading.value = false
  }
}

// Обработчик загрузки плеера
const onPlayerLoad = () => {
  
  // Сохраняем время каждые 5 секунд
  if (saveProgressInterval) {
    clearInterval(saveProgressInterval)
  }
  
  saveProgressInterval = setInterval(() => {
    // Пытаемся получить время из iframe
    const iframe = playerIframe.value
    if (iframe && iframe.contentWindow) {
      // Отправляем запрос на получение времени
      iframe.contentWindow.postMessage({ type: 'player:getCurrentTime' }, '*')
    }
  }, 5000)
}

// Обновление трансляции
const refreshStream = () => {
  if (streamUrl.value) {
    // Сохраняем текущее время перед обновлением
    const iframe = playerIframe.value
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'player:getCurrentTime' }, '*')
    }
    
    // Обновляем URL
    setTimeout(() => {
      if (streamData.value?.embedUrl) {
        const savedTime = getSavedProgress()
        streamUrl.value = buildStreamUrl(streamData.value.embedUrl, savedTime)
      }
    }, 100)
  }
}

// Слушаем сообщения от плеера
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

// Первичная загрузка
const loadStream = async () => {
  initialLoading.value = true
  await loadStreamStatus()
  initialLoading.value = false
}

// Запускаем обновление статуса
const startStatusRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = setInterval(() => {
    loadStreamStatus()
  }, 30000)
}

// Сохраняем время перед закрытием страницы
const handleBeforeUnload = () => {
  if (playerIframe.value && playerIframe.value.contentWindow) {
    playerIframe.value.contentWindow.postMessage({ type: 'player:getCurrentTime' }, '*')
  }
}

onMounted(() => {
  loadStream()
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