<template>
  <div v-if="visible" :class="[notificationClass, 'fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-50 animate-slideIn']">
    <div class="flex items-start gap-3">
      <div class="text-2xl">{{ icon }}</div>
      <div class="flex-1">
        <h4 class="font-bold text-white">{{ title }}</h4>
        <p class="text-white/80">{{ message }}</p>
      </div>
      <button @click="close" class="text-white/60 hover:text-white">✕</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'info'
  },
  title: String,
  message: String,
  duration: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['close'])
const visible = ref(true)

const notificationClass = computed(() => {
  const classes = {
    success: 'bg-green-500/90 backdrop-blur-lg',
    error: 'bg-red-500/90 backdrop-blur-lg',
    warning: 'bg-yellow-500/90 backdrop-blur-lg',
    info: 'bg-blue-500/90 backdrop-blur-lg'
  }
  return classes[props.type] || classes.info
})

const icon = computed(() => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[props.type] || icons.info
})

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})

const close = () => {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}
</style>