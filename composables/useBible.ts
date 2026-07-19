// /composables/useBible.ts
import type { BibleVerse, BibleVerseResponse, BibleVersesListResponse, BibleVerseFilters } from '~/types/bible'
import { useApi } from '~/composables/useApi'

export const useBible = () => {
    const { $api } = useApi()
    
    const verse = ref<BibleVerse | null>(null)
    const verses = ref<BibleVerse[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref<Omit<BibleVersesListResponse, 'data'> | null>(null)

    const fetchVerseOfTheDay = async (): Promise<BibleVerse | null> => {
        loading.value = true
        error.value = null
        
        try {
            // ✅ Используем $api для автоматического добавления timestamp и заголовков
            const response = await $api<BibleVerseResponse>('/bible/verse-of-the-day')
            verse.value = response.data
            return response.data
        } catch (err: any) {
            error.value = err.message || 'Не удалось загрузить стих дня'
            return null
        } finally {
            loading.value = false
        }
    }

    const fetchVerseBySlug = async (slug: string): Promise<BibleVerse | null> => {
        loading.value = true
        error.value = null
        
        try {
            // ✅ Используем $api для автоматического добавления timestamp и заголовков
            const data = await $api<BibleVerse>(`/bible/${slug}`)
            verse.value = data
            return data
        } catch (err: any) {
            error.value = err.message || 'Стих не найден'
            return null
        } finally {
            loading.value = false
        }
    }

    const fetchVerses = async (filters: BibleVerseFilters = {}): Promise<BibleVerse[]> => {
        loading.value = true
        error.value = null
        
        try {
            const params: Record<string, any> = {}
            if (filters.search) params.search = filters.search
            if (filters.page) params.page = filters.page
            if (filters.per_page) params.per_page = filters.per_page
            
            // ✅ Используем $api для автоматического добавления timestamp и заголовков
            const response = await $api<BibleVersesListResponse>('/bible', { params })
            
            verses.value = response.data
            pagination.value = {
                current_page: response.current_page,
                first_page_url: response.first_page_url,
                from: response.from,
                last_page: response.last_page,
                last_page_url: response.last_page_url,
                links: response.links,
                next_page_url: response.next_page_url,
                path: response.path,
                per_page: response.per_page,
                prev_page_url: response.prev_page_url,
                to: response.to,
                total: response.total
            }
            return response.data
        } catch (err: any) {
            error.value = err.message || 'Не удалось загрузить стихи'
            return []
        } finally {
            loading.value = false
        }
    }

    const formatVerseTitle = (verse: BibleVerse): string => {
        return verse.title
    }

    const getShortDescription = (verse: BibleVerse, maxLength: number = 150): string => {
        if (!verse.description) return ''
        if (verse.description.length <= maxLength) return verse.description
        return verse.description.substring(0, maxLength) + '...'
    }

    return {
        verse,
        verses,
        loading,
        error,
        pagination,
        fetchVerseOfTheDay,
        fetchVerseBySlug,
        fetchVerses,
        formatVerseTitle,
        getShortDescription
    }
}