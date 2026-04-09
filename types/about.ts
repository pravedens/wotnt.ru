export interface About {
  id: number
  title: string
  slug: string
  description: string
  content: string
  thumbnail?: string
  denomination_id: number
  denomination?: Denomination
  created_at: string
  updated_at: string
}

export interface Denomination {
  id: number
  title: string
  slug: string
  about_count?: number
  abouts?: About[]
  created_at: string
  updated_at: string
}