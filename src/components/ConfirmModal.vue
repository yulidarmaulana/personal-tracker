<script setup lang="ts">
import { XIcon, AlertTriangleIcon } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}>()

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      @click="emit('cancel')"
    ></div>
    
    <!-- Modal Content -->
    <div class="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div 
            class="p-3 rounded-2xl"
            :class="{
              'bg-red-50 text-red-600': type === 'danger',
              'bg-amber-50 text-amber-600': type === 'warning',
              'bg-blue-50 text-blue-600': type === 'info' || !type,
            }"
          >
            <AlertTriangleIcon :size="24" />
          </div>
          <button 
            @click="emit('cancel')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon :size="20" />
          </button>
        </div>

        <h3 class="text-xl font-black text-gray-800 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-500 font-medium leading-relaxed">
          {{ message }}
        </p>

        <div class="mt-8 flex gap-3">
          <button 
            @click="emit('cancel')"
            class="flex-1 px-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all"
          >
            {{ cancelText || 'Cancel' }}
          </button>
          <button 
            @click="emit('confirm')"
            class="flex-1 px-6 py-3 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]"
            :class="{
              'bg-red-500 hover:bg-red-600 shadow-red-100': type === 'danger',
              'bg-amber-500 hover:bg-amber-600 shadow-amber-100': type === 'warning',
              'bg-blue-500 hover:bg-blue-600 shadow-blue-100': type === 'info' || !type,
            }"
          >
            {{ confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
