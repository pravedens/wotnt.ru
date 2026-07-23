// server/middleware/cache.ts
import { defineEventHandler } from 'h3'
import { ensureCacheDirectory } from '../utils/cache'

export default defineEventHandler(async (event) => {
  // Создаём папку для кэша для текущего маршрута
  const path = event.path || ''
  
  // Определяем тип контента из URL
  let cacheType = 'default'
  if (path.startsWith('/events')) cacheType = 'events'
  else if (path.startsWith('/sermons')) cacheType = 'sermons'
  else if (path.startsWith('/about')) cacheType = 'about'
  else if (path.startsWith('/bible-school')) cacheType = 'bible-school'
  else if (path.startsWith('/offline')) cacheType = 'offline'
  else if (path.startsWith('/auth')) cacheType = 'auth'
  else if (path.startsWith('/dashboard')) cacheType = 'dashboard'
  else if (path.startsWith('/pastor')) cacheType = 'pastor'
  
  // Создаём папку для кэша
  ensureCacheDirectory(`.nuxt/cache/nuxt/payload/${cacheType}`)
})