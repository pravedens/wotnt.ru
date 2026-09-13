export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const route = useRoute();

  // ✅ Восстанавливаем токен ТОЛЬКО если не главная страница
  if (import.meta.client && route.path !== "/") {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // ✅ Проверяем токен на сервере ДО восстановления
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
          console.log('🔑 Токен восстановлен и проверен (plugin)');
        } else {
          // ❌ Токен невалидный — очищаем
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_roles');
          console.log('❌ Невалидный токен, очищено');
        }
      } catch (err) {
        // ❌ Ошибка проверки — очищаем
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_roles');
        console.log('❌ Ошибка проверки токена, очищено');
      }
    }
  } else if (route.path === "/") {
    // ✅ На главной - пропускаем авторизацию
    authStore.initialized = true;
    console.log('⏭️ Плагин: главная страница - пропускаем проверку авторизации');
  }

  // ✅ Refresh сессии ТОЛЬКО если токен валидный
  if (import.meta.client && authStore.isAuthenticated) {
    const lastActivity = localStorage.getItem("last_activity");
    const now = Date.now();

    if (lastActivity && now - parseInt(lastActivity) > 30 * 60 * 1000) {
      await authStore.refreshSession();
    }

    // ✅ Периодическое обновление с проверкой
    setInterval(
      async () => {
        if (authStore.isAuthenticated && authStore.token) {
          try {
            await authStore.refreshSession();
            console.log("🔄 Session refreshed");
          } catch (err) {
            // ❌ Если refresh не удался — разлогиниваем
            authStore.logout();
            console.log("❌ Session refresh failed, logged out");
          }
        }
      },
      15 * 60 * 1000,
    );
  }

  return {
    provide: {
      auth: authStore,
    },
  };
});