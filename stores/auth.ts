import { defineStore } from 'pinia'

interface User {
    id: number
    name: string
    last_name?: string
    middle_name?: string
    email: string
    email_verified_at: string | null
    phone?: string
    city?: string
    church_name?: string
    about?: string
    birth_date?: string
    avatar?: string
    created_at?: string
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
        consentHistory: [] as ConsentHistoryItem[],
    }),

    getters: {
        isAuthenticated: (state) => !!state.user && !!state.token,
        isEmailVerified: (state) => !!state.user?.email_verified_at,
        isAdmin: (state) => state.roles.includes('admin') || state.roles.includes('super_admin'),
        canAccessAdmin: (state) => state.roles.some(role => role !== 'user'),
        isPastor: (state) => state.roles.includes('pastor'),
        
        // ✅ Основная роль для отображения (с приоритетом minister)
        userRoles: (state) => {
            if (!state.roles || state.roles.length === 0) {
                return 'Пользователь'
            }
            
            // Приоритет: minister > member > super_admin > admin > editor > user
            if (state.roles.includes('minister')) {
                return 'Служитель'
            }
            if (state.roles.includes('member')) {
                return 'Член семьи'
            }
            if (state.roles.includes('super_admin')) {
                return 'Супер-администратор'
            }
            if (state.roles.includes('admin')) {
                return 'Администратор'
            }
            if (state.roles.includes('editor')) {
                return 'Редактор'
            }
            
            return 'Пользователь'
        },
        
        // ✅ Список всех ролей для отображения
        userRolesList: (state) => {
            const roleNames: Record<string, string> = {
                'super_admin': 'Супер-администратор',
                'admin': 'Администратор',
                'editor': 'Редактор',
                'member': 'Член семьи',
                'minister': 'Служитель',
                'user': 'Пользователь'
            }
            
            return state.roles.map(role => roleNames[role] || role)
        },
        
        avatarUrl: (state) => {
    if (!state.user) return null
    if (state.user.avatar) {
        // ✅ Для S3
        if (state.user.avatar.startsWith('avatars/')) {
            return `https://storage.yandexcloud.net/wotgospel-media/${state.user.avatar}`
        }
        // Fallback для старых аватаров
        return `https://wotgospel.ru/storage/${state.user.avatar}`
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(state.user.name)}&background=10b981&color=fff&bold=true&size=128`
},
        
        needsConsentUpdate: (state) => {
            return state.consentVersion !== '2.0'
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

        async init() {
            if (this.initialized) return

            if (process.client) {
                const token = localStorage.getItem('auth_token')
                const userStr = localStorage.getItem('auth_user')
                const rolesStr = localStorage.getItem('auth_roles')
                const consentHistoryStr = localStorage.getItem('consent_history')

                if (token && userStr) {
                    this.token = token
                    this.user = JSON.parse(userStr)
                    this.roles = rolesStr ? JSON.parse(rolesStr) : []
                    
                    if (consentHistoryStr) {
                        this.consentHistory = JSON.parse(consentHistoryStr)
                        if (this.consentHistory.length > 0) {
                            const latest = this.consentHistory[0]
                            this.consentVersion = latest.version
                            this.consentDate = latest.date
                            this.consentIp = latest.ip
                        }
                    }
                    
                    await this.fetchUser()
                    await this.fetchConsentHistory()
                }
            }

            this.initialized = true
        },

        async login(email: string, password: string) {
            this.loading = true

            try {
                const response: any = await $fetch('https://wotgospel.ru/api/login', {
                    method: 'POST',
                    body: { email, password },
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })

                if (!response?.token) {
                    throw new Error('Токен не получен')
                }

                this.token = response.token
                this.user = response.user
                this.roles = response.roles || []

                if (process.client) {
                    localStorage.setItem('auth_token', this.token)
                    localStorage.setItem('auth_user', JSON.stringify(this.user))
                    localStorage.setItem('auth_roles', JSON.stringify(this.roles))
                }

                return {
                    success: true,
                    canAccessAdmin: response.can_access_admin === true,
                    isVerified: !!response.user?.email_verified_at
                }

            } catch (err: any) {
                let errorMessage = 'Ошибка входа'
                if (err?.status === 401) {
                    errorMessage = 'Неверный email или пароль'
                } else if (err?.status === 422) {
                    errorMessage = 'Проверьте правильность заполнения полей'
                } else if (err?.data?.message) {
                    errorMessage = err.data.message
                }
                
                return {
                    success: false,
                    error: errorMessage
                }
            } finally {
                this.loading = false
            }
        },

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

                return {
                    success: true,
                    requiresVerification: true,
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

        async fetchUser() {
            if (!this.token || !process.client) return

            try {
                const response: any = await $fetch('https://wotgospel.ru/api/user', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/json'
                    }
                })

                if (response.user) {
                    this.user = response.user
                    this.roles = response.roles || []

                    if (process.client) {
                        localStorage.setItem('auth_user', JSON.stringify(this.user))
                        localStorage.setItem('auth_roles', JSON.stringify(this.roles))
                    }
                }
            } catch (err) {
                console.error('Error fetching user:', err)
            }
        },

        async resendVerification() {
            if (!this.token) {
                return { success: false, error: 'Не авторизован' }
            }

            try {
                await $fetch('https://wotgospel.ru/api/email/verification-notification', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/json'
                    }
                })

                return { success: true, message: 'Письмо подтверждения отправлено повторно' }

            } catch (err: any) {
                console.error('Resend verification error:', err)
                return {
                    success: false,
                    error: err?.data?.message || err?.message || 'Ошибка отправки письма'
                }
            }
        },

        async updateConsent(version: string) {
            if (!this.token) {
                return { success: false, error: 'Не авторизован' }
            }

            try {
                const response: any = await $fetch('https://wotgospel.ru/api/user/consent', {
                    method: 'POST',
                    body: { policy_version: version },
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })

                if (response.success) {
                    this.consentVersion = version
                    this.consentDate = new Date().toISOString()
                    
                    const newHistoryItem: ConsentHistoryItem = {
                        date: new Date().toLocaleString('ru-RU'),
                        version: version,
                        ip: response.consent?.ip || this.consentIp || 'unknown'
                    }
                    this.consentHistory = [newHistoryItem, ...this.consentHistory]
                    
                    if (process.client) {
                        localStorage.setItem('consent_date', this.consentDate)
                        localStorage.setItem('consent_version', this.consentVersion)
                        localStorage.setItem('consent_history', JSON.stringify(this.consentHistory))
                    }
                    
                    return { success: true, message: response.message || 'Согласие успешно обновлено' }
                }
                
                return { success: false, error: response.message || 'Ошибка обновления согласия' }

            } catch (err: any) {
                console.error('Update consent error:', err)
                return {
                    success: false,
                    error: err?.data?.message || err?.message || 'Ошибка обновления согласия'
                }
            }
        },

        async fetchConsentHistory() {
            if (!this.token) return

            try {
                const response: any = await $fetch('https://wotgospel.ru/api/user/consent/history', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/json'
                    }
                })

                if (response.success && response.consents && Array.isArray(response.consents)) {
                    this.consentHistory = response.consents
                    
                    if (process.client) {
                        localStorage.setItem('consent_history', JSON.stringify(this.consentHistory))
                    }
                    
                    if (response.consents.length > 0) {
                        const latest = response.consents[0]
                        this.consentVersion = latest.version
                        this.consentDate = latest.date
                        this.consentIp = latest.ip
                        
                        if (process.client) {
                            localStorage.setItem('consent_version', this.consentVersion)
                            localStorage.setItem('consent_date', this.consentDate)
                            localStorage.setItem('consent_ip', this.consentIp)
                        }
                    }
                }
            } catch (err: any) {
                console.error('Error fetching consent history:', err)
            }
        },

        async logout() {
            if (this.token && process.client) {
                try {
                    await $fetch('https://wotgospel.ru/api/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.token}`,
                            'Accept': 'application/json'
                        }
                    })
                } catch (err) {
                    console.error('Logout API error:', err)
                }
            }

            this.$reset()

            if (process.client) {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
                localStorage.removeItem('auth_roles')
                localStorage.removeItem('consent_date')
                localStorage.removeItem('consent_version')
                localStorage.removeItem('consent_ip')
                localStorage.removeItem('consent_history')
                window.location.href = '/'
            }
        },

        async forgotPassword(email: string) {
            try {
                const response: any = await $fetch('https://wotgospel.ru/api/forgot-password', {
                    method: 'POST',
                    body: { email },
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })

                return {
                    success: true,
                    message: response?.message || 'Ссылка для сброса пароля отправлена на ваш email'
                }

            } catch (err: any) {
                let errorMessage = 'Ошибка отправки запроса'
                if (err?.data?.errors) {
                    const errors = err.data.errors
                    const firstError = Object.values(errors)[0]?.[0]
                    if (firstError) {
                        errorMessage = firstError
                    }
                } else if (err?.data?.message) {
                    errorMessage = err.data.message
                }
                
                return {
                    success: false,
                    error: errorMessage
                }
            }
        },

        async resetPassword(data: {
            email: string
            token: string
            password: string
            password_confirmation: string
        }) {
            this.loading = true

            try {
                const response: any = await $fetch('https://wotgospel.ru/api/reset-password', {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
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
        }
    }
})