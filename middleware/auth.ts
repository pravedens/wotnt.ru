export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.client) {
        const authStore = useAuthStore()
        
        if (!authStore.initialized) {
            await authStore.init()
        }
        
        // ✅ Пропускаем страницу сброса пароля
        if (to.path === '/auth/reset-password') {
            return
        }
        
        // ✅ Если не авторизован, но токен есть - пробуем восстановить сессию
        if (!authStore.isAuthenticated && authStore.token) {
            console.log('🔄 Attempting to restore session...')
            await authStore.fetchUser()
        }
        
        if (!authStore.isAuthenticated) {
            return navigateTo({
                path: '/auth/login',
                query: { redirect: to.fullPath }
            })
        }
        
        if (!authStore.isEmailVerified && to.path !== '/auth/verify') {
            return navigateTo({
                path: '/auth/verify',
                query: { redirect: to.fullPath }
            })
        }
    }
})