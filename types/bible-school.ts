export interface BibleCourse {
  id: number
  title: string
  slug: string
  description: string
  image_url: string
  order: number
  is_published: boolean
  progress?: {
    completed: number
    total: number
    percentage: number
  }
  teachers?: Teacher[]
  themes?: BibleTheme[]
}

export interface BibleTheme {
  id: number
  title: string
  slug: string
  description: string
  order: number
  is_published: boolean
  teacher_id?: number
  teacher?: Teacher
  lessons?: BibleLesson[]
}

export interface BibleLesson {
  id: number
  course_id: number
  theme_id?: number
  title: string
  slug: string
  order: number
  call_question?: string
  call_answer?: string
  scripture_verses?: string
  content?: string
  practice_task?: string
  video_url?: string
  pdf_conspect_url?: string
  is_published: boolean
  status?: 'not_started' | 'call_completed' | 'scripture_completed' | 'video_watched' | 'practice_completed' | 'test_passed' | 'completed'
  is_locked?: boolean
  videos?: LessonVideo[]
}

export interface LessonVideo {
  id: number
  title: string
  embed_url: string
  platform: string
  order: number
}

export interface Teacher {
  id: number
  name: string
  last_name: string
  full_name: string
  avatar_url: string
  about?: string
}

export interface EnrollmentRequest {
  id: number
  user_id: number
  status: 'pending' | 'approved' | 'rejected'
  city?: string
  church_name?: string
  phone?: string
  birth_date?: string
  about?: string
  marital_status?: string
  gender?: string
  ministry?: string
  user?: {
    id: number
    full_name: string
    email: string
  }
}

export interface Essay {
  id: number
  user_id: number
  lesson_id: number
  content: string
  status: 'pending' | 'approved' | 'rejected'
  teacher_feedback?: string
  score?: number
  user?: {
    id: number
    full_name: string
  }
  lesson?: {
    id: number
    title: string
  }
}