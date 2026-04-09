<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
    <div class="flex items-center gap-4">
      <!-- Иконка -->
      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
        <svg class="w-6 h-6 text-white" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="isPdf" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      <!-- Информация -->
      <div class="flex-1 min-w-0">
        <h4 class="text-white font-medium truncate">
          {{ displayName }}
        </h4>
        <div class="flex items-center gap-3 text-sm text-white/60">
          <span>{{ fileSize }}</span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ fileType }}
          </span>
        </div>
      </div>
      
      <!-- Кнопки -->
      <div class="flex gap-2 flex-shrink-0 flex-wrap justify-end">
        <!-- Кнопка просмотра для Word (Google Docs вместо Microsoft) -->
        <a
          v-if="isWord && !isMobile"
          :href="googleDocsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-all flex items-center gap-2 border border-purple-500/30"
          title="Просмотреть через Google Docs"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="hidden sm:inline">Просмотр</span>
        </a>
        
        <!-- Кнопка просмотра для PDF -->
        <a
          v-if="isPdf"
          :href="fileUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-all flex items-center gap-2 border border-blue-500/30"
          title="Открыть PDF"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span class="hidden sm:inline">Открыть</span>
        </a>
        
        <!-- Кнопка скачивания -->
        <a
          :href="fileUrl"
          :download="downloadName"
          class="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-all flex items-center gap-2 border border-green-500/30"
          title="Скачать файл"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">Скачать</span>
        </a>
      </div>
    </div>
    
    <!-- Сообщение для мобильных устройств -->
    <div v-if="isMobile && isWord" class="mt-3 text-center text-yellow-300/70 text-xs">
      ⚡ На мобильных устройствах рекомендуется скачать файл для просмотра
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  fileUrl: string
  filename?: string
  fileSize?: string
  mime?: string
  displayFilename?: string
}>()

// Определяем мобильное устройство
const isMobile = ref(false)

const isWord = computed(() => 
  props.filename?.toLowerCase().endsWith('.doc') ||
  props.filename?.toLowerCase().endsWith('.docx')
)

const isPdf = computed(() => 
  props.mime === 'application/pdf' || props.filename?.toLowerCase().endsWith('.pdf')
)

const fileType = computed(() => {
  if (isPdf.value) return 'PDF'
  if (isWord.value) return 'Word'
  return 'Документ'
})

const iconClass = computed(() => {
  if (isPdf.value) return 'text-red-400'
  if (isWord.value) return 'text-blue-400'
  return 'text-white'
})

// Читаемое имя для отображения
const displayName = computed(() => {
  if (props.displayFilename) {
    return props.displayFilename.replace(/^\d{2}\.\d{2}\.\d{4}\s+/, '')
  }
  return 'Текст проповеди'
})

// Имя для скачивания
const downloadName = computed(() => {
  return props.displayFilename || props.filename || 'document.docx'
})

// Google Docs Viewer (работает лучше на мобильных)
const googleDocsUrl = computed(() => {
  if (!props.fileUrl) return '#'
  return `https://docs.google.com/viewer?url=${encodeURIComponent(props.fileUrl)}&embedded=true`
})

onMounted(() => {
  // Проверяем мобильное устройство
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
})
</script>