<template>
  <button
    v-if="showInstallPrompt"
    @click="installPWA"
    class="fixed bottom-20 right-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition"
    aria-label="Установить приложение"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  </button>
</template>

<script setup>
const showInstallPrompt = ref(false);

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    showInstallPrompt.value = true;
    window.deferredPrompt = e;
  });
});

const installPWA = () => {
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt();
    window.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      showInstallPrompt.value = false;
      window.deferredPrompt = null;
    });
  }
};
</script>