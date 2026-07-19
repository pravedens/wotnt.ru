// composables/useFriends.ts

import type { Friend, FriendsResponse } from '~/types/friend'

export const useFriends = () => {
    const friends = ref<Friend[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    
    const loadFriends = async () => {
        loading.value = true
        error.value = null
        
        try {
            const response = await $fetch<FriendsResponse>('/api/friends')
            friends.value = response.data || []
        } catch (err: any) {
            error.value = err?.data?.message || 'Ошибка загрузки дружественных церквей'
            console.error('Friends load error:', err)
        } finally {
            loading.value = false
        }
    }
    
    return {
        friends,
        loading,
        error,
        loadFriends
    }
}