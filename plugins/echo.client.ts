import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
    interface Window {
        Pusher: typeof Pusher
    }
}

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    window.Pusher = Pusher

    const reverbKey = String(config.public.reverbAppKey || '')

    const reverbHost = String(config.public.reverbHost || '')
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/^wss?:\/\//, '')
        .replace(/\/$/, '')
        .split(':')[0]

    const reverbPort = Number(config.public.reverbPort || 443)

    const echo = new Echo({
        broadcaster: 'reverb',

        key: reverbKey,

        wsHost: reverbHost,
        wsPort: reverbPort,
        wssPort: reverbPort,

        forceTLS: true,
        encrypted: true,

        enabledTransports: ['ws'],

        enableStats: false,

        authorizer: (channel: any) => {
            return {
                authorize: async (socketId: string, callback: Function) => {
                    try {
                        const response: any = await $fetch('https://wotgospel.ru/api/broadcasting/auth', {
                            method: 'POST',
                            headers: {
                                Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: {
                                socket_id: socketId,
                                channel_name: channel.name,
                            },
                        })

                        if (channel.name.startsWith('presence-') && !response?.channel_data) {
                            console.error('❌ Presence auth response has no channel_data!', response)
                        }

                        callback(null, response)
                    } catch (error: any) {
                        console.error('❌ Broadcasting auth error:', {
                            channel_name: channel.name,
                            error,
                            status: error?.response?.status,
                            data: error?.response?._data,
                        })

                        callback(error, null)
                    }
                },
            }
        },
    })

    return {
        provide: {
            echo,
        },
    }
})
