import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  last_name?: string
  middle_name?: string
  email: string
  phone?: string
  city?: string
  church_name?: string
  about?: string
  birth_date?: string
  avatar?: string
  created_at?: string
  email_verified_at?: string | null
}

interface ConsentHistoryItem {
  date: string
  version: string
  ip: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    roles: [] as string[],
    loading: false,
    initialized: false,
    consentDate: null as string | null,
    consentVersion: '1.0',
    consentIp: null as string | null,
    consentHistory: [] as ConsentHistoryItem[]
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    
    isEmailVerified: (state) => {
      return !!state.user?.email_verified_at
    },

    isAdmin: (state) =>
      state.roles.includes('admin') ||
      state.roles.includes('super_admin'),

    hasRole: (state) => {
      return (role: string) => state.roles.includes(role)
    },

    avatarUrl: (state) => {
      if (!state.user) return null
      if (state.user.avatar) {
        return `https://wotgospel.ru/storage/${state.user.avatar}`
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        state.user.name
      )}&background=10b981&color=fff&bold=true&size=128`
    }
  },

  actions: {
    $reset() {
      this.user = null
      this.token = null
      this.roles = []
      this.loading = false
      this.initialized = false
      this.consentDate = null
      this.consentVersion = '1.0'
      this.consentIp = null
      this.consentHistory = []
    },

    // ✅ Упрощенный метод получения CSRF cookie
    async fetchCsrfCookie() {
  if (!process.client) return
  
  try {
    // Сначала делаем OPTIONS запрос для CORS
    await $fetch('https://wotgospel.ru/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://wotnt.ru'
      }
    })
    
    // Ждем установки cookie
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Проверяем, установилась ли cookie
    const cookies = document.cookie.split(';')
    const xsrfToken = cookies.find(c => c.trim().startsWith('XSRF-TOKEN='))
    if (!xsrfToken) {
      console.warn('XSRF-TOKEN cookie not set')
    }
  } catch (err) {
    console.error('CSRF cookie error:', err)
  }
},

    async init() {
  console.log('Auth init called, current state:', { 
    initialized: this.initialized,
    hasToken: !!this.token,
    hasUser: !!this.user 
  })
  
  if (this.initialized) return

  if (process.client) {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    const rolesStr = localStorage.getItem('auth_roles')

    console.log('Auth init - localStorage data:', {
      hasToken: !!token,
      hasUser: !!userStr,
      userData: userStr ? JSON.parse(userStr) : null
    })

    if (token && userStr) {
      this.token = token
      this.user = JSON.parse(userStr)
      this.roles = rolesStr ? JSON.parse(rolesStr) : []
      
      console.log('Auth init - store after load:', {
        email: this.user?.email,
        email_verified_at: this.user?.email_verified_at,
        isEmailVerified: !!this.user?.email_verified_at,
        token: this.token?.substring(0, 20) + '...'
      })
    } else {
      console.log('Auth init - no data in localStorage')
    }
  }

  this.initialized = true
  console.log('Auth init completed, initialized:', this.initialized)
},

    // ✅ LOGIN
    async login(email: string, password: string) {
  this.loading = true

  try {
    const response: any = await $fetch('https://wotgospel.ru/api/login', {
      method: 'POST',
      body: { email, password },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (!response?.token) {
      throw new Error('Ошибка авторизации')
    }

    this.token = response.token
    this.user = response.user
    this.roles = response.roles || []

    // ✅ Логируем для отладки
    console.log('Login response user:', {
      email: this.user?.email,
      email_verified_at: this.user?.email_verified_at
    })

    if (process.client) {
      localStorage.setItem('auth_token', this.token)
      localStorage.setItem('auth_user', JSON.stringify(this.user))
      localStorage.setItem('auth_roles', JSON.stringify(this.roles))
    }

    return { success: true }

  } catch (err: any) {
    return {
      success: false,
      error: err?.data?.message || err.message
    }
  } finally {
    this.loading = false
  }
},

// ✅ REGISTER - простая рабочая версия
async register(data: {
  name: string
  email: string
  password: string
  password_confirmation: string
  privacy_accepted: boolean
  registration_source: string
}) {
  this.loading = true

  try {
    const response: any = await $fetch('https://wotgospel.ru/api/register', {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (response.token) {
      this.token = response.token
      this.user = response.user
      this.roles = response.roles || []

      if (process.client) {
        localStorage.setItem('auth_token', this.token)
        localStorage.setItem('auth_user', JSON.stringify(this.user))
        localStorage.setItem('auth_roles', JSON.stringify(this.roles))
      }
    }

    return { 
      success: true, 
      requiresVerification: response.requires_verification === true,
      message: response.message || 'Письмо с подтверждением отправлено на ваш email'
    }

  } catch (err: any) {
    console.error('Register error:', err)
    return {
      success: false,
      error: err?.data?.message || err?.message || 'Ошибка регистрации'
    }
  } finally {
    this.loading = false
  }
},

    // ✅ FORGOT PASSWORD
    async forgotPassword(email: string) {
      try {
        await this.fetchCsrfCookie()
        
        const response: any = await $fetch('https://wotgospel.ru/api/forgot-password', {
          method: 'POST',
          body: { email },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://wotnt.ru'
          },
          credentials: 'include'
        })

        return {
          success: true,
          message: response?.message || 'Ссылка для сброса пароля отправлена на ваш email'
        }

      } catch (err: any) {
        console.error('Forgot password error:', err)
        return {
          success: false,
          error: err?.data?.message || err?.message || 'Ошибка отправки запроса'
        }
      }
    },

    // ✅ RESET PASSWORD
    async resetPassword(data: {
      email: string
      token: string
      password: string
      password_confirmation: string
    }) {
      this.loading = true

      try {
        await this.fetchCsrfCookie()
        
        const response: any = await $fetch('https://wotgospel.ru/api/reset-password', {
          method: 'POST',
          body: data,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://wotnt.ru'
          },
          credentials: 'include'
        })

        return {
          success: true,
          message: response?.message || 'Пароль успешно изменен'
        }

      } catch (err: any) {
        console.error('Reset password error:', err)
        return {
          success: false,
          error: err?.data?.message || err?.message || 'Ошибка сброса пароля'
        }
      } finally {
        this.loading = false
      }
    },

    // ✅ RESEND VERIFICATION
    async resendVerification() {
      if (!this.token) {
        return {
          success: false,
          error: 'Не авторизован'
        }
      }

      try {
        const response: any = await $fetch('https://wotgospel.ru/api/email/verification-notification', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://wotnt.ru'
          },
          credentials: 'include'
        })

        return {
          success: true,
          message: response?.message || 'Письмо подтверждения отправлено повторно'
        }

      } catch (err: any) {
        console.error('Resend verification error:', err)
        return {
          success: false,
          error: err?.data?.message || err?.message || 'Ошибка отправки письма'
        }
      }
    },

    // ✅ Получение пользователя
    async fetchUser() {
      if (!this.token || !process.client) return

      try {
        const response: any = await $fetch('https://wotgospel.ru/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        })

        if (!response) return

        this.user = response.user || response
        this.roles = response.roles || []

        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(this.user))
          localStorage.setItem('auth_roles', JSON.stringify(this.roles))
        }
      } catch (err) {
        console.error('Ошибка загрузки пользователя', err)
      }
    },

    // ✅ Logout
    async logout() {
      if (this.token && process.client) {
        try {
          await $fetch('https://wotgospel.ru/api/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
          })
        } catch {}
      }

      this.$reset()

      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_roles')
        window.location.href = '/'
      }
    }
  }
})