<template>
  <header class="bg-gradient-to-r from-blue-900 to-purple-900 text-white sticky top-0 z-30 shadow-lg">
    <nav class="container mx-auto px-4 py-3">
      <div class="flex justify-between items-center">
        <!-- Логотип -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <img 
            src="/icons/logo.png" 
            alt="Слово Истины" 
            class="w-8 h-8 md:w-10 md:h-10 object-contain transition-transform group-hover:scale-105"
            loading="lazy"
          >
          <span class="text-xl md:text-2xl font-bold hover:text-blue-300 transition">
            Слово Истины
          </span>
        </NuxtLink>
        
        <!-- Десктопное меню -->
        <div class="hidden md:flex items-center gap-6">
          <NuxtLink 
            to="/" 
            class="hover:text-blue-300 transition"
            active-class="text-blue-300 font-semibold"
          >
            Главная
          </NuxtLink>
          
          <NuxtLink 
            v-if="authStore.isPastor"
            to="/pastor/users"
            class="hover:text-blue-300 transition"
          >
            👥 Пользователи
          </NuxtLink>
          
          <!-- ✅ Авторизация только на клиенте -->
          <ClientOnly>
            <template v-if="user">
              <div class="relative">
                <button 
                  @click="toggleUserMenu" 
                  class="flex items-center gap-2 hover:text-blue-300 transition"
                >
                  <Avatar 
                    :src="avatarUrl" 
                    :name="user?.name"
                    size="sm"
                    rounded="full"  
                    :border="true"
                  />
                  <span class="hidden lg:inline">{{ user?.name }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- ✅ ВЫПАДАЮЩЕЕ МЕНЮ (было пропущено) -->
                <div 
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl z-50"
                >
                  <div class="p-3 border-b border-white/10">
                    <div class="font-medium text-white">{{ user?.name }}</div>
                    <div class="text-xs text-white/60">{{ userRoles }}</div>
                  </div>
                  <NuxtLink 
                    to="/dashboard" 
                    class="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition"
                    @click="showUserMenu = false"
                  >
                    Личный кабинет
                  </NuxtLink>
                  <button 
                    @click="handleLogout"
                    class="w-full text-left px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition"
                  >
                    Выйти
                  </button>
                </div>
              </div>
            </template>
            
            <template v-else>
              <NuxtLink to="/auth/login" class="hover:text-blue-300 transition">Вход</NuxtLink>
              <NuxtLink to="/auth/register" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition">
                Регистрация
              </NuxtLink>
            </template>
            
            <template #fallback>
              <div class="flex items-center gap-6">
                <div class="w-20 h-6 bg-white/10 rounded animate-pulse" />
                <div class="w-24 h-10 bg-white/10 rounded animate-pulse" />
              </div>
            </template>
          </ClientOnly>
        </div>
        
        <!-- Мобильные контролы -->
        <div class="flex md:hidden items-center gap-2">
          <ClientOnly>
            <NuxtLink 
              v-if="user"
              to="/dashboard"
              class="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <Avatar 
                :src="avatarUrl" 
                :name="user?.name"
                size="sm"  
                rounded="full" 
                :border="false"
              />
            </NuxtLink>
            
            <NuxtLink 
              v-else
              to="/auth/login" 
              class="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </NuxtLink>
            
            <template #fallback>
              <div class="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
            </template>
          </ClientOnly>
          
          <button 
            @click="$emit('toggle-mobile-menu')"
            class="p-2 hover:bg-white/10 rounded-lg transition"
            aria-label="Меню"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import Avatar from '~/components/auth/Avatar.vue'
import { storeToRefs } from 'pinia'

defineProps({
  mobileMenuOpen: Boolean
})

const emit = defineEmits(['toggle-mobile-menu', 'update:mobile-menu'])

const authStore = useAuthStore()
const router = useRouter()

const { user, userRoles, avatarUrl } = storeToRefs(authStore)

const showUserMenu = ref(false)

const closeUserMenu = () => {
  showUserMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})

const toggleUserMenu = (event) => {
  event.stopPropagation()
  showUserMenu.value = !showUserMenu.value
  console.log('👆 Menu toggled:', showUserMenu.value) // ✅ Для отладки
}

const handleLogout = async () => {
  await authStore.logout()
  showUserMenu.value = false
  router.push('/')
}
</script>