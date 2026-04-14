<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Шапка с кнопкой выхода -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Личный кабинет</h1>
        <div class="flex gap-2">
          <button 
            @click="clearCache"
            class="px-4 py-2 bg-gray-500/20 border border-gray-500/50 text-gray-200 rounded-lg hover:bg-gray-500/30 transition"
          >
            Очистить кэш
          </button>
          <button 
            @click="handleLogout"
            class="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg hover:bg-red-500/30 transition"
          >
            Выйти
          </button>
        </div>
      </div>

      <!-- Скелетон загрузки -->
      <div v-if="!user" class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <span class="ml-3 text-white">Загрузка...</span>
        </div>
      </div>

      <!-- Контент (показываем только когда user загружен) -->
      <template v-else>
        <!-- Карточка пользователя с аватаром -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <div class="flex items-center gap-6">
            <div class="relative">
              <Avatar 
                :src="avatarUrl" 
                :name="user.name"
                size="lg"
                rounded="lg"
                :border="true"
                containerClass="shrink-0"
              />
              <button 
                @click="openAvatarUpload"
                class="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition shadow-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
            </div>
            
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold text-white truncate">{{ fullName }}</h2>
              <p class="text-white/60 truncate">{{ user.email }}</p>
              <div class="mt-2 flex gap-2 flex-wrap">
                <span 
                  v-for="role in userRolesList" 
                  :key="role"
                  class="px-3 py-1 text-sm rounded-full max-w-full break-words whitespace-normal"
                  :class="getRoleClass(role)"
                >
                  {{ role }}
                </span>
                
                <span v-if="user.church_name" class="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/50">
                  {{ user.church_name }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Карточки статистики -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 class="text-lg font-semibold text-white mb-2">📊 Статус</h3>
            <p class="text-3xl font-bold text-white">✓</p>
            <p class="text-white/60">Аккаунт активен</p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 class="text-lg font-semibold text-white mb-2">👥 Роль</h3>
            <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words hyphens-auto">
              {{ userRoles || 'Пользователь' }}
            </p>
            <p class="text-white/60">Текущая роль</p>
            
            <div v-if="userRolesList && userRolesList.length > 1" class="mt-3 pt-2 border-t border-white/10">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="role in userRolesList" 
                  :key="role"
                  class="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70"
                >
                  {{ role }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 class="text-lg font-semibold text-white mb-2">📅 Регистрация</h3>
            <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
              {{ registrationDate }}
            </p>
            <p class="text-white/60">Дата регистрации</p>
          </div>
          
          <NuxtLink 
            to="/favorites"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group cursor-pointer"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold text-white">⭐ Избранное</h3>
              <span class="text-2xl transform group-hover:scale-110 transition-transform">⭐</span>
            </div>
            <p class="text-3xl font-bold text-white">{{ favoritesCount }}</p>
            <p class="text-white/60">Сохраненных проповедей</p>
          </NuxtLink>
        </div>
        
        <!-- ==================== БЛОК СОГЛАСИЙ И ПОЛИТИКИ ==================== -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h3 class="text-xl font-bold text-white">📋 Согласия и политики</h3>
            <NuxtLink 
              to="/privacy" 
              target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-200 rounded-lg hover:bg-blue-500/30 transition text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              Просмотреть политику
            </NuxtLink>
          </div>
          
          <div class="space-y-4">
            <div class="bg-white/5 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <div class="text-2xl flex-shrink-0">✅</div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-white font-semibold mb-2">Согласие на обработку персональных данных</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span class="text-white/60">Дата принятия:</span>
                      <span class="text-white ml-2 break-words">{{ consentDate || 'Не указано' }}</span>
                    </div>
                    <div>
                      <span class="text-white/60">Версия политики:</span>
                      <span class="text-white ml-2">{{ consentVersion }}</span>
                    </div>
                    <div v-if="consentIp">
                      <span class="text-white/60">IP-адрес:</span>
                      <span class="text-white ml-2 break-words">{{ consentIp }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="needsConsentUpdate" class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <div class="text-2xl flex-shrink-0">⚠️</div>
                <div class="flex-1">
                  <h4 class="text-white font-semibold mb-1">Требуется обновление согласия</h4>
                  <p class="text-white/80 text-sm mb-3">
                    Политика конфиденциальности была обновлена. Пожалуйста, подтвердите свое согласие с новой версией.
                  </p>
                  <button 
                    @click="showConsentModal = true"
                    class="px-4 py-2 bg-yellow-500/30 text-yellow-200 rounded-lg hover:bg-yellow-500/40 transition text-sm"
                  >
                    Обновить согласие
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="consentHistory.length > 0" class="mt-4">
              <h4 class="text-white font-semibold mb-2">История согласий</h4>
              <div class="space-y-2">
                <div 
                  v-for="(item, index) in consentHistory" 
                  :key="index"
                  class="bg-white/5 rounded-lg p-3 text-sm flex flex-wrap items-center justify-between gap-2"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-white/60">Версия {{ item.version }}</span>
                    <span class="text-white/60 hidden sm:inline">•</span>
                    <span class="text-white break-words">{{ item.date }}</span>
                  </div>
                  <span class="text-white/40 text-xs break-words">{{ item.ip }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- ==================== ФОРМА РЕДАКТИРОВАНИЯ ПРОФИЛЯ ==================== -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 class="text-xl font-bold text-white mb-6">Редактировать профиль</h3>
          
          <form @submit.prevent="updateProfile" class="space-y-6">
            <!-- Основная информация -->
            <div>
              <h4 class="text-lg font-semibold text-white/90 mb-4">Основная информация</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label class="block text-white/80 mb-2">Имя</label>
                  <input 
                    v-model="profileForm.name"
                    type="text"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                    placeholder="Иван"
                  >
                </div>
                
                <div>
                  <label class="block text-white/80 mb-2">Фамилия</label>
                  <input 
                    v-model="profileForm.last_name"
                    type="text"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                    placeholder="Иванов"
                  >
                </div>
                
                <div>
                  <label class="block text-white/80 mb-2">Отчество</label>
                  <input 
                    v-model="profileForm.middle_name"
                    type="text"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                    placeholder="Иванович"
                  >
                </div>
              </div>
            </div>
            
            <!-- Контактная информация -->
            <div>
              <h4 class="text-lg font-semibold text-white/90 mb-4">Контактная информация</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-white/80 mb-2">Email</label>
                  <input 
                    v-model="profileForm.email"
                    type="email"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                    placeholder="email@example.com"
                  >
                </div>
                
                <div>
                  <label class="block text-white/80 mb-2">Телефон</label>
                  <input 
                    v-model="profileForm.phone"
                    type="tel"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                    placeholder="+7 (999) 999-99-99"
                  >
                </div>
              </div>
            </div>
            
            <!-- Личные данные -->
            <div>
              <h4 class="text-lg font-semibold text-white/90 mb-4">Личные данные</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-white/80 mb-2">Дата рождения</label>
                  <input 
                    v-model="birthDateFormatted"
                    type="date"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                  >
                </div>
                
                <div>
                  <label class="block text-white/80 mb-2">Город</label>
                  <input 
                    v-model="profileForm.city"
                    type="text"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                    placeholder="Москва"
                  >
                </div>
              </div>
            </div>
            
            <!-- Церковь -->
            <div>
              <h4 class="text-lg font-semibold text-white/90 mb-4">Церковь</h4>
              <div>
                <label class="block text-white/80 mb-2">Название церкви</label>
                <input 
                  v-model="profileForm.church_name"
                  type="text"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                  placeholder="Название церкви"
                >
              </div>
            </div>
            
            <!-- О себе -->
            <div>
              <h4 class="text-lg font-semibold text-white/90 mb-4">О себе</h4>
              <div>
                <textarea 
                  v-model="profileForm.about"
                  rows="4"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                  placeholder="Расскажите о себе..."
                ></textarea>
              </div>
            </div>
            
            <!-- Смена пароля -->
            <div>
              <h4 class="text-lg font-semibold text-white/90 mb-4">Смена пароля</h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-white/80 mb-2">Текущий пароль</label>
                  <input 
                    v-model="passwordForm.current_password"
                    type="password"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                  >
                </div>
                
                <div>
                  <label class="block text-white/80 mb-2">Новый пароль</label>
                  <input 
                    v-model="passwordForm.new_password"
                    type="password"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                  >
                </div>
                
                <div>
                  <label class="block text-white/80 mb-2">Подтверждение</label>
                  <input 
                    v-model="passwordForm.new_password_confirmation"
                    type="password"
                    class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                  >
                </div>
              </div>
              <p v-if="passwordMismatch" class="mt-2 text-red-300 text-sm">
                Пароли не совпадают
              </p>
            </div>
            
            <div class="flex justify-end gap-4 pt-4">
              <button 
                type="button"
                @click="resetForm"
                class="px-6 py-2 bg-gray-500/20 border border-gray-500/50 text-gray-200 rounded-lg hover:bg-gray-500/30 transition"
              >
                Сбросить
              </button>
              <button 
                type="submit"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                :disabled="updateLoading"
              >
                {{ updateLoading ? 'Сохранение...' : 'Сохранить изменения' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Модальное окно загрузки аватара -->
        <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
            <h3 class="text-2xl font-bold text-white mb-4">Загрузить аватар</h3>
            
            <input 
              type="file" 
              ref="fileInput"
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            >
            
            <button 
              @click="triggerFileInput"
              class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition mb-4"
            >
              Выбрать файл
            </button>
            
            <div v-if="previewUrl" class="mb-4">
              <p class="text-white mb-2">Предпросмотр:</p>
              <img :src="previewUrl" class="w-32 h-32 rounded-lg object-cover mx-auto">
            </div>
            
            <div class="flex gap-2">
              <button 
                @click="uploadAvatar"
                :disabled="!selectedFile || uploadLoading"
                class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                {{ uploadLoading ? 'Загрузка...' : 'Загрузить' }}
              </button>
              <button 
                @click="closeUploadModal"
                class="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
        
        <!-- Модальное окно обновления согласия -->
        <div v-if="showConsentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
            <h3 class="text-2xl font-bold text-white mb-4">Обновление согласия</h3>
            <p class="text-white/80 mb-6">
              Политика конфиденциальности была обновлена до версии 2.0. Пожалуйста, подтвердите свое согласие с новой версией.
            </p>
            <div class="mb-6">
              <div class="flex items-start gap-3">
                <div class="flex items-center h-6">
                  <input
                    id="update-privacy"
                    v-model="consentAccepted"
                    type="checkbox"
                    class="w-4 h-4 bg-white/10 border border-white/20 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  >
                </div>
                <div class="flex-1">
                  <label for="update-privacy" class="text-white/80 text-sm">
                    Я согласен на обработку персональных данных с новой версией политики
                  </label>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                @click="handleConsentUpdate"
                :disabled="!consentAccepted || consentUpdating"
                class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                {{ consentUpdating ? 'Обновление...' : 'Подтвердить' }}
              </button>
              <button 
                @click="closeConsentModal"
                class="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'
import { useFavorites } from '~/composables/useFavorites'
import Avatar from '~/components/auth/Avatar.vue'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const { favorites, loadFavorites } = useFavorites()
const favoritesCount = ref(0)

const { user, isAdmin, userRoles, userRolesList, avatarUrl } = storeToRefs(authStore)

const consentDate = computed(() => authStore.consentDate)
const consentVersion = computed(() => authStore.consentVersion || '1.0')
const consentIp = computed(() => authStore.consentIp)
const consentHistory = computed(() => authStore.consentHistory)
const needsConsentUpdate = computed(() => authStore.needsConsentUpdate)

const profileForm = ref({
  name: '',
  last_name: '',
  middle_name: '',
  email: '',
  phone: '',
  city: '',
  church_name: '',
  about: '',
  birth_date: ''
})

const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const updateLoading = ref(false)
const uploadLoading = ref(false)
const consentUpdating = ref(false)
const dataLoaded = ref(false)

const showUploadModal = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const showConsentModal = ref(false)
const consentAccepted = ref(false)

const fullName = computed(() => {
  if (!user.value) return 'Пользователь'
  const parts = [user.value.last_name, user.value.name, user.value.middle_name].filter(Boolean)
  return parts.join(' ') || user.value.name || 'Пользователь'
})

const passwordMismatch = computed(() => {
  return passwordForm.value.new_password && 
         passwordForm.value.new_password_confirmation &&
         passwordForm.value.new_password !== passwordForm.value.new_password_confirmation
})

const registrationDate = computed(() => {
  if (user.value?.created_at) {
    return new Date(user.value.created_at).toLocaleDateString('ru-RU')
  }
  return 'Неизвестно'
})

const formatDateForInput = (dateString: string) => {
  if (!dateString) return ''
  if (dateString.includes('T')) return dateString.split('T')[0]
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString
  return ''
}

const birthDateFormatted = computed({
  get: () => formatDateForInput(profileForm.value.birth_date),
  set: (value: string) => {
    profileForm.value.birth_date = value
  }
})

const getRoleClass = (role: string) => {
  const roleClasses: Record<string, string> = {
    'Супер-администратор': 'bg-red-500/20 text-red-200 border border-red-500/50',
    'Администратор': 'bg-orange-500/20 text-orange-200 border border-orange-500/50',
    'Редактор': 'bg-blue-500/20 text-blue-200 border border-blue-500/50',
    'Член семьи': 'bg-green-500/20 text-green-200 border border-green-500/50',
    'Служитель': 'bg-purple-500/20 text-purple-200 border border-purple-500/50',
    'Пастор': 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/50',
    'Пользователь': 'bg-gray-500/20 text-gray-200 border border-gray-500/50'
  }
  return roleClasses[role] || 'bg-gray-500/20 text-gray-200 border border-gray-500/50'
}

const loadUserData = () => {
  if (user.value) {
    profileForm.value = {
      name: user.value.name || '',
      last_name: user.value.last_name || '',
      middle_name: user.value.middle_name || '',
      email: user.value.email || '',
      phone: user.value.phone || '',
      city: user.value.city || '',
      church_name: user.value.church_name || '',
      about: user.value.about || '',
      birth_date: user.value.birth_date || ''
    }
    dataLoaded.value = true
  }
}

const restoreScroll = () => {
  if (process.client) {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
  }
}

const closeConsentModal = () => {
  showConsentModal.value = false
  consentAccepted.value = false
  restoreScroll()
}

const clearCache = () => {
  if (process.client) {
    localStorage.clear()
    sessionStorage.clear()
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
    notificationStore.success('Кэш очищен', 'Страница будет перезагружена')
    setTimeout(() => {
      window.location.reload(true)
    }, 1000)
  }
}

const handleConsentUpdate = async () => {
  if (!consentAccepted.value) {
    notificationStore.warning('Внимание', 'Необходимо подтвердить согласие')
    return
  }
  
  consentUpdating.value = true
  const result = await authStore.updateConsent('2.0')
  
  if (result.success) {
    notificationStore.success('Согласие обновлено', 'Спасибо за подтверждение')
    closeConsentModal()
  } else {
    notificationStore.error('Ошибка', result.error)
  }
  
  consentUpdating.value = false
}

const resetForm = () => {
  loadUserData()
  passwordForm.value = {
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  }
  notificationStore.info('Форма сброшена', 'Данные возвращены к исходным')
}

const handleLogout = async () => {
  await authStore.logout()
  restoreScroll()
  notificationStore.info('До свидания!', 'Вы вышли из системы')
}

const openAvatarUpload = () => {
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  selectedFile.value = null
  previewUrl.value = null
  restoreScroll()
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const uploadAvatar = async () => {
    if (!selectedFile.value) {
        notificationStore.warning('Нет файла', 'Выберите файл для загрузки')
        return
    }
    
    uploadLoading.value = true
    const formData = new FormData()
    formData.append('avatar', selectedFile.value)
    
    try {
        const response = await $fetch('https://wotgospel.ru/api/user/avatar', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${authStore.token}`,
                'Accept': 'application/json'
            }
        })
        
        if (response.avatar && user.value) {
            user.value.avatar = response.avatar
            if (process.client) {
                const userStr = localStorage.getItem('auth_user')
                if (userStr) {
                    const localUser = JSON.parse(userStr)
                    localUser.avatar = response.avatar
                    localStorage.setItem('auth_user', JSON.stringify(localUser))
                }
            }
            // ✅ Принудительно обновляем аватар в store
            authStore.user = { ...authStore.user, avatar: response.avatar }
        }
        
        closeUploadModal()
        notificationStore.success('Аватар обновлен', 'Новый аватар успешно загружен')
        
    } catch (err: any) {
        console.error('Upload error:', err)
        notificationStore.error('Ошибка загрузки', err?.data?.message || 'Не удалось загрузить аватар')
    } finally {
        uploadLoading.value = false
    }
}

const updateProfile = async () => {
  if (passwordForm.value.new_password && passwordMismatch.value) {
    notificationStore.error('Ошибка', 'Пароли не совпадают')
    return
  }
  
  updateLoading.value = true
  
  const updateData: Record<string, any> = {
    name: profileForm.value.name,
    last_name: profileForm.value.last_name,
    middle_name: profileForm.value.middle_name,
    email: profileForm.value.email,
    phone: profileForm.value.phone,
    city: profileForm.value.city,
    church_name: profileForm.value.church_name,
    about: profileForm.value.about,
    birth_date: profileForm.value.birth_date
  }
  
  if (passwordForm.value.new_password) {
    updateData.current_password = passwordForm.value.current_password
    updateData.new_password = passwordForm.value.new_password
    updateData.new_password_confirmation = passwordForm.value.new_password_confirmation
  }
  
  try {
    const response = await $fetch('https://wotgospel.ru/api/user/profile', {
      method: 'PUT',
      body: updateData,
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (response.user && user.value) {
      Object.assign(user.value, response.user)
      if (process.client) {
        localStorage.setItem('auth_user', JSON.stringify(user.value))
      }
    }
    
    passwordForm.value = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    }
    
    notificationStore.success('Профиль обновлен', 'Ваши данные успешно сохранены')
    
    if (response.email_verification_required) {
      notificationStore.warning(
        'Требуется подтверждение email',
        'На новый email отправлено письмо с ссылкой для подтверждения'
      )
    }
  } catch (err: any) {
    console.error('Update error:', err)
    notificationStore.error('Ошибка обновления', err?.data?.message || 'Не удалось обновить профиль')
  } finally {
    updateLoading.value = false
  }
}

const loadFavoritesCount = async () => {
  await loadFavorites()
  favoritesCount.value = favorites.value.length
}

onMounted(async () => {
  if (!authStore.initialized) {
    await authStore.init()
  }
  
  if (!authStore.isAuthenticated) {
    await router.push('/auth/login')
    return
  }
  
  if (!authStore.isEmailVerified) {
    await router.push('/auth/verify')
    return
  }
  
  loadUserData()
  await loadFavoritesCount()
  await authStore.fetchConsentHistory()
})

watch(user, (newUser) => {
  if (newUser && !dataLoaded.value) {
    loadUserData()
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
}

.hyphens-auto {
  hyphens: auto;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.whitespace-normal {
  white-space: normal;
}
</style>