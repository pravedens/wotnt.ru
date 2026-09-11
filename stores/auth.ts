import { defineStore } from "pinia";
import { useApi } from "~/composables/useApi";

export interface User {
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
  marital_status?: string;
  gender?: string;
  ministry?: string;
  bible_courses_experience?: string;
  learning_expectations?: string;
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

function getConfig() {
  const config = useRuntimeConfig();
  return {
    storageUrl:
      config.public.storageUrl ||
      "https://storage.yandexcloud.net/wotgospel-media",
  };
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    roles: [] as string[],
    loading: false,
    initialized: false,
    consentDate: null as string | null,
    consentVersion: "1.0",
    consentIp: null as string | null,
    consentHistory: [] as ConsentHistoryItem[],
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
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
      if (!state.roles || state.roles.length === 0) return "Пользователь";
      if (state.roles.includes("minister")) return "Служитель";
      if (state.roles.includes("member")) return "Прихожанин";
      if (state.roles.includes("super_admin")) return "Супер-администратор";
      if (state.roles.includes("admin")) return "Администратор";
      if (state.roles.includes("editor")) return "Редактор";
      if (state.roles.includes("teacher")) return "Преподаватель";
      if (state.roles.includes("student")) return "Ученик";
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
      this.roles = [];
      this.loading = false;
      this.initialized = false;
      this.consentDate = null;
      this.consentVersion = "1.0";
      this.consentIp = null;
      this.consentHistory = [];
    },

    async validateSession(): Promise<boolean> {
      try {
        const { $authApi } = useApi();
        const response: any = await $authApi("/user");

        if (response && response.id) {
          this.user = response;
          this.roles = response.roles || [];
          return true;
        }
        return false;
      } catch (err: any) {
        if (err?.status === 401) {
          this.user = null;
          this.roles = [];
        }
        return false;
      }
    },

    async login(email: string, password: string, remember: boolean = false) {
      this.loading = true;

      try {
        const { $authApi } = useApi();
        const config = useRuntimeConfig();

        // CSRF-cookie (напрямую, без /api)
        await $fetch(`${config.public.backendUrl}/sanctum/csrf-cookie`, {
          method: "GET",
          credentials: "include",
        });

        // Логин
        await $authApi("/login", {
          method: "POST",
          body: { email, password, remember },
        });

        // Пользователь
        const userResponse: any = await $authApi("/user");

        if (!userResponse || !userResponse.id) {
          throw new Error("Не удалось получить данные пользователя");
        }

        this.user = userResponse;
        this.roles = userResponse.roles || [];

        return {
          success: true,
          canAccessAdmin: this.roles.some((role) => role !== "user"),
          isVerified: !!this.user?.email_verified_at,
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

        return { success: false, error: errorMessage };
      } finally {
        this.loading = false;
      }
    },

    async init(force: boolean = false) {
      if (this.initialized && !force) return;
      console.log("🔐 Проверка сессии...");
      const isValid = await this.validateSession();
      this.initialized = true;
      if (isValid) {
        console.log("✅ Авторизация подтверждена");
      } else {
        console.log("⏭️ Пользователь не авторизован");
      }
    },

    async register(data: RegisterData) {
      this.loading = true;
      try {
        const { $authApi } = useApi();
        const response: any = await $authApi("/register", {
          method: "POST",
          body: data,
        });

        return {
          success: true,
          requiresVerification: true,
          message:
            response?.message ||
            "Письмо с подтверждением отправлено на ваш email",
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
      if (!import.meta.client) return;
      try {
        const { $authApi } = useApi();
        const response: any = await $authApi("/user");
        if (response && response.id) {
          this.user = response;
          this.roles = response.roles || [];
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    },

    async refreshSession() {
      return await this.validateSession();
    },

    async resendVerification() {
      try {
        const { $authApi } = useApi();
        await $authApi("/email/verification-notification", { method: "POST" });
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
      try {
        const { $authApi } = useApi();
        const response: any = await $authApi("/user/consent", {
          method: "POST",
          body: { policy_version: version },
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
          error:
            err?.data?.message || err?.message || "Ошибка обновления согласия",
        };
      }
    },

    async fetchConsentHistory() {
      try {
        const { $authApi } = useApi();
        const response: any = await $authApi("/user/consent/history", {
          method: "GET",
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
      if (import.meta.client) {
        try {
          const { $authApi } = useApi();
          await $authApi("/logout", { method: "POST" });
        } catch (err) {
          console.error("Logout API error:", err);
        }
      }

      this.$reset();

      if (import.meta.client) {
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
        const { $authApi } = useApi();
        const response: any = await $authApi("/forgot-password", {
          method: "POST",
          body: { email },
        });

        return {
          success: true,
          message:
            response?.message ||
            "Ссылка для сброса пароля отправлена на ваш email",
        };
      } catch (err: any) {
        let errorMessage = "Ошибка отправки запроса";
        if (err?.data?.errors) {
          const errors = err.data.errors;
          const errorValues = Object.values(errors);
          const firstError =
            errorValues.length > 0 ? (errorValues[0] as any)?.[0] : undefined;
          if (firstError) errorMessage = firstError;
        } else if (err?.data?.message) {
          errorMessage = err.data.message;
        }
        return { success: false, error: errorMessage };
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
        const { $authApi } = useApi();
        const response: any = await $authApi("/reset-password", {
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