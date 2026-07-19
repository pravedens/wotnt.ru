<template>
  <div class="bg-white/5 rounded-xl p-4">
    <div class="flex items-start gap-3">
      <!-- Аватар -->
      <Avatar 
        :src="comment.user?.avatar" 
        :name="comment.user?.name || 'User'"
        size="md"
        rounded="full"
      />
      
      <div class="flex-1 min-w-0">
        <!-- Заголовок -->
        <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-white">
              {{ comment.user?.full_name || comment.user?.name }}
            </span>
            <span class="text-white/40 text-xs">
              {{ formatDate(comment.created_at) }}
            </span>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Кнопка ответа -->
            <button 
              v-if="isAuthenticated"
              @click="$emit('reply', comment)"
              class="text-white/40 hover:text-white text-xs transition"
              title="Ответить"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            
            <!-- Кнопка удаления (только для автора или админа) -->
            <button 
              v-if="canDelete"
              @click="$emit('delete', comment.id)"
              class="text-white/40 hover:text-red-400 text-xs transition"
              title="Удалить"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Текст комментария -->
        <p class="text-white/80 text-sm leading-relaxed">
          {{ comment.content }}
        </p>
        
        <!-- Кнопка лайка -->
        <button 
          @click="$emit('like', comment.id)"
          class="flex items-center gap-1 mt-2 text-xs transition"
          :class="comment.is_liked ? 'text-red-400' : 'text-white/40 hover:text-white/60'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span>{{ comment.likes_count || 0 }}</span>
        </button>
        
        <!-- Ответы -->
        <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 pl-4 border-l-2 border-white/10">
          <CommentItem
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
            :post-id="postId"
            @reply="$emit('reply', $event)"
            @delete="$emit('delete', $event)"
            @like="$emit('like', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import Avatar from '~/components/auth/Avatar.vue'
import type { Comment } from '~/types/comment'

const props = defineProps<{
  comment: Comment
  postId: number
}>()

const emit = defineEmits(['reply', 'delete', 'like'])

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const canDelete = computed(() => {
  return isAuthenticated.value && (
    authStore.user?.id === props.comment.user_id ||
    authStore.isAdmin
  )
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин. назад`
  if (diffHours < 24) return `${diffHours} ч. назад`
  if (diffDays < 7) return `${diffDays} д. назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>