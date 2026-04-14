<template>
  <div class="flex items-center gap-3">
    <Avatar :src="avatarUrl" :name="user?.name" />
    <div class="hidden md:block min-w-0">
      <div class="font-medium text-white truncate max-w-[150px]">{{ user?.name }}</div>
      <!-- ✅ Добавлен перенос для длинных названий ролей -->
      <div class="text-xs text-white/60 break-words max-w-[150px]">{{ userRoles }}</div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { user, avatarUrl, userRoles } = storeToRefs(authStore)
</script>