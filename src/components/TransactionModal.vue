<script setup lang="ts">
import { reactive, watch, onMounted, computed } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useWalletStore } from '@/stores/walletStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Transaction, TransactionType } from '@/types/transaction'
import { XIcon } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean,
  initialData?: Transaction | null
}>()

const emit = defineEmits(['close'])

const store = useTransactionStore()
const walletStore = useWalletStore()
const categoryStore = useCategoryStore()
const notificationStore = useNotificationStore()

const defaultState = {
  title: '',
  amount: 0,
  type: 'expense' as TransactionType,
  category: 'Other',
  wallet_id: '',
}

const form = reactive({ ...defaultState })

const filteredCategories = computed(() => {
  return categoryStore.categories.filter(c => c.type === form.type)
})

onMounted(() => {
  walletStore.fetchWallets()
  categoryStore.fetchCategories()
})

// Watch for changes in initialData to populate form (for editing)
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.title = newData.title
    form.amount = newData.amount
    form.type = newData.type
    form.category = newData.category
    form.wallet_id = (newData as any).wallet_id || ''
  } else {
    Object.assign(form, defaultState)
  }
}, { immediate: true })

const handleSubmit = () => {
  // Pastikan judul terisi dan nominal lebih dari 0
  if (!form.title.trim() || form.amount <= 0 || !form.wallet_id) {
    notificationStore.warning('Mohon isi semua bidang yang diperlukan (judul, jumlah, dan dompet).')
    return
  }

  if (props.initialData?.id) {
    // Mode Edit
    store.editTransaction(props.initialData.id, {
      title: form.title,
      amount: form.amount,
      type: form.type,
      category: form.category,
      wallet_id: form.wallet_id as any,
    })
  } else {
    // Mode Add
    store.addTransaction({
      title: form.title,
      amount: form.amount,
      type: form.type,
      category: form.category,
      date: new Date().toISOString(),
      wallet_id: form.wallet_id as any,
    } as any)
  }

  // Tutup modal
  emit('close')

  // Riset form ke nilai default
  setTimeout(() => {
    Object.assign(form, defaultState)
  }, 300)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-xl font-bold text-gray-800">
          {{ initialData ? 'Edit Transaction' : 'New Transaction' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <XIcon :size="20" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Type Selection -->
        <div class="flex p-1 bg-gray-100 rounded-lg">
          <button 
            type="button"
            @click="form.type = 'expense'"
            class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
            :class="form.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            Expense
          </button>
          <button 
            type="button"
            @click="form.type = 'income'"
            class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
            :class="form.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            Income
          </button>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
          <input 
            v-model="form.title"
            type="text" 
            placeholder="What is this for?"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input 
              v-model.number="form.amount"
              type="number" 
              step="0.01"
              placeholder="0.00"
              class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        <!-- Wallet Selection -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Wallet</label>
          <select 
            v-model="form.wallet_id"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
            required
          >
            <option value="" disabled>Select a wallet</option>
            <option v-for="wallet in walletStore.wallets" :key="wallet.id" :value="wallet.id">
              {{ wallet.name }}
            </option>
          </select>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
          <select 
            v-model="form.category"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
          >
            <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
          </select>
        </div>

        <!-- Submit -->
        <button 
          type="submit"
          class="w-full py-4 bg-emerald-400 text-white font-bold rounded-xl hover:bg-emerald-500 active:scale-[0.98] transition-all mt-4 shadow-lg shadow-emerald-200"
        >
          {{ initialData ? 'Save Changes' : 'Add Transaction' }}
        </button>
      </form>
    </div>
  </div>
</template>
