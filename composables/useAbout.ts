import type { About, Denomination } from '~/types/about'
import { useApi } from '~/composables/useApi'

export const useAbout = () => {
    const { $api } = useApi()

    const abouts = ref<About[]>([])
    const denominations = ref<Denomination[]>([])
    const currentAbout = ref<About | null>(null)
    const currentDenomination = ref<Denomination | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Загрузка всех статей
    const loadAbouts = async (params?: { denomination_id?: number, denomination_slug?: string }) => {
        loading.value = true
        error.value = null

        try {
            const queryParams = new URLSearchParams()
            if (params?.denomination_id) queryParams.append('denomination_id', String(params.denomination_id))
            if (params?.denomination_slug) queryParams.append('denomination_slug', params.denomination_slug)
            queryParams.append('_t', String(Date.now()))

            const response = await $api<{ abouts: About[] }>(`/abouts?${queryParams.toString()}`)
            abouts.value = response.abouts || []
        } catch (err: any) {
            error.value = err.message || 'Ошибка загрузки статей'
            console.error('Error loading abouts:', err)
        } finally {
            loading.value = false
        }
    }

    // Загрузка конкретной статьи по slug
    const loadAbout = async (slug: string): Promise<About | null> => {
        loading.value = true
        error.value = null

        try {
            const about = await $api<About>(`/abouts/${slug}`, {
                query: { _t: Date.now() }
            })
            currentAbout.value = about
            return about
        } catch (err: any) {
            error.value = err.message || 'Ошибка загрузки статьи'
            console.error('Error loading about:', err)
            return null
        } finally {
            loading.value = false
        }
    }

    // Загрузка всех категорий
    const loadDenominations = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await $api<Denomination[]>('/denominations', {
                query: { _t: Date.now() }
            })
            denominations.value = response || []
        } catch (err: any) {
            error.value = err.message || 'Ошибка загрузки категорий'
            console.error('Error loading denominations:', err)
        } finally {
            loading.value = false
        }
    }

    // ✅ Интерфейс для ответа от /denominations/:slug/abouts
    interface DenominationAboutsResponse {
        abouts: About[]
        denomination: Denomination
        success?: boolean
    }

    // Загрузка статей по категории
    const loadAboutsByDenomination = async (slug: string): Promise<DenominationAboutsResponse | null> => {
        loading.value = true
        error.value = null
        
        try {
            // ✅ Типизируем ответ
            const response = await $api<DenominationAboutsResponse>(`/denominations/${slug}/abouts`, {
                query: { _t: Date.now() }
            })
            
            // ✅ Обрабатываем оба варианта ответа
            if (response && Array.isArray(response)) {
                abouts.value = response as unknown as About[]
                return { abouts: abouts.value, denomination: {} as Denomination }
            }
            
            if (response?.abouts) {
                abouts.value = response.abouts || []
                return response
            }
            
            abouts.value = []
            return null
        } catch (err: any) {
            error.value = err.message || 'Ошибка загрузки статей категории'
            console.error('Error loading abouts by denomination:', err)
            return null
        } finally {
            loading.value = false
        }
    }

    return {
        abouts,
        denominations,
        currentAbout,
        currentDenomination,
        loading,
        error,
        loadAbouts,
        loadAbout,
        loadDenominations,
        loadAboutsByDenomination
    }
}