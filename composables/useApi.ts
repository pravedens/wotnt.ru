export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  
  const baseUrl = config.public.apiBase // https://wotgospel.ru
  const fortifyOrigin = config.public.fortifyOrigin // https://wotnt.ru
  
  const getCsrfToken = (): string | null => {
    if (process.client) {
      const value = `; ${document.cookie}`
      const parts = value.split(`; XSRF-TOKEN=`)
      if (parts.length === 2) {
        return decodeURIComponent(parts.pop()?.split(';').shift() || '')
      }
    }
    return null
  }

  // ✅ Исправленные заголовки
  const getHeaders = (withAuth: boolean = true, multipart: boolean = false): Record<string, string> => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Origin': fortifyOrigin
    }
    
    if (!multipart) {
      headers['Content-Type'] = 'application/json'
    }
    
    const xsrfToken = getCsrfToken()
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken
    }
    
    // ✅ Пытаемся получить токен из store или localStorage
    if (withAuth) {
      let token = authStore.token
      if (process.client && !token) {
        token = localStorage.getItem('auth_token')
      }
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
    if (type && !path.includes('/')) return `${baseUrl}/storage/${type}/${path}`
    return `${baseUrl}/storage/${path}`
  }

  const handleError = (err: any): string => {
    if (err.response?._data?.message) return err.response._data.message
    if (err.response?._data?.error) return err.response._data.error
    if (err.message) return err.message
    return 'Произошла ошибка'
  }

  return {
    baseUrl,
    fortifyOrigin,
    getHeaders,
    getCsrfToken,
    getImageUrl,
    handleError
  }
}