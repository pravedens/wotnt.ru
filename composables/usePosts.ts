import type { Post, PostFilters, Category, Group, Conference } from '~/types/sermon'
import type { PaginatedResponse } from '~/types/api'
import { useApi } from '~/composables/useApi'

export const usePosts = () => {
    const { $api } = useApi()
    
    const posts = ref<Post[]>([])
    const pagination = ref<Partial<PaginatedResponse<Post>>>({})
    const loading = ref(false)
    const error = ref<string | null>(null)

    const getFiltersFromURL = (): PostFilters => {
        if (process.client) {
            const urlParams = new URLSearchParams(window.location.search)
            const page = urlParams.get('page')
            const category_id = urlParams.get('category_id')
            const group_id = urlParams.get('group_id')
            const conference_id = urlParams.get('conference_id')
            const search = urlParams.get('search')
            
            return {
                category_id: category_id ? Number(category_id) : null,
                group_id: group_id ? Number(group_id) : null,
                conference_id: conference_id ? Number(conference_id) : null,
                search: search || null,
                page: page ? Number(page) : 1,
                per_page: 8
            }
        }
        return {
            category_id: null,
            group_id: null,
            conference_id: null,
            search: null,
            page: 1,
            per_page: 8
        }
    }

    const filters = ref<PostFilters>(getFiltersFromURL())

    const categories = ref<Category[]>([])
    const groups = ref<Group[]>([])
    const conferences = ref<Conference[]>([])

    const loadFilterData = async () => {
        try {
            // ✅ Используем $api для автоматического добавления timestamp и заголовков
            const [categoriesRes, groupsRes, conferencesRes] = await Promise.all([
                $api<Category[]>('/categories'),
                $api<Group[]>('/groups'),
                $api<Conference[]>('/conferences')
            ])
            
            categories.value = categoriesRes || []
            groups.value = groupsRes || []
            conferences.value = conferencesRes || []
            
        } catch (err) {
            console.error('Error loading filters:', err)
        }
    }

    const loadPosts = async () => {
        loading.value = true
        error.value = null

        try {
            const params: Record<string, any> = {
                page: filters.value.page || 1,
                per_page: filters.value.per_page || 8
            }
            
            if (filters.value.category_id) {
                params.category_id = filters.value.category_id
            }
            if (filters.value.group_id) {
                params.group_id = filters.value.group_id
            }
            if (filters.value.conference_id) {
                params.conference_id = filters.value.conference_id
            }
            if (filters.value.search) {
                params.search = filters.value.search
            }

            // ✅ Используем $api для автоматического добавления timestamp и заголовков
            const response = await $api<PaginatedResponse<Post>>('/posts', { params })
            
            if (response?.data) {
                posts.value = response.data
                pagination.value = {
                    current_page: response.current_page,
                    last_page: response.last_page,
                    total: response.total,
                    per_page: response.per_page,
                    first_page_url: response.first_page_url,
                    last_page_url: response.last_page_url,
                    next_page_url: response.next_page_url,
                    prev_page_url: response.prev_page_url,
                    links: response.links
                }
            } else {
                posts.value = response || []
            }
            
            updateURL()
            
        } catch (err: any) {
            error.value = err.message || 'Ошибка загрузки'
            console.error('Error loading posts:', err)
        } finally {
            loading.value = false
        }
    }

    const updateURL = () => {
        if (process.client) {
            const params = new URLSearchParams()
            
            if (filters.value.category_id) {
                params.append('category_id', String(filters.value.category_id))
            }
            if (filters.value.group_id) {
                params.append('group_id', String(filters.value.group_id))
            }
            if (filters.value.conference_id) {
                params.append('conference_id', String(filters.value.conference_id))
            }
            if (filters.value.search) {
                params.append('search', filters.value.search)
            }
            if (filters.value.page && filters.value.page > 1) {
                params.append('page', String(filters.value.page))
            }
            
            const queryString = params.toString()
            const newUrl = queryString 
                ? `${window.location.pathname}?${queryString}`
                : window.location.pathname
            
            window.history.replaceState({}, '', newUrl)
        }
    }

    const setFilter = (key: keyof PostFilters, value: any) => {
        filters.value = {
            ...filters.value,
            [key]: value,
            page: 1
        }
        loadPosts()
    }

    const resetFilters = () => {
        filters.value = {
            category_id: null,
            group_id: null,
            conference_id: null,
            search: null,
            page: 1,
            per_page: 8
        }
        loadPosts()
    }

    const goToPage = async (page: number) => {
        filters.value.page = page
        await loadPosts()
        if (process.client) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    return {
        posts,
        pagination,
        loading,
        error,
        filters,
        categories,
        groups,
        conferences,
        loadFilterData,
        loadPosts,
        setFilter,
        resetFilters,
        goToPage
    }
}