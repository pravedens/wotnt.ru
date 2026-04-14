import type { Event, MonthData } from '~/types/event'
import { useAuthStore } from '~/stores/auth'

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

    // Ждём инициализацию auth
    const ensureAuthReady = async () => {
        if (!authStore.initialized && typeof authStore.init === 'function') {
            await authStore.init()
        }
    }

    // Заголовки с Bearer токеном
    const getHeaders = () => {
        // Пробуем получить токен из store
        let token = authStore.token
        
        // Если нет в store, пробуем из localStorage
        if (process.client && !token) {
            token = localStorage.getItem('auth_token')
            if (token) {
            }
        }
        
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        } else {
        }
        
        return headers
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

        const headers = getHeaders()

        // ✅ Добавляем параметр для обхода кэша
        const response = await $fetch<MonthData>('/api/events', {
            params: {
                month: targetMonth,
                year: targetYear,
                _t: Date.now() // ← Добавьте эту строку
            },
            headers
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
            
            const headers: Record<string, string> = {
                'Accept': 'application/json'
            }
            
            const token = authStore.token
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            // ✅ Используем прокси вместо прямого URL
            const event = await $fetch<Event>(`/api/events/${slug}`, { headers })

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