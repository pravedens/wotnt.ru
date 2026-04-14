<template>
  <Transition name="fade">
    <div 
      v-if="modelValue" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      @click="$emit('update:modelValue', false)"
    ></div>
  </Transition>

  <Transition name="slide">
    <div 
      v-if="modelValue"
      class="fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-blue-900 to-purple-900 z-50 shadow-xl overflow-y-auto"
    >
      <div class="flex justify-end p-4">
        <button 
          @click="$emit('update:modelValue', false)"
          class="text-white/80 hover:text-white transition"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <nav class="px-4 py-2">
        <ul class="space-y-2">
          <!-- Главная -->
          <li>
            <NuxtLink 
              to="/" 
              class="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              @click="$emit('update:modelValue', false)"
            >
              Главная
            </NuxtLink>
          </li>
          
          <!-- Ссылка для пастора (только для авторизованных с ролью pastor) -->
          <li v-if="authStore.isPastor">
            <NuxtLink 
              to="/pastor/users" 
              class="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              @click="$emit('update:modelValue', false)"
            >
              👥 Пользователи
            </NuxtLink>
          </li>
          
          <!-- Для авторизованных пользователей -->
          <template v-if="user">
            <li class="border-t border-white/10 my-2 pt-2">
              <div class="px-4 py-2">
                <div class="flex items-center gap-2">
                  <Avatar :src="avatarUrl" :name="user?.name" class="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div class="text-white font-medium">{{ user?.name }}</div>
                    <div class="text-xs text-white/60">{{ userRoles }}</div>
                  </div>
                </div>
              </div>
            </li>
            
            <!-- Динамическая кнопка: Кабинет/На сайт -->
            <li>
              <NuxtLink 
                v-if="isInDashboard"
                to="/" 
                class="flex items-center gap-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                @click="$emit('update:modelValue', false)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>На сайт</span>
              </NuxtLink>
              <NuxtLink 
                v-else
                to="/dashboard" 
                class="flex items-center gap-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                @click="$emit('update:modelValue', false)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Кабинет</span>
              </NuxtLink>
            </li>
            
            <!-- Выход -->
            <li>
              <button 
                @click="handleLogout"
                class="w-full flex items-center gap-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Выйти</span>
              </button>
            </li>
          </template>
          
          <!-- Для неавторизованных -->
          <template v-else>
            <li class="border-t border-white/10 my-2 pt-2">
              <NuxtLink 
                to="/auth/login" 
                class="flex items-center gap-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                @click="$emit('update:modelValue', false)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Вход</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/auth/register" 
                class="flex items-center gap-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                @click="$emit('update:modelValue', false)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Регистрация</span>
              </NuxtLink>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </Transition>
</template>

<script setup>
import Avatar from '~/components/auth/Avatar.vue'
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: Boolean,
  user: Object,
  isInDashboard: Boolean
})

const emit = defineEmits(['update:modelValue', 'logout'])

const authStore = useAuthStore()
const { user, userRoles, avatarUrl, isPastor } = storeToRefs(authStore)

if (!authStore) {
  console.error('❌ authStore не инициализирован')
}

const handleLogout = () => {
  emit('logout')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>