<template>
  <div 
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    
    <!-- Модальное окно -->
    <div class="relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20">
      
      <div class="p-6 overflow-y-auto max-h-[90vh]">
        <!-- Заголовок -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white">
              {{ mode === 'create' ? 'Создание события' : 'Редактирование события' }}
            </h2>
            <p v-if="mode === 'create' && localForm.startDate" class="text-white/60 text-sm mt-1">
              {{ formattedDate }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="text-white/60 hover:text-white transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Форма -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Название -->
          <div>
            <label class="block text-white/80 mb-2">Название *</label>
            <input
              v-model="localForm.title"
              type="text"
              required
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
              :disabled="saving"
              placeholder="Введите название события"
            />
          </div>
          
          <!-- 👇 ПОЛЕ ДАТЫ - ТОЛЬКО ДЛЯ РЕДАКТИРОВАНИЯ -->
          <div v-if="mode === 'edit'">
            <label class="block text-white/80 mb-2">Дата *</label>
            <input
              v-model="localForm.startDate"
              type="date"
              required
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
              :disabled="saving"
            />
            <p class="text-white/40 text-xs mt-1">
              Изменение даты может повлиять на статус публикации
            </p>
          </div>
          
          <!-- Скрытое поле даты для создания (чтобы data передавалась) -->
          <input v-else type="hidden" name="startDate" :value="localForm.startDate" />
          
          <!-- Время -->
          <div>
            <label class="block text-white/80 mb-2">Время</label>
            <input
              v-model="localForm.startTime"
              type="time"
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
              :disabled="saving"
            />
          </div>
          
          <!-- Цвет -->
          <div>
            <label class="block text-white/80 mb-2">Цвет в календаре</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="color in colors"
                :key="color.value"
                type="button"
                class="w-8 h-8 rounded-full transition hover:scale-110"
                :style="{ backgroundColor: color.value }"
                :class="{ 'ring-2 ring-white ring-offset-2 ring-offset-blue-900': localForm.color === color.value }"
                @click="localForm.color = color.value"
              ></button>
            </div>
          </div>
          
          <!-- Изображение -->
          <div>
            <label class="block text-white/80 mb-2">Изображение</label>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500/20 file:text-white hover:file:bg-blue-500/30"
              :disabled="saving"
            />
            <div v-if="imagePreview" class="mt-2">
              <img :src="imagePreview" class="h-20 rounded-lg" />
            </div>
          </div>
          
          <!-- Краткое описание -->
          <div>
            <label class="block text-white/80 mb-2">Краткое описание</label>
            <textarea
              v-model="localForm.description"
              rows="3"
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
              :disabled="saving"
              placeholder="Краткое описание события..."
            ></textarea>
          </div>
          
          <!-- Полное описание -->
          <div>
            <label class="block text-white/80 mb-2">Полное описание</label>
            <textarea
              v-model="localForm.content"
              rows="5"
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
              :disabled="saving"
              placeholder="Подробное описание события..."
            ></textarea>
          </div>
          
          <!-- Доп. информация -->
          <div>
            <label class="block text-white/80 mb-2">Доп. информация</label>
            <textarea
              v-model="localForm.info"
              rows="3"
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
              :disabled="saving"
              placeholder="Дополнительная информация..."
            ></textarea>
          </div>
          
          <!-- СЧЁТЧИК КАРУСЕЛИ -->
          <div class="bg-white/5 rounded-lg p-4 border border-white/10">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-white font-medium">Карусель на главной</h4>
              <span 
                class="text-sm px-2 py-1 rounded-full"
                :class="carouselStatusClass"
                v-if="!statsLoading"
              >
                {{ carouselStats.in_carousel }} из {{ carouselStats.limit }}
              </span>
              <span v-else class="text-sm text-white/50">Загрузка...</span>
            </div>
            
            <!-- Прогресс-бар -->
            <div v-if="!statsLoading" class="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div 
                class="h-full transition-all duration-300"
                :class="progressBarClass"
                :style="{ width: `${carouselProgress}%` }"
              ></div>
            </div>
            
            <!-- Информация о свободных местах -->
            <p v-if="!statsLoading" class="text-white/60 text-xs mb-3">
              <span v-if="carouselStats.available > 0">
                Свободно мест: {{ carouselStats.available }}
              </span>
              <span v-else class="text-yellow-300">
                ⚠️ Лимит достигнут. Чтобы добавить это событие, уберите другое.
              </span>
            </p>
            
            <!-- Чекбокс карусели -->
            <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input
                id="show_in_carousel"
                v-model="localForm.show_in_carousel"
                type="checkbox"
                class="w-4 h-4 bg-white/10 border border-white/20 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                :disabled="saving || statsLoading || (!localForm.show_in_carousel && carouselStats.available <= 0)"
              />
              <label for="show_in_carousel" class="text-white/80 text-sm flex-1">
                Показывать в карусели на главной странице
              </label>
            </div>
            
            <!-- ЧЕКБОКС ПУБЛИКАЦИИ -->
            <div class="bg-white/5 rounded-lg p-4 border border-white/10 mt-4">
              <div class="flex items-center gap-3">
                <input
                  id="is_published"
                  v-model="localForm.is_published"
                  type="checkbox"
                  class="w-4 h-4 bg-white/10 border border-white/20 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  :disabled="saving"
                />
                <label for="is_published" class="text-white/80 text-sm flex-1">
                  Опубликовано (видно всем пользователям)
                </label>
              </div>
              <p class="text-white/40 text-xs mt-2 ml-7">
                Если снять галочку, событие увидят только администраторы
              </p>
              <p v-if="mode === 'edit' && localForm.is_past" class="text-yellow-300 text-xs mt-2 ml-7">
                ⚠️ Это прошедшее событие. При сохранении оно автоматически снимется с публикации.
              </p>
            </div>
          </div>
          
          <!-- 🗑️ КНОПКА УДАЛЕНИЯ (только для режима редактирования) -->
          <div v-if="mode === 'edit'" class="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
            <button
              @click="confirmDelete"
              type="button"
              class="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2 text-sm"
              :disabled="deleting"
            >
              <svg v-if="!deleting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{{ deleting ? 'Удаление...' : 'Удалить событие' }}</span>
            </button>
            <span class="text-white/40 text-xs">Это действие нельзя отменить</span>
          </div>
          
          <!-- Ошибка -->
          <div v-if="error" class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 whitespace-pre-wrap">
            {{ error }}
          </div>
          
          <!-- Кнопки -->
          <div class="flex justify-end gap-4 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              :disabled="saving"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
              :disabled="saving"
            >
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCarouselStats } from '~/composables/useCarouselStats'

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  event?: any
  date?: string
  canEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const colors = [
  { value: '#3b82f6', name: 'Синий' },
  { value: '#ef4444', name: 'Красный' },
  { value: '#10b981', name: 'Зеленый' },
  { value: '#f59e0b', name: 'Оранжевый' },
  { value: '#8b5cf6', name: 'Фиолетовый' },
  { value: '#ec4899', name: 'Розовый' },
]

const localForm = ref({
  title: '',
  startDate: '',
  startTime: '',
  color: '#3b82f6',
  description: '',
  content: '',
  info: '',
  show_in_carousel: false,
  is_published: true,
  is_past: false,
  thumbnail: null as File | null
})

const imagePreview = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// Статистика карусели
const { stats: carouselStats, loading: statsLoading, loadStats } = useCarouselStats()

// Прогресс в процентах
const carouselProgress = computed(() => {
  if (!carouselStats.value.limit) return 0
  return (carouselStats.value.in_carousel / carouselStats.value.limit) * 100
})

// Класс для статуса
const carouselStatusClass = computed(() => {
  const available = carouselStats.value.available
  
  if (available <= 0) return 'bg-red-500/20 text-red-200 border border-red-500/50'
  if (available <= 2) return 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/50'
  return 'bg-green-500/20 text-green-200 border border-green-500/50'
})

// Класс для прогресс-бара
const progressBarClass = computed(() => {
  const available = carouselStats.value.available
  
  if (available <= 0) return 'bg-red-500'
  if (available <= 2) return 'bg-yellow-500'
  return 'bg-green-500'
})

// Форматированная дата для отображения
const formattedDate = computed(() => {
  if (!localForm.value.startDate) return ''
  const d = new Date(localForm.value.startDate)
  return d.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
})

// Получение URL изображения из S3
const getImageUrl = (thumbnail: string) => {
  if (!thumbnail) return null
  
  // Если уже полный URL
  if (thumbnail.startsWith('http')) {
    return thumbnail
  }
  
  // Если путь начинается с events/thumbnails/ (новый формат S3)
  if (thumbnail.startsWith('events/thumbnails/')) {
    return `https://storage.yandexcloud.net/wotgospel-media/${thumbnail}`
  }
  
  // Если путь начинается с public/ (старый формат)
  if (thumbnail.startsWith('public/')) {
    return `https://wotgospel.ru/storage/${thumbnail.replace('public/', '')}`
  }
  
  // Fallback для старого формата
  return `https://wotgospel.ru/storage/${thumbnail.replace('public/', '')}`
}

// Определяем, прошедшая ли дата
const isPastDate = (dateStr: string) => {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(dateStr)
  eventDate.setHours(0, 0, 0, 0)
  return eventDate < today
}

// Следим за изменением даты
watch(() => localForm.value.startDate, (newDate) => {
  if (newDate) {
    localForm.value.is_past = isPastDate(newDate)
  }
})

// Следим за props.visible
watch(() => props.visible, (visible) => {
  if (visible) {
    loadStats()
    
    if (props.mode === 'create') {
      // Для создания нового события
      if (props.date) {
        localForm.value = {
          title: '',
          startDate: props.date,
          startTime: '',
          color: '#3b82f6',
          description: '',
          content: '',
          info: '',
          show_in_carousel: false,
          is_published: true,
          is_past: isPastDate(props.date),
          thumbnail: null
        }
      } else {
        const today = new Date().toISOString().split('T')[0]
        localForm.value.startDate = today
        localForm.value.is_past = isPastDate(today)
      }
    } 
    else if (props.mode === 'edit' && props.event) {
      // Форматируем время
      let formattedTime = ''
      if (props.event.startTime) {
        if (props.event.startTime.includes('T')) {
          formattedTime = props.event.startTime.substring(11, 16)
        } else if (props.event.startTime.includes(':')) {
          formattedTime = props.event.startTime.substring(0, 5)
        } else {
          formattedTime = props.event.startTime
        }
      }
      
      const showInCarousel = props.event.show_in_carousel === true || 
                             props.event.show_in_carousel === 1 || 
                             props.event.show_in_carousel === '1' || 
                             props.event.show_in_carousel === 'true'
      
      const eventDate = props.event.startDate?.split(' ')[0] || ''
      
      localForm.value = {
        title: props.event.title || '',
        startDate: eventDate,
        startTime: formattedTime,
        color: props.event.color || '#3b82f6',
        description: props.event.description || '',
        content: props.event.content || '',
        info: props.event.info || '',
        show_in_carousel: showInCarousel,
        is_published: props.event.is_published === true,
        is_past: isPastDate(eventDate) || props.event.is_past || false,
        thumbnail: null
      }
      
      // Используем getImageUrl для поддержки S3
      if (props.event.thumbnail) {
        imagePreview.value = getImageUrl(props.event.thumbnail)
      }
    }
  } else {
    // Очищаем форму при закрытии
    localForm.value = {
      title: '',
      startDate: '',
      startTime: '',
      color: '#3b82f6',
      description: '',
      content: '',
      info: '',
      show_in_carousel: false,
      is_published: true,
      is_past: false,
      thumbnail: null
    }
    imagePreview.value = null
    error.value = ''
    
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}, { immediate: true })

// Функция для получения CSRF-токена
const getCsrfToken = (): string | null => {
  if (!process.client) return null
  
  const cookies = document.cookie.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value)
    }
  }
  return null
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    localForm.value.thumbnail = input.files[0]
    imagePreview.value = URL.createObjectURL(input.files[0])
  }
}

const handleSubmit = async () => {
  saving.value = true
  error.value = ''
  
  try {
    if (!localForm.value.startDate) {
      error.value = 'Дата не выбрана'
      saving.value = false
      return
    }
    
    const xsrfToken = getCsrfToken()
    
    const formData = new FormData()
    
    // Добавляем все поля
    formData.append('startDate', localForm.value.startDate)
    formData.append('title', localForm.value.title)
    formData.append('show_in_carousel', localForm.value.show_in_carousel ? '1' : '0')
    formData.append('is_published', localForm.value.is_published ? '1' : '0')
    
    if (localForm.value.startTime) formData.append('startTime', localForm.value.startTime)
    if (localForm.value.color) formData.append('color', localForm.value.color)
    if (localForm.value.description) formData.append('description', localForm.value.description)
    if (localForm.value.content) formData.append('content', localForm.value.content)
    if (localForm.value.info) formData.append('info', localForm.value.info)
    
    if (localForm.value.thumbnail instanceof File) {
      formData.append('thumbnail', localForm.value.thumbnail)
    }
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${useAuthStore().token}`,
      'X-XSRF-TOKEN': xsrfToken || '',
      'Accept': 'application/json'
    }
    
    let response
    
    if (props.mode === 'create') {
      response = await $fetch('/api/events', {
        method: 'POST',
        body: formData,
        headers
      })
    } else {
      response = await $fetch(`/api/events/${props.event.id}`, {
        method: 'POST',
        body: formData,
        headers: {
          ...headers,
          'X-HTTP-Method-Override': 'PUT'
        }
      })
    }
    
    await loadStats()
    emit('saved')
    emit('close')
  } catch (err: any) {
    console.error('❌ Save error:', err)
    
    if (err.response?._data) {
      const errorData = err.response._data
      if (errorData.errors) {
        const firstErrorField = Object.keys(errorData.errors)[0]
        const firstErrorMessage = errorData.errors[firstErrorField]?.[0]
        error.value = firstErrorMessage || 'Ошибка валидации'
      } else if (errorData.message) {
        error.value = errorData.message
      } else {
        error.value = JSON.stringify(errorData)
      }
    } else {
      error.value = err.message || 'Ошибка сохранения'
    }
  } finally {
    saving.value = false
  }
}

const deleting = ref(false)

const confirmDelete = () => {
  if (confirm('Вы уверены, что хотите удалить это событие? Это действие нельзя отменить.')) {
    deleteEvent()
  }
}

const deleteEvent = async () => {
  deleting.value = true
  error.value = ''
  
  try {
    const xsrfToken = getCsrfToken()
    
    await $fetch(`/api/events/${props.event.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${useAuthStore().token}`,
        'X-XSRF-TOKEN': xsrfToken || '',
        'Accept': 'application/json'
      },
      credentials: 'include'
    })
    
    await loadStats()
    emit('saved')
    emit('close')
    
  } catch (err: any) {
    console.error('❌ Delete error:', err)
    error.value = err.data?.message || 'Ошибка при удалении'
  } finally {
    deleting.value = false
  }
}
</script>