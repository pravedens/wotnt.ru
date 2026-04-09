export interface LiveStream {
  id: number
  title: string
  platform: 'rutube' | 'youtube' | 'vk'
  embedUrl: string
  isActive: boolean
  scheduledStart: string | null
  scheduledEnd: string | null
}

export interface LiveStreamResponse {
  success: boolean
  data: LiveStream | null
  message?: string
}