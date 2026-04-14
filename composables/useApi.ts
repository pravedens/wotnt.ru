export const useApi = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    const baseUrl = config.public.apiBase // https://wotgospel.ru

    // Получение заголовков с Bearer токеном
    const getHeaders = (withAuth: boolean = true): Record<string, string> => {
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        
        if (withAuth) {
            const token = authStore.token
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
        }
        
        return headers
    }

    const getImageUrl = (path: string | null | undefined, type?: 'events' | 'sermons' | 'abouts'): string | null => {
    if (!path) return null
    if (path.startsWith('http')) return path
    if (path.startsWith('/storage')) return `${baseUrl}${path}`
    if (path.includes('public/')) return `${baseUrl}/storage/${path.replace('public/', '')}`
    // ✅ Для аватаров на S3
    if (path.startsWith('avatars/')) return `https://storage.yandexcloud.net/wotgospel-media/${path}`
    if (type && !path.includes('/')) return `${baseUrl}/storage/${type}/${path}`
    return `${baseUrl}/storage/${path}`
}

    const handleError = (err: any): string => {
        if (err?.data?.message) return err.data.message
        if (err?.message) return err.message
        return 'Произошла ошибка'
    }

    return {
        baseUrl,
        getHeaders,
        getImageUrl,
        handleError
    }
}