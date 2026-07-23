// types/yandex-metrika.d.ts
export {}

declare global {
  interface Window {
    ym?: (
      counterId: number,
      action: 'init' | 'reachGoal' | 'hit' | 'params' | 'userParams' | 'setUserID',
      eventName?: string,
      params?: Record<string, any>
    ) => void
  }
}