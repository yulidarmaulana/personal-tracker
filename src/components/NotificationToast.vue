<script setup lang="ts">
import { useNotificationStore } from '@/stores/notificationStore'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon, 
  InfoIcon,
  XIcon
} from 'lucide-vue-next'

const notificationStore = useNotificationStore()
</script>

<template>
  <div class="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-md w-full sm:w-auto">
    <TransitionGroup 
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-for="notification in notificationStore.notifications" 
        :key="notification.id"
        class="pointer-events-auto flex items-center p-4 rounded-2xl shadow-xl border backdrop-blur-md"
        :class="{
          'bg-emerald-50/90 border-emerald-100 text-emerald-800': notification.type === 'success',
          'bg-red-50/90 border-red-100 text-red-800': notification.type === 'error',
          'bg-amber-50/90 border-amber-100 text-amber-800': notification.type === 'warning',
          'bg-blue-50/90 border-blue-100 text-blue-800': notification.type === 'info',
        }"
      >
        <div class="flex-shrink-0 mr-3">
          <CheckCircleIcon v-if="notification.type === 'success'" :size="20" class="text-emerald-500" />
          <XCircleIcon v-else-if="notification.type === 'error'" :size="20" class="text-red-500" />
          <AlertTriangleIcon v-else-if="notification.type === 'warning'" :size="20" class="text-amber-500" />
          <InfoIcon v-else :size="20" class="text-blue-500" />
        </div>
        
        <p class="text-sm font-bold flex-grow pr-4">{{ notification.message }}</p>
        
        <button 
          @click="notificationStore.remove(notification.id)"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XIcon :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
