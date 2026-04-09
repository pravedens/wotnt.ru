import type { Event, MonthData } from '~/types/event'
import { useAuthStore } from '~/stores/auth'

const API_BASE = 'https://wotgospel.ru'

export const useEvents = () => {
 const { getImageUrl } = useApi()
 const authStore = useAuthStore()

 const monthData = ref<MonthData | null>(null)
 const loading = ref(false)
 const error = ref<string | null>(null)

 const now = new Date()
 const currentMonth = ref<number>(now.getMonth() + 1)
 const currentYear = ref<number>(now.getFullYear())
 const isAdmin = ref(false)

 // ✅ Ждём инициализацию auth
 const ensureAuthReady = async () => {
   if (!authStore.initialized && typeof authStore.init === 'function') {
     await authStore.init()
   }
 }

 // ✅ Заголовки с Bearer - ПРИНУДИТЕЛЬНО из localStorage
 const getHeaders = () => {
   // Пытаемся получить токен из store или напрямую из localStorage
   let token = authStore.token
   
   if (process.client && !token) {
     token = localStorage.getItem('auth_token')
   }
   
   console.log('🔑 Auth token present:', !!token)
   
   return token
     ? {
         Authorization: `Bearer ${token}`,
         Accept: 'application/json',
         'Content-Type': 'application/json'
       }
     : {
         Accept: 'application/json',
         'Content-Type': 'application/json'
       }
 }

 // =========================
 // Загрузка событий за месяц
 // =========================
 const loadMonthEvents = async (month?: number, year?: number) => {
   loading.value = true
   error.value = null

   try {
     // Ждем инициализацию auth
     await ensureAuthReady()
     
     // Дополнительная задержка для гарантии (если нужно)
     if (!authStore.token && process.client) {
       const storedToken = localStorage.getItem('auth_token')
       if (storedToken) {
         authStore.token = storedToken
       }
     }

     let targetMonth = month ?? currentMonth.value
     let targetYear = year ?? currentYear.value

     const headers = getHeaders()
     console.log('📡 Request headers:', headers)

     const response = await $fetch<MonthData>(
       `${API_BASE}/api/events`,
       {
         params: {
           month: targetMonth,
           year: targetYear
         },
         headers,
         credentials: 'include'
       }
     )

     monthData.value = response
     isAdmin.value = response?.is_admin || false

     currentMonth.value = Number(response?.month || targetMonth)
     currentYear.value = Number(response?.year || targetYear)

   } catch (err: any) {
     error.value = err?.data?.message || err?.message || 'Ошибка загрузки событий'
     console.error('Events load error:', err)
   } finally {
     loading.value = false
   }
 }

 // =========================
 // Загрузка одного события
 // =========================
 const loadEvent = async (slug: string): Promise<Event | null> => {
   try {
     await ensureAuthReady()
     
     let token = authStore.token
     if (process.client && !token) {
       token = localStorage.getItem('auth_token')
     }
     
     const headers = token
       ? {
           Authorization: `Bearer ${token}`,
           Accept: 'application/json'
         }
       : {
           Accept: 'application/json'
         }

     const event = await $fetch<Event>(
       `${API_BASE}/api/events/${slug}`,
       {
         headers,
         credentials: 'include'
       }
     )

     return event
   } catch (err) {
     console.error('Event load error:', err)
     return null
   }
 }

 const getEventImageUrl = (thumbnail: string | null | undefined) => {
   return getImageUrl(thumbnail, 'events')
 }

 // =========================
 // Навигация
 // =========================

 const prevMonth = () => {
   const newMonth = currentMonth.value === 1 ? 12 : currentMonth.value - 1
   const newYear = currentMonth.value === 1 ? currentYear.value - 1 : currentYear.value
   loadMonthEvents(newMonth, newYear)
 }

 const nextMonth = () => {
   const newMonth = currentMonth.value === 12 ? 1 : currentMonth.value + 1
   const newYear = currentMonth.value === 12 ? currentYear.value + 1 : currentYear.value
   loadMonthEvents(newMonth, newYear)
 }

 const today = () => {
   const now = new Date()
   loadMonthEvents(now.getMonth() + 1, now.getFullYear())
 }

 const monthName = computed(() => {
   const months = [
     'Январь','Февраль','Март','Апрель','Май','Июнь',
     'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
   ]
   return months[currentMonth.value - 1]
 })

 const monthNameGenitive = computed(() => {
   const months = [
     'января','февраля','марта','апреля','мая','июня',
     'июля','августа','сентября','октября','ноября','декабря'
   ]
   return months[currentMonth.value - 1]
 })

 return {
   monthData,
   loading,
   error,
   currentMonth,
   currentYear,
   monthName,
   monthNameGenitive,
   isAdmin,
   getEventImageUrl,
   loadMonthEvents,
   loadEvent,
   prevMonth,
   nextMonth,
   today
 }
}