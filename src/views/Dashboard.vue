<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { formatCurrency } from '@/utils/format'
import { SunIcon, MoonIcon } from 'lucide-vue-next'

const store = useTransactionStore()
const walletStore = useWalletStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(() => {
  if (authStore.user) {
    store.fetchTransactions()
    walletStore.fetchWallets()
  }
})

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    store.fetchTransactions()
    walletStore.fetchWallets()
  }
})

// Greeting Logic
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return 'Morning'
  if (hour < 15) return 'Afternoon'
  if (hour < 18) return 'Evening'
  return 'Night'
})

// User Name Logic (dari email atau metadata)
const userName = computed(() => {
  const email = authStore.user?.email
  if (!email) return 'User'
  const namePart = email.split('@')[0]
  if (!namePart) return 'User'
  return namePart.charAt(0).toUpperCase() + namePart.slice(1)
})
</script>

<template>
  <div class="p-6">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h6 class="text-2xl font-bold text-gray-900 dark:text-slate-50">{{ greeting }}, {{ userName }}!</h6>
        <p class="text-gray-500 text-sm mt-1">Here's what's happening with your finances today.</p>
      </div>

      <!-- Dark Mode Toggle -->
      <button 
        @click="themeStore.toggleDarkMode"
        class="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
        :title="themeStore.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <div class="relative w-6 h-6 flex items-center justify-center">
          <SunIcon v-if="themeStore.isDarkMode" :size="20" class="text-amber-500 animate-in zoom-in spin-in-90 duration-300" />
          <MoonIcon v-else :size="20" class="text-indigo-400 animate-in zoom-in spin-in-90 duration-300" />
        </div>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">Total Balance</p>
        <p class="text-2xl font-bold text-slate-900">{{ formatCurrency(walletStore.totalBalance) }}</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">Income</p>
        <p class="text-2xl font-bold text-slate-900">{{ formatCurrency(store.totalIncome) }}</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">Expenses</p>
        <p class="text-2xl font-bold text-slate-900">{{ formatCurrency(store.totalExpense) }}</p>
      </div>
    </div>
  </div>
</template>


<style scoped>
svg {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
}
</style>
