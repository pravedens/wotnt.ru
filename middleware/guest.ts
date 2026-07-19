export default defineNuxtRouteMiddleware(async (to, from) => {
    
    const authStore = useAuthStore()
    
    if (!authStore.initialized) {
        await authStore.init()
    }
    
    // ✅ Пропускаем страницу сброса пароля (она должна быть доступна без авторизации)
    if (to.path === '/auth/reset-password') {

        return
    }
    
    if (authStore.isAuthenticated) {
        const redirectPath = to.query.redirect as string
        if (redirectPath && redirectPath !== '/auth/login' && redirectPath !== '/auth/register') {
            return navigateTo(redirectPath)
        }
        return navigateTo('/')
    }
})