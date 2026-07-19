export const useImageUrl = () => {
    const config = useRuntimeConfig()
    
    const baseUrl = config.public.apiBase || 'https://wotgospel.ru'
    
    const getImageUrl = (path: string | null | undefined, type?: 'events' | 'sermons' | 'abouts' | 'courses'): string | null => {
        if (!path) return null
        
        // Если уже полный URL
        if (path.startsWith('http')) {
            return path
        }
        
        let cleanPath = path
        
        if (cleanPath.startsWith('/')) {
            cleanPath = cleanPath.substring(1)
        }
        
        if (cleanPath.includes('storage/')) {
            cleanPath = cleanPath.replace('storage/', '')
        }
        
        if (cleanPath.includes('public/')) {
            cleanPath = cleanPath.replace('public/', '')
        }
        
        // ✅ Аватары
        if (cleanPath.startsWith('avatars/')) {
            return `https://storage.yandexcloud.net/wotgospel-media/${cleanPath}`
        }
        
        // ✅ Курсы библейской школы
        if (cleanPath.startsWith('bible-courses/')) {
            return `https://storage.yandexcloud.net/wotgospel-media/${cleanPath}`
        }
        
        // ✅ События
        if (cleanPath.startsWith('events/thumbnails/')) {
            return `https://storage.yandexcloud.net/wotgospel-media/${cleanPath}`
        }
        
        // ✅ Проповеди
        if (cleanPath.startsWith('posts/thumbnails/')) {
            return `https://storage.yandexcloud.net/wotgospel-media/${cleanPath}`
        }
        
        // ✅ Статьи
        if (cleanPath.startsWith('abouts/thumbnails/')) {
            return `https://storage.yandexcloud.net/wotgospel-media/${cleanPath}`
        }
        
        // Если указан тип и путь не содержит слешей
        if (type && !cleanPath.includes('/')) {
            return `${baseUrl}/storage/${type}/${cleanPath}`
        }
        
        // Для всего остального
        return `${baseUrl}/storage/${cleanPath}`
    }

    const getImageUrlWithTimestamp = (path: string | null | undefined, type?: 'events' | 'sermons' | 'abouts' | 'courses'): string | null => {
        const url = getImageUrl(path, type)
        if (!url) return null
        
        if (url.startsWith('http') && !url.includes('storage.yandexcloud.net')) {
            return `${url}?_t=${Date.now()}`
        }
        
        return url
    }

    return {
        getImageUrl,
        getImageUrlWithTimestamp,
        baseUrl
    }
}