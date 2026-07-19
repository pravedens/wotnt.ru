export const useVersionCheck = () => {
    const needRefresh = ref(false)
    let checkInterval: NodeJS.Timeout | null = null
    let currentVersion: string | null = null
    let isChecking = false // Флаг для предотвращения одновременных проверок

    const getCurrentVersion = async (): Promise<string | null> => {
        try {
            const response = await fetch(`/version.json?_t=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            })
            const data = await response.json()
            currentVersion = data.version
            return currentVersion
        } catch (err) {
            console.error('Failed to fetch current version:', err)
            return null
        }
    }

    const checkVersion = async () => {
        if (!process.client || isChecking) return
        
        isChecking = true
        try {
            const serverVersion = await getCurrentVersion()
            if (!serverVersion) return
            
            let savedVersion = localStorage.getItem('app_version')
            
            if (savedVersion && (savedVersion === 'new_version' || isNaN(Number(savedVersion)))) {
                localStorage.removeItem('app_version')
                savedVersion = null
            }
            
            if (savedVersion && savedVersion !== serverVersion) {
                console.log(`🔄 Version changed: ${savedVersion} → ${serverVersion}`)
                needRefresh.value = true
                if (checkInterval) {
                    clearInterval(checkInterval)
                    checkInterval = null
                }
            } else if (!savedVersion) {
                localStorage.setItem('app_version', serverVersion)
                needRefresh.value = false
            } else {
                needRefresh.value = false
            }
        } catch (err) {
            console.error('Version check failed:', err)
        } finally {
            isChecking = false
        }
    }

    const refreshApp = async () => {
        if (process.client) {
            try {
                const newVersion = await getCurrentVersion()
                if (newVersion) {
                    localStorage.setItem('app_version', newVersion)
                }
                
                needRefresh.value = false
                
                if ('caches' in window) {
                    const keys = await caches.keys()
                    await Promise.all(keys.map(key => {
                        if (key.includes('wotnt-')) {
                            console.log('🧹 Deleting cache:', key)
                            return caches.delete(key)
                        }
                    }))
                }
                
                setTimeout(() => {
                    window.location.reload()
                }, 100)
                
            } catch (error) {
                console.error('Failed to refresh app:', error)
                window.location.reload()
            }
        }
    }

    const startPeriodicCheck = (intervalMs: number = 5 * 60 * 1000) => {
        if (checkInterval) {
            clearInterval(checkInterval)
        }
        // Запускаем проверку с задержкой, чтобы не блокировать загрузку страницы
        setTimeout(() => {
            checkVersion()
        }, 3000) // Первая проверка через 3 секунды после загрузки
        
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

    return {
        needRefresh,
        checkVersion,
        startPeriodicCheck,
        stopPeriodicCheck,
        refreshApp,
        getCurrentVersion
    }
}