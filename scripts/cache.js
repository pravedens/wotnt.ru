// scripts/cache.js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const cacheDir = path.join(rootDir, '.nuxt', 'cache')

// ТОЛЬКО подпапки для разных типов контента
// НЕ включаем сам 'payload' как папку!
const cacheSubDirs = [
  '.nuxt/cache/nuxt/payload/events',
  '.nuxt/cache/nuxt/payload/sermons',
  '.nuxt/cache/nuxt/payload/about',
  '.nuxt/cache/nuxt/payload/bible-school',
  '.nuxt/cache/nuxt/payload/offline',
  '.nuxt/cache/nuxt/payload/auth',
  '.nuxt/cache/nuxt/payload/dashboard',
  '.nuxt/cache/nuxt/payload/pastor',
]

const command = process.argv[2] || 'ensure'

if (command === 'clear') {
  console.log('🧹 Clearing Nuxt cache...')
  
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true })
    console.log('✅ Cache cleared')
  } else {
    console.log('ℹ️ Cache directory not found')
  }
  
  // Создаём только подпапки
  for (const dir of cacheSubDirs) {
    const fullPath = path.join(rootDir, dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(`✅ Created: ${dir}`)
    }
  }
  
  console.log('✅ Cache reset complete!')
  
} else if (command === 'ensure') {
  console.log('📁 Ensuring cache directories exist...')
  
  let created = 0
  for (const dir of cacheSubDirs) {
    const fullPath = path.join(rootDir, dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(`✅ Created: ${dir}`)
      created++
    }
  }
  
  if (created === 0) {
    console.log('✅ All directories already exist')
  } else {
    console.log(`✅ Created ${created} directories`)
  }
  
} else {
  console.log('❌ Unknown command. Use: "ensure" or "clear"')
  console.log('  npm run cache:ensure  - Create cache directories')
  console.log('  npm run cache:clear   - Clear and recreate cache')
  process.exit(1)
}