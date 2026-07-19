<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
    <div class="text-center text-white p-8">
      <svg class="w-24 h-24 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 class="text-2xl font-bold mb-4">Нет соединения с интернетом</h1>
      <p class="mb-6">Пожалуйста, проверьте подключение и попробуйте снова</p>
      <button 
        @click="retry" 
        class="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
      >
        Попробовать снова
      </button>
    </div>
  </div>
</template>

<script setup>
const retry = () => {
  window.location.reload()
}

useHead({
  title: 'Нет соединения | Церковь Слово Истины'
})
</script>