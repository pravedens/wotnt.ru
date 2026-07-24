<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all group h-full flex flex-col">
    <div class="p-6 flex flex-col h-full">
      <!-- Аватар -->
      <div class="flex justify-center mb-4">
        <Avatar :src="teacher.avatar_url" :name="fullName" size="xl" rounded="lg" :border="true" />
      </div>

      <!-- Имя -->
      <h3 class="text-xl font-bold text-white text-center mb-1">{{ fullName }}</h3>
      
      <!-- Роль -->
      <p class="text-blue-300 text-center text-sm mb-4">Преподаватель библейской школы</p>

      <!-- О себе -->
      <p v-if="teacher.about" class="text-white/60 text-sm text-center mb-4 line-clamp-3">
        {{ teacher.about }}
      </p>

      <!-- Кнопка "Написать" — прижата к низу -->
      <div class="mt-auto pt-4 border-t border-white/10">
        <button 
          @click="openMessageModal"
          class="w-full py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
        >
          ✉️ Написать учителю
        </button>
      </div>
    </div>
  </div>
  
  <!-- Модальное окно -->
  <WriteTeacherModal 
    :visible="modalVisible" 
    :teacher="teacher"
    @close="modalVisible = false"
    @sent="modalVisible = false"
  />
</template>

<script setup lang="ts">
import Avatar from '~/components/auth/Avatar.vue'
import WriteTeacherModal from './WriteTeacherModal.vue'
import type { Teacher } from '~/types/bible-school'

const props = defineProps<{
  teacher: Teacher
}>()

const modalVisible = ref(false)

const fullName = computed(() => {
  const parts = []
  if (props.teacher.last_name) parts.push(props.teacher.last_name)
  if (props.teacher.name) parts.push(props.teacher.name)
  if (props.teacher.middle_name) parts.push(props.teacher.middle_name)
  return parts.length ? parts.join(' ') : 'Преподаватель'
})

const openMessageModal = () => {
  modalVisible.value = true
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
}
</style>