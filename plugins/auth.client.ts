export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();

  // ✅ Инициализируем авторизацию на клиенте.
  // Вся логика (проверка cookie-сессии через /user) — внутри стора.
  if (import.meta.client && !authStore.initialized) {
    await authStore.init();
  }

  // ✅ Refresh сессии по активности (опционально)
  if (import.meta.client && authStore.isAuthenticated) {
    const lastActivity = localStorage.getItem("last_activity");
    const now = Date.now();

    if (lastActivity && now - parseInt(lastActivity) > 30 * 60 * 1000) {
      await authStore.refreshSession();
    }

    // Периодическое обновление сессии (каждые 15 минут)
    setInterval(
      async () => {
        if (authStore.isAuthenticated) {
          try {
            await authStore.refreshSession();
            console.log("🔄 Session refreshed");
          } catch (err) {
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