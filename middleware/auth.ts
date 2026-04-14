export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.client) {
        const authStore = useAuthStore()
        
        if (!authStore.initialized) {
            await authStore.init()
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