export interface About {
  id: number
  title: string
  slug: string
  description: string
  content: string
  thumbnail?: string | null
  denomination_id: number
  denomination?: Denomination
  views?: number 
  created_at: string | null
  updated_at: string | null
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

export interface Category {
  id: string;
  slug: string;
  name: string;
  about_count?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string | null;
  description: string;
  created_at: string | null;
  updated_at: string | null;
  views: number;
  denomination?: {
    id: string;
    title: string;
    slug: string;
  };
}