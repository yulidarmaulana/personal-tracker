<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAuthStore } from '@/stores/authStore'
import { useCategoryStore } from '@/stores/categoryStore'
import type { Transaction } from '@/types/transaction'
import TransactionModal from '@/components/TransactionModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const store = useTransactionStore()
const authStore = useAuthStore()
const categoryStore = useCategoryStore()

onMounted(() => {
  if (authStore.user) {
    store.fetchTransactions()
    categoryStore.fetchCategories()
  }
})

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    store.fetchTransactions()
    categoryStore.fetchCategories()
  }
})
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const transactionToDelete = ref<string | null>(null)
const selectedTransaction = ref<Transaction | null>(null)

// Filter states
const selectedCategory = ref<string | 'All'>('All')
const startDate = ref('')
const endDate = ref('')

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

const filteredTransactions = computed(() => {
  return store.transactions.filter(tx => {
    // Category filter
    const matchesCategory = selectedCategory.value === 'All' || tx.category === selectedCategory.value
    
    // Date filter: Use en-CA locale to get consistent YYYY-MM-DD in local time
    const txDateStr = new Date(tx.date).toLocaleDateString('en-CA')
    
    const matchesStart = !startDate.value || txDateStr >= startDate.value
    const matchesEnd = !endDate.value || txDateStr <= endDate.value
    
    return matchesCategory && matchesStart && matchesEnd
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Urutkan terbaru di atas
})

// const resetFilters = () => {
//   selectedCategory.value = 'All'
//   startDate.value = ''
//   endDate.value = ''
// }

const openEditModal = (tx: Transaction) => {
  selectedTransaction.value = tx
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  selectedTransaction.value = null
}

const confirmDelete = async () => {
  if (transactionToDelete.value) {
    await store.deleteTransaction(transactionToDelete.value)
    cancelDelete()
  }
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  transactionToDelete.value = null
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h6 class="text-2xl font-bold text-gray-800">Transactions</h6>
      <div class="flex gap-2">
        <!-- <button 
          @click="resetFilters" 
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcwIcon :size="16" />
          Reset
        </button> -->
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
        <select 
          v-model="selectedCategory"
          class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        >
          <option value="All">All Categories</option>
          <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
        </select>
      </div>

      <div class="flex-1 min-w-[150px]">
        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">From Date</label>
        <input 
          v-model="startDate"
          type="date"
          class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div class="flex-1 min-w-[150px]">
        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">To Date</label>
        <input 
          v-model="endDate"
          type="date"
          class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>
    </div>

    <!-- Transactions Table (Desktop) -->
    <div class="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="p-4 font-semibold text-gray-600 font-bold uppercase text-[10px] tracking-wider">Date</th>
            <th class="p-4 font-semibold text-gray-600 font-bold uppercase text-[10px] tracking-wider">Title</th>
            <th class="p-4 font-semibold text-gray-600 font-bold uppercase text-[10px] tracking-wider">Category</th>
            <th class="p-4 font-semibold text-gray-600 font-bold uppercase text-[10px] tracking-wider text-right">Amount</th>
            <th class="p-4 font-semibold text-gray-600 font-bold uppercase text-[10px] tracking-wider text-center">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="tx in filteredTransactions" :key="tx.id">
            <td class="p-4 text-gray-600 text-sm">{{ formatDate(tx.date) }}</td>
            <td class="p-4 text-gray-800 font-medium">{{ tx.title }}</td>
            <td class="p-4">
              <span 
                class="px-2 py-1 rounded text-xs"
                :class="tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
              >
                {{ tx.category }}
              </span>
            </td>
            <td
              class="p-4 text-right font-bold"
              :class="tx.type === 'income' ? 'text-green-600' : 'text-red-600'"
            >
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
            </td>
            <td class="p-4 text-center">
              <div class="flex items-center justify-center gap-3">
                <button 
                  @click="openEditModal(tx)"
                  class="text-indigo-500 hover:text-indigo-700 text-sm font-medium transition-colors bg-indigo-50 px-2 py-1 rounded-sm hover:bg-indigo-400 hover:text-white"
                >
                  Edit
                </button>
                <button
                  @click="() => { transactionToDelete = tx.id; isDeleteModalOpen = true }"
                  class="text-red-400 hover:text-red-600 text-sm transition-colors bg-red-50 px-2 py-1 rounded-sm hover:bg-red-400 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-400">
              No transactions match your filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-4">
      <div 
        v-for="tx in filteredTransactions" 
        :key="tx.id"
        class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs text-gray-500">{{ formatDate(tx.date) }}</p>
            <h6 class="font-bold text-gray-800 mt-1">{{ tx.title }}</h6>
            <span 
              class="inline-block px-2 py-0.5 rounded text-[10px] mt-2"
              :class="tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
            >
              {{ tx.category }}
            </span>
          </div>
          <p 
            class="font-bold text-lg"
            :class="tx.type === 'income' ? 'text-green-600' : 'text-red-600'"
          >
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
          </p>
        </div>
        
        <div class="flex border-t border-gray-50 pt-3 gap-2">
          <button 
            @click="openEditModal(tx)"
            class="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Edit
          </button>
          <button 
            @click="() => { transactionToDelete = tx.id; isDeleteModalOpen = true }"
            class="flex-1 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div v-if="filteredTransactions.length === 0" class="p-8 text-center text-gray-400 bg-white rounded-xl border border-dashed">
        No transactions match your filters.
      </div>
    </div>

    <!-- Edit Modal -->
    <TransactionModal 
      :is-open="isEditModalOpen" 
      :initial-data="selectedTransaction"
      @close="closeEditModal" 
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :is-open="isDeleteModalOpen"
      title="Hapus Transaksi?"
      message="Apakah kamu yakin ingin menghapus data transaksi ini?"
      confirm-text="Hapus"
      cancel-text="Batal"
      type="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
