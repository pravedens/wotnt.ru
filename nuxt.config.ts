// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,

  // ✅ Оставляем только стабильные модули
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    // Временно отключаем проблемные модули:
    // '@nuxt/fonts',
    // '@nuxt/icon',
     '@nuxt/image',
    // '@nuxt/scripts'
  ],

  pinia: {
    storesDirs: ['./stores/**'],
  },
  
  css: [
    '~/assets/css/animations.css'
  ],
  
  tailwindcss: {
    config: {
      theme: {
        extend: {
          screens: {
            'xs': '480px',
          },
        },
      },
    },
  },
  
  app: {
    baseURL: '/',
    buildAssetsDir: '/_nuxt/',
    head: {
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes' },
        { name: 'format-detection', content: 'telephone=no' },
        {
          name: 'yandex-verification',
          content: '2faacdec1b38494c'
        }
      ],
      link: [
        // Добавляем шрифты вручную, если нужно
        // { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
      ]
    }
  },
  
  routeRules: {
    '/api/**': { proxy: 'https://wotgospel.ru/api/**' },
    '/': { isr: true },
    '/sermons': { isr: true },
    '/events': { isr: true },
    '/about': { isr: true },
    '/sermons/**': { swr: 3600 },
    '/events/**': { swr: 3600 },
    '/auth/**': { swr: 0 },
    '/dashboard/**': { swr: 0 },
    '/verify-email': { swr: 0 },
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_FORTIFY_BASE_URL || 'https://wotgospel.ru',
      carouselLimit: process.env.CAROUSEL_LIMIT || 6,
      fortifyOrigin: process.env.NUXT_FORTIFY_ORIGIN || 'https://wotnt.ru'
    }
  },
  
  nitro: {
    compressPublicAssets: true,
    minify: true,
    serveStatic: true,
    preset: 'node-server',
    output: {
      dir: '.output'
    },
    publicAssets: [
      {
        dir: 'public',
        maxAge: 3600
      }
    ],
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sermons', '/events', '/about'],
      ignore: ['/sermons/**', '/events/**', '/auth/**', '/dashboard/**']
    },
    devProxy: {
      '/api': {
        target: 'https://wotgospel.ru',
        changeOrigin: true,
        headers: {
          'Cookie': '' // Для передачи cookies
        }
      }
    }
  },
  
  experimental: {
    payloadExtraction: true,
    clientFallback: true
  },
  
  sourcemap: {
    server: false,
    client: false
  },
  
  vite: {
    build: {
      minify: 'esbuild',
      cssMinify: true,
      chunkSizeWarningLimit: 1000
    }
  }
})