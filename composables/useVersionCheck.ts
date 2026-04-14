export const useVersionCheck = () => {
    const needRefresh = ref(false)
    let checkInterval: NodeJS.Timeout | null = null

    const checkVersion = async () => {
        if (!process.client) return
        
        try {
            const response = await fetch('/version.json', {
                headers: { 'Cache-Control': 'no-cache' }
            })
            const data = await response.json()
            const savedVersion = localStorage.getItem('app_version')
            
            if (savedVersion && savedVersion !== data.version) {
                needRefresh.value = true
                // Останавливаем проверку, если уже есть обновление
                if (checkInterval) {
                    clearInterval(checkInterval)
                    checkInterval = null
                }
            } else if (!savedVersion) {
                localStorage.setItem('app_version', data.version)
            }
        } catch (err) {
            console.error('Version check failed:', err)
        }
    }

    const startPeriodicCheck = (intervalMs: number = 5 * 60 * 1000) => {
        if (checkInterval) {
            clearInterval(checkInterval)
        }
        checkInterval = setInterval(() => {
            checkVersion()
        }, intervalMs)
    }

    const stopPeriodicCheck = () => {
        if (checkInterval) {
            clearInterval(checkInterval)
            checkInterval = null
        }
    }

    const refreshApp = () => {
        if (process.client) {
            localStorage.clear()
            sessionStorage.clear()
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => caches.delete(name))
                })
            }
            window.location.reload(true)
        }
    }

    return {
        needRefresh,
        checkVersion,
        startPeriodicCheck,
        stopPeriodicCheck,
        refreshApp
    }
}