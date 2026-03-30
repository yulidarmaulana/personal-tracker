<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { WalletIcon, PlusIcon, Trash2Icon, PencilIcon } from 'lucide-vue-next'
import ConfirmModal from '@/components/ConfirmModal.vue'

const walletStore = useWalletStore()
const authStore = useAuthStore()
const isAdding = ref(false)
const editingWallet = ref<any>(null)
const isDeleteModalOpen = ref(false)
const walletToDelete = ref<string | null>(null)
const newWalletName = ref('')
const newWalletBalance = ref(0)

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
  
  if (editingWallet.value) {
    await walletStore.updateWallet(editingWallet.value.id, {
      name: newWalletName.value,
      balance: newWalletBalance.value,
    })
  } else {
    await walletStore.addWallet({
      name: newWalletName.value,
      balance: newWalletBalance.value,
    })
  }
  
  closeForm()
}

const startEdit = (wallet: any) => {
  editingWallet.value = wallet
  newWalletName.value = wallet.name
  newWalletBalance.value = wallet.balance
  isAdding.value = true
}

const closeForm = () => {
  isAdding.value = false
  editingWallet.value = null
  newWalletName.value = ''
  newWalletBalance.value = 0
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
</script>

<template>
  <div class="p-6 mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h6 class="text-2xl font-bold text-gray-800">My Wallets</h6>
        <p class="text-gray-500 mt-1">Manage your accounts and balances</p>
      </div>
      <button 
        @click="isAdding = true"
        class="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
      >
        <PlusIcon :size="20" />
        <span>New Wallet</span>
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
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button @click="closeForm" class="px-6 py-3 text-gray-500 font-medium hover:text-gray-800 transition-colors">Cancel</button>
        <button @click="handleAddWallet" class="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all">
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
            <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <WalletIcon :size="24" />
            </div>
            <div>
              <h3 class="font-bold text-gray-800">{{ wallet.name }}</h3>
              <p class="text-sm text-gray-400">Regular Wallet</p>
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
        
        <div class="mt-8">
          <p class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Balance</p>
          <p class="text-3xl font-black text-gray-800">{{ formatCurrency(wallet.balance) }}</p>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <div class="flex -space-x-2">
            <div class="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white"></div>
            <div class="w-8 h-8 rounded-full bg-emerald-50 border-2 border-white"></div>
          </div>
          <span class="text-xs font-medium text-gray-400 italic">Updated just now</span>
        </div>
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