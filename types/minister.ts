// ~/types/minister.ts

export interface SocialLink {
  id: number
  platform: string
  url: string
}

export interface MinisterCategory {
  id: number
  name: string
  icon?: string
  color?: string
  description?: string
}

export interface Minister {
  id: number
  name: string
  last_name?: string
  middle_name?: string
  full_name?: string
  avatar_url?: string
  phone?: string
  city?: string
  church_name?: string
  about?: string
  roles?: string[]
  minister_categories?: MinisterCategory[]
  social_links?: SocialLink[]
  created_at?: string
  updated_at?: string
}

export interface MinistersResponse {
  success: boolean
  ministers: Minister[]
  categories?: MinisterCategory[]
}

export interface MinisterResponse {
  minister: Minister
}

export interface CategoriesResponse {
  categories: MinisterCategory[]
}

export interface SocialLinksResponse {
  social_links: SocialLink[]
}

export interface FieldVisibilitiesResponse {
  visibilities: Record<string, boolean>
}

export interface MyCategoriesResponse {
  categories?: MinisterCategory[]
  minister_categories?: MinisterCategory[]
  selected_categories?: number[]
}

// ============================================
// СООБЩЕНИЯ
// ============================================

export interface MinisterMessage {
  id: number
  sender_name: string
  sender_email?: string
  message: string
  created_at: string
  is_read: boolean
  read_at?: string | null
}

export interface MinisterMessagesResponse {
  data: MinisterMessage[]
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  [key: string]: any
}

export interface MinisterUnreadCountResponse {
  count: number
}

export interface MinisterNotificationSettingsResponse {
  settings: {
    email: boolean
    webpush: boolean
  }
}

// ============================================
// ДАННЫЕ ДЛЯ ЗАПРОСОВ
// ============================================

export interface SendMessageToMinisterData {
  sender_name?: string
  sender_email?: string
  message: string
  captcha_token?: string
}

export interface UpdateSocialLinksData {
  social_links: SocialLink[]
}

export interface UpdateFieldVisibilitiesData {
  visibilities: Record<string, boolean>
}

export interface UpdateMyCategoriesData {
  category_ids: number[]
}