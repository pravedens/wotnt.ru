// server/api/[...].ts
export default defineEventHandler(async (event) => {
  // Логируем запрос
  //console.log('🚀 Proxy received:', event.path)
  
  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl || 'http://wotgospel.local'
  
  // Убираем /api из пути
  const path = event.path.replace('/api', '')
  const method = event.method
  const body = method !== 'GET' ? await readBody(event).catch(() => ({})) : undefined
  const query = getQuery(event)
  
  // Копируем заголовки
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  
  for (const [key, value] of event.headers.entries()) {
    if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers[key] = value
    }
  }
  
  const targetUrl = `${backendUrl}/api${path}`
  //console.log('➡️ Target:', targetUrl)
  
  try {
    const response = await $fetch(targetUrl, {
      method,
      body,
      headers,
      query,
    })
    
    return response
  } catch (error: any) {
    console.error('❌ Proxy error:', error.message)
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || 'Backend error',
      data: error.data,
    })
  }
})