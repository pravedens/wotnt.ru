<template>
  <div class="flex items-center gap-3">
    <Avatar :src="avatarUrl" :name="user?.name" />
    <div class="hidden md:block">
      <div class="font-medium text-white">{{ user?.name }}</div>
      <div class="text-xs text-white/60">{{ userRoles }}</div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { user, avatarUrl, userRoles } = storeToRefs(authStore)
</script>