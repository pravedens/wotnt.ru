export interface ConferenceService {
  id?: number
  title: string
  service_date: string
  start_time?: string
  speaker?: string
  description?: string
  capacity?: number
  available_count?: number 
}

// ✅ Интерфейс для формы события
export interface EventFormData {
  title: string
  startDate: string
  startTime: string
  color: string
  description: string
  content: string
  info: string
  show_in_carousel: boolean
  is_published: boolean
  is_past: boolean
  members_only: boolean
  ministers_only: boolean
  thumbnail: File | null
  is_conference: boolean
  conferenceServices: ConferenceService[]
}

// ✅ Интерфейс для данных события из API
export interface EventData {
  id: number
  title: string
  startDate?: string
  startTime?: string
  color?: string
  description?: string
  content?: string
  info?: string
  thumbnail?: string
  show_in_carousel?: boolean
  is_published?: boolean
  is_past?: boolean
  members_only?: boolean
  ministers_only?: boolean
  is_conference?: boolean
  conference_services?: ConferenceService[]
}

// ✅ Добавляем интерфейсы для ответов API
export interface RegistrationResponse {
  registered: boolean
  registration?: {
    status: string
  }
}

export interface SubmitRegistrationResponse {
  success: boolean
  message?: string
}

export interface Event {
  id: number
  title: string
  slug: string
  description?: string
  time?: string | null
  content?: string
  thumbnail?: string
  startDate: string
  startTime?: string
  info?: string
  startWeek?: string
  startDay?: string
  startMonth?: string
  created_at: string
  updated_at: string
  color?: string
  show_in_carousel?: boolean
  is_published?: boolean
  is_past?: boolean
  can_edit?: boolean
  members_only?: boolean
  ministers_only?: boolean
  is_conference?: boolean 
  conference_services?: ConferenceService[]
  
  // Аксессоры из модели
  full_date?: string
  display_date?: string
  display_date_time?: string
  event_date?: string
  event_time?: string
  
  // 🆕 Для кнопки «Я приду»
  attendees_count?: number
  user_attending?: boolean
  status?: 'active' | 'cancelled' | 'past'
  is_cancelled?: boolean  // удобный геттер
}

export interface DayEvents {
  [day: string]: CalendarEvent[]
}

export interface CalendarEvent {
  id: number
  title: string
  slug: string
  color?: string
  time?: string | null
  description?: string
  startDate?: string
  startTime?: string
  show_in_carousel?: boolean
  is_published?: boolean
  members_only?: boolean
  ministers_only?: boolean
  is_past?: boolean
  can_edit?: boolean
}

export interface CalendarDay {
  day: number
  date: string
  month: number
  year: number
  weekday: number
  events: CalendarEvent[]
  isCurrentMonth: boolean
}

export interface MonthData {
  year: number
  month: number
  events: DayEvents
  list: Event[]
  is_admin?: boolean
}

export interface TransformedMonthData {
  list?: Event[]
  events?: Record<number, Event[]>
}

export interface CarouselStatsResponse {
  total: number
  in_carousel: number
  limit?: number
  available?: number
}