<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 w-96">
    <transition-group name="notification" tag="div" class="space-y-2">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :type="notification.type"
        :title="notification.title"
        :message="notification.message"
        @close="notificationStore.remove(notification.id)"
      />
    </transition-group>
  </div>
</template>

<script setup>
import { useNotificationStore } from '~/stores/notification'
import Notification from './Notification.vue'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-active {
  position: absolute;
  width: 100%;
}
</style>