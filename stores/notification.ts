import { defineStore } from 'pinia'

interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
    nextId: 1
  }),
  
  actions: {
    add(type: Notification['type'], title: string, message: string) {
      const id = this.nextId++
      this.notifications.push({ id, type, title, message })
      
      // Автоматическое удаление через 5 секунд
      setTimeout(() => {
        this.remove(id)
      }, 5000)
      
      return id
    },
    
    remove(id: number) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    },
    
    success(title: string, message: string) {
      return this.add('success', title, message)
    },
    
    error(title: string, message: string) {
      return this.add('error', title, message)
    },
    
    warning(title: string, message: string) {
      return this.add('warning', title, message)
    },
    
    info(title: string, message: string) {
      return this.add('info', title, message)
    }
  }
})