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
        { name: 'yandex-verification', content: '2faacdec1b38494c' },
        // ✅ Добавляем мета-теги для предотвращения кэширования
        { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
        { name: 'Pragma', content: 'no-cache' },
        { name: 'Expires', content: '0' },
        { name: 'version', content: new Date().toISOString() }
      ],
      link: [
        // Добавляем шрифты вручную, если нужно
        // { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
      ]
    }
  },
  
  routeRules: {
    '/api/**': { 
      proxy: 'https://wotgospel.ru/api/**',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    },
    '/': { 
      isr: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/sermons': { 
      isr: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/events': { 
      isr: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/about': { 
      isr: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/sermons/**': { 
      swr: 3600,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/events/**': { 
      swr: 3600,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/auth/**': { 
      swr: 0,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/dashboard/**': { 
      swr: 0,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/verify-email': { 
      swr: 0,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/pastor/**': { swr: 0 },
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_FORTIFY_BASE_URL || 'https://wotgospel.ru',
      carouselLimit: process.env.CAROUSEL_LIMIT || 6,
      fortifyOrigin: process.env.NUXT_FORTIFY_ORIGIN || 'https://wotnt.ru',
      appVersion: process.env.npm_package_version || '1.0.0'
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
        maxAge: 3600,
        headers: {
          'Cache-Control': 'public, max-age=3600, must-revalidate'
        }
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