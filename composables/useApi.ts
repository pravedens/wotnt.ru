// composables/useApi.ts

export const useApi = () => {
  const config = useRuntimeConfig()

  const isServer = import.meta.server
  const apiBase = isServer
    ? `${config.public.backendUrl}/api`
    : config.public.apiBase

  const backendUrl = config.public.backendUrl || 'http://localhost:8000'
  const storageUrl = config.public.storageUrl || 'https://storage.yandexcloud.net/wotgospel-media'

  // ✅ Читаем XSRF-TOKEN из cookie
  const getXsrfToken = (): string | null => {
    if (!import.meta.client) return null
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : null
  }

  // ✅ Обычный API-клиент (с /api)
  const $api = $fetch.create({
    baseURL: apiBase,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
    onRequest({ options }) {
      const token = getXsrfToken()
      if (token) {
        const headers = new Headers(options.headers as HeadersInit || {})
        headers.set('X-XSRF-TOKEN', token)
        options.headers = headers
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        console.warn('API: Unauthorized (401)')
      }
    },
  })

  // ✅ Auth-клиент (без /api) — для login/logout/user/register/email
  const $authApi = $fetch.create({
    baseURL: backendUrl,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    onRequest({ options }) {
      const token = getXsrfToken()
      if (token) {
        const headers = new Headers(options.headers as HeadersInit || {})
        headers.set('X-XSRF-TOKEN', token)
        options.headers = headers
      }
    },
  })

  const getImageUrl = (
    path: string | null | undefined,
    type?: 'events' | 'sermons' | 'abouts'
  ): string | null => {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('/storage')) return `${backendUrl}${path}`
    if (path.includes('public/')) return `${backendUrl}/storage/${path.replace('public/', '')}`
    if (path.startsWith('avatars/')) return `${storageUrl}/${path}`
    if (type && !path.includes('/')) return `${backendUrl}/storage/${type}/${path}`
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
    $authApi,
    getImageUrl,
    handleError,
  }
}