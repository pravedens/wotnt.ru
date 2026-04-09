export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  console.log('🔐 Auth plugin starting...')
  
  if (process.client) {
    await authStore.init()
    console.log('🔐 Auth plugin initialized', {
      isAuthenticated: authStore.isAuthenticated,
      isEmailVerified: authStore.isEmailVerified,
      user: authStore.user?.email,
      email_verified_at: authStore.user?.email_verified_at
    })
  }
  
  return {
    provide: {
      auth: authStore
    }
  }
})