<template>
  <Teleport to="body">
    <div 
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="handleClose"
    >
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div class="relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl">
        
        <div class="p-6 overflow-y-auto max-h-[90vh]">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-white">
                {{ mode === 'create' ? 'Создание события' : 'Редактирование события' }}
              </h2>
            </div>
            <button @click="handleClose" class="text-white/60 hover:text-white transition p-2 rounded-lg hover:bg-white/10">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            
            <!-- ==================== НАЗВАНИЕ (всегда видимо) ==================== -->
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
              <p v-if="localForm.is_conference" class="text-white/40 text-xs mt-1">
                Название конференции (будет отображаться на странице события)
              </p>
            </div>
            
            <!-- ==================== КОНФЕРЕНЦИЯ ==================== -->
            <div class="bg-white/5 rounded-lg p-4 border border-white/10">
              <div class="flex items-center gap-3 mb-4">
                <input id="is_conference" v-model="localForm.is_conference" type="checkbox" class="w-4 h-4" :disabled="saving" />
                <label for="is_conference" class="text-white/80 text-sm flex-1">🎤 Это конференция (с несколькими служениями)</label>
              </div>
              
              <div v-if="localForm.is_conference" class="space-y-4">
                <div v-for="(service, index) in localForm.conferenceServices" :key="index" class="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-white/60 text-sm">Служение #{{ index + 1 }}</span>
                    <button type="button" @click="removeConferenceService(index)" class="text-red-400 hover:text-red-300 text-sm">Удалить</button>
                  </div>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-white/70 text-xs mb-1">Дата *</label>
                      <input v-model="service.service_date" type="date" class="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm" />
                    </div>
                    
                    <div>
                      <label class="block text-white/70 text-xs mb-1">Название служения *</label>
                      <input v-model="service.title" type="text" placeholder="Открытие конференции" class="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm" />
                    </div>
                    
                    <div>
                      <label class="block text-white/70 text-xs mb-1">Время начала</label>
                      <input v-model="service.start_time" type="time" class="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm" />
                    </div>
                    
                    <div>
                      <label class="block text-white/70 text-xs mb-1">Спикер</label>
                      <input v-model="service.speaker" type="text" placeholder="Имя спикера" class="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm" />
                    </div>
                    
                    <div>
                      <label class="block text-white/70 text-xs mb-1">Максимум участников</label>
                      <input v-model="service.capacity" type="number" min="0" placeholder="0 = без ограничений" class="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm" />
                    </div>
                    
                    <div class="sm:col-span-2">
                      <label class="block text-white/70 text-xs mb-1">Описание</label>
                      <textarea v-model="service.description" rows="2" placeholder="Описание служения..." class="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm"></textarea>
                    </div>
                  </div>
                </div>
                
                <button type="button" @click="addConferenceService" class="w-full mt-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition text-sm">
                  + Добавить служение
                </button>
              </div>
            </div>
            
            <!-- ==================== ДАТА И ВРЕМЯ (только для обычных событий) ==================== -->
            <template v-if="!localForm.is_conference">
              <div>
                <label class="block text-white/80 mb-2">Дата *</label>
                <input v-model="localForm.startDate" type="date" required class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" :disabled="saving" />
              </div>
              
              <div>
                <label class="block text-white/80 mb-2">Время</label>
                <input v-model="localForm.startTime" type="time" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" :disabled="saving" />
              </div>
              
              <div>
                <label class="block text-white/80 mb-2">Краткое описание</label>
                <textarea v-model="localForm.description" rows="3" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" :disabled="saving" placeholder="Краткое описание события..."></textarea>
              </div>
              
              <div>
                <label class="block text-white/80 mb-2">Полное описание</label>
                <textarea v-model="localForm.content" rows="5" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" :disabled="saving" placeholder="Подробное описание события..."></textarea>
              </div>
            </template>
            
            <!-- Цвет -->
            <div>
              <label class="block text-white/80 mb-2">Цвет в календаре</label>
              <div class="flex gap-2 flex-wrap">
                <button v-for="color in colors" :key="color.value" type="button" class="w-8 h-8 rounded-full transition hover:scale-110" :style="{ backgroundColor: color.value }" :class="{ 'ring-2 ring-white ring-offset-2 ring-offset-blue-900': localForm.color === color.value }" @click="localForm.color = color.value"></button>
              </div>
            </div>
            
            <!-- Изображение -->
            <div>
              <label class="block text-white/80 mb-2">Изображение</label>
              <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" :disabled="saving" />
              <div v-if="imagePreview" class="mt-2"><img :src="imagePreview" class="h-20 rounded-lg" /></div>
            </div>
            
            <!-- Доп. информация -->
            <div>
              <label class="block text-white/80 mb-2">Доп. информация</label>
              <textarea v-model="localForm.info" rows="3" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" :disabled="saving" placeholder="Дополнительная информация..."></textarea>
            </div>
            
            <!-- Настройки видимости -->
            <div class="bg-white/5 rounded-lg p-4 border border-white/10">
              <div class="flex items-center gap-3 mb-4">
                <input id="members_only" v-model="localForm.members_only" type="checkbox" class="w-4 h-4" />
                <label for="members_only" class="text-white/80 text-sm">🔒 Только для прихожан</label>
              </div>
              
              <div class="flex items-center gap-3 mb-4">
                <input id="ministers_only" v-model="localForm.ministers_only" type="checkbox" class="w-4 h-4" />
                <label for="ministers_only" class="text-white/80 text-sm">👔 Только для служителей</label>
              </div>
              
              <div class="flex items-center gap-3">
                <input id="is_published" v-model="localForm.is_published" type="checkbox" class="w-4 h-4" />
                <label for="is_published" class="text-white/80 text-sm">Опубликовано</label>
              </div>
            </div>
            
            <!-- Карусель -->
            <div class="bg-white/5 rounded-lg p-4 border border-white/10">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-white font-medium">Карусель на главной</h4>
                <span class="text-sm px-2 py-1 rounded-full" :class="carouselStatusClass">{{ carouselStats.in_carousel }} из {{ carouselStats.limit }}</span>
              </div>
              
              <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div class="h-full transition-all" :class="progressBarClass" :style="{ width: `${carouselProgress}%` }"></div>
              </div>
              
              <div class="flex items-center gap-3">
                <input id="show_in_carousel" v-model="localForm.show_in_carousel" type="checkbox" :disabled="!localForm.show_in_carousel && carouselStats.available <= 0" />
                <label for="show_in_carousel" class="text-white/80 text-sm">Показывать в карусели</label>
              </div>
            </div>
            
            <!-- Кнопка удаления -->
            <div v-if="mode === 'edit'" class="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
              <button @click="confirmDelete" type="button" class="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg hover:bg-red-500/30 transition" :disabled="deleting">
                {{ deleting ? 'Удаление...' : 'Удалить событие' }}
              </button>
            </div>
            
            <div v-if="error" class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">{{ error }}</div>
            
            <div class="flex justify-end gap-4 pt-4">
              <button type="button" @click="handleClose" class="px-6 py-2 bg-white/10 text-white rounded-lg" :disabled="saving">Отмена</button>
              <button type="submit" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg" :disabled="saving">{{ saving ? 'Сохранение...' : 'Сохранить' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCarouselStats } from '~/composables/useCarouselStats'
import { useApi } from '~/composables/useApi'  
import type { EventData, EventFormData } from '~/types/event' 

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  event?: EventData
  date?: string
  canEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

// ============================================
// ПОЛУЧАЕМ КОНФИГУРАЦИЮ
// ============================================
const config = useRuntimeConfig()
const { apiBase, storageUrl } = config.public
const { $api } = useApi()  

const authStore = useAuthStore()

const colors = [
  { value: '#3b82f6', name: 'Синий' },
  { value: '#ef4444', name: 'Красный' },
  { value: '#10b981', name: 'Зеленый' },
  { value: '#f59e0b', name: 'Оранжевый' },
  { value: '#8b5cf6', name: 'Фиолетовый' },
  { value: '#ec4899', name: 'Розовый' },
]

const localForm = ref<EventFormData>({
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
  members_only: false,
  ministers_only: false,
  thumbnail: null,
  is_conference: false,
  conferenceServices: []
})

const imagePreview = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const addConferenceService = () => {
  localForm.value.conferenceServices.push({
    service_date: '',
    title: '',
    description: '',
    start_time: '',
    speaker: '',
    capacity: 0
  })
}

const removeConferenceService = (index: number) => {
  localForm.value.conferenceServices.splice(index, 1)
}

const { stats: carouselStats, loading: statsLoading, loadStats } = useCarouselStats()

const carouselProgress = computed(() => {
  if (!carouselStats.value.limit) return 0
  return (carouselStats.value.in_carousel / carouselStats.value.limit) * 100
})

const carouselStatusClass = computed(() => {
  const available = carouselStats.value.available
  if (available <= 0) return 'bg-red-500/20 text-red-200'
  if (available <= 2) return 'bg-yellow-500/20 text-yellow-200'
  return 'bg-green-500/20 text-green-200'
})

const progressBarClass = computed(() => {
  const available = carouselStats.value.available
  if (available <= 0) return 'bg-red-500'
  if (available <= 2) return 'bg-yellow-500'
  return 'bg-green-500'
})

const getImageUrl = (thumbnail: string): string | null => {
  if (!thumbnail) return null
  if (thumbnail.startsWith('http')) return thumbnail
  if (thumbnail.startsWith('events/thumbnails/')) {
    return `${storageUrl}/${thumbnail}`
  }
  return `${apiBase}/storage/${thumbnail}`
}

const handleClose = () => emit('close')

watch(() => props.visible, (visible) => {
  if (visible) {
    loadStats()
    
    if (props.mode === 'create') {
      const today = new Date().toISOString().split('T')[0]
      localForm.value = {
        title: '',
        startDate: props.date || today,
        startTime: '',
        color: '#3b82f6',
        description: '',
        content: '',
        info: '',
        show_in_carousel: false,
        is_published: true,
        is_past: false,
        members_only: false,
        ministers_only: false,
        thumbnail: null,
        is_conference: false,
        conferenceServices: []
      } as EventFormData
    } 
    else if (props.mode === 'edit' && props.event) {
      localForm.value = {
        title: props.event.title || '',
        startDate: props.event.startDate ? props.event.startDate.substring(0, 10) : '',
        startTime: props.event.startTime ? props.event.startTime.substring(0, 5) : '',
        color: props.event.color || '#3b82f6',
        description: props.event.description || '',
        content: props.event.content || '',
        info: props.event.info || '',
        show_in_carousel: !!props.event.show_in_carousel,
        is_published: props.event.is_published === true,
        is_past: props.event.is_past || false,
        members_only: !!props.event.members_only,
        ministers_only: !!props.event.ministers_only,
        thumbnail: null,
        is_conference: props.event.is_conference || false,
        conferenceServices: props.event.conference_services || []
      } as EventFormData

      if (props.event.thumbnail) {
        imagePreview.value = getImageUrl(props.event.thumbnail) || null
      }
    }
  } else {
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
      members_only: false,
      ministers_only: false,
      thumbnail: null,
      is_conference: false,
      conferenceServices: []
    } as EventFormData
    
    imagePreview.value = null
    error.value = ''
    if (fileInput.value) fileInput.value.value = ''
  }
}, { immediate: true })

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    const file = input.files[0]
    if (!file) {
      error.value = 'Файл не выбран'
      return
    }
    
    if (file.size > 800 * 1024) {
      error.value = 'Файл слишком большой. Максимум 800KB'
      input.value = ''
      return
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      error.value = 'Неподдерживаемый формат. Используйте JPG, PNG, GIF или WEBP'
      input.value = ''
      return
    }
    localForm.value.thumbnail = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const handleSubmit = async () => {
  saving.value = true
  error.value = ''
  
  try {
    const formData = new FormData()
    
    // Общие поля
    formData.append('title', localForm.value.title)
    formData.append('is_conference', localForm.value.is_conference ? '1' : '0')
    formData.append('show_in_carousel', localForm.value.show_in_carousel ? '1' : '0')
    formData.append('is_published', localForm.value.is_published ? '1' : '0')
    formData.append('members_only', localForm.value.members_only ? '1' : '0')
    formData.append('ministers_only', localForm.value.ministers_only ? '1' : '0')
    if (localForm.value.color) formData.append('color', localForm.value.color)
    if (localForm.value.info) formData.append('info', localForm.value.info)
    if (localForm.value.thumbnail) {
      formData.append('thumbnail', localForm.value.thumbnail)
    }
    
    if (localForm.value.is_conference) {
      // Конференция
      if (localForm.value.conferenceServices.length === 0) {
        error.value = 'Добавьте хотя бы одно служение'
        saving.value = false
        return
      }
      
      for (const service of localForm.value.conferenceServices) {
        if (!service.service_date) {
          error.value = 'Заполните дату для всех служений'
          saving.value = false
          return
        }
        if (!service.title) {
          error.value = 'Заполните название для всех служений'
          saving.value = false
          return
        }
      }
      
      const firstService = localForm.value.conferenceServices[0]
      if (firstService) {
        formData.append('startDate', firstService.service_date)
        if (firstService.start_time) formData.append('startTime', firstService.start_time)
      }
      formData.append('description', `Конференция с ${localForm.value.conferenceServices.length} служениями`)
      
      const servicesList = localForm.value.conferenceServices.map((s, i) => 
        `${i+1}. ${s.title} — ${s.service_date}${s.start_time ? ` в ${s.start_time}` : ''}${s.speaker ? ` (спикер: ${s.speaker})` : ''}${s.description ? `\n   ${s.description}` : ''}`
      ).join('\n\n')
      formData.append('content', `📅 Программа конференции:\n\n${servicesList}`)
      
      formData.append('conference_services', JSON.stringify(localForm.value.conferenceServices))
      
    } else {
      // Обычное событие
      if (!localForm.value.title?.trim()) {
        error.value = 'Введите название события'
        saving.value = false
        return
      }
      if (!localForm.value.startDate) {
        error.value = 'Выберите дату события'
        saving.value = false
        return
      }
      
      formData.append('startDate', localForm.value.startDate)
      if (localForm.value.startTime) formData.append('startTime', localForm.value.startTime)
      if (localForm.value.description) formData.append('description', localForm.value.description)
      if (localForm.value.content) formData.append('content', localForm.value.content)
    }
    
    // ✅ Используем $api вместо $fetch
    if (props.mode === 'create') {
      await $api('/events', { 
        method: 'POST', 
        body: formData 
      })
    } else {
      if (!props.event) {
        error.value = 'Событие не найдено'
        saving.value = false
        return
      }
      await $api(`/events/${props.event.id}`, {
        method: 'POST',
        body: formData,
        headers: { 'X-HTTP-Method-Override': 'PUT' }
      })
    }
    
    await loadStats()
    emit('saved')
    handleClose()
    
  } catch (err: any) {
    console.error('Submit error:', err)
    error.value = err.data?.message || err.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

const deleting = ref(false)

const confirmDelete = () => {
  if (confirm('Вы уверены, что хотите удалить это событие?')) {
    deleteEvent()
  }
}

const deleteEvent = async () => {
  deleting.value = true
  error.value = ''
  
  try {
    if (!props.event) {
      error.value = 'Событие не найдено'
      deleting.value = false
      return
    }
    // ✅ Используем $api вместо $fetch
    await $api(`/events/${props.event.id}`, {
      method: 'DELETE'
    })
    await loadStats()
    emit('saved')
    handleClose()
  } catch (err: any) {
    error.value = err.data?.message || 'Ошибка при удалении'
  } finally {
    deleting.value = false
  }
}
</script>