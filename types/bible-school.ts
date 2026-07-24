// ~/types/bible-school.ts

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
  lessons?: BibleLesson[]
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
  middle_name?: string 
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

// ✅ Добавляем интерфейсы для учителя
export interface TeacherDashboardStats {
  students_count: number
  lessons_count: number
  courses_count: number
  pending_essays_count: number
  pending_enrollments_count: number
}

export interface TeacherDashboardResponse {
  stats: TeacherDashboardStats
  pending_essays: Essay[]
  enrollment_requests: EnrollmentRequest[]
}

export interface ReviewEssayData {
  score: number
  feedback: string
  status: 'approved' | 'rejected'
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

export interface RegistrationsResponse extends ApiResponse {
  registrations: any[]
}

export interface EnrollmentStatusResponse {
  is_enrolled: boolean
  has_request?: boolean
  status?: string
}

export interface ProgressResponse {
  success: boolean
  overall: {
    percentage: number
    level?: string
  }
  courses: any[]
}

export interface CertificatesResponse {
  success: boolean
  certificates: any[]
}

export interface PartyResponse {
  has_party: boolean
  party: any
}

export interface AvatarUploadResponse {
  avatar: string
  message?: string
}

export interface ProfileUpdateResponse {
  user: User
  email_verification_required?: boolean
  message?: string
}

export interface NotificationSettingsResponse {
  success: boolean
  settings: any
}