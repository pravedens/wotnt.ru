// ~/types/chat.ts

export interface Conversation {
  id: number
  type: 'private' | 'teacher_student' | 'group'
  other_user?: {
    id: number
    full_name: string
    avatar_url: string
  }
  last_message?: Message
  last_message_at?: string
  unread_count: number
  party_id?: number
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  sender_name: string
  sender_avatar?: string
  receiver_id: number
  message: string
  type: 'text' | 'image' | 'file' | 'system'
  attachments?: any[]
  is_mine: boolean
  is_read: boolean
  created_at: string
}

export interface ConversationResponse { // При создании или поиске одной беседы
  success: boolean
  data: {
    conversation_id: number
  }
}

export interface UnreadCountResponse { // НЕПРОЧИТАННЫЕ
  count: number
  success?: boolean
}

export interface MessagesResponse { // СООБЩЕНИЯ В БЕСЕДЕ
  messages?: {
    data: Message[]
    total: number
    per_page: number
    current_page: number
    last_page: number
    next_page_url?: string | null
    prev_page_url?: string | null
  }
  data?: Message[]
  success?: boolean
}

export interface SendMessageResponse { // ОТПРАВКА СООБЩЕНИЯ 
  success: boolean
  message?: string
  data?: Message
}

export interface ConversationsResponse { // При получении списка всех бесед
  success: boolean
  data: Conversation[]
  total?: number
  unread_count?: number
}

export interface SearchUsersResponse {
  users: {
    id: number
    name: string
    full_name?: string
    email: string
    avatar_url?: string
    roles?: string[]
  }[]
}