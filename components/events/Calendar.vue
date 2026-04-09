<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-2 sm:p-6 border border-white/20">
    <!-- Заголовок с навигацией -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6">
      <h2 class="text-xl sm:text-2xl font-bold text-white">
        {{ monthName }} {{ currentYear }}
      </h2>
      
      <div class="flex gap-2 w-full sm:w-auto justify-center">
        <button
          @click="$emit('prev-month')"
          class="p-2 hover:bg-white/10 rounded-lg transition text-white/70 hover:text-white flex-1 sm:flex-none"
          :disabled="loading"
        >
          <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          @click="$emit('today')"
          class="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition text-white flex-1 sm:flex-none"
          :disabled="loading"
        >
          Сегодня
        </button>
        
        <button
          @click="$emit('next-month')"
          class="p-2 hover:bg-white/10 rounded-lg transition text-white/70 hover:text-white flex-1 sm:flex-none"
          :disabled="loading"
        >
          <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Дни недели -->
    <div class="hidden sm:grid sm:grid-cols-7 gap-1 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-white/60 text-sm font-medium py-2"
        :class="{ 'text-red-300': day === 'Сб' || day === 'Вс' }"
      >
        {{ day }}
      </div>
    </div>
    
    <!-- Сетка календаря -->
    <div :class="calendarGridClass" class="gap-1">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="dayCellClass"
      >
        <div
          v-if="day"
          class="h-full w-full bg-white/5 hover:bg-white/10 rounded-lg p-1 sm:p-2 transition group cursor-pointer flex flex-col"
          :class="[
            getDayBackgroundClass(day),
            {
              'border-2 border-blue-400': isToday(day.date),
              'opacity-50': !day.isCurrentMonth,
              'hover:bg-green-500/20': canEdit && !day.events.length
            }
          ]"
          @click="$emit('select-day', day.date)"
        >
          <!-- Верхняя строка: число -->
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs sm:text-sm font-bold" :class="getDayTextClass(day)">
              {{ day.day }}
            </span>
            <span 
              v-if="columns < 7" 
              class="text-[10px] sm:hidden"
              :class="getDayTextClass(day)"
            >
              {{ getShortWeekday(day.weekday) }}
            </span>
          </div>
          
          <!-- События дня -->
          <div class="space-y-1 relative">
            <div
              v-for="event in day.events.slice(0, 3)"
              :key="event.id"
              class="text-[10px] sm:text-xs px-1 py-0.5 rounded text-white font-medium transition hover:brightness-110 whitespace-nowrap overflow-hidden relative"
              :style="{ 
                backgroundColor: event.color || '#3b82f6',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                opacity: getEventOpacity(event)
              }"
              :class="{ 
                'cursor-pointer hover:scale-105': canEdit || event.can_edit,
                'line-through': !event.is_published && event.is_past,
                'border border-dashed border-white/50': !event.is_published && !event.is_past
              }"
              @click.stop="$emit(canEdit ? 'select-event' : 'view-event', event)"
              :title="getEventTitle(event)"
            >
              <!-- Желтая полоска сбоку для событий только для членов -->
              <div 
                v-if="event.members_only && !canEdit"
                class="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-l"
              ></div>
              
              <!-- Отображение времени -->
              <span class="truncate block pl-0.5">
                {{ event.time ? event.time.substring(0, 5) : event.title.substring(0, 3) + '…' }}
              </span>
            </div>
          </div>
          
          <!-- Индикатор "ещё" -->
          <div
            v-if="day.events.length > 3"
            class="mt-1 text-[8px] sm:text-xs text-white/70 font-medium bg-black/30 rounded-full px-1 inline-block"
          >
            +{{ day.events.length - 3 }}
          </div>
        </div>
        
        <!-- Пустая ячейка -->
        <div v-else class="h-full w-full bg-white/5 rounded-lg opacity-20"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const props = defineProps<{
  monthData: any
  currentMonth: number
  currentYear: number
  loading?: boolean
  monthName: string
  canEdit?: boolean
}>()

const emit = defineEmits<{
  'prev-month': []
  'next-month': []
  'today': []
  'select-day': [date: string]
  'select-event': [event: any]
  'view-event': [event: any]
}>()

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const shortWeekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const { width } = useWindowSize()

const columns = computed(() => {
  if (width.value < 380) return 3
  if (width.value < 480) return 4
  if (width.value < 640) return 5
  return 7
})

const calendarGridClass = computed(() => {
  return `grid grid-cols-${columns.value} gap-1`
})

const dayCellClass = computed(() => {
  return 'h-32 sm:h-40 md:h-48 lg:h-56'
})

const getEventOpacity = (event: any) => {
  if (props.canEdit) {
    if (event.is_past) return 0.8
    return 1
  }
  
  if (!event.is_published) return 0
  if (event.is_past) return 0.7
  return 1
}

const getEventTitle = (event: any) => {
  let title = event.time ? `${event.time} ${event.title}` : event.title
  
  if (props.canEdit) {
    if (!event.is_published && event.is_past) {
      title += ' (прошедшее, не опубликовано)'
    } else if (!event.is_published) {
      title += ' (не опубликовано)'
    } else if (event.is_past) {
      title += ' (прошедшее)'
    } else if (event.members_only) {
      title += ' (только для членов церкви)'
    }
  } else {
    if (event.is_past) {
      title += ' (прошедшее)'
    } else if (event.members_only) {
      title += ' (только для членов церкви)'
    }
  }
  
  return title
}

const getShortWeekday = (weekday: number) => {
  return shortWeekDays[weekday]
}

const getDayTextClass = (day: any) => {
  if (day.weekday === 5 || day.weekday === 6) {
    return 'text-red-300'
  }
  return 'text-white'
}

const getDayBackgroundClass = (day: any) => {
  if (day.weekday === 5 || day.weekday === 6) {
    return 'bg-red-500/5 hover:bg-red-500/10'
  }
  return ''
}

const calendarDays = computed(() => {
  if (!props.monthData) return []
  
  const firstDayOfMonth = new Date(props.currentYear, props.currentMonth - 1, 1)
  const lastDayOfMonth = new Date(props.currentYear, props.currentMonth, 0)
  
  let startOffset = firstDayOfMonth.getDay()
  startOffset = startOffset === 0 ? 6 : startOffset - 1
  
  const daysInMonth = lastDayOfMonth.getDate()
  const cols = columns.value
  const totalDays = startOffset + daysInMonth
  const rows = Math.ceil(totalDays / cols)
  const totalCells = rows * cols
  
  const days: any[] = []
  
  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startOffset + 1
    
    if (dayNumber >= 1 && dayNumber <= daysInMonth) {
      const cellDate = new Date(props.currentYear, props.currentMonth - 1, dayNumber)
      const day = cellDate.getDate()
      const month = cellDate.getMonth() + 1
      const year = cellDate.getFullYear()
      const weekday = cellDate.getDay() === 0 ? 6 : cellDate.getDay() - 1
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      const dayEvents = props.monthData.events?.[day] || []
      
      days.push({
        day,
        date: dateStr,
        month,
        year,
        weekday,
        events: dayEvents,
        isCurrentMonth: true
      })
    } else {
      days.push(null)
    }
  }
  
  return days
})

const isToday = (dateStr: string) => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return dateStr === todayStr
}
</script>

<style scoped>
.h-32 { height: 8rem; }
.h-40 { height: 10rem; }
.h-48 { height: 12rem; }
.h-56 { height: 14rem; }

:deep(*) {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

@media (max-width: 640px) {
  button, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
  
  .grid > div {
    touch-action: manipulation;
  }
}

.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.grid-cols-7 { grid-template-columns: repeat(7, minmax(0, 1fr)); }

@media (max-width: 379px) {
  .text-\[8px\] { font-size: 8px; }
  .text-\[10px\] { font-size: 10px; }
}

@media (min-width: 380px) and (max-width: 479px) {
  .text-\[8px\] { font-size: 9px; }
  .text-\[10px\] { font-size: 11px; }
}

@media (min-width: 480px) and (max-width: 639px) {
  .text-\[8px\] { font-size: 10px; }
  .text-\[10px\] { font-size: 12px; }
}
</style>