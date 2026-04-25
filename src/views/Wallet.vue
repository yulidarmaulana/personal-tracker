<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { WalletIcon, PlusCircleIcon, Trash2Icon, PencilIcon, CreditCardIcon, BanknoteIcon, SmartphoneIcon } from 'lucide-vue-next'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { formatCurrency } from '@/utils/format'
import type { Wallet, WalletType } from '@/types/wallet'

const walletStore = useWalletStore()
const authStore = useAuthStore()
const isAdding = ref(false)
const editingWallet = ref<Wallet | null>(null)
const isDeleteModalOpen = ref(false)
const walletToDelete = ref<string | null>(null)
const newWalletName = ref('')
const newWalletBalance = ref(0)
const newWalletType = ref<WalletType>('cash')

const walletTypes: { value: WalletType; label: string; icon: any; colorClass: string; bgClass: string; borderClass: string; textClass: string }[] = [
  { value: 'cash', label: 'Cash', icon: BanknoteIcon, colorClass: 'emerald', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-500', textClass: 'text-emerald-600' },
  { value: 'debit', label: 'Debit', icon: CreditCardIcon, colorClass: 'indigo', bgClass: 'bg-indigo-50', borderClass: 'border-indigo-500', textClass: 'text-indigo-600' },
  { value: 'credit', label: 'Credit', icon: CreditCardIcon, colorClass: 'rose', bgClass: 'bg-rose-50', borderClass: 'border-rose-500', textClass: 'text-rose-600' },
  { value: 'e-wallet', label: 'E-Wallet', icon: SmartphoneIcon, colorClass: 'amber', bgClass: 'bg-amber-50', borderClass: 'border-amber-500', textClass: 'text-amber-600' },
]

onMounted(() => {
  if (authStore.user) {
    walletStore.fetchWallets()
  }
})

// Refetch data when user session is established
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    walletStore.fetchWallets()
  }
})

const handleAddWallet = async () => {
  if (!newWalletName.value) return
  
  const payload = {
    name: newWalletName.value,
    balance: newWalletBalance.value,
    wallet_type: newWalletType.value,
  }

  if (editingWallet.value) {
    await walletStore.updateWallet(editingWallet.value.id, payload)
  } else {
    await walletStore.addWallet(payload)
  }
  
  closeForm()
}

const startEdit = (wallet: Wallet) => {
  editingWallet.value = wallet
  newWalletName.value = wallet.name
  newWalletBalance.value = wallet.balance
  newWalletType.value = wallet.wallet_type || 'cash'
  isAdding.value = true
}

const closeForm = () => {
  isAdding.value = false
  editingWallet.value = null
  newWalletName.value = ''
  newWalletBalance.value = 0
  newWalletType.value = 'cash'
}

const getWalletTypeInfo = (type: WalletType) => {
  // Use non-null assertion because we know one of the types will match
  return walletTypes.find(t => t.value === (type || 'cash'))! 
}

const confirmDelete = async () => {
  if (walletToDelete.value) {
    await walletStore.deleteWallet(walletToDelete.value)
    cancelDelete()
  }
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  walletToDelete.value = null
}
</script>

<template>
  <div class="p-6 mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h6 class="text-2xl font-bold text-gray-800 dark:text-gray-300">My Wallets</h6>
        <p class="text-gray-500 mt-1">Manage your accounts and balances</p>
      </div>
      <button 
        @click="isAdding = true"
        class="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20"
      >
        <PlusCircleIcon :size="20" />
        <span class="hidden md:block">New Wallet</span>
      </button>
    </div>

    <!-- Add Wallet Form -->
    <div v-if="isAdding" class="mb-8 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4">
      <h3 class="text-lg font-bold text-gray-800 mb-4">{{ editingWallet ? 'Edit Wallet' : 'Add New Wallet' }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Wallet Name</label>
          <input 
            v-model="newWalletName"
            type="text" 
            placeholder="e.g. Bank Account, Cash"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Initial Balance</label>
          <input 
            v-model.number="newWalletBalance"
            type="number" 
            placeholder="0.00"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        
        <!-- Wallet Type Selection -->
        <div class="md:col-span-2 mt-2">
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-3">Wallet Type</label>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button 
              v-for="type in walletTypes" 
              :key="type.value"
              type="button"
              @click="newWalletType = type.value"
              :class="[
                'flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left group',
                newWalletType === type.value 
                  ? `${type.borderClass} ${type.bgClass} font-bold shadow-sm` 
                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
              ]"
            >
              <div :class="['p-2 rounded-lg transition-colors', newWalletType === type.value ? `bg-${type.colorClass}-100 ${type.textClass}` : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200']">
                <component :is="type.icon" :size="18" />
              </div>
              <span class="text-sm font-semibold" :class="newWalletType === type.value ? `text-${type.colorClass}-700` : ''">{{ type.label }}</span>
            </button>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button @click="closeForm" class="px-6 py-3 text-gray-500 font-medium hover:text-gray-800 transition-colors">Cancel</button>
        <button @click="handleAddWallet" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          {{ editingWallet ? 'Update Wallet' : 'Create Wallet' }}
        </button>
      </div>
    </div>

    <!-- Wallets Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="wallet in walletStore.wallets" 
        :key="wallet.id"
        class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div 
              :class="[
                'p-3 rounded-xl',
                getWalletTypeInfo(wallet.wallet_type).bgClass,
                getWalletTypeInfo(wallet.wallet_type).textClass
              ]"
            >
              <component :is="getWalletTypeInfo(wallet.wallet_type).icon" :size="24" />
            </div>
            <div>
              <h3 class="font-bold text-gray-800">{{ wallet.name }}</h3>
              <p :class="['text-xs font-bold uppercase tracking-wider', `text-${getWalletTypeInfo(wallet.wallet_type).colorClass}-500`]">
                {{ getWalletTypeInfo(wallet.wallet_type).label }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              @click="startEdit(wallet)"
              class="p-2 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
              title="Edit Wallet"
            >
              <PencilIcon :size="18" />
            </button>
            <button 
              @click="() => { walletToDelete = wallet.id; isDeleteModalOpen = true }"
              class="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Delete Wallet"
            >
              <Trash2Icon :size="18" />
            </button>
          </div>
        </div>
        
        <div class="mt-6">
          <p class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Balance</p>
          <p class="text-3xl font-black text-gray-800">{{ formatCurrency(wallet.balance) }}</p>
        </div>

        <!-- <div class="mt-6 flex items-center justify-between">
          <span class="text-xs font-medium text-gray-400 italic"></span>
        </div> -->
      </div>

      <div 
        v-if="walletStore.wallets.length === 0"
        class="md:col-span-2 p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
      >
        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-300">
          <WalletIcon :size="32" />
        </div>
        <h3 class="font-bold text-gray-800">No wallets yet</h3>
        <p class="text-gray-500 text-sm mt-1 max-w-xs mx-auto">Add your first wallet to start tracking your expenses across different accounts.</p>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :is-open="isDeleteModalOpen"
      title="Hapus Wallet?"
      message="Apakah kamu yakin ingin menghapus wallet ini? Semua data transaksi yang terhubung dengan wallet ini mungkin akan ikut terhapus atau bermasalah."
      confirm-text="Hapus Sekarang"
      cancel-text="Batal"
      type="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>