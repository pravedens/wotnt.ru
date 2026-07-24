// ~/types/sermon.ts

export interface Category {
  id: number
  title: string      
  slug: string
  description?: string | null
  thumbnail?: string | null
  created_at?: string | null
  updated_at?: string | null
  posts_count?: number
}

export interface Group {
  id: number
  title: string     
  slug: string
  created_at?: string | null
  updated_at?: string | null
  posts_count?: number
}

export interface Conference {
  id: number
  title: string    
  slug: string
  created_at?: string | null
  updated_at?: string | null
  posts_count?: number
}

export interface Post {
  id: number
  title: string
  slug: string
  description: string
  content: string
  
  // Внешние ключи
  category_id: number
  group_id: number
  conference_id: number
  user_id: number
  
  thumbnail: string | null
  og_image?: string 
  
  // Внешние ссылки
  youtube: string | null
  rutube: string | null
  dzen: string | null
  vkVideo: string | null
  
  // Аудио файл
  audio_file: string | null
  audio_filename: string | null
  audio_size: number | null
  audio_mime: string | null
  audio: string | null
  
  // Текстовый файл
  text_file: string | null
  text_filename: string | null
  text_size: number | null
  text_mime: string | null
  text: string | null
  display_text_filename?: string | null
  
  // Связи (загружаются через with)
  category?: Category | null
  group?: Group | null
  conference?: Conference | null
  
  // Даты
  created_at: string | null
  updated_at: string | null
  
  // Статистика
  views_count: number
  likes_count: number
  
  // Дополнительные поля (для фронтенда)
  clean_description?: string
  clean_content?: string
  thumbnail_url?: string | null
  audio_url?: string | null
  text_url?: string | null
  audio_size_formatted?: string | null
  text_size_formatted?: string | null
  is_liked?: boolean
  is_favorite?: boolean
}

export interface PostFilters {
  category_id?: number | null
  group_id?: number | null
  conference_id?: number | null
  search?: string | null
  page?: number
  per_page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// ✅ Добавляем интерфейс для хлебных крошек
export interface Breadcrumb {
  title: string
  to?: any
}

export interface FavoritesResponse {
    data?: Post[]
    [key: string]: any
}