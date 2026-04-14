export const useScrollLock = () => {
    const scrollPosition = ref(0)
    const isLocked = ref(false)

    const lockScroll = () => {
        if (!process.client) return
        if (isLocked.value) return
        
        scrollPosition.value = window.scrollY
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollPosition.value}px`
        document.body.style.width = '100%'
        isLocked.value = true
    }

    const unlockScroll = () => {
        if (!process.client) return
        if (!isLocked.value) return
        
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollPosition.value)
        isLocked.value = false
    }

    return {
        lockScroll,
        unlockScroll,
        isLocked
    }
}