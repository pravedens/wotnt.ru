// composables/useWebPush.ts

export const useWebPush = () => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    // ⭐ ВСЕГДА true
    const isSupported = ref(true)
    const isSubscribed = ref(false)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const unsupportedReason = ref<string | null>(null)
    
    const VAPID_PUBLIC_KEY = config.public.vapidPublicKey || 'BHI-yFDLo4lx0oNdXlMD2PmGi7cZWGYpK5NilsPdOHSUk3ELnqze--Sh1Hj4j690-M1TRivckGbJlVmFvLaN_qM'
    
    const init = async (): Promise<void> => {
        if (!process.client) {
            console.log('WebPush: not client side')
            return
        }
        
        console.log('WebPush: initializing...')
        
        // ⭐ ВСЕГДА true
        isSupported.value = true
        
        try {
            let registration = await navigator.serviceWorker.getRegistration()
            
            if (!registration) {
                console.log('WebPush: registering Service Worker...')
                registration = await navigator.serviceWorker.register('/sw.js')
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
            
            if (registration) {
                const subscription = await registration.pushManager.getSubscription()
                isSubscribed.value = !!subscription
                console.log('WebPush: subscription status:', isSubscribed.value)
            } else {
                console.log('WebPush: No registration found')
            }
        } catch (err) {
            console.error('WebPush: init error', err)
            // ⭐ ОСТАВЛЯЕМ true
            isSupported.value = true
            error.value = err instanceof Error ? err.message : 'Ошибка инициализации'
        }
    }
    
    const subscribe = async (): Promise<boolean> => {
        console.log('WebPush: subscribe called')
        
        isLoading.value = true
        error.value = null
        
        try {
            const permission = await Notification.requestPermission()
            console.log('WebPush: permission result:', permission)
            
            if (permission !== 'granted') {
                error.value = 'Разрешение на уведомления не получено'
                return false
            }
            
            let registration = await navigator.serviceWorker.getRegistration()
            if (!registration) {
                console.log('WebPush: registering Service Worker...')
                registration = await navigator.serviceWorker.register('/sw.js')
                await navigator.serviceWorker.ready
            }
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            })
            
            console.log('WebPush: subscription created')
            console.log('WebPush: endpoint:', subscription.endpoint.substring(0, 100) + '...')
            
            const response = await $fetch('/api/push-subscription', {
                method: 'POST',
                body: {
                    endpoint: subscription.endpoint,
                    keys: subscription.toJSON().keys
                },
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (response.success) {
                isSubscribed.value = true
                console.log('WebPush: subscription saved on server')
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
        console.log('WebPush: unsubscribe called')
        
        isLoading.value = true
        error.value = null
        
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            
            if (subscription) {
                await $fetch('/api/push-subscription', {
                    method: 'DELETE',
                    body: { endpoint: subscription.endpoint },
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`,
                        'Content-Type': 'application/json'
                    }
                })
                
                await subscription.unsubscribe()
                isSubscribed.value = false
                console.log('WebPush: unsubscribed successfully')
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