<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mt-8">
    <h3 class="text-xl font-bold text-white mb-6">
      💬 Комментарии 
      <span v-if="commentsCount > 0" class="text-white/40 text-lg ml-2">({{ commentsCount }})</span>
    </h3>
    
    <!-- Форма добавления комментария (только для авторизованных) -->
    <div v-if="isAuthenticated" class="mb-8">
      <form @submit.prevent="submitComment">
        <textarea
          v-model="commentForm.content"
          :placeholder="replyTo ? `Ответить ${replyTo.user?.name}...` : 'Написать комментарий...'"
          rows="3"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition resize-none"
        ></textarea>
        
        <div v-if="replyTo" class="flex items-center justify-between mt-2">
          <button 
            type="button" 
            @click="cancelReply"
            class="text-white/50 text-sm hover:text-white transition"
          >
            Отменить ответ
          </button>
          <button 
            type="submit" 
            :disabled="submitting || !commentForm.content.trim()"
            class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
          >
            {{ submitting ? 'Отправка...' : 'Отправить' }}
          </button>
        </div>
        
        <div v-else class="flex justify-end mt-2">
          <button 
            type="submit" 
            :disabled="submitting || !commentForm.content.trim()"
            class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
          >
            {{ submitting ? 'Отправка...' : 'Отправить' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Сообщение для неавторизованных -->
    <div v-else class="bg-white/5 rounded-lg p-6 text-center mb-8">
      <p class="text-white/70 mb-3">Чтобы оставить комментарий, войдите в аккаунт</p>
      <NuxtLink 
        :to="`/auth/login?redirect=${route.fullPath}`"
        class="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
      >
        Войти
      </NuxtLink>
    </div>
    
    <!-- Загрузка комментариев -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent mx-auto"></div>
      <p class="text-white/60 mt-2">Загрузка комментариев...</p>
    </div>
    
    <!-- Список комментариев -->
    <div v-else-if="comments.length > 0" class="space-y-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :post-id="postId"
        @reply="setReplyTo"
        @delete="handleDeleteComment"
        @like="handleLikeComment"
      />
    </div>
    
    <!-- Нет комментариев -->
    <div v-else class="text-center py-8 text-white/40">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p>Будьте первым, кто оставит комментарий</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notification'
import { useApi } from '~/composables/useApi'  // ✅ ДОБАВЛЕН ИМПОРТ
import type { Comment, CommentForm } from '~/types/comment'
import CommentItem from './CommentItem.vue'

// Интерфейсы для ответов API
interface CommentsResponse {
  comments: Comment[]
}

interface CommentResponse {
  success: boolean
  message?: string
  comment?: Comment
}

const props = defineProps<{
  postId: number
}>()

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { $api } = useApi()  // ✅ ДОБАВЛЕНО

const isAuthenticated = computed(() => authStore.isAuthenticated)

const comments = ref<Comment[]>([])
const loading = ref(true)
const submitting = ref(false)
const commentForm = ref<CommentForm>({ content: '', parent_id: null })
const replyTo = ref<Comment | null>(null)

const commentsCount = computed(() => comments.value.length)

// Загрузка комментариев
const loadComments = async () => {
  loading.value = true
  try {
    // ✅ Используем $api вместо $fetch с baseURL
    const response = await $api<CommentsResponse>(`/posts/${props.postId}/comments`)
    comments.value = response.comments || []
  } catch (error) {
    console.error('Failed to load comments:', error)
    notificationStore.error('Ошибка', 'Не удалось загрузить комментарии')
  } finally {
    loading.value = false
  }
}

// Отправка комментария
const submitComment = async () => {
  if (!commentForm.value.content.trim()) return
  
  submitting.value = true
  try {
    // ✅ Используем $api вместо $fetch с baseURL
    const response = await $api<CommentResponse>(`/posts/${props.postId}/comments`, {
      method: 'POST',
      body: commentForm.value
    })
    
    if (response.success) {
      notificationStore.success('Успешно', 'Комментарий добавлен')
      commentForm.value = { content: '', parent_id: null }
      replyTo.value = null
      await loadComments()
    }
  } catch (error: any) {
    notificationStore.error('Ошибка', error?.data?.message || 'Не удалось добавить комментарий')
  } finally {
    submitting.value = false
  }
}

// Установка ответа
const setReplyTo = (comment: Comment) => {
  replyTo.value = comment
  commentForm.value.parent_id = comment.id
  commentForm.value.content = ''
  
  // Прокрутка к форме
  const formElement = document.querySelector('.bg-white/10 form')
  formElement?.scrollIntoView({ behavior: 'smooth' })
}

// Отмена ответа
const cancelReply = () => {
  replyTo.value = null
  commentForm.value.parent_id = null
  commentForm.value.content = ''
}

// Удаление комментария
const handleDeleteComment = async (commentId: number) => {
  if (!confirm('Удалить комментарий?')) return
  
  try {
    // ✅ Используем $api вместо $fetch с baseURL
    await $api(`/comments/${commentId}`, {
      method: 'DELETE'
    })
    notificationStore.success('Успешно', 'Комментарий удалён')
    await loadComments()
  } catch (error: any) {
    notificationStore.error('Ошибка', error?.data?.message || 'Не удалось удалить комментарий')
  }
}

// Лайк комментария
const handleLikeComment = async (commentId: number) => {
  if (!isAuthenticated.value) {
    notificationStore.warning('Внимание', 'Войдите, чтобы оценивать комментарии')
    return
  }
  
  try {
    // ✅ Используем $api вместо $fetch с baseURL
    await $api(`/comments/${commentId}/like`, {
      method: 'POST'
    })
    await loadComments()
  } catch (error) {
    console.error('Failed to like comment:', error)
  }
}

onMounted(() => {
  loadComments()
})
</script>