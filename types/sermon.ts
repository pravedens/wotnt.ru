export interface Post {
  id: number
  title: string
  slug: string
  description: string
  content: string
  thumbnail: string | null
  thumbnail_url?: string | null
  
  // Аудио файл
  audio_file: string | null
  audio_url?: string | null
  audio_filename: string | null
  audio_size: number | null
  audio_size_formatted?: string | null
  audio_mime: string | null
  
  // Текстовый файл
  text_file: string | null
  text_url?: string | null
  text_filename: string | null
  text_size: number | null
  text_size_formatted?: string | null
  text_mime: string | null
  
  // Внешние ссылки
  youtube: string | null
  rutube: string | null
  dzen: string | null
  vkVideo: string | null
  
  // Связи
  category: Category | null
  group: Group | null
  conference: Conference | null
  
  // Даты
  created_at: string
  updated_at: string
  
  // Статистика
  likes_count?: number
  views_count?: number
  is_liked?: boolean
  is_favorite?: boolean
}

export interface Category {
  id: number
  name: string
  slug: string
  posts_count?: number
}

export interface Group {
  id: number
  name: string
  slug: string
  posts_count?: number
}

export interface Conference {
  id: number
  name: string
  slug: string
  year?: number
  posts_count?: number
}

export interface PostFilters {
  category_id?: number | null
  group_id?: number | null
  conference_id?: number | null
  search?: string | null
  page?: number
  per_page?: number
}

export type { PaginatedResponse } from './api'