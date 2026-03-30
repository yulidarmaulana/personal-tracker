<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/api/supabase'
import { WalletIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const notification = useNotificationStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const isSignUp = ref(false)

async function handleAuth() {
  loading.value = true
  
  try {
    if (isSignUp.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      notification.success('Check your email for the confirmation link!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      
      notification.success('Login berhasil! Selamat datang.')
      router.push('/')
    }
  } catch (error: any) {
    notification.error(error.message || 'Terjadi kesalahan saat login')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div class="flex flex-col items-center mb-8">
        <div class="p-3 bg-emerald-500 rounded-2xl text-white mb-4">
          <WalletIcon :size="32" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Finc</h1>
        <p class="text-gray-500 text-sm mt-1">
          {{ isSignUp ? 'Create an account to start tracking' : 'Sign in to your account' }}
        </p>
      </div>

      <form @submit.prevent="handleAuth" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</label>
          <input 
            v-model="email"
            type="email" 
            placeholder="name@example.com"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
          <div class="relative">
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-12"
              required
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-500 transition-colors"
              title="Toggle Password Visibility"
            >
              <EyeIcon v-if="!showPassword" :size="20" />
              <EyeOffIcon v-else :size="20" />
            </button>
          </div>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100"
        >
          {{ loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
        </button>
      </form>
      <div class="mt-8 text-center">
        <button 
          @click="isSignUp = !isSignUp" 
          class="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
        >
          {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
        </button>
      </div>
    </div>
  </div>
</template>
