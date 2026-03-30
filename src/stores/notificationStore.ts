import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  message: string
  type: NotificationType
  timeout?: number
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  function notify(message: string, type: NotificationType = 'info', timeout: number = 4000) {
    const id = Math.random().toString(36).substring(2, 9)
    const notification: Notification = { id, message, type, timeout }
    
    notifications.value.push(notification)

    if (timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }
    
    return id
  }

  function success(message: string) {
    return notify(message, 'success')
  }

  function error(message: string) {
    return notify(message, 'error')
  }

  function warning(message: string) {
    return notify(message, 'warning')
  }

  function info(message: string) {
    return notify(message, 'info')
  }

  function remove(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    remove
  }
})
