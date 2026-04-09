<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Шапка с кнопкой выхода -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Личный кабинет</h1>
        <button 
          @click="handleLogout"
          class="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg hover:bg-red-500/30 transition"
        >
          Выйти
        </button>
      </div>
      
      <!-- Карточка пользователя с аватаром -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
        <div class="flex items-center gap-6">
          <div class="relative">
            <Avatar 
              :src="avatarUrl" 
              :name="user?.name"
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
          
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white">{{ fullName }}</h2>
            <p class="text-white/60">{{ user?.email }}</p>
            <div class="mt-2 flex gap-2 flex-wrap">
              <span 
                class="px-3 py-1 text-sm rounded-full"
                :class="isAdmin ? 'bg-purple-500/20 text-purple-200 border border-purple-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'"
              >
                {{ isAdmin ? 'Администратор' : 'Пользователь' }}
              </span>
              <span v-if="user?.church_name" class="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/50">
                {{ user.church_name }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Карточки статистики -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 class="text-lg font-semibold text-white mb-2">📊 Статус</h3>
          <p class="text-3xl font-bold text-white">✓</p>
          <p class="text-white/60">Аккаунт активен</p>
        </div>
        
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 class="text-lg font-semibold text-white mb-2">👥 Роль</h3>
          <p class="text-3xl font-bold text-white">{{ userRoles }}</p>
          <p class="text-white/60">Текущая роль</p>
        </div>
        
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 class="text-lg font-semibold text-white mb-2">📅 Регистрация</h3>
          <p class="text-3xl font-bold text-white">{{ registrationDate }}</p>
          <p class="text-white/60">Дата регистрации</p>
        </div>
        
        <!-- Карточка избранного -->
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
      
      <!-- Блок согласий и политики -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">📋 Согласия и политики</h3>
          
          <!-- Кнопка для просмотра политики -->
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
          <!-- Текущее согласие -->
          <div class="bg-white/5 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <div class="text-2xl">✅</div>
              <div class="flex-1">
                <h4 class="text-white font-semibold mb-2">Согласие на обработку персональных данных</h4>
                <div class="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-white/60">Дата принятия:</span>
                    <span class="text-white ml-2">{{ consentDate || 'Не указано' }}</span>
                  </div>
                  <div>
                    <span class="text-white/60">Версия политики:</span>
                    <span class="text-white ml-2">{{ consentVersion }}</span>
                  </div>
                  <div v-if="consentIp">
                    <span class="text-white/60">IP-адрес:</span>
                    <span class="text-white ml-2">{{ consentIp }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Индикатор необходимости обновления согласия -->
          <div v-if="needsConsentUpdate" class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <div class="text-2xl">⚠️</div>
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
          
          <!-- История согласий (если есть) -->
          <div v-if="consentHistory.length > 0" class="mt-4">
            <h4 class="text-white font-semibold mb-2">История согласий</h4>
            <div class="space-y-2">
              <div 
                v-for="(item, index) in consentHistory" 
                :key="index"
                class="bg-white/5 rounded-lg p-3 text-sm flex items-center justify-between"
              >
                <div>
                  <span class="text-white/60">Версия {{ item.version }}</span>
                  <span class="text-white/60 mx-2">•</span>
                  <span class="text-white">{{ item.date }}</span>
                </div>
                <span class="text-white/40 text-xs">{{ item.ip }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Форма редактирования профиля -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-6">Редактировать профиль</h3>
        
        <form @submit.prevent="updateProfile" class="space-y-6">
          <!-- Основная информация -->
          <div>
            <h4 class="text-lg font-semibold text-white/90 mb-4">Основная информация</h4>
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-white/80 mb-2">Имя</label>
                <input 
                  v-model="profileForm.name"
                  type="text"
                  autocomplete="given-name"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
                  placeholder="Иван"
                >
              </div>
              
              <div>
                <label class="block text-white/80 mb-2">Фамилия</label>
                <input 
                  v-model="profileForm.last_name"
                  type="text"
                  autocomplete="family-name"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
                  placeholder="Иванов"
                >
              </div>
              
              <div>
                <label class="block text-white/80 mb-2">Отчество</label>
                <input 
                  v-model="profileForm.middle_name"
                  type="text"
                  autocomplete="additional-name"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
                  placeholder="Иванович"
                >
              </div>
            </div>
          </div>
          
          <!-- Контактная информация -->
          <div>
            <h4 class="text-lg font-semibold text-white/90 mb-4">Контактная информация</h4>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-white/80 mb-2">Email</label>
                <input 
                  v-model="profileForm.email"
                  type="email"
                  autocomplete="email"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
                  placeholder="email@example.com"
                >
              </div>
              
              <div>
                <label class="block text-white/80 mb-2">Телефон</label>
                <input 
                  v-model="profileForm.phone"
                  type="tel"
                  autocomplete="tel"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
                  placeholder="+7 (999) 999-99-99"
                >
              </div>
            </div>
          </div>
          
          <!-- Личные данные -->
          <div>
            <h4 class="text-lg font-semibold text-white/90 mb-4">Личные данные</h4>
            <div class="grid md:grid-cols-2 gap-4">
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
                  autocomplete="address-level2"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
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
                autocomplete="organization"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
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
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition"
                placeholder="Расскажите о себе..."
              ></textarea>
            </div>
          </div>
          
          <!-- Смена пароля -->
          <div>
            <h4 class="text-lg font-semibold text-white/90 mb-4">Смена пароля</h4>
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-white/80 mb-2">Текущий пароль</label>
                <input 
                  v-model="passwordForm.current_password"
                  type="password"
                  autocomplete="current-password"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                >
              </div>
              
              <div>
                <label class="block text-white/80 mb-2">Новый пароль</label>
                <input 
                  v-model="passwordForm.new_password"
                  type="password"
                  autocomplete="new-password"
                  class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                >
              </div>
              
              <div>
                <label class="block text-white/80 mb-2">Подтверждение</label>
                <input 
                  v-model="passwordForm.new_password_confirmation"
                  type="password"
                  autocomplete="new-password"
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
            @click="$refs.fileInput.click()"
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
              @click="showConsentModal = false; consentAccepted = false"
              class="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
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

const { user, isAdmin, userRoles, avatarUrl } = storeToRefs(authStore)

// Данные согласия - теперь берем из store
const consentDate = computed(() => authStore.consentDate)
const consentVersion = computed(() => authStore.consentVersion || '1.0')
const consentIp = computed(() => authStore.consentIp)
const consentHistory = computed(() => authStore.consentHistory)
const needsConsentUpdate = computed(() => authStore.needsConsentUpdate)

// Форма редактирования профиля
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

// Форма смены пароля
const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

// Состояния загрузки
const updateLoading = ref(false)
const uploadLoading = ref(false)
const consentUpdating = ref(false)
const dataLoaded = ref(false)

// Загрузка аватара
const showUploadModal = ref(false)
const selectedFile = ref(null)
const previewUrl = ref(null)
const fileInput = ref(null)

// Модальное окно согласия
const showConsentModal = ref(false)
const consentAccepted = ref(false)

// Полное имя
const fullName = computed(() => {
  const parts = [
    profileForm.value.last_name,
    profileForm.value.name,
    profileForm.value.middle_name
  ].filter(Boolean)
  return parts.join(' ') || user.value?.name || 'Пользователь'
})

// Проверка совпадения паролей
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

// Форматирование даты для input type="date"
const formatDateForInput = (dateString: string) => {
  if (!dateString) return ''
  
  if (dateString.includes('T')) {
    return dateString.split('T')[0]
  }
  
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString
  }
  
  return ''
}

// Computed поле для двусторонней привязки даты
const birthDateFormatted = computed({
  get: () => formatDateForInput(profileForm.value.birth_date),
  set: (value) => {
    profileForm.value.birth_date = value
  }
})

// Загрузка данных пользователя в форму
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
  } else {
    if (process.client) {
      const userStr = localStorage.getItem('auth_user')
      if (userStr) {
        try {
          const localUser = JSON.parse(userStr)
          profileForm.value = {
            name: localUser.name || '',
            last_name: localUser.last_name || '',
            middle_name: localUser.middle_name || '',
            email: localUser.email || '',
            phone: localUser.phone || '',
            city: localUser.city || '',
            church_name: localUser.church_name || '',
            about: localUser.about || '',
            birth_date: localUser.birth_date || ''
          }
          dataLoaded.value = true
        } catch (e) {
          console.error('Error parsing localStorage user:', e)
        }
      }
    }
  }
}

// Обновление согласия через store
const handleConsentUpdate = async () => {
  if (!consentAccepted.value) {
    notificationStore.warning('Внимание', 'Необходимо подтвердить согласие')
    return
  }
  
  consentUpdating.value = true
  
  const result = await authStore.updateConsent('2.0')
  
  if (result.success) {
    notificationStore.success(
      'Согласие обновлено',
      'Спасибо за подтверждение'
    )
    showConsentModal.value = false
    consentAccepted.value = false
  } else {
    notificationStore.error('Ошибка', result.error)
  }
  
  consentUpdating.value = false
}

// Сброс формы
const resetForm = () => {
  loadUserData()
  passwordForm.value = {
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  }
  notificationStore.info('Форма сброшена', 'Данные возвращены к исходным')
}

// Выход
const handleLogout = async () => {
  await authStore.logout()
  await router.push('/')
  notificationStore.info('До свидания!', 'Вы вышли из системы')
}

// Методы для аватара
const openAvatarUpload = () => {
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  selectedFile.value = null
  previewUrl.value = null
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

// Вспомогательная функция для получения CSRF токена
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift())
  }
  return null
}

// Загрузка аватара
const uploadAvatar = async () => {
  if (!selectedFile.value) {
    notificationStore.warning('Нет файла', 'Выберите файл для загрузки')
    return
  }
  
  uploadLoading.value = true
  const xsrfToken = getCookie('XSRF-TOKEN')
  const formData = new FormData()
  formData.append('avatar', selectedFile.value)
  
  try {
    const { data, error } = await useFetch('/api/user/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'X-XSRF-TOKEN': xsrfToken || ''
      },
      credentials: 'include'
    })
    
    if (error.value) {
      throw new Error(error.value.data?.message || 'Ошибка загрузки')
    }
    
    if (data.value?.avatar) {
      authStore.user.avatar = data.value.avatar
      if (process.client) {
        const userStr = localStorage.getItem('auth_user')
        if (userStr) {
          const localUser = JSON.parse(userStr)
          localUser.avatar = data.value.avatar
          localStorage.setItem('auth_user', JSON.stringify(localUser))
        }
      }
    }
    
    closeUploadModal()
    notificationStore.success('Аватар обновлен', 'Новый аватар успешно загружен')
    
  } catch (err) {
    console.error('Upload error:', err)
    notificationStore.error('Ошибка загрузки', err.message || 'Не удалось загрузить аватар')
  } finally {
    uploadLoading.value = false
  }
}

// Обновление профиля
const updateProfile = async () => {
  if (passwordForm.value.new_password && passwordMismatch.value) {
    notificationStore.error('Ошибка', 'Пароли не совпадают')
    return
  }
  
  updateLoading.value = true
  const xsrfToken = getCookie('XSRF-TOKEN')
  
  const updateData = {
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
    const { data, error } = await useFetch('/api/user/profile', {
      method: 'PUT',
      body: updateData,
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': xsrfToken || ''
      },
      credentials: 'include'
    })
    
    if (error.value) {
      throw new Error(error.value.data?.message || 'Ошибка обновления')
    }
    
    authStore.user = { 
      ...authStore.user, 
      ...updateData 
    }
    
    if (process.client) {
      localStorage.setItem('auth_user', JSON.stringify(authStore.user))
    }
    
    passwordForm.value = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    }
    
    notificationStore.success('Профиль обновлен', 'Ваши данные успешно сохранены')
    
  } catch (err) {
    console.error('Update error:', err)
    notificationStore.error('Ошибка обновления', err.message || 'Не удалось обновить профиль')
  } finally {
    updateLoading.value = false
  }
}

// Загружаем количество избранного
const loadFavoritesCount = async () => {
  await loadFavorites()
  favoritesCount.value = favorites.value.length
}

// ✅ Загружаем данные при монтировании
onMounted(async () => {
  console.log('Dashboard mounted - initializing...')
  
  // ✅ Принудительно инициализируем store, если нужно
  if (!authStore.initialized) {
    console.log('Dashboard: Initializing auth store...')
    await authStore.init()
  }
  
  console.log('Dashboard - store state:', {
    isAuthenticated: authStore.isAuthenticated,
    isEmailVerified: authStore.isEmailVerified,
    user: authStore.user,
    email_verified_at: authStore.user?.email_verified_at
  })
  
  // Проверяем авторизацию
  if (!authStore.isAuthenticated) {
    console.log('Dashboard: Not authenticated, redirecting to login')
    await router.push('/auth/login')
    return
  }
  
  // ✅ Проверяем верификацию email
  if (!authStore.isEmailVerified) {
    console.log('Dashboard: Email not verified, redirecting to verify')
    await router.push('/auth/verify')
    return
  }
  
  console.log('Dashboard: Access granted')
  loadUserData()
  await loadFavoritesCount()
})

// Следим за изменениями пользователя
watch(user, (newUser) => {
  console.log('Dashboard: User changed', newUser?.email, 'verified:', newUser?.email_verified_at)
  if (newUser && !dataLoaded.value) {
    loadUserData()
  }
}, { immediate: true, deep: true })
</script>