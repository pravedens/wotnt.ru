<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
    <!-- Блок для неавторизованных пользователей -->
    <div v-if="!isAuthenticated" class="flex items-center justify-between">
      <div class="flex items-center gap-4 flex-1">
        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-white font-medium truncate">
            {{ audioFilename || 'Аудио проповедь' }}
          </h4>
          <div class="flex items-center gap-3 text-sm text-white/60">
            <span>{{ audioSize }}</span>
          </div>
        </div>
      </div>
      
      <NuxtLink 
        :to="loginUrl"
        class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all flex items-center gap-2 flex-shrink-0 ml-4"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span class="hidden sm:inline">Войти</span>
      </NuxtLink>
    </div>

    <!-- Блок для авторизованных пользователей (оригинальный контент) -->
    <template v-else>
      <div class="flex items-center gap-4">
        <button
          @click="togglePlay"
          class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center hover:scale-105 transition flex-shrink-0"
        >
          <svg v-if="isPlaying" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
          <svg v-else class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        <div class="flex-1 min-w-0">
          <h4 class="text-white font-medium truncate">
            {{ audioFilename || 'Аудио проповедь' }}
          </h4>
          <div class="flex items-center gap-3 text-sm text-white/60">
            <span>{{ audioSize }}</span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ currentTime }} / {{ totalTime }}
            </span>
          </div>
        </div>

        <a
          :href="audioUrl"
          download
          class="p-2 hover:bg-white/10 rounded-lg transition flex-shrink-0"
          :title="`Скачать ${audioFilename}`"
        >
          <svg class="w-5 h-5 text-white/60 hover:text-white" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      </div>

      <div class="mt-3">
        <input
          type="range"
          v-model="progress"
          min="0"
          max="100"
          class="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          @input="seek"
        />
        <div class="flex justify-between text-xs text-white/40 mt-1 md:hidden">
          <span>{{ currentTime }}</span>
          <span>{{ totalTime }}</span>
        </div>
      </div>

      <audio
        ref="audio"
        :src="audioUrl"
        preload="metadata"
        @loadedmetadata="onLoaded"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  audioUrl: string
  audioFilename?: string
  audioSize?: string
}>()

const authStore = useAuthStore()
const { isAuthenticated, initialized } = storeToRefs(authStore)

const route = useRoute()

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const progress = ref(0)
const currentTime = ref('0:00')
const totalTime = ref('0:00')

// URL для логина с редиректом на текущую страницу
const loginUrl = computed(() => {
  const currentPath = encodeURIComponent(route.fullPath)
  return `/auth/login?redirect=${currentPath}`
})

// Инициализируем auth store
onMounted(async () => {
  if (!initialized.value) {
    await authStore.init()
  }
})

const togglePlay = async () => {
  if (!audio.value) return

  if (isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
  } else {
    try {
      await audio.value.play()
      isPlaying.value = true
    } catch (e) {
      console.error('Playback error:', e)
    }
  }
}

const seek = () => {
  if (!audio.value || !audio.value.duration) return
  audio.value.currentTime = (audio.value.duration * progress.value) / 100
}

const onLoaded = () => {
  if (!audio.value || !audio.value.duration) return
  totalTime.value = formatTime(audio.value.duration)
}

const onTimeUpdate = () => {
  if (!audio.value || !audio.value.duration) return

  progress.value = (audio.value.currentTime / audio.value.duration) * 100
  currentTime.value = formatTime(audio.value.currentTime)
}

const onEnded = () => {
  isPlaying.value = false
  progress.value = 0
  currentTime.value = '0:00'
}

watch(() => props.audioUrl, () => {
  if (!audio.value) return
  audio.value.pause()
  audio.value.currentTime = 0
  isPlaying.value = false
  progress.value = 0
  currentTime.value = '0:00'
})

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}

input[type=range]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
}
</style>