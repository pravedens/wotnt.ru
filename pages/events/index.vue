<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 py-12">
    <div class="container mx-auto px-4">
      <!-- Хлебные крошки -->
      <EventsBreadcrumbs />
      
      <h1 class="text-4xl font-bold text-white text-center mb-8">
        Календарь событий
      </h1>
      
      <!-- Состояние загрузки -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        <p class="text-white/80 mt-4">Загрузка календаря...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <p class="text-red-200 text-lg mb-4">{{ error }}</p>
        <button 
          @click="retryLoad"
          class="inline-block px-6 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition"
        >
          Попробовать снова
        </button>
      </div>
      
      <!-- Календарь -->
      <div v-else-if="monthData" class="max-w-6xl mx-auto">
        <EventsCalendar
          :month-data="transformedMonthData"
          :current-month="currentMonth"
          :current-year="currentYear"
          :loading="loading"
          :month-name="monthName"
          :can-edit="userCanEdit"
          @prev-month="prevMonth"
          @next-month="nextMonth"
          @today="today"
          @select-day="openCreateModal"
          @select-event="openEditModal"
          @view-event="openViewModal"
        />
        
        <!-- Список событий месяца -->
        <div v-if="monthData.list?.length" class="mt-8">
          <h2 class="text-2xl font-bold text-white mb-4">
            Все события {{ monthNameGenitive }} {{ currentYear }}
          </h2>
          
          <div class="space-y-4">
            <EventsCard
              v-for="event in monthData.list"
              :key="event.id"
              :event="event"
              :can-edit="userCanEdit"
              @click="openViewModal(event)"
              @edit="openEditModal(event)"
            />
          </div>
        </div>
        
        <!-- Нет событий -->
        <div v-else class="text-center py-12 bg-white/10 rounded-2xl mt-8">
          <p class="text-white/80 text-lg mb-4">В этом месяце нет запланированных событий</p>
          <button
            v-if="userCanEdit"
            @click="openCreateModal(new Date().toISOString().split('T')[0])"
            class="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition"
          >
            + Создать событие
          </button>
        </div>
      </div>
      
      <!-- Модальные окна -->
      <EventsViewModal
        v-if="viewEvent"
        :event="viewEvent"
        :visible="!!viewEvent"
        :can-edit="userCanEdit"
        @close="viewEvent = null"
        @edit="openEditModal(viewEvent)"
      />
      
      <EventsFormModal
        v-if="createDate"
        :key="'create-' + createDate"
        :visible="!!createDate"
        :date="createDate"
        :can-edit="userCanEdit"
        mode="create"
        @close="createDate = null"
        @saved="handleEventSaved"
      />
      
      <EventsFormModal
        v-if="editEvent"
        :key="'edit-' + editEvent.id"
        :visible="!!editEvent"
        :event="editEvent"
        :can-edit="userCanEdit"
        mode="edit"
        @close="editEvent = null"
        @saved="handleEventSaved"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEvents } from '~/composables/useEvents'
import { useAuthStore } from '~/stores/auth'
import EventsBreadcrumbs from '~/components/events/Breadcrumbs.vue'
import EventsCalendar from '~/components/events/Calendar.vue'
import EventsCard from '~/components/events/EventCard.vue'
import EventsViewModal from '~/components/events/ViewModal.vue'
import EventsFormModal from '~/components/events/FormModal.vue'
import { onMounted } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

const {
  monthData,
  loading,
  error,
  currentMonth,
  currentYear,
  monthName,
  monthNameGenitive,
  loadMonthEvents,
  prevMonth,
  nextMonth,
  today,
  loadEvent,
  isAdmin
} = useEvents()

// ============================================
// 🔥 ТРАНСФОРМАЦИЯ ДАННЫХ ДЛЯ КАЛЕНДАРЯ
// ============================================

// Преобразуем данные из API в формат, понятный календарю
const transformedMonthData = computed(() => {
  if (!monthData.value) return null
  
  // Группируем события по дням
  const eventsByDay: Record<number, any[]> = {}
  
  if (monthData.value.list && Array.isArray(monthData.value.list)) {
    monthData.value.list.forEach((event: any) => {
      if (event.startDate) {
        const date = new Date(event.startDate)
        const day = date.getDate()
        
        if (!eventsByDay[day]) {
          eventsByDay[day] = []
        }
        
        eventsByDay[day].push({
          id: event.id,
          title: event.title,
          slug: event.slug,
          color: event.color,
          time: event.startTime,
          description: event.description,
          startDate: event.startDate,
          startTime: event.startTime,
          show_in_carousel: event.show_in_carousel,
          is_published: event.is_published,
          members_only: event.members_only,
          is_past: event.is_past,
          can_edit: event.can_edit
        })
      }
    })
  }
  
  // Сортируем события в каждом дне по времени
  Object.keys(eventsByDay).forEach(day => {
    eventsByDay[Number(day)].sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime)
      }
      return 0
    })
  })
  
  return {
    ...monthData.value,
    events: eventsByDay
  }
})

// ============================================
// SEO МЕТА-ТЕГИ
// ============================================

useServerSeoMeta({
  title: 'События | Церковь Слово Истины',
  description: 'Календарь событий церкви Слово Истины. Воскресные служения, молитвенные встречи, конференции и молодежные собрания. Актуальные анонсы мероприятий.',
  ogTitle: 'События | Церковь Слово Истины',
  ogDescription: 'Календарь событий церкви Слово Истины. Воскресные служения, молитвенные встречи, конференции и молодежные собрания. Актуальные анонсы мероприятий.',
  ogType: 'website',
  ogUrl: 'https://wotnt.ru/events',
  ogSiteName: 'Церковь Слово Истины',
  ogLocale: 'ru_RU',
  twitterCard: 'summary_large_image',
  twitterTitle: 'События | Церковь Слово Истины',
  twitterDescription: 'Календарь событий церкви Слово Истины. Воскресные служения, молитвенные встречи, конференции и молодежные собрания.'
})

useHead({
  meta: [
    { 
      name: 'description', 
      content: 'Календарь событий церкви Слово Истины. Воскресные служения, молитвенные встречи, конференции и молодежные собрания. Актуальные анонсы мероприятий.' 
    },
    { 
      name: 'keywords', 
      content: 'события, календарь, служения, конференции, анонсы, воскресное служение, молитвенная встреча, церковь, слово истины' 
    }
  ],
  link: [
    { rel: 'canonical', href: 'https://wotnt.ru/events' }
  ]
})

// ============================================
// ЛОГИКА КОМПОНЕНТА
// ============================================

// Права на редактирование
const userCanEdit = computed(() => authStore.isAdmin)

const viewEvent = ref<any>(null)
const editEvent = ref<any>(null)
const createDate = ref<string | null>(null)

// ✅ Загружаем события при монтировании с явными параметрами
onMounted(() => {
  const now = new Date()
  const currentMonthValue = now.getMonth() + 1
  const currentYearValue = now.getFullYear()
  console.log('📅 onMounted - loading events for:', currentMonthValue, currentYearValue)
  loadMonthEvents(currentMonthValue, currentYearValue)
})

// ✅ Повторная попытка загрузки
const retryLoad = () => {
  loadMonthEvents(currentMonth.value, currentYear.value)
}

// Открыть модальное окно просмотра
const openViewModal = (event: any) => {
  console.log('📖 Открытие просмотра события:', event.slug || event.id)
  viewEvent.value = event
}

// Открыть модальное окно редактирования
const openEditModal = async (event: any) => {
  console.log('✏️ Открытие редактирования события:', event?.slug || event?.id)
  
  if (!userCanEdit.value) {
    console.log('🚫 Нет прав на редактирование')
    return
  }
  
  if (!event?.slug) {
    console.error('❌ Нельзя редактировать: нет slug', event)
    return
  }
  
  const fullEvent = await loadEvent(event.slug)
  if (fullEvent) {
    editEvent.value = fullEvent
    viewEvent.value = null
    createDate.value = null
  }
}

// Открыть модальное окно создания
const openCreateModal = (dateStr: string) => {
  console.log('📅 openCreateModal called with date:', dateStr)
  
  if (!userCanEdit.value) {
    console.log('🚫 Нет прав на редактирование')
    return
  }
  
  createDate.value = null
  nextTick(() => {
    createDate.value = dateStr
  })
}

// Обработчик сохранения события
const handleEventSaved = () => {
  console.log('💾 Событие сохранено, обновляем календарь')
  loadMonthEvents(currentMonth.value, currentYear.value)
  createDate.value = null
  editEvent.value = null
}
</script>