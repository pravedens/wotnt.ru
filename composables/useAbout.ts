import type { About, Denomination } from '~/types/about'
import { useApi } from '~/composables/useApi'  // ✅ ДОБАВЛЕН ИМПОРТ

export const useAbout = () => {
    const { $api } = useApi()  // ✅ ДОБАВЛЕНО

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

            // ✅ Используем $api вместо $fetch
            const response = await $api<{ abouts: About[] }>(`/abouts?${queryParams.toString()}`)
            abouts.value = response.abouts
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
            // ✅ Используем $api вместо $fetch
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
            // ✅ Используем $api вместо $fetch
            const response = await $api<Denomination[]>('/denominations', {
                query: { _t: Date.now() }
            })
            denominations.value = response
        } catch (err: any) {
            error.value = err.message || 'Ошибка загрузки категорий'
            console.error('Error loading denominations:', err)
        } finally {
            loading.value = false
        }
    }

    // Загрузка статей по категории
    const loadAboutsByDenomination = async (slug: string): Promise<any> => {
        loading.value = true
        error.value = null
        
        try {
            // ✅ Используем $api вместо $fetch
            const response = await $api(`/denominations/${slug}/abouts`, {
                query: { _t: Date.now() }
            })
            abouts.value = response.abouts || response
            return response
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