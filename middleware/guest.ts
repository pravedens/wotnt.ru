export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()
    
    // ✅ Инициализируем store, если еще не инициализирован
    if (!authStore.initialized) {
        await authStore.init()
    }
    
    // Если пользователь уже авторизован
    if (authStore.isAuthenticated) {
        // Получаем URL для возврата из query параметра
        const redirectPath = to.query.redirect as string
        
        // Если есть redirect, перенаправляем туда
        if (redirectPath && redirectPath !== '/auth/login' && redirectPath !== '/auth/register') {
            return navigateTo(redirectPath)
        }
        
        // Если нет redirect, перенаправляем на главную
        return navigateTo('/')
    }
})