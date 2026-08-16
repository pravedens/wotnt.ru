// server/api/[...].ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl || 'http://localhost:8000'
  
  const path = event.path.replace('/api', '')
  const method = event.method
  const body = method !== 'GET' ? await readBody(event).catch(() => ({})) : undefined
  const query = getQuery(event)
  
  // Копируем заголовки
  const headers: Record<string, string> = {}
  for (const [key, value] of event.headers.entries()) {
    if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers[key] = value
    }
  }
  
  const targetUrl = `${backendUrl}/api${path}`
  
  try {
    const response = await $fetch(targetUrl, {
      method,
      body,
      headers,
      query,
    })
    return response
  } catch (error: any) {
    console.error('❌ Proxy error:', {
      url: targetUrl,
      method,
      status: error.status,
      message: error.message,
    })
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || 'Backend error',
      data: error.data,
    })
  }
})