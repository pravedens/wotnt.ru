// types/yandex-metrika.d.ts
export {}

declare global {
  interface Window {
    ym?: {
      // Для инициализации
      (counterId: number, action: 'init', params: {
        clickmap?: boolean
        trackLinks?: boolean
        accurateTrackBounce?: boolean
        webvisor?: boolean
        trackHash?: boolean
      }): void
      // Для целей (reachGoal) — 4 аргумента
      (counterId: number, action: 'reachGoal', eventName: string, params?: Record<string, any>): void
      // Для других действий
      (counterId: number, action: 'hit', url: string, params?: Record<string, any>): void
      (counterId: number, action: 'params', params: Record<string, any>): void
      (counterId: number, action: 'userParams', params: Record<string, any>): void
      (counterId: number, action: 'setUserID', userId: string): void
    }
  }
}