// composables/useWebPush.ts

import { useApi } from '~/composables/useApi'

export const useWebPush = () => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const { $api } = useApi()
    
    const isSupported = ref(true)
    const isSubscribed = ref(false)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const unsupportedReason = ref<string | null>(null)
    
    // ✅ Исправлено: явное приведение к string
    const VAPID_PUBLIC_KEY = (config.public.vapidPublicKey as string) || 'BHI-yFDLo4lx0oNdXlMD2PmGi7cZWGYpK5NilsPdOHSUk3ELnqze--Sh1Hj4j690-M1TRivckGbJlVmFvLaN_qM'
    
    const init = async (): Promise<void> => {
        if (!import.meta.client) {

            return
        }
        
        isSupported.value = true
        
        try {
            let registration = await navigator.serviceWorker.getRegistration()
            
            if (!registration) {
                registration = await navigator.serviceWorker.register('/sw.js')
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
            
            if (registration) {
                const subscription = await registration.pushManager.getSubscription()
                isSubscribed.value = !!subscription
            } else {
            }
        } catch (err) {
            console.error('WebPush: init error', err)
            isSupported.value = true
            error.value = err instanceof Error ? err.message : 'Ошибка инициализации'
        }
    }
    
    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    }
    
    const subscribe = async (): Promise<boolean> => {
        
        isLoading.value = true
        error.value = null
        
        try {
            const permission = await Notification.requestPermission()
            
            if (permission !== 'granted') {
                error.value = 'Разрешение на уведомления не получено'
                return false
            }
            
            let registration = await navigator.serviceWorker.getRegistration()
            if (!registration) {
                registration = await navigator.serviceWorker.register('/sw.js')
                await navigator.serviceWorker.ready
            }
            
            // ✅ Проверяем, что ключ существует
            if (!VAPID_PUBLIC_KEY) {
                error.value = 'VAPID ключ не настроен'
                return false
            }
            
            const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey.buffer as ArrayBuffer
            })
            
            const subscriptionData = {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.toJSON().keys?.p256dh || '',
                    auth: subscription.toJSON().keys?.auth || ''
                }
            }
            
            const response = await $api<{ success: boolean }>('/push-subscription', {
                method: 'POST',
                body: subscriptionData
            })
            
            if (response.success) {
                isSubscribed.value = true
                return true
            }
            
            error.value = 'Server rejected subscription'
            return false
            
        } catch (err) {
            console.error('WebPush: subscribe error', err)
            error.value = err instanceof Error ? err.message : 'Ошибка подписки'
            return false
        } finally {
            isLoading.value = false
        }
    }
    
    const unsubscribe = async (): Promise<boolean> => {
        
        isLoading.value = true
        error.value = null
        
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            
            if (subscription) {
                await $api('/push-subscription', {
                    method: 'DELETE',
                    body: { endpoint: subscription.endpoint }
                })
                
                await subscription.unsubscribe()
                isSubscribed.value = false
            }
            
            return true
        } catch (err) {
            console.error('WebPush: unsubscribe error', err)
            error.value = err instanceof Error ? err.message : 'Ошибка отписки'
            return false
        } finally {
            isLoading.value = false
        }
    }
    
    return {
        init,
        subscribe,
        unsubscribe,
        isSupported: readonly(isSupported),
        isSubscribed: readonly(isSubscribed),
        isLoading: readonly(isLoading),
        error: readonly(error),
        unsupportedReason: readonly(unsupportedReason)
    }
}