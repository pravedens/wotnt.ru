// server/utils/cache.ts
import fs from 'node:fs'
import path from 'node:path'

/**
 * Гарантирует, что папка для кэша существует
 */
export function ensureCacheDirectory(dirPath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), dirPath)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      return true
    }
    return true
  } catch (err) {
    console.error(`Failed to ensure cache directory: ${dirPath}`, err)
    return false
  }
}

/**
 * Получает безопасный путь для кэша с автоматическим созданием папки
 */
export function getCachePath(...segments: string[]): string {
  const fullPath = path.join(process.cwd(), '.nuxt', 'cache', 'nuxt', 'payload', ...segments)
  const dirPath = path.dirname(fullPath)
  ensureCacheDirectory(dirPath)
  return fullPath
}