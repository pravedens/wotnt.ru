// ~/types/window.d.ts

import type Echo from 'laravel-echo'

export {}

declare global {
  interface Window {
    showNotification?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
    Echo?: Echo
  }
}

// ✅ Добавляем тип для NuxtApp
declare module '#app' {
  interface NuxtApp {
    $echo: Echo
  }
}