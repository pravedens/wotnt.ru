import { defineStore } from "pinia";
import { useApi } from '~/composables/useApi';  // ✅ ДОБАВЛЕН ИМПОРТ

interface User {
  id: number;
  name: string;
  last_name?: string;
  middle_name?: string;
  email: string;
  email_verified_at: string | null;
  phone?: string;
  city?: string;
  church_name?: string;
  about?: string;
  birth_date?: string;
  avatar?: string;
  created_at?: string;
}

interface RegisterData {
  name: string;
  last_name?: string;
  middle_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  city?: string;
  church_name?: string;
  about?: string;
  birth_date?: string;
}

interface ConsentHistoryItem {
  date: string;
  version: string;
  ip: string;
}

// ✅ Функция для получения $api внутри действий
function getApi() {
  const { $api } = useApi();
  return $api;
}

// ✅ Функция для получения конфигурации (только для storageUrl)
function getConfig() {
  const config = useRuntimeConfig();
  return {
    storageUrl: config.public.storageUrl || 'https://storage.yandexcloud.net/wotgospel-media'
  };
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    roles: [] as string[],
    loading: false,
    initialized: false,
    consentDate: null as string | null,
    consentVersion: "1.0",
    consentIp: null as string | null,
    consentHistory: [] as ConsentHistoryItem[],
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    isEmailVerified: (state) => !!state.user?.email_verified_at,
    isAdmin: (state) =>
      state.roles.includes("admin") ||
      state.roles.includes("super_admin") ||
      state.roles.includes("redactorEvents"),
    canAccessAdmin: (state) => state.roles.some((role) => role !== "user"),
    isPastor: (state) => state.roles.includes("pastor"),
    isMinister: (state) => state.roles.includes("minister"),
    isMember: (state) => state.roles.includes("member"),
    isTeacher: (state) => state.roles.includes("teacher"),
    isStudent: (state) => state.roles.includes("student"),
    isGroupLeader: (state) => state.roles.includes("group_leader"),

    userRoles: (state) => {
      if (!state.roles || state.roles.length === 0) {
        return "Пользователь";
      }

      if (state.roles.includes("minister")) {
        return "Служитель";
      }
      if (state.roles.includes("member")) {
        return "Прихожанин";
      }
      if (state.roles.includes("super_admin")) {
        return "Супер-администратор";
      }
      if (state.roles.includes("admin")) {
        return "Администратор";
      }
      if (state.roles.includes("editor")) {
        return "Редактор";
      }
      if (state.roles.includes("teacher")) {
        return "Преподаватель";
      }
      if (state.roles.includes("student")) {
        return "Ученик";
      }

      return "Пользователь";
    },

    userRolesList: (state) => {
      const roleNames: Record<string, string> = {
        super_admin: "Супер-администратор",
        admin: "Администратор",
        editor: "Редактор",
        member: "Прихожанин",
        minister: "Служитель",
        teacher: "Преподаватель",
        student: "Ученик",
        group_leader: "Лидер группы",
        user: "Пользователь",
      };

      return state.roles.map((role) => roleNames[role] || role);
    },

    avatarUrl: (state) => {
      if (!state.user) return null;
      if (state.user.avatar) {
        const { storageUrl } = getConfig();
        if (state.user.avatar.startsWith("avatars/")) {
          return `${storageUrl}/${state.user.avatar}`;
        }
        // ✅ Исправлено: используем $api для получения baseUrl, но для avatarUrl лучше использовать прямой URL
        // Так как это геттер, мы не можем использовать $api
        const config = useRuntimeConfig();
        return `${config.public.apiBase}/storage/${state.user.avatar}`;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(state.user.name)}&background=10b981&color=fff&bold=true&size=128`;
    },

    needsConsentUpdate: (state) => {
      return state.consentVersion !== "2.0";
    },
  },

  actions: {
    $reset() {
      this.user = null;
      this.token = null;
      this.roles = [];
      this.loading = false;
      this.initialized = false;
      this.consentDate = null;
      this.consentVersion = "1.0";
      this.consentIp = null;
      this.consentHistory = [];
    },

    async validateToken(): Promise<boolean> {
      if (!this.token) return false;

      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        const response: any = await $api('/user/check-token', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response && response.success && response.user) {
          this.user = response.user;
          this.roles = response.roles || [];

          if (import.meta.client) {
            localStorage.setItem("auth_user", JSON.stringify(this.user));
            localStorage.setItem("auth_roles", JSON.stringify(this.roles));
          }
          return true;
        }
        return false;
      } catch (err: any) {
        if (err?.status === 401) {
          console.log("Token invalid, clearing session");
          this.$reset();
          if (import.meta.client) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_roles");
            localStorage.removeItem("auth_remember");
          }
        }
        return false;
      }
    },

    async login(email: string, password: string, remember: boolean = false) {
      this.loading = true;

      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        const response: any = await $api('/login', {
          method: "POST",
          body: { email, password, remember },
        });

        if (!response?.token) {
          throw new Error("Токен не получен");
        }

        this.token = response.token;
        this.user = response.user;
        this.roles = response.roles || [];

        if (import.meta.client) {
          if (this.token) {
            localStorage.setItem("auth_token", this.token);
          }
          localStorage.setItem("auth_user", JSON.stringify(this.user));
          localStorage.setItem("auth_roles", JSON.stringify(this.roles));
          localStorage.setItem(
            "auth_remember",
            response.remember ? "true" : "false",
          );
        }

        return {
          success: true,
          canAccessAdmin: response.can_access_admin === true,
          isVerified: !!response.user?.email_verified_at,
        };
      } catch (err: any) {
        let errorMessage = "Ошибка входа";
        if (err?.status === 401) {
          errorMessage = "Неверный email или пароль";
        } else if (err?.status === 422) {
          errorMessage = "Проверьте правильность заполнения полей";
        } else if (err?.data?.message) {
          errorMessage = err.data.message;
        }

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        this.loading = false;
      }
    },

    async init() {
      if (this.initialized) return;

      if (import.meta.client) {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("auth_user");
        const rolesStr = localStorage.getItem("auth_roles");
        const consentHistoryStr = localStorage.getItem("consent_history");

        if (token && userStr) {
          this.token = token;
          this.user = JSON.parse(userStr);
          this.roles = rolesStr ? JSON.parse(rolesStr) : [];

          if (consentHistoryStr) {
            this.consentHistory = JSON.parse(consentHistoryStr);
            if (this.consentHistory.length > 0) {
              const latest = this.consentHistory[0];
              if (latest) {
                this.consentVersion = latest.version;
                this.consentDate = latest.date;
                this.consentIp = latest.ip;
              }
            }
          }

          const isValid = await this.validateToken();
          if (!isValid) {
            this.initialized = true;
            return;
          }

          await this.fetchConsentHistory();
        }
      }

      this.initialized = true;
    },

    async register(data: RegisterData) {
      this.loading = true;

      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        const response: any = await $api('/register', {
          method: "POST",
          body: data,
        });

        return {
          success: true,
          requiresVerification: true,
          message: response?.message || "Письмо с подтверждением отправлено на ваш email",
        };
      } catch (err: any) {
        console.error("Register error:", err);

        if (err?.data?.error_code === "user_exists") {
          return {
            success: false,
            error: err.data.message,
            error_code: "user_exists",
            can_reset_password: true,
            reset_url: err.data.reset_url,
          };
        }

        return {
          success: false,
          error: err?.data?.message || err?.message || "Ошибка регистрации",
        };
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      if (!this.token || !import.meta.client) return;

      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        const response: any = await $api('/user', {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response && response.id) {
          this.user = response;
          this.roles = response.roles || [];

          if (import.meta.client) {
            localStorage.setItem("auth_user", JSON.stringify(this.user));
            localStorage.setItem("auth_roles", JSON.stringify(this.roles));
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    },

    async refreshSession() {
      if (!this.token) return false;

      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        const response: any = await $api('/user', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response && response.id) {
          this.user = response;
          this.roles = response.roles || [];

          if (import.meta.client) {
            localStorage.setItem("auth_user", JSON.stringify(this.user));
            localStorage.setItem("auth_roles", JSON.stringify(this.roles));
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error("Session refresh failed:", err);
        return false;
      }
    },

    async resendVerification() {
      if (!this.token) {
        return { success: false, error: "Не авторизован" };
      }

      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        await $api('/email/verification-notification', {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        return {
          success: true,
          message: "Письмо подтверждения отправлено повторно",
        };
      } catch (err: any) {
        console.error("Resend verification error:", err);
        return {
          success: false,
          error: err?.data?.message || err?.message || "Ошибка отправки письма",
        };
      }
    },

    async updateConsent(version: string) {
      if (!this.token) {
        return { success: false, error: "Не авторизован" };
      }

      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        const response: any = await $api('/user/consent', {
          method: "POST",
          body: { policy_version: version },
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response.success) {
          this.consentVersion = version;
          this.consentDate = new Date().toISOString();

          const newHistoryItem: ConsentHistoryItem = {
            date: new Date().toLocaleString("ru-RU"),
            version: version,
            ip: response.consent?.ip || this.consentIp || "unknown",
          };
          this.consentHistory = [newHistoryItem, ...this.consentHistory];

          if (import.meta.client) {
            if (this.consentDate) {
              localStorage.setItem("consent_date", this.consentDate);
            }
            if (this.consentVersion) {
              localStorage.setItem("consent_version", this.consentVersion);
            }
            localStorage.setItem(
              "consent_history",
              JSON.stringify(this.consentHistory),
            );
          }

          return {
            success: true,
            message: response.message || "Согласие успешно обновлено",
          };
        }

        return {
          success: false,
          error: response.message || "Ошибка обновления согласия",
        };
      } catch (err: any) {
        console.error("Update consent error:", err);
        return {
          success: false,
          error: err?.data?.message || err?.message || "Ошибка обновления согласия",
        };
      }
    },

    async fetchConsentHistory() {
      if (!this.token) return;

      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        const response: any = await $api('/user/consent/history', {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (
          response.success &&
          response.consents &&
          Array.isArray(response.consents)
        ) {
          this.consentHistory = response.consents;

          if (import.meta.client) {
            localStorage.setItem(
              "consent_history",
              JSON.stringify(this.consentHistory),
            );
          }

          if (response.consents.length > 0) {
            const latest = response.consents[0];
            if (latest) {
              this.consentVersion = latest.version;
              this.consentDate = latest.date;
              this.consentIp = latest.ip;

              if (import.meta.client) {
                if (this.consentVersion) {
                  localStorage.setItem("consent_version", this.consentVersion);
                }
                if (this.consentDate) {
                  localStorage.setItem("consent_date", this.consentDate);
                }
                if (this.consentIp) {
                  localStorage.setItem("consent_ip", this.consentIp);
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching consent history:", err);
      }
    },

    async logout() {
      if (this.token && import.meta.client) {
        try {
          const $api = getApi();
          // ✅ Исправлено: используем $api вместо $fetch
          await $api('/logout', {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          });
        } catch (err) {
          console.error("Logout API error:", err);
        }
      }

      this.$reset();

      if (import.meta.client) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_roles");
        localStorage.removeItem("consent_date");
        localStorage.removeItem("consent_version");
        localStorage.removeItem("consent_ip");
        localStorage.removeItem("consent_history");
        localStorage.removeItem("auth_remember");
        window.location.href = "/";
      }
    },

    async forgotPassword(email: string) {
      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        const response: any = await $api('/forgot-password', {
          method: "POST",
          body: { email },
        });

        return {
          success: true,
          message: response?.message || "Ссылка для сброса пароля отправлена на ваш email",
        };
      } catch (err: any) {
        let errorMessage = "Ошибка отправки запроса";
        if (err?.data?.errors) {
          const errors = err.data.errors;
          const errorValues = Object.values(errors);
          const firstError = errorValues.length > 0 ? (errorValues[0] as any)?.[0] : undefined;
          if (firstError) {
            errorMessage = firstError;
          }
        } else if (err?.data?.message) {
          errorMessage = err.data.message;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    async resetPassword(data: {
      email: string;
      token: string;
      password: string;
      password_confirmation: string;
    }) {
      this.loading = true;

      try {
        const $api = getApi();
        // ✅ Исправлено: используем $api вместо $fetch
        const response: any = await $api('/reset-password', {
          method: "POST",
          body: data,
        });

        return {
          success: true,
          message: response?.message || "Пароль успешно изменен",
        };
      } catch (err: any) {
        console.error("Reset password error:", err);
        return {
          success: false,
          error: err?.data?.message || err?.message || "Ошибка сброса пароля",
        };
      } finally {
        this.loading = false;
      }
    },
  },
});