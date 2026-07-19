import type { Event, MonthData } from '~/types/event'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

export const useEvents = () => {
    const { getImageUrl, $api } = useApi()
    const authStore = useAuthStore()

    const monthData = ref<MonthData | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const now = new Date()
    const currentMonth = ref<number>(now.getMonth() + 1)
    const currentYear = ref<number>(now.getFullYear())
    const isAdmin = ref(false)

    // Ждём инициализацию auth
    const ensureAuthReady = async () => {
        if (!authStore.initialized && typeof authStore.init === 'function') {
            await authStore.init()
        }
    }

    // =========================
    // Загрузка событий за месяц (через прокси)
    // =========================
    const loadMonthEvents = async (month?: number, year?: number) => {
        loading.value = true
        error.value = null

        try {
            await ensureAuthReady()
            
            let token = authStore.token
            if (process.client && !token) {
                token = localStorage.getItem('auth_token')
                if (token) {
                    authStore.token = token
                }
            }

            const targetMonth = month ?? currentMonth.value
            const targetYear = year ?? currentYear.value

            // ✅ Используем $api для автоматического добавления timestamp и заголовков
            const response = await $api<MonthData>('/events', {
                params: {
                    month: targetMonth,
                    year: targetYear
                }
            })

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
    // Загрузка одного события (через прокси)
    // =========================
    const loadEvent = async (slug: string): Promise<Event | null> => {
        try {
            await ensureAuthReady()
            
            // ✅ Используем $api для автоматического добавления timestamp и заголовков
            const event = await $api<Event>(`/events/${slug}`)

            return event
        } catch (err) {
            console.error('Event load error:', err)
            return null
        }
    }

    // Получение URL изображения события
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
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ]
        return months[currentMonth.value - 1]
    })

    const monthNameGenitive = computed(() => {
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ]
        return months[currentMonth.value - 1]
    })
    
    // 🆕 Кнопка «Я приду»
const attendEvent = async (slug: string): Promise<{ success: boolean; attending: boolean; count: number; message?: string }> => {
    try {
        await ensureAuthReady()
        
        const authStore = useAuthStore()
        const token = authStore.token
        
        if (!token) {
            return { success: false, attending: false, count: 0, message: 'Необходимо авторизоваться' }
        }
        
        const response: any = await $fetch(`/api/events/${slug}/attend`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
        
        return {
            success: true,
            attending: response.attending,
            count: response.attendees_count,
            message: response.message
        }
    } catch (err: any) {
        console.error('Attend event error:', err)
        const message = err?.data?.message || err?.message || 'Ошибка записи на событие'
        return { success: false, attending: false, count: 0, message }
    }
}

const unattendEvent = async (slug: string): Promise<{ success: boolean; attending: boolean; count: number; message?: string }> => {
    try {
        await ensureAuthReady()
        
        const authStore = useAuthStore()
        const token = authStore.token
        
        if (!token) {
            return { success: false, attending: false, count: 0, message: 'Необходимо авторизоваться' }
        }
        
        const response: any = await $fetch(`/api/events/${slug}/attend`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
        
        return {
            success: true,
            attending: response.attending,
            count: response.attendees_count,
            message: response.message
        }
    } catch (err: any) {
        console.error('Unattend event error:', err)
        const message = err?.data?.message || err?.message || 'Ошибка отмены записи'
        return { success: false, attending: false, count: 0, message }
    }
}

const getAttendeesCount = async (slug: string): Promise<number> => {
    try {
        const response: any = await $fetch(`/api/events/${slug}/attendees-count`, {
            headers: { 'Accept': 'application/json' }
        })
        return response.attendees_count || 0
    } catch (err) {
        console.error('Get attendees count error:', err)
        return 0
    }
}

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
        today,
        attendEvent,
        unattendEvent,
        getAttendeesCount
    }
}