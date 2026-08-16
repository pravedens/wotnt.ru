// composables/useApi.ts

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // ✅ Для SSR используем полный URL, для клиента — относительный
  const isServer = import.meta.server
  const apiBase = isServer 
    ? `${config.public.backendUrl}/api`  // На сервере — полный URL
    : config.public.apiBase              // На клиенте — относительный (/api)

  const backendUrl = config.public.backendUrl || 'http://wotgospel.local'
  const storageUrl = config.public.storageUrl || 'https://storage.yandexcloud.net/wotgospel-media'

  const $api = $fetch.create({
    baseURL: apiBase,  // 👈 Используем правильный baseURL
    
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },

    onRequest({ options }) {
      const token = authStore?.token
      if (!token) return

      const headers = new Headers(options.headers as HeadersInit || {})
      headers.set('Authorization', `Bearer ${token}`)
      options.headers = headers
    },

    onResponseError({ request, response }) {
      if (response.status === 401 && authStore?.token) {
        console.warn('API: Unauthorized, logging out')
        authStore.logout()
        if (import.meta.client) {
          navigateTo('/auth/login')
        }
      }
    },
  })

  // Вспомогательные функции для работы с изображениями
  const getImageUrl = (
    path: string | null | undefined,
    type?: 'events' | 'sermons' | 'abouts'
  ): string | null => {
    if (!path) return null

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    if (path.startsWith('/storage')) {
      return `${backendUrl}${path}`
    }

    if (path.includes('public/')) {
      return `${backendUrl}/storage/${path.replace('public/', '')}`
    }

    if (path.startsWith('avatars/')) {
      return `${storageUrl}/${path}`
    }

    if (type && !path.includes('/')) {
      return `${backendUrl}/storage/${type}/${path}`
    }

    return `${backendUrl}/storage/${path}`
  }

  const handleError = (err: any): string => {
    if (err?.data?.message) return err.data.message
    if (err?.message) return err.message
    return 'Произошла ошибка'
  }

  return {
    backendUrl,
    apiBase,
    storageUrl,
    $api,
    getImageUrl,
    handleError,
  }
}