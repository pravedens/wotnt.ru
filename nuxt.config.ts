// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  
  experimental: {
    payloadExtraction: true,
    clientFallback: true,
    // Включаем ленивую загрузку страниц
    asyncEntry: true,
    pages: true 
    },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxt/image',
  '@vite-pwa/nuxt'],

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
        { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
        { name: 'Pragma', content: 'no-cache' },
        { name: 'Expires', content: '0' },
        // PWA meta теги
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'WoTNT' },
        { name: 'theme-color', content: '#4f46e5' },
        { name: 'msapplication-TileColor', content: '#4f46e5' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/favicon/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32.png' },
        { rel: 'preconnect', href: 'https://storage.yandexcloud.net' },
        { rel: 'dns-prefetch', href: 'https://storage.yandexcloud.net' }
      ],
      script: process.client ? [
        { 
          children: `console.log('App version: ${new Date().toISOString()}')`,
          type: 'text/javascript'
        },
        {
            src: 'https://smartcaptcha.cloud.yandex.ru/captcha.js',
            defer: true
        }
      ] : []
    }
  },
  
  routeRules: {
    '/icons/**': {
        headers: {
            'Cache-Control': 'public, max-age=31536000, immutable'
        }
    },
    '/version.json': {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    },
    '/api/**': { 
      proxy: 'https://wotgospel.ru/api/**',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/': { 
      isr: true,
      lazy: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/sermons': { 
      isr: true,
      lazy: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/events': { 
      isr: true,
      lazy: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/about': { 
      isr: true,
      lazy: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/bible-school': { 
      isr: true,
      lazy: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/sermons/**': { 
      swr: 3600,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/events/**': { 
      swr: 3600,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/auth/**': { 
      swr: 0,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/dashboard/**': { 
      swr: 0,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/verify-email': { 
      swr: 0,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    },
    '/pastor/**': { 
      swr: 0,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    },
    '/offline': {
      swr: 86400,
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    }
  },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_FORTIFY_BASE_URL || 'https://wotgospel.ru',
      carouselLimit: process.env.CAROUSEL_LIMIT || 6,
      fortifyOrigin: process.env.NUXT_FORTIFY_ORIGIN || 'https://wotnt.ru',
      appVersion: process.env.npm_package_version || '1.0.0',
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || 'BHI-yFDLo4lx0oNdXlMD2PmGi7cZWGYpK5NilsPdOHSUk3ELnqze--Sh1Hj4j690-M1TRivckGbJlVmFvLaN_qM',
      yandexCaptchaSiteKey: process.env.YANDEX_CAPTCHA_SITE_KEY || 'ysc1_5UMedPDzQ3ylmjk4hVRCvHz38fVzrFifDuBoLdaq5adbeebd',
      
    reverbAppKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY,
            reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST,
            reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT,
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
          'Cache-Control': 'public, max-age=3600, must-revalidate',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
        }
      }
    ],
    prerender: {
      crawlLinks: false,
      routes: [],
      ignore: ['/sermons/**', '/events/**', '/auth/**', '/dashboard/**', '/pastor/**']
    },
    devProxy: {
      '/api': {
        target: 'https://wotgospel.ru',
        changeOrigin: true,
        headers: {
          'Cookie': ''
        }
      }
    }
  },
  
  sourcemap: {
    server: false,
    client: false
  },
  
build: {
    transpile: ['@nuxtjs/tailwindcss']
},
  
 vite: {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia', '@vueuse/core']
        }
      }
    }
  }
},
  
  // PWA КОНФИГУРАЦИЯ ДЛЯ SERVICE WORKER
  pwa: {
    registerType: 'autoUpdate',
    // Отключаем генерацию манифеста, используем свой
    manifest: false,
    workbox: {
      navigateFallback: '/offline',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      // Добавляем ваш sw.js в исключения, чтобы не перезаписывать
      globIgnores: ['**/sw.js', '**/manifest.webmanifest'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/wotgospel\.ru\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60
            }
          }
        },
        {
          urlPattern: /^https:\/\/storage\.yandexcloud\.net\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 7
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        }
      ]
    },
    devOptions: {
      enabled: process.env.NODE_ENV === 'development',
      type: 'module'
    }
  }
})