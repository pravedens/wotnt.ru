import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  ssr: true,
  
  features: {
    inlineStyles: false,
  },

  dir: {
    pages: "pages",
    layouts: "layouts",
  },

  experimental: {
    payloadExtraction: true,
    clientFallback: true,
    asyncEntry: true,
  },

  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@nuxt/image", "nuxt-swiper"],

  tailwindcss: {
    config: {
      theme: {
        extend: {
          screens: {
            xs: "480px",
          },
        },
      },
    },
  },

  pinia: {
    storesDirs: ["./stores/**"],
  },

  //css: ['~/assets/css/main.css'],

  app: {
    baseURL: "/",
    buildAssetsDir: "/_nuxt/",
    head: {
      htmlAttrs: {
        lang: "ru",
      },
      meta: [
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
        },
        { name: "format-detection", content: "telephone=no" },
        { name: "yandex-verification", content: "2faacdec1b38494c" },
        {
          name: "Cache-Control",
          content: "no-cache, no-store, must-revalidate",
        },
        { name: "Pragma", content: "no-cache" },
        { name: "Expires", content: "0" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "apple-mobile-web-app-title", content: "WoTNT" },
        { name: "theme-color", content: "#4f46e5" },
        { name: "msapplication-TileColor", content: "#4f46e5" },
      ],
      link: [
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/favicon/apple-touch-icon.png" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon/favicon-32.png",
        },
        { rel: "preconnect", href: "https://storage.yandexcloud.net" },
        { rel: "dns-prefetch", href: "https://storage.yandexcloud.net" },
      ],
      script: process.client
        ? [
            {
              innerHTML: `console.log('App version: ${new Date().toISOString()}')`,
              type: "text/javascript",
            },
            {
              src: "https://smartcaptcha.cloud.yandex.ru/captcha.js",
              defer: true,
            },
          ]
        : [],
    },
  },

  routeRules: {
    "/icons/**": {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
    "/version.json": {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
    "/": {
      swr: true,
      //isr: process.env.NODE_ENV === "production",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
    // ⚠️ В разработке отключаем всё кэширование
    "/sermons": {
      isr: process.env.NODE_ENV === "production",
      swr: process.env.NODE_ENV === "production" ? 3600 : false,
      cache:
        process.env.NODE_ENV === "production"
          ? { swr: true, maxAge: 3600 }
          : false,
    },
    "/events": {
      isr: process.env.NODE_ENV === "production",
      swr: process.env.NODE_ENV === "production" ? 3600 : false,
      cache:
        process.env.NODE_ENV === "production"
          ? { swr: true, maxAge: 3600 }
          : false,
    },
    "/about": {
      isr: process.env.NODE_ENV === "production",
      swr: process.env.NODE_ENV === "production" ? 3600 : false,
      cache:
        process.env.NODE_ENV === "production"
          ? { swr: true, maxAge: 3600 }
          : false,
    },
    "/bible-school": {
      isr: process.env.NODE_ENV === "production",
      swr: process.env.NODE_ENV === "production" ? 3600 : false,
      cache:
        process.env.NODE_ENV === "production"
          ? { swr: true, maxAge: 3600 }
          : false,
    },
    // ✅ Для всех остальных страниц в разработке — без кэша
    ...(process.env.NODE_ENV === "development" && {
      "/**": {
        isr: false,
        swr: false,
        cache: false,
      },
      "/sermons/**": {
        isr: false,
        swr: false,
        cache: false,
      },
      "/events/**": {
        isr: false,
        swr: false,
        cache: false,
      },
      "/about/**": {
        isr: false,
        swr: false,
        cache: false,
      },
      "/bible-school/**": {
        isr: false,
        swr: false,
        cache: false,
      },
    }),

    // ⚠️ В продакшене включаем кэширование
    ...(process.env.NODE_ENV === "production" && {
      "/sermons/**": {
        swr: 3600,
        headers: {
          "Cache-Control": "public, max-age=3600, must-revalidate",
          "Strict-Transport-Security":
            "max-age=31536000; includeSubDomains; preload",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy":
            "camera=(), microphone=(), geolocation=(), payment=()",
        },
        cache: { swr: true, maxAge: 3600 },
      },
      "/events/**": {
        swr: 3600,
        headers: {
          "Cache-Control": "public, max-age=3600, must-revalidate",
          "Strict-Transport-Security":
            "max-age=31536000; includeSubDomains; preload",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy":
            "camera=(), microphone=(), geolocation=(), payment=()",
        },
        cache: { swr: true, maxAge: 3600 },
      },
      "/about/**": {
        swr: 3600,
        cache: { swr: true, maxAge: 3600 },
      },
      "/bible-school/**": {
        swr: 3600,
        cache: { swr: true, maxAge: 3600 },
      },
    }),

    "/auth/**": {
      swr: 0,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Strict-Transport-Security":
          "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy":
          "camera=(), microphone=(), geolocation=(), payment=()",
      },
    },
    "/dashboard/**": {
      swr: 0,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Strict-Transport-Security":
          "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy":
          "camera=(), microphone=(), geolocation=(), payment=()",
      },
    },
    "/verify-email": {
      swr: 0,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Strict-Transport-Security":
          "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy":
          "camera=(), microphone=(), geolocation=(), payment=()",
      },
    },
    "/_nuxt/**":
      process.env.NODE_ENV === "production"
        ? {
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
              "Strict-Transport-Security":
                "max-age=31536000; includeSubDomains; preload",
              "X-Content-Type-Options": "nosniff",
              "X-Frame-Options": "DENY",
              "X-XSS-Protection": "1; mode=block",
              "Referrer-Policy": "strict-origin-when-cross-origin",
            },
          }
        : {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          },
    "/pastor/**": {
      swr: 0,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Strict-Transport-Security":
          "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy":
          "camera=(), microphone=(), geolocation=(), payment=()",
      },
    },
    "/offline": {
      swr: 86400,
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Strict-Transport-Security":
          "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      cache: { swr: true, maxAge: 86400 },
    },
  },

  runtimeConfig: {
    fortifyOrigin: process.env.NUXT_FORTIFY_ORIGIN || "",
    siteEnv: process.env.NUXT_SITE_ENV || "local",
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || "",
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || "",
    vapidSubject: process.env.VAPID_SUBJECT || "",
    carouselLimit: Number(process.env.CAROUSEL_LIMIT || 6),

    public: {
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || "1.0.0",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      backendUrl:
        process.env.NUXT_PUBLIC_BACKEND_URL || "http://wotgospel.local",
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://wotgospel.local/api",
      fortifyBaseUrl:
        process.env.NUXT_PUBLIC_FORTIFY_BASE_URL || "http://wotgospel.local",
      storageUrl:
        process.env.NUXT_PUBLIC_STORAGE_URL ||
        "https://storage.yandexcloud.net/wotgospel-media",
      yandexCaptchaSiteKey:
        process.env.NUXT_PUBLIC_YANDEX_CAPTCHA_SITE_KEY || "",
      reverbAppKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY || "",
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || "",
      reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT || "443",
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || "https",
    },
  },

  nitro: {
    compressPublicAssets: true,
    minify: true,
    serveStatic: true,
    preset: "node-server",
    output: {
      dir: ".output",
    },
    publicAssets: [
      {
        dir: "public",
        maxAge: 3600,
      },
    ],
    prerender: {
      crawlLinks: false,
      routes: [],
      ignore: [
        "/sermons/**",
        "/events/**",
        "/auth/**",
        "/dashboard/**",
        "/pastor/**",
      ],
    },
    storage: {
      cache: {
        driver:
          process.env.NODE_ENV === "development"
            ? "memory" // ⚠️ В разработке — в память, чтобы не было ошибок с диском
            : "fs", // ✅ В продакшене — на диск
        ...(process.env.NODE_ENV === "production" && {
          base: ".nuxt/cache",
        }),
      },
    },
    esbuild: {
      options: {
        target: "es2022",
        // Другие опции esbuild
      },
    },
    typescript: {
      tsConfig: {
        include: ["**/*"],
      },
    },
  },

  sourcemap: {
    server: false,
    client: false,
  },

  build: {},

  vite: {
    server: {
      // ✅ Включаем CORS для локальной разработки
      cors: true,
      // ✅ Включаем "горячую" перезагрузку через WebSocket
      hmr: {
        overlay: false, // Отключаем оверлей ошибок, если он мешает
      },
      // ✅ Правильная настройка WebSocket для Nuxt
      ws: {
        // protocol: "ws", // Необязательно, будет определен автоматически
        host: "localhost", // Явно указываем хост
        port: 3000, // Порт должен совпадать с портом сервера
      },
      // ✅ Включаем опрос файлов для Windows (решает проблемы с отслеживанием изменений)
      watch: {
        usePolling: true,
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: function (id) {
            if (
              id.includes("vue") ||
              id.includes("pinia") ||
              id.includes("@vueuse")
            ) {
              return "vendor";
            }
          },
        },
      },
    },
  },
});