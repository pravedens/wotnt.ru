<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Шапка -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-white">👥 Управление пользователями</h1>
        <div class="flex gap-2 w-full sm:w-auto">
          <button 
            @click="exportToPDF"
            :disabled="exporting"
            class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-200 rounded-lg hover:bg-green-500/30 transition text-sm sm:text-base"
          >
            {{ exporting ? 'Экспорт...' : '📄 Экспорт в PDF' }}
          </button>
          <button 
            @click="handleLogout"
            class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg hover:bg-red-500/30 transition text-sm sm:text-base"
          >
            Выйти
          </button>
        </div>
      </div>
      
      <!-- Фильтры -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-3 sm:p-4 mb-6 border border-white/20">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <!-- Поиск -->
          <div>
            <label class="block text-white/80 text-xs sm:text-sm mb-1">🔍 Поиск</label>
            <input 
              v-model="filters.search"
              type="text"
              placeholder="Имя, email..."
              class="w-full px-3 py-2 bg-gray-800 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              @input="debouncedLoadUsers"
            >
          </div>
          
          <!-- Фильтр по городу -->
          <div>
            <label class="block text-white/80 text-xs sm:text-sm mb-1">🏙️ Город</label>
            <select 
              v-model="filters.city"
              class="w-full px-3 py-2 bg-gray-800 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              @change="loadUsers"
            >
              <option value="">Все города</option>
              <option v-for="city in filterOptions.cities" :key="city" :value="city">{{ city }}</option>
            </select>
          </div>
          
          <!-- Фильтр по церкви -->
          <div>
            <label class="block text-white/80 text-xs sm:text-sm mb-1">⛪ Церковь</label>
            <select 
              v-model="filters.church"
              class="w-full px-3 py-2 bg-gray-800 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              @change="loadUsers"
            >
              <option value="">Все церкви</option>
              <option v-for="church in filterOptions.churches" :key="church" :value="church">{{ church }}</option>
            </select>
          </div>
          
          <!-- Фильтр по году рождения -->
          <div>
            <label class="block text-white/80 text-xs sm:text-sm mb-1">🎂 Год рождения</label>
            <select 
              v-model="filters.birth_year"
              class="w-full px-3 py-2 bg-gray-800 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              @change="loadUsers"
            >
              <option value="">Все года</option>
              <option v-for="year in filterOptions.birth_years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        
        <!-- Дополнительные фильтры (скрыты по умолчанию) -->
        <div v-if="showExtraFilters" class="mt-4 pt-4 border-t border-white/10">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label class="block text-white/80 text-xs sm:text-sm mb-1">📧 Email</label>
              <select 
                v-model="filters.has_email"
                class="w-full px-3 py-2 bg-gray-800 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                @change="loadUsers"
              >
                <option value="">Все</option>
                <option value="verified">Подтвержден</option>
                <option value="not_verified">Не подтвержден</option>
              </select>
            </div>
            
            <div>
              <label class="block text-white/80 text-xs sm:text-sm mb-1">📱 Телефон</label>
              <select 
                v-model="filters.has_phone"
                class="w-full px-3 py-2 bg-gray-800 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                @change="loadUsers"
              >
                <option value="">Все</option>
                <option value="true">Указан</option>
                <option value="false">Не указан</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="mt-3 text-center">
          <button 
            @click="showExtraFilters = !showExtraFilters"
            class="text-white/50 hover:text-white text-xs sm:text-sm transition"
          >
            {{ showExtraFilters ? '▲ Скрыть дополнительные фильтры' : '▼ Показать дополнительные фильтры' }}
          </button>
        </div>
      </div>
      
      <!-- Статистика -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-3 sm:p-4 mb-6 border border-white/20">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div>
            <div class="text-xl sm:text-2xl font-bold text-white">{{ users.length }}</div>
            <div class="text-white/60 text-xs sm:text-sm">Всего</div>
          </div>
          <div>
            <div class="text-xl sm:text-2xl font-bold text-green-400">{{ membersCount }}</div>
            <div class="text-white/60 text-xs sm:text-sm">Членов церкви</div>
          </div>
          <div>
            <div class="text-xl sm:text-2xl font-bold text-purple-400">{{ ministersCount }}</div>
            <div class="text-white/60 text-xs sm:text-sm">Служителей</div>
          </div>
          <div>
            <div class="text-xl sm:text-2xl font-bold text-indigo-400">{{ pastorsCount }}</div>
            <div class="text-white/60 text-xs sm:text-sm">Пасторов</div>
          </div>
        </div>
      </div>
      
      <!-- Состояние загрузки -->
      <div v-if="loading" class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p class="text-white/80 mt-4">Загрузка пользователей...</p>
      </div>
      
      <!-- Список пользователей -->
      <div v-else class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20">
        <!-- Десктопная таблица -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full min-w-[1000px]">
            <thead class="bg-white/5 border-b border-white/10">
              <tr>
                <th class="px-4 py-3 text-left text-white font-semibold text-sm">Пользователь</th>
                <th class="px-4 py-3 text-left text-white font-semibold text-sm">Город</th>
                <th class="px-4 py-3 text-left text-white font-semibold text-sm">Церковь</th>
                <th class="px-4 py-3 text-left text-white font-semibold text-sm">Телефон</th>
                <th class="px-4 py-3 text-left text-white font-semibold text-sm">Дата рождения</th>
                <th class="px-4 py-3 text-center text-white font-semibold text-sm">Член семьи</th>
                <th class="px-4 py-3 text-center text-white font-semibold text-sm">Служитель</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="user in users" 
                :key="user.id"
                class="border-b border-white/10 hover:bg-white/5 transition cursor-pointer"
                @click="openUserModal(user)"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.name)}&background=10b981&color=fff`"
                      class="w-10 h-10 rounded-full object-cover"
                    >
                    <div>
                      <div class="text-white font-medium text-sm">{{ user.full_name || user.name }}</div>
                      <div class="text-white/40 text-xs">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-white/80 text-sm">{{ user.city || '-' }}</td>
                <td class="px-4 py-3 text-white/80 text-sm">{{ user.church_name || '-' }}</td>
                <td class="px-4 py-3 text-white/80 text-sm">{{ user.phone || '-' }}</td>
                <td class="px-4 py-3 text-white/80 text-sm">{{ user.birth_date ? new Date(user.birth_date).toLocaleDateString('ru-RU') : '-' }}</td>
                <td class="px-4 py-3 text-center">
                  <input 
                    type="checkbox"
                    :checked="user.is_member"
                    @click.stop
                    @change="toggleRole(user, 'member', $event)"
                    class="w-5 h-5 rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500"
                  >
                </td>
                <td class="px-4 py-3 text-center">
                  <input 
                    type="checkbox"
                    :checked="user.is_minister"
                    @click.stop
                    @change="toggleRole(user, 'minister', $event)"
                    class="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Планшетная версия (средние экраны) -->
        <div class="hidden md:block lg:hidden overflow-x-auto">
          <table class="w-full min-w-[800px]">
            <thead class="bg-white/5 border-b border-white/10">
              <tr>
                <th class="px-4 py-3 text-left text-white font-semibold text-sm">Пользователь</th>
                <th class="px-4 py-3 text-left text-white font-semibold text-sm">Город / Церковь</th>
                <th class="px-4 py-3 text-left text-white font-semibold text-sm">Телефон / Дата рождения</th>
                <th class="px-4 py-3 text-center text-white font-semibold text-sm">Роли</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="user in users" 
                :key="user.id"
                class="border-b border-white/10 hover:bg-white/5 transition cursor-pointer"
                @click="openUserModal(user)"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.name)}&background=10b981&color=fff`"
                      class="w-10 h-10 rounded-full object-cover"
                    >
                    <div>
                      <div class="text-white font-medium text-sm">{{ user.full_name || user.name }}</div>
                      <div class="text-white/40 text-xs">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-white/80 text-sm">{{ user.city || '-' }}</div>
                  <div class="text-white/60 text-xs">{{ user.church_name || '-' }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-white/80 text-sm">{{ user.phone || '-' }}</div>
                  <div class="text-white/60 text-xs">{{ user.birth_date ? new Date(user.birth_date).toLocaleDateString('ru-RU') : '-' }}</div>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex flex-col gap-2">
                    <label class="flex items-center justify-center gap-2">
                      <input 
                        type="checkbox"
                        :checked="user.is_member"
                        @click.stop
                        @change="toggleRole(user, 'member', $event)"
                        class="w-5 h-5 rounded border-white/20 bg-white/10 text-green-500"
                      >
                      <span class="text-white/60 text-xs">Член</span>
                    </label>
                    <label class="flex items-center justify-center gap-2">
                      <input 
                        type="checkbox"
                        :checked="user.is_minister"
                        @click.stop
                        @change="toggleRole(user, 'minister', $event)"
                        class="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500"
                      >
                      <span class="text-white/60 text-xs">Служитель</span>
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Мобильные карточки -->
        <div class="md:hidden divide-y divide-white/10">
          <div 
            v-for="user in users" 
            :key="user.id"
            class="p-4 hover:bg-white/5 transition cursor-pointer"
            @click="openUserModal(user)"
          >
            <div class="flex items-center gap-3 mb-3">
              <img 
                :src="user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.name)}&background=10b981&color=fff`"
                class="w-12 h-12 rounded-full object-cover"
              >
              <div class="flex-1">
                <div class="text-white font-medium">{{ user.full_name || user.name }}</div>
                <div class="text-white/40 text-xs">{{ user.email }}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span class="text-white/60">Город:</span>
                <span class="text-white/80 ml-1">{{ user.city || '-' }}</span>
              </div>
              <div>
                <span class="text-white/60">Церковь:</span>
                <span class="text-white/80 ml-1">{{ user.church_name || '-' }}</span>
              </div>
              <div>
                <span class="text-white/60">Телефон:</span>
                <span class="text-white/80 ml-1">{{ user.phone || '-' }}</span>
              </div>
              <div>
                <span class="text-white/60">Дата рождения:</span>
                <span class="text-white/80 ml-1">{{ user.birth_date ? new Date(user.birth_date).toLocaleDateString('ru-RU') : '-' }}</span>
              </div>
            </div>
            <div class="flex justify-end gap-4 mt-3 pt-2 border-t border-white/10">
              <label class="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox"
                  :checked="user.is_member"
                  @click.stop
                  @change="toggleRole(user, 'member', $event)"
                  class="w-4 h-4 rounded border-white/20 bg-white/10 text-green-500"
                >
                <span class="text-white/80">Член семьи</span>
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox"
                  :checked="user.is_minister"
                  @click.stop
                  @change="toggleRole(user, 'minister', $event)"
                  class="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500"
                >
                <span class="text-white/80">Служитель</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Модальное окно с деталями пользователя -->
      <div v-if="selectedUser" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="selectedUser = null">
        <div class="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl max-w-md w-full p-6 border border-white/20 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl sm:text-2xl font-bold text-white">Информация о пользователе</h2>
            <button @click="selectedUser = null" class="text-white/60 hover:text-white">✕</button>
          </div>
          
          <div class="text-center mb-4">
            <img 
              :src="selectedUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.full_name || selectedUser.name)}&background=10b981&color=fff&size=128`"
              class="w-24 h-24 rounded-full object-cover mx-auto"
            >
            <h3 class="text-lg sm:text-xl font-bold text-white mt-2">{{ selectedUser.full_name || selectedUser.name }}</h3>
            <p class="text-white/60 text-sm">{{ selectedUser.email }}</p>
            <p v-if="selectedUser.email_verified" class="text-green-400 text-xs mt-1">Email подтвержден ✓</p>
          </div>
          
          <div class="space-y-2 text-white/80 text-sm">
            <div v-if="selectedUser.phone"><span class="text-white/60">Телефон:</span> {{ selectedUser.phone }}</div>
            <div v-if="selectedUser.city"><span class="text-white/60">Город:</span> {{ selectedUser.city }}</div>
            <div v-if="selectedUser.church_name"><span class="text-white/60">Церковь:</span> {{ selectedUser.church_name }}</div>
            <div v-if="selectedUser.about"><span class="text-white/60">О себе:</span> {{ selectedUser.about }}</div>
            <div v-if="selectedUser.birth_date"><span class="text-white/60">Дата рождения:</span> {{ new Date(selectedUser.birth_date).toLocaleDateString('ru-RU') }}</div>
            <div><span class="text-white/60">Дата регистрации:</span> {{ selectedUser.registered_at }}</div>
          </div>
          
          <div class="mt-6 pt-4 border-t border-white/10">
            <h4 class="text-white font-semibold mb-2">Роли:</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="role in selectedUser.roles" :key="role" class="px-3 py-1 text-xs rounded-full bg-white/10 text-white">
                {{ role }}
              </span>
            </div>
          </div>
          
          <button @click="selectedUser = null" class="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'
import { useApi } from '~/composables/useApi'

// ✅ Интерфейсы для API ответов
interface UsersResponse {
  success: boolean
  users: any[]
  filters: {
    cities: string[]
    churches: string[]
    birth_years: number[]
  }
  message?: string
}

interface FilterOptions {
  cities: string[]
  churches: string[]
  birth_years: number[]
}

// ✅ Правильная инициализация с типом
const filterOptions = ref<FilterOptions>({
  cities: [],
  churches: [],
  birth_years: []
})

interface RoleUpdateResponse {
  success: boolean
  message?: string
}

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const { $api } = useApi()

const users = ref<any[]>([])
const loading = ref(true)
const exporting = ref(false)
const selectedUser = ref<any>(null)
const showExtraFilters = ref(false)

const membersCount = ref(0)
const ministersCount = ref(0)
const pastorsCount = ref(0)

const filters = ref({
  search: '',
  city: '',
  church: '',
  birth_year: '',
  has_email: '',
  has_phone: ''
})

let debounceTimer: any = null
const debouncedLoadUsers = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadUsers()
  }, 500)
}

// Проверка прав пастора
if (!authStore.isPastor && !authStore.isAdmin) {
  router.push('/dashboard')
}

// ✅ Типизированный вызов API
const loadUsers = async () => {
  loading.value = true
  
  try {
    const params = new URLSearchParams()
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.city) params.append('city', filters.value.city)
    if (filters.value.church) params.append('church', filters.value.church)
    if (filters.value.birth_year) params.append('birth_year', filters.value.birth_year)
    if (filters.value.has_email) params.append('has_email', filters.value.has_email)
    if (filters.value.has_phone) params.append('has_phone', filters.value.has_phone)
    
    const url = `/pastor/users${params.toString() ? '?' + params.toString() : ''}`
    const response = await $api<UsersResponse>(url)
    
    if (response.success) {
      users.value = response.users || []
      filterOptions.value = response.filters || { cities: [], churches: [], birth_years: [] }
      
      membersCount.value = users.value.filter((u: any) => u.is_member).length
      ministersCount.value = users.value.filter((u: any) => u.is_minister).length
      pastorsCount.value = users.value.filter((u: any) => u.roles?.includes('pastor')).length
    }
  } catch (err: any) {
    notificationStore.error('Ошибка', err.data?.message || 'Не удалось загрузить пользователей')
  } finally {
    loading.value = false
  }
}

// ✅ Типизированный вызов API
const toggleRole = async (user: any, role: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const isChecked = target.checked
  
  try {
    const response = await $api<RoleUpdateResponse>(`/pastor/users/${user.id}/roles`, {
      method: 'PUT',
      body: { [`is_${role}`]: isChecked }
    })
    
    if (response.success) {
      if (role === 'member') {
        user.is_member = isChecked
      } else if (role === 'minister') {
        user.is_minister = isChecked
      }
      notificationStore.success('Успешно', response.message || 'Роль обновлена')
      
      membersCount.value = users.value.filter((u: any) => u.is_member).length
      ministersCount.value = users.value.filter((u: any) => u.is_minister).length
    } else {
      notificationStore.error('Ошибка', response.message || 'Не удалось обновить роль')
      target.checked = !isChecked
    }
  } catch (err: any) {
    notificationStore.error('Ошибка', err.data?.message || 'Не удалось обновить роль')
    target.checked = !isChecked
  }
}

const exportToPDF = async () => {
  exporting.value = true
  
  try {
    const html = generatePrintHTML()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
    }
    notificationStore.success('Успешно', 'Список отправлен на печать')
  } catch (err: any) {
    notificationStore.error('Ошибка', 'Не удалось экспортировать список')
  } finally {
    exporting.value = false
  }
}

const generatePrintHTML = () => {
  const date = new Date().toLocaleString('ru-RU')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Список пользователей</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #1e3a5f; }
        .header { text-align: center; margin-bottom: 30px; }
        .date { text-align: right; font-size: 12px; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #1e3a5f; color: white; padding: 10px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Список пользователей</h1>
        <p>Церковь "Слово Истины"</p>
      </div>
      <div class="date">Дата формирования: ${date}</div>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>ФИО</th>
            <th>Город</th>
            <th>Церковь</th>
            <th>Телефон</th>
            <th>Дата рождения</th>
            <th>Член семьи</th>
            <th>Служитель</th>
          </tr>
        </thead>
        <tbody>
          ${users.value.map((user, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${user.full_name || user.name}</td>
              <td>${user.city || '-'}</td>
              <td>${user.church_name || '-'}</td>
              <td>${user.phone || '-'}</td>
              <td>${user.birth_date ? new Date(user.birth_date).toLocaleDateString('ru-RU') : '-'}</td>
              <td>${user.is_member ? '✓' : ''}</td>
              <td>${user.is_minister ? '✓' : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Всего пользователей: ${users.value.length}</p>
        <p>© ${new Date().getFullYear()} Церковь "Слово Истины"</p>
      </div>
    </body>
    </html>
  `
}

const openUserModal = (user: any) => {
  selectedUser.value = user
}

const handleLogout = async () => {
  await authStore.logout()
  await router.push('/')
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* Стили для селектов */
select {
  background-color: #1f2937 !important;
  color: white !important;
}

select option {
  background-color: #1f2937 !important;
  color: white !important;
}

select:focus {
  outline: none;
  border-color: #3b82f6;
}

select option:hover {
  background-color: #374151 !important;
}

select option:checked {
  background-color: #2563eb !important;
  color: white !important;
}
</style>