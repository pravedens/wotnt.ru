// server/plugins/cache.ts
import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import fs from 'node:fs'
import path from 'node:path'

export default defineNitroPlugin(() => {
  const rootDir = process.cwd()
  
  // ТОЛЬКО подпапки, НЕ включая сам 'payload'
  const cacheDirs = [
    '.nuxt/cache/nuxt/payload/events',
    '.nuxt/cache/nuxt/payload/sermons',
    '.nuxt/cache/nuxt/payload/about',
    '.nuxt/cache/nuxt/payload/bible-school',
    '.nuxt/cache/nuxt/payload/offline',
    '.nuxt/cache/nuxt/payload/auth',
    '.nuxt/cache/nuxt/payload/dashboard',
    '.nuxt/cache/nuxt/payload/pastor',
  ]
  
  for (const dir of cacheDirs) {
    const fullPath = path.join(rootDir, dir)
    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true })
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Cache directory created: ${dir}`)
        }
      } catch (err) {
        // Игнорируем ошибки, если папка уже существует
      }
    }
  }
})