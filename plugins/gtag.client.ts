export default defineNuxtPlugin({
  name: 'google-analytics',
  enforce: 'pre',
  
  setup() {
    if (import.meta.client) {
      const gaId = 'G-46QQ5SPH5V'
      
      window.dataLayer = window.dataLayer || []
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(args)
      }
      
      gtag('js', new Date())
      gtag('config', gaId, {
        send_page_view: true,
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      })
      
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      })
      
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      document.head.appendChild(script)
      
      const router = useRouter()
      if (router) {
        router.afterEach((to) => {
          gtag('config', gaId, {
            page_title: to.meta?.title || to.path,
            page_path: to.fullPath,
            page_location: window.location.origin + to.fullPath,
            send_page_view: true
          })
          gtag('event', 'page_view', {
            page_title: to.meta?.title || to.path,
            page_location: window.location.origin + to.fullPath,
            page_path: to.fullPath
          })
        })
      }
    }
  }
})