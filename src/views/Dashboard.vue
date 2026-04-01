<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'

const store = useTransactionStore()
const walletStore = useWalletStore()
const authStore = useAuthStore()

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


// Helper untuk format mata uang
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
</script>

<template>
  <div class="p-6">
    <div class="mb-8">
      <!-- <h6 class="text-2xl font-bold mb-2 text-gray-800">Overview</h6> -->
      <!-- <p class="text-sm font-medium text-indigo-600 mb-1">{{ formattedDate }}</p> -->
      <h6 class="text-2xl font-bold text-gray-900">{{ greeting }}, {{ userName }}!</h6>
      <p class="text-gray-500 text-sm mt-1">Here's what's happening with your finances today.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">Total Balance</p>
        <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(walletStore.totalBalance) }}</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">Income</p>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(store.totalIncome) }}</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">Expenses</p>
        <p class="text-2xl font-bold text-red-600">{{ formatCurrency(store.totalExpense) }}</p>
      </div>
    </div>
  </div>
</template>


<style scoped>
svg {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
}
</style>

