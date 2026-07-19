import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const screenshotsDir = path.join(__dirname, '../public/screenshots')

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const urls = [
  { path: '/', name: 'mobile', label: 'Главная' },
  { path: '/events', name: 'mobile-events', label: 'События' },
  { path: '/contacts', name: 'mobile-contacts', label: 'Контакты' }
]

const desktopUrls = [
  { path: '/', name: 'desktop', label: 'Главная (десктоп)' },
  { path: '/events', name: 'desktop-events', label: 'События (десктоп)' }
]

const takeScreenshots = async () => {
  console.log('🚀 Запуск браузера...')
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  })
  
  const takeScreenshot = async (page, url, name, type) => {
    try {
      await page.goto(`https://wotnt.ru${url}`, { 
        waitUntil: 'networkidle0',
        timeout: 15000 // уменьшил таймаут
      })
      
      await wait(500) // уменьшил задержку
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, `${name}.webp`),
        type: 'webp',
        quality: 70,
        fullPage: true
      })
      console.log(`  ✅ ${name}.webp`)
    } catch (err) {
      console.error(`  ❌ ${name}:`, err.message)
    }
  }

  // Мобильные скриншоты
  console.log('📱 Мобильные...')
  const mobilePage = await browser.newPage()
  await mobilePage.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1.5 })
  
  for (const url of urls) {
    await takeScreenshot(mobilePage, url.path, url.name, 'mobile')
  }
  await mobilePage.close()

  // Десктоп скриншоты
  console.log('💻 Десктоп...')
  const desktopPage = await browser.newPage()
  await desktopPage.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
  
  for (const url of desktopUrls) {
    await takeScreenshot(desktopPage, url.path, url.name, 'desktop')
  }
  await desktopPage.close()

  await browser.close()
  console.log('✅ Готово!')
}

takeScreenshots().catch(console.error)