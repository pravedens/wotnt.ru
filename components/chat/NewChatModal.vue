<template>
  <div v-if="visible" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col border border-white/20">
      <!-- Заголовок -->
      <div class="flex justify-between items-center p-4 border-b border-white/20 flex-shrink-0">
        <h3 class="text-xl font-bold text-white">💬 Новый чат</h3>
        <button @click="close" class="text-white/60 hover:text-white text-2xl">&times;</button>
      </div>

      <!-- Поиск -->
      <div class="p-4 border-b border-white/20 flex-shrink-0">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по имени или email..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
          @input="searchUsers"
        />
      </div>

      <!-- Список пользователей -->
      <div class="flex-1 overflow-y-auto p-2">
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
        </div>

        <div v-else-if="users.length === 0" class="text-center py-8 text-white/60">
          <p v-if="searchQuery">Пользователи не найдены</p>
          <p v-else>Введите имя или email для поиска</p>
        </div>

        <div
          v-for="user in users"
          :key="user.id"
          @click="selectUser(user)"
          class="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition flex items-center gap-3"
        >
          <img
            :src="user.avatar_url || '/images/default-avatar.png'"
            class="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <p class="text-white font-semibold truncate">{{ user.full_name || user.name }}</p>
            <p class="text-white/40 text-sm truncate">{{ user.email }}</p>
            <div class="flex gap-1 mt-1">
              <span
                v-for="role in user.roles"
                :key="role"
                class="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/60"
              >
                {{ getRoleLabel(role) }}
              </span>
            </div>
          </div>
          <button
            class="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            Чат
          </button>
        </div>
      </div>

      <!-- Закрыть -->
      <div class="p-3 border-t border-white/20 flex-shrink-0 text-center">
        <button @click="close" class="text-white/40 hover:text-white text-sm">
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'
import { useApi } from '~/composables/useApi'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', userId: number): void
}>()

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { $api } = useApi()

const searchQuery = ref('')
const users = ref<any[]>([])
const loading = ref(false)
let searchTimeout: NodeJS.Timeout | null = null

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'super_admin': 'Админ',
    'admin': 'Админ',
    'teacher': 'Учитель',
    'student': 'Ученик',
    'group_leader': 'Лидер',
    'pastor': 'Пастор',
    'user': 'Пользователь',
  }
  return labels[role] || role
}

const searchUsers = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  const query = searchQuery.value.trim()
  if (!query) {
    users.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      const response = await $api(`/users/search?q=${encodeURIComponent(query)}`)
      users.value = response.users || []
    } catch (error) {
      console.error('Search users error:', error)
    } finally {
      loading.value = false
    }
  }, 300)
}

const selectUser = (user: any) => {
  // Нельзя начать чат с самим собой
  if (user.id === authStore.user?.id) {
    notificationStore.warning('Внимание', 'Нельзя начать чат с самим собой')
    return
  }

  emit('select', user.id)
  close()
}

const close = () => {
  searchQuery.value = ''
  users.value = []
  emit('close')
}

watch(() => props.visible, (val) => {
  if (!val) {
    searchQuery.value = ''
    users.value = []
  }
})
</script>