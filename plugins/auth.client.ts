export default defineNuxtPlugin(async () => {
    const authStore = useAuthStore()
    
    if (process.client) {
        await authStore.init()
        
        // ✅ Проверяем, нужно ли обновить сессию
        const lastActivity = localStorage.getItem('last_activity')
        const now = Date.now()
        
        // Если прошло больше 30 минут с последней активности, обновляем сессию
        if (lastActivity && (now - parseInt(lastActivity)) > 30 * 60 * 1000) {
            await authStore.refreshSession()
        }
        
        // ✅ Периодически обновляем сессию (каждые 15 минут)
        setInterval(async () => {
            if (authStore.isAuthenticated) {
                await authStore.refreshSession()
                console.log('🔄 Session refreshed')
            }
        }, 15 * 60 * 1000)
    }
    
    return {
        provide: {
            auth: authStore
        }
    }
})