// /types/bible.ts

export interface BibleVerse {
  id: number
  title: string
  description: string
  slug: string
  date: string | null
  created_at?: string
  updated_at?: string
}

export interface BibleVerseResponse {
  success: boolean
  data: BibleVerse | null
  message: string
}

export interface BibleVersesListResponse {
  current_page: number
  data: BibleVerse[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface BibleVerseFilters {
  search?: string
  page?: number
  per_page?: number
}