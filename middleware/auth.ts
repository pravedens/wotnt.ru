export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const authStore = useAuthStore()
    
    // ✅ Принудительно инициализируем store, если еще не инициализирован
    if (!authStore.initialized) {
      console.log('Middleware: Initializing auth store...')
      await authStore.init()
    }
    
    console.log('Middleware - auth state:', {
      path: to.path,
      initialized: authStore.initialized,
      isAuthenticated: authStore.isAuthenticated,
      isEmailVerified: authStore.isEmailVerified,
      hasUser: !!authStore.user,
      emailVerifiedAt: authStore.user?.email_verified_at
    })
    
    // Проверяем авторизацию
    if (!authStore.isAuthenticated) {
      console.log('Not authenticated, redirect to login')
      return navigateTo({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      })
    }
    
    // Проверяем верификацию email
    if (!authStore.isEmailVerified && to.path !== '/auth/verify') {
      console.log('Email not verified, redirect to verify')
      return navigateTo({
        path: '/auth/verify',
        query: { redirect: to.fullPath }
      })
    }
  }
})