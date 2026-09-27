export const useFormatDate = () => {
  /**
   * Форматирует дату как "27 сентября 2026"
   * Месяц в родительном падеже (автоматически через Intl).
   */
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return ''
    try {
      return new Date(dateString)
        .toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        .replace(' г.', '')
    } catch {
      return ''
    }
  }

  /**
   * Форматирует дату с временем: "27 сентября 2026, 15:30"
   */
  const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return ''
    try {
      return new Date(dateString)
        .toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(' г.,', ',')
    } catch {
      return ''
    }
  }

  /**
   * Короткий формат: "27.09.2026"
   */
  const formatDateShort = (dateString?: string | null): string => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('ru-RU')
    } catch {
      return ''
    }
  }

  return { formatDate, formatDateTime, formatDateShort }
}