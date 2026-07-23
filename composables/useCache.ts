// composables/useCache.ts
import { useRuntimeConfig } from 'nuxt/app'

export function useCache() {
  const config = useRuntimeConfig()
  const isDev = process.env.NODE_ENV === 'development'
  
  // В разработке всегда получаем свежие данные
  const getCacheOptions = (defaultOptions = {}) => {
    if (isDev) {
      return {
        ...defaultOptions,
        server: true,
        initialCache: false,
        // Для Nuxt 4 используем другой подход
        ...(process.env.NUXT_VERSION?.startsWith('4') && {
          experimental: {
            // Настройки для Nuxt 4
          }
        })
      }
    }
    return defaultOptions
  }
  
  return {
    getCacheOptions,
    isDev
  }
}