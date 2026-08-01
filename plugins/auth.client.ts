export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const route = useRoute();

  // ✅ Восстанавливаем токен из localStorage ВСЕГДА (на всех страницах)
  if (import.meta.client) {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const rolesStr = localStorage.getItem('auth_roles');
    
    if (token && userStr && !authStore.token) {
      authStore.token = token;
      authStore.user = JSON.parse(userStr);
      authStore.roles = rolesStr ? JSON.parse(rolesStr) : [];
      console.log('🔑 Токен восстановлен из localStorage (plugin)');
    }
  }

  // ✅ Запускаем проверку токена ТОЛЬКО если НЕ главная страница
  if (route.path !== "/") {
    await authStore.init();
  } else {
    // ✅ На главной - отмечаем как инициализированный
    authStore.initialized = true;
    console.log('⏭️ Плагин: главная страница - пропускаем проверку авторизации');
  }

  if (import.meta.client) {
    // ✅ Проверяем, нужно ли обновить сессию
    const lastActivity = localStorage.getItem("last_activity");
    const now = Date.now();

    // Если прошло больше 30 минут с последней активности, обновляем сессию
    if (lastActivity && now - parseInt(lastActivity) > 30 * 60 * 1000) {
      await authStore.refreshSession();
    }

    // ✅ Периодически обновляем сессию (каждые 15 минут)
    setInterval(
      async () => {
        if (authStore.isAuthenticated) {
          await authStore.refreshSession();
          console.log("🔄 Session refreshed");
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