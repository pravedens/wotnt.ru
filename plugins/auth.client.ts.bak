export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();

  // ✅ Всегда восстанавливаем токен
  if (import.meta.client) {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      try {
        const { $api } = useApi();
        const response = await $api('/user/check-token', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.success && response.user) {
          authStore.token = token;
          authStore.user = response.user;
          authStore.roles = response.roles || [];
          console.log('🔑 Токен восстановлен (plugin)');
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_roles');
        }
      } catch (err) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_roles');
      }
    }
    
    authStore.initialized = true;
  }

  // ✅ Refresh сессии
  if (import.meta.client && authStore.isAuthenticated) {
    const lastActivity = localStorage.getItem("last_activity");
    const now = Date.now();

    if (lastActivity && now - parseInt(lastActivity) > 30 * 60 * 1000) {
      await authStore.refreshSession();
    }

    setInterval(async () => {
      if (authStore.isAuthenticated && authStore.token) {
        try {
          await authStore.refreshSession();
          console.log("🔄 Session refreshed");
        } catch (err) {
          authStore.logout();
          console.log("❌ Session refresh failed, logged out");
        }
      }
    }, 15 * 60 * 1000);
  }

  return {
    provide: {
      auth: authStore,
    },
  };
});