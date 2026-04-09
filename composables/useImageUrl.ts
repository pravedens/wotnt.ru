export const useImageUrl = () => {
  const config = useRuntimeConfig()
  
  // Базовый URL бекенда (Laravel)
  const baseUrl = config.public.apiBase || 'https://wotgospel.ru'
  
  const getImageUrl = (path: string | null | undefined, type?: 'events' | 'sermons' | 'abouts'): string | null => {
    if (!path) return null
    
    console.log('🔍 Original path:', path)
    
    // Если уже полный URL
    if (path.startsWith('http')) {
      console.log('✅ Full URL:', path)
      return path
    }
    
    let cleanPath = path
    
    // Убираем лишние слэши в начале
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1)
    }
    
    // Если путь содержит storage/
    if (cleanPath.includes('storage/')) {
      cleanPath = cleanPath.replace('storage/', '')
    }
    
    // Если путь содержит public/
    if (cleanPath.includes('public/')) {
      cleanPath = cleanPath.replace('public/', '')
    }
    
    // Формируем полный URL
    const fullUrl = `${baseUrl}/storage/${cleanPath}`
    console.log('✅ Generated URL:', fullUrl)
    
    return fullUrl
  }

  return {
    getImageUrl,
    baseUrl
  }
}