export interface Event {
  id: number
  title: string
  slug: string
  description?: string
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
  
  // Аксессоры из модели
  full_date?: string
  display_date?: string
  display_date_time?: string
  event_date?: string
  event_time?: string
}

export interface DayEvents {
  [day: string]: CalendarEvent[]
}

export interface CalendarEvent {
  id: number
  title: string
  slug: string
  color?: string
  time?: string
  is_published?: boolean
  is_past?: boolean
  can_edit?: boolean
}

export interface MonthData {
  year: number
  month: number
  events: DayEvents
  list: Event[]
  is_admin?: boolean
}