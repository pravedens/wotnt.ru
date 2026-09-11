import DOMPurify from 'isomorphic-dompurify'

export const useSanitize = () => {
  const sanitize = (html: string): string => {
    return DOMPurify.sanitize(html)
  }

  return { sanitize }
}